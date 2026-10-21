import {randomUUID} from 'node:crypto';
import {draftError} from './crmDraftModel.mjs';
import {crmMembers} from './crmAuth.mjs';
import {contactOutcomes,contactChannels} from '../shared/commercialContact.mjs';
import {actionLabels} from '../shared/followUp.mjs';
export const followUpLabels=actionLabels;
export function updateFollowUp(current,payload,actor){
  if(!payload||typeof payload!=='object'||Array.isArray(payload))draftError(400,'Suivi invalide.');
  if(Object.keys(payload).some(key=>!['revision','assigneeId','action','complete','contact'].includes(key)))draftError(400,'Champ de suivi invalide.');
  if(payload.revision!==(current.followUpRevision||0))draftError(409,'Le suivi a été modifié ailleurs. Consultez les données actuelles du dossier avant de réessayer.');
  const now=new Date().toISOString();let assigneeId=current.assigneeId||'',assigneeName=current.assigneeName||'',nextAction=current.nextAction||null,description;
  let contact;
  if(payload.contact!==undefined){
    const value=payload.contact;
    if(['confirme','termine','refuse'].includes(current.status))draftError(409,'Le dossier a changé d’étape. Consultez sa fiche avant d’ajouter une relance commerciale.');
    if(payload.complete===true||!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).some(k=>!['channel','outcome','note'].includes(k))||!Object.hasOwn(contactChannels,value.channel)||!Object.hasOwn(contactOutcomes,value.outcome)||typeof value.note!=='string'||value.note.length>1000)draftError(400,'Résultat de l’échange invalide.');
    if(value.outcome==='changes'&&!value.note.trim())draftError(400,'Précisez les modifications demandées par le client.');
    contact={channel:value.channel,outcome:value.outcome,note:value.note.trim(),createdAt:now,author:actor?.name||actor?.email||'Utilisateur CRM'};
  }
  if(payload.complete===true){
    if(!nextAction)draftError(409,'Aucune action à terminer.');
    description='Action terminée : '+followUpLabels[nextAction.type]+' (échéance '+nextAction.dueDate+').';nextAction=null;
  }else{
    if(typeof payload.assigneeId!=='string')draftError(400,'Responsable invalide.');
    const member=payload.assigneeId?crmMembers().find(user=>user.id===payload.assigneeId):null;
    if(payload.assigneeId&&!member)draftError(400,'Choisissez un utilisateur autorisé.');
    assigneeId=member?.id||'';assigneeName=member?.name||'';
    nextAction=payload.action;
    if(nextAction!==null){
      if(!nextAction||!Object.hasOwn(followUpLabels,nextAction.type)||typeof nextAction.dueDate!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(nextAction.dueDate)||!Number.isFinite(Date.parse(nextAction.dueDate))||new Date(nextAction.dueDate).toISOString().slice(0,10)!==nextAction.dueDate)draftError(400,'Choisissez une action et une date valide.');
      if(typeof nextAction.note!=='string'||nextAction.note.length>1000)draftError(400,'Précision trop longue.');
      nextAction={type:nextAction.type,dueDate:nextAction.dueDate,note:nextAction.note.trim()};
      if(nextAction.type==='documents'&&current.status!=='confirme')draftError(409,'Le suivi des pièces avant départ concerne les dossiers acceptés.');
    }
    description=nextAction?'Prochaine action : '+followUpLabels[nextAction.type]+' le '+nextAction.dueDate+'.':'Prochaine action effacée.';
    description+=' Responsable : '+(assigneeName||'non attribué')+'.';
  }
  if(contact)description=`Échange commercial · ${contactChannels[contact.channel]} · ${contactOutcomes[contact.outcome]}.${contact.note?' '+contact.note:''}\n`+description;
  return {...current,...(contact?{lastCommercialContact:contact}:{}),assigneeId,assigneeName,assignedAgent:assigneeName||'Non assigné',nextAction,followUpRevision:(current.followUpRevision||0)+1,updatedAt:now,
    internalNotes:[{id:randomUUID(),author:actor?.name||'Saisie locale',content:description,createdAt:now},...(current.internalNotes||[])]};
}
