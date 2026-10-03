import { useState, type ReactNode } from 'react';
import { ArrowUpRight, Search, Plus, CheckCircle2, Clock3 } from 'lucide-react';
import { workQueue } from '../../shared/crmWorkflow.mjs';
import { parisToday } from '../../shared/followUp.mjs';
import { requestCity } from '../../shared/requestCity.mjs';
import type { QuoteLead } from '../types/crm';
export default function CrmToday({
  leads,
  loaded,
  onOpen,
  onAction,
  onCreate,
  finance,
}: {
  leads: QuoteLead[];
  loaded: boolean;
  onOpen: (l: QuoteLead) => void;
  onAction: (l: QuoteLead, target: string) => void;
  onCreate: () => void;
  finance?: ReactNode;
}) {
  const [filter, setFilter] = useState('all'),
    [query, setQuery] = useState(''),
    [limit, setLimit] = useState(12),[timing,setTiming]=useState('all');
  const today = parisToday();
  const work=workQueue(leads,today);
  const counts = {
    all: leads.filter((l) => l.status !== 'refuse').length,
    urgent: work.filter((row:{bucket:string})=>['today','overdue'].includes(row.bucket)).length,
    new: leads.filter((l) => l.status === 'nouveau').length,
    visit: leads.filter(
      (l) =>
        l.visitDate?.slice(0, 10) === today && l.visitStatus !== 'effectuee' && !['refuse', 'termine'].includes(l.status),
    ).length,
    planning: leads.filter((l) => l.status === 'confirme' && !l.scheduledTime)
      .length,
  };
  const queue = (work as {lead:QuoteLead;step:{priority:number;reason:string;label:string;target:string};bucket:string;date:string}[]  ).filter(
    ({ lead: l,bucket }) =>
      (timing==='all'||timing===bucket)&&
      (filter === 'all' ||
        (filter === 'urgent' &&
          ['today', 'overdue'].includes(bucket)) ||
        (filter === 'new' && l.status === 'nouveau') ||
        (filter === 'visit' &&
          l.visitDate?.slice(0, 10) === today &&
          l.visitStatus !== 'effectuee' && !['refuse', 'termine'].includes(l.status)) ||
        (filter === 'planning' &&
          l.status === 'confirme' &&
          !l.scheduledTime)) &&
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
      ),
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
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            aria-pressed={filter === id}
            onClick={() => {
              setFilter(filter === id ? 'all' : id);
              setLimit(12);
            }}
          >
            <span>
              {label}
              <ArrowUpRight size={17} />
            </span>
            <strong>{loaded ? counts[id] : '—'}</strong>
            <small>Voir les dossiers</small>
          </button>
        ))}
      </div>
      {finance}
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
              setQuery('');setTiming('all');
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
        <div className="crm-work-timing"><label>Échéances<select aria-label="Filtrer les échéances" value={timing} onChange={e=>{setTiming(e.target.value);setLimit(12);}}><option value="all">Toutes les échéances</option><option value="overdue">En retard</option><option value="today">Aujourd’hui</option><option value="upcoming">À venir</option><option value="undated">Sans échéance</option></select></label><span aria-live="polite">{loaded?`${queue.length} dossier${queue.length>1?'s':''}`:'Chargement…'}</span></div>
        {!loaded ? (
          <p className="p-6" role="status">
            Chargement des dossiers…
          </p>
        ) : !queue.length ? (
          <div className="crm-work-empty">
            <CheckCircle2 size={28} />
            <h3>Aucun dossier dans cette sélection</h3>
            <p>
              Vos demandes et vos actions apparaîtront ici dès leur
              enregistrement.
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
                <span>{lead.assigneeName || 'Responsable à définir'}</span>
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
        {queue.length > limit && (
          <button
            className="crm-quiet-action m-5"
            onClick={() => setLimit(limit + 12)}
          >
            Afficher 12 dossiers supplémentaires
          </button>
        )}
      </div>
    </section>
  );
}

