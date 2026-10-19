import {useRef, useState} from 'react';
import {Copy, FileText} from 'lucide-react';
import type {QuoteLead, TechnicalVisit} from '../types/crm';
import {visitReport} from '../../shared/visitReport.mjs';
import './crmVisitReport.css';

export default function CrmVisitReport({lead}:{lead:QuoteLead}) {
  const report = visitReport(lead);
  const current = useRef('');
  const [feedback, setFeedback] = useState({source:'', state:''});
  // Include the dossier id so identical summaries cannot share a success state.
  const source = lead.id + '\n' + (report?.text || '');
  current.current = source;
  if (!report) return null;
  const state = feedback.source === source ? feedback.state : '';
  async function copy() {
    setFeedback({source, state:'pending'});
    try {
      await navigator.clipboard.writeText(report!.text);
      if (current.current === source) setFeedback({source, state:'copied'});
    } catch {
      if (current.current === source) setFeedback({source, state:'failed'});
    }
  }
  return <details className="technical-visit-access visit-report">
    <summary>Synthèse de visite · {report.status.toLocaleLowerCase('fr-FR')}</summary>
    <div className="visit-summary-heading"><div><span><FileText size={16}/> Relevé enregistré</span><p>{report.type} · {report.date}</p></div><button type="button" onClick={copy} disabled={state==='pending'}><Copy size={15}/>{state==='pending'?'Copie en cours…':'Copier la synthèse'}</button></div>
    <p className="visit-summary-feedback" role="status">{state==='copied'?'Synthèse copiée. Aucun message envoyé.':state==='failed'?'Copie indisponible. Utilisez le texte sélectionnable ci-dessous.':''}</p>
    <div className="visit-summary-volumes"><div><span>Volume retenu au dossier</span><strong>{report.retainedVolume}</strong></div><div><span>Estimation de l’inventaire</span><strong>{report.estimate}</strong><small>Indicative, sans modification du dossier.</small></div></div>
    <div className="visit-report-access">{report.access.map(part=><section key={part.title}><h4>{part.title}</h4><p>{part.address}</p><dl>{[['Étage',part.floor],['Ascenseur',part.elevator],['Portage',part.carry]].map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>{part.notes&&<p className="whitespace-pre-wrap">{part.notes}</p>}</section>)}</div>
    <div className="visit-summary-inventory">{report.groups.length?report.groups.map(group=><section key={group.room}><h4>{group.room}<span>{group.volume} m³</span></h4>{group.items.map((item:TechnicalVisit['items'][number],index:number)=><div key={index}><span>{item.quantity} × {item.label}</span><strong>{(item.quantity*item.unitVolume).toLocaleString('fr-FR',{maximumFractionDigits:2})} m³</strong></div>)}</section>):<p>Aucun bien enregistré.</p>}</div>
    {report.notes&&<section className="visit-summary-notes"><h4>Observations enregistrées</h4><p className="whitespace-pre-wrap">{report.notes}</p></section>}
    <section className="visit-summary-checks" aria-label="Points à confirmer dans la synthèse"><h4>Points à confirmer</h4>{report.issues.length?<ul>{report.issues.map(issue=><li key={issue}>{issue}</li>)}</ul>:<p>Aucun champ manquant parmi les contrôles du relevé.</p>}</section>
    <p>Synthèse interne des données enregistrées. Les conditions contractuelles restent celles du devis accepté.</p>
    <details className="visit-summary-text" open={state==='failed'}><summary>Voir le texte à copier</summary><label>Texte de la synthèse<textarea readOnly value={report.text} onFocus={event=>event.currentTarget.select()} rows={12}/></label></details>
  </details>;
}
