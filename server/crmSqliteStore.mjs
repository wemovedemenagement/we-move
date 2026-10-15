import {newInvoicePreparation,reviseInvoicePreparation} from './crmInvoiceModel.mjs';
import {reviseStorageStay,historyBefore} from './crmStorageStay.mjs';
import {updateFollowUp} from './crmFollowUp.mjs';
import {createHash} from 'node:crypto';
import { newDraft, reviseDraft, draftId, draftError } from './crmDraftModel.mjs';
import { existsSync, readFileSync, mkdirSync } from 'node:fs';
import { makeQuote, mergeQuote } from './crmModel.mjs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';

const dataDir = process.env.CRM_DATA_DIR || path.join(path.dirname(fileURLToPath(import.meta.url)), 'data');
let database;
function db() {
  if (database) return database;
  // Cloud Run storage is ephemeral: do not silently accept customer data there.
  if (process.env.K_SERVICE) throw new Error('Configurer une base hébergée avant d’activer les demandes sur Cloud Run.');
  mkdirSync(dataDir, { recursive: true });
  const connection = new DatabaseSync(path.join(dataDir, 'crm.sqlite'));
  try {
    connection.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS requests (id TEXT PRIMARY KEY, created_at TEXT NOT NULL, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS migrations (name TEXT PRIMARY KEY);');
    connection.exec('CREATE TABLE IF NOT EXISTS quote_drafts (id TEXT PRIMARY KEY, data TEXT NOT NULL)');
    connection.exec('CREATE TABLE IF NOT EXISTS quote_mails (draft_id TEXT NOT NULL, mail_key TEXT NOT NULL, data TEXT NOT NULL, PRIMARY KEY(draft_id,mail_key))');
    connection.exec('BEGIN IMMEDIATE');
    try {
      if (!connection.prepare('SELECT name FROM migrations WHERE name = ?').get('legacy-json')) {
        const legacy = path.join(dataDir, 'quotes.json');
        if (existsSync(legacy)) {
          const records = JSON.parse(readFileSync(legacy, 'utf8'));
          if (!Array.isArray(records)) throw new Error('Le fichier historique des demandes est invalide.');
          const insert = connection.prepare('INSERT INTO requests (id, created_at, data) VALUES (?, ?, ?)');
          for (const record of records) {
            if (!record.id || !record.createdAt) throw new Error('Une demande historique est invalide.');
            insert.run(record.id, record.createdAt, JSON.stringify(record));
          }
        }
        connection.prepare('INSERT INTO migrations (name) VALUES (?)').run('legacy-json');
      }
      connection.exec('COMMIT');
    } catch (error) { connection.exec('ROLLBACK'); throw error; }
    database = connection;
    return database;
  } catch (error) { connection.close(); throw error; }
}

export function getAllQuotes() {
  return db().prepare('SELECT data FROM requests ORDER BY created_at DESC, id').all().map(row => JSON.parse(row.data));
}
export function customerReceiptTransaction(id,action) {
 return draftTransaction(connection=>{
  const row=connection.prepare('SELECT data FROM requests WHERE id = ?').get(draftId(id));
  if(!row)throw new Error('Demande introuvable');
  const lead=JSON.parse(row.data),result=action(lead);if(!result.write)return result;
  if(result.notification.state==='sending'){
   connection.exec('CREATE TABLE IF NOT EXISTS receipt_limits (id TEXT PRIMARY KEY, data TEXT NOT NULL)');
   const read=key=>JSON.parse(connection.prepare('SELECT data FROM receipt_limits WHERE id = ?').get(key)?.data||'{}');
   const key=createHash('sha256').update(lead.email.trim().toLowerCase()).digest('hex'),now=Date.now(),day=new Date(now).toISOString().slice(0,10),global=read('daily'),count=global.day===day?global.count:0;
   if(now-(read(key).lastAttempt||0)<3600000||count>=200){connection.prepare('UPDATE requests SET data = ? WHERE id = ?').run(JSON.stringify({...lead,customerNotification:{state:'suppressed',reason:'rate_limit',createdAt:new Date(now).toISOString()}}),id);return {write:false};}
   const save=connection.prepare('INSERT OR REPLACE INTO receipt_limits (id,data) VALUES (?,?)');save.run(key,JSON.stringify({lastAttempt:now}));save.run('daily',JSON.stringify({day,count:count+1}));
  }
  connection.prepare('UPDATE requests SET data = ? WHERE id = ?').run(JSON.stringify({...lead,customerNotification:result.notification}),id);return result;
 });
}
export function leadNotificationTransaction(id,action) {
  return draftTransaction(connection=>{
    const row=connection.prepare('SELECT data FROM requests WHERE id = ?').get(draftId(id));
    if(!row)throw new Error('Demande introuvable');
    const lead=JSON.parse(row.data),result=action(lead);
    if(result.write)connection.prepare('UPDATE requests SET data = ? WHERE id = ?').run(JSON.stringify({...lead,notification:result.notification}),id);
    return result;
  });
}
export function createQuoteLead(payload) {
  const quote = makeQuote(payload);
  db().prepare('INSERT INTO requests (id, created_at, data) VALUES (?, ?, ?)').run(quote.id, quote.createdAt, JSON.stringify(quote));
  return quote;
}
export function updateQuoteLead(id, updates) {
  const connection = db();
  connection.exec('BEGIN IMMEDIATE');
  try {
    const row = connection.prepare('SELECT data FROM requests WHERE id = ?').get(id);
    if (!row) { connection.exec('COMMIT'); return null; }
    const current = JSON.parse(row.data);
    const quote = mergeQuote(current, updates);
    connection.prepare('UPDATE requests SET data = ? WHERE id = ?').run(JSON.stringify(quote), id);
    connection.exec('COMMIT');
    return quote;
  } catch (error) { connection.exec('ROLLBACK'); throw error; }
}
export function deleteQuoteLead(id) {
  return draftTransaction(()=>{
  if(getStorageStays().some(s=>s.leadId===id))draftError(409,'Ce dossier possède un historique de stockage et doit être conservé.');
  if(getPlanning().bookings.some(b=>b.leadId===id))draftError(409,'Ce dossier possède un historique de réservation et doit être conservé.');
  if (db().prepare('SELECT id FROM quote_drafts WHERE id = ?').get(id)) draftError(409, 'Cette demande possède un brouillon de devis et doit être conservée.');
  return db().prepare('DELETE FROM requests WHERE id = ?').run(id).changes > 0;
  });
}


export function getQuoteDrafts() {
  return db().prepare('SELECT data FROM quote_drafts').all().map(row=>JSON.parse(row.data)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));
}
export function getQuoteMails(id) {return db().prepare('SELECT data FROM quote_mails WHERE draft_id = ?').all(draftId(id)).map(r=>JSON.parse(r.data)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt));}
export function quoteMailTransaction(id,key,action) {
 return draftTransaction(connection=>{
  const d=connection.prepare('SELECT data FROM quote_drafts WHERE id = ?').get(draftId(id));
  if(!d)draftError(404,'Devis introuvable.');
  const m=connection.prepare('SELECT data FROM quote_mails WHERE draft_id = ? AND mail_key = ?').get(id,draftId(key));
  const draft=JSON.parse(d.data),result=action(draft,m?JSON.parse(m.data):null);
  if(result.write&&result.summary?.state==='accepted'){const row=connection.prepare('SELECT data FROM requests WHERE id=?').get(id);const lead=row&&JSON.parse(row.data);if(lead&&['nouveau','prise_contact','visite_technique','devis_brouillon'].includes(lead.status))connection.prepare('UPDATE requests SET data=? WHERE id=?').run(JSON.stringify(mergeQuote(lead,{status:'devis_envoye',author:result.record.actor||'Envoi CRM'})),id);}
  if(result.write){connection.prepare('INSERT OR REPLACE INTO quote_mails (draft_id,mail_key,data) VALUES (?,?,?)').run(id,key,JSON.stringify(result.record));if(result.summary)connection.prepare('UPDATE quote_drafts SET data = ? WHERE id = ?').run(JSON.stringify({...draft,emailDelivery:result.summary}),id);}
  return result;
 });
}
function draftTransaction(action) {
  const connection=db(); connection.exec('BEGIN IMMEDIATE');
  try { const result=action(connection);connection.exec('COMMIT');return result; }
  catch(error) {connection.exec('ROLLBACK');throw error;}
}
function storageTables(){db().exec('CREATE TABLE IF NOT EXISTS storage_stays (id TEXT PRIMARY KEY,data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS storage_events (stay_id TEXT NOT NULL,revision INTEGER NOT NULL,data TEXT NOT NULL,PRIMARY KEY(stay_id,revision))');}
export function getStorageStays(){storageTables();return db().prepare('SELECT data FROM storage_stays').all().map(r=>JSON.parse(r.data)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}
export function saveStorageStay(payload,actor){
 storageTables();const id=draftId(payload?.id),leadId=draftId(payload?.leadId);
 return draftTransaction(c=>{
   const current=c.prepare('SELECT data FROM storage_stays WHERE id=?').get(id),lead=c.prepare('SELECT data FROM requests WHERE id=?').get(leadId);
   const result=reviseStorageStay(current?JSON.parse(current.data):null,lead?JSON.parse(lead.data):null,payload,actor);
   c.prepare('INSERT OR REPLACE INTO storage_stays(id,data) VALUES(?,?)').run(id,JSON.stringify(result.stay));
   c.prepare('INSERT INTO storage_events(stay_id,revision,data) VALUES(?,?,?)').run(id,result.stay.revision,JSON.stringify(result.event));
   c.prepare('UPDATE requests SET data=? WHERE id=?').run(JSON.stringify(result.lead),leadId);
   return {stay:result.stay,lead:result.lead};
 });
}
export function getStorageHistory(id,before){storageTables();draftId(id);if(!db().prepare('SELECT id FROM storage_stays WHERE id=?').get(id))draftError(404,'Séjour introuvable.');const rows=db().prepare('SELECT data FROM storage_events WHERE stay_id=? AND revision<? ORDER BY revision DESC LIMIT 21').all(id,historyBefore(before)).map(r=>JSON.parse(r.data));return {events:rows.slice(0,20),next:rows.length>20?rows[19].revision:null};}
export function createQuoteDraft(leadId) {
  const id=draftId(leadId);
  return draftTransaction(connection=>{
    const row=connection.prepare('SELECT data FROM requests WHERE id = ?').get(id);
    if(!row) draftError(404,'Demande introuvable.');
    const existing=connection.prepare('SELECT data FROM quote_drafts WHERE id = ?').get(id);
    if(existing)return JSON.parse(existing.data);
    const draft=newDraft(JSON.parse(row.data));
    connection.prepare('INSERT INTO quote_drafts (id,data) VALUES (?,?)').run(id,JSON.stringify(draft));
    return draft;
  });
}
export function saveQuoteDraft(id,payload) {
  draftId(id);
  return draftTransaction(connection=>{
    const row=connection.prepare('SELECT data FROM quote_drafts WHERE id = ?').get(id);
    if(!row)draftError(404,'Brouillon introuvable.');
    const updated=reviseDraft(JSON.parse(row.data),payload);
    connection.prepare('UPDATE quote_drafts SET data = ? WHERE id = ?').run(JSON.stringify(updated),id);
    return updated;
  });
}

export function saveFollowUp(id,payload,actor) {
  return draftTransaction(connection=>{
    const current=connection.prepare('SELECT data FROM requests WHERE id = ?').get(draftId(id));if(!current)return null;
    const updated=updateFollowUp(JSON.parse(current.data),payload,actor);
    connection.prepare('UPDATE requests SET data = ? WHERE id = ?').run(JSON.stringify(updated),id);return updated;
  });
}

export function getInvoicePreparations(){db().exec('CREATE TABLE IF NOT EXISTS invoice_preparations (id TEXT PRIMARY KEY, data TEXT NOT NULL)');return db().prepare('SELECT data FROM invoice_preparations').all().map(r=>JSON.parse(r.data)).sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt));}
export function createInvoicePreparation(id,actor){
 draftId(id);getInvoicePreparations();
 return draftTransaction(c=>{const found=c.prepare('SELECT data FROM invoice_preparations WHERE id=?').get(id);if(found)return JSON.parse(found.data);
 const q=c.prepare('SELECT data FROM quote_drafts WHERE id=?').get(id),l=c.prepare('SELECT data FROM requests WHERE id=?').get(id);
 const result=newInvoicePreparation(q&&JSON.parse(q.data),l&&JSON.parse(l.data),actor);
 c.prepare('INSERT INTO invoice_preparations(id,data) VALUES(?,?)').run(id,JSON.stringify(result));return result;});
}
export function saveInvoicePreparation(id,payload,actor){draftId(id);getInvoicePreparations();return draftTransaction(c=>{const r=c.prepare('SELECT data FROM invoice_preparations WHERE id=?').get(id);if(!r)draftError(404,'Brouillon introuvable.');const result=reviseInvoicePreparation(JSON.parse(r.data),payload,actor);c.prepare('UPDATE invoice_preparations SET data=? WHERE id=?').run(JSON.stringify(result),id);return result;});}

