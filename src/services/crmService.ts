/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuoteLead, CrmStats } from '../types/crm';

let tokenProvider: (()=>Promise<string|null>) | null = null;
export function setCrmTokenProvider(provider: typeof tokenProvider) { tokenProvider=provider; }
export async function downloadBillingExport(kind:string,from:string,to:string) {
  const token=tokenProvider?await tokenProvider():null;
  const response=await fetch('/api/crm/billing/export?'+new URLSearchParams({kind,from,to}),{cache:'no-store',headers:token?{Authorization:'Bearer '+token}:{},signal:AbortSignal.timeout(60000)});
  if(!response.ok){const body=await response.json().catch(()=>null);throw new Error(body?.error||'Export indisponible. Réessayez.');}
  if(!response.headers.get('content-type')?.includes('text/csv'))throw new Error('Format d’export inattendu.');
  const href=URL.createObjectURL(await response.blob());
  const a=document.createElement('a');a.href=href;a.download=`WE-MOVE-${kind}-${from}-${to}.csv`;a.click();setTimeout(()=>URL.revokeObjectURL(href),30000);
  return Number(response.headers.get('X-Export-Count')||0);
}
// The server is the only source of truth: never report a local fallback as saved.
export async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    const token=tokenProvider?await tokenProvider():null;
    response = await fetch(url, { ...options, cache: 'no-store', signal: options.signal||AbortSignal.timeout(15000), headers: { 'Content-Type': 'application/json', ...(token?{Authorization:'Bearer '+token}:{}), ...options.headers } });
  } catch {
    throw new Error('Connexion au serveur impossible. Vos informations sont conservées dans le formulaire ; réessayez.');
  }
  const data = await response.json().catch(() => null);
  if (!response.ok || !data?.success) throw new Error(data?.error || 'La demande n’a pas pu être enregistrée. Veuillez réessayer.');
  return data;
}

