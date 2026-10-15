import {useMemo,useState} from 'react';
import {CalendarSearch,ArrowUpRight,Truck,Users,ArrowUpFromLine} from 'lucide-react';
import type {PlanningData,CrmResource,MoveBooking,ResourceAbsence} from '../services/crmService';
import type {QuoteLead} from '../types/crm';
import {planningAvailability} from '../../shared/planningAvailability.mjs';
import {absenceLabels} from '../../shared/resourceAvailability.mjs';

const kinds={person:'Équipiers',vehicle:'Véhicules',lift:'Monte-meubles'};
const states={available:'Libre sur tout le créneau',busy:'Déjà réservé',unavailable:'Indisponible',inactive:'Désactivé'};
const dateTime=(value:string)=>`${value.slice(8,10)}/${value.slice(5,7)}/${value.slice(0,4)} à ${value.slice(11)}`;
export default function CrmAvailability({data,loading,error,day,leads,onOpen}:{data:PlanningData|null;loading:boolean;error:string;day:string;leads:QuoteLead[];onOpen:(lead:QuoteLead)=>void}){
 const [start,setStart]=useState(day+'T08:00'),[end,setEnd]=useState(day+'T18:00'),[kind,setKind]=useState('all'),[onlyFree,setOnlyFree]=useState(false),[limit,setLimit]=useState(12);
 const result=useMemo<{valid:boolean;rows:{resource:CrmResource;reservations:MoveBooking[];absences:ResourceAbsence[];state:keyof typeof states}[]}>(()=>planningAvailability(data?.registry.resources||[],data?.bookings||[],start,end),[data,start,end]);
 const ready=!!data&&!loading&&!error&&result.valid;
 const rows=result.rows.filter(row=>(kind==='all'||row.resource.kind===kind)&&(!onlyFree||row.state==='available'));
 const change=()=>setLimit(12);
 return <details className="crm-availability">
  <summary><span className="availability-symbol"><CalendarSearch size={22}/></span><span><strong>Qui est disponible ?</strong><small>Vérifier une équipe ou un véhicule sur un créneau</small></span></summary>
  <div className="availability-body">
   <div className="availability-period"><label>Début du créneau<input aria-label="Début du créneau à vérifier" type="datetime-local" value={start} onChange={e=>{setStart(e.target.value);change();}}/></label><label>Fin du créneau<input aria-label="Fin du créneau à vérifier" type="datetime-local" value={end} min={start} onChange={e=>{setEnd(e.target.value);change();}}/></label><button type="button" className="crm-quiet-action" onClick={()=>{setStart(day+'T08:00');setEnd(day+'T18:00');change();}}>Reprendre la date du calendrier</button></div>
   <p className="availability-hint">Heure de Paris · Incluez la préparation et les trajets. Toutes les réservations sont prises en compte, quels que soient les filtres du calendrier.</p>
   {loading?<p role="status">Actualisation des disponibilités…</p>:error?<p role="alert">Disponibilités non vérifiées. Utilisez « Actualiser » pour réessayer.</p>:!data?<p role="status">Chargement du registre…</p>:!result.valid?<p role="alert">Choisissez un début et une fin valides, avec une fin après le début.</p>:null}
   {ready&&<>
    <div className="availability-totals">{Object.entries(kinds).map(([key,label])=>{const active=result.rows.filter(r=>r.resource.kind===key&&r.resource.active);const free=active.filter(r=>r.state==='available').length;const Icon=key==='person'?Users:key==='vehicle'?Truck:ArrowUpFromLine;return <div key={key}><Icon size={19}/><span><strong>{free}<small> / {active.length}</small></strong><span>{label} libres</span></span></div>;})}</div>
    <div className="availability-filters"><label>Afficher<select aria-label="Type de ressource à vérifier" value={kind} onChange={e=>{setKind(e.target.value);change();}}><option value="all">Toutes les ressources</option>{Object.entries(kinds).map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></label><label className="availability-check"><input type="checkbox" checked={onlyFree} onChange={e=>{setOnlyFree(e.target.checked);change();}}/>Uniquement les ressources libres</label><span aria-live="polite">{rows.length} ressource{rows.length>1?'s':''}</span></div>
    {!data.registry.resources.length?<p className="availability-empty">Ajoutez vos ressources dans « Équipes et flotte » pour vérifier leurs disponibilités.</p>:!rows.length?<p className="availability-empty">Aucune ressource ne correspond à ces critères. Modifiez le créneau ou les filtres.</p>:<div className="availability-list">{rows.slice(0,limit).map(row=><article key={row.resource.id} data-state={row.state}>
     <div className="availability-resource"><div><strong>{row.resource.name}</strong><p>{kinds[row.resource.kind as keyof typeof kinds]}{row.resource.detail?' · '+row.resource.detail:''}</p></div><span className="availability-state">{states[row.state as keyof typeof states]}</span></div>
     {!!(row.absences.length+row.reservations.length)&&<details className="availability-reasons"><summary>Voir {row.absences.length+row.reservations.length} contrainte(s) sur ce créneau</summary>{row.absences.map((p,i)=><p key={'a'+i}><strong>{absenceLabels[p.reason as keyof typeof absenceLabels]}</strong> · {dateTime(p.start)} → {dateTime(p.end)}</p>)}{row.reservations.map(b=>{const lead=leads.find(l=>l.id===b.leadId);return <div key={b.leadId}><p><strong>{b.clientName}</strong> · {dateTime(b.start)} → {dateTime(b.end)}</p>{lead&&<button type="button" className="crm-quiet-action" onClick={()=>onOpen(lead)}>Ouvrir le dossier<ArrowUpRight size={14}/></button>}</div>;})}</details>}
    </article>)}</div>}
    {rows.length>limit&&<button type="button" className="crm-quiet-action" onClick={()=>setLimit(n=>n+12)}>Afficher plus ({rows.length-limit} restantes)</button>}
    <p className="availability-hint">Les compteurs concernent les ressources actives du registre. La disponibilité est contrôlée à nouveau lors de l’enregistrement de la mission.</p>
   </>}
  </div>
 </details>;
}