import {initialInvoiceTestState,invoiceTestChange} from './crmInvoiceTestModel.mjs';
function invoiceTestTables(){db().exec('CREATE TABLE IF NOT EXISTS invoice_test_state (id TEXT PRIMARY KEY, data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS invoice_test_events (id INTEGER PRIMARY KEY, data TEXT NOT NULL)');}
export function getInvoiceTestState(){invoiceTestTables();const row=db().prepare('SELECT data FROM invoice_test_state WHERE id=?').get('test');return row?JSON.parse(row.data):initialInvoiceTestState();}
export function changeInvoiceTestState(payload,actor){
 invoiceTestTables();getInvoicePreparations();
 return draftTransaction(c=>{
 const row=c.prepare('SELECT data FROM invoice_test_state WHERE id=?').get('test');
 const current=row?JSON.parse(row.data):initialInvoiceTestState();
 const invoice=payload?.action==='number'?c.prepare('SELECT data FROM invoice_preparations WHERE id=?').get(draftId(payload.invoiceId)):null;
 const result=invoiceTestChange(current,payload,invoice?JSON.parse(invoice.data):null,actor);
 c.prepare('INSERT OR REPLACE INTO invoice_test_state(id,data) VALUES(?,?)').run('test',JSON.stringify(result.state));
 c.prepare('INSERT INTO invoice_test_events(id,data) VALUES(?,?)').run(result.state.revision,JSON.stringify(result.event));return result.state;
 });
}

