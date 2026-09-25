import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { BLOG_ARTICLES } from '../.prerender/site.mjs';

// Check the complete static dependency graph, not only the entry file:
// moving the bodies into an eagerly imported shared chunk would still regress.
const manifest = JSON.parse(await readFile('dist/.vite/manifest.json', 'utf8'));
const initialChunks = new Set();
function visit(key) {
  if (initialChunks.has(key)) return;
  initialChunks.add(key);
  for (const dependency of manifest[key].imports || []) visit(dependency);
}
visit('index.html');
const initialCode = (await Promise.all([...initialChunks].map(key => readFile('dist/' + manifest[key].file, 'utf8')))).join('\n');
assert.ok(manifest['src/pages/ArticleRoute.tsx']?.isDynamicEntry, 'Article route must load on demand');
assert.ok(!initialChunks.has('src/pages/ArticleRoute.tsx'), 'Article route must not be an initial dependency');
for (const article of BLOG_ARTICLES) {
  assert.ok(article.slug && article.title && article.sections.length, 'Every article needs catalog metadata and content');
  const text = article.sections[0].text;
  assert.ok(!initialCode.includes(text) && !initialCode.includes(JSON.stringify(text).slice(1, -1)), `${article.slug}: article body loaded on every page`);
}
console.log(`${BLOG_ARTICLES.length} article bodies excluded from initial JavaScript; article route loads on demand.`);
