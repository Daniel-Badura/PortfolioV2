import importlib.util
import io
import json
from pathlib import Path
import tarfile
import tempfile
import unittest
from types import SimpleNamespace
from unittest.mock import patch

spec = importlib.util.spec_from_file_location('gateway', Path(__file__).parents[2] / 'deploy/gateway.py')
gateway = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gateway)
SHA = 'a' * 40


class GatewayTests(unittest.TestCase):
    def archive(self, path, tags=None, labels=None, extra=None):
        content = {
            'manifest.json': [{'Config': 'config.json', 'RepoTags': tags if tags is not None else ['portfolio:' + SHA], 'Layers': []}],
            'config.json': {'config': {'Labels': labels if labels is not None else {
                'org.opencontainers.image.source': gateway.REPOSITORY, 'org.opencontainers.image.revision': SHA}}},
        }
        with tarfile.open(path, 'w:gz') as archive:
            for name, data in content.items():
                raw = json.dumps(data).encode()
                member = tarfile.TarInfo(name)
                member.size = len(raw)
                archive.addfile(member, io.BytesIO(raw))
            if extra:
                archive.addfile(extra)

    def test_only_exact_command_grammar_is_allowed(self):
        self.assertIsNone(gateway.command_args('status'))
        self.assertEqual(gateway.command_args('deploy ' + SHA), SHA)
        self.assertEqual(gateway.command_args('rollback ' + SHA), SHA)
        for command in ['bash', 'deploy main', 'deploy ' + SHA + '; id', 'status\nwhoami', 'deploy ../other', 'scp -t /tmp/x']:
            with self.subTest(command=command), self.assertRaises(ValueError):
                gateway.command_args(command)

    def test_only_portfolio_tag_and_matching_provenance_load(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'image.tar.gz'
            self.archive(path)
            gateway.validate_archive(path, SHA)
            for args in [{'tags': ['other:latest']}, {'tags': ['portfolio:' + SHA, 'other:latest']}, {'labels': {}}]:
                self.archive(path, **args)
                with self.subTest(args=args), self.assertRaises(ValueError):
                    gateway.validate_archive(path, SHA)

    def test_archive_links_and_path_escapes_are_rejected(self):
        with tempfile.TemporaryDirectory() as directory:
            path = Path(directory) / 'image.tar.gz'
            for name, kind in [('../escape', tarfile.DIRTYPE), ('/absolute', tarfile.DIRTYPE), ('link', tarfile.SYMTYPE)]:
                member = tarfile.TarInfo(name)
                member.type = kind
                member.linkname = '/etc'
                self.archive(path, extra=member)
                with self.subTest(name=name), self.assertRaises(ValueError):
                    gateway.validate_archive(path, SHA)

    def test_compose_is_scoped_to_dedicated_project_and_loopback_port(self):
        with patch.object(gateway.subprocess, 'run') as run:
            gateway.compose('sha256:' + 'b' * 64, 8085, ['up', '--detach'])
            args, kwargs = run.call_args
            self.assertEqual(args[0][3], 'portfolio-production')
            self.assertEqual(kwargs['env']['PORTFOLIO_PORT'], '8085')
            self.assertNotIn('DOCKER_HOST', kwargs['env'])
            gateway.compose('sha256:' + 'b' * 64, 8086, ['down'])
            self.assertEqual(run.call_args.args[0][3], 'portfolio-candidate')

    def test_candidate_failure_never_changes_production(self):
        self.deployment_case('candidate')

    def test_failed_production_restores_previous_image_and_preserves_state(self):
        self.deployment_case('production')

    def test_success_records_release_only_after_both_probes(self):
        self.deployment_case(None)

    def deployment_case(self, failure):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            (root / 'inbox').mkdir()
            (root / 'releases').mkdir()
            previous = {'sha': 'b' * 40, 'image': 'sha256:' + 'b' * 64}
            (root / 'current.json').write_text(json.dumps(previous))
            current_image = 'sha256:' + 'a' * 64
            def probe(port, sha):
                if (failure == 'candidate' and port == 8086) or (failure == 'production' and port == 8085 and sha == SHA):
                    raise RuntimeError('test probe failure')
            with patch.object(gateway, 'ROOT', root), patch.object(gateway, 'validate_archive'), \
                    patch.object(gateway, 'run', return_value=SimpleNamespace(stdout=current_image)), \
                    patch.object(gateway, 'compose') as compose, patch.object(gateway, 'probe', side_effect=probe), \
                    patch.object(gateway.sys, 'stdin', SimpleNamespace(buffer=io.BytesIO(b'archive'))), \
                    patch.object(gateway.shutil, 'disk_usage', return_value=SimpleNamespace(free=10 * 1024 ** 3)):
                if failure:
                    with self.assertRaises(RuntimeError):
                        gateway.deploy(SHA)
                    self.assertEqual(json.loads((root / 'current.json').read_text()), previous)
                else:
                    gateway.deploy(SHA)
                    self.assertEqual(json.loads((root / 'current.json').read_text()), {'sha': SHA, 'image': current_image})
                    self.assertEqual(json.loads((root / 'previous.json').read_text()), previous)
                production = [call for call in compose.call_args_list if call.args[1] == 8085]
                if failure == 'candidate':
                    self.assertEqual(production, [])
                elif failure == 'production':
                    self.assertEqual(production[-1].args[0], previous['image'])
                self.assertEqual(compose.call_args.args[1:], (8086, ['down']))


if __name__ == '__main__':
    unittest.main()
