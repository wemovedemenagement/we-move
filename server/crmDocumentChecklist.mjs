import {draftError} from './crmDraftModel.mjs';
import {parisToday} from '../shared/followUp.mjs';
import {documentKinds} from '../shared/documentChecklist.mjs';

export function reviseDocumentChecklist(lead,quote,payload,actor) {
  if(!['gerant','secretaire'].includes(actor.role))draftError(403,'Réception des pièces réservée au gérant et au secrétariat.');
  if(!lead)draftError(404,'Dossier introuvable.');
  if(!['confirme','termine'].includes(lead.status))draftError(409,'Ce dossier doit être accepté pour vérifier ses pièces.');
  if(!payload||typeof payload!=='object'||Array.isArray(payload)||Object.keys(payload).some(k=>!['revision','acceptedQuoteRevision','signedQuote','valueDeclaration','reason'].includes(k)))draftError(400,'Suivi documentaire invalide.');
  const previous=lead.documentChecklist,accepted=quote?.clientAcceptance?.quoteRevision||0;
  if(payload.revision!==(previous?.revision||0)||payload.acceptedQuoteRevision!==accepted)draftError(409,'Le suivi ou la version acceptée a changé. Rechargez le dossier avant de réessayer.');
  if(typeof payload.reason!=='string'||payload.reason.length>1000)draftError(400,'Motif de correction invalide.');
  const now=new Date().toISOString(),by=actor.email||actor.name,result={},changes=[];
  for(const [key,label] of Object.entries(documentKinds)){
    const row=payload[key],old=previous?.[key];
    if(!row||typeof row!=='object'||Array.isArray(row)||Object.keys(row).some(k=>!['received','receivedOn','reference'].includes(k))||typeof row.received!=='boolean'||typeof row.receivedOn!=='string'||typeof row.reference!=='string'||row.reference.length>500)draftError(400,label+' : saisie invalide.');
    let value={received:false,receivedOn:'',reference:'',quoteRevision:null};
    if(row.received){
      if(!accepted)draftError(409,'Enregistrez l’accord sur une version du devis avant de confirmer la réception des pièces.');
      const date=row.receivedOn;
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date>parisToday())draftError(400,label+' : indiquez une date de réception réelle.');
      if(row.reference.trim().length<10)draftError(400,label+' : précisez où retrouver la pièce (10 caractères minimum).');
      value={received:true,receivedOn:date,reference:row.reference.trim(),quoteRevision:accepted};
    }
    const oldValue=old?{received:old.received,receivedOn:old.receivedOn,reference:old.reference,quoteRevision:old.quoteRevision}:{received:false,receivedOn:'',reference:'',quoteRevision:null};
    const changed=JSON.stringify(oldValue)!==JSON.stringify(value);
    if(changed&&old?.received&&payload.reason.trim().length<10)draftError(400,'Expliquez la correction ou la vérification pour la nouvelle version (10 caractères minimum).');
    result[key]=changed?{...value,verifiedAt:now,verifiedBy:by}:old||{...value,verifiedAt:null,verifiedBy:null};
    if(changed)changes.push({key,label,before:old||null,after:result[key]});
  }
  if(!changes.length)draftError(400,'Aucune modification des pièces à enregistrer.');
  const checklist={...result,revision:(previous?.revision||0)+1,updatedAt:now,updatedBy:by};
  return {lead:{...lead,acceptedQuoteRevision:accepted||null,documentChecklist:checklist,updatedAt:now,internalNotes:[{id:'documents-'+checklist.revision,content:'Suivi des pièces : '+changes.map(c=>c.label+(c.after.received?' reçue et vérifiée':' à réunir')).join(', ')+'.'+(payload.reason.trim()?' '+payload.reason.trim():''),author:by,createdAt:now},...(lead.internalNotes||[])]},event:{revision:checklist.revision,at:now,actor:by,reason:payload.reason.trim(),changes}};
}
