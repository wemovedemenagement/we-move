import {ArrowRight,CheckCircle2,ClipboardCheck} from 'lucide-react';
import './crmQuoteReadiness.css';
export type QuoteReadinessIssue={key:string;message:string;step:number;fieldId:string};
export default function CrmQuoteReadiness({issues,busy,onCorrect}:{issues:QuoteReadinessIssue[];busy:boolean;onCorrect:(issue:QuoteReadinessIssue)=>void}) {
  return <section className="quote-readiness" aria-labelledby="quote-readiness-title" data-complete={!issues.length}>
    <div className="quote-readiness-heading">{issues.length?<ClipboardCheck size={20}/>:<CheckCircle2 size={20}/>}<div><h3 id="quote-readiness-title">{issues.length?`${issues.length} point${issues.length>1?'s':''} avant de préparer l’envoi`:'Informations nécessaires à l’envoi renseignées'}</h3><p>{issues.length?'Vous pouvez enregistrer un brouillon incomplet à tout moment.':'Enregistrez, puis vérifiez le destinataire et le message avant de confirmer l’envoi.'}</p></div></div>
    {!!issues.length&&<ul>{issues.map(issue=><li key={issue.key}><button type="button" disabled={busy} onClick={()=>onCorrect(issue)}><span>{issue.message}</span><ArrowRight size={15}/></button></li>)}</ul>}
  </section>;
}
