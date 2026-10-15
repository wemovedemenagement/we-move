import assert from 'node:assert/strict';
import {planningAvailability} from '../shared/planningAvailability.mjs';
const start='2026-11-16T08:00',end='2026-11-18T18:00';
const resources=[
 {id:'free',name:'Libre',kind:'vehicle',active:true},
 {id:'busy',name:'Réservé',kind:'vehicle',active:true},
 {id:'away',name:'Absent',kind:'person',active:true,unavailablePeriods:[{start:'2026-11-17T09:00',end:'2026-11-17T10:00',reason:'conges'}]},
 {id:'off',name:'Désactivé',kind:'lift',active:false},
];
const bookings=[
 {leadId:'one',resourceIds:['busy'],start:'2026-11-17T09:00',end:'2026-11-17T10:00',cancelled:false},
 {leadId:'cancelled',resourceIds:['free'],start,end,cancelled:true},
 {leadId:'adjacent',resourceIds:['free'],start:'2026-11-15T08:00',end:start,cancelled:false},
];
const snapshot=JSON.stringify({resources,bookings});
const result=planningAvailability(resources,bookings,start,end);
assert.equal(result.valid,true);assert.deepEqual(result.rows.map(r=>[r.resource.id,r.state]),[['free','available'],['busy','busy'],['away','unavailable'],['off','inactive']]);
assert.equal(result.rows.find(r=>r.resource.id==='busy').reservations[0].leadId,'one');
assert.equal(result.rows.find(r=>r.resource.id==='away').absences.length,1);
assert.equal(JSON.stringify({resources,bookings}),snapshot,'Read-only calculation');
for(const [a,b] of [['',end],[end,start],['2026-02-30T08:00',end],[start,start]])assert.deepEqual(planningAvailability(resources,bookings,a,b),{valid:false,rows:[]});
assert.deepEqual(planningAvailability([],[],start,end),{valid:true,rows:[]});
assert.equal(planningAvailability(resources,bookings,'2026-11-17T10:00','2026-11-17T11:00').rows.find(r=>r.resource.id==='busy').state,'available');
assert.equal(planningAvailability(resources,[...bookings,{leadId:'two',resourceIds:['away'],start,end,cancelled:false}],start,end).rows.find(r=>r.resource.id==='away').reservations.length,1,'Absence and booking reasons both retained');
console.log('Disponibilités : périodes invalides, multijour, annulations, bornes adjacentes, ressources désactivées, motifs multiples et lecture seule vérifiés.');
