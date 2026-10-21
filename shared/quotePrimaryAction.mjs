import {parisToday} from './followUp.mjs';
import {quoteFollowUp} from './quoteFollowUp.mjs';
import {quoteReadiness} from './quoteReadiness.mjs';

// Navigation only. Sending, acceptance and booking still use their own checks.
export function quotePrimaryAction(draft,lead,today=parisToday()) {
 if(!lead)return {target:'edit',label:'Ouvrir le devis',step:0};
 if(['termine','refuse'].includes(lead.status))return {target:'dossier',label:'Consulter le dossier'};
 if(lead.status==='confirme')return {target:'move',label:'Organiser le déménagement'};
 if(['failed','uncertain','sending'].includes(draft.emailDelivery?.state))return {target:'mail',label:'Vérifier l’envoi'};
 const follow=quoteFollowUp(draft,lead,today);
 if(follow.followDue)return {target:'contact',label:'Ouvrir le suivi'};
 const issues=quoteReadiness(draft,today);
 if(issues.length)return {target:'edit',label:'Compléter le devis',step:issues[0].step};
 if(follow.sent)return {target:'contact',label:'Ouvrir le suivi'};
 return {target:'mail',label:'Préparer l’envoi'};
}
