import { BLOG_ARTICLES } from './articles';
export const SITE_URL = (import.meta.env?.VITE_SITE_URL || 'https://wemove.fr').replace(/\/$/, '');
export type BlogArticle = typeof BLOG_ARTICLES[number];
export const articlePath = (article: BlogArticle) => `/blog/${article.slug}/`;
export const readTime = (article: BlogArticle) => Math.max(1, Math.ceil([article.title, article.excerpt, ...article.sections.flatMap(s=>[s.title,s.text,...s.tips])].join(' ').split(/\s+/).length / 200));
export function articleSeo(article: BlogArticle, origin=SITE_URL) {
  const url=origin+articlePath(article);
  return {title:`${article.shortTitle} | We Move`,description:article.excerpt,url,image:new URL(article.image,origin).href,schema:{'@context':'https://schema.org','@type':'BlogPosting',headline:article.title,description:article.excerpt,image:[new URL(article.image,origin).href],mainEntityOfPage:{'@type':'WebPage','@id':url},url,inLanguage:'fr-FR',articleSection:article.category,author:{'@type':'Organization',name:'We Move',url:origin+'/qui-sommes-nous/'},publisher:{'@type':'Organization',name:'We Move',url:origin},articleBody:article.sections.map(s=>`${s.title}\n${s.text}\n${s.tips.join('\n')}`).join('\n\n')}};
}
