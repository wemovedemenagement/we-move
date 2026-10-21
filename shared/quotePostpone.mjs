import {parisToday,followUpDateIn} from './followUp.mjs';
import {requestedDate} from './planningQueue.mjs';

export function quotePostponeMinimum(lead,today=parisToday()){
 if(!lead||['confirme','termine','refuse'].includes(lead.status)||!['rappeler','relancer'].includes(lead.nextAction?.type)||!requestedDate(today))return '';
 const due=requestedDate(lead.nextAction.dueDate);
 return requestedDate(followUpDateIn(1,due>today?due:today));
}
