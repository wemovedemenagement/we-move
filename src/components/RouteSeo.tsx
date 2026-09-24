import { useEffect } from 'react';
import { useRouter } from '../router';
import { BLOG_ARTICLES } from '../data/articles';
import { articleSeo, SITE_URL } from '../data/blogSeo';
export function RouteSeo() {
  const {pathname}=useRouter();
  useEffect(()=>{
    const article=BLOG_ARTICLES.find(item=>pathname===`/blog/${item.slug}/`);
    const missing=pathname.startsWith('/blog/')&&pathname!=='/blog/'&&!article;
    const data=article?articleSeo(article):{title:missing?'Article introuvable | We Move':pathname==='/blog/'?'Conseils et guides de déménagement | We Move':'We Move — Déménagement à Paris et en Île-de-France',description:pathname==='/blog/'?'Préparez votre déménagement avec les guides We Move : organisation, emballage, volume, stockage et transfert de bureaux.':'Préparez votre déménagement avec We Move à Paris et en Île-de-France. Découvrez nos services et demandez un devis personnalisé.',url:SITE_URL+pathname,image:SITE_URL+'/images/we-move-demenagement-paris-hero.webp'};
    document.title=data.title;
    const meta=(key:string,content:string,property=false)=>{const attr=property?'property':'name';let node=document.head.querySelector<HTMLMetaElement>(`meta[${attr}="${key}"]`);if(!node){node=document.createElement('meta');node.setAttribute(attr,key);document.head.append(node);}node.content=content;};
    meta('description',data.description);meta('robots',missing?'noindex,follow':'index,follow');meta('og:title',data.title,true);meta('og:description',data.description,true);meta('og:url',data.url,true);meta('og:type',article?'article':'website',true);meta('og:image',data.image,true);meta('og:image:alt',article?.alt||'We Move Déménagement',true);meta('og:locale','fr_FR',true);meta('twitter:card','summary_large_image');meta('twitter:title',data.title);meta('twitter:description',data.description);meta('twitter:image',data.image);
    let canonical=document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical);}canonical.href=data.url;
    document.getElementById('blog-article-schema')?.remove();document.getElementById('prerender-breadcrumb-schema')?.remove();
    if(article){const script=document.createElement('script');script.type='application/ld+json';script.id='blog-article-schema';script.textContent=JSON.stringify(articleSeo(article).schema);document.head.append(script);}
  },[pathname]);
  return null;
}
