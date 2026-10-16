import CrmDocumentQueue from './CrmDocumentQueue';
import CrmAftercare from './CrmAftercare';
import CrmDepartureReadiness from './CrmDepartureReadiness';
import CrmAvailability from './CrmAvailability';
import {absenceLabels} from '../../shared/resourceAvailability.mjs';
import {movePreparation} from '../../shared/movePreparation.mjs';
import { useEffect, useRef, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Truck,
  ArrowUpRight,
} from 'lucide-react';
import { fetchPlanning, type PlanningData } from '../services/crmService';
import { parisToday } from '../../shared/followUp.mjs';
import { calendarDays,shiftCalendar } from '../../shared/visitCalendar.mjs';
import { requestCity } from '../../shared/requestCity.mjs';
import type { QuoteLead } from '../types/crm';
export default function CrmPlanning({
  leads,
  onOpen,
  onFollowUp,
  onPrepare,
}: {
  leads: QuoteLead[];
  onOpen: (lead: QuoteLead) => void;
  onFollowUp: (lead: QuoteLead) => void;
  onPrepare: (lead: QuoteLead,target:'summary'|'details'|'move'|'documents') => void;
}) {
  const [day, setDay] = useState(parisToday()),
    [resource, setResource] = useState('all'),
    [data, setData] = useState<PlanningData | null>(null),
    [error, setError] = useState(''),
    [loading,setLoading] = useState(true),
    [syncedAt,setSyncedAt] = useState('');
  const [view,setView]=useState<'week'|'month'|'list'>('week'),[status,setStatus]=useState('active'),[selectedDay,setSelectedDay]=useState<string|null>(null);
  const [preparationOnly,setPreparationOnly]=useState(false);
  const today=parisToday();
  const days=calendarDays(day,view==='month'?'month':'week') as string[];
  const requestId=useRef(0);
  const load = async () => {
    const id=++requestId.current;setLoading(true);
    try {
      const result=await fetchPlanning();
      if(id!==requestId.current)return;
      setData(result);
      setError('');
      setSyncedAt(new Date().toLocaleTimeString('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit'}));
    } catch (e) {
      if(id!==requestId.current)return;
      setError(e instanceof Error ? e.message : 'Planning indisponible.');
    } finally {
      if(id===requestId.current)setLoading(false);
    }
  };
  useEffect(() => {
    void load();
    return ()=>{requestId.current++;};
  }, [leads]);
  const stateOf=(b:PlanningData['bookings'][number])=>b.cancelled?'closed':leads.find(l=>l.id===b.leadId)?.status==='termine'?'done':b.end<today+'T00:00'?'review':'scheduled';
  const labels={scheduled:'Programmé',done:'Effectué',review:'À vérifier',closed:'Annulé'};
  const allBookings=(data?.bookings||[]).filter(b=>(resource==='all'||b.resourceIds.includes(resource))&&(status==='all'||status==='active'&&!b.cancelled||stateOf(b)===status)).sort((a,b)=>a.start.localeCompare(b.start));
  const overlaps=(b:{start:string;end:string},date:string)=>{const next=new Date(date+'T12:00:00Z');next.setUTCDate(next.getUTCDate()+1);return b.start<next.toISOString().slice(0,10)+'T00:00'&&b.end>date+'T00:00';};
  const checks=(b:PlanningData['bookings'][number]):string[]=>data?movePreparation(leads.find(l=>l.id===b.leadId),b,data.registry):[];
  const absences=(data?.registry.resources||[]).filter(r=>resource==='all'||r.id===resource).flatMap(r=>(r.unavailablePeriods||[]).map((p,i)=>({...p,id:r.id+'-'+i,name:r.name})));
  const periodAbsences=absences.filter(p=>days.some(d=>overlaps(p,d)));
  const periodBookings=allBookings.filter(b=>days.some(d=>overlaps(b,d)));
  const preparationCount=periodBookings.filter(b=>checks(b).length>0).length;
  const bookings=periodBookings.filter(b=>!preparationOnly||checks(b).length>0);
  const shown=selectedDay?bookings.filter(b=>overlaps(b,selectedDay)):bookings;
  const formatDay=(date:string)=>new Date(date+'T12:00:00Z').toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric',timeZone:'UTC'});
  const waiting = leads.filter(
      (l) => l.status === 'confirme' && !l.scheduledTime,
    ),
    legacy = leads.filter(
      (l) =>
        l.scheduledTime &&
        l.status === 'confirme' &&
        !data?.bookings.some((b) => b.leadId === l.id && !b.cancelled),
    );
  return (
    <section className="space-y-5 crm-visits crm-move-calendar" aria-label="Planning des déménagements">
      <header className="crm-worklist-head">
        <div>
          <span className="crm-eyebrow">VOTRE ORGANISATION TERRAIN</span>
          <h2>Déménagements</h2>
          <p>Vos missions, vos équipes et vos véhicules, dans un agenda partagé.</p>
        </div>
        <button className="crm-quiet-action" disabled={loading} onClick={() => void load()}>
          <RefreshCw size={15} />
          {loading?'Actualisation…':'Actualiser'}
        </button>
      </header>
      <CrmDepartureReadiness data={data} loading={loading} error={error} leads={leads} today={today} onOpen={onPrepare}/>
      <CrmDocumentQueue data={data} loading={loading} error={error} leads={leads} today={today} onOpen={lead=>onPrepare(lead,'documents')}/>
      <CrmAftercare data={data} loading={loading} error={error} leads={leads} today={today} onOpen={onFollowUp}/>
      <CrmAvailability data={data} loading={loading} error={error} day={selectedDay||day} leads={leads} onOpen={onOpen}/>
      {error && (
        <p role="alert" className="text-rose-700">
          {error} {data?'Les dernières réservations reçues restent affichées ; elles peuvent être anciennes.':'Aucune réservation ne peut être vérifiée pour le moment.'}
        </p>
      )}
      {syncedAt&&<p className="text-xs text-slate-500">Dernière synchronisation du planning : {syncedAt} · heure de Paris</p>}
      <div className="visit-calendar-shell">
        <div className="visit-calendar-toolbar"><div><p className="crm-eyebrow">VOTRE PLANNING</p><h3>{view==='month'?new Date(day+'T12:00:00Z').toLocaleDateString('fr-FR',{month:'long',year:'numeric',timeZone:'UTC'}):`${formatDay(days[0])} — ${formatDay(days[6])}`}</h3></div><div className="visit-calendar-controls"><button aria-label="Période précédente" onClick={()=>{setDay(shiftCalendar(day,view==='month'?'month':'week',-1));setSelectedDay(null);}}><ChevronLeft size={18}/></button><button onClick={()=>{setDay(today);setSelectedDay(null);}}>Aujourd’hui</button><button aria-label="Période suivante" onClick={()=>{setDay(shiftCalendar(day,view==='month'?'month':'week',1));setSelectedDay(null);}}><ChevronRight size={18}/></button><div className="visit-calendar-switch" aria-label="Vue des déménagements">{([['week','Semaine'],['month','Mois'],['list','Liste']] as const).map(([id,label])=><button key={id} aria-pressed={view===id} onClick={()=>{setView(id);setSelectedDay(null);}}>{label}</button>)}</div></div></div>
        <div className="move-calendar-filters"><label>Date repère<input type="date" value={day} onChange={e=>{if(/^\d{4}-\d{2}-\d{2}$/.test(e.target.value)&&Number.isFinite(Date.parse(e.target.value))){setDay(e.target.value);setSelectedDay(null);}}}/></label><label>Ressource<select aria-label="Ressource" value={resource} onChange={e=>setResource(e.target.value)}><option value="all">Toutes les équipes et véhicules</option>{data?.registry.resources.map(r=><option key={r.id} value={r.id}>{r.name}</option>)}</select></label><label>État<select aria-label="État des déménagements" value={status} onChange={e=>setStatus(e.target.value)}><option value="active">Hors annulations</option><option value="all">Tous les états</option>{Object.entries(labels).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label></div>
        {data&&<div className="move-preparation-toolbar"><div><strong>{preparationCount} mission{preparationCount>1?'s':''} à compléter</strong><p>Sur la période et les filtres choisis · coordonnées, volume et affectations enregistrées.</p></div><button type="button" aria-pressed={preparationOnly} onClick={()=>{setPreparationOnly(!preparationOnly);setSelectedDay(null);}}>{preparationOnly?'Afficher toutes les missions':'Voir les points à compléter'}</button></div>}
        <div className="visit-calendar-legend">{Object.entries(labels).map(([id,label])=><span key={id} data-state={id}>{label}</span>)}</div>
        {data&&view!=='list'&&<div className={'visit-calendar-grid is-'+view} aria-label={view==='week'?'Calendrier hebdomadaire des déménagements':'Calendrier mensuel des déménagements'}>{days.map(date=>{const events=bookings.filter(b=>overlaps(b,date));const dayAbsences=absences.filter(p=>overlaps(p,date));const absenceLimit=view==='month'?2:4;return <div className="visit-calendar-day" key={date} data-today={date===today} data-outside={view==='month'&&date.slice(0,7)!==day.slice(0,7)} data-selected={date===selectedDay}><button className="visit-calendar-date" aria-label={'Missions du '+formatDay(date)} aria-pressed={selectedDay===date} onClick={()=>setSelectedDay(selectedDay===date?null:date)}><span>{new Date(date+'T12:00:00Z').toLocaleDateString('fr-FR',{weekday:'short',timeZone:'UTC'})}</span><strong>{Number(date.slice(-2))}</strong>{events.length>0&&<small>{events.length}</small>}</button><div className="visit-calendar-events">{dayAbsences.slice(0,absenceLimit).map(p=><div className="resource-absence-event" key={p.id}><strong>{p.name}</strong><span>{absenceLabels[p.reason]} · {p.start.slice(0,10)===date?p.start.slice(11):'En cours'}{p.end.slice(0,10)===date?' → '+p.end.slice(11):''}</span></div>)}{dayAbsences.length>absenceLimit&&<button className="visit-calendar-more" onClick={()=>setSelectedDay(date)}>+ {dayAbsences.length-absenceLimit} indisponibilité(s)</button>}{events.slice(0,view==='month'?3:events.length).map(b=>{const lead=leads.find(l=>l.id===b.leadId);return <button className="visit-calendar-event" key={b.leadId} data-state={stateOf(b)} disabled={!lead} aria-label={`${b.clientName}, ${formatDay(date)}, ${labels[stateOf(b)]}`} onClick={()=>{if(lead)onOpen(lead);}}><span>{b.start.slice(0,10)===date?b.start.slice(11,16):'Suite de mission'} · {labels[stateOf(b)]}</span><strong>{b.clientName}</strong><span className="move-calendar-badge">{labels[stateOf(b)]}</span><small>{lead?requestCity(lead.departureAddress)+' → '+requestCity(lead.arrivalAddress):'Dossier indisponible'}</small><small>{b.resources.map(r=>r.name).join(' · ')||'Ressources à préciser'}</small>{checks(b).length>0&&<small className="move-preparation-badge">{checks(b).length} point(s) à compléter</small>}</button>;})}{view==='month'&&events.length>3&&<button className="visit-calendar-more" onClick={()=>setSelectedDay(date)}>+ {events.length-3} missions</button>}</div></div>;})}</div>}
        {data&&periodAbsences.length>0&&<details className="resource-absence-summary"><summary>{periodAbsences.length} indisponibilité(s) sur la période</summary>{periodAbsences.map(p=><p key={p.id}><strong>{p.name}</strong> · {absenceLabels[p.reason]} · {formatDay(p.start.slice(0,10))} {p.start.slice(11)} → {formatDay(p.end.slice(0,10))} {p.end.slice(11)}</p>)}</details>}
        {data&&<p className="move-calendar-count">{bookings.length} mission(s) sur cette période · Une mission de plusieurs jours apparaît sur chaque journée concernée.</p>}
      </div>
      {selectedDay&&absences.some(p=>overlaps(p,selectedDay))&&<section className="resource-absence-summary" aria-label="Indisponibilités du jour sélectionné"><h3>Indisponibilités du {formatDay(selectedDay)}</h3>{absences.filter(p=>overlaps(p,selectedDay)).map(p=><p key={p.id}><strong>{p.name}</strong> · {absenceLabels[p.reason]} · {formatDay(p.start.slice(0,10))} {p.start.slice(11)} → {formatDay(p.end.slice(0,10))} {p.end.slice(11)}</p>)}</section>}
      {selectedDay&&view!=='list'&&<h3 className="visit-selected-heading">Missions du {formatDay(selectedDay)}</h3>}
      {!data ? (
        <p role="status">{error?'Réservations indisponibles. Utilisez Actualiser pour réessayer.':'Chargement des réservations…'}</p>
      ) : !bookings.length ? (
        <div className="crm-work-empty">
          <Truck size={30} />
          <h3>{preparationOnly?'Aucune mission à compléter dans cette sélection':'Aucune réservation sur cette période'}</h3>
          <p>{preparationOnly?'Ces repères ne remplacent pas la vérification opérationnelle de chaque mission.':'Les missions confirmées apparaîtront ici.'}</p>
        </div>
      ) : (view==='list'||selectedDay) ? (
        <div className="crm-worklist">
          {shown.map((b) => (
            <article key={b.leadId} className="crm-work-row move-calendar-row" data-state={stateOf(b)}>
              <div>
                <strong>{b.clientName}</strong>
                <p className="mt-2 text-sm">
                  {formatDay(b.start.slice(0,10))} à {b.start.slice(11,16)} → {formatDay(b.end.slice(0,10))} à {b.end.slice(11,16)}
                </p>
              </div>
              {checks(b).length>0&&<ul className="move-preparation-points" aria-label={'Points à compléter pour '+b.clientName}>{checks(b).map(point=><li key={point}>{point}</li>)}</ul>}
              <div className="crm-booking-tags">
                {b.resources.map((r) => (
                  <span key={r.id}>{r.name}</span>
                ))}
              </div>
              <button
                className="crm-quiet-action"
                disabled={!leads.some((l) => l.id === b.leadId)}
                onClick={() => {
                  const l = leads.find((l) => l.id === b.leadId);
                  if (l) onOpen(l);
                }}
              >
                Ouvrir le dossier
                <ArrowUpRight size={15} />
              </button>
            </article>
          ))}
        </div>
      ) : null}
      {data && legacy.length > 0 && (
        <div className="crm-surface border p-5">
          <h3>Affectations existantes à confirmer</h3>
          <p className="mt-2 text-sm text-slate-500">
            Ces saisies anciennes ne réservent pas encore les ressources du
            registre. Vérifiez-les avant de confirmer de nouvelles missions.
          </p>
          {legacy.map((l) => (
            <button
              key={l.id}
              className="crm-quiet-action mt-3 mr-3"
              onClick={() => onOpen(l)}
            >
              {l.fullName} · {l.assignedTruckName}
            </button>
          ))}
        </div>
      )}
      <div className="crm-worklist">
        <div className="crm-worklist-head">
          <h3>
            À planifier <span className="text-slate-500">{waiting.length}</span>
          </h3>
        </div>
        {waiting.length ? (
          waiting.map((l) => (
            <article key={l.id} className="crm-work-row">
              <div>
                <strong>{l.fullName}</strong>
                <p className="mt-2 text-sm text-slate-500">
                  {requestCity(l.departureAddress)} →{' '}
                  {requestCity(l.arrivalAddress)} ·{' '}
                  {l.moveDate || 'Date à convenir'}
                </p>
              </div>
              <button className="crm-quiet-action" onClick={() => onOpen(l)}>
                Ouvrir le dossier
                <ArrowUpRight size={15} />
              </button>
            </article>
          ))
        ) : (
          <p className="p-5 text-sm text-slate-500">
            Tous les dossiers acceptés ont un créneau renseigné.
          </p>
        )}
      </div>
    </section>
  );
}
