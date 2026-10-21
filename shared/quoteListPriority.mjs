import {parisToday} from './followUp.mjs';
import {requestedDate} from './planningQueue.mjs';
import {quoteFollowUp} from './quoteFollowUp.mjs';

// Sorting is read-only: a priority never creates a task or changes a dossier.
export function quoteListPriority(draft,lead,today=parisToday()) {
 if(!lead)return {rank:7,date:''};
 if(['confirme','termine','refuse'].includes(lead.status))return {rank:8,date:''};
 const follow=quoteFollowUp(draft,lead,today),due=requestedDate(lead.nextAction?.dueDate),validUntil=requestedDate(draft.validUntil);
 if(follow.mailIssue)return {rank:0,date:''};
 if(follow.followDue)return {rank:1,date:due};
 if(validUntil&&validUntil<today)return {rank:2,date:validUntil};
 if(follow.unscheduled)return {rank:3,date:''};
 if(draft.amountTTC===null)return {rank:4,date:''};
 if(!follow.sent)return {rank:5,date:''};
 return {rank:6,date:due||''};
}

export function compareQuotePriority(a,b,leadsById,today=parisToday()) {
 const left=quoteListPriority(a,leadsById.get(a.leadId),today),right=quoteListPriority(b,leadsById.get(b.leadId),today);
 return left.rank-right.rank
  ||(left.date&&right.date?left.date.localeCompare(right.date):left.date?-1:right.date?1:0)
  ||String(b.updatedAt||'').localeCompare(String(a.updatedAt||''))
  ||a.id.localeCompare(b.id);
}