export async function submitQuoteLead(payload: Partial<QuoteLead>): Promise<QuoteLead> {
  const data = await request<{ quote: QuoteLead }>('/api/quotes', { method: 'POST', body: JSON.stringify(payload), signal: AbortSignal.timeout(90000) });
  return data.quote;
}
export async function fetchQuoteLeads(status?: string, search?: string): Promise<QuoteLead[]> {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (search?.trim()) params.set('search', search.trim());
  return (await request<{ quotes: QuoteLead[] }>(`/api/quotes?${params}`)).quotes;
}
export async function updateQuoteLead(id: string, updates: Partial<QuoteLead> & { newNote?: string; author?: string }): Promise<QuoteLead | null> {
  return (await request<{ quote: QuoteLead }>(`/api/quotes/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(updates) })).quote;
}
export async function deleteQuoteLead(id: string): Promise<boolean> {
  await request(`/api/quotes/${encodeURIComponent(id)}`, { method: 'DELETE' });
  return true;
}
export async function fetchCrmStats(): Promise<CrmStats> {
  return (await request<{ stats: CrmStats }>('/api/crm/stats')).stats;
}


export async function fetchQuoteDrafts(): Promise<import('../types/crm').CrmQuoteDraft[]> {
  return (await request<{drafts: import('../types/crm').CrmQuoteDraft[]}>('/api/crm/quote-drafts')).drafts;
}
export async function createQuoteDraft(leadId: string): Promise<import('../types/crm').CrmQuoteDraft> {
  return (await request<{draft: import('../types/crm').CrmQuoteDraft}>('/api/crm/quote-drafts', {method:'POST',body:JSON.stringify({leadId})})).draft;
}
export async function saveQuoteDraft(id: string, payload: import('../types/crm').CrmQuoteDraftUpdate): Promise<import('../types/crm').CrmQuoteDraft> {
  return (await request<{draft: import('../types/crm').CrmQuoteDraft}>(`/api/crm/quote-drafts/${encodeURIComponent(id)}`, {method:'PATCH',body:JSON.stringify(payload)})).draft;
}

export async function fetchCrmMembers(): Promise<import('../types/crm').CrmMember[]> { return (await request<{members:import('../types/crm').CrmMember[]}>('/api/crm/members')).members; }
export async function fetchCrmIdentity(): Promise<import('../types/crm').CrmIdentity> { return (await request<{identity:import('../types/crm').CrmIdentity}>('/api/crm/session')).identity; }
export async function saveRequestFollowUp(id:string,payload:import('../types/crm').FollowUpUpdate): Promise<QuoteLead> {
  return (await request<{quote:QuoteLead}>('/api/quotes/'+encodeURIComponent(id)+'/follow-up',{method:'PATCH',body:JSON.stringify(payload)})).quote;
}

export type CrmPdfType='devis'|'mission'|'lettre-voiture'|'declaration-valeur'|'cgv-rgpd'|'proforma';
export interface QuoteMail {id:string;revision:number;reference:string;to:string;from:string;subject:string;message:string;state:'sending'|'accepted'|'failed'|'uncertain';createdAt:string;acceptedAt:string|null;actor:string;error:string|null;}
export interface QuoteMailPreparation {revision:number;to:string;reference:string;subject:string;message:string;issues:string[];configuration:{ready:boolean;from:string;message:string};history:QuoteMail[];}
export async function prepareQuoteMail(id:string){return (await request<{preparation:QuoteMailPreparation}>(`/api/crm/quote-drafts/${encodeURIComponent(id)}/email`)).preparation;}
export async function sendQuoteMail(id:string,payload:{confirm:true;revision:number;subject:string;message:string}){return (await request<{delivery:QuoteMail}>(`/api/crm/quote-drafts/${encodeURIComponent(id)}/email`,{method:'POST',body:JSON.stringify(payload),signal:AbortSignal.timeout(90000)})).delivery;}
export async function downloadQuoteMailPdf(id:string,key:string){
 const token=tokenProvider?await tokenProvider():null;
 const response=await fetch(`/api/crm/quote-drafts/${encodeURIComponent(id)}/email/${encodeURIComponent(key)}/pdf`,{cache:'no-store',headers:token?{Authorization:'Bearer '+token}:{}});
 if(!response.ok)throw new Error('Archive indisponible.');
 const url=URL.createObjectURL(await response.blob()),a=document.createElement('a');a.href=url;a.download='WE-MOVE-devis-archive.pdf';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export async function downloadCrmPdf(id:string,type:CrmPdfType) {
 const token=tokenProvider?await tokenProvider():null;
 const response=await fetch(`/api/crm/quote-drafts/${encodeURIComponent(id)}/pdf/${type}`,{cache:'no-store',signal:AbortSignal.timeout(60000),headers:token?{Authorization:'Bearer '+token}:{}});
 if(!response.ok){const data=await response.json().catch(()=>null);throw new Error(data?.error||'Génération PDF impossible.');}
 const blob=await response.blob();const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`WE-MOVE-${type}.pdf`;document.body.appendChild(link);link.click();link.remove();window.setTimeout(()=>URL.revokeObjectURL(url),30000);
}
export interface InvoicePreparation {id:string;quoteId:string;quoteReference:string;quoteRevision:number;revision:number;clientName:string;clientAddress:string;clientEmail:string;amountHT:number;taxAmount:number;amountTTC:number;taxRate:number;status:'brouillon';number:null;dueDate:string;notes:string;updatedAt:string;items:{description:string;quantity:number;unitPriceHT:number}[];}
export async function fetchInvoicePreparations(){return (await request<{invoices:InvoicePreparation[]}>('/api/crm/invoice-preparations')).invoices;}
export async function createInvoicePreparation(quoteId:string){return (await request<{invoice:InvoicePreparation}>('/api/crm/invoice-preparations',{method:'POST',body:JSON.stringify({quoteId})})).invoice;}
export async function saveInvoicePreparation(invoice:InvoicePreparation,dueDate:string,notes:string){return (await request<{invoice:InvoicePreparation}>('/api/crm/invoice-preparations/'+encodeURIComponent(invoice.id),{method:'PATCH',body:JSON.stringify({revision:invoice.revision,dueDate,notes})})).invoice;}

export interface InvoiceTestState {mode:'test';session:number;counter:number;revision:number;lastNumber:string|null;}
export async function fetchInvoiceTestState(){return (await request<{state:InvoiceTestState}>('/api/crm/invoice-tests')).state;}
export async function changeInvoiceTestState(state:InvoiceTestState,action:'number'|'reset',invoiceId?:string){return (await request<{state:InvoiceTestState}>('/api/crm/invoice-tests',{method:'POST',body:JSON.stringify({revision:state.revision,action,invoiceId})})).state;}

export interface CrmDossier {lead:QuoteLead;quote:import('../types/crm').CrmQuoteDraft|null;invoice:InvoicePreparation|null;mails:QuoteMail[];billing:BillingRow[];}
export interface BillingRow {id:string;number:string;kind:string;invoiceId:string;leadId:string;clientName:string;issueDate:string;dueDate:string;createdAt:string;amountTTC:number;creditedTTC:number;paidCents:number;dueCents:number;refundDueCents:number;status:string;}
export interface BillingOverview {asOf:string;today:string;month:string;documentCount:number;invoiceCount:number;creditCount:number;dueCents:number;overdueCents:number;refundDueCents:number;receivedCents:number;refundedCents:number;netReceivedCents:number;openCount:number;overdueCount:number;priorityCount:number;priorities:(BillingRow&{reason:'refund'|'overdue'|'today'|'upcoming';daysOverdue:number})[];}
export async function fetchCrmDossier(id:string){return (await request<{dossier:CrmDossier}>('/api/crm/dossiers/'+encodeURIComponent(id))).dossier;}

export interface CrmResource {id:string;name:string;kind:'vehicle'|'person'|'lift';detail:string;active:boolean;}
export interface ResourceRegistry {revision:number;resources:CrmResource[];}
export interface MoveBooking {leadId:string;clientName:string;start:string;end:string;resourceIds:string[];resources:Pick<CrmResource,'id'|'name'|'kind'>[];revision:number;cancelled:boolean;}
export interface PlanningData {registry:ResourceRegistry;bookings:MoveBooking[];}
export async function fetchPlanning(){return (await request<{planning:PlanningData}>('/api/crm/planning')).planning;}
export async function saveCrmResource(payload:Omit<CrmResource,'id'>&{id?:string;revision:number}){return (await request<{registry:ResourceRegistry}>('/api/crm/resources',{method:'POST',body:JSON.stringify(payload)})).registry;}
export async function saveCrmBooking(id:string,payload:{revision:number;start?:string;end?:string;resourceIds?:string[];cancel?:boolean}){return await request<{booking:MoveBooking;lead:QuoteLead}>('/api/crm/planning/'+encodeURIComponent(id),{method:'PUT',body:JSON.stringify(payload)});}

export interface TestBillingPayment {id:string;amountCents:number;date:string;method:string;reference:string;createdAt:string;createdBy:string;reversedAt?:string;reversalReason?:string;}
export interface TestBillingDocument {id:string;number:string;mode:'test';session:number;invoiceId:string;kind:'facture'|'acompte'|'solde';clientName:string;quoteReference:string;amountHT:number;taxAmount:number;amountTTC:number;totalProjectTTC:number;depositTTC:number;depositNumber:string|null;taxRate:number;depositRate:number|null;dueDate:string;issueDate:string;createdAt:string;revision:number;payments:TestBillingPayment[];paidCents:number;dueCents:number;status:'a_regler'|'partiel'|'regle';}
export async function fetchTestBillingDocuments(){return (await request<{documents:TestBillingDocument[]}>('/api/crm/invoice-tests/documents')).documents;}
export async function issueTestBillingDocument(state:InvoiceTestState,invoiceId:string,kind:TestBillingDocument['kind'],depositRate?:number){return request<{state:InvoiceTestState;document:TestBillingDocument}>('/api/crm/invoice-tests/documents',{method:'POST',body:JSON.stringify({revision:state.revision,invoiceId,kind,...(kind==='acompte'?{depositRate}:{})})});}
export async function saveTestBillingPayment(document:TestBillingDocument,payload:{action:'add';amountCents:number;date:string;method:string;reference:string}|{action:'reverse';paymentId:string;reason:string}){return (await request<{document:TestBillingDocument}>('/api/crm/invoice-tests/documents/'+encodeURIComponent(document.id)+'/payments',{method:'PATCH',body:JSON.stringify({revision:document.revision,...payload})})).document;}
export async function downloadTestBillingPdf(id:string,number:string){const token=tokenProvider?await tokenProvider():null;const response=await fetch('/api/crm/invoice-tests/documents/'+encodeURIComponent(id)+'/pdf',{cache:'no-store',headers:token?{Authorization:'Bearer '+token}:{},signal:AbortSignal.timeout(60000)});if(!response.ok){const body=await response.json().catch(()=>null);throw new Error(body?.error||'PDF de test indisponible.');}const url=URL.createObjectURL(await response.blob());const link=document.createElement('a');link.href=url;link.download='WE-MOVE-'+number+'.pdf';link.click();setTimeout(()=>URL.revokeObjectURL(url),30000);}
export async function billingPdf(url:string,filename:string,payload?:unknown){const token=tokenProvider?await tokenProvider():null;const response=await fetch(url,{method:payload?'POST':'GET',cache:'no-store',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(payload?{body:JSON.stringify(payload)}:{}),signal:AbortSignal.timeout(60000)});if(!response.ok){const body=await response.json().catch(()=>null);throw new Error(body?.error||'PDF indisponible.');}const href=URL.createObjectURL(await response.blob());const a=document.createElement('a');a.href=href;a.download=filename;a.click();setTimeout(()=>URL.revokeObjectURL(href),30000);}
export interface PricingSettings {revision:number;enabled:boolean;formulas:{id:string;enabled:boolean;base:number|null;perM3:number|null;perKm:number|null;minimum:number|null}[];extras:Record<string,number|null>;updatedAt:string|null;updatedBy:string|null;}
export interface PricingEstimate {revision:number;items:{description:string;quantity:number;unitPriceHT:number}[];amountHT:number;warnings:string[];}
export async function getPricing(){return (await request<{settings:PricingSettings}>('/api/crm/pricing')).settings;}
export async function savePricing(settings:PricingSettings){return (await request<{settings:PricingSettings}>('/api/crm/pricing',{method:'PUT',body:JSON.stringify(settings)})).settings;}
export async function proposePricing(payload:unknown){return (await request<{estimate:PricingEstimate}>('/api/crm/pricing/estimate',{method:'POST',body:JSON.stringify(payload)})).estimate;}
