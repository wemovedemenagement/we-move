// Read-only projection from the saved booking, never from a client-supplied lead.
export function withMoveFollowUps(leads, bookings) {
  const byLead=new Map(bookings.map(b=>[b.leadId,b]));
  return leads.map(lead=>{
    const booking=byLead.get(lead.id),closure=booking?.closure;
    const active=!booking?.cancelled&&closure?.followUp&&!closure.resolved;
    return {...lead,moveFollowUp:active?{note:closure.followUp,owner:closure.owner,due:closure.due}:null};
  });
}
export function moveFollowUpStep(lead,today) {
  const action=lead.moveFollowUp;
  if(!action||lead.status==='refuse')return null;
  const day=action.due.slice(0,10);
  return {key:'aftercare',label:'Traiter le suivi de mission',target:'move',priority:day<today?0:day===today?1:5,
    reason:`${action.note} · Échéance : ${action.due.replace('T',' à ')}`};
}
