import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {parisToday,followUpDateIn} from '../shared/followUp.mjs';
Object.assign(process.env,{NODE_ENV:'test',CRM_STORAGE:'sqlite',CRM_LOCAL_ACCESS:'true',CRM_DATA_DIR:mkdtempSync(path.join(tmpdir(),'wm-source-refresh-')),CRM_LEAD_NOTIFICATIONS:'false',CRM_CUSTOMER_RECEIPTS:'false',CRM_BILLING_LIVE_ENABLED:'false'});
const s=await import('../server/crmStore.mjs'),b=await import('../server/crmBilling.mjs');
const {createApp}=await import('../server.mjs');
const actor={role:'gerant',email:'test@example.invalid'},today=parisToday();
const reject=(promise,status)=>assert.rejects(promise,e=>e.status===status);
let lead=await s.createQuoteLead({fullName:'Recette source de facture',email:actor.email,departureAddress:'Paris',arrivalAddress:'Versailles'});
lead=await s.updateQuoteLead(lead.id,{status:'confirme'});
let quote=await s.createQuoteDraft(lead.id);
const document=structuredClone(quote.document);
Object.assign(document.fields,{clientAddress:'Paris',formula:'MOVE Confort',issueDate:today,departureStart:today,arrivalStart:today,guarantee:'Responsabilité contractuelle',coveredValue:'10000',itemLimit:'1500',paymentKind:'Arrhes',balanceWhen:'À la livraison'});
async function amend(price){quote=await s.saveQuoteDraft(lead.id,{revision:quote.revision,...(quote.clientAcceptance?{acceptedQuoteRevision:quote.clientAcceptance.quoteRevision}:{}),items:[{description:'Transport isolé',quantity:1,unitPriceHT:price}],taxRate:20,depositRate:30,validUntil:followUpDateIn(30),notes:'',document});}
async function agree(){({lead,quote}=await s.recordQuoteAcceptance(lead.id,{quoteRevision:quote.revision,previousRevision:quote.clientAcceptance?.quoteRevision||0,expectedUpdatedAt:lead.updatedAt,agreementDate:today,note:'Accord simulé pour contrôle de la source.',confirmed:true},actor));}
await amend(100);await agree();
let source=await s.createInvoicePreparation(lead.id,actor);
source=await s.saveInvoicePreparation(source.id,{revision:source.revision,dueDate:today,notes:'Notes à conserver'},actor);
const issue=async()=>({revision:(await s.getBillingState()).revision,invoiceId:source.id,sourceRevision:source.revision,kind:'facture',depositRate:30,dueDate:today,details:{clientType:'particulier',serviceDate:today,clientSiren:'',clientVat:'',orderNumber:'',deliveryAddress:'Versailles'},confirm:true});
await amend(200);
assert.equal((await b.prepareBillingDocument(await issue(),actor,{preview:true})).pdf.subarray(0,4).toString(),'%PDF','Un devis de travail différent ne périme pas un accord inchangé');
await agree();
const before=await s.getBillingState();
await reject(b.prepareBillingDocument(await issue(),actor,{preview:true}),409);
// Recheck inside the commit as well: protects a change during PDF generation.
await reject(s.commitBilling({revision:before.revision,sourceCheck:{id:source.id,revision:source.revision},event:{action:'isolated-stale-check'}}),409);
assert.deepEqual(await s.getBillingState(),before);
const payload={revision:source.revision,expectedQuoteRevision:quote.revision,confirm:true};
await reject(s.refreshInvoicePreparation(source.id,payload,{...actor,role:'commercial'}),403);
for(const patch of [{confirm:false},{expectedQuoteRevision:'3'},{unexpected:true}])await reject(s.refreshInvoicePreparation(source.id,{...payload,...patch},actor),400);
await reject(s.refreshInvoicePreparation(source.id,{...payload,expectedQuoteRevision:2},actor),409);
const server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));
const url='http://127.0.0.1:'+server.address().port+'/api/crm/invoice-preparations/'+source.id+'/refresh-source';
try{
 process.env.CRM_LOCAL_ACCESS='false';assert.equal((await fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})).status,401);process.env.CRM_LOCAL_ACCESS='true';
 const responses=await Promise.all([1,2].map(()=>fetch(url,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)})));
 assert.deepEqual(responses.map(r=>r.status).sort(),[200,409]);
 source=(await responses.find(r=>r.status===200).json()).invoice;
 assert.equal(source.quoteRevision,3);assert.equal(source.amountTTC,240);assert.equal(source.notes,'Notes à conserver');assert.equal(source.dueDate,today);assert.equal(source.sourceHistory[0].amountTTC,120);assert.equal(source.sourceHistory[0].quoteRevision,2);
 assert.deepEqual(await s.getBillingState(),before,'Actualiser une source ne consomme aucun numéro');
 // Legacy dossiers also need a deliberate refresh after a working-quote edit.
 let legacy=await s.createQuoteLead({fullName:'Ancien dossier de recette',email:actor.email});
 legacy=await s.updateQuoteLead(legacy.id,{status:'confirme'});
 let legacyQuote=await s.createQuoteDraft(legacy.id);
 const legacyDocument=structuredClone(legacyQuote.document);legacyDocument.fields.clientAddress='Paris';
 const legacyEdit=price=>({revision:legacyQuote.revision,items:[{description:'Transport ancien dossier',quantity:1,unitPriceHT:price}],taxRate:20,depositRate:30,validUntil:'',notes:'',document:legacyDocument});
 legacyQuote=await s.saveQuoteDraft(legacy.id,legacyEdit(100));
 const legacySource=await s.createInvoicePreparation(legacy.id,actor);
 legacyQuote=await s.saveQuoteDraft(legacy.id,legacyEdit(200));
 await reject(s.commitBilling({revision:before.revision,sourceCheck:{id:legacySource.id,revision:legacySource.revision},event:{action:'isolated-legacy-check'}}),409);
 const legacyUpdated=await s.refreshInvoicePreparation(legacy.id,{revision:legacySource.revision,expectedQuoteRevision:legacyQuote.revision,confirm:true},actor);
 assert.equal(legacyUpdated.amountTTC,240);assert.equal(legacyUpdated.sourceHistory[0].amountTTC,120);
 let config=await b.billingSettings();
 config=await b.saveBillingSettings({action:'save',revision:config.state.revision,company:{...config.state.company,name:'Société de recette isolée',address:'Paris, adresse de recette',legalForm:'SAS',capital:'15000',siret:'89158794100032',vat:'FR87891587941',registration:'Paris 891587941',email:actor.email,insurance:'Contrat de contrôle isolé'},terms:{...config.state.terms,latePenalty:'Taux BCE majoré de 10 points',defaultDays:30},migration:{lastParcNumber:'FAC-00000',cutoverDate:today}},actor);
 process.env.CRM_BILLING_LIVE_ENABLED='true';
 await b.saveBillingSettings({action:'activate',revision:config.state.revision,confirm:true,parcClosed:true},actor);
 const invoice=(await b.prepareBillingDocument(await issue(),actor)).document;
 const original=await s.getBillingDocument(invoice.id);
 await amend(300);await agree();
 await reject(b.prepareBillingDocument(await issue(),actor),409);
 await reject(s.refreshInvoicePreparation(source.id,{revision:source.revision,expectedQuoteRevision:quote.revision,confirm:true},actor),409);
 assert.deepEqual(await s.getBillingDocument(invoice.id),original,'Le document émis reste immuable');
 assert.equal((await s.getBillingState()).counter,1);
 // Avoirs must remain available even when the original preparation is stale.
 const credit=(await b.prepareBillingDocument({revision:(await s.getBillingState()).revision,kind:'avoir',targetId:invoice.id,documentRevision:original.revision,creditHT:original.amountHT,reason:'Correction simulée après nouvel accord',confirm:true},actor)).document;
 assert.equal(credit.amountTTC,original.amountTTC);
 assert.equal((await s.getQuoteMails(lead.id)).length,0);
 console.log('Source de facture : aperçu périmé refusé, contrôle transactionnel, droits, confirmation, concurrence, reprise explicite avec notes et historique, verrou après émission et avoirs conservés vérifiés en base temporaire.');
}finally{process.env.CRM_BILLING_LIVE_ENABLED='false';server.closeAllConnections();await new Promise(r=>server.close(r));}
