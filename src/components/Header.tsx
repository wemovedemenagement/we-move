import { useEffect, useRef, useState } from 'react';
import { ArrowRight, ArrowUpRight, Building2, Calculator, ChevronDown, HeartHandshake, House, MapPin, Menu, MoveUpRight, Package, Phone, X } from 'lucide-react';
import { Link, useRouter } from '../router';
import { Logo } from './Logo';

const links = [['L’esprit We Move', '/qui-sommes-nous/'], ['Nos secteurs', '/secteurs/'], ['Conseils', '/blog/']];
const services = [
  { title: 'Déménagement particuliers', description: 'Un nouveau chez-vous, en toute sérénité.', href: '/demenagement-particuliers/', icon: House, tone: 'blue', label: 'POUR VOTRE QUOTIDIEN' },
  { title: 'Transfert d’entreprises', description: 'Vos bureaux changent. Votre activité continue.', href: '/demenagement-entreprises/', icon: Building2, tone: 'sage', label: 'POUR VOS ÉQUIPES' },
  { title: 'Stockage & garde-meubles', description: 'De l’espace, le temps qu’il vous faut.', href: '/stockage-garde-meubles/', icon: Package, tone: 'sand', label: 'POUR VOS AFFAIRES' },
  { title: 'Location de monte-meubles', description: 'Une solution pour les accès les plus exigeants.', href: '/location-monte-meubles/', icon: MoveUpRight, tone: 'coral', label: 'POUR PRENDRE DE LA HAUTEUR' },
];
function ServiceLinks({ close }: { close: () => void }) {
  return <div className="mega-service-grid">{services.map(({ title, description, href, icon: Icon, tone, label }) => <Link key={href} href={href} className="mega-service" onClick={close}>
    <span className={`mega-icon mega-icon-${tone}`}><Icon size={23} strokeWidth={1.5} /></span>
    <span className="mega-service-copy"><span className="mega-category">{label}</span><strong>{title}</strong><span className="mega-description">{description}</span></span><ArrowUpRight className="mega-link-arrow" size={17} />
  </Link>)}</div>;
}
export function Header() {
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const { pathname } = useRouter();
  const toggle = useRef<HTMLButtonElement>(null);
  const servicesToggle = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clearTimer = () => { if (timer.current) clearTimeout(timer.current); };
  const closeAll = () => { clearTimer(); setOpen(false); setServicesOpen(false); };
  const servicesActive = services.some(service => pathname === service.href) || pathname === '/services/';
  useEffect(() => { closeAll(); }, [pathname]);
  useEffect(() => {
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (servicesOpen) { setServicesOpen(false); servicesToggle.current?.focus(); }
        else if (open) { setOpen(false); toggle.current?.focus(); }
      }
    };
    const outside = (event: PointerEvent) => { if (event.target instanceof Node && !header.current?.contains(event.target)) closeAll(); };
    const resize = () => closeAll();
    window.addEventListener('keydown', close);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', resize);
    return () => { window.removeEventListener('keydown', close); document.removeEventListener('pointerdown', outside); window.removeEventListener('resize', resize); clearTimer(); };
  }, [open, servicesOpen]);
  return <header ref={header} className={`site-header premium-header ${servicesOpen ? 'has-mega-menu' : ''}`} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) { clearTimer(); setServicesOpen(false); } }}>
    <a className="skip-link" href="#main-content">Aller au contenu</a>
    <div className="header-note"><div><span><MapPin size={12} /> Paris & Île-de-France</span><span>Un nouveau chapitre, ensemble.</span><a href="/contact/">Une équipe à votre écoute <ArrowUpRight size={12} /></a></div></div>
    <div className="header-inner">
      <Link href="/" className="header-brand" aria-label="We Move — Accueil" onClick={closeAll}><Logo size="md" /></Link>
      <nav className="desktop-nav" aria-label="Navigation principale">
        <div className="services-nav" onPointerEnter={event => { if (event.pointerType === 'mouse') { clearTimer(); setServicesOpen(true); } }} onPointerLeave={event => { if (event.pointerType === 'mouse') { clearTimer(); timer.current = setTimeout(() => setServicesOpen(false), 180); } }}>
          <button ref={servicesToggle} className={`services-trigger ${servicesActive ? 'is-active' : ''}`} aria-expanded={servicesOpen} aria-controls="services-mega-menu" onClick={() => { clearTimer(); setServicesOpen(!servicesOpen); }} onKeyDown={event => { if (event.key === 'ArrowDown') { event.preventDefault(); setServicesOpen(true); requestAnimationFrame(() => header.current?.querySelector<HTMLAnchorElement>('#services-mega-menu a')?.focus()); } }}>Nos services <ChevronDown size={14} /></button>
          {servicesOpen && <div id="services-mega-menu" className="mega-menu"><div className="mega-surface"><div className="mega-main"><div className="mega-heading"><div><span className="mega-eyebrow">NOS EXPERTISES</span><h2>À chaque départ, sa solution.</h2></div><span className="mega-count">01 — 04</span></div><ServiceLinks close={closeAll} /><div className="mega-bottom"><span><HeartHandshake size={16} /> Le même soin, pour tous vos projets.</span><Link href="/services/" onClick={closeAll}>Tous nos services <ArrowRight size={15} /></Link></div></div><aside className="mega-aside"><span className="mega-aside-icon"><Calculator size={27} strokeWidth={1.4} /></span><span className="mega-eyebrow">BIEN PRÉPARER SON DÉPART</span><h3>Un grand projet.<br />Quelques mètres cubes.</h3><p>Estimez votre volume, pièce par pièce, en quelques clics.</p><Link href="/volume/" onClick={closeAll} className="mega-calculator">Calculer mon volume <ArrowUpRight size={17} /></Link><span className="mega-aside-caption">GRATUIT & SANS ENGAGEMENT</span></aside></div></div>}
        </div>
        {links.map(([name, href]) => <Link key={href} href={href} activeClassName="is-active" onPointerEnter={() => { clearTimer(); setServicesOpen(false); }}>{name}</Link>)}
      </nav>
      <div className="header-actions"><a className="header-phone" href="tel:0173743690"><span className="header-phone-icon"><Phone size={17} strokeWidth={1.6} /></span><span><small>Parlons de votre projet</small><strong>01 73 74 36 90</strong></span></a><Link className="wm-button wm-button-small header-quote" href="/devis/" onClick={closeAll}>Mon devis gratuit <span><ArrowUpRight size={17} /></span></Link></div>
      <button ref={toggle} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <nav id="mobile-navigation" className="mobile-navigation premium-mobile-nav" aria-label="Navigation mobile"><div className="mobile-services-heading"><span className="mega-eyebrow">NOS SERVICES</span><Link href="/services/" onClick={closeAll}>Tout découvrir <ArrowRight size={14} /></Link></div><ServiceLinks close={closeAll} />{links.map(([name, href]) => <Link key={href} href={href} activeClassName="is-active" onClick={closeAll}>{name}<ArrowUpRight size={17} /></Link>)}<Link href="/volume/" onClick={closeAll}><span className="mobile-volume-label"><Calculator size={18} /> Estimer mon volume</span><ArrowUpRight size={17} /></Link><Link className="wm-button" href="/devis/" onClick={closeAll}>Demander mon devis <ArrowUpRight size={18} /></Link></nav>}
  </header>;
}
