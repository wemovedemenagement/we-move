import {useState} from 'react';
import {Files,Search,ArrowUpRight} from 'lucide-react';
import {documentQueue,documentPriorityBuckets,documentTimingLabels} from '../../shared/documentQueue.mjs';
import {documentKinds} from '../../shared/documentChecklist.mjs';
import {requestCity} from '../../shared/requestCity.mjs';
import type {MoveBooking,PlanningData} from '../services/crmService';
import type {QuoteLead} from '../types/crm';
import './crmDocumentQueue.css';

const dateTime=(value:string)=>`${value.slice(8,10)}/${value.slice(5,7)}/${value.slice(0,4)} à ${value.slice(11)}`;
type Bucket=keyof typeof documentTimingLabels;
type Row={lead:QuoteLead;booking:MoveBooking|null;date:string;bucket:Bucket;issues:{key:string;label:string;state:'missing'|'stale'}[]};
export default function CrmDocumentQueue({leads,data,loading,error,today,onOpen}:{leads:QuoteLead[];data:PlanningData|null;loading:boolean;error:string;today:string;onOpen:(lead:QuoteLead)=>void}) {
  const [piece,setPiece]=useState('all'),[state,setState]=useState('all'),[timing,setTiming]=useState('all'),[owner,setOwner]=useState('all'),[query,setQuery]=useState(''),[limit,setLimit]=useState(8);
  const ready=!!data&&!loading&&!error;
  const all=documentQueue(leads,data?.bookings||[],today) as Row[];
  const rows=documentQueue(leads,data?.bookings||[],today,{piece,state,timing,owner,query}) as Row[];
  const owners=Array.from(new Map(all.filter(row=>row.lead.assigneeId).map(({lead})=>[lead.assigneeId!,lead.assigneeName||'Responsable enregistré'])).entries()).sort((a,b)=>a[1].localeCompare(b[1],'fr'));
  const priority=all.filter(row=>documentPriorityBuckets.includes(row.bucket)).length;
  const reset=()=>{setPiece('all');setState('all');setTiming('all');setOwner('all');setQuery('');setLimit(8);};
  const change=(set:(value:string)=>void,value:string)=>{set(value);setLimit(8);};
  return <details className="crm-document-queue"><summary><Files size={20}/><span>Pièces à réunir<small>{ready?`${all.length} dossier(s) à vérifier · ${priority} départ(s) proche(s) ou passé(s)`:'Pièces en cours de vérification'}</small></span></summary><div className="document-queue-content"><p>Devis signés et déclarations de valeur des dossiers acceptés. Les dates viennent des réservations ; les souhaits du client ne créent pas une échéance confirmée.</p>
    {!ready?<p role={error?'alert':'status'}>{error?'Pièces non vérifiées. Actualisez les données pour réessayer.':'Chargement des dossiers et des réservations…'}</p>:<>
      <div className="document-queue-counts"><span><strong>{all.filter(row=>row.issues.some(i=>i.state==='missing')).length}</strong> à réunir</span><span><strong>{all.filter(row=>row.issues.some(i=>i.state==='stale')).length}</strong> à revérifier</span><span><strong>{all.filter(row=>row.bucket==='unplanned').length}</strong> non planifiés</span></div>
      <p className="document-queue-hint">Compteurs en dossiers. Un même dossier peut avoir une pièce à réunir et une autre à revérifier.</p>
      <div className="document-queue-filters"><label className="document-queue-search"><Search size={16}/><input aria-label="Rechercher des pièces client" placeholder="Client, ville, référence…" value={query} onChange={e=>change(setQuery,e.target.value)}/></label><label>Pièce<select aria-label="Filtrer les pièces client" value={piece} onChange={e=>change(setPiece,e.target.value)}><option value="all">Toutes les pièces</option>{Object.entries(documentKinds).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>État<select aria-label="État des pièces client" value={state} onChange={e=>change(setState,e.target.value)}><option value="all">À traiter</option><option value="missing">À réunir</option><option value="stale">À revérifier</option></select></label><label>Départ<select aria-label="Proximité du départ pour les pièces" value={timing} onChange={e=>change(setTiming,e.target.value)}><option value="all">Tous les dossiers</option><option value="priority">Départs proches ou passés</option>{Object.entries(documentTimingLabels).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label>Responsable<select aria-label="Responsable des pièces client" value={owner} onChange={e=>change(setOwner,e.target.value)}><option value="all">Tous les responsables</option><option value="unassigned">Non attribués</option>{owners.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label></div>
      <div className="document-queue-results"><span aria-live="polite">{rows.length} dossier(s)</span><button type="button" className="crm-quiet-action" onClick={reset}>Réinitialiser les filtres</button></div>
      {!rows.length?<p className="document-queue-empty">{all.length?'Aucun dossier ne correspond à ces filtres.':'Aucune pièce à réunir ou à revérifier dans les dossiers acceptés.'}</p>:<div className="document-queue-list">{rows.slice(0,limit).map(row=><article key={row.lead.id}><div className="document-queue-card-heading"><strong>{row.lead.fullName}</strong><span data-priority={documentPriorityBuckets.includes(row.bucket)}>{documentTimingLabels[row.bucket]}</span></div><p>{requestCity(row.lead.departureAddress)||'Départ à préciser'} → {requestCity(row.lead.arrivalAddress)||'Arrivée à préciser'}</p><p>{row.booking?`Créneau : ${dateTime(row.booking.start)} → ${dateTime(row.booking.end)}`:'Aucune réservation active confirmée.'}</p><ul>{row.issues.map(issue=><li key={issue.key}><span data-state={issue.state}>{issue.state==='stale'?'À revérifier':'À réunir'}</span>{issue.label}</li>)}</ul><div className="document-queue-card-footer"><small>{row.lead.assigneeName||'Responsable à définir'}</small><button type="button" className="crm-quiet-action" onClick={()=>onOpen(row.lead)}>Vérifier les pièces<ArrowUpRight size={14}/></button></div></article>)}</div>}
      {rows.length>limit&&<button type="button" className="crm-quiet-action" onClick={()=>setLimit(v=>v+8)}>Afficher plus de dossiers ({rows.length-limit})</button>}
    </>}
  </div></details>;
}
