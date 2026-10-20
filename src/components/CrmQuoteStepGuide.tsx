import {ArrowRight,CheckCircle2,ClipboardList} from 'lucide-react';
import type {QuoteReadinessIssue} from './CrmQuoteReadiness';
import './crmQuoteStepGuide.css';

export default function CrmQuoteStepGuide({step,issues,busy,onCorrect}:{step:number;issues:QuoteReadinessIssue[];busy:boolean;onCorrect:(issue:QuoteReadinessIssue)=>void}) {
  if(step===2)return null;
  const pending=issues.filter(issue=>issue.step===step),first=pending[0];
  return <section className="quote-step-guide" aria-label="Repères de l’étape du devis" data-complete={!first}>
    <div className="quote-step-guide-heading">{first?<ClipboardList size={19} aria-hidden="true"/>:<CheckCircle2 size={19} aria-hidden="true"/>}<div><h3>{first?`${pending.length} point${pending.length>1?'s':''} à compléter dans cette étape`:'Points contrôlés de cette étape renseignés'}</h3><p>{first?'Vous pouvez avancer et enregistrer un brouillon avant de tout compléter.':'Poursuivez la préparation ; les autres étapes se vérifient séparément.'}</p></div></div>
    {first&&<><div className="quote-step-guide-next"><p>{first.message}</p><button type="button" disabled={busy} onClick={()=>onCorrect(first)}>Compléter ce point<ArrowRight size={14} aria-hidden="true"/></button></div>{pending.length>1&&<details><summary>Voir les {pending.length-1} autre{pending.length>2?'s':''} point{pending.length>2?'s':''}</summary><ul>{pending.slice(1).map(issue=><li key={issue.key}><button type="button" disabled={busy} onClick={()=>onCorrect(issue)}>{issue.message}<ArrowRight size={14} aria-hidden="true"/></button></li>)}</ul></details>}</>}
  </section>;
}
