import {useState} from 'react';
import {ArrowUpRight,ClipboardCheck,Search,Phone} from 'lucide-react';
import type {MoveBooking,PlanningData} from '../services/crmService';
import type {QuoteLead} from '../types/crm';
import {aftercareQueue,aftercareKindLabels} from '../../shared/aftercareQueue.mjs';
import {requestCity} from '../../shared/requestCity.mjs';
import {missionLocalTime,missionPhoneLink} from '../../shared/missionFieldSheet.mjs';
import './crmAftercare.css';

const labels={overdue:'En retard',today:'Aujourd’hui',upcoming:'À venir',undated:'Échéance à préciser',resolved:'Traité'};
type Row={booking:MoveBooking;lead?:QuoteLead;resolved:boolean;bucket:keyof typeof labels;dueKnown:boolean;incomplete:boolean;kinds:string[];reservations:string;missingDocuments:string;letterMissing:boolean};
const ownerName=(value?:string)=>String(value||'').trim();
export default function CrmAftercare({data,loading,error,leads,today,onOpen}:{data:PlanningData|null;loading:boolean;error:string;leads:QuoteLead[];today:string;onOpen:(lead:QuoteLead)=>void}) {
  const [state,setState]=useState('open'),[timing,setTiming]=useState('all'),[owner,setOwner]=useState('all'),[kind,setKind]=useState('all'),[query,setQuery]=useState(''),[limit,setLimit]=useState(8);
  const ready=!!data&&!loading&&!error;
  const all=aftercareQueue(data?.bookings||[],leads,today,{state:'all'}) as Row[];
  const rows=aftercareQueue(data?.bookings||[],leads,today,{state,timing,owner,query,kind}) as Row[];
  const selected=aftercareQueue(data?.bookings||[],leads,today,{state,owner,query,kind}) as Row[];
  const owners=[...new Set(all.map(row=>ownerName(row.booking.closure?.owner)).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'fr'));
  const openCount=all.filter(row=>!row.resolved).length;
  const reset=()=>{setState('open');setTiming('all');setOwner('all');setKind('all');setQuery('');setLimit(8);};
  const timingCount=(key:string)=>selected.filter(row=>!row.resolved&&(key==='incomplete'?row.incomplete:row.bucket===key)).length;
  return <details className="crm-aftercare">
    <summary><ClipboardCheck size={20}/><span>Après la mission<small>{ready?`${openCount} suivi${openCount>1?'s':''} à traiter · ${all.filter(row=>row.resolved).length} traité(s)`:'Suivis en cours de vérification'}</small></span></summary>
    <div className="aftercare-content">
      <p>Réserves, documents et prochaines actions, indépendamment de la période du calendrier. Horaires de Paris.</p>
      {!ready?<p role={error?'alert':'status'}>{error?'Suivis indisponibles. Utilisez « Actualiser » pour réessayer.':'Chargement des suivis…'}</p>:<>
        <div className="aftercare-states" aria-label="État des suivis">{[['open','À traiter'],['resolved','Traités'],['all','Tous']].map(([id,label])=><button key={id} type="button" aria-pressed={state===id} onClick={()=>{setState(id);setTiming('all');setLimit(8);}}>{label}</button>)}</div>
        <div className="aftercare-filters">
          <label className="aftercare-search"><Search size={16}/><input type="search" aria-label="Rechercher un suivi de mission" placeholder="Client, action, réserve, ville…" value={query} onChange={event=>{setQuery(event.target.value);setLimit(8);}}/></label>
          <label>Échéance<select aria-label="Échéance du suivi" value={timing} disabled={state==='resolved'} onChange={event=>{setTiming(event.target.value);setLimit(8);}}><option value="all">Toutes</option><option value="overdue">En retard</option><option value="today">Aujourd’hui</option><option value="upcoming">À venir</option><option value="undated">Sans échéance valide</option><option value="incomplete">À compléter</option></select></label>
          <label>Responsable<select aria-label="Responsable du suivi" value={owner} onChange={event=>{setOwner(event.target.value);setLimit(8);}}><option value="all">Tous</option>{all.some(row=>!ownerName(row.booking.closure?.owner))&&<option value="__missing__">Non attribué</option>}{owners.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
          <label className="aftercare-kind-filter">Motif<select aria-label="Motif du suivi" value={kind} onChange={event=>{setKind(event.target.value);setLimit(8);}}><option value="all">Tous les motifs</option>{Object.entries(aftercareKindLabels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
        </div>
        {state!=='resolved'&&<div className="aftercare-priorities"><p>Suivis ouverts dans cette sélection</p><div>{[['overdue','En retard'],['today','Aujourd’hui'],['upcoming','À venir'],['incomplete','À compléter']].map(([id,label])=><button key={id} type="button" aria-pressed={timing===id} onClick={()=>{setTiming(timing===id?'all':id);setLimit(8);}}><strong>{timingCount(id)}</strong>{label}</button>)}</div><small>À compléter : responsable ou échéance manquants. Ces points peuvent aussi avoir une échéance en retard.</small></div>}
        <div className="aftercare-count"><span aria-live="polite">{rows.length} résultat(s)</span><button type="button" className="crm-quiet-action" onClick={reset}>Réinitialiser les filtres</button></div>
        {!rows.length?<div className="aftercare-empty"><ClipboardCheck size={24}/><strong>{all.length?'Aucun suivi dans cette sélection':'Aucun suivi après mission enregistré'}</strong><p>{all.length?'Changez les filtres pour retrouver les autres suivis.':'Les actions renseignées dans les comptes rendus apparaîtront ici.'}</p></div>:<div className="aftercare-list">{rows.slice(0,limit).map(row=>{
          const {booking,lead,bucket,resolved}=row,closure=booking.closure!,phoneLink=missionPhoneLink(lead?.phone);
          return <article key={booking.leadId} data-state={bucket}>
            <div className="aftercare-card-heading"><strong>{lead?.fullName||booking.clientName}</strong><span className="aftercare-badge" data-state={bucket}>{labels[bucket]}</span></div>
            {lead&&<p className="aftercare-route">{requestCity(lead.departureAddress)} → {requestCity(lead.arrivalAddress)}</p>}
            <div className="aftercare-reasons">{row.kinds.map(key=><span key={key}>{aftercareKindLabels[key as keyof typeof aftercareKindLabels]}</span>)}</div>
            <p className="aftercare-action"><small>Action enregistrée</small>{closure.followUp}</p>
            <div className="aftercare-meta"><span>Responsable : {ownerName(closure.owner)||'Non attribué'}</span><span>Échéance : {row.dueKnown?missionLocalTime(closure.due):'À préciser'}</span></div>
            {(row.reservations||row.missingDocuments||row.letterMissing)&&<details className="aftercare-detail"><summary>Points signalés au retour</summary>{row.reservations&&<p><b>Réserves ou incidents</b>{row.reservations}</p>}{row.letterMissing&&<p>Lettre de voiture signée à récupérer.</p>}{row.missingDocuments&&<p><b>Documents en attente</b>{row.missingDocuments}</p>}{resolved&&<small>Suivi marqué traité. Les observations d’origine sont conservées.</small>}</details>}
            <div className="aftercare-card-actions">{lead?<button type="button" className="crm-quiet-action" onClick={()=>onOpen(lead)}>{resolved?'Consulter le compte rendu':'Traiter le suivi'}<ArrowUpRight size={15}/></button>:<small>Dossier indisponible</small>}{phoneLink&&<a href={phoneLink}><Phone size={14}/>Appeler le client</a>}</div>
          </article>;
        })}</div>}
        {rows.length>limit&&<button type="button" className="crm-quiet-action" onClick={()=>setLimit(value=>value+8)}>Afficher plus ({rows.length-limit})</button>}
      </>}
    </div>
  </details>;
}
