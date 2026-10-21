import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';
import {quotePostponeMinimum} from '../shared/quotePostpone.mjs';
import {parisToday,followUpDateIn} from '../shared/followUp.mjs';
import {updateFollowUp} from '../server/crmFollowUp.mjs';
const sample={status:'nouveau',nextAction:{type:'rappeler',dueDate:'2026-10-23',note:'Précision conservée'}};
assert.equal(quotePostponeMinimum(sample,'2026-10-21'),'2026-10-24');
assert.equal(quotePostponeMinimum({...sample,nextAction:{...sample.nextAction,dueDate:'2026-10-20'}},'2026-10-21'),'2026-10-22');
assert.equal(quotePostponeMinimum({...sample,nextAction:{...sample.nextAction,dueDate:'2028-02-28'}},'2028-02-28'),'2028-02-29');
assert.equal(quotePostponeMinimum({...sample,nextAction:{...sample.nextAction,dueDate:'2026-12-31'}},'2026-12-30'),'2027-01-01');
assert.equal(quotePostponeMinimum({...sample,nextAction:{...sample.nextAction,dueDate:'9999-12-31'}},'2026-10-21'),'');
for(const value of ['',null,'2026-02-30'])assert.equal(quotePostponeMinimum({...sample,nextAction:{...sample.nextAction,dueDate:value}},'2026-10-21'),'2026-10-22');
for(const status of ['confirme','termine','refuse'])assert.equal(quotePostponeMinimum({...sample,status},'2026-10-21'),'');
for(const type of ['visite','devis','documents','facturer','planifier'])assert.equal(quotePostponeMinimum({...sample,nextAction:{...sample.nextAction,type}},'2026-10-21'),'');
assert.equal(quotePostponeMinimum({...sample,nextAction:null},'2026-10-21'),'');assert.equal(quotePostponeMinimum(null,'2026-10-21'),'');
assert.equal(parisToday(new Date('2026-10-21T22:30:00Z')),'2026-10-22');
Object.assign(process.env,{CRM_STORAGE:'sqlite',CRM_LOCAL_ACCESS:'true',NODE_ENV:'test',CRM_DATA_DIR:mkdtempSync(path.join(tmpdir(),'wm-postpone-')),CRM_LEAD_NOTIFICATIONS:'false',CRM_CUSTOMER_RECEIPTS:'false',CRM_BILLING_LIVE_ENABLED:'false'});
const {createApp}=await import('../server.mjs'),store=await import('../server/crmStore.mjs');
const server=createApp().listen(0,'127.0.0.1');await new Promise(r=>server.once('listening',r));const base=`http://127.0.0.1:${server.address().port}`;
async function patch(url,body){const r=await fetch(base+url,{method:'PATCH',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};}
try{
 const members=(await(await fetch(base+'/api/crm/members')).json()).members;
 let lead=await store.createQuoteLead({fullName:'Report de recette isolé',email:'test@example.invalid',departureAddress:'Paris',arrivalAddress:'Versailles'});const draft=await store.createQuoteDraft(lead.id),url='/api/quotes/'+lead.id+'/follow-up';
 const due=followUpDateIn(5),later=followUpDateIn(6);
 lead=(await patch(url,{revision:0,assigneeId:members[0].id,action:{type:'rappeler',dueDate:due,note:'Conserver cette précision'},contact:{channel:'phone',outcome:'callback',note:'Échange réellement consigné en recette'}})).body.quote;
 const before=structuredClone(lead),draftBefore=structuredClone(draft);
 process.env.CRM_LOCAL_ACCESS='false';assert.equal((await patch(url,{revision:1,postponeTo:later})).status,401);process.env.CRM_LOCAL_ACCESS='true';
 for(const date of ['',null,[],{},15,false,'2026-02-30',parisToday(),followUpDateIn(-1),due,followUpDateIn(4)])assert.equal((await patch(url,{revision:1,postponeTo:date})).status,400);
 for(const mixed of [{complete:true},{complete:false},{contact:{channel:'phone',outcome:'no_answer',note:''}},{assigneeId:''},{action:null},{status:'termine'}])assert.equal((await patch(url,{revision:1,postponeTo:later,...mixed})).status,400);
 assert.deepEqual((await store.getAllQuotes()).find(r=>r.id===lead.id),before);
 const results=await Promise.all([patch(url,{revision:1,postponeTo:later}),patch(url,{revision:1,postponeTo:later})]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);lead=results.find(r=>r.status===200).body.quote;
 assert.deepEqual(lead.nextAction,{...before.nextAction,dueDate:later});assert.equal(lead.followUpRevision,2);assert.match(lead.internalNotes[0].content,new RegExp(due+'.*'+later));assert.equal(lead.internalNotes.filter(n=>n.content.startsWith('Relance reportée')).length,1);
 const businessFields=value=>{const {nextAction,followUpRevision,updatedAt,internalNotes,...rest}=value;return rest;};assert.deepEqual(businessFields(lead),businessFields(before));assert.deepEqual(lead.internalNotes.slice(1),before.internalNotes);
 const legacy={...before,assignedAgent:'Ancienne affectation conservée',assigneeName:'Ancien nom conservé'};assert.equal(updateFollowUp(legacy,{revision:1,postponeTo:later},{name:'Recette'}).assignedAgent,legacy.assignedAgent);
 for(const status of ['confirme','termine','refuse']){await store.updateQuoteLead(lead.id,{status});assert.equal((await patch(url,{revision:2,postponeTo:followUpDateIn(8)})).status,409);}
 await store.updateQuoteLead(lead.id,{status:'nouveau'});lead=(await patch(url,{revision:2,complete:true})).body.quote;assert.equal((await patch(url,{revision:3,postponeTo:followUpDateIn(8)})).status,409);
 assert.deepEqual((await store.getQuoteDrafts())[0],draftBefore);assert.equal((await store.getQuoteMails(lead.id)).length,0);assert.equal((await store.getBillingRelated(lead.id)).length,0);assert.equal((await store.getBillingState()).active,false);
 console.log('Report de relance : Paris, échéance strictement ultérieure, dates invalides, charge utile exclusive, accès privé, concurrence, historique unique, propriétaire/échange/devis conservés et dossiers clos sans écriture vérifiés.');
}finally{server.closeAllConnections();await new Promise(r=>server.close(r));}
