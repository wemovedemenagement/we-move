const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
export function aftercareQueue(bookings,leads,today,{state='open',timing='all',owner='all',query=''}={}) {
  const clients=new Map(leads.map(lead=>[lead.id,lead]));
  const search=normalize(query).trim().split(/\s+/).filter(Boolean);
  return bookings.filter(b=>!b.cancelled&&b.closure?.followUp&&clients.get(b.leadId)?.status!=='refuse').map(booking=>{
    const c=booking.closure,day=c.due.slice(0,10),resolved=c.resolved===true;
    return {booking,lead:clients.get(booking.leadId),resolved,bucket:resolved?'resolved':day<today?'overdue':day===today?'today':'upcoming'};
  }).filter(row=>{
    const c=row.booking.closure;
    return (state==='all'||(state==='resolved'?row.resolved:!row.resolved))&&
      (timing==='all'||row.bucket===timing)&&(owner==='all'||c.owner===owner)&&
      search.every(word=>normalize([row.booking.clientName,c.followUp,c.owner,row.lead?.departureAddress,row.lead?.arrivalAddress].join(' ')).includes(word));
  }).sort((a,b)=>Number(a.resolved)-Number(b.resolved)||a.booking.closure.due.localeCompare(b.booking.closure.due)||a.booking.leadId.localeCompare(b.booking.leadId));
}
