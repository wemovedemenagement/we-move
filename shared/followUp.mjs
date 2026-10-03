export const actionLabels = {rappeler:'Rappeler',visite:'Prévoir une visite',devis:'Préparer un devis',relancer:'Relancer le client',planifier:'Planifier le déménagement',facturer:'Préparer la facturation'};
export function parisToday(now=new Date()) {
  const parts=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(now);
  return ['year','month','day'].map(type=>parts.find(part=>part.type===type).value).join('-');
}

export function followUpDateIn(days, today=parisToday()) {
  const date=new Date(today+'T12:00:00Z');
  date.setUTCDate(date.getUTCDate()+days);
  return date.toISOString().slice(0,10);
}
export function followUpBucket(lead,today=parisToday()) {
  if(!lead.nextAction||['refuse','termine'].includes(lead.status))return 'none';
  return lead.nextAction.dueDate<today?'overdue':lead.nextAction.dueDate===today?'today':'upcoming';
}
