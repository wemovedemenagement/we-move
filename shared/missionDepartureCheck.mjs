import {missionFieldSheet} from './missionFieldSheet.mjs';
import {missionSelectionReview,missionCapacity} from './missionResources.mjs';
import {moveOperationIssues} from './moveOperations.mjs';
import {documentChecklistIssues} from './documentChecklist.mjs';

/** Read-only checks on saved data, never an authorisation to depart.
 * @param {import('../src/services/crmService').CrmDossier} dossier
 * @param {import('../src/services/crmService').MoveBooking|null} booking
 * @param {import('../src/services/crmService').PlanningData} planning
 * @param {boolean} stale
 */
export function missionDepartureCheck(dossier,booking,planning,stale=false) {
  if(booking?.cancelled||booking?.closure||['refuse','termine'].includes(dossier.lead.status))return {inactive:true,groups:[],count:0};
  const sheet=missionFieldSheet(dossier,booking,planning.registry);
  /** @type {{title:string,issues:{label:string,target:string}[]}[]} */
  const groups=[];
  const add=(title,issues)=>{if(issues.length)groups.push({title,issues});};
  add('Dossier',[
    ...(!sheet.phoneLink?[{label:'Téléphone client à vérifier',target:'details'}]:[]),
    ...(sheet.volume==='À confirmer'?[{label:'Volume du dossier à préciser',target:'details'}]:[]),
    ...(dossier.lead.status!=='confirme'?[{label:'Statut du dossier à vérifier',target:'details'}]:[]),
  ]);
  const access=[];
  for(const part of sheet.access){
    const place=part.side==='departure'?'départ':'arrivée';
    if(!part.address)access.push({label:`Adresse ${place} à compléter`,target:'details'});
    for(const row of part.rows)if(row.value==='À confirmer')access.push({label:`${row.label} ${place} à préciser`,target:'visit'});
  }
  add('Adresses et accès',access);
  add('Accord client',!dossier.acceptance?[{label:'Accord sur une version du devis à vérifier',target:'agreement'}]:sheet.agreementIssues.map(row=>({label:row.message,target:row.target==='quote'?'agreement':row.target})));
  const selection=missionSelectionReview(planning.registry.resources,planning.bookings,booking?.start||'',booking?.end||'',dossier.lead.id,booking?.resourceIds||[],stale);
  add('Créneau',!booking?[{label:'Créneau de déménagement à réserver',target:'slot'}]:!selection.availability.valid?[{label:'Horaires de réservation à vérifier',target:'slot'}]:[]);
  const resources=[];
  if(stale)resources.push({label:'Planning non actualisé : disponibilités à relire',target:'team'});
  else if(booking){
    for(const issue of selection.issues)resources.push({label:`${issue.name} : ${issue.message}`,target:'team'});
    const selected=planning.registry.resources.filter(r=>booking.resourceIds.includes(r.id)&&r.active);
    if(!selected.some(r=>r.kind==='vehicle'))resources.push({label:'Véhicule actif à affecter',target:'team'});
    if(!selected.some(r=>r.kind==='person'))resources.push({label:'Intervenant actif à affecter',target:'team'});
    const capacity=missionCapacity(dossier.lead,planning.registry.resources,booking.resourceIds);
    if(capacity.state==='short')resources.push({label:`Volume du dossier (${capacity.volumeM3} m³) supérieur à la capacité déclarée (${capacity.capacityM3} m³) : organisation à vérifier`,target:'team'});
  }
  add('Équipe et moyens',resources);
  if(booking)add('Préparation',moveOperationIssues(booking.operations).map(label=>({label,target:'preparation'})));
  add('Pièces client',documentChecklistIssues({...dossier.lead,acceptedQuoteRevision:dossier.acceptance?.quoteRevision||dossier.lead.acceptedQuoteRevision}).map(label=>({label,target:'documents'})));
  return {inactive:false,groups,count:groups.reduce((sum,group)=>sum+group.issues.length,0)};
}
