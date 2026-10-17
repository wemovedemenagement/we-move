import {validPlanningTime} from './resourceAvailability.mjs';
import {followUpDateIn} from './followUp.mjs';
export const planningSituationLabels={waiting:'Sans réservation',cancelled:'Réservation annulée',legacy:'Ancienne date à confirmer',invalid:'Créneau enregistré à vérifier'};
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
export function requestedDate(value){
  return typeof value==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'T12:00:00Z'))&&new Date(value+'T12:00:00Z').toISOString().slice(0,10)===value?value:'';
}

// The dashboard's planning selection is a reservation task, not a late action
// inferred from the customer's requested date. Keep its deadline unset.
export function planningWorkQueue(leads,bookings,today){
  return planningQueue(leads,bookings,today).map(({lead,situation,date})=>({lead,date:'',bucket:'undated',step:{key:'planning',priority:4,target:'slot',label:situation==='cancelled'?'Replanifier le déménagement':situation==='waiting'?'Réserver les moyens':'Vérifier la réservation',reason:planningSituationLabels[situation]+(date?` · Date souhaitée : ${date.split('-').reverse().join('/')}`:' · Date à convenir')}}));
}
// A requested move date or a legacy scheduledTime never reserves a resource.
export function planningQueue(leads,bookings,today,{state='all',timing='all',owner='all',query=''}={}){
  if(!requestedDate(today))return [];
  const byLead=new Map(bookings.map(b=>[b.leadId,b])),words=fold(query).trim().split(/\s+/).filter(Boolean),end=followUpDateIn(7,today);
  return leads.filter(lead=>lead.status==='confirme').flatMap(lead=>{
    const booking=byLead.get(lead.id);
    if(booking?.closure)return [];
    if(booking&&!booking.cancelled&&validPlanningTime(booking.start)&&validPlanningTime(booking.end)&&booking.end>booking.start)return [];
    const situation=booking?.cancelled?'cancelled':booking?'invalid':lead.scheduledTime?'legacy':'waiting';
    const date=requestedDate(lead.moveDate);
    const bucket=!date?'undated':date<today?'past':date===today?'today':date<end?'week':'upcoming';
    return [{lead,booking,situation,date,bucket}];
  }).filter(row=>(state==='all'||row.situation===state)&&(timing==='all'||row.bucket===timing)&&(owner==='all'||(owner==='unassigned'?!row.lead.assigneeId:row.lead.assigneeId===owner))&&words.every(word=>fold([row.lead.id,row.lead.fullName,row.lead.email,row.lead.phone,row.lead.departureAddress,row.lead.arrivalAddress,row.lead.assigneeName].join(' ')).includes(word)))
    .sort((a,b)=>({past:0,today:1,week:2,upcoming:3,undated:4}[a.bucket]-{past:0,today:1,week:2,upcoming:3,undated:4}[b.bucket])||a.date.localeCompare(b.date)||String(a.lead.createdAt||'').localeCompare(String(b.lead.createdAt||''))||a.lead.id.localeCompare(b.lead.id));
}
