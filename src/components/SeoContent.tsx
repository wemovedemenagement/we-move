import { ArrowUpRight, Building2, House, MapPin, PackageCheck, Route } from 'lucide-react';
import { SEO_CONTENT } from '../data/seoContent';
import { Link } from '../router';

export function SeoContent({ pathname }: { pathname: string }) {
  const content = SEO_CONTENT[pathname];
  if (!content) return null;

  if (pathname === '/') return (
    <section className="project-guide" aria-labelledby="seo-content-title">
      <div className="wm-container">
        <div className="project-guide-heading">
          <div><p className="eyebrow"><span />{content.eyebrow}</p>
            <h2 id="seo-content-title">Votre déménagement à Paris et en <span className="project-guide-region">Île-de-France,</span><br /><span>étape par étape.</span></h2>
          </div>
          <div className="project-guide-intro"><span className="project-guide-kicker">UN DÉPART BIEN PENSÉ</span><p>{content.intro}</p></div>
        </div>
        <div className="project-guide-steps">
          {content.sections.map((section, index) => {
            const Icon = index === 0 ? Route : PackageCheck;
            const details = index === 0 ? ['Étages & ascenseur', 'Accès & stationnement', 'Photos & dimensions'] : ['Volume à transporter', 'Emballage & démontage', 'Besoins complémentaires'];
            return <article className="project-guide-card" key={section.title}>
              <div className="project-guide-card-top"><span className="project-guide-icon"><Icon size={27} strokeWidth={1.35} aria-hidden="true" /></span><span className="project-guide-number" aria-hidden="true">0{index + 1}</span></div>
              <p className="project-guide-caption">{index === 0 ? 'LE POINT DE DÉPART' : 'LA BONNE FORMULE'}</p>
              <h3>{section.title}</h3><p className="project-guide-description">{section.text}</p>
              <ul className="project-guide-details" aria-label={index === 0 ? 'Les accès à repérer' : 'Les besoins à préciser'}>{details.map(detail => <li key={detail}>{detail}</li>)}</ul>
            </article>;
          })}
        </div>
        <div className="project-guide-paths"><div className="project-guide-paths-heading"><span>À CHAQUE PROJET, SA DIRECTION</span><p>Et pour vous, quelle est la suite ?</p></div>
          <nav aria-label="Pour préparer la suite de votre projet">{content.links.map((link, index) => {
            const Icon = [House, Building2, MapPin][index];
            return <Link href={link.href} key={link.href}><Icon className="project-guide-link-icon" size={21} strokeWidth={1.4} aria-hidden="true" /><span><small>{['VOTRE LOGEMENT', 'VOTRE ACTIVITÉ', 'VOTRE DESTINATION'][index]}</small><strong>{link.label}</strong></span><ArrowUpRight className="project-guide-link-arrow" size={18} aria-hidden="true" /></Link>;
          })}</nav>
        </div>
      </div>
    </section>
  );

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
