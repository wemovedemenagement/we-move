import {draftError} from './crmDraftModel.mjs';
import {quoteTotals} from '../shared/quoteTotals.mjs';
export function checkInvoiceSourceRevision(revision,expected){
 if(expected===undefined)return;
 if(!Number.isSafeInteger(expected)||expected<1)draftError(400,'Version de devis attendue invalide.');
 if(revision!==expected)draftError(409,'Le devis de référence a changé. Vérifiez le nouvel aperçu avant de créer le brouillon.');
}
export function assertInvoiceReference(current,quote){
 if(!current||!quote||current.quoteId!==quote.id||current.leadId!==quote.leadId||current.quoteRevision!==(quote.clientAcceptance?.quoteRevision||quote.revision))draftError(409,'Ce brouillon ne correspond plus au devis de référence. Actualisez sa source avant de facturer. Si un document a déjà été émis, faites vérifier le dossier avant de poursuivre.');
}
export function refreshInvoiceSource(current,quote,lead,acceptance,payload,actor,hasIssued){
 if(!['gerant','secretaire'].includes(actor?.role))draftError(403,'Action réservée au gérant et au secrétariat.');
 if(!current)draftError(404,'Brouillon introuvable.');
 if(!payload||typeof payload!=='object'||Array.isArray(payload)||Object.keys(payload).some(k=>!['revision','expectedQuoteRevision','confirm'].includes(k))||payload.confirm!==true||!Number.isSafeInteger(payload.expectedQuoteRevision)||payload.expectedQuoteRevision<1)draftError(400,'Confirmez la mise à jour et sa version de référence.');
 if(current.revision!==payload.revision)draftError(409,'Ce brouillon a changé. Actualisez avant de réessayer.');
 if(current.status!=='brouillon'||hasIssued)draftError(409,'Un document comptable existe déjà pour ce brouillon. Sa source ne peut plus être remplacée. Faites vérifier le dossier.');
 const fresh=newInvoicePreparation(quote,lead,actor,acceptance,payload.expectedQuoteRevision);
 if(fresh.id!==current.id||fresh.leadId!==current.leadId)draftError(409,'La source de ce brouillon est incohérente. Faites vérifier le dossier.');
 if(fresh.quoteRevision===current.quoteRevision)draftError(409,'Ce brouillon utilise déjà cette version de référence.');
 if((current.sourceHistory||[]).length>=50)draftError(409,'Historique de source complet. Faites vérifier le dossier.');
 return {...fresh,createdAt:current.createdAt,createdBy:current.createdBy,revision:current.revision+1,dueDate:current.dueDate,notes:current.notes,updatedBy:actor.email||actor.name,sourceHistory:[...(current.sourceHistory||[]),{quoteRevision:current.quoteRevision,quoteReference:current.quoteReference,amountTTC:current.amountTTC,replacedAt:fresh.updatedAt,replacedBy:actor.email||actor.name}]};
}
export function newInvoicePreparation(quote,lead,actor,acceptance,expectedQuoteRevision){
 if(!quote||!lead)draftError(404,'Devis ou dossier introuvable.');
 // Never invoice a working amendment that the client has not accepted.
 // Legacy dossiers without a recorded version retain their existing workflow.
 if(quote.clientAcceptance){
  if(!acceptance?.quote||acceptance.quoteRevision!==quote.clientAcceptance.quoteRevision||acceptance.quote.revision!==acceptance.quoteRevision||acceptance.quote.id!==quote.id||acceptance.quote.leadId!==lead.id)draftError(409,'La version acceptée est introuvable ou incohérente. Rechargez le dossier avant de préparer la facture.');
  quote=acceptance.quote;
 }
 checkInvoiceSourceRevision(quote.revision,expectedQuoteRevision);
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
