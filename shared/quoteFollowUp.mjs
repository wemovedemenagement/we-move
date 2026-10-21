import { parisToday, actionLabels } from './followUp.mjs';
import { requestedDate } from './planningQueue.mjs';

export function quoteFollowUp(draft, lead, today = parisToday()) {
  const delivery = draft.emailDelivery;
  const sent = delivery?.state === 'accepted' && delivery.revision === draft.revision;
  const closed = !!lead && ['confirme','termine','refuse'].includes(lead.status);
  const waiting = !!lead && !closed && sent;
  const action = lead?.nextAction;
  const dueDate = requestedDate(action?.dueDate);
  const followDue = !!lead && !closed && !!dueDate && ['relancer','rappeler'].includes(action.type) && dueDate <= today;
  const mailIssue = !!delivery && ['failed','uncertain'].includes(delivery.state);
  const deliveryLabel = delivery?.state === 'sending' ? 'Envoi en cours' : delivery?.state === 'uncertain' ? 'Envoi à vérifier' : delivery?.state === 'failed' ? 'Envoi refusé' : sent ? 'Transmis par e-mail' : delivery?.state === 'accepted' ? 'Modifié depuis l’envoi' : 'Brouillon';
  const dossierLabel = !lead ? 'Dossier indisponible' : lead.status === 'confirme' ? 'Dossier accepté' : lead.status === 'termine' ? 'Déménagement effectué' : lead.status === 'refuse' ? 'Dossier non retenu' : waiting ? 'En attente de retour' : '';
  const actionLabel = closed ? '' : action ? `${actionLabels[action.type] || 'Action'} · ${dueDate?dueDate.split('-').reverse().join('/'):'Échéance à préciser'}` : waiting ? 'Prochaine action à définir' : '';
  const timing=!lead||closed?'none':action?dueDate?(dueDate<today?'overdue':dueDate===today?'today':'future'):'undated':waiting?'missing':'none';
  const nextAction=timing==='none'?null:{
    timing,title:action?actionLabels[action.type]||'Action enregistrée':'Prochaine action',
    label:({overdue:'En retard',today:'Aujourd’hui',future:'À venir',undated:'Date à préciser',missing:'À définir'})[timing],
    date:dueDate,owner:lead.assigneeId?(lead.assigneeName?.trim()||'Responsable à vérifier'):'Non attribué',
  };
  return {sent,waiting,followDue,mailIssue,unscheduled:waiting&&!action,deliveryLabel,dossierLabel,actionLabel,nextAction,overdue:followDue&&action.dueDate<today};
}
