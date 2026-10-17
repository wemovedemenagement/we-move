import {ArrowRight,Phone,Mail} from 'lucide-react';
import type {CrmDossier} from '../services/crmService';
import {requestCity} from '../../shared/requestCity.mjs';
import {movingFormulas} from '../../shared/movingFormulas.mjs';
import './crmDossierOverview.css';

export default function CrmDossierOverview({data,onQuote}:{data:CrmDossier;onQuote:()=>void}){
  const lead=data.lead,accepted=['confirme','termine'].includes(lead.status)?data.acceptance?.quote:null,quote=accepted||data.quote;
  const formula=quote?.document?.fields?.formula||movingFormulas.find((f:{id:string})=>f.id===lead.formula)?.name||(lead.formula==='conseil'?'À conseiller':lead.formula==='standard'?'Standard (ancienne demande)':'À définir');
  const date=lead.moveDate?lead.moveDate.split('-').reverse().join('/'):'À convenir';
  return <section className="dossier-overview" aria-label="L’essentiel du dossier"><div className="dossier-overview-route"><strong>{requestCity(lead.departureAddress)||'Départ à préciser'}</strong><ArrowRight size={17} aria-hidden="true"/><strong>{requestCity(lead.arrivalAddress)||'Arrivée à préciser'}</strong></div>
    <dl><div><dt>Volume du dossier</dt><dd>{lead.unknownVolume||!lead.volume?'À estimer':`${lead.volume} m³`}</dd></div><div><dt>Date souhaitée</dt><dd>{date}</dd></div><div><dt>{quote?'Formule du devis':'Formule souhaitée'}</dt><dd>{formula}</dd></div><div><dt>{accepted?'Devis accepté TTC':quote?'Devis enregistré TTC':'Devis'}</dt><dd>{quote?.amountTTC!==null&&quote?.amountTTC!==undefined?quote.amountTTC.toLocaleString('fr-FR',{style:'currency',currency:'EUR'}):quote?'À chiffrer':'Non créé'}</dd></div></dl>
    {quote&&<p className="dossier-overview-reference">{quote.reference} · version {quote.revision}{accepted&&data.quote&&data.quote.revision!==accepted.revision?' · Une version de travail différente existe.':''}</p>}
    <div className="dossier-overview-links">{lead.phone&&<a href={'tel:'+lead.phone}><Phone size={14}/>Appeler</a>}{lead.email&&<a href={'mailto:'+lead.email}><Mail size={14}/>Écrire au client</a>}<button type="button" onClick={onQuote}>{quote?'Ouvrir le devis':'Préparer le devis'}<ArrowRight size={14}/></button></div>
  </section>;
}
