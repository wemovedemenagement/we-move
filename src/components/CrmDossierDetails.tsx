import CrmDossierOverview from './CrmDossierOverview';
import {documentChecklistIssues} from '../../shared/documentChecklist.mjs';
import {dossierStages} from '../../shared/dossierStages.mjs';
import {dossierAction} from '../../shared/dossierWorkflow.mjs';
import { useEffect, useState } from 'react';
import {
  FileText,
  CalendarDays,
  Truck,
  Receipt,
  Download,
  RefreshCw,
  Check,
  Circle,
  AlertCircle,
} from 'lucide-react';
import {
  fetchCrmDossier,
  downloadCrmPdf,
  downloadQuoteMailPdf,
  billingPdf,
  type CrmDossier,
  type CrmPdfType,
} from '../services/crmService';
export default function CrmDossierDetails({
  id,
  version,
  onVisit, onEdit, onFollowUp, onContact,
  onQuote,
  onMove,
  onDocuments,
  onInvoice,
  canInvoice,
}: {
  id: string;
  version: string;
  onVisit:()=>void; onEdit:()=>void; onFollowUp:()=>void; onContact:()=>void;
  onQuote: () => void;
  onMove: () => void;
  onDocuments:()=>void;
  onInvoice: () => void;
  canInvoice: boolean;
}) {
  const [data, setData] = useState<CrmDossier | null>(null),
    [error, setError] = useState(''),
    [busy, setBusy] = useState(false),
    [reload, setReload] = useState(0),[loading,setLoading]=useState(true);
  useEffect(() => {
    let alive = true;
    setError('');setData(null);setLoading(true);
    fetchCrmDossier(id)
      .then((d) => {
        if (alive) {setData(d);setLoading(false);}
      })
      .catch((e) => {
        if (alive) {setError(e.message);setLoading(false);}
      });
    return () => {
      alive = false;
    };
  }, [id, version, reload]);
  const download = async (type: CrmPdfType) => {
    if (!data?.quote || busy) return;
    setBusy(true);
    setError('');
    try {
      await downloadCrmPdf(data.quote.id, type);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Téléchargement impossible.');
    } finally {
      setBusy(false);
    }
  };
  const action=data?dossierAction(data,canInvoice):null;
  const actions:Record<string,()=>void>={quote:onQuote,visit:onVisit,move:onMove,documents:onDocuments,invoice:onInvoice,followup:onFollowUp,contact:onContact};
  const stages=data?dossierStages(data,canInvoice):[];
  const stageActions:Record<string,()=>void>={visit:onVisit,quote:onQuote,acceptance:onEdit,move:onMove,invoice:onInvoice};
  const events = data
    ? [
        ...(data.lead.internalNotes || []).map((n) => ({
          id: n.id,
          date: n.createdAt,
          title: n.content,
          detail: n.author,
        })),
        ...(data.quote
          ? [
              {
                id: 'quote',
                date: data.quote.createdAt,
                title: 'Brouillon de devis créé',
                detail: data.quote.reference,
              },
            ]
          : []),
        ...(data.invoice
          ? [
              {
                id: 'invoice',
                date: data.invoice.updatedAt,
                title: 'Préparation de facture enregistrée',
                detail: 'Brouillon — aucun numéro définitif',
              },
            ]
          : []),
        ...data.mails.map((m, i) => ({
          id: 'mail-' + i,
          date: m.acceptedAt || m.createdAt,
          title:
            m.state === 'accepted'
              ? 'Devis pris en charge par le service d’envoi'
              : m.state === 'failed'
                ? 'Échec d’envoi du devis'
                : m.state === 'uncertain'
                  ? 'Envoi du devis à vérifier'
                  : 'Envoi du devis en cours',
          detail: `${m.reference} · ${m.to}`,
        })),
        ...(data.billing||[]).map(d=>({id:'billing-'+d.id,date:d.createdAt,title:d.kind==='avoir'?'Avoir émis':'Facture émise',detail:d.number+' · '+(d.amountTTC/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})})),
      ]
        .filter((e) => e.date)
        .sort((a, b) => b.date.localeCompare(a.date))
    : [];
  return (
    <section className="crm-dossier-connected">
      <div className="flex items-center justify-between">
        <h3>Votre dossier, en clair</h3>
        <button
          className="request-icon-button"
          aria-label="Actualiser les documents"
          disabled={loading}
          onClick={() => setReload((r) => r + 1)}
        >
          <RefreshCw size={15} />
        </button>
      </div>
      {error && (
        <p role="alert" className="text-sm text-rose-700">
          {error}
        </p>
      )}
      {!data && !error ? (
        <p role="status">Chargement des documents…</p>
      ) : (
        data && (
          <>
            {action&&<section className="dossier-primary" data-tone={action.tone}><div className="dossier-action-heading"><p className="quotes-eyebrow">LA PROCHAINE ACTION</p>{'badge' in action&&action.badge&&<span>{action.badge}</span>}</div><h4>{action.label}</h4><p>{action.reason}</p><button className="requests-primary" onClick={actions[action.target]||onFollowUp}>{action.label}<span aria-hidden="true"> →</span></button><div className="dossier-primary-followup"><div><small>Responsable du dossier</small><strong>{data.lead.assigneeName||'Non attribué'}</strong></div><div><small>Échéance de suivi</small><strong>{data.lead.nextAction?.dueDate?data.lead.nextAction.dueDate.split('-').reverse().join('/'):'À définir'}</strong></div><button type="button" onClick={onFollowUp}>Modifier le suivi</button></div></section>}
            <CrmDossierOverview data={data} onQuote={onQuote}/>

            <details className="dossier-path-disclosure"><summary>Parcours et avancement du dossier</summary><nav className="dossier-progress" aria-label="Avancement du dossier"><ol>{stages.map(stage=><li key={stage.id} data-state={stage.state}><button type="button" onClick={stageActions[stage.id]}><span className="dossier-step-icon" aria-hidden="true">{stage.state==='done'?<Check size={16}/>:stage.state==='attention'?<AlertCircle size={16}/>:<Circle size={14}/>}</span><span><strong>{stage.label}</strong><small>{stage.detail}</small></span></button></li>)}</ol></nav></details>
            {(!data.lead.phone&&!data.lead.email||!data.lead.departureAddress||!data.lead.arrivalAddress||!data.lead.volume)&&<div className="dossier-missing"><p>À compléter : {[!data.lead.phone&&!data.lead.email&&'contact client',!data.lead.departureAddress&&'adresse de départ',!data.lead.arrivalAddress&&'adresse d’arrivée',!data.lead.volume&&'volume'].filter(Boolean).join(' · ')}.</p><button onClick={onEdit}>Compléter les informations</button></div>}
            {['confirme','termine'].includes(data.lead.status)&&!loading&&!error&&<div className="dossier-missing"><p><strong>Pièces du client</strong> · {documentChecklistIssues(data.lead).length?documentChecklistIssues(data.lead).join(' · '):'Réception des deux pièces vérifiée pour la version acceptée enregistrée.'}</p><button type="button" onClick={onDocuments}>Vérifier les pièces</button></div>}
            {canInvoice&&!!data.billing?.length&&<details className="crm-dossier-billing"><summary>Factures et avoirs · {data.billing.length}</summary>{data.billing.map(d=><article key={d.id}><div><strong>{d.number} · {d.kind==='avoir'?'Avoir':d.kind==='acompte'?'Acompte':d.kind==='solde'?'Solde':'Facture'}</strong><small>{d.kind==='avoir'?'Montant de l’avoir':'Reste à régler'} : {((d.kind==='avoir'?d.amountTTC:d.dueCents)/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'})}{d.refundDueCents>0?' · À rembourser : '+(d.refundDueCents/100).toLocaleString('fr-FR',{style:'currency',currency:'EUR'}):''}</small></div><button className="crm-quiet-action" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await billingPdf('/api/crm/billing/documents/'+encodeURIComponent(d.id)+'/pdf','WE-MOVE-'+d.number+'.pdf');}catch(e){setError(e instanceof Error?e.message:'PDF indisponible.');}finally{setBusy(false);}}}><Download size={14}/>PDF original</button></article>)}<button className="crm-quiet-action" onClick={onInvoice}>Ouvrir la facturation de ce dossier</button></details>}
            {data.quote && (
              <details className="crm-dossier-documents"><summary>Documents et PDF du dossier</summary>
                <p>
                  PDF préparatoires générés depuis la version sauvegardée du
                  devis.
                </p>
                {(
                  [
                    ['devis', 'Devis et annexes'],
                    ['mission', 'Ordre de mission'],
                    ['lettre-voiture', 'Lettre de voiture'],
                    ['declaration-valeur', 'Déclaration de valeur'],
                  ] as const
                ).map(([type, label]) => (
                  <button
                    key={type}
                    disabled={busy}
                    onClick={() => void download(type)}
                  >
                    <Download size={14} />
                    {label}
                  </button>
                ))}
                {data.mails
                  .filter((m) => m.state === 'accepted')
                  .map((m) => (
                    <button
                      key={m.id}
                      disabled={busy}
                      onClick={async () => {
                        setBusy(true);
                        try {
                          await downloadQuoteMailPdf(id, m.id);
                        } catch (e) {
                          setError(
                            e instanceof Error
                              ? e.message
                              : 'Archive indisponible',
                          );
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      <Download size={14} />
                      Archive envoyée · {m.reference}
                    </button>
                  ))}
              </details>
            )}
            <details className="crm-timeline">
              <summary>
                Historique du dossier <span>{events.length}</span>
              </summary>
              {events.map((e) => (
                <article key={e.id}>
                  <i />
                  <div>
                    <p>{e.title}</p>
                    <small>
                      {e.detail} ·{' '}
                      {new Date(e.date).toLocaleString('fr-FR', {
                        timeZone: 'Europe/Paris',
                      })}
                    </small>
                  </div>
                </article>
              ))}
            </details>
          </>
        )
      )}
    </section>
  );
}

