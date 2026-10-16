import {newInvoicePreparation,reviseInvoicePreparation} from './crmInvoiceModel.mjs';
import {recordClientAgreement,acceptanceRevision} from './crmQuoteAcceptance.mjs';
import {reviseStorageStay,historyBefore} from './crmStorageStay.mjs';
import {updateFollowUp} from './crmFollowUp.mjs';
import {createHash} from 'node:crypto';
import { newDraft, reviseDraft, draftId, draftError } from './crmDraftModel.mjs';
import { Firestore } from '@google-cloud/firestore';
import { createRequire } from 'node:module';
import { makeQuote, mergeQuote } from './crmModel.mjs';
import './crmEnvironment.mjs';
let connection;
export function firestore() {
  if (connection) return connection;
  const firebaseConfig = JSON.parse(process.env.FIREBASE_CONFIG || '{}');
  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId || process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) throw new Error('FIREBASE_PROJECT_ID manquant');
  const options = { projectId, databaseId: process.env.FIRESTORE_DATABASE_ID || '(default)' };
  if (process.env.CRM_FIREBASE_CLI_ACCOUNT) {
    if (process.env.K_SERVICE || process.env.NODE_ENV === 'production') throw new Error('Authentification CLI réservée au développement local');
    const require = createRequire(import.meta.url);
    const auth = require('firebase-tools/lib/auth.js');
    const api = require('firebase-tools/lib/api.js');
    const account = auth.findAccountByEmail(process.env.CRM_FIREBASE_CLI_ACCOUNT);
    if (!account?.tokens?.refresh_token) throw new Error('Connectez le compte avec firebase login');
    // Credentials stay in server memory; GoogleAuth refreshes this user session.
    options.credentials = { type: 'authorized_user', client_id: api.clientId(), client_secret: api.clientSecret(), refresh_token: account.tokens.refresh_token };
  }
  connection = new Firestore(options);
  return connection;
}
function collectionName(name) {
  const testNamespace = process.env.CRM_FIRESTORE_TEST_NAMESPACE;
  if (!testNamespace) return name;
  if (process.env.NODE_ENV !== 'test' || process.env.K_SERVICE || !/^integration_[a-z0-9_]{1,80}$/.test(testNamespace)) throw new Error('Espace de test Firestore invalide');
  return testNamespace + '_' + name;
}
const requests = () => firestore().collection(collectionName('crm_requests'));
const storageStays=()=>firestore().collection(collectionName('crm_storage_stays'));
export async function getStorageStays(){return (await storageStays().orderBy('updatedAt','desc').get()).docs.map(d=>d.data());}
export async function saveStorageStay(payload,actor){
 const id=draftId(payload?.id),leadId=draftId(payload?.leadId);
 return firestore().runTransaction(async tx=>{
   const ref=storageStays().doc(id),leadRef=requests().doc(leadId);
   const [current,lead]=await Promise.all([tx.get(ref),tx.get(leadRef)]);
   const result=reviseStorageStay(current.exists?current.data():null,lead.data(),payload,actor);
   tx.set(ref,result.stay);tx.create(ref.collection('events').doc(String(result.stay.revision)),result.event);tx.set(leadRef,result.lead);
   return {stay:result.stay,lead:result.lead};
 });
}
export async function getStorageHistory(id,before){
 const ref=storageStays().doc(draftId(id));if(!(await ref.get()).exists)draftError(404,'Séjour introuvable.');
 let query=ref.collection('events').orderBy('revision','desc');
 if(before!==undefined)query=query.where('revision','<',historyBefore(before));
 const rows=(await query.limit(21).get()).docs.map(d=>d.data()),events=rows.slice(0,20);
 return {events,next:rows.length>20?events.at(-1).revision:null};
}
export async function customerReceiptTransaction(id,action) {
 const ref=requests().doc(draftId(id));
 return firestore().runTransaction(async tx=>{
  const doc=await tx.get(ref);if(!doc.exists)throw new Error('Demande introuvable');
  const lead=doc.data(),result=action(lead);
  if(!result.write)return result;
  if(result.notification.state==='sending'){
   const now=Date.now(),limits=firestore().collection(collectionName('crm_mail_limits'));
   const recipient=limits.doc('recipient-'+createHash('sha256').update(lead.email.trim().toLowerCase()).digest('hex'));
   const global=limits.doc('customer-receipts-daily');
   const [r,g]=await Promise.all([tx.get(recipient),tx.get(global)]);
   const day=new Date(now).toISOString().slice(0,10),count=g.data()?.day===day?g.data().count:0;
   if(now-(r.data()?.lastAttempt||0)<3600000||count>=200){
    tx.update(ref,{customerNotification:{state:'suppressed',reason:'rate_limit',createdAt:new Date(now).toISOString()}});return {write:false};
   }
   tx.set(recipient,{lastAttempt:now});tx.set(global,{day,count:count+1});
  }
  tx.update(ref,{customerNotification:result.notification});return result;
 });
}
export async function leadNotificationTransaction(id,action) {
  const ref=requests().doc(draftId(id));
  return firestore().runTransaction(async tx=>{
    const doc=await tx.get(ref);
    if(!doc.exists)throw new Error('Demande introuvable');
    const result=action(doc.data());
    if(result.write)tx.update(ref,{notification:result.notification});
    return result;
  });
}
export async function getAllQuotes() {
  const snapshot = await requests().orderBy('createdAt', 'desc').get();
  return snapshot.docs.map(doc => doc.data());
}
export async function createQuoteLead(payload) {
  const quote = makeQuote(payload);
  await requests().doc(quote.id).create(quote);
  return quote;
}
export async function updateQuoteLead(id, updates) {
  const ref = requests().doc(id);
  return firestore().runTransaction(async transaction => {
    const current = await transaction.get(ref);
    if (!current.exists) return null;
    const quote = mergeQuote(current.data(), updates);
    transaction.set(ref, quote);
    return quote;
  });
}
export async function deleteQuoteLead(id) {
  const ref = requests().doc(id);
  return firestore().runTransaction(async transaction => {
    if (!(await transaction.get(ref)).exists) return false;
    if ((await transaction.get(firestore().collection(collectionName('crm_quote_drafts')).doc(id))).exists) draftError(409, 'Cette demande possède un brouillon de devis et doit être conservée.');
    if((await transaction.get(bookingsRef().doc(id))).exists)draftError(409,'Ce dossier possède un historique de réservation et doit être conservé.');
    if(!(await transaction.get(storageStays().where('leadId','==',id).limit(1))).empty)draftError(409,'Ce dossier possède un historique de stockage et doit être conservé.');
    transaction.delete(ref);
    return true;
  });
}

