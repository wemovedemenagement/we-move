import {moveOperationIssues} from './moveOperations.mjs';
// These are missing recorded details, not a certification that a move is ready.
export function movePreparation(lead, booking, registry) {
  if(booking.cancelled || ['termine','refuse'].includes(lead?.status))return [];
  if(!lead)return ['Dossier client indisponible'];
  const issues=[];
  if(!lead.departureAddress?.trim())issues.push('Adresse de départ à compléter');
  if(!lead.arrivalAddress?.trim())issues.push('Adresse d’arrivée à compléter');
  if(!lead.phone?.trim()&&!lead.email?.trim())issues.push('Contact client à compléter');
  if(!(Number(lead.volume)>0))issues.push('Volume à préciser');
  const resources=booking.resourceIds.map(id=>registry.resources.find(r=>r.id===id)).filter(Boolean);
  if(!resources.some(r=>r.kind==='vehicle'&&r.active))issues.push('Véhicule à affecter');
  if(!resources.some(r=>r.kind==='person'&&r.active))issues.push('Intervenant à affecter');
  if(booking.resourceIds.some(id=>!registry.resources.some(r=>r.id===id&&r.active)))issues.push('Ressource supprimée ou désactivée');
  if(booking.operations)issues.push(...moveOperationIssues(booking.operations));
  return issues;
}
