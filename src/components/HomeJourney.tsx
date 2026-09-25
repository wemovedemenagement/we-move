import { ArrowUpRight, ClipboardList, HeartHandshake, House } from 'lucide-react';
import { Link } from '../router';

const steps = [
  { label: 'ON VOUS ÉCOUTE', title: 'Racontez-nous votre projet.', text: 'Vos adresses, votre calendrier, vos envies. Nous faisons le point sur vos besoins et les accès.', detail: 'Vos besoins deviennent notre point de départ.', icon: HeartHandshake },
  { label: 'ON ORGANISE', title: 'On prépare chaque détail.', text: 'Volume, protection, transport : vous choisissez une formule et recevez une proposition détaillée.', detail: 'Une proposition claire, adaptée à votre projet.', icon: ClipboardList },
  { label: 'VOUS VOUS INSTALLEZ', title: 'Bienvenue chez vous.', text: 'Le jour J, notre équipe prend le relais. Vous pouvez vous concentrer sur votre nouvelle vie.', detail: 'Vos affaires arrivent. Un nouveau chapitre commence.', icon: House },
];

export function HomeJourney() {
  return <section className="home-journey wm-container" aria-labelledby="home-journey-title">
    <div className="home-journey-heading"><div><p className="eyebrow">03 — SIMPLE DU DÉBUT À LA FIN</p><h2 id="home-journey-title">Votre prochain chapitre,<br /><span>en trois étapes.</span></h2></div><p>Un fil conducteur, du premier échange<br />jusqu’à votre nouvelle adresse.</p></div>
    <ol className="home-journey-timeline">{steps.map(({label,title,text,detail,icon:Icon},index) => <li key={label}>
      <div className="home-journey-track"><span className="home-journey-number">0{index+1}</span><span className="home-journey-line" aria-hidden="true"/><Icon size={25} strokeWidth={1.3} aria-hidden="true" /></div>
      <div className="home-journey-copy"><p className="home-journey-label">{label}</p><h3>{title}</h3><p className="home-journey-text">{text}</p><p className="home-journey-detail">{detail}</p></div>
    </li>)}</ol>
    <div className="home-journey-invitation"><div><span className="home-journey-invitation-icon"><HeartHandshake size={25} strokeWidth={1.3} aria-hidden="true" /></span><p>Tout commence par une conversation.<small>Votre devis gratuit, sans engagement.</small></p></div><Link href="/devis/">Parlons de votre projet <ArrowUpRight size={19} aria-hidden="true" /></Link></div>
  </section>;
}
