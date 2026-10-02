const normal = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim();
export function searchCrmLeads(leads, query, limit=8) {
  const text=normal(query),terms=text.split(/\s+/).filter(Boolean),phone=text.replace(/[^\d]/g,'');
  return leads.map(lead=>{
    const name=normal(lead.fullName),id=normal(lead.id);
    const haystack=normal([lead.fullName,lead.email,lead.phone,lead.id,lead.departureAddress,lead.arrivalAddress,lead.assigneeName].join(' '));
    const phoneMatch=phone.length>=4&&/^[+\d\s().-]+$/.test(text)&&String(lead.phone||'').replace(/\D/g,'').includes(phone);
    const matches=terms.every(t=>haystack.includes(t))||phoneMatch;
    const rank=!text?0:id===text||name===text?0:name.startsWith(text)?1:phoneMatch?2:3;
    return {lead,matches,rank};
  }).filter(r=>r.matches).sort((a,b)=>a.rank-b.rank||String(b.lead.updatedAt||b.lead.createdAt).localeCompare(String(a.lead.updatedAt||a.lead.createdAt))||a.lead.id.localeCompare(b.lead.id)).slice(0,limit).map(r=>r.lead);
}
