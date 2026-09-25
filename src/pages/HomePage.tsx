import { useState } from 'react';
import { ArrowRight, ArrowUpRight, Box, Check, ChevronDown, HeartHandshake, MapPin, MoveRight, PackageCheck, Phone, ShieldCheck } from 'lucide-react';
import { Link, useRouter } from '../router';
import { FAQ_DATA } from '../data/content';
import craftImage from '../assets/images/service_craft_protection_1790153177359.webp';
import officeImage from '../assets/images/office_move_logistics_1790153527033.webp';
import storageImage from '../assets/images/storage_warehouse_facility_1790153540073.webp';
import liftImage from '../assets/images/furniture_lift_exterior_1790153551793.webp';

const services = [
  { name: 'Un nouveau chez-vous.', label: 'PARTICULIERS', text: 'Du premier carton à la dernière pièce, on prend soin de tout ce qui compte pour vous.', image: craftImage, href: '/demenagement-particuliers/', alt: 'Protection soignée du mobilier avant le déménagement' },
  { name: 'Votre activité en mouvement.', label: 'ENTREPRISES', text: 'Un transfert de bureaux organisé autour de vos équipes et de votre activité.', image: officeImage, href: '/demenagement-entreprises/', alt: 'Préparation du déménagement de bureaux' },
  { name: 'De la place pour vos projets.', label: 'GARDE-MEUBLES', text: 'Un espace sécurisé pour vos affaires, le temps dont vous avez besoin.', image: storageImage, href: '/stockage-garde-meubles/', alt: 'Espaces de stockage individuels' },
  { name: 'Prenez de la hauteur.', label: 'MONTE-MEUBLES', text: 'Les accès se compliquent ? Notre matériel et nos techniciens prennent le relais.', image: liftImage, href: '/location-monte-meubles/', alt: 'Monte-meubles installé devant un immeuble' },
];
export function HomePage() {
  const { push } = useRouter();
  const [departure, setDeparture] = useState('');
  const [arrival, setArrival] = useState('');
  const [volume, setVolume] = useState(25);
  const [category, setCategory] = useState('Tous les services');
  const visibleServices = services.filter((_, index) => category === 'Tous les services' || (category === 'Particuliers' ? index !== 1 : index !== 0));
  return <div className="premium-home">
    <section className="wm-hero">
      <div className="wm-container hero-layout">
        <div className="hero-copy"><p className="eyebrow"><span /> DÉMÉNAGEMENT À PARIS & EN ÎLE-DE-FRANCE</p>
          <h1>Déménagez à Paris.<br /><span>Et en Île-de-France</span><span className="coral-dot">.</span></h1>
          <p className="hero-description">Vous changez d’adresse. Nous prenons soin du reste. Un déménagement bien pensé, une équipe attentionnée, et l’esprit léger.</p>
          <div className="hero-buttons"><Link href="/devis/" className="wm-button">Préparer mon déménagement <ArrowUpRight size={20} /></Link><a href="#services" className="text-link">Découvrir nos services <ArrowRight size={17} /></a></div>
          <div className="hero-assurance"><span><Check size={15} /> Devis gratuit, sans engagement</span><span><Check size={15} /> Accompagnement sur mesure</span></div>
        </div>
        <div className="hero-photo"><img src="/images/we-move-demenagement-paris-hero.webp" alt="L’équipe We Move déménage du mobilier dans une rue parisienne" fetchPriority="high" width="1916" height="821" /><div className="photo-label"><span className="photo-label-dot" /> PARIS, ET VOTRE PROCHAINE ADRESSE.</div><div className="hero-stamp"><HeartHandshake size={28} strokeWidth={1.5} /><span>Vos affaires.<br /><strong>Notre attention.</strong></span></div><span className="photo-caption">LE DÉBUT D’UN NOUVEAU CHAPITRE ↗</span></div>
      </div>
      <form className="quick-project wm-container" onSubmit={event => { event.preventDefault(); push(`/devis/?dep=${encodeURIComponent(departure)}&arr=${encodeURIComponent(arrival)}`); }}>
        <div className="project-heading"><span className="eyebrow">ON VOUS EMMÈNE OÙ ?</span><strong>Tout commence ici.</strong></div>
        <label className="project-field"><MapPin size={20} /><span><span>Ville de départ</span><input required aria-label="Ville de départ" autoComplete="off" placeholder="Paris, 75015…" value={departure} onChange={event => setDeparture(event.target.value)} /></span></label>
        <MoveRight className="journey-arrow" size={22} />
        <label className="project-field"><MapPin size={20} /><span><span>Ville d’arrivée</span><input required aria-label="Ville d’arrivée" autoComplete="off" placeholder="Votre nouvelle adresse…" value={arrival} onChange={event => setArrival(event.target.value)} /></span></label>
        <button className="wm-button" type="submit">C’est parti <ArrowUpRight size={20} /></button>
      </form>
    </section>
    <div className="promise-strip wm-container"><span><ShieldCheck /> Vos biens entre de bonnes mains</span><span><PackageCheck /> Une protection soignée</span><span><HeartHandshake /> Un interlocuteur à vos côtés</span><span><MapPin /> Paris & Île-de-France</span></div>
    <section id="services" className="wm-section wm-container">
      <div className="section-heading"><div><p className="eyebrow">01 — À CHAQUE PROJET, SA SOLUTION</p><h2>Vous bougez.<br />On s’adapte.</h2></div><div className="section-intro"><p>Un appartement, des bureaux, quelques meubles à stocker. La même attention, quelle que soit votre destination.</p><Link className="text-link" href="/services/">Explorer nos services <ArrowUpRight size={18} /></Link></div></div>
      <div className="service-filters" role="group" aria-label="Filtrer les services">{['Tous les services', 'Particuliers', 'Entreprises'].map(item => <button key={item} aria-pressed={category === item} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="service-grid">{visibleServices.map((service) => <Link key={service.href} href={service.href} className="service-card"><div className="service-photo"><img loading="lazy" src={service.image} alt={service.alt} width="640" height="480" /><span className="service-number">0{services.indexOf(service) + 1}</span><span className="service-arrow"><ArrowUpRight size={22} /></span></div><div className="service-copy"><p className="eyebrow">{service.label}</p><h3>{service.name}</h3><p>{service.text}</p></div></Link>)}</div>
    </section>
    <section className="care-section"><div className="wm-container care-layout"><div className="care-image"><img src={craftImage} alt="Mobilier emballé avec soin par les déménageurs" loading="lazy" width="700" height="750" /><span>LES PETITS DÉTAILS FONT LES GRANDS DÉPARTS.</span></div><div className="care-copy"><p className="eyebrow">02 — L’ESPRIT WE MOVE</p><h2>On ne déplace pas<br />que des meubles.<br /><span>On prend soin<br />de votre histoire.</span></h2><p>La table des grandes occasions. Le canapé des dimanches. Les cartons remplis de souvenirs. Pour vous, ce ne sont pas de simples objets. Pour nous non plus.</p><div className="care-values"><div><ShieldCheck /><span><strong>Le soin, à chaque étape.</strong>Emballage adapté et mobilier protégé.</span></div><div><HeartHandshake /><span><strong>Des humains, avant tout.</strong>Une équipe à l’écoute de vos besoins.</span></div></div><Link href="/qui-sommes-nous/" className="text-link">Faire connaissance <ArrowUpRight size={18} /></Link></div></div></section>
    <section className="wm-section wm-container"><div className="section-heading"><div><p className="eyebrow">03 — SIMPLE DU DÉBUT À LA FIN</p><h2>Votre prochain chapitre,<br />en trois étapes.</h2></div><Link href="/devis/" className="text-link">Parlons de votre projet <ArrowUpRight size={18} /></Link></div><div className="steps-grid">{[['Racontez-nous votre projet.', 'Vos adresses, votre calendrier, vos envies. Nous faisons le point sur vos besoins et les accès.'], ['On prépare chaque détail.', 'Volume, protection, transport : vous choisissez une formule et recevez une proposition détaillée.'], ['Bienvenue chez vous.', 'Le jour J, notre équipe prend le relais. Vous pouvez vous concentrer sur votre nouvelle vie.']].map(([title, description], i) => <article key={title} className="step"><div className="step-top"><span>0{i + 1}</span><ArrowRight size={22} /></div><h3>{title}</h3><p>{description}</p></article>)}</div></section>
    <section className="volume-section wm-container"><div><p className="eyebrow">UN PEU DE PRÉPARATION, BEAUCOUP DE SÉRÉNITÉ</p><h2>Vos meubles prennent<br />combien de place ?</h2><p>Faites une première estimation, puis affinez votre volume pièce par pièce avec notre calculateur.</p><Link href="/volume/" className="text-link">Ouvrir le calculateur détaillé <ArrowUpRight size={18} /></Link></div><div className="volume-tool"><div className="volume-top"><span><Box size={22} /> Mon volume estimé</span><output htmlFor="home-volume">{volume}<small> m³</small></output></div><label htmlFor="home-volume" className="volume-label">Ajustez le volume de votre déménagement</label><input id="home-volume" type="range" min="5" max="100" step="5" value={volume} onChange={event => setVolume(Number(event.target.value))} /><div className="range-labels"><span>5 m³ · Quelques meubles</span><span>100 m³ · Grande maison</span></div><Link className="wm-button" href={`/devis/?volume=${volume}`}>Préparer mon devis avec {volume} m³ <ArrowUpRight size={18} /></Link><p>Estimation indicative, à confirmer avec notre équipe.</p></div></section>
    <section id="questions" className="wm-section wm-container faq-layout"><div><p className="eyebrow">04 — LES RÉPONSES QUI RASSURENT</p><h2>Un départ serein,<br />ça se prépare.</h2><p>Encore une question ?<br />Nous sommes là pour vous.</p><a className="text-link" href="tel:0173743690"><Phone size={17} /> 01 73 74 36 90</a></div><div className="home-faq">{FAQ_DATA.slice(0, 5).map(item => <details key={item.id}><summary>{item.question}<ChevronDown size={19} /></summary><p>{item.answer}</p></details>)}</div></section>
    <section className="closing-section"><div className="wm-container"><p className="eyebrow">ET SI ON ÉCRIVAIT LA SUITE ENSEMBLE ?</p><h2>Nouvelle adresse.<br /><span>Même tranquillité.</span></h2><Link className="wm-button" href="/devis/">Parlons de votre déménagement <ArrowUpRight size={21} /></Link><p>Un devis gratuit. Une équipe à votre écoute. Un bon départ.</p></div></section>
  </div>;
}
