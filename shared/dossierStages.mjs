import {parisToday} from './followUp.mjs';
// Read-only presentation: dates and email delivery never complete a business step.
export function dossierStages(data, canInvoice = true, today = parisToday()) {
  const {lead, quote} = data;
  const closed = lead.status === 'refuse';
  const accepted = ['confirme', 'termine'].includes(lead.status);
  const latest = [...(data.mails || [])].sort((a,b)=>b.createdAt.localeCompare(a.createdAt))[0];
  const currentMail = quote && latest?.revision === quote.revision ? latest : null;
  const bills = (data.billing || []).filter(d=>d.kind !== 'avoir');
  const stages = [
    {id:'visit', label:'Visite', state:lead.visitStatus==='effectuee'?'done':lead.visitDate?'active':'optional', detail:lead.visitStatus==='effectuee'?'Effectuée':lead.visitDate?'Programmée':'Si nécessaire'},
    {id:'quote', label:'Devis', state:currentMail?.state==='accepted'?'done':quote?'active':'pending', detail:currentMail?.state==='accepted'?'Transmis par e-mail':quote?'Version enregistrée':'À préparer'},
    {id:'acceptance', label:'Acceptation', state:closed?'closed':accepted?'done':'pending', detail:closed?'Projet non retenu':accepted?'Confirmée':'À confirmer'},
    {id:'move', label:'Déménagement', state:lead.status==='termine'?'done':lead.scheduledTime?'active':'pending', detail:lead.status==='termine'?'Effectué':lead.scheduledTime?'Planifié':'À planifier'},
  ];
  if(lead.visitDate && lead.visitStatus!=='effectuee' && lead.visitDate.slice(0,10)<today) Object.assign(stages[0], {state:'attention',detail:'Réalisation à vérifier'});
  if(currentMail && ['failed','uncertain','sending'].includes(currentMail.state)) Object.assign(stages[1], {state:currentMail.state==='sending'?'active':'attention',detail:currentMail.state==='sending'?'Envoi en cours':'Envoi à vérifier'});
  if(lead.scheduledTime && lead.status!=='termine' && lead.scheduledTime.slice(0,10)<today) Object.assign(stages[3], {state:'attention',detail:'Réalisation à vérifier'});
  if(canInvoice) {
    const refund=(data.billing||[]).some(d=>d.refundDueCents>0), due=bills.some(d=>d.dueCents>0);
    stages.push({id:'invoice',label:'Règlement',state:refund||due?'attention':bills.length?'done':'pending',detail:refund?'Remboursement à suivre':due?'Paiement attendu':bills.length?'Factures enregistrées réglées':data.invoice?'Facture à préparer':'Pas de facture émise'});
  }
  // Closed projects retain their actual completed steps without showing overdue work.
  return stages.map(stage=>closed&&stage.state!=='done'&&stage.id!=='invoice'?{...stage,state:'closed',detail:stage.id==='acceptance'?'Projet non retenu':'Dossier non retenu'}:stage);
}
