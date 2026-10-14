import assert from 'node:assert/strict';
import {crmNotifications} from '../shared/crmNotifications.mjs';
const today='2026-10-14';
const leads=[
 {id:'new',status:'nouveau'},
 {id:'visit',status:'prise_contact',visitDate:'2026-10-13T10:00',visitStatus:'programmee',nextAction:{type:'visite',dueDate:'2026-10-20'}},
 {id:'move',status:'confirme',scheduledTime:today+'T08:00'},
 {id:'stale',status:'prise_contact',visitStatus:'effectuee',nextAction:{type:'visite',dueDate:'2026-10-13'}},
 {id:'future',status:'prise_contact',nextAction:{type:'rappeler',dueDate:'2026-10-20'}},
 {id:'done',status:'termine',nextAction:{type:'rappeler',dueDate:'2026-10-13'}},
 {id:'refused',status:'refuse',nextAction:{type:'rappeler',dueDate:'2026-10-13'}},
];
const alerts=crmNotifications(leads,today);
assert.deepEqual(alerts.map(a=>a.lead.id).sort(),['move','new','stale','visit']);
assert.equal(alerts[0].lead.id,'visit');
assert.equal(alerts.find(a=>a.lead.id==='visit').label,'Vérifier la visite passée');
assert.equal(alerts.find(a=>a.lead.id==='move').badge,'Aujourd’hui');
assert.equal(alerts.find(a=>a.lead.id==='stale').badge,'Suivi à actualiser');
assert.equal(crmNotifications([{...leads[0],nextAction:{type:'rappeler',dueDate:today}}],today).length,1);
assert.equal(crmNotifications([{...leads[1],visitDate:'2026-10-20T10:00'}],today).length,0);
assert.equal(leads[3].nextAction.type,'visite');
console.log('Notifications : priorités partagées, visites, missions, suivi obsolète, absence de doublons et dossiers clos validés.');
