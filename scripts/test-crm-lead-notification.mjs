import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
process.env.CRM_STORAGE='sqlite';
process.env.CRM_DATA_DIR=mkdtempSync(path.join(tmpdir(),'wm-notification-'));
const {createQuoteLead,getAllQuotes}=await import('../server/crmStore.mjs');
const {notifyWebsiteLead}=await import('../server/crmLeadNotification.mjs');
const create=source=>createQuoteLead({fullName:'Test notification',email:'test@example.test',source});
const lead=await create('page_devis');let calls=0;
const send=async message=>{calls++;assert.equal(message.to.address,'contact@we-move.fr');assert.equal(message.from.address,'contact@we-move.fr');assert.ok(message.text.includes(lead.id));await new Promise(r=>setTimeout(r,20));return {messageId:'fake-provider-id'};};
await Promise.all([notifyWebsiteLead(lead,{enabled:true,send}),notifyWebsiteLead(lead,{enabled:true,send})]);
assert.equal(calls,1);
assert.equal((await getAllQuotes()).find(x=>x.id===lead.id).notification.state,'accepted');
await notifyWebsiteLead(await create('telephone'),{enabled:true,send});assert.equal(calls,1);
for(const [code,state] of [['EPROVIDER_REJECTED','failed'],['ETIMEDOUT','uncertain']]){
 const other=await create('page_devis');let attempts=0;
 const failure=async()=>{attempts++;throw Object.assign(new Error('Fake error'),{code});};
 await notifyWebsiteLead(other,{enabled:true,send:failure});
 await notifyWebsiteLead(other,{enabled:true,send:failure});
 assert.equal(attempts,1);assert.equal((await getAllQuotes()).find(x=>x.id===other.id).notification.state,state);
}
const off=await create('page_devis');await notifyWebsiteLead(off,{enabled:false,send});assert.equal(calls,1);
console.log('Notifications : destinataire fixe, persistance, concurrence, sources, refus et résultat incertain vérifiés sans e-mail réel.');
