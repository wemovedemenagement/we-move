import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';
process.env.CRM_STORAGE='sqlite';process.env.CRM_LOCAL_ACCESS='true';process.env.NODE_ENV='test';process.env.CRM_DATA_DIR=mkdtempSync(path.join(tmpdir(),'wm-contact-'));process.env.CRM_LEAD_NOTIFICATIONS='false';process.env.CRM_CUSTOMER_RECEIPTS='false';process.env.CRM_BILLING_LIVE_ENABLED='false';
const {createApp}=await import('../server.mjs');const store=await import('../server/crmStore.mjs');
const server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base='http://127.0.0.1:'+server.address().port;
async function api(route,body){const r=await fetch(base+route,{method:body?'PATCH':'GET',headers:{'Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});return {status:r.status,body:await r.json()};}
try{
 const members=(await api('/api/crm/members')).body.members;
 const lead=await store.createQuoteLead({fullName:'Contact isolé',email:'test@example.invalid',departureAddress:'Paris',arrivalAddress:'Lyon'});
 const draft=await store.createQuoteDraft(lead.id),route='/api/quotes/'+lead.id+'/follow-up';
 const contact={channel:'phone',outcome:'no_answer',note:'Deux appels sans réponse.'};
 const payload={revision:0,assigneeId:members[0].id,action:{type:'rappeler',dueDate:'2026-11-03',note:'Matin'},contact};
 process.env.CRM_LOCAL_ACCESS='false';assert.equal((await api(route,payload)).status,401);process.env.CRM_LOCAL_ACCESS='true';
 for(const c of [null,[],{...contact,channel:'sms'},{...contact,outcome:'accepted'},{...contact,createdAt:'2000-01-01'},{...contact,note:'x'.repeat(1001)},{...contact,outcome:'changes',note:' '}])assert.equal((await api(route,{...payload,contact:c})).status,400);
 assert.equal((await api(route,{...payload,complete:true})).status,400);
 assert.equal((await api(route,{...payload,assigneeId:'unauthorized@example.invalid'})).status,400);
 assert.equal((await api(route,{...payload,action:{...payload.action,dueDate:'2026-02-31'}})).status,400);
 assert.equal((await api('/api/quotes/'+lead.id,{lastCommercialContact:contact})).status,400);
 const concurrent=await Promise.all([api(route,payload),api(route,payload)]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);
 let saved=concurrent.find(r=>r.status===200).body.quote;
 assert.equal(saved.status,lead.status);assert.equal(saved.followUpRevision,1);assert.deepEqual(saved.nextAction,payload.action);assert.equal(saved.lastCommercialContact.outcome,'no_answer');assert.ok(Number.isFinite(Date.parse(saved.lastCommercialContact.createdAt)));assert.ok(saved.lastCommercialContact.author);assert.match(saved.internalNotes[0].content,/Deux appels sans réponse/);assert.match(saved.internalNotes[0].content,/Rappeler le 2026-11-03/);
 assert.deepEqual((await store.getQuoteDrafts())[0],draft,'Logging must not change the quote');assert.equal((await store.getQuoteMails(draft.id)).length,0);
 saved=(await api(route,{revision:1,complete:true})).body.quote;assert.equal(saved.lastCommercialContact.outcome,'no_answer');assert.equal(saved.nextAction,null);
 const result=await api(route,{...payload,revision:2,contact:{channel:'email',outcome:'changes',note:'Modifier la date souhaitée.'},action:{type:'devis',dueDate:'2026-11-04',note:'Revoir les dates'}});assert.equal(result.status,200);saved=result.body.quote;assert.equal(saved.lastCommercialContact.channel,'email');assert.equal(saved.nextAction.type,'devis');assert.equal(saved.internalNotes.filter(n=>n.content.startsWith('Échange commercial')).length,2);
 for(const status of ['confirme','refuse','termine']){await store.updateQuoteLead(lead.id,{status});assert.equal((await api(route,{...payload,revision:3})).status,409);}
 assert.equal((await api('/api/quotes')).body.quotes.find(l=>l.id===lead.id).followUpRevision,3);
 console.log('Échanges commerciaux : accès, validation, droits des responsables, concurrence, historique, préservation du devis, suivi et dossiers clos vérifiés. Aucun envoi.');
}finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
