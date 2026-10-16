import { useState, type ReactNode } from 'react';
import { ArrowUpRight, Search, Plus, CheckCircle2, Clock3 } from 'lucide-react';
import { workQueue, matchesWorkFilter } from '../../shared/crmWorkflow.mjs';
import { parisToday } from '../../shared/followUp.mjs';
import { requestCity } from '../../shared/requestCity.mjs';
import type { QuoteLead } from '../types/crm';
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
  onPrepare: (lead:QuoteLead,target:'summary'|'details'|'move'|'documents')=>void;
  onPlanning: ()=>void;
}) {
  const [filter, setFilter] = useState('all'),
    [query, setQuery] = useState(''),
    [limit, setLimit] = useState(12),[timing,setTiming]=useState('all'),[owner,setOwner]=useState('all');
  const today = parisToday();
  const available=loaded&&!error;
  const work=workQueue(leads,today);
  const responsible=(l:QuoteLead)=>l.moveFollowUp?{id:'mission:'+l.moveFollowUp.owner,name:l.moveFollowUp.owner}:{id:l.assigneeId||'',name:l.assigneeName||'Responsable enregistré'};
  const owners=Array.from(new Map(leads.map(responsible).filter(r=>r.id).map(r=>[r.id,r.name])).entries()).sort((a,b)=>a[1].localeCompare(b[1],'fr'));
  const counts=Object.fromEntries(['urgent','new','visit','planning','followup','aftercare'].map(key=>[key,work.filter((row:{lead:QuoteLead;step:{key:string};bucket:string})=>matchesWorkFilter(row,key,today)).length]));
  const queue = (work as {lead:QuoteLead;step:{priority:number;reason:string;label:string;target:string};bucket:string;date:string}[]).filter(
    row => {
      const {lead:l,bucket}=row;
      return (timing==='all'||timing===bucket)&&
      (owner==='all'||(owner==='unassigned'?!responsible(l).id:responsible(l).id===owner))&&
      matchesWorkFilter(row,filter,today)&&
      [
        l.fullName,
        l.email,
        l.phone,
        l.id,
        l.departureAddress,
        l.arrivalAddress,
      ].some((s) =>
        s
          ?.toLocaleLowerCase('fr')
          .includes(query.trim().toLocaleLowerCase('fr')),
      );
    },
  );
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
              setTiming('all');setOwner('all');setQuery('');
              setLimit(12);
            }}
          >
            <span>
              {label}
              <ArrowUpRight size={17} />
            </span>
            <strong>{available ? counts[id] : '—'}</strong>
            <small>Voir les dossiers</small>
          </button>
        ))}
      </div>
      <CrmTodayDepartures leads={leads} available={available} today={today} onOpen={onPrepare} onPlanning={onPlanning}/>
      <div className="crm-worklist">
        <div className="crm-worklist-head">
          <div>
            <h3>Votre liste de travail</h3>
            <p>Les actions en retard et du jour apparaissent en premier.</p>
          </div>
          <button
            className="crm-quiet-action"
            onClick={() => {
              setFilter('all');
              setQuery('');setTiming('all');setOwner('all');
              setLimit(12);
            }}
          >
            Tous les dossiers
          </button>
        </div>
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
        <div className="crm-work-timing"><label>Échéances<select aria-label="Filtrer les échéances" value={timing} onChange={e=>{setTiming(e.target.value);setLimit(12);}}><option value="all">Toutes les échéances</option><option value="overdue">En retard</option><option value="today">Aujourd’hui</option><option value="upcoming">À venir</option><option value="undated">Sans échéance</option></select></label><label>Responsable<select aria-label="Filtrer par responsable" value={owner} onChange={e=>{setOwner(e.target.value);setLimit(12);}}><option value="all">Tous les responsables</option><option value="unassigned">Non attribués</option>{owners.map(([id,name])=><option key={id} value={id}>{name}</option>)}</select></label><span aria-live="polite">{available?`${queue.length} dossier${queue.length>1?'s':''}`:error?'Dossiers non vérifiés':'Chargement…'}</span></div>
        {error ? <p className="p-6" role="status">La liste de travail n’est pas vérifiée. Utilisez l’actualisation en haut de page pour réessayer.</p> : !loaded ? (
          <p className="p-6" role="status">
            Chargement des dossiers…
          </p>
        ) : !queue.length ? (
          <div className="crm-work-empty">
            <CheckCircle2 size={28} />
            <h3>Aucun dossier dans cette sélection</h3>
            <p>
              {query||filter!=='all'||timing!=='all'||owner!=='all'?'Aucun dossier ne correspond à ces filtres. Affichez tous les dossiers pour élargir la sélection.':'Vos demandes et vos actions apparaîtront ici dès leur enregistrement.'}
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
              <div className="crm-work-reason"><span className="crm-work-badge" data-timing={bucket}>{bucket==='overdue'?'En retard':bucket==='today'?'Aujourd’hui':bucket==='upcoming'?'À venir':'Sans échéance'}</span>
                <small data-urgent={step.priority === 0}>
                  <Clock3 size={13} />
                  {step.reason}
                </small>
                <span>{responsible(lead).id?responsible(lead).name:'Responsable à définir'}</span>
              </div>
              <button
                className="crm-quiet-action"
                onClick={() => step.target==='invoice'&&!finance?onOpen(lead):onAction(lead, step.target)}
              >
                {step.target==='invoice'&&!finance?'Consulter le dossier':step.label}
                <ArrowUpRight size={15} />
              </button>
            </article>
          ))
        )}
        {available && queue.length > limit && (
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

