import {draftError} from './crmDraftModel.mjs';
import {quoteReadiness} from '../shared/quoteReadiness.mjs';
import {parisToday} from '../shared/followUp.mjs';

export function acceptanceRevision(value) {
  const number=typeof value==='string'&&/^[1-9]\d*$/.test(value)?Number(value):value;
  if(!Number.isSafeInteger(number)||number<1)draftError(400,'Version de devis invalide.');
  return number;
}
// This records an agreement reported by an authorised employee, not an electronic signature.
export function recordClientAgreement(lead,quote,payload,actor) {
  if(!['gerant','secretaire'].includes(actor.role))draftError(403,'Accord client réservé au gérant et au secrétariat.');
  if(!lead||!quote)draftError(404,'Dossier ou devis introuvable.');
  if(lead.status!=='confirme')draftError(409,'Confirmez d’abord l’acceptation du dossier dans son suivi.');
  if(!payload||typeof payload!=='object'||Array.isArray(payload)||Object.keys(payload).some(k=>!['quoteRevision','previousRevision','expectedUpdatedAt','agreementDate','note','confirmed'].includes(k)))draftError(400,'Accord client invalide.');
  if(payload.quoteRevision!==quote.revision||payload.previousRevision!==(quote.clientAcceptance?.quoteRevision||0)||payload.expectedUpdatedAt!==lead.updatedAt)draftError(409,'Le dossier ou le devis a changé. Rechargez avant de confirmer l’accord.');
  if(quote.clientAcceptance?.quoteRevision===quote.revision)draftError(409,'Cette version possède déjà un accord enregistré.');
  const date=payload.agreementDate,today=parisToday();
  if(typeof date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isFinite(Date.parse(date))||new Date(date).toISOString().slice(0,10)!==date||date>today||date<(quote.document?.fields.issueDate||'')||date<(quote.clientAcceptance?.agreementDate||''))draftError(400,'Choisissez une date d’accord réelle, au moins égale à la date du devis et au précédent accord.');
  if(payload.confirmed!==true)draftError(400,'Confirmez que le client a accepté cette version.');
  if(typeof payload.note!=='string'||payload.note.trim().length<10||payload.note.length>2000)draftError(400,'Précisez la référence de l’accord et, pour une nouvelle version, les changements acceptés (10 à 2 000 caractères).');
  const issues=quoteReadiness(quote,date);
  if(issues.length)draftError(400,issues[0].message);
  const at=new Date().toISOString(),actorName=actor.email||actor.name;
  const summary={quoteRevision:quote.revision,agreementDate:date,note:payload.note.trim(),at,actor:actorName,previousRevision:quote.clientAcceptance?.quoteRevision||null};
  const {clientAcceptance,emailDelivery,...quoteSnapshot}=quote;
  const updatedLead={...lead,updatedAt:at,internalNotes:[...(lead.internalNotes||[]),{id:'agreement-'+quote.revision,content:`Accord client enregistré : ${quote.reference}, version ${quote.revision}. ${summary.note}`,author:actorName,createdAt:at}]};
  return {acceptance:{...summary,quote:quoteSnapshot},quote:{...quote,clientAcceptance:summary},lead:updatedLead};
}