export function getDossierRecords(id){
 draftId(id);getInvoicePreparations();
 const read=(table)=>{const row=db().prepare(`SELECT data FROM ${table} WHERE id=?`).get(id);return row?JSON.parse(row.data):null;};
 return {lead:read('requests'),quote:read('quote_drafts'),invoice:read('invoice_preparations'),mails:getQuoteMails(id).map(({pdfBase64,...mail})=>mail)};
}

import {emptyRegistry,reviseRegistry,makeBooking,applyBooking} from './crmPlanningModel.mjs';
function planningTables(){db().exec('CREATE TABLE IF NOT EXISTS resource_events (id INTEGER PRIMARY KEY AUTOINCREMENT,data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS resource_registry (id TEXT PRIMARY KEY,data TEXT NOT NULL); CREATE TABLE IF NOT EXISTS move_bookings (id TEXT PRIMARY KEY,data TEXT NOT NULL)');}
export function getPlanning(){planningTables();const r=db().prepare('SELECT data FROM resource_registry WHERE id=?').get('main');return {registry:r?JSON.parse(r.data):emptyRegistry(),bookings:db().prepare('SELECT data FROM move_bookings').all().map(r=>JSON.parse(r.data))};}
export function saveResource(payload,actor){planningTables();return draftTransaction(c=>{const state=getPlanning();const registry=reviseRegistry(state.registry,payload,actor,state.bookings);c.prepare('INSERT OR REPLACE INTO resource_registry(id,data) VALUES(?,?)').run('main',JSON.stringify(registry));c.prepare('INSERT INTO resource_events(data) VALUES(?)').run(JSON.stringify({at:new Date().toISOString(),actor:actor.email||actor.name,change:payload}));return registry;});}
export function saveBooking(id,payload,actor){draftId(id);planningTables();return draftTransaction(c=>{
 const row=c.prepare('SELECT data FROM requests WHERE id=?').get(id);const lead=row?JSON.parse(row.data):null,state=getPlanning();
 const booking=makeBooking(lead,state.bookings.find(b=>b.leadId===id),state.bookings,state.registry,payload,actor);const updated=applyBooking(lead,booking,actor);
 c.prepare('INSERT OR REPLACE INTO move_bookings(id,data) VALUES(?,?)').run(id,JSON.stringify(booking));c.prepare('UPDATE requests SET data=? WHERE id=?').run(JSON.stringify(updated),id);return {booking,lead:updated};
 });}

