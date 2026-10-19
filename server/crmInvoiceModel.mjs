import {draftError} from './crmDraftModel.mjs';
import {quoteTotals} from '../shared/quoteTotals.mjs';
export function newInvoicePreparation(quote,lead,actor,acceptance){
 if(!quote||!lead)draftError(404,'Devis ou dossier introuvable.');
 // Never invoice a working amendment that the client has not accepted.
 // Legacy dossiers without a recorded version retain their existing workflow.
 if(quote.clientAcceptance){
  if(!acceptance?.quote||acceptance.quoteRevision!==quote.clientAcceptance.quoteRevision||acceptance.quote.revision!==acceptance.quoteRevision||acceptance.quote.id!==quote.id||acceptance.quote.leadId!==lead.id)draftError(409,'La version acceptée est introuvable ou incohérente. Rechargez le dossier avant de préparer la facture.');
  quote=acceptance.quote;
 }
 if(!['confirme','termine'].includes(lead.status))draftError(409,'Le dossier doit être marqué accepté ou déménagement effectué.');
 const totals=quoteTotals(quote.items,quote.taxRate,quote.depositRate);
 if(!quote.items?.length||totals.amountTTC===null||totals.amountTTC<=0)draftError(400,'Enregistrez un devis chiffré avec une TVA définie.');
 const f=quote.document?.fields||{};
 if(!f.clientName?.trim()||!f.clientAddress?.trim())draftError(400,'Complétez le nom et l’adresse de facturation dans le devis.');
 const now=new Date().toISOString();
 return {id:quote.id,quoteId:quote.id,leadId:lead.id,quoteReference:quote.reference,quoteRevision:quote.revision,status:'brouillon',number:null,revision:1,createdAt:now,updatedAt:now,createdBy:actor.email||actor.name,clientName:f.clientName,clientAddress:f.clientAddress,clientEmail:f.clientEmail||'',items:structuredClone(quote.items),taxRate:quote.taxRate,amountHT:totals.amountHT,taxAmount:totals.taxAmount,amountTTC:totals.amountTTC,sourceDocument:structuredClone(quote.document),dueDate:'',notes:''};
}
export function reviseInvoicePreparation(current,payload,actor){
 if(!payload||typeof payload!=='object'||Array.isArray(payload)||Object.keys(payload).some(k=>!['revision','dueDate','notes'].includes(k)))draftError(400,'Modification invalide.');
 if(current.status!=='brouillon')draftError(409,'Cette facture ne peut plus être modifiée.');
 if(payload.revision!==current.revision)draftError(409,'Ce brouillon a changé. Actualisez avant de réessayer.');
 const {dueDate,notes}=payload;
 if(typeof dueDate!=='string'||(dueDate&&(!/^\d{4}-\d{2}-\d{2}$/.test(dueDate)||!Number.isFinite(Date.parse(dueDate))||new Date(dueDate).toISOString().slice(0,10)!==dueDate)))draftError(400,'Échéance invalide.');
 if(typeof notes!=='string'||notes.length>2000)draftError(400,'Précisions invalides (2 000 caractères maximum).');
 return {...current,dueDate,notes:notes.trim(),revision:current.revision+1,updatedAt:new Date().toISOString(),updatedBy:actor.email||actor.name};
}
