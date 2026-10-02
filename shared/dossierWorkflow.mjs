import {parisToday} from './followUp.mjs';
import {nextStep} from './crmWorkflow.mjs';
export function dossierAction(data,canInvoice=true,today=parisToday()){
 const lead=data.lead,quote=data.quote,billing=data.billing||[];
 if(lead.status==='refuse')return {target:'followup',label:'Consulter le suivi',reason:'Projet non retenu. Le dossier reste consultable.',tone:'closed'};
 if(canInvoice&&billing.some(d=>d.refundDueCents>0))return {target:'invoice',label:'Vérifier le remboursement',reason:'Un solde à rembourser figure dans les règlements.',tone:'attention'};
 if(lead.status==='termine'){
  if(!canInvoice)return {target:'followup',label:'Consulter le suivi',reason:'Déménagement effectué. La facturation est suivie par le gérant ou le secrétariat.',tone:'done'};
  return billing.some(d=>d.dueCents>0)?{target:'invoice',label:'Suivre le règlement',reason:'Des factures restent à régler selon les paiements enregistrés.',tone:'attention'}:billing.some(d=>d.kind!=='avoir')?{target:'invoice',label:'Consulter les règlements',reason:'Aucun reste à régler sur les factures enregistrées. Vérifiez que toute la prestation est facturée.',tone:'done'}:{target:'invoice',label:'Préparer la facturation',reason:'Déménagement effectué, aucune facture définitive enregistrée.',tone:'attention'};
 }
 const visitAction=()=>{const day=lead.visitDate.slice(0,10),past=day<today;return {target:'visit',label:past?'Vérifier la visite passée':'Consulter la visite',reason:`Visite ${past?'prévue le':'programmée le'} ${lead.visitDate.replace('T',' à ')}${past?' · Confirmez sa réalisation ou reprogrammez-la.':''}`,tone:past?'attention':'active',badge:past?'À vérifier':day===today?'Aujourd’hui':'Programmée'};};
 const moveAction=()=>{const past=lead.scheduledTime&&lead.scheduledTime.slice(0,10)<today;return past?{target:'move',label:'Vérifier le déménagement',reason:'Le créneau enregistré est passé. Vérifiez la réalisation de la mission et le statut du dossier.',tone:'attention',badge:'À vérifier'}:{...nextStep({...lead,nextAction:null},today),tone:'accepted'};};
 const action=lead.nextAction;
 // A saved task is not silently completed; its wording follows the actual record.
 if(action){
  if(action.type==='visite'&&lead.status!=='confirme'){
   if(lead.visitStatus==='effectuee')return {target:'followup',label:'Mettre à jour le suivi',reason:'La visite est effectuée, mais l’action « Prévoir une visite » reste ouverte. Terminez-la puis choisissez la suite.',tone:'attention',badge:'Suivi à actualiser'};
   if(lead.visitDate)return visitAction();
  }
  if(lead.status==='confirme'&&['visite','devis','planifier'].includes(action.type))return moveAction();
  const step=nextStep(lead,today);
  if(step.target==='invoice'&&!canInvoice)return {target:'followup',label:'Consulter le suivi',reason:'Action de facturation à traiter par le gérant ou le secrétariat.',tone:'active'};
  const overdue=action.dueDate<today;
  return {...step,reason:`${action.note? action.note+' · ':''}Échéance : ${action.dueDate}`,target:step.target==='summary'?'followup':step.target,tone:overdue?'attention':'active',badge:overdue?'En retard':action.dueDate===today?'Aujourd’hui':'À venir'};
 }
 if(lead.status==='confirme')return moveAction();
 if(lead.visitDate&&lead.visitStatus!=='effectuee')return visitAction();
 const latest=[...(data.mails||[])].sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0];
 if(latest?.revision===quote?.revision&&['failed','uncertain','sending'].includes(latest?.state))return {target:'quote',label:'Vérifier l’envoi du devis',reason:latest.state==='sending'?'Un envoi est en cours. Vérifiez son résultat avant toute nouvelle tentative.':'Le dernier envoi nécessite une vérification.',tone:'attention'};
 if(quote&&latest?.state==='accepted'&&latest.revision===quote.revision)return {target:'followup',label:'Prévoir le suivi du devis',reason:'Devis transmis par e-mail. L’acceptation du client reste à confirmer.',tone:'active'};
 if(quote)return {target:'quote',label:quote.amountTTC===null?'Compléter le chiffrage':'Vérifier et préparer l’envoi',reason:'Reprenez le devis enregistré. Aucun envoi ni changement de statut automatique.',tone:'active'};
 if(lead.visitStatus==='effectuee')return {target:'quote',label:'Préparer le devis',reason:'Visite effectuée. Reprenez les informations du dossier pour chiffrer.',tone:'active'};
 const step=nextStep(lead,today);return {...step,target:step.target==='summary'?'contact':step.target,tone:'active'};
}
