import {PDFDocument} from 'pdf-lib';
import {emptyQuoteDocument,formulaServices,prefillQuoteDraft} from '../shared/quoteDocument.mjs';
import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {randomUUID} from 'node:crypto';
import {quoteTotals} from '../shared/quoteTotals.mjs';
const live = process.argv.includes('--firestore-isolated');
process.env.CRM_STORAGE=live?'firestore':'sqlite';
process.env.CRM_LOCAL_ACCESS='true';
process.env.CRM_DATA_DIR=mkdtempSync(path.join(tmpdir(),'wemove-drafts-'));
if(live){process.env.NODE_ENV='test';process.env.CRM_FIRESTORE_TEST_NAMESPACE='integration_'+randomUUID().replaceAll('-','_');}
const {createApp}=await import('../server.mjs');
const server=createApp().listen(0,'127.0.0.1');
await new Promise(resolve=>server.once('listening',resolve));
const base='http://127.0.0.1:'+server.address().port;
async function api(route,method='GET',body){const r=await fetch(base+route,{method,headers:{'Content-Type':'application/json'},body:body&&JSON.stringify(body)});return {status:r.status,body:await r.json()};}
try {
  assert.deepEqual(quoteTotals([{quantity:0.5,unitPriceHT:0.01}],20,30),{amountHT:0.01,taxAmount:0,amountTTC:0.01,depositAmount:0});
  assert.equal(quoteTotals([{quantity:3,unitPriceHT:0.1}],null,null).amountTTC,null);
  process.env.CRM_LOCAL_ACCESS='false';
  for(const method of ['GET','POST','PATCH'])assert.equal((await api('/api/crm/quote-drafts'+(method==='PATCH'?'/missing':''),method,method==='GET'?undefined:{})).status,401);
  assert.equal((await fetch(base+'/api/crm/quote-drafts/missing/pdf/devis')).status,401);
  assert.equal((await api('/api/crm/quote-drafts/missing/email')).status,401);
  assert.equal((await api('/api/crm/quote-drafts/missing/email','POST',{})).status,401);
  assert.equal((await fetch(base+'/api/crm/quote-drafts/missing/email/revision-1/pdf')).status,401);
  process.env.CRM_LOCAL_ACCESS='true';
  assert.equal((await api('/api/crm/quote-drafts','POST',{leadId:'missing'})).status,404);
  assert.equal((await api('/api/crm/quote-drafts','POST',{leadId:'../bad'})).status,400);
  const lead=(await api('/api/quotes','POST',{fullName:'Test technique isolé',email:'test@example.invalid',source:'page_devis',phone:'0612345678',departureAddress:'Adresse de départ de test',arrivalAddress:'Adresse de livraison de test',departureFloor:'3',arrivalFloor:'1',departureElevator:true,arrivalElevator:false,volume:26,formula:'premium',moveDate:'2026-11-15',flexibleDate:true,liftRequired:true,storageRequired:true,notes:'Message de test à reprendre'})).body.quote;
  const first=(await api('/api/crm/quote-drafts','POST',{leadId:lead.id})).body.draft;
  assert.equal(first.clientName,lead.fullName);assert.equal(first.amountTTC,null);assert.equal(first.taxRate,null);assert.deepEqual(first.items,[]);
  assert.equal(first.document.fields.clientPhone,lead.phone);
  assert.equal(first.document.fields.departurePhone,lead.phone);
  assert.equal(first.document.fields.arrivalPhone,lead.phone);
  assert.equal(first.document.fields.departureElevator,'Oui');
  assert.equal(first.document.fields.arrivalElevator,'');
  assert.equal(first.document.fields.departureFloor,'3');
  assert.equal(first.document.fields.arrivalAddress,lead.arrivalAddress);
  assert.equal(first.document.fields.departureStart,lead.moveDate);
  assert.equal(first.document.fields.volume,'26');
  assert.equal(first.document.fields.formula,'MOVE Premium');
  assert.equal(first.document.fields.departureLift,'');
  assert.equal(first.document.fields.clientAddress,''); // Billing address was not supplied.
  assert.equal(first.notes,lead.notes);
  const legacy={...first,document:{...first.document,sourcePrefillVersion:undefined,fields:{...first.document.fields,clientName:'Correction conservée',departurePhone:''}}};
  const imported=prefillQuoteDraft(legacy,lead);
  assert.equal(imported.document.fields.clientName,'Correction conservée');
  assert.equal(imported.document.fields.departurePhone,lead.phone);
  imported.document.fields.departurePhone='';
  assert.equal(prefillQuoteDraft(imported,lead).document.fields.departurePhone,'');
  assert.equal(emptyQuoteDocument({...lead,unknownVolume:true,arrivalAddress:'À préciser'}).fields.volume,'');
  assert.equal(emptyQuoteDocument({...lead,arrivalAddress:'À préciser'}).fields.arrivalAddress,'');
  const again=(await api('/api/crm/quote-drafts','POST',{leadId:lead.id})).body.draft;
  assert.equal(again.reference,first.reference);assert.equal((await api('/api/crm/quote-drafts')).body.drafts.length,1);
  assert.equal((await api('/api/quotes/'+lead.id,'DELETE')).status,409);
  const url='/api/crm/quote-drafts/'+first.id;
  const document=emptyQuoteDocument(lead);Object.assign(document.fields,{clientName:'Client corrigé',departureStart:'2026-10-15',departureEnd:'2026-10-31',paymentKind:'Arrhes',coveredValue:'30000',formula:'MOVE Économique'});document.services=formulaServices('MOVE Économique');document.valuables=[{label:'Objet déclaré de test',value:'2000'}];
  const payload={document,revision:1,items:[{description:'Prestation saisie',quantity:1.5,unitPriceHT:123.45},{description:'Protection saisie',quantity:3,unitPriceHT:0.1}],taxRate:20,depositRate:30,validUntil:'2026-12-01',notes:'Test isolé'};
  assert.equal((await api(url,'PATCH',{...payload,status:'envoye'})).status,400);
  assert.equal((await api(url,'PATCH',{...payload,amountTTC:1})).status,400);
  assert.equal((await api(url,'PATCH',{...payload,items:[{description:'',quantity:1,unitPriceHT:2}]})).status,400);
  assert.equal((await api(url,'PATCH',{...payload,items:[{description:'Essai',quantity:1,unitPriceHT:-1}]})).status,400);
  assert.equal((await api(url,'PATCH',{...payload,validUntil:'2026-02-31'})).status,400);
  assert.equal((await api(url,'PATCH',{...payload,document:{...document,fields:{...document.fields,departureEnd:'2026-10-01'}}})).status,400);
  assert.equal((await api(url,'PATCH',{...payload,document:{...document,fields:{...document.fields,coveredValue:'-10'}}})).status,400);
  assert.equal((await api(url,'PATCH',{...payload,document:{...document,fields:{...document.fields,invented:'x'}}})).status,400);
  const concurrent=await Promise.all([api(url,'PATCH',payload),api(url,'PATCH',payload)]);
  assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);
  const saved=concurrent.find(r=>r.status===200).body.draft;
  assert.equal(saved.amountHT,185.48);assert.equal(saved.taxAmount,37.1);assert.equal(saved.amountTTC,222.58);assert.equal(saved.depositAmount,66.77);
  assert.deepEqual(saved.document,document);assert.equal(saved.clientName,'Client corrigé');
  const reread=(await api('/api/crm/quote-drafts')).body.drafts[0];assert.deepEqual(reread.document,document);
  assert.equal(saved.status,'brouillon');assert.equal(saved.revision,2);
  for(const type of ['devis','mission','lettre-voiture','declaration-valeur','cgv-rgpd','proforma']){
    const response=await fetch(base+url+'/pdf/'+type);
    assert.equal(response.status,200);assert.equal(response.headers.get('content-type'),'application/pdf');
    assert.match(response.headers.get('cache-control'),/no-store/);
    const bytes=await response.arrayBuffer();const pdf=await PDFDocument.load(bytes);
    assert.ok(pdf.getPageCount()>0);
    if(type==='declaration-valeur')assert.equal(pdf.getPageCount(),1);
    if(type==='cgv-rgpd')assert.equal(pdf.getPageCount(),2);
  }
  assert.equal((await fetch(base+url+'/pdf/inconnu')).status,400);
  assert.equal((await fetch(base+'/api/crm/quote-drafts/missing/pdf/devis')).status,404);
  const child=execFileSync(process.execPath,['--input-type=module','-e',"import {getQuoteDrafts} from './server/crmStore.mjs';const rows=await getQuoteDrafts();console.log(JSON.stringify(rows.map(d=>({revision:d.revision,total:d.amountTTC,status:d.status}))));if(process.env.CRM_STORAGE==='firestore'){const {firestore}=await import('./server/crmFirestoreStore.mjs');await firestore().terminate();}"],{cwd:process.cwd(),env:process.env,encoding:'utf8'});
  assert.deepEqual(JSON.parse(child.trim()),[{revision:2,total:222.58,status:'brouillon'}]);
  console.log('Devis : accès privé, source réelle, idempotence, calculs, validation, conflit concurrent et persistance vérifiés ('+(live?'Firestore isolé':'SQLite isolé')+').');
} finally {
  await new Promise(resolve=>server.close(resolve));
  if(live){const {firestore}=await import('../server/crmFirestoreStore.mjs');const db=firestore();for(const name of ['crm_quote_drafts','crm_requests']){const snapshot=await db.collection(process.env.CRM_FIRESTORE_TEST_NAMESPACE+'_'+name).get();for(const doc of snapshot.docs)await doc.ref.delete();}await db.terminate();console.log('Collections techniques isolées nettoyées. Aucune demande de production créée.');}
}
