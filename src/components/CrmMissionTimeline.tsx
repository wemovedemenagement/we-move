import {useEffect,useState} from 'react';
import {Clock3,ArrowUpRight,Search} from 'lucide-react';
import {missionTimeline,parisMinute} from '../../shared/missionTimeline.mjs';
import {requestCity} from '../../shared/requestCity.mjs';
import type {PlanningData,MoveBooking} from '../services/crmService';
import type {QuoteLead,MovePreparationTarget} from '../types/crm';
import './crmMissionTimeline.css';
const states={review:'Compte rendu attendu',ongoing:'Créneau en cours',upcoming:'À venir aujourd’hui'};
type Row={booking:MoveBooking;lead?:QuoteLead;bucket:keyof typeof states};
const dateTime=(value:string)=>`${value.slice(8,10)}/${value.slice(5,7)}/${value.slice(0,4)} à ${value.slice(11)}`;
export default function CrmMissionTimeline({data,leads,loading,error,onOpen}:{data:PlanningData|null;leads:QuoteLead[];loading:boolean;error:string;onOpen:(lead:QuoteLead,target:MovePreparationTarget)=>void}){
  const [now,setNow]=useState(()=>new Date()),[state,setState]=useState('all'),[query,setQuery]=useState(''),[limit,setLimit]=useState(6);
  useEffect(()=>{const tick=()=>setNow(new Date());const timer=window.setInterval(tick,30000);window.addEventListener('focus',tick);return()=>{window.clearInterval(timer);window.removeEventListener('focus',tick);};},[]);
  const ready=!!data&&!loading&&!error;
  const all=missionTimeline(data?.bookings||[],leads,now) as Row[],rows=missionTimeline(data?.bookings||[],leads,now,{state,query}) as Row[];
  return <details className="crm-mission-timeline"><summary><Clock3 size={20}/><span>Missions à suivre<small>{ready?`${all.filter(r=>r.bucket==='review').length} compte(s) rendu(s) attendu(s) · ${all.filter(r=>r.bucket!=='review').length} créneau(x) à suivre aujourd’hui`:'Missions en cours de vérification'}</small></span></summary><div className="mission-timeline-body"><p>Repères selon les horaires prévus, à {parisMinute(now).slice(11)} · heure de Paris. Un créneau terminé ne signifie pas que le déménagement est réalisé. Les comptes rendus absents restent visibles, même pour une date passée.</p>
    {!ready?<p role={error?'alert':'status'}>{error?'Missions non vérifiées. Utilisez « Actualiser » pour réessayer.':'Chargement des missions…'}</p>:<>
      <div className="mission-timeline-tabs" aria-label="Missions à suivre par situation">{[['all','Toutes'],...Object.entries(states)].map(([id,label])=><button type="button" key={id} aria-pressed={state===id} onClick={()=>{setState(id);setLimit(6);}}>{label}<span>{id==='all'?all.length:all.filter(r=>r.bucket===id).length}</span></button>)}</div>
      <label className="mission-timeline-search"><Search size={16}/><input type="search" aria-label="Rechercher une mission à suivre" placeholder="Client, ville, équipe ou véhicule…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(6);}}/></label>
      <div className="mission-timeline-results"><span aria-live="polite">{rows.length} mission(s)</span>{(query||state!=='all')&&<button type="button" className="crm-quiet-action" onClick={()=>{setQuery('');setState('all');setLimit(6);}}>Réinitialiser la sélection</button>}</div>
      {!rows.length?<p className="mission-timeline-empty">{all.length?'Aucune mission ne correspond à cette sélection.':'Aucun créneau en cours, à venir aujourd’hui ou sans compte rendu après sa fin prévue.'}</p>:<div className="mission-timeline-list">{rows.slice(0,limit).map(({booking,lead,bucket})=><article key={booking.leadId} data-state={bucket}><div className="mission-timeline-heading"><strong>{booking.clientName}</strong><span>{states[bucket]}</span></div><p>{dateTime(booking.start)} → {dateTime(booking.end)}</p>{lead&&<p>{requestCity(lead.departureAddress)} → {requestCity(lead.arrivalAddress)}</p>}<small>{booking.resources.map(r=>r.name).join(' · ')||'Affectations à vérifier'}</small>{lead?<button type="button" className="crm-quiet-action" onClick={()=>onOpen(lead,bucket==='review'?'closure':bucket==='ongoing'?'preparation':'move')}>{bucket==='review'?'Renseigner le compte rendu':bucket==='ongoing'?'Consulter les consignes':'Préparer la mission'}<ArrowUpRight size={14}/></button>:<small>Dossier indisponible dans la liste actuelle.</small>}</article>)}</div>}
      {rows.length>limit&&<button type="button" className="crm-quiet-action" onClick={()=>setLimit(value=>value+6)}>Afficher plus de missions à suivre ({rows.length-limit})</button>}
    </>}
  </div></details>;
}
