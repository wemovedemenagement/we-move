import {planningAvailability} from './planningAvailability.mjs';

// The mission being edited must not conflict with its own saved reservation.
export function missionResourceAvailability(resources,bookings,start,end,leadId){
  return planningAvailability(resources,bookings.filter(b=>b.leadId!==leadId),start,end);
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
