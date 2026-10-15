import {movePreparationDetails} from './movePreparation.mjs';
export function departureReadiness(leads,bookings,registry,today,days=7) {
  if(![1,7,30].includes(days))return [];
  const end=new Date(today+'T12:00:00Z');
  if(!Number.isFinite(end.getTime()))return [];
  end.setUTCDate(end.getUTCDate()+days);
  const endTime=end.toISOString().slice(0,10)+'T00:00',startTime=today+'T00:00';
  const byId=new Map(leads.map(l=>[l.id,l]));
  return bookings.filter(b=>!b.cancelled&&!b.closure&&b.start<endTime&&b.end>startTime&&!['termine','refuse'].includes(byId.get(b.leadId)?.status)).map(booking=>({booking,lead:byId.get(booking.leadId),issues:movePreparationDetails(byId.get(booking.leadId),booking,registry)})).sort((a,b)=>a.booking.start.localeCompare(b.booking.start)||a.booking.leadId.localeCompare(b.booking.leadId));
}
