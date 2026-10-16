export function missionAgreementChanges(lead,quote,acceptance) {
  if(!acceptance)return [];
  const fields=acceptance.quote.document?.fields||{},changes=[];
  if(quote?.revision!==acceptance.quoteRevision)changes.push('Une autre version du devis existe. Elle ne remplace pas l’accord enregistré.');
  for(const [key,label] of [['departureAddress','L’adresse de départ du dossier'],['arrivalAddress','L’adresse d’arrivée du dossier']])
    if(String(lead[key]||'').trim()!==String(fields[key]||'').trim())changes.push(label+' diffère de la version acceptée.');
  if(lead.unknownVolume||Number(lead.volume)!==Number(fields.volume))changes.push('Le volume du dossier diffère ou reste à préciser.');
  if(lead.scheduledTime){
    const date=lead.scheduledTime.slice(0,10),from=fields.departureStart,to=fields.departureEnd||from;
    if(from&&(date<from||date>to))changes.push('Le départ planifié est hors de la période du devis accepté.');
  }
  return changes;
}
