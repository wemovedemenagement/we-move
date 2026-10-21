import {quoteFollowUp} from '../../shared/quoteFollowUp.mjs';
import type {CrmQuoteDraft,QuoteLead} from '../types/crm';
import './crmQuoteNextAction.css';

export default function CrmQuoteNextAction({draft,lead,today}:{draft:CrmQuoteDraft;lead?:QuoteLead;today:string}) {
 const action=quoteFollowUp(draft,lead,today).nextAction;
 if(!action)return null;
 return <div className="quote-next-action" data-timing={action.timing} role="group" aria-label={`Prochaine action de ${draft.clientName}`}>
  <strong>{action.title}</strong>
  <div><span className="quote-next-timing">{action.label}</span>{action.date&&<time dateTime={action.date}>{action.date.split('-').reverse().join('/')}</time>}</div>
  <small>Responsable · {action.owner}</small>
 </div>;
}
