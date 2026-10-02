import { billingRow } from './crmBillingOverview.mjs';
import { draftError } from './crmDraftModel.mjs';
const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr').trim();
export function billingSearch(records, query, today) {
  const search = query.search ?? '', status = query.status ?? 'all', sort = query.sort ?? 'recent', pageText = query.page ?? '1';
  if(typeof search !== 'string' || search.length > 180 || !['all','a_regler','partiel','regle','retard','credite','avoir','refund'].includes(status) || !['recent','oldest','client','due'].includes(sort) || typeof pageText !== 'string' || !/^[1-9]\d{0,5}$/.test(pageText))
    draftError(400,'Filtres de facturation invalides.');
  const terms = normalize(search).split(/\s+/).filter(Boolean);
  const all = records.filter(d=>d.mode === 'live').map(d=>({...billingRow(d,today),quoteReference:d.quoteReference || '',creditNumber:d.creditNumber || null}));
  const found = all.filter(d=>(status === 'all' || (status === 'refund' ? d.refundDueCents > 0 : d.status === status)) && terms.every(term=>normalize([d.number,d.clientName,d.quoteReference].join(' ')).includes(term)));
  const recent = (a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)) || a.id.localeCompare(b.id);
  found.sort(sort === 'oldest' ? (a,b)=>-recent(a,b) : sort === 'client' ? (a,b)=>a.clientName.localeCompare(b.clientName,'fr',{sensitivity:'base'})||recent(a,b) : sort === 'due' ? (a,b)=>String(a.dueDate||'9999').localeCompare(String(b.dueDate||'9999'))||recent(a,b) : recent);
  const pageSize = 20, pages = Math.max(1,Math.ceil(found.length/pageSize)), page = Math.min(Number(pageText),pages);
  return {documents:found.slice((page-1)*pageSize,page*pageSize),page,pages,pageSize,total:found.length,totalDocuments:all.length};
}
