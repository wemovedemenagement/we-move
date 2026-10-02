import assert from 'node:assert/strict';
import { quoteFollowUp } from '../shared/quoteFollowUp.mjs';
const draft={revision:3,emailDelivery:{revision:3,state:'accepted'}};
const lead={status:'devis_envoye',nextAction:null};
const read=(d=draft,l=lead)=>quoteFollowUp(d,l,'2026-10-01');
assert.equal(read().waiting,true);assert.equal(read().unscheduled,true);
assert.equal(read({...draft,revision:4}).deliveryLabel,'Modifié depuis l’envoi');
assert.equal(read({...draft,revision:4}).waiting,false);
assert.equal(read({...draft,emailDelivery:{revision:3,state:'uncertain'}}).mailIssue,true);
assert.equal(read({...draft,emailDelivery:{revision:3,state:'sending'}}).deliveryLabel,'Envoi en cours');
assert.equal(read({...draft,emailDelivery:{revision:3,state:'failed'}}).deliveryLabel,'Envoi refusé');
for(const status of ['confirme','refuse','termine']) {const f=read(draft,{status,nextAction:{type:'relancer',dueDate:'2026-09-30'}});assert.equal(f.waiting,false);assert.equal(f.followDue,false);}
assert.equal(read(draft,null).waiting,false);
assert.equal(read(draft,{...lead,nextAction:{type:'relancer',dueDate:'2026-10-01'}}).followDue,true);
assert.equal(read(draft,{...lead,nextAction:{type:'rappeler',dueDate:'2026-09-30'}}).overdue,true);
assert.equal(read(draft,{...lead,nextAction:{type:'relancer',dueDate:'2026-10-02'}}).followDue,false);
assert.equal(read(draft,{...lead,nextAction:{type:'facturer',dueDate:'2026-09-30'}}).followDue,false);
console.log('Suivi devis : envois réels, révisions, dossiers clos, actions datées et échéances validés.');
