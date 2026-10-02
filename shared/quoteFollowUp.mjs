import { parisToday, actionLabels } from './followUp.mjs';

export function quoteFollowUp(draft, lead, today = parisToday()) {
  const delivery = draft.emailDelivery;
  const sent = delivery?.state === 'accepted' && delivery.revision === draft.revision;
  const closed = !!lead && ['confirme','termine','refuse'].includes(lead.status);
  const waiting = !!lead && !closed && sent;
  const action = lead?.nextAction;
  const followDue = !!lead && !closed && !!action && ['relancer','rappeler'].includes(action.type) && action.dueDate <= today;
  const mailIssue = !!delivery && ['failed','uncertain'].includes(delivery.state);
  const deliveryLabel = delivery?.state === 'sending' ? 'Envoi en cours' : delivery?.state === 'uncertain' ? 'Envoi à vérifier' : delivery?.state === 'failed' ? 'Envoi refusé' : sent ? 'Transmis par e-mail' : delivery?.state === 'accepted' ? 'Modifié depuis l’envoi' : 'Brouillon';
  const dossierLabel = !lead ? 'Dossier indisponible' : lead.status === 'confirme' ? 'Dossier accepté' : lead.status === 'termine' ? 'Déménagement effectué' : lead.status === 'refuse' ? 'Dossier non retenu' : waiting ? 'En attente de retour' : '';
  const actionLabel = closed ? '' : action ? `${actionLabels[action.type] || 'Action'} · ${action.dueDate.split('-').reverse().join('/')}` : waiting ? 'Prochaine action à définir' : '';
  return {sent,waiting,followDue,mailIssue,unscheduled:waiting&&!action,deliveryLabel,dossierLabel,actionLabel,overdue:followDue&&action.dueDate<today};
}
