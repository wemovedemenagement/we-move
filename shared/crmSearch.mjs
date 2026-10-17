const normal = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim();
const nationalPhone=value=>{
  const digits=String(value||'').replace(/\D/g,'');
  const french=digits.match(/^(?:0033|33)0?([1-9]\d{8})$/);
  if(french)return '0'+french[1];
  return digits;
};
function searchInput(query){
  const text=normal(query),terms=text.split(/\s+/).filter(Boolean),phone=text.replace(/[^\d]/g,'');
  return {text,terms,phone};
}
function evaluate(lead,{text,terms,phone}){
    if(!text)return {lead,matches:true,rank:0};
    const name=normal(lead.fullName),id=normal(lead.id);
    const national=nationalPhone(lead.phone),international=/^0[1-9]\d{8}$/.test(national)?'+33'+national.slice(1):'';
    const haystack=normal([lead.fullName,lead.email,lead.phone,national,international,international.replace('+','00'),String(lead.phone||'').replace(/\D/g,''),lead.id,lead.departureAddress,lead.arrivalAddress,lead.assigneeName].join(' '));
    const phoneMatch=phone.length>=4&&/^[+\d\s().-]+$/.test(text)&&(String(lead.phone||'').replace(/\D/g,'').includes(phone)||nationalPhone(lead.phone).includes(nationalPhone(text)));
    const matches=terms.every(t=>haystack.includes(t))||phoneMatch;
    const rank=!text?0:id===text||name===text?0:name.startsWith(text)?1:phoneMatch?2:3;
    return {lead,matches,rank};
}
// Compile once per query. Filtering a module must keep its chosen sort order,
// pagination and selection policy rather than apply the command palette ranking.
export function createCrmLeadMatcher(query){
  const input=searchInput(query);
  return lead=>evaluate(lead,input).matches;
}
export function searchCrmLeads(leads, query, limit=8) {
  const input=searchInput(query);
  return leads.map(lead=>evaluate(lead,input)).filter(r=>r.matches).sort((a,b)=>a.rank-b.rank||String(b.lead.updatedAt||b.lead.createdAt).localeCompare(String(a.lead.updatedAt||a.lead.createdAt))||a.lead.id.localeCompare(b.lead.id)).slice(0,limit).map(r=>r.lead);
}
