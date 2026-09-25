import { ArrowUpRight } from 'lucide-react';
import { SEO_CONTENT } from '../data/seoContent';
import { Link } from '../router';

export function SeoContent({ pathname }: { pathname: string }) {
  const content = SEO_CONTENT[pathname];
  if (!content) return null;

  return (
    <section className="seo-content" aria-labelledby="seo-content-title">
      <div className="wm-container">
        <div className="seo-content-heading">
          <p className="eyebrow">{content.eyebrow}</p>
          <h2 id="seo-content-title">{content.title}</h2>
          <p>{content.intro}</p>
        </div>
        <div className="seo-content-grid">
          {content.sections.map(section => (
            <div key={section.title}>
              <h3>{section.title}</h3>
              <p>{section.text}</p>
            </div>
          ))}
        </div>
        <nav className="seo-content-links" aria-label="Pour préparer la suite de votre projet">
          {content.links.map(link => (
            <Link key={link.href} href={link.href} className="text-link">
              {link.label}<ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  );
}
