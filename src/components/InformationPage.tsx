import type { ReactNode } from 'react';
import { ArrowLeft, ArrowUpRight, FileText, LockKeyhole, Mail } from 'lucide-react';
import { Link } from '../router';

type InformationSection = { id: string; title: string; content: ReactNode };
type Props = { kind: 'legal' | 'privacy' | 'terms'; intro?: ReactNode; contactEmail?: string; title: string; description: string; sections: InformationSection[] };

export function InformationPage({ kind, title, description, sections, intro, contactEmail = 'contact@wemove.fr' }: Props) {
  const privacy = kind === 'privacy';
  const Icon = privacy ? LockKeyhole : FileText;
  return <div className="information-page">
    <header className="information-hero"><div className="wm-container">
      <div className="information-heading"><div><p className="eyebrow">WE MOVE · INFORMATIONS & TRANSPARENCE</p><h1>{title}</h1><p>{description}</p></div><span className="information-emblem" aria-hidden="true"><Icon size={48} strokeWidth={1}/></span></div>
      <nav className="information-tabs" aria-label="Informations du site"><Link href="/mentions-legales/" aria-current={kind === 'legal' ? 'page' : undefined}><FileText size={17}/>Mentions légales</Link><Link href="/politique-confidentialite/" aria-current={privacy ? 'page' : undefined}><LockKeyhole size={17}/>Confidentialité (RGPD)</Link><Link href="/cgv/" aria-current={kind === 'terms' ? 'page' : undefined}><FileText size={17}/>CGV</Link></nav>
    </div></header>
    <div className="wm-container information-layout">
      <aside><div className="information-sidebar"><p className="eyebrow">DANS CETTE PAGE</p><nav aria-label="Sommaire">{sections.map((section,index)=><a key={section.id} href={`#${section.id}`}><span>0{index+1}</span>{section.title}</a>)}</nav><div className="information-help"><Mail size={22} strokeWidth={1.4}/><h2>Une question ?</h2><p>Notre équipe est à votre écoute.</p><a href={`mailto:${contactEmail}`}>{contactEmail} <ArrowUpRight size={15}/></a></div></div></aside>
      <div className="information-content"><div className="information-document-label"><Icon size={17}/><span>{privacy ? 'Protection et respect de vos données personnelles' : 'Informations relatives au site We Move'}</span></div>{intro && <div className="information-intro">{intro}</div>}{sections.map((section,index)=><section key={section.id} id={section.id} className="information-section"><div className="information-section-title"><span>0{index+1}</span><h2>{section.title}</h2></div><div className="information-prose">{section.content}</div></section>)}<div className="information-next"><span aria-hidden="true">{privacy ? <FileText size={26} strokeWidth={1.3}/> : <LockKeyhole size={26} strokeWidth={1.3}/>}</span><div><p>POUR POURSUIVRE</p><Link href={privacy ? '/mentions-legales/' : '/politique-confidentialite/'}>{privacy ? 'Consulter les mentions légales' : 'Consulter la politique de confidentialité'}<ArrowUpRight size={20}/></Link></div></div><Link href="/" className="information-back"><ArrowLeft size={16}/>Revenir à l’accueil</Link></div>
    </div>
  </div>;
}
