import React from 'react';
import { renderToString } from 'react-dom/server';
import { ArticlePage } from '../src/pages/ArticlePage';
import { BLOG_ARTICLES } from '../src/data/articles';
import { articleSeo, articlePath } from '../src/data/blogSeo';
export { BLOG_ARTICLES, articleSeo, articlePath };
export function render(article: typeof BLOG_ARTICLES[number]) {
  return renderToString(<><header className="site-header"><div className="header-inner"><a href="/">We Move</a><nav><a href="/blog/">Tous les conseils</a></nav></div></header><main id="main-content"><ArticlePage article={article}/></main></>);
}
