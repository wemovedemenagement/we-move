import {planningAvailability} from './planningAvailability.mjs';

// The mission being edited must not conflict with its own saved reservation.
export function missionResourceAvailability(resources,bookings,start,end,leadId){
  return planningAvailability(resources,bookings.filter(b=>b.leadId!==leadId),start,end);
}

// Preserve every selected ID, including historical resources absent from the
// current registry. Missing rows must remain visible and removable in the UI.
export function missionSelectionReview(resources,bookings,start,end,leadId,selectedIds,stale=false){
  const availability=missionResourceAvailability(resources,bookings,start,end,leadId);
  const verified=availability.valid&&!stale;
  const saved=bookings.find(b=>b.leadId===leadId);
  const messages={busy:'Déjà réservé sur ce créneau',unavailable:'Indisponibilité sur ce créneau',inactive:'Désactivé dans le registre reçu',missing:'Absent du dernier registre reçu'};
  const byId=new Map(availability.rows.map(row=>[row.resource.id,row]));
  const registry=new Map(resources.map(resource=>[resource.id,resource]));
  const issues=[];
  for(const id of new Set(selectedIds)){
    const resource=registry.get(id),state=!resource?'missing':verified?byId.get(id)?.state:'unchecked';
    if(!Object.hasOwn(messages,state))continue;
    issues.push({id,name:resource?.name||saved?.resources?.find(r=>r.id===id)?.name||'Ressource non retrouvée',state,message:messages[state]});
  }
  return {availability,verified,issues};
}

// No capacity is inferred from free text. This is a volume comparison, not a
// loading plan: rotations, dimensions and payload remain operational decisions.
export function missionCapacity(lead,resources,selectedIds){
  const vehicles=resources.filter(r=>r.kind==='vehicle'&&selectedIds.includes(r.id));
  const known=vehicles.filter(r=>typeof r.capacityM3==='number'&&Number.isFinite(r.capacityM3)&&r.capacityM3>0);
  const capacityM3=Math.round(known.reduce((sum,r)=>sum+r.capacityM3,0)*100)/100;
  const volumeM3=!lead.unknownVolume&&Number.isFinite(Number(lead.volume))&&Number(lead.volume)>0?Number(lead.volume):null;
  const missing=vehicles.length-known.length;
  const state=!vehicles.length?'no_vehicle':volumeM3===null?'no_volume':missing?'unknown':capacityM3<volumeM3?'short':'covered';
  return {state,capacityM3,volumeM3,missing,vehicleCount:vehicles.length};
}
