import assert from 'node:assert/strict';import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';
process.env.CRM_STORAGE='sqlite';process.env.CRM_LOCAL_ACCESS='true';process.env.CRM_DATA_DIR=mkdtempSync(path.join(tmpdir(),'wemove-invoices-'));process.env.CRM_LEAD_NOTIFICATIONS='false';process.env.CRM_CUSTOMER_RECEIPTS='false';
const store=await import('../server/crmStore.mjs');const {createApp}=await import('../server.mjs');
const actor={email:'test@example.invalid',name:'Test',role:'gerant'};
const lead=await store.createQuoteLead({fullName:'Client test isolé',email:'test@example.invalid'});let q=await store.createQuoteDraft(lead.id);
await assert.rejects(()=>store.createInvoicePreparation(q.id,actor),e=>e.status===409);
await store.updateQuoteLead(lead.id,{status:'confirme'});
await assert.rejects(()=>store.createInvoicePreparation(q.id,actor),e=>e.status===400);
q.document.fields.clientAddress='Adresse de test';q=await store.saveQuoteDraft(q.id,{revision:q.revision,items:[{description:'Transport test',quantity:2,unitPriceHT:100}],taxRate:20,depositRate:30,validUntil:'',notes:'',document:q.document});
const [a,b]=await Promise.all([store.createInvoicePreparation(q.id,actor),store.createInvoicePreparation(q.id,actor)]);assert.equal(a.id,b.id);assert.equal(a.amountTTC,240);assert.equal(a.number,null);assert.equal((await store.getInvoicePreparations()).length,1);
await assert.rejects(()=>store.saveInvoicePreparation(a.id,{revision:a.revision,dueDate:'2026-02-30',notes:''},actor),e=>e.status===400);
await assert.rejects(()=>store.saveInvoicePreparation(a.id,{revision:a.revision,dueDate:'',notes:'',number:'FA-1'},actor),e=>e.status===400);
const saved=await store.saveInvoicePreparation(a.id,{revision:a.revision,dueDate:'2026-12-01',notes:'Vérifier la référence'},actor);assert.equal(saved.revision,2);
await assert.rejects(()=>store.saveInvoicePreparation(a.id,{revision:1,dueDate:'',notes:''},actor),e=>e.status===409);
await store.saveQuoteDraft(q.id,{revision:q.revision,items:[{description:'Transport modifié',quantity:1,unitPriceHT:900}],taxRate:20,depositRate:30,validUntil:'',notes:'',document:q.document});assert.equal((await store.getInvoicePreparations())[0].amountTTC,240);
const server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));try{const base='http://127.0.0.1:'+server.address().port;process.env.CRM_LOCAL_ACCESS='false';for(const method of ['GET','POST','PATCH']){const response=await fetch(base+'/api/crm/invoice-preparations'+(method==='PATCH'?'/missing':''),{method,headers:{'Content-Type':'application/json'},body:method==='GET'?undefined:'{}'});assert.equal(response.status,401);}process.env.CRM_LOCAL_ACCESS='true';const response=await fetch(base+'/api/crm/invoice-preparations');assert.equal(response.status,200);assert.equal((await response.json()).invoices.length,1);}finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
console.log('Brouillons factures : accès privé, éligibilité, calculs, création idempotente, snapshot, dates, champs protégés, concurrence et persistance SQLite vérifiés. Aucune facture émise.');

// Isolated numbering: retries, manager-only resets and preserved drafts.
const initial=await store.getInvoiceTestState();assert.equal(initial.counter,0);
await assert.rejects(()=>store.changeInvoiceTestState({action:'number',revision:initial.revision,invoiceId:a.id},{...actor,role:'secretaire'}),e=>e.status===403);
const first=await store.changeInvoiceTestState({action:'number',revision:initial.revision,invoiceId:a.id},actor);assert.equal(first.lastNumber,'TEST-S1-00001');
await assert.rejects(()=>store.changeInvoiceTestState({action:'number',revision:initial.revision,invoiceId:a.id},actor),e=>e.status===409);
const results=await Promise.allSettled([1,2].map(()=>store.changeInvoiceTestState({action:'number',revision:first.revision,invoiceId:a.id},actor)));assert.equal(results.filter(r=>r.status==='fulfilled').length,1);
const latest=await store.getInvoiceTestState();assert.equal(latest.counter,2);
const reset=await store.changeInvoiceTestState({action:'reset',revision:latest.revision},actor);assert.equal(reset.counter,0);assert.equal(reset.session,2);
const next=await store.changeInvoiceTestState({action:'number',revision:reset.revision,invoiceId:a.id},actor);assert.equal(next.lastNumber,'TEST-S2-00001');
assert.equal((await store.getInvoicePreparations())[0].number,null);assert.equal((await store.getInvoicePreparations()).length,1);
console.log('Compteur TEST : remise à zéro, sessions distinctes, rôle gérant, concurrence et préservation des brouillons vérifiés.');
