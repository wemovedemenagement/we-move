import {useState} from 'react';
import {ClipboardCheck,ArrowUpRight} from 'lucide-react';
import type {MoveBooking,PlanningData} from '../services/crmService';
import type {QuoteLead,MovePreparationTarget} from '../types/crm';
import {departureReadiness} from '../../shared/departureReadiness.mjs';
import './crmDepartureReadiness.css';
type Target=MovePreparationTarget;
type Row={booking:MoveBooking;lead?:QuoteLead;issues:{label:string;target:Target}[]};
const groups:{label:string;targets:Target[]}[]=[
  {label:'Dossier client',targets:['summary','details']},
  {label:'Équipe et véhicule',targets:['team']},
  {label:'Organisation du départ',targets:['preparation','move']},
  {label:'Pièces client',targets:['documents']},
];
const dateTime=(value:string)=>`${value.slice(8,10)}/${value.slice(5,7)} à ${value.slice(11)}`;
export default function CrmDepartureReadiness({data,loading,error,leads,today,onOpen,initiallyOpen=false}:{data:PlanningData|null;loading:boolean;error:string;leads:QuoteLead[];today:string;onOpen:(lead:QuoteLead,target:Target)=>void;initiallyOpen?:boolean}) {
  const [days,setDays]=useState(7),[onlyIncomplete,setOnlyIncomplete]=useState(true),[limit,setLimit]=useState(6);
  const ready=data&&!loading&&!error;
  const all=(data?departureReadiness(leads,data.bookings,data.registry,today,days):[]) as Row[];
  const incomplete=all.filter(row=>row.issues.length>0),rows=onlyIncomplete?incomplete:all;
  return <details className="crm-departure-readiness" open={initiallyOpen||undefined}><summary><ClipboardCheck size={20}/><span>Avant le départ<small>{ready?`${incomplete.length} mission(s) à compléter sur ${all.length} · ${days===1?'aujourd’hui':days+' prochains jours'}`:'Préparation en cours de vérification'}</small></span></summary>
    <div className="departure-content"><p>Vérifiez les informations et les moyens des missions à venir ou en cours. Ces repères ne remplacent pas la validation terrain.</p>
      {!ready?<p role={error?'alert':'status'}>{error?'Préparation non vérifiée. Utilisez « Actualiser » pour réessayer.':'Chargement des missions…'}</p>:<>
        <div className="departure-filters"><label>Période<select aria-label="Période de préparation" value={days} onChange={e=>{setDays(Number(e.target.value));setLimit(6);}}><option value={1}>Aujourd’hui</option><option value={7}>7 prochains jours</option><option value={30}>30 prochains jours</option></select></label><label><input type="checkbox" checked={onlyIncomplete} onChange={e=>{setOnlyIncomplete(e.target.checked);setLimit(6);}}/>Uniquement les missions à compléter</label></div>
        <div className="departure-counts"><span><strong>{all.length}</strong> missions</span><span><strong>{incomplete.length}</strong> à compléter</span><span><strong>{all.length-incomplete.length}</strong> sans point manquant détecté</span></div>
        {!rows.length?<p className="departure-empty">{all.length?'Aucune mission à compléter sur cette période.':'Aucune mission active sur cette période.'}</p>:<div className="departure-list">{rows.slice(0,limit).map(({booking,lead,issues})=><article key={booking.leadId} data-incomplete={!!issues.length}><div className="departure-heading"><strong>{booking.clientName}</strong><span>{issues.length?`${issues.length} point(s) à vérifier`:'Informations renseignées'}</span></div><p>{dateTime(booking.start)} → {dateTime(booking.end)}</p>
          {!!issues.length&&<div className="departure-check-groups">{groups.map(group=>{
            const checks=issues.filter(issue=>group.targets.includes(issue.target));
            return checks.length>0&&<section className="departure-check-group" key={group.label} aria-label={group.label}><h4>{group.label}<span>{checks.length}</span></h4><ul>{checks.map(issue=><li key={issue.label}>{lead?<button type="button" onClick={()=>onOpen(lead,issue.target)}>{issue.label}<ArrowUpRight size={14} aria-hidden="true"/></button>:<span>{issue.label}</span>}</li>)}</ul></section>;
          })}</div>}
          <div className="departure-actions">{lead?<>{issues.some(i=>i.target==='details')&&<button type="button" className="crm-quiet-action" onClick={()=>onOpen(lead,'details')}>Compléter le dossier<ArrowUpRight size={14}/></button>}{issues.some(i=>i.target==='summary')&&<button type="button" className="crm-quiet-action" onClick={()=>onOpen(lead,'summary')}>Vérifier le dossier<ArrowUpRight size={14}/></button>}<button type="button" className="crm-quiet-action" onClick={()=>onOpen(lead,'move')}>Préparer la mission<ArrowUpRight size={14}/></button></>:<small>Le dossier n’est pas disponible dans la liste actuelle.</small>}</div>
        </article>)}</div>}
        {rows.length>limit&&<button type="button" className="crm-quiet-action" onClick={()=>setLimit(v=>v+6)}>Afficher plus de missions ({rows.length-limit})</button>}
      </>}
    </div>
  </details>;
}
