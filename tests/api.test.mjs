import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../backend/app.js';
import projects from '../backend/data/projects.js';
import Project from '../backend/models/projectModel.js';
import { serializeProject } from '../backend/controllers/projectController.js';

async function withServer(fn, options = {}) {
  const server = createApp({ production: false, dataSource: 'file', ...options }).listen(0, '127.0.0.1');
  await once(server, 'listening');
  try { await fn('http://127.0.0.1:' + server.address().port); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

test('file mode serves the documented archive with no database', () => withServer(async base => {
  const response = await fetch(base + '/api/projects');
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), projects);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(response.headers.get('x-powered-by'), null);
  assert.match(response.headers.get('content-security-policy'), /frame-ancestors 'none'/);
}));

test('search is case insensitive, bounded and literal', () => withServer(async base => {
  assert.equal((await (await fetch(base + '/api/projects?keyword=rEaCt')).json()).length, 3);
  assert.deepEqual(await (await fetch(base + '/api/projects?keyword=' + encodeURIComponent('.*'))).json(), []);
  assert.equal((await fetch(base + '/api/projects?keyword=' + 'x'.repeat(101))).status, 400);
  assert.equal((await fetch(base + '/api/projects?keyword[]=x')).status, 400);
}));

test('project detail, missing record, API 404 and health', () => withServer(async base => {
  assert.deepEqual(await (await fetch(base + '/api/projects/testowo')).json(), projects.find(project => project.id === 'testowo'));
  assert.equal((await fetch(base + '/api/projects/missing')).status, 404);
  const missing = await fetch(base + '/api/missing');
  assert.equal(missing.status, 404);
  assert.match(missing.headers.get('content-type'), /application\/json/);
  assert.deepEqual(await (await fetch(base + '/api/health')).json(), { status: 'ok' });
}));

test('legacy social paths redirect to contact', () => withServer(async base => {
  for (const route of ['/facebook', '/instagram']) {
    const response = await fetch(base + route, { redirect: 'manual' });
    assert.equal(response.status, 301);
    assert.equal(response.headers.get('location'), '/contact');
  }
}));

test('MongoDB adapter preserves legacy fields and handles absent records', async t => {
  const record = { _id: '507f1f77bcf86cd799439011', name: 'Example', stack: 'React Node', description: 'Example project', image: '/images/example.webp', repo: 'https://example.com/repo', href: 'https://example.com' };
  assert.deepEqual(serializeProject(record).stack, ['React', 'Node']);
  t.mock.method(Project, 'findById', () => ({ lean: async () => null }));
  await withServer(async base => {
    assert.equal((await fetch(base + '/api/projects/invalid')).status, 400);
    assert.equal((await fetch(base + '/api/projects/507f1f77bcf86cd799439011')).status, 404);
  }, { dataSource: 'mongodb' });
});

test('database failures return a generic response without leaking credentials', async t => {
  t.mock.method(Project, 'find', () => ({ lean: async () => { throw new Error('private database credential'); } }));
  await withServer(async base => {
    const response = await fetch(base + '/api/projects');
    assert.equal(response.status, 500);
    assert.deepEqual(await response.json(), { message: 'Unable to complete the request' });
  }, { dataSource: 'mongodb' });
});
