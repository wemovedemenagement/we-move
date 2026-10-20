import {parisToday} from './followUp.mjs';
import {requestedDate} from './planningQueue.mjs';

// Match existing document-save checks, without imposing new scheduling rules.
export function quotePeriodIssues(fields={}) {
  const issues=[];
  for(const [key,label] of [['issueDate','du devis'],['departureStart','de début du chargement'],['departureEnd','de fin du chargement'],['arrivalStart','de début de livraison'],['arrivalEnd','de fin de livraison']]){
    const value=fields[key];
    if(value!==undefined&&value!==null&&value!==''&&!requestedDate(value))issues.push({key,message:`Vérifiez la date ${label}.`,step:0,fieldId:'qd-'+key});
  }
  for(const [prefix,label] of [['departure','chargement'],['arrival','livraison']]){
    const start=requestedDate(fields[prefix+'Start']),end=requestedDate(fields[prefix+'End']);
    if(start&&end&&end<start)issues.push({key:prefix+'End',message:`La fin de ${label} ne peut pas précéder son début.`,step:0,fieldId:'qd-'+prefix+'End'});
  }
  return issues;
}

// The editor and the send endpoint use the same prerequisites.
export function quoteReadiness(draft,today=parisToday()) {
  const fields=draft.document?.fields||{},issues=[];
  const add=(key,message,step,fieldId)=>issues.push({key,message,step,fieldId});
  if(!/^[^\s<>\r\n,;]+@[^\s<>\r\n,;]+\.[^\s<>\r\n,;]+$/.test(fields.clientEmail||''))
    add('clientEmail','Renseignez une adresse e-mail client valide.',0,'qd-clientEmail');
  for(const [key,label,step] of [
    ['clientName','le nom du client',0],['clientAddress','l’adresse de facturation',0],
    ['departureAddress','l’adresse de chargement',0],['arrivalAddress','l’adresse de livraison',0],
    ['formula','la formule',1],['issueDate','la date du devis',0],
    ['departureStart','la période de chargement',0],['arrivalStart','la période de livraison',0],
    ['guarantee','la garantie',2],['coveredValue','la valeur garantie',2],
    ['itemLimit','le plafond par objet',2],['paymentKind','le versement à la commande',1],
    ['balanceWhen','l’échéance du solde',2],
  ])if(!fields[key])add(key,'Complétez '+label+'.',step,'qd-'+key);
  issues.push(...quotePeriodIssues(fields));
  if(!draft.validUntil)add('validUntil','Renseignez une validité non expirée.',1,'quote-validUntil');
  else if(!requestedDate(draft.validUntil))add('validUntil','Vérifiez la date de validité du devis.',1,'quote-validUntil');
  else if(draft.validUntil<today)add('validUntil','Renseignez une validité non expirée.',1,'quote-validUntil');
  else if(requestedDate(fields.issueDate)&&draft.validUntil<fields.issueDate)add('validUntil','La validité ne peut pas précéder la date du devis.',1,'quote-validUntil');
  if(!draft.items?.length||draft.amountTTC===null||draft.amountTTC<=0||draft.taxRate===null||draft.depositRate===null)
    add('pricing','Vérifiez le chiffrage, la TVA et le taux de versement.',1,!draft.items?.length||draft.amountTTC===null&&draft.taxRate!==null?'quote-pricing':draft.taxRate===null?'quote-taxRate':draft.depositRate===null?'quote-depositRate':'quote-pricing');
  return issues;
}
