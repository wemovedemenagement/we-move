import {validPlanningTime} from './resourceAvailability.mjs';
const fold=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
export function parisMinute(now=new Date()){
  const date=new Date(now);
  if(!Number.isFinite(date.getTime()))return '';
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(date);
  const get=type=>parts.find(p=>p.type===type).value;
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}
// These are planned time windows only. Completion is always recorded by a user.
export function missionTimeline(bookings,leads,now=new Date(),{state='all',query=''}={}){
  const minute=parisMinute(now);
  if(!minute)return [];
  const today=minute.slice(0,10),clients=new Map(leads.map(l=>[l.id,l])),words=fold(query).trim().split(/\s+/).filter(Boolean);
  return bookings.filter(b=>!b.cancelled&&!b.closure&&validPlanningTime(b.start)&&validPlanningTime(b.end)&&b.end>b.start).map(booking=>{
    const lead=clients.get(booking.leadId);
    const bucket=booking.end<=minute?'review':booking.start<=minute?'ongoing':booking.start.slice(0,10)===today?'upcoming':null;
    return {booking,lead,bucket};
  }).filter(row=>row.bucket&&(!row.lead||row.lead.status==='confirme'||row.lead.status==='termine'&&row.bucket==='review')&&(state==='all'||row.bucket===state)&&words.every(word=>fold([row.booking.clientName,row.lead?.departureAddress,row.lead?.arrivalAddress,...(row.booking.resources||[]).map(r=>r.name)].join(' ')).includes(word)))
    .sort((a,b)=>({review:0,ongoing:1,upcoming:2}[a.bucket]-{review:0,ongoing:1,upcoming:2}[b.bucket])||(a.bucket==='upcoming'?a.booking.start.localeCompare(b.booking.start):a.booking.end.localeCompare(b.booking.end))||a.booking.leadId.localeCompare(b.booking.leadId));
}
