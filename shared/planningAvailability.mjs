import {overlapsPeriod,validPlanningTime} from './resourceAvailability.mjs';

// Inspect all reservations, independently of the calendar's display filters.
export function planningAvailability(resources,bookings,start,end){
 if(!validPlanningTime(start)||!validPlanningTime(end)||end<=start)return {valid:false,rows:[]};
 const rows=resources.map(resource=>{
  const reservations=bookings.filter(b=>!b.cancelled&&b.resourceIds.includes(resource.id)&&overlapsPeriod(b,start,end)).sort((a,b)=>a.start.localeCompare(b.start));
  const absences=(resource.unavailablePeriods||[]).filter(p=>overlapsPeriod(p,start,end)).sort((a,b)=>a.start.localeCompare(b.start));
  return {resource,reservations,absences,state:!resource.active?'inactive':absences.length?'unavailable':reservations.length?'busy':'available'};
 });
 const order={available:0,busy:1,unavailable:2,inactive:3};
 rows.sort((a,b)=>order[a.state]-order[b.state]||a.resource.name.localeCompare(b.resource.name,'fr')||a.resource.id.localeCompare(b.resource.id));
 return {valid:true,rows};
}
