import assert from 'node:assert/strict';
import { createApp } from '../server.mjs';
import { readFile } from 'node:fs/promises';
const server = createApp().listen(0, '127.0.0.1');
await new Promise(resolve => server.once('listening', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
try {
  for (const route of ['/', '/demenagement-particuliers/', '/blog/checklist-demenagement-paris/', '/volume/?initial=20', '/robots.txt', '/sitemap.xml']) {
    const response = await fetch(origin + route);
    assert.equal(response.status, 200, route);
    if (route.endsWith('/')) assert.match(await response.text(), /<h1[ >]/);
  }
  const redirect = await fetch(origin + '/volume?initial=20', { redirect: 'manual' });
  assert.equal(redirect.status, 301);
  assert.equal(redirect.headers.get('location'), '/volume/?initial=20');
  const missing = await fetch(origin + '/page-inconnue/', { headers: { accept: 'text/html' } });
  assert.equal(missing.status, 404);
  assert.match(await missing.text(), /noindex,follow/);
  const assetMissing = await fetch(origin + '/assets/missing.js');
  assert.equal(assetMissing.status, 404);
  const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
  const asset = await fetch(origin + '/' + manifest['index.html'].file);
  assert.equal(asset.status, 200);
  assert.match(asset.headers.get('cache-control'), /immutable/);
  const head = await fetch(origin + '/volume/', { method: 'HEAD' });
  assert.equal(head.status, 200);
  assert.equal(await head.text(), '');
  console.log('Production server: routes, query-preserving redirects, true 404s, assets, cache and HEAD passed.');
} finally { server.closeAllConnections(); await new Promise(resolve => server.close(resolve)); }
