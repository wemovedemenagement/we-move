import { useEffect } from 'react';
import { useRouter } from '../router';
import { routeSeo } from '../data/siteSeo';

export function RouteSeo() {
  const { pathname } = useRouter();
  useEffect(() => {
    const data = routeSeo(pathname);
    document.title = data.title;
    const meta = (key: string, content: string, property = false) => {
      const attr = property ? 'property' : 'name';
      let node = document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);
      if (!node) { node = document.createElement('meta'); node.setAttribute(attr, key); document.head.append(node); }
      node.content = content;
    };
    meta('description', data.description); meta('robots', data.robots);
    meta('og:title', data.title, true); meta('og:description', data.description, true);
    meta('og:url', data.url, true); meta('og:type', data.type, true);
    meta('og:image', data.image, true); meta('og:image:alt', data.imageAlt, true); meta('og:locale', 'fr_FR', true);
    meta('twitter:card', 'summary_large_image'); meta('twitter:title', data.title); meta('twitter:description', data.description); meta('twitter:image', data.image);
    let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.append(canonical); }
    canonical.href = data.url;
    document.getElementById('blog-article-schema')?.remove();
    document.getElementById('prerender-breadcrumb-schema')?.remove();
    document.getElementById('route-schema')?.remove();
    if (!data.missing) { const schema = document.createElement('script'); schema.type = 'application/ld+json'; schema.id = 'route-schema'; schema.textContent = JSON.stringify(data.schema); document.head.append(schema); }
  }, [pathname]);
  return null;
}
