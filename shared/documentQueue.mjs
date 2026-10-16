import {documentChecklistDetails} from './documentChecklist.mjs';
import {followUpDateIn} from './followUp.mjs';

const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
const validTime=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)&&Number.isFinite(Date.parse(value+'Z'))&&new Date(value+'Z').toISOString().slice(0,16)===value;
export const documentTimingLabels={past:'Créneau passé à vérifier',started:'Créneau commencé',today:'Départ aujourd’hui',week:'Départ sous 7 jours',upcoming:'Départ à venir',unplanned:'À planifier'};
export const documentPriorityBuckets=['past','started','today','week'];

// The date is the registered booking, never a customer's requested move date.
export function documentQueue(leads,bookings,today,{piece='all',state='all',timing='all',owner='all',query=''}={}) {
  const byLead=new Map(bookings.map(booking=>[booking.leadId,booking]));
  const words=normalize(query).trim().split(/\s+/).filter(Boolean),end=followUpDateIn(7,today);
  const ranks={past:0,started:1,today:2,week:3,upcoming:4,unplanned:5};
  return leads.filter(lead=>lead.status==='confirme'&&!byLead.get(lead.id)?.closure).map(lead=>{
    const recorded=byLead.get(lead.id),booking=recorded&&!recorded.cancelled&&validTime(recorded.start)&&validTime(recorded.end)&&recorded.end>recorded.start?recorded:null;
    const date=booking?.start.slice(0,10)||'';
    const bucket=!booking?'unplanned':booking.end<=today+'T00:00'?'past':date<today?'started':date===today?'today':date<end?'week':'upcoming';
    return {lead,booking,date,bucket,issues:documentChecklistDetails(lead).filter(row=>row.state!=='received')};
  }).filter(row=>{
    const lead=row.lead;
    return row.issues.some(issue=>(piece==='all'||issue.key===piece)&&(state==='all'||issue.state===state))&&
      (timing==='all'||(timing==='priority'?documentPriorityBuckets.includes(row.bucket):row.bucket===timing))&&
      (owner==='all'||(owner==='unassigned'?!lead.assigneeId:lead.assigneeId===owner))&&
      words.every(word=>normalize([lead.id,lead.fullName,lead.phone,lead.email,lead.departureAddress,lead.arrivalAddress,lead.assigneeName,lead.documentChecklist?.signedQuote?.reference,lead.documentChecklist?.valueDeclaration?.reference].join(' ')).includes(word));
  }).sort((a,b)=>ranks[a.bucket]-ranks[b.bucket]||(a.date||'').localeCompare(b.date||'')||String(a.lead.createdAt||'').localeCompare(String(b.lead.createdAt||''))||String(a.lead.id).localeCompare(String(b.lead.id)));
}
