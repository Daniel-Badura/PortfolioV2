#!/usr/bin/python3
"""Root-owned, narrowly scoped deployment gateway. Never run code from uploaded images on the host."""
import json
import os
from pathlib import Path, PurePosixPath
import re
import shutil
import subprocess
import sys
import tarfile
import tempfile
import time
from urllib.request import urlopen

ROOT = Path('/opt/portfolio')
COMPOSE = ROOT / 'control/compose.yaml'
REPOSITORY = 'https://github.com/Daniel-Badura/PortfolioV2'
MAX_UPLOAD = 256 * 1024 * 1024


def command_args(command):
    if command == 'status':
        return None
    match = re.fullmatch(r'(?:deploy|rollback) ([a-f0-9]{40})', command)
    if not match:
        raise ValueError('Only status, deploy or rollback with a full commit SHA is allowed')
    return match[1]


def validate_archive(path, sha):
    with tarfile.open(path, 'r:gz') as archive:
        members = []
        total_size = 0
        for member in archive:
            total_size += member.size
            members.append(member)
            if len(members) > 4096 or total_size > 1024 ** 3:
                raise ValueError('Image archive exceeds limits')
        names = set()
        for member in members:
            name = PurePosixPath(member.name)
            if name.is_absolute() or '..' in name.parts or not (member.isfile() or member.isdir()) or member.name in names:
                raise ValueError('Unsafe image archive entry')
            names.add(member.name)
        def read_json(name):
            member = archive.getmember(name)
            if member.size > 1024 ** 2:
                raise ValueError('Oversized image metadata')
            with archive.extractfile(member) as stream:
                return json.load(stream)
        manifest = read_json('manifest.json')
        if not isinstance(manifest, list) or len(manifest) != 1 or manifest[0].get('RepoTags') != ['portfolio:' + sha]:
            raise ValueError('Archive must contain only the portfolio commit tag')
        config = read_json(manifest[0]['Config'])
        labels = config.get('config', {}).get('Labels', {})
        if labels.get('org.opencontainers.image.revision') != sha or labels.get('org.opencontainers.image.source') != REPOSITORY:
            raise ValueError('Image provenance labels do not match the portfolio commit')
        # Modern docker save archives also contain OCI indexes. Check their tag metadata too.
        if 'index.json' in names:
            allowed = {'portfolio:' + sha, 'docker.io/library/portfolio:' + sha, sha}
            visited = set()
            def inspect_index(index):
                for descriptor in index.get('manifests', []):
                    annotations = descriptor.get('annotations', {})
                    for key in ['io.containerd.image.name', 'org.opencontainers.image.ref.name']:
                        if key in annotations and annotations[key] not in allowed:
                            raise ValueError('OCI index contains a foreign image tag')
                    digest = descriptor.get('digest', '')
                    if not re.fullmatch(r'sha256:[a-f0-9]{64}', digest):
                        raise ValueError('Invalid OCI descriptor')
                    if digest not in visited:
                        visited.add(digest)
                        child = read_json('blobs/sha256/' + digest.split(':')[1])
                        inspect_index(child)
            inspect_index(read_json('index.json'))


def run(*args, capture=False):
    return subprocess.run(args, check=True, text=True, capture_output=capture,
                          env={'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', 'HOME': '/root'})


def compose(image, port, action):
    environment = {'PATH': '/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin', 'HOME': '/root',
                   'PORTFOLIO_IMAGE': image, 'PORTFOLIO_PORT': str(port)}
    project = 'portfolio-production' if port == 8085 else 'portfolio-candidate'
    subprocess.run(['docker', 'compose', '--project-name', project, '--file', str(COMPOSE), *action],
                   check=True, env=environment, timeout=150)


