import {useEffect,useRef,useState} from 'react';
import {FolderOpen,ChevronDown,RefreshCw,Phone,Mail,ArrowRight} from 'lucide-react';
import type {QuoteLead} from '../types/crm';
import {fetchCrmDossier} from '../services/crmService';
import {missionPhoneLink} from '../../shared/missionFieldSheet.mjs';
import {requestedDate} from '../../shared/planningQueue.mjs';
import {movingFormulas} from '../../shared/movingFormulas.mjs';
import {requestStatus,channelName} from './CrmRequests';
import CrmVisitReport from './CrmVisitReport';
import './crmQuoteDossier.css';

export default function CrmQuoteDossier({leadId}:{leadId:string}){
  const panel=useRef<HTMLDetailsElement>(null),generation=useRef(0),lock=useRef(false);
  const [lead,setLead]=useState<QuoteLead|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[readAt,setReadAt]=useState('');
  useEffect(()=>()=>{generation.current++;},[]);
  async function load(){
    if(lock.current)return;
    lock.current=true;
    const request=++generation.current;
    setLoading(true);setError('');setLead(null);setReadAt('');
    try{
      const dossier=await fetchCrmDossier(leadId);
      if(dossier.lead.id!==leadId)throw new Error('Le dossier reçu ne correspond pas au devis.');
      if(request===generation.current){setLead(dossier.lead);setReadAt(new Date().toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}));}
    }catch(e){if(request===generation.current)setError(e instanceof Error?e.message:'Dossier indisponible.');}
    finally{if(request===generation.current){setLoading(false);lock.current=false;}}
  }
  const date=lead?requestedDate(lead.moveDate):'';
  const formula=lead?movingFormulas.find((item:{id:string})=>item.id===lead.formula)?.name||(lead.formula==='conseil'?'À conseiller':lead.formula==='standard'?'Standard (ancienne demande)':'À préciser'):'';
  return <details className="quote-dossier-reference" ref={panel} onToggle={event=>{if(event.target===event.currentTarget&&event.currentTarget.open)void load();}}>
    <summary><FolderOpen size={18} aria-hidden="true"/><span><strong>Dossier client</strong><small>Consulter la demande et le relevé de visite</small></span><ChevronDown size={17} aria-hidden="true"/></summary>
    <div className="quote-dossier-content">
      <div className="quote-dossier-toolbar"><p>{readAt?`Données consultées à ${readAt}`:'Consultation des données enregistrées'}</p><button type="button" disabled={loading} aria-label="Actualiser le dossier de référence" onClick={()=>void load()}><RefreshCw size={14} aria-hidden="true"/>{loading?'Chargement…':'Actualiser'}</button></div>
      {loading&&<p role="status">Chargement du dossier client…</p>}
      {error&&<div role="alert" className="quote-dossier-error"><p>{error} Votre saisie de devis est conservée.</p><button type="button" onClick={()=>void load()}>Réessayer la lecture du dossier</button></div>}
      {lead&&<>
        <div className="quote-dossier-person"><div><h3>{lead.fullName}</h3><p>{channelName(lead.source)} · {requestStatus[lead.status]}</p></div><div className="quote-dossier-contact">{missionPhoneLink(lead.phone)&&<a href={missionPhoneLink(lead.phone)}><Phone size={14} aria-hidden="true"/>{lead.phone}</a>}{lead.phone&&!missionPhoneLink(lead.phone)&&<p>Téléphone à vérifier : {lead.phone}</p>}{lead.email&&<a href={'mailto:'+encodeURIComponent(lead.email)}><Mail size={14} aria-hidden="true"/>{lead.email}</a>}{!lead.phone&&!lead.email&&<p>Coordonnées à compléter dans la demande.</p>}</div></div>
        <div className="quote-dossier-route">{[['departure','Départ'],['arrival','Arrivée']].map(([side,label])=><div key={side}><small>{label}</small><p>{(side==='departure'?lead.departureAddress:lead.arrivalAddress)||'À préciser'}</p></div>)}<ArrowRight size={16} aria-hidden="true"/></div>
        <dl className="quote-dossier-facts"><div><dt>Volume du dossier</dt><dd>{!lead.unknownVolume&&lead.volume?`${lead.volume.toLocaleString('fr-FR')} m³`:'À estimer'}</dd></div><div><dt>Date souhaitée</dt><dd>{date?date.split('-').reverse().join('/'):'À convenir'}{lead.flexibleDate&&date&&<small>Flexibilité signalée</small>}</dd></div><div><dt>Formule souhaitée</dt><dd>{formula}</dd></div></dl>
        {(lead.storageRequired||lead.liftRequired)&&<p className="quote-dossier-options">{[lead.storageRequired&&'Garde-meubles à étudier',lead.liftRequired&&'Monte-meubles à étudier'].filter(Boolean).join(' · ')}</p>}
        {lead.notes&&<section className="quote-dossier-note"><h4>Note enregistrée dans la demande</h4><p>{lead.notes}</p></section>}
        {lead.technicalVisit?<CrmVisitReport lead={lead}/>:<p>Aucun relevé de visite enregistré.</p>}
        <p className="quote-dossier-boundary">Les informations consultées ne remplacent pas vos saisies dans le devis.</p>
      </>}
      <button type="button" className="quote-dossier-collapse" onClick={()=>{if(panel.current){panel.current.open=false;panel.current.querySelector('summary')?.focus();}}}>Replier le dossier</button>
    </div>
  </details>;
}
