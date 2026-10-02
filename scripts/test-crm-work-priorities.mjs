import assert from 'node:assert/strict';
import {workQueue,nextStep} from '../shared/crmWorkflow.mjs';
const today='2026-10-02';
const rows=[{id:'visit',status:'prise_contact',visitDate:'2026-09-30T10:00',visitStatus:'programmee',nextAction:{type:'visite',dueDate:'2026-10-05'}},{id:'call',status:'prise_contact',nextAction:{type:'rappeler',dueDate:today}},{id:'future',status:'prise_contact',nextAction:{type:'rappeler',dueDate:'2026-10-10'}},{id:'new',status:'nouveau'},{id:'closed',status:'refuse'}];
const queue=workQueue(rows,today);assert.equal(queue.length,4);assert.equal(queue[0].lead.id,'visit');assert.equal(queue[0].bucket,'overdue');assert.equal(queue[0].step.label,'Vérifier la visite passée');assert.equal(queue[1].bucket,'today');assert.equal(queue.find(r=>r.lead.id==='future').bucket,'upcoming');assert.equal(queue.find(r=>r.lead.id==='new').bucket,'undated');
assert.equal(nextStep({...rows[0],visitStatus:'effectuee'},today).target,'summary');
assert.equal(nextStep({...rows[0],status:'confirme',scheduledTime:'2026-10-01T08:00'},today).label,'Vérifier le déménagement');
assert.equal(workQueue([{...rows[1],status:'termine'}],today)[0].bucket,'undated');
console.log('Tableau de bord : priorités, dates réelles, filtres et actions cohérentes validés.');