def probe(port, sha, attempts=30):
    for attempt in range(attempts):
        try:
            base = 'http://127.0.0.1:' + str(port)
            with urlopen(base + '/version.json', timeout=5) as response:
                if json.load(response).get('commit') != sha:
                    raise ValueError('Wrong commit served')
            with urlopen(base + '/api/health', timeout=5) as response:
                if json.load(response) != {'status': 'ok'}:
                    raise ValueError('Health check failed')
            with urlopen(base + '/api/projects', timeout=5) as response:
                projects = json.load(response)
                if not projects:
                    raise ValueError('Empty project archive')
            for route in ['/', '/projects', '/contact', *[project['image'] for project in projects]]:
                with urlopen(base + route, timeout=5) as response:
                    if response.status != 200:
                        raise ValueError('Page or image unavailable')
            return
        except Exception:
            if attempt + 1 == attempts:
                raise RuntimeError('Portfolio HTTP checks failed') from None
            time.sleep(2)


def deploy(sha):
    if shutil.disk_usage(ROOT).free < 2 * 1024 ** 3:
        raise RuntimeError('At least 2 GiB free disk space is required')
    previous_path = ROOT / 'current.json'
    previous = json.loads(previous_path.read_text()) if previous_path.exists() else None
    with tempfile.TemporaryDirectory(prefix='upload-', dir=ROOT / 'inbox') as temporary:
        archive = Path(temporary) / 'image.tar.gz'
        total = 0
        with archive.open('wb') as output:
            while chunk := sys.stdin.buffer.read(1024 ** 2):
                total += len(chunk)
                if total > MAX_UPLOAD:
                    raise ValueError('Compressed image exceeds 256 MiB')
                output.write(chunk)
        validate_archive(archive, sha)
        run('docker', 'load', '--input', str(archive))
    image = run('docker', 'image', 'inspect', 'portfolio:' + sha, '--format', '{{.Id}}', capture=True).stdout.strip()
    if not re.fullmatch(r'sha256:[a-f0-9]{64}', image):
        raise ValueError('Invalid loaded image ID')
    up = ['up', '--detach', '--no-build', '--wait', '--wait-timeout', '90']
    try:
        compose(image, 8086, up)
        probe(8086, sha)
        try:
            compose(image, 8085, up)
            probe(8085, sha)
        except Exception:
            if previous:
                compose(previous['image'], 8085, up)
                probe(8085, previous['sha'])
            raise
        release = {'sha': sha, 'image': image}
        release_dir = ROOT / 'releases' / sha
        release_dir.mkdir(exist_ok=True)
        (release_dir / 'release.json').write_text(json.dumps(release) + '\n')
        if previous:
            (ROOT / 'previous.json').write_text(json.dumps(previous) + '\n')
        pending = ROOT / 'current.json.tmp'
        pending.write_text(json.dumps(release) + '\n')
        pending.replace(previous_path)
        print('PASS portfolio deployed: ' + sha, flush=True)
    finally:
        compose(image, 8086, ['down'])


def rollback(sha):
    release = json.loads((ROOT / 'releases' / sha / 'release.json').read_text())
    if release.get('sha') != sha or not re.fullmatch(r'sha256:[a-f0-9]{64}', release.get('image', '')):
        raise ValueError('Invalid recorded portfolio release')
    compose(release['image'], 8085, ['up', '--detach', '--no-build', '--wait', '--wait-timeout', '90'])
    probe(8085, sha)
    pending = ROOT / 'current.json.tmp'
    pending.write_text(json.dumps(release) + '\n')
    pending.replace(ROOT / 'current.json')
    print('PASS portfolio rollback: ' + sha)


def main():
    import fcntl
    if os.geteuid() != 0 or len(sys.argv) != 2:
        raise ValueError('Use the restricted root gateway')
    sha = command_args(sys.argv[1])
    with (ROOT / 'deploy.lock').open('a') as lock:
        fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        if sha is None:
            current = ROOT / 'current.json'
            print(current.read_text() if current.exists() else '{"status":"not-deployed"}')
        elif sys.argv[1].startswith('rollback '):
            rollback(sha)
        else:
            deploy(sha)


if __name__ == '__main__':
    try:
        main()
    except Exception as error:
        print('Portfolio deployment failed: ' + str(error), file=sys.stderr)
        sys.exit(1)
