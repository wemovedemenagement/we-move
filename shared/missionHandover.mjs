import {emptyQuoteDocument} from './quoteDocument.mjs';

const text=value=>String(value??'').trim().replace(/\s+/g,' ');
const numeric=value=>text(value)!==''&&Number.isFinite(Number(value))?String(Number(value)):text(value);
const shown=value=>text(value)||'Non précisé';
const dateLabel=value=>/^\d{4}-\d{2}-\d{2}$/.test(value||'')?value.split('-').reverse().join('/'):shown(value);

// Comparison only. The accepted contract is never updated from field observations.
export function missionAgreementReview(lead,quote,acceptance,booking) {
  if(!acceptance)return [];
  const rows=[];
  const add=(key,label,before,current,target,message)=>rows.push({key,label,before:shown(before),current:shown(current),target,message});
  if(!acceptance.quote?.document?.fields){
    add('reference','Devis de référence',`Version ${acceptance.quoteRevision}`,'Copie indisponible','quote','La copie du devis accepté est indisponible. Vérifiez le dossier.');
    return rows;
  }
  const fields=acceptance.quote.document.fields,actual=emptyQuoteDocument(lead).fields;
  if(quote?.revision!==acceptance.quoteRevision)add('version','Version du devis',`Version ${acceptance.quoteRevision}`,quote?`Version de travail ${quote.revision}`:'Devis actuel indisponible','quote','Une autre version du devis existe. Elle ne remplace pas l’accord enregistré.');
  for(const [key,label] of [['departureAddress','L’adresse de départ du dossier'],['arrivalAddress','L’adresse d’arrivée du dossier']])
    if(text(lead[key])!==text(fields[key]))add(key,label,fields[key],lead[key],'details',label+' diffère de la version acceptée.');
  if(lead.unknownVolume||numeric(lead.volume)!==numeric(fields.volume))add('volume','Volume retenu',fields.volume?`${fields.volume} m³`:'',lead.unknownVolume?'À préciser':lead.volume?`${lead.volume} m³`:'','details','Le volume du dossier diffère ou reste à préciser.');
  if(actual.formula&&text(actual.formula)!==text(fields.formula))add('formula','Formule du dossier',fields.formula,actual.formula,'details','La formule du dossier diffère de la version acceptée.');
  for(const [side,place] of [['departure','Départ'],['arrival','Arrivée']]){
    for(const [suffix,label,normalize] of [['Floor','étage',text],['Elevator','ascenseur',text],['Carry','portage',numeric],['AccessNotes','consignes d’accès',text]]){
      const key=side+suffix,current=actual[key];
      // Missing observations do not override the contract or mean "Non" / zero.
      if(text(current)===''||normalize(current)===normalize(fields[key]))continue;
      const unit=suffix==='Carry'?' m':'';
      add(key,`${place} · ${label}`,text(fields[key])?fields[key]+unit:'',current+unit,'visit',`${place} : ${label} à rapprocher du devis accepté.`);
    }
  }
  // Explicit null means no current reservation. Legacy dates are only used by
  // the compatibility wrapper when no booking argument was supplied.
  const start=booking===undefined?lead.scheduledTime:booking&&!booking.cancelled&&!booking.closure?booking.start:'';
  if(start){
    const date=start.slice(0,10),from=fields.departureStart,to=fields.departureEnd||from;
    if(from&&(date<from||date>to))add('schedule','Date de départ',from===to?dateLabel(from):`${dateLabel(from)} → ${dateLabel(to)}`,dateLabel(date),'slot','Le départ planifié est hors de la période du devis accepté.');
  }
  return rows;
}

export function missionAgreementChanges(lead,quote,acceptance) {
  return missionAgreementReview(lead,quote,acceptance).map(row=>row.message);
}