import {issueTestDocument,reviseTestPayment} from './crmTestBillingModel.mjs';
function testBillingTable(){invoiceTestTables();db().exec('CREATE TABLE IF NOT EXISTS invoice_test_documents (id TEXT PRIMARY KEY,data TEXT NOT NULL)');}
export function getTestBillingDocuments(){testBillingTable();return db().prepare('SELECT data FROM invoice_test_documents').all().map(r=>JSON.parse(r.data)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)).slice(0,200);}
export function getTestBillingDocument(id){testBillingTable();const row=db().prepare('SELECT data FROM invoice_test_documents WHERE id=?').get(draftId(id));return row?JSON.parse(row.data):null;}
export function createTestBillingDocument(payload,actor){testBillingTable();getInvoicePreparations();return draftTransaction(c=>{
 const row=c.prepare('SELECT data FROM invoice_preparations WHERE id=?').get(draftId(payload?.invoiceId));
 const all=c.prepare('SELECT data FROM invoice_test_documents').all().map(r=>JSON.parse(r.data));
 const result=issueTestDocument(getInvoiceTestState(),row?JSON.parse(row.data):null,all,payload,actor);
 c.prepare('INSERT INTO invoice_test_documents(id,data) VALUES(?,?)').run(result.document.id,JSON.stringify(result.document));
 c.prepare('INSERT OR REPLACE INTO invoice_test_state(id,data) VALUES(?,?)').run('test',JSON.stringify(result.state));
 c.prepare('INSERT INTO invoice_test_events(id,data) VALUES(?,?)').run(result.state.revision,JSON.stringify({action:'document',documentId:result.document.id,number:result.document.number,at:result.document.createdAt,actor:result.document.createdBy}));return result;
 });}
