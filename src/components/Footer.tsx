import { openCookiePreferences } from '../data/consent';
import { Link } from '../router';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="wm-container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href="/" aria-label="We Move — Accueil">
              <Logo size="lg" />
            </Link>
            <p>Des meubles, des souvenirs, un nouveau départ. Déménagez avec le sourire, à Paris et en Île-de-France.</p>
          </div>
          <div>
            <h2>Nos expertises</h2>
            <ul>
              <li><Link href="/demenagement-particuliers/">Déménagement particuliers</Link></li>
              <li><Link href="/demenagement-entreprises/">Transfert d’entreprises</Link></li>
              <li><Link href="/stockage-garde-meubles/">Stockage & garde-meubles</Link></li>
              <li><Link href="/location-monte-meubles/">Location de monte-meubles</Link></li>
            </ul>
          </div>
          <div>
            <h2>À vos côtés</h2>
            <ul>
              <li><Link href="/qui-sommes-nous/">L’esprit We Move</Link></li>
              <li><Link href="/secteurs/">Nos secteurs</Link></li>
              <li><Link href="/volume/">Calculer mon volume</Link></li>
              <li><Link href="/blog/">Nos conseils</Link></li>
              <li><Link href="/contact/">Nous contacter</Link></li>
            </ul>
          </div>
          <div className="footer-contact">
            <h2>Parlons de votre projet</h2>
            <a href="tel:0173743690" className="footer-phone">01 73 74 36 90</a>
            <p>Du lundi au samedi<br />08h00 – 19h00</p>
            <p><Link href="/devis/">Demander un devis gratuit ↗</Link></p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} We Move Déménagement.</span>
          <div>
            <Link href="/mentions-legales/">Mentions légales</Link>
            <Link href="/politique-confidentialite/">Confidentialité (RGPD)</Link>
            <Link href="/cgv/">CGV</Link>
            <Link href="/crm/">Espace CRM</Link>
            <button type="button" onClick={openCookiePreferences}>Gérer mes cookies</button>
            <span>Un nouveau chapitre, ensemble.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
