import { parisToday } from './followUp.mjs';
export const visitFormats={domicile:'À domicile',visio:'Visioconférence',telephonique:'Téléphone'};
export const visitBuckets={today:'Aujourd’hui',upcoming:'À venir',review:'À vérifier',unplanned:'À programmer',done:'Effectuées',closed:'Dossiers clos'};
export function visitBucket(lead,today=parisToday()) {
  if(lead.visitStatus==='effectuee')return 'done';
  const closed=['refuse','termine'].includes(lead.status);
  if(closed)return lead.visitDate?'closed':null;
  if(!lead.visitDate)return lead.status==='visite_technique'||lead.nextAction?.type==='visite'?'unplanned':null;
  const day=lead.visitDate.slice(0,10);
  if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(lead.visitDate)||!Number.isFinite(Date.parse(lead.visitDate+'Z'))||new Date(lead.visitDate+'Z').toISOString().slice(0,16)!==lead.visitDate)return 'review';
  return day<today?'review':day===today?'today':'upcoming';
}
export function visitRows(leads,today=parisToday()) {
  const order={review:0,today:1,unplanned:2,upcoming:3,done:4,closed:5};
  return leads.map(lead=>({lead,bucket:visitBucket(lead,today)})).filter(r=>r.bucket).sort((a,b)=>order[a.bucket]-order[b.bucket]||(a.bucket==='done'?String(b.lead.visitDate||'').localeCompare(String(a.lead.visitDate||'')):String(a.lead.visitDate||a.lead.nextAction?.dueDate||'').localeCompare(String(b.lead.visitDate||b.lead.nextAction?.dueDate||'')))||a.lead.id.localeCompare(b.lead.id));
}
