import { useState,useRef, type ReactNode } from 'react';
import {createCrmLeadMatcher} from '../../shared/crmSearch.mjs';
import {useCrmPlanningSnapshot} from '../hooks/useCrmPlanningSnapshot';
import {planningWorkQueue} from '../../shared/planningQueue.mjs';
import { ArrowUpRight, Search, Plus, CheckCircle2, Clock3 } from 'lucide-react';
import { matchesWorkFilter } from '../../shared/crmWorkflow.mjs';
import {dashboardWork,isWorkDueNow,dashboardResponsible} from '../../shared/dashboardWork.mjs';
import './crmTodayFocus.css';
import { parisToday } from '../../shared/followUp.mjs';
import { requestCity } from '../../shared/requestCity.mjs';
import type { QuoteLead,MovePreparationTarget } from '../types/crm';
import CrmTodayDepartures from './CrmTodayDepartures';
export default function CrmToday({
  leads,
  loaded,
  onOpen,
  onAction,
  onCreate,
  finance,
  error='',
  onPrepare,
  onPlanning,
}: {
  leads: QuoteLead[];
  loaded: boolean;
  onOpen: (l: QuoteLead) => void;
  onAction: (l: QuoteLead, target: string) => void;
  onCreate: () => void;
  finance?: ReactNode;
  error?: string;
  onPrepare: (lead:QuoteLead,target:MovePreparationTarget)=>void;
  onPlanning: ()=>void;
}) {
  const [filter, setFilter] = useState('all'),
    [query, setQuery] = useState(''),
    [limit, setLimit] = useState(12),[view,setView]=useState<'now'|'all'>('now'),[timing,setTiming]=useState('all'),[owner,setOwner]=useState('all');
  const today = parisToday();
  const available=loaded&&!error;
  const planning=useCrmPlanningSnapshot(leads,available);
  const planningRows=planning.data?planningWorkQueue(leads,planning.data.bookings,today):[];
  const worklist=useRef<HTMLDivElement>(null);
  const listAvailable=available&&(filter!=='planning'||!!planning.data);
  const listError=error||(filter==='planning'&&available?planning.error:'');
  const work=dashboardWork(leads,today);
  const matches=createCrmLeadMatcher(query);
  const responsible=dashboardResponsible;
  const owners=Array.from(new Map(leads.map(responsible).filter(r=>r.id).map(r=>[r.id,r.name])).entries()).sort((a,b)=>a[1].localeCompare(b[1],'fr'));
  const counts=Object.fromEntries(['urgent','new','visit','planning','followup','aftercare'].map(key=>[key,work.filter((row:{lead:QuoteLead;step:{key:string};bucket:string})=>matchesWorkFilter(row,key,today)).length]));
  counts.planning=planningRows.length;
  const selectedRows = ((filter==='planning'?planningRows:dashboardWork(leads,today,filter)) as {lead:QuoteLead;step:{key:string;priority:number;reason:string;label:string;target:string};bucket:string;date:string}[]).filter(
    row => {
      const {lead:l,bucket}=row;
      return (filter==='planning'||timing==='all'||timing===bucket)&&
      (owner==='all'||(owner==='unassigned'?!responsible(l).id:responsible(l).id===owner))&&
      matches(l);
    },
  );
  const nowRows=selectedRows.filter(isWorkDueNow);
  const queue=filter==='planning'||view==='all'?selectedRows:nowRows;
  return (
    <section className="crm-today">
      <header className="crm-today-heading">
        <div>
          <span className="crm-eyebrow">VOTRE JOURNÉE, SIMPLEMENT</span>
          <h2>
            Les bonnes actions.
            <br />
            <span>Au bon moment.</span>
          </h2>
          <p>
            {new Date().toLocaleDateString('fr-FR', {
              timeZone: 'Europe/Paris',
              weekday: 'long',
              day: 'numeric',
              month: 'long',
            })}{' '}
            · Vos dossiers enregistrés, vos priorités.
          </p>
        </div>
        <button className="requests-primary" onClick={onCreate}>
          <Plus size={17} />
          Nouvelle demande
        </button>
      </header>
      <div className="crm-priorities">
        {(
          [
            ['urgent', 'Actions à échéance'],
            ['new', 'Nouvelles demandes'],
            ['visit', 'Visites aujourd’hui'],
            ['planning', 'À planifier'],
            ['followup', 'Relances à organiser'],
            ['aftercare', 'Après déménagement'],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-pressed={filter === id}
            onClick={() => {
              setFilter(filter === id ? 'all' : id);
              setView('all');setTiming('all');setOwner('all');setQuery('');
              setLimit(12);
              window.requestAnimationFrame(()=>{worklist.current?.scrollIntoView({block:'start',behavior:'smooth'});worklist.current?.focus({preventScroll:true});});
            }}
          >
            <span>
              {label}
              <ArrowUpRight size={17} />
            </span>
            <strong>{available&&(id!=='planning'||planning.data) ? counts[id] : '—'}</strong>
            <small>Voir les dossiers</small>
          </button>
        ))}
      </div>
      <CrmTodayDepartures data={planning.data} loading={planning.loading} error={planning.error} onRetry={planning.retry} leads={leads} available={available} today={today} onOpen={onPrepare} onPlanning={onPlanning}/>
      <div ref={worklist} tabIndex={-1} className="crm-worklist" aria-label="Dossiers de la priorité sélectionnée" style={{scrollMarginTop:90}}>
        <div className="crm-worklist-head">
          <div>
            <h3>Votre liste de travail</h3>
            <p>{filter==='planning'?'Dossiers acceptés sans réservation active vérifiée. Une date souhaitée n’est pas une échéance de suivi.':view==='now'?'Actions en retard, du jour et dossiers actifs sans échéance. Les actions futures restent accessibles dans « Tout voir ».':'Tous les dossiers de cette sélection, avec les échéances futures et les dossiers terminés.'}</p>
          </div>
          <button
            className="crm-quiet-action"
            onClick={() => {
              setFilter('all');
              setView('all');setQuery('');setTiming('all');setOwner('all');
              setLimit(12);
            }}
          >
            Tous les dossiers
          </button>
        </div>
        {filter!=='planning'&&<nav className="crm-work-view" aria-label="Vue de la liste de travail"><button type="button" disabled={!listAvailable} aria-pressed={view==='now'} onClick={()=>{setView('now');setLimit(12);}}>À faire maintenant <span>{listAvailable?nowRows.length:'—'}</span></button><button type="button" disabled={!listAvailable} aria-pressed={view==='all'} onClick={()=>{setView('all');setLimit(12);}}>Tout voir <span>{listAvailable?selectedRows.length:'—'}</span></button></nav>}
        <label className="crm-global-search">
          <Search size={18} />
          <input
            aria-label="Rechercher dans les dossiers"
            placeholder="Client, téléphone, ville ou référence…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setLimit(12);
            }}
          />
        </label>
        <div className="crm-work-timing"><label>Échéances<select aria-label="Filtrer les échéances" disabled={filter==='planning'} title={filter==='planning'?'Les dates souhaitées se filtrent dans Réservations à organiser.':undefined} value={timing} onChange={e=>{setTiming(e.target.value);if(e.target.value==='upcoming')setView('all');setLimit(12);}}><option value="all">Toutes les échéances</option><option value="overdue">En retard</option><option value="today">Aujourd’hui</option><option value="upcoming">À venir</option><option value="undated">Sans échéance</option></select></label><label>Responsable<select aria-label="Filtrer par responsable" value={owner} onChange={e=>{setOwner(e.target.value);setLimit(12);}}><option value="all">Tous les responsables</option><option value="unassigned">Non attribués</option>{owners.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><span aria-live="polite">{listAvailable?`${queue.length} dossier${queue.length>1?'s':''}`:listError?'Dossiers non vérifiés':'Chargement…'}</span></div>
        {listError ? <div className="p-6" role="status">{error?'La liste de travail n’est pas vérifiée. Utilisez l’actualisation en haut de page pour réessayer.':'Les réservations ne sont pas vérifiées. Réessayez pour afficher les dossiers à planifier.'}{!error&&<button type="button" className="crm-quiet-action" onClick={planning.retry}>Revérifier les réservations</button>}</div> : !listAvailable ? (
          <p className="p-6" role="status">
            {filter==='planning'?'Vérification des réservations…':'Chargement des dossiers…'}
          </p>
        ) : !queue.length ? (
          <div className="crm-work-empty">
            <CheckCircle2 size={28} />
            <h3>Aucun dossier dans cette sélection</h3>
            <p>
              {view==='now'&&selectedRows.length?'Les autres actions de cette sélection sont accessibles dans « Tout voir ».':query||filter!=='all'||timing!=='all'||owner!=='all'?'Aucun dossier ne correspond à ces filtres. Affichez tous les dossiers pour élargir la sélection.':'Vos demandes et vos actions apparaîtront ici dès leur enregistrement.'}
            </p>
          </div>
        ) : (
          queue.slice(0, limit).map(({ lead, step,bucket }) => (
            <article key={lead.id} className="crm-work-row" data-timing={bucket}>
              <button className="crm-work-client" onClick={() => onOpen(lead)}>
                <strong>{lead.fullName}</strong>
                <span>
                  {requestCity(lead.departureAddress) || 'Départ à préciser'} →{' '}
                  {requestCity(lead.arrivalAddress) || 'Arrivée à préciser'}
                </span>
              </button>
              <div className="crm-work-reason"><span className="crm-work-badge" data-timing={bucket}>{filter==='planning'?'À organiser':bucket==='overdue'?'En retard':bucket==='today'?'Aujourd’hui':bucket==='upcoming'?'À venir':'Sans échéance'}</span>
                <small data-urgent={step.priority === 0}>
                  <Clock3 size={13} />
                  {step.reason}
                </small>
                <span>{responsible(lead).id?responsible(lead).name:'Responsable à définir'}</span>
              </div>
              <button
                className="crm-quiet-action"
                onClick={() => step.key==='aftercare'?onPrepare(lead,'closure'):step.target==='invoice'&&!finance?onOpen(lead):onAction(lead, step.target)}
              >
                {step.target==='invoice'&&!finance?'Consulter le dossier':step.label}
                <ArrowUpRight size={15} />
              </button>
            </article>
          ))
        )}
        {listAvailable && queue.length > limit && (
          <button
            className="crm-quiet-action m-5"
            onClick={() => setLimit(limit + 12)}
          >
            Afficher 12 dossiers supplémentaires
          </button>
        )}
      </div>
      {finance}
    </section>
  );
}