export function saveTestBillingPayment(id,payload,actor){testBillingTable();return draftTransaction(c=>{const document=reviseTestPayment(getInvoiceTestState(),getTestBillingDocument(id),payload,actor);c.prepare('UPDATE invoice_test_documents SET data=? WHERE id=?').run(JSON.stringify(document),id);return document;});}

import {initialBilling} from './crmBillingModel.mjs';
function billingTables(){db().exec('CREATE TABLE IF NOT EXISTS billing_state (id TEXT PRIMARY KEY,data TEXT NOT NULL);CREATE TABLE IF NOT EXISTS billing_documents (id TEXT PRIMARY KEY,data TEXT NOT NULL);CREATE TABLE IF NOT EXISTS billing_events (id INTEGER PRIMARY KEY,data TEXT NOT NULL)');}
export function getBillingState(){billingTables();const r=db().prepare('SELECT data FROM billing_state WHERE id=?').get('main');return r?JSON.parse(r.data):initialBilling();}
export function getBillingDocument(id){billingTables();const r=db().prepare('SELECT data FROM billing_documents WHERE id=?').get(draftId(id));return r?JSON.parse(r.data):null;}
export function getBillingRelated(invoiceId){billingTables();return db().prepare('SELECT data FROM billing_documents').all().map(r=>JSON.parse(r.data)).filter(d=>d.invoiceId===invoiceId);}
export function getBillingOverviewRecords(invoiceId){billingTables();return db().prepare('SELECT data FROM billing_documents').all().map(r=>JSON.parse(r.data)).filter(d=>!invoiceId||d.invoiceId===invoiceId).map(d=>{const {id,number,mode,kind,invoiceId,leadId,dueDate,issueDate,createdAt,amountHT,taxAmount,quoteReference,creditNumber,amountTTC,creditedTTC,payments}=d;return {id,number,mode,kind,invoiceId,leadId,dueDate,issueDate,createdAt,amountHT,taxAmount,quoteReference,creditNumber,amountTTC,creditedTTC,payments,snapshot:{clientName:d.snapshot.clientName}};});}
export function listBillingDocuments(cursor){billingTables();const all=db().prepare('SELECT data FROM billing_documents').all().map(r=>JSON.parse(r.data)).sort((a,b)=>b.createdAt.localeCompare(a.createdAt)||b.id.localeCompare(a.id));const offset=cursor?all.findIndex(d=>d.id===cursor)+1:0;const documents=all.slice(offset,offset+40);return {documents,cursor:offset+40<all.length?documents.at(-1).id:null};}
export function commitBilling({revision,nextState,documents=[],sourceCheck,event}){billingTables();getInvoicePreparations();return draftTransaction(c=>{const current=getBillingState();if(current.revision!==revision)draftError(409,'La facturation a changé. Actualisez et réessayez.');if(sourceCheck){const r=c.prepare('SELECT data FROM invoice_preparations WHERE id=?').get(sourceCheck.id);if(!r||JSON.parse(r.data).revision!==sourceCheck.revision)draftError(409,'Le brouillon a changé.');}const state={...(nextState||current),revision:current.revision+1};c.prepare('INSERT OR REPLACE INTO billing_state(id,data) VALUES(?,?)').run('main',JSON.stringify(state));for(const d of documents)c.prepare('INSERT OR REPLACE INTO billing_documents(id,data) VALUES(?,?)').run(d.id,JSON.stringify(d));c.prepare('INSERT INTO billing_events(id,data) VALUES(?,?)').run(state.revision,JSON.stringify(event));return state;});}
import {emptyPricing,revisePricing} from './crmPricing.mjs';
function pricingTable(){db().exec('CREATE TABLE IF NOT EXISTS pricing_settings (id TEXT PRIMARY KEY,data TEXT NOT NULL)');}
export function getPricingSettings(){pricingTable();return JSON.parse(db().prepare('SELECT data FROM pricing_settings WHERE id=?').get('current')?.data||'null')||emptyPricing();}
export function savePricingSettings(payload,actor){pricingTable();return draftTransaction(connection=>{const next=revisePricing(getPricingSettings(),payload,actor);const write=connection.prepare('INSERT OR REPLACE INTO pricing_settings (id,data) VALUES (?,?)');write.run('current',JSON.stringify(next));write.run('revision-'+next.revision,JSON.stringify(next));return next;});}
