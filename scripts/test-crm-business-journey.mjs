import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {parisToday,followUpDateIn} from '../shared/followUp.mjs';

// Explicit isolation, including when run directly outside the release runner.
Object.assign(process.env,{NODE_ENV:'test',CRM_STORAGE:'sqlite',CRM_LOCAL_ACCESS:'true',
  CRM_DATA_DIR:mkdtempSync(path.join(tmpdir(),'wemove-journey-')),
  CRM_LEAD_NOTIFICATIONS:'false',CRM_CUSTOMER_RECEIPTS:'false',CRM_BILLING_LIVE_ENABLED:'false'});
const store=await import('../server/crmStore.mjs');
const billing=await import('../server/crmBilling.mjs');
const {billingSummary}=await import('../server/crmBillingModel.mjs');
const {sendQuoteMail}=await import('../server/crmMail.mjs');
const {newInvoicePreparation}=await import('../server/crmInvoiceModel.mjs');
const {createApp}=await import('../server.mjs');
const today=parisToday(),yesterday=followUpDateIn(-1),actor={role:'gerant',name:'Recette isolée',email:'test@example.invalid'};
const server=createApp().listen(0,'127.0.0.1');
await new Promise(r=>server.once('listening',r));
const base='http://127.0.0.1:'+server.address().port;
async function api(route,method='GET',body,expected=200){
  const response=await fetch(base+route,{method,headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});
  const data=await response.json();assert.equal(response.status,expected,JSON.stringify(data));return data;
}
try {
  // Submit through the same anonymous endpoint as the public quote form.
  process.env.CRM_LOCAL_ACCESS='false';
  let lead=(await api('/api/quotes','POST',{fullName:'Recette métier isolée',email:actor.email,phone:'0612345678',departureAddress:'12 rue de test, 75015 Paris',arrivalAddress:'8 rue de test, 78000 Versailles',volume:18,formula:'confort'},201)).quote;
  await api('/api/quotes','GET',undefined,401);
  process.env.CRM_LOCAL_ACCESS='true';
  assert.equal((await api('/api/quotes')).quotes[0].id,lead.id);
  lead=(await api('/api/quotes/'+lead.id,'PATCH',{status:'visite_technique',visitDate:yesterday+'T07:00',visitStatus:'programmee'})).quote;
  const access={floor:'2',elevator:'Non',carry:'25',notes:'Passage étroit'};
  lead=(await api('/api/quotes/'+lead.id,'PATCH',{expectedUpdatedAt:lead.updatedAt,visitStatus:'effectuee',technicalVisit:{items:[{room:'Séjour',label:'Mobilier',quantity:6,unitVolume:3}],departure:access,arrival:{floor:'0',elevator:'Non',carry:'5',notes:''}}})).quote;
  let quote=(await api('/api/crm/quote-drafts','POST',{leadId:lead.id},201)).draft;
  assert.equal(quote.document.fields.departureAddress,lead.departureAddress);
  assert.equal(quote.document.fields.clientEmail,lead.email);
  assert.equal(quote.document.fields.departureFloor,'2');
  const document=structuredClone(quote.document);
  Object.assign(document.fields,{clientAddress:lead.departureAddress,formula:'MOVE Confort',issueDate:yesterday,departureStart:yesterday,arrivalStart:yesterday,guarantee:'Responsabilité contractuelle',coveredValue:'10000',itemLimit:'1500',paymentKind:'Arrhes',balanceWhen:'À la livraison'});
  const edit=(q,price)=>({revision:q.revision,items:[{description:'Protection et transport',quantity:1,unitPriceHT:price}],taxRate:20,depositRate:30,validUntil:followUpDateIn(30),notes:'',document});
  quote=(await api('/api/crm/quote-drafts/'+lead.id,'PATCH',edit(quote,1234.57))).draft;
  let simulatedSends=0;
  await sendQuoteMail(lead.id,{confirm:true,revision:quote.revision,subject:'Devis de recette',message:'Contrôle isolé sans envoi réel'},actor,{
    configuration:async()=>({ready:true,from:'sender@example.invalid'}),
    transport:async message=>{simulatedSends++;assert.equal(message.to.address,actor.email);assert.equal(message.attachments[0].content.subarray(0,4).toString(),'%PDF');return {accepted:[actor.email],messageId:'isolated-journey'};}
  });
  lead=(await api('/api/quotes')).quotes[0];assert.equal(lead.status,'devis_envoye');
  lead=(await api('/api/quotes/'+lead.id,'PATCH',{status:'confirme'})).quote;
  const accepted=await api('/api/crm/quote-drafts/'+lead.id+'/acceptance','POST',{quoteRevision:quote.revision,previousRevision:0,expectedUpdatedAt:lead.updatedAt,agreementDate:yesterday,note:'Accord client simulé pour la recette isolée.',confirmed:true});
  quote=accepted.quote;lead=accepted.lead;
  const acceptedRevision=quote.revision;
  // A later working price must never leak into the agreed invoice.
  quote=(await api('/api/crm/quote-drafts/'+lead.id,'PATCH',{...edit(quote,2500),acceptedQuoteRevision:acceptedRevision})).draft;
  for(const snapshot of [null,{...accepted.acceptance,quoteRevision:99},{...accepted.acceptance,quote:{...accepted.acceptance.quote,id:'other-dossier'}},{...accepted.acceptance,quote:{...accepted.acceptance.quote,leadId:'other-dossier'}},{...accepted.acceptance,quote:{...accepted.acceptance.quote,revision:99}}]){
    assert.throws(()=>newInvoicePreparation(quote,lead,actor,snapshot),e=>e.status===409,'Ne pas revenir au brouillon si la version acceptée est absente ou incohérente');
  }
  const registry=(await api('/api/crm/resources','POST',{revision:0,name:'Camion de recette',kind:'vehicle',detail:'',active:true})).registry;
  const booking=(await api('/api/crm/planning/'+lead.id,'PUT',{revision:0,start:yesterday+'T08:00',end:yesterday+'T18:00',resourceIds:[registry.resources[0].id]})).booking;
  // Historical actual times avoid assuming the test runs after today's move.
  await api('/api/crm/planning/'+lead.id,'PUT',{revision:booking.revision,closure:{actualStart:yesterday+'T08:30',actualEnd:yesterday+'T17:00',observations:'Livraison vérifiée en recette',reservations:'',letterReceived:true,missingDocuments:'',followUp:'',owner:'',due:''}});
  const source=(await api('/api/crm/invoice-preparations','POST',{quoteId:lead.id},201)).invoice;
  assert.equal(source.quoteRevision,acceptedRevision,'La facture doit reprendre la version acceptée, pas le devis de travail');
  assert.equal(source.amountTTC,1481.48);
  assert.deepEqual(source.items,accepted.acceptance.quote.items);
  assert.equal((await api('/api/crm/invoice-preparations','POST',{quoteId:lead.id},201)).invoice.revision,source.revision);
  const payload=async()=>({revision:(await store.getBillingState()).revision,invoiceId:source.id,sourceRevision:source.revision,kind:'facture',depositRate:30,dueDate:today,details:{clientType:'particulier',serviceDate:yesterday,clientSiren:'',clientVat:'',orderNumber:'',deliveryAddress:lead.arrivalAddress},confirm:true});
  const before=await store.getBillingState();
  const preview=await billing.prepareBillingDocument(await payload(),actor,{preview:true});
  assert.equal(preview.pdf.subarray(0,4).toString(),'%PDF');
  assert.deepEqual(await store.getBillingState(),before);
  await assert.rejects(billing.prepareBillingDocument(await payload(),actor),e=>e.status===409);
  // Activate only this disposable SQLite database to exercise immutable issuance.
  let config=await billing.billingSettings();
  config=await billing.saveBillingSettings({action:'save',revision:config.state.revision,company:{...config.state.company,name:'Société de recette isolée',address:'Adresse de contrôle, Paris',legalForm:'SAS',capital:'15000',siret:'89158794100032',vat:'FR87891587941',registration:'Paris 891587941',email:actor.email,insurance:'Contrat de contrôle isolé'},terms:{...config.state.terms,latePenalty:'Taux BCE majoré de 10 points',defaultDays:30},migration:{lastParcNumber:'FAC-00000',cutoverDate:today}},actor);
  process.env.CRM_BILLING_LIVE_ENABLED='true';
  await billing.saveBillingSettings({action:'activate',revision:config.state.revision,confirm:true,parcClosed:true},actor);
  const invoice=(await billing.prepareBillingDocument(await payload(),actor)).document;
  assert.equal(invoice.amountTTC,148148,'Facturation en centimes, devis en euros');
  const issuedPdf=(await store.getBillingDocument(invoice.id)).pdfBase64;
  assert.equal(Buffer.from(issuedPdf,'base64').subarray(0,4).toString(),'%PDF');
  const paid=await billing.saveBillingPayment(invoice.id,{revision:invoice.revision,action:'add',kind:'payment',amountCents:148148,date:today,method:'virement',reference:'Règlement simulé'},actor);
  assert.equal(billingSummary(paid).dueCents,0);
  assert.equal(billingSummary(paid).status,'regle');
  assert.ok((await store.getBillingDocument(invoice.id)).pdfBase64===issuedPdf,'Le règlement conserve le PDF émis');
  const dossier=(await api('/api/crm/dossiers/'+lead.id)).dossier;
  assert.equal(dossier.lead.status,'termine');
  assert.equal(dossier.acceptance.quoteRevision,acceptedRevision);
  assert.equal(dossier.quote.revision,quote.revision);
  assert.equal(dossier.invoice.quoteRevision,acceptedRevision);
  assert.equal(dossier.billing.length,1);
  assert.equal(simulatedSends,1);
  console.log('Recette métier : demande publique, visite, devis prérempli, envoi simulé, accord versionné, réservation, clôture, facture et règlement vérifiés en SQLite temporaire.');
} finally {
  process.env.CRM_BILLING_LIVE_ENABLED='false';
  server.closeAllConnections();await new Promise(r=>server.close(r));
}

