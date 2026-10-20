import {validPlanningTime} from './resourceAvailability.mjs';
const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
const text=value=>String(value??'').trim();
export const aftercareKindLabels={reservations:'Réserves et incidents',documents:'Documents',other:'Autres suivis'};

export function aftercareDetails(closure) {
  const reservations=text(closure.reservations),missingDocuments=text(closure.missingDocuments);
  const letterMissing=closure.letterReceived===false;
  const kinds=[];
  if(reservations)kinds.push('reservations');
  if(missingDocuments||letterMissing)kinds.push('documents');
  if(!kinds.length)kinds.push('other');
  return {reservations,missingDocuments,letterMissing,kinds};
}

// Search and filters only: never resolves an action or alters its saved deadline.
export function aftercareQueue(bookings,leads,today,{state='open',timing='all',owner='all',query='',kind='all'}={}) {
  if(!validPlanningTime(today+'T00:00')||!['open','resolved','all'].includes(state)||!['all','overdue','today','upcoming','undated','incomplete'].includes(timing)||kind!=='all'&&!Object.hasOwn(aftercareKindLabels,kind))return [];
  const clients=new Map(leads.map(lead=>[lead.id,lead]));
  const search=normalize(query).trim().split(/\s+/).filter(Boolean);
  return bookings.filter(booking=>!booking.cancelled&&text(booking.closure?.followUp)&&clients.get(booking.leadId)?.status!=='refuse').map(booking=>{
    const closure=booking.closure,lead=clients.get(booking.leadId),dueKnown=validPlanningTime(closure.due),resolved=closure.resolved===true;
    const day=dueKnown?closure.due.slice(0,10):'';
    return {booking,lead,resolved,dueKnown,incomplete:!dueKnown||!text(closure.owner),...aftercareDetails(closure),bucket:resolved?'resolved':!dueKnown?'undated':day<today?'overdue':day===today?'today':'upcoming'};
  }).filter(row=>{
    const closure=row.booking.closure;
    return (state==='all'||(state==='resolved'?row.resolved:!row.resolved))&&
      (timing==='all'||(timing==='incomplete'?!row.resolved&&row.incomplete:row.bucket===timing))&&
      (owner==='all'||(owner==='__missing__'?!text(closure.owner):text(closure.owner)===owner))&&
      (kind==='all'||row.kinds.includes(kind))&&
      search.every(word=>normalize([row.booking.clientName,row.lead?.fullName,row.booking.leadId,closure.followUp,closure.owner,closure.reservations,closure.missingDocuments,row.lead?.departureAddress,row.lead?.arrivalAddress].join(' ')).includes(word));
  }).sort((a,b)=>Number(a.resolved)-Number(b.resolved)||({overdue:0,today:1,undated:2,upcoming:3,resolved:4}[a.bucket]-{overdue:0,today:1,undated:2,upcoming:3,resolved:4}[b.bucket])||Number(b.dueKnown)-Number(a.dueKnown)||(a.dueKnown&&b.dueKnown?text(a.booking.closure.due).localeCompare(text(b.booking.closure.due)):0)||a.booking.leadId.localeCompare(b.booking.leadId));
}