const drafts = () => firestore().collection(collectionName('crm_quote_drafts'));
const acceptances=id=>drafts().doc(draftId(id)).collection('client_acceptances');
export async function getQuoteAcceptance(id,revision){const doc=await acceptances(id).doc(String(acceptanceRevision(revision))).get();return doc.data()||null;}
export async function getQuoteAcceptanceHistory(id){return (await acceptances(id).orderBy('quoteRevision','desc').limit(20).get()).docs.map(d=>{const {quote,...summary}=d.data();return summary;});}
export async function recordQuoteAcceptance(id,payload,actor){
 draftId(id);return firestore().runTransaction(async tx=>{
  const [lead,quote]=await Promise.all([tx.get(requests().doc(id)),tx.get(drafts().doc(id))]);
  const result=recordClientAgreement(lead.data(),quote.data(),payload,actor);
  tx.create(acceptances(id).doc(String(result.acceptance.quoteRevision)),result.acceptance);
  tx.set(drafts().doc(id),result.quote);tx.set(requests().doc(id),result.lead);return result;
 });
}
const mails = id => drafts().doc(draftId(id)).collection('mail_deliveries');
export async function getQuoteMails(id) {return (await mails(id).get()).docs.map(doc=>doc.data()).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
export async function quoteMailTransaction(id,key,action) {
 const draftRef=drafts().doc(draftId(id)),mailRef=mails(id).doc(draftId(key));
 return firestore().runTransaction(async tx=>{
  const [d,m]=await Promise.all([tx.get(draftRef),tx.get(mailRef)]);
  if(!d.exists)draftError(404,'Devis introuvable.');
  const result=action(d.data(),m.exists?m.data():null);
  let lead; if(result.write&&result.summary?.state==='accepted')lead=await tx.get(requests().doc(id));
  if(lead?.exists&&['nouveau','prise_contact','visite_technique','devis_brouillon'].includes(lead.data().status))tx.set(requests().doc(id),mergeQuote(lead.data(),{status:'devis_envoye',author:result.record.actor||'Envoi CRM'}));
  if(result.write){tx.set(mailRef,result.record);if(result.summary)tx.update(draftRef,{emailDelivery:result.summary});}
  return result;
 });
}
export async function getQuoteDrafts() {
  return (await drafts().orderBy('updatedAt', 'desc').get()).docs.map(doc => doc.data());
}
export async function createQuoteDraft(leadId) {
  const id = draftId(leadId), ref = drafts().doc(id);
  return firestore().runTransaction(async transaction => {
    const lead = await transaction.get(requests().doc(id));
    if (!lead.exists) draftError(404, 'Demande introuvable.');
    const existing = await transaction.get(ref);
    if (existing.exists) return existing.data();
    const draft = newDraft(lead.data());
    transaction.create(ref, draft);
    return draft;
  });
}
export async function saveQuoteDraft(id, payload) {
  const ref = drafts().doc(draftId(id));
  return firestore().runTransaction(async transaction => {
    const current = await transaction.get(ref);
    if (!current.exists) draftError(404, 'Brouillon introuvable.');
    const updated = reviseDraft(current.data(), payload);
    transaction.set(ref, updated);
    return updated;
  });
}

export async function saveFollowUp(id,payload,actor) {
  const ref=requests().doc(draftId(id));
  return firestore().runTransaction(async transaction=>{
    const current=await transaction.get(ref);if(!current.exists)return null;
    const updated=updateFollowUp(current.data(),payload,actor);transaction.set(ref,updated);return updated;
  });
}

const invoicePreparations=()=>firestore().collection(collectionName('crm_invoice_preparations'));
export async function getInvoicePreparations(){return (await invoicePreparations().orderBy('updatedAt','desc').get()).docs.map(d=>d.data());}
export async function createInvoicePreparation(id,actor){const ref=invoicePreparations().doc(draftId(id));return firestore().runTransaction(async tx=>{const existing=await tx.get(ref);if(existing.exists)return existing.data();const q=await tx.get(drafts().doc(id)),l=await tx.get(requests().doc(id));const result=newInvoicePreparation(q.data(),l.data(),actor);tx.create(ref,result);return result;});}
export async function saveInvoicePreparation(id,payload,actor){const ref=invoicePreparations().doc(draftId(id));return firestore().runTransaction(async tx=>{const current=await tx.get(ref);if(!current.exists)draftError(404,'Brouillon introuvable.');const result=reviseInvoicePreparation(current.data(),payload,actor);tx.set(ref,result);return result;});}

import {initialInvoiceTestState,invoiceTestChange} from './crmInvoiceTestModel.mjs';
const invoiceTestRef=()=>firestore().collection(collectionName('crm_invoice_test_settings')).doc('test');
export async function getInvoiceTestState(){const doc=await invoiceTestRef().get();return doc.exists?doc.data():initialInvoiceTestState();}
export async function changeInvoiceTestState(payload,actor){
 const ref=invoiceTestRef();return firestore().runTransaction(async tx=>{
 const snapshot=await tx.get(ref),current=snapshot.exists?snapshot.data():initialInvoiceTestState();
 const invoice=payload?.action==='number'?await tx.get(invoicePreparations().doc(draftId(payload.invoiceId))):null;
 const result=invoiceTestChange(current,payload,invoice?.data(),actor);
 tx.set(ref,result.state);tx.create(ref.collection('events').doc(String(result.state.revision)),result.event);return result.state;
 });
}

export async function getDossierRecords(id){
 draftId(id);const [lead,quote,invoice,mail]=await Promise.all([requests().doc(id).get(),drafts().doc(id).get(),invoicePreparations().doc(id).get(),mails(id).select('id','reference','revision','state','createdAt','acceptedAt','actor','to').get()]);
 return {lead:lead.data()||null,quote:quote.data()||null,invoice:invoice.data()||null,mails:mail.docs.map(d=>({...d.data(),id:d.id}))};
}

import {emptyRegistry,reviseRegistry,makeBooking,applyBooking} from './crmPlanningModel.mjs';
const registryRef=()=>firestore().collection(collectionName('crm_resources')).doc('registry');
const bookingsRef=()=>firestore().collection(collectionName('crm_move_bookings'));
export async function getPlanning(){const [r,b]=await Promise.all([registryRef().get(),bookingsRef().get()]);return {registry:r.exists?r.data():emptyRegistry(),bookings:b.docs.map(d=>d.data())};}
export async function saveResource(payload,actor){return firestore().runTransaction(async tx=>{const ref=registryRef(),r=await tx.get(ref);const b=await tx.get(bookingsRef());const registry=reviseRegistry(r.exists?r.data():emptyRegistry(),payload,actor,b.docs.map(d=>d.data()));tx.set(ref,registry);tx.create(ref.collection('events').doc(String(registry.revision)),{at:new Date().toISOString(),actor:actor.email||actor.name,change:payload});return registry;});}
export async function saveBooking(id,payload,actor){draftId(id);return firestore().runTransaction(async tx=>{
 const [l,r,b]=await Promise.all([tx.get(requests().doc(id)),tx.get(registryRef()),tx.get(bookingsRef())]);const registry=r.exists?r.data():emptyRegistry(),bookings=b.docs.map(d=>d.data());
 const booking=makeBooking(l.data(),bookings.find(b=>b.leadId===id),bookings,registry,payload,actor),lead=applyBooking(l.data(),booking,actor);
 // Serialize allocations, including concurrent inserts for different missions.
 tx.set(registryRef(),{...registry,revision:registry.revision+1});tx.set(bookingsRef().doc(id),booking);tx.set(requests().doc(id),lead);return {booking,lead};
 });}

import {issueTestDocument,reviseTestPayment} from './crmTestBillingModel.mjs';
const testBillingDocuments=()=>invoiceTestRef().collection('documents');
export async function getTestBillingDocuments(){return (await testBillingDocuments().orderBy('createdAt','desc').limit(200).get()).docs.map(d=>d.data());}
export async function getTestBillingDocument(id){const snapshot=await testBillingDocuments().doc(draftId(id)).get();return snapshot.exists?snapshot.data():null;}
export async function createTestBillingDocument(payload,actor){return firestore().runTransaction(async tx=>{
 const [s,i]=await Promise.all([tx.get(invoiceTestRef()),tx.get(invoicePreparations().doc(draftId(payload?.invoiceId)))]);const state=s.exists?s.data():initialInvoiceTestState();
 const docs=await tx.get(testBillingDocuments().where('session','==',state.session));
 const result=issueTestDocument(state,i.data(),docs.docs.map(d=>d.data()),payload,actor);
 tx.set(invoiceTestRef(),result.state);tx.create(testBillingDocuments().doc(result.document.id),result.document);tx.create(invoiceTestRef().collection('events').doc(String(result.state.revision)),{action:'document',documentId:result.document.id,number:result.document.number,at:result.document.createdAt,actor:result.document.createdBy});return result;
 });}
export async function saveTestBillingPayment(id,payload,actor){return firestore().runTransaction(async tx=>{
 const ref=testBillingDocuments().doc(draftId(id));const [s,d]=await Promise.all([tx.get(invoiceTestRef()),tx.get(ref)]);const document=reviseTestPayment(s.exists?s.data():initialInvoiceTestState(),d.data(),payload,actor);tx.set(ref,document);return document;
 });}

import {initialBilling} from './crmBillingModel.mjs';
const billingRoot=()=>firestore().collection(collectionName('crm_billing')).doc('main');
const billingDocs=()=>billingRoot().collection('documents');
export async function getBillingState(){const d=await billingRoot().get();return d.exists?d.data():initialBilling();}
export async function getBillingDocument(id){const d=await billingDocs().doc(draftId(id)).get();return d.exists?d.data():null;}
export async function getBillingRelated(invoiceId){return (await billingDocs().where('invoiceId','==',invoiceId).get()).docs.map(d=>d.data());}
export async function getBillingOverviewRecords(invoiceId){let q=billingDocs();if(invoiceId)q=q.where('invoiceId','==',invoiceId);return (await q.select('id','number','mode','kind','invoiceId','leadId','snapshot.clientName','dueDate','issueDate','createdAt','amountHT','taxAmount','quoteReference','creditNumber','amountTTC','creditedTTC','payments').get()).docs.map(d=>d.data());}
export async function listBillingDocuments(cursor){let q=billingDocs().orderBy('createdAt','desc');if(cursor){const last=await billingDocs().doc(draftId(cursor)).get();if(!last.exists)draftError(400,'Page introuvable.');q=q.startAfter(last);}const docs=(await q.limit(41).get()).docs;return {documents:docs.slice(0,40).map(d=>d.data()),cursor:docs.length>40?docs[39].id:null};}
export async function commitBilling({revision,nextState,documents=[],sourceCheck,event}){return firestore().runTransaction(async tx=>{const s=await tx.get(billingRoot());const current=s.exists?s.data():initialBilling();if(current.revision!==revision)draftError(409,'La facturation a changé. Actualisez et réessayez.');if(sourceCheck){const i=await tx.get(invoicePreparations().doc(sourceCheck.id));if(!i.exists||i.data().revision!==sourceCheck.revision)draftError(409,'Le brouillon a changé.');}const state={...(nextState||current),revision:current.revision+1};tx.set(billingRoot(),state);for(const d of documents)tx.set(billingDocs().doc(d.id),d);tx.create(billingRoot().collection('events').doc(String(state.revision)),event);return state;});}
import {emptyPricing,revisePricing} from './crmPricing.mjs';
const pricingRef=()=>firestore().collection(collectionName('crm_configuration')).doc('pricing');
export async function getPricingSettings(){return (await pricingRef().get()).data()||emptyPricing();}
export async function savePricingSettings(payload,actor){return firestore().runTransaction(async tx=>{const ref=pricingRef(),snapshot=await tx.get(ref);const next=revisePricing(snapshot.data()||emptyPricing(),payload,actor);tx.set(ref,next);tx.set(ref.collection('history').doc(String(next.revision)),next);return next;});}
