import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { setTimeout } from 'node:timers/promises';

const origin = 'https://www.daniel-badura.com';
const projects = JSON.parse(await readFile(new URL('../shared/projects.json', import.meta.url), 'utf8'));
const sha = process.env.GITHUB_SHA;
assert.match(sha || '', /^[a-f0-9]{40}$/);
for (let attempt = 0; attempt < 18; attempt++) {
  try {
    const get = async path => {
      const response = await fetch(origin + path, { cache: 'no-store', signal: AbortSignal.timeout(10000) });
      assert.equal(response.status, 200, path);
      return response;
    };
    assert.equal((await (await get('/version.json?commit=' + sha)).json()).commit, sha);
    assert.deepEqual(await (await get('/api/health')).json(), { status: 'ok' });
    assert.deepEqual(await (await get('/api/projects')).json(), projects);
    for (const route of ['/', '/projects', '/contact', ...projects.map(project => project.image)]) {
      await get(route);
    }
    console.log('PASS public portfolio serves ' + sha);
    break;
  } catch {
    if (attempt === 17) throw new Error('Public portfolio verification failed for ' + sha);
    await setTimeout(5000);
  }
}
