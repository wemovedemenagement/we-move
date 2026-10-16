import './crmEnvironment.mjs';
import { quoteStats } from './crmModel.mjs';
let backend;
async function store() {
  const provider = process.env.CRM_STORAGE || 'firestore';
  if (!['sqlite', 'firestore'].includes(provider)) throw new Error('CRM_STORAGE invalide');
  backend ||= import(provider === 'firestore' ? './crmFirestoreStore.mjs' : './crmSqliteStore.mjs');
  return backend;
}
export async function getAllQuotes() { return (await store()).getAllQuotes(); }
export async function getStorageStays(){return (await store()).getStorageStays();}
export async function saveStorageStay(payload,actor){return (await store()).saveStorageStay(payload,actor);}
export async function getStorageHistory(id,before){return (await store()).getStorageHistory(id,before);}
export async function createQuoteLead(payload) { return (await store()).createQuoteLead(payload); }
export async function updateQuoteLead(id, updates) { return (await store()).updateQuoteLead(id, updates); }
export async function deleteQuoteLead(id) { return (await store()).deleteQuoteLead(id); }
export async function getCrmStats() { return quoteStats(await getAllQuotes()); }

export async function getQuoteDrafts() { return (await store()).getQuoteDrafts(); }
export async function createQuoteDraft(id) { return (await store()).createQuoteDraft(id); }
export async function saveQuoteDraft(id,payload) { return (await store()).saveQuoteDraft(id,payload); }
export async function recordQuoteAcceptance(id,payload,actor){return (await store()).recordQuoteAcceptance(id,payload,actor);}
export async function getQuoteAcceptance(id,revision){return (await store()).getQuoteAcceptance(id,revision);}
export async function getQuoteAcceptanceHistory(id){return (await store()).getQuoteAcceptanceHistory(id);}

export async function saveFollowUp(id,payload,actor) { return (await store()).saveFollowUp(id,payload,actor); }
export async function quoteMailTransaction(id,key,action) {return (await store()).quoteMailTransaction(id,key,action);}
export async function getQuoteMails(id) {return (await store()).getQuoteMails(id);}
export async function leadNotificationTransaction(id,action) {return (await store()).leadNotificationTransaction(id,action);}
export async function customerReceiptTransaction(id,action) {return (await store()).customerReceiptTransaction(id,action);}
export async function getInvoicePreparations(){return (await store()).getInvoicePreparations();}
export async function createInvoicePreparation(id,actor){return (await store()).createInvoicePreparation(id,actor);}
export async function saveInvoicePreparation(id,payload,actor){return (await store()).saveInvoicePreparation(id,payload,actor);}

export async function getInvoiceTestState(){return (await store()).getInvoiceTestState();}
export async function changeInvoiceTestState(payload,actor){return (await store()).changeInvoiceTestState(payload,actor);}

export async function getDossierRecords(id){return (await store()).getDossierRecords(id);}

export async function getPlanning(){return (await store()).getPlanning();}
export async function saveResource(payload,actor){return (await store()).saveResource(payload,actor);}
export async function saveBooking(id,payload,actor){return (await store()).saveBooking(id,payload,actor);}

export async function getTestBillingDocuments(){return (await store()).getTestBillingDocuments();}
export async function getTestBillingDocument(id){return (await store()).getTestBillingDocument(id);}
export async function createTestBillingDocument(payload,actor){return (await store()).createTestBillingDocument(payload,actor);}
export async function saveTestBillingPayment(id,payload,actor){return (await store()).saveTestBillingPayment(id,payload,actor);}
export async function getBillingState(){return (await store()).getBillingState();}
export async function getBillingDocument(id){return (await store()).getBillingDocument(id);}
export async function getBillingRelated(invoiceId){return (await store()).getBillingRelated(invoiceId);}
export async function listBillingDocuments(cursor){return (await store()).listBillingDocuments(cursor);}
export async function commitBilling(change){return (await store()).commitBilling(change);}
export async function getBillingOverviewRecords(invoiceId){return (await store()).getBillingOverviewRecords(invoiceId);}
export async function getPricingSettings(){return (await store()).getPricingSettings();}
export async function savePricingSettings(payload,actor){return (await store()).savePricingSettings(payload,actor);}
