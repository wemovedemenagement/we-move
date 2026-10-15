import {useState} from 'react';
import {ArrowUpRight,ClipboardCheck,Search} from 'lucide-react';
import type {MoveBooking,PlanningData} from '../services/crmService';
import type {QuoteLead} from '../types/crm';
import {aftercareQueue} from '../../shared/aftercareQueue.mjs';
import './crmAftercare.css';

const labels={overdue:'En retard',today:'Aujourd’hui',upcoming:'À venir',resolved:'Traité'};
const dateTime=(value:string)=>`${value.slice(8,10)}/${value.slice(5,7)}/${value.slice(0,4)} à ${value.slice(11)}`;
type Row={booking:MoveBooking;lead?:QuoteLead;resolved:boolean;bucket:keyof typeof labels};
export default function CrmAftercare({data,loading,error,leads,today,onOpen}:{data:PlanningData|null;loading:boolean;error:string;leads:QuoteLead[];today:string;onOpen:(lead:QuoteLead)=>void}) {
  const [state,setState]=useState('open'),[timing,setTiming]=useState('all'),[owner,setOwner]=useState('all'),[query,setQuery]=useState(''),[limit,setLimit]=useState(8);
  const ready=!!data&&!loading&&!error;
  const all=aftercareQueue(data?.bookings||[],leads,today,{state:'all'}) as Row[];
  const rows=aftercareQueue(data?.bookings||[],leads,today,{state,timing,owner,query}) as Row[];
  const owners=[...new Set(all.map(row=>row.booking.closure!.owner))].sort((a,b)=>a.localeCompare(b,'fr'));
  const openCount=all.filter(r=>!r.resolved).length;
  const reset=()=>{setState('open');setTiming('all');setOwner('all');setQuery('');setLimit(8);};
  return <details className="crm-aftercare">
    <summary><ClipboardCheck size={20}/><span>Après la mission<small>{ready?`${openCount} suivi${openCount>1?'s':''} à traiter · ${all.filter(r=>r.resolved).length} traité(s)`:'Suivis en cours de vérification'}</small></span></summary>
    <div className="aftercare-content">
      <p>Retrouvez les actions ouvertes et les suivis traités, indépendamment de la période du calendrier. Horaires de Paris.</p>
      {!ready?<p role={error?'alert':'status'}>{error?'Suivis indisponibles. Utilisez « Actualiser » pour réessayer.':'Chargement des suivis…'}</p>:<>
        <div className="aftercare-states" aria-label="État des suivis">{[['open','À traiter'],['resolved','Traités'],['all','Tous']].map(([id,label])=><button key={id} type="button" aria-pressed={state===id} onClick={()=>{setState(id);setTiming('all');setLimit(8);}}>{label}</button>)}</div>
        <div className="aftercare-filters">
          <label className="aftercare-search"><Search size={16}/><input aria-label="Rechercher un suivi de mission" placeholder="Client, action, ville…" value={query} onChange={e=>{setQuery(e.target.value);setLimit(8);}}/></label>
          <label>Échéance<select aria-label="Échéance du suivi" value={timing} disabled={state==='resolved'} onChange={e=>{setTiming(e.target.value);setLimit(8);}}><option value="all">Toutes</option><option value="overdue">En retard</option><option value="today">Aujourd’hui</option><option value="upcoming">À venir</option></select></label>
          <label>Responsable<select aria-label="Responsable du suivi" value={owner} onChange={e=>{setOwner(e.target.value);setLimit(8);}}><option value="all">Tous</option>{owners.map(name=><option key={name} value={name}>{name}</option>)}</select></label>
        </div>
        <div className="aftercare-count"><span aria-live="polite">{rows.length} résultat(s)</span><button type="button" className="crm-quiet-action" onClick={reset}>Réinitialiser les filtres</button></div>
        {!rows.length?<div className="aftercare-empty"><ClipboardCheck size={24}/><strong>{all.length?'Aucun suivi dans cette sélection':'Aucun suivi après mission enregistré'}</strong><p>{all.length?'Changez les filtres pour retrouver les autres suivis.':'Les actions renseignées dans les comptes rendus apparaîtront ici.'}</p></div>:<div className="aftercare-list">{rows.slice(0,limit).map(({booking,lead,bucket,resolved})=><article key={booking.leadId} data-state={bucket}>
          <div className="aftercare-card-heading"><strong>{booking.clientName}</strong><span className="aftercare-badge" data-state={bucket}>{labels[bucket]}</span></div>
          <p>{booking.closure!.followUp}</p><div className="aftercare-meta"><span>{booking.closure!.owner}</span><span>Échéance : {dateTime(booking.closure!.due)}</span></div>
          {lead?<button type="button" className="crm-quiet-action" onClick={()=>onOpen(lead)}>{resolved?'Consulter le compte rendu':'Traiter le suivi'}<ArrowUpRight size={15}/></button>:<small>Dossier indisponible</small>}
        </article>)}</div>}
        {rows.length>limit&&<button type="button" className="crm-quiet-action" onClick={()=>setLimit(v=>v+8)}>Afficher plus ({rows.length-limit})</button>}
      </>}
    </div>
  </details>;
}
