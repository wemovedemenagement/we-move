import {moveOperationIssues} from './moveOperations.mjs';
import {resourceAbsence} from './resourceAvailability.mjs';
import {documentChecklistIssues} from './documentChecklist.mjs';
// Recorded information only: this is not a certification that a move is ready.
export function movePreparationDetails(lead, booking, registry) {
  if(booking.cancelled || booking.closure || ['termine','refuse'].includes(lead?.status))return [];
  if(!lead)return [{label:'Dossier client indisponible',target:'summary'}];
  const issues=[];
  const add=(label,target='move')=>issues.push({label,target});
  if(lead.status!=='confirme')add('Acceptation du dossier à vérifier','summary');
  if(!lead.departureAddress?.trim())add('Adresse de départ à compléter','details');
  if(!lead.arrivalAddress?.trim())add('Adresse d’arrivée à compléter','details');
  if(!lead.phone?.trim()&&!lead.email?.trim())add('Contact client à compléter','details');
  if(lead.unknownVolume||!(Number(lead.volume)>0))add('Volume à préciser','details');
  const resources=booking.resourceIds.map(id=>registry.resources.find(r=>r.id===id)).filter(Boolean);
  if(!resources.some(r=>r.kind==='vehicle'&&r.active))add('Véhicule à affecter','team');
  if(!resources.some(r=>r.kind==='person'&&r.active))add('Intervenant à affecter','team');
  if(booking.resourceIds.some(id=>!registry.resources.some(r=>r.id===id&&r.active)))add('Ressource supprimée ou désactivée','team');
  if(resources.some(r=>resourceAbsence(r,booking.start,booking.end)))add('Indisponibilité sur le créneau réservé','team');
  for(const label of moveOperationIssues(booking.operations))add(label,'preparation');
  for(const label of documentChecklistIssues(lead))add(label,'documents');
  return issues;
}
export function movePreparation(lead,booking,registry) {
  return movePreparationDetails(lead,booking,registry).map(issue=>issue.label);
}
