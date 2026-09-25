import { BLOG_ARTICLES } from '../data/articles';
import { ArticlePage } from './ArticlePage';

export default function ArticleRoute({ slug }: { slug: string }) {
  const article = BLOG_ARTICLES.find(item => item.slug === slug);
  return article ? <ArticlePage article={article} /> : null;
}
