import { build } from 'esbuild';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadEnv } from 'vite';
const root=process.cwd();
const env=loadEnv('production',root,'VITE_');
const origin=(process.env.VITE_SITE_URL||env.VITE_SITE_URL||'https://wemove.fr').replace(/\/$/,'');
if(!/^https?:\/\//.test(origin)) throw new Error('VITE_SITE_URL doit être une URL absolue.');
const manifest=JSON.parse(await readFile('dist/.vite/manifest.json','utf8'));
await mkdir('.prerender',{recursive:true});
await build({entryPoints:['scripts/render-blog.tsx'],outfile:'.prerender/blog.mjs',bundle:true,platform:'node',format:'esm',packages:'external',jsx:'automatic',define:{'import.meta.env':JSON.stringify({VITE_SITE_URL:origin})},plugins:[{name:'built-images',setup(api){api.onLoad({filter:/\.(jpg|webp|png)$/},args=>{const key=path.relative(root,args.path).replaceAll('\\','/');const asset=manifest[key];if(!asset)throw new Error(`Missing built asset: ${key}`);return{contents:`export default ${JSON.stringify('/'+asset.file)}`,loader:'js'};});}}]});
const {BLOG_ARTICLES,articleSeo,articlePath,render}=await import(pathToFileURL(path.join(root,'.prerender/blog.mjs')).href);
const template=await readFile('dist/index.html','utf8');
const escape=value=>String(value).replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const json=value=>JSON.stringify(value).replaceAll('<','\\u003c');
for(const article of BLOG_ARTICLES){
  const seo=articleSeo(article,origin);
  let html=template.replace(/<title>[\s\S]*?<\/title>/,'').replace(/<meta\s+(?:name|property)="(?:description|og:[^"]+|twitter:[^"]+|robots)"[^>]*>/g,'');
  const crumbs={'@context':'https://schema.org','@type':'BreadcrumbList',itemListElement:[{name:'Accueil',item:origin+'/'},{name:'Conseils',item:origin+'/blog/'},{name:article.shortTitle,item:seo.url}].map((item,index)=>({'@type':'ListItem',position:index+1,...item}))};
  const head=`<title>${escape(seo.title)}</title><meta name="description" content="${escape(seo.description)}"><link rel="canonical" href="${escape(seo.url)}"><meta name="robots" content="index,follow"><meta property="og:type" content="article"><meta property="og:locale" content="fr_FR"><meta property="og:title" content="${escape(seo.title)}"><meta property="og:description" content="${escape(seo.description)}"><meta property="og:url" content="${escape(seo.url)}"><meta property="og:image" content="${escape(seo.image)}"><meta property="og:image:alt" content="${escape(article.alt)}"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${escape(seo.title)}"><meta name="twitter:description" content="${escape(seo.description)}"><meta name="twitter:image" content="${escape(seo.image)}"><script id="blog-article-schema" type="application/ld+json">${json(seo.schema)}</script><script id="prerender-breadcrumb-schema" type="application/ld+json">${json(crumbs)}</script>`;
  html=html.replace('</head>',head+'</head>').replace('<div id="root"></div>',()=>`<div id="root">${render(article)}</div>`);
  const folder=path.join('dist',articlePath(article));await mkdir(folder,{recursive:true});await writeFile(path.join(folder,'index.html'),html);
}
await writeFile('dist/sitemap-blog.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${BLOG_ARTICLES.map(article=>`<url><loc>${escape(origin+articlePath(article))}</loc></url>`).join('')}</urlset>`);
console.log(`${BLOG_ARTICLES.length} articles pré-rendus + sitemap-blog.xml (${origin})`);
