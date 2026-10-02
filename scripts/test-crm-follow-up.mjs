import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';import {randomUUID} from 'node:crypto';
import {parisToday,followUpBucket} from '../shared/followUp.mjs';
const live=process.argv.includes('--firestore-isolated');
process.env.CRM_STORAGE=live?'firestore':'sqlite';process.env.CRM_LOCAL_ACCESS='true';process.env.NODE_ENV='test';process.env.CRM_DATA_DIR=mkdtempSync(path.join(tmpdir(),'wemove-follow-up-'));
if(live)process.env.CRM_FIRESTORE_TEST_NAMESPACE='integration_'+randomUUID().replaceAll('-','_');
const {memberForIdentity}=await import('../server/crmAuth.mjs');
assert.equal(memberForIdentity({email:'wemove.demenagement@gmail.com',email_verified:false}),null);
assert.equal(memberForIdentity({email:'outside@example.invalid',email_verified:true}),null);
assert.equal(memberForIdentity({email:'wemove.demenagement@gmail.com',email_verified:true}).role,'gerant');
assert.equal(parisToday(new Date('2026-09-27T22:30:00Z')),'2026-09-28');
assert.equal(parisToday(new Date('2026-12-31T23:30:00Z')),'2027-01-01');
assert.equal(followUpBucket({status:'termine',nextAction:{dueDate:'2026-01-01'}},'2026-09-27'),'none');
for(const [date,result]of [['2026-09-26','overdue'],['2026-09-27','today'],['2026-09-28','upcoming']])assert.equal(followUpBucket({status:'nouveau',nextAction:{dueDate:date}},'2026-09-27'),result);
const {createApp}=await import('../server.mjs');const server=createApp().listen(0,'127.0.0.1');await new Promise(resolve=>server.once('listening',resolve));const base='http://127.0.0.1:'+server.address().port;
async function api(route,method='GET',body,headers={}){const response=await fetch(base+route,{method,headers:{'Content-Type':'application/json',...headers},body:body&&JSON.stringify(body)});return {status:response.status,body:await response.json()};}
try{
  assert.equal((await api('/api/crm/session')).body.identity.mode,'local');
  assert.equal((await api('/api/crm/session','GET',null,{Origin:'https://outside.example'})).status,401);
  assert.equal((await api('/api/crm/session','GET',null,{Authorization:'Bearer forged'})).status,401);
  process.env.CRM_LOCAL_ACCESS='false';assert.equal((await api('/api/crm/members')).status,401);process.env.CRM_LOCAL_ACCESS='true';
  process.env.NODE_ENV='production';assert.equal((await api('/api/crm/session')).status,401);process.env.NODE_ENV='test';
  const members=(await api('/api/crm/members')).body.members;assert.equal(members.length,1);assert.equal(members[0].email,'wemove.demenagement@gmail.com');
  const lead=(await api('/api/quotes','POST',{fullName:'Contrôle isolé du suivi',email:'isolated@example.invalid',source:'telephone',assigneeId:members[0].id,nextAction:{type:'rappeler',dueDate:'2026-01-01',note:''}})).body.quote;
  assert.equal(lead.assigneeId,'');assert.equal(lead.nextAction,null);
  const route='/api/quotes/'+lead.id+'/follow-up';
  const payload={revision:0,assigneeId:members[0].id,action:{type:'rappeler',dueDate:'2026-09-27',note:'Précision de test'}};
  assert.equal((await api(route,'PATCH',{...payload,assigneeId:'invented@example.invalid'})).status,400);
  assert.equal((await api(route,'PATCH',{...payload,action:{type:'rappeler',dueDate:'2026-02-31',note:''}})).status,400);
  assert.equal((await api('/api/quotes/'+lead.id,'PATCH',{assignedAgent:'Faux nom'})).status,400);
  const concurrent=await Promise.all([api(route,'PATCH',payload),api(route,'PATCH',payload)]);assert.deepEqual(concurrent.map(r=>r.status).sort(),[200,409]);
  const saved=concurrent.find(r=>r.status===200).body.quote;assert.equal(saved.assigneeId,members[0].id);assert.equal(saved.followUpRevision,1);assert.equal(saved.nextAction.type,'rappeler');
  const completed=(await api(route,'PATCH',{revision:1,complete:true})).body.quote;assert.equal(completed.nextAction,null);assert.equal(completed.assigneeId,members[0].id);assert.equal(completed.followUpRevision,2);assert.ok(completed.internalNotes[0].content.includes('Action terminée'));
  assert.equal((await api(route,'PATCH',{revision:2,complete:true})).status,409);
  const reread=(await api('/api/quotes')).body.quotes.find(q=>q.id===lead.id);assert.equal(reread.followUpRevision,2);assert.equal(reread.nextAction,null);
  console.log('Suivi vérifié : utilisateur réel, contrôle d’accès, dates Paris, validation, concurrence, historique et clôture ('+(live?'Firestore isolé':'SQLite isolé')+').');
}finally{await new Promise(resolve=>server.close(resolve));if(live){const {firestore}=await import('../server/crmFirestoreStore.mjs');const db=firestore();const snapshot=await db.collection(process.env.CRM_FIRESTORE_TEST_NAMESPACE+'_crm_requests').get();for(const doc of snapshot.docs)await doc.ref.delete();await db.terminate();console.log('Documents de test isolés nettoyés.');}}
