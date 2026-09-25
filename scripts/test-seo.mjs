import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const { SITE_PAGES, BLOG_ARTICLES, routeSeo } = await import(pathToFileURL(path.resolve('.prerender/site.mjs')).href);
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(m => m[1]);
assert.ok(locations.length > 0);
const origin = new URL(locations[0]).origin;
const routes = [...Object.keys(SITE_PAGES), ...BLOG_ARTICLES.map(a => `/blog/${a.slug}/`)];
const titles = new Set();
const descriptions = new Set();
for (const route of routes) {
  const html = await readFile(path.join('dist', route.slice(1), 'index.html'), 'utf8');
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `${route}: exactly one H1`);
  assert.equal((html.match(/<title>/g) || []).length, 1, `${route}: exactly one title`);
  assert.equal((html.match(/rel="canonical"/g) || []).length, 1, `${route}: exactly one canonical`);
  assert.ok(html.includes(`rel="canonical" href="${origin + route}"`), `${route}: canonical`);
  const title = html.match(/<title>(.*?)<\/title>/)[1];
  const description = html.match(/name="description" content="(.*?)"/)[1];
  assert.ok(!titles.has(title), `${route}: duplicate title`); titles.add(title);
  assert.ok(!descriptions.has(description), `${route}: duplicate description`); descriptions.add(description);
  assert.ok(html.includes(`name="robots" content="${routeSeo(route, origin).robots}"`));
  assert.equal(locations.includes(origin + route), routeSeo(route, origin).robots === 'index,follow', `${route}: sitemap eligibility`);
  assert.ok(html.includes('id="main-content"') && html.includes('<footer'), `${route}: complete static page`);
  for (const script of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) JSON.parse(script[1]);
  for (const link of html.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
    const target = new URL(link[1].replaceAll('&amp;', '&'), origin).pathname;
    if (target.startsWith('/assets/') || target.startsWith('/images/') || target.startsWith('/documents/') || target === '/favicon.svg') await access(path.join('dist', decodeURIComponent(target)));
    else assert.ok(routes.includes(target), `${route}: link to unknown route ${target}`);
  }
}
const missing = await readFile('dist/404.html', 'utf8');
assert.ok(missing.includes('noindex,follow') && missing.includes('Page introuvable'));
assert.equal(routeSeo('/does-not-exist/', origin).robots, 'noindex,follow');
assert.equal(new Set(locations).size, locations.length);
assert.ok((await readFile('dist/robots.txt', 'utf8')).includes(`Sitemap: ${origin}/sitemap.xml`));
console.log(`${routes.length} pages checked: unique metadata, H1, canonicals, schemas, local links/assets, sitemap and noindex.`);
