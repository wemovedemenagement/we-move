import assert from 'node:assert/strict';
import {missionTimeline,parisMinute} from '../shared/missionTimeline.mjs';
const now=new Date('2026-10-17T10:00:00Z');
assert.equal(parisMinute(now),'2026-10-17T12:00');
assert.equal(parisMinute('2026-12-17T23:00:00Z'),'2026-12-18T00:00');
assert.equal(parisMinute('2026-10-25T00:30:00Z'),'2026-10-25T02:30');
assert.equal(parisMinute('2026-10-25T01:30:00Z'),'2026-10-25T02:30');
assert.equal(parisMinute('invalid'),'');
const base={clientName:'Élodie',resources:[{name:'Camion bleu'}],resourceIds:['v'],cancelled:false};
const bookings=[
  {...base,leadId:'old',start:'2026-10-16T08:00',end:'2026-10-16T18:00'},
  {...base,leadId:'end',start:'2026-10-17T08:00',end:'2026-10-17T12:00'},
  {...base,leadId:'start',start:'2026-10-17T12:00',end:'2026-10-17T15:00'},
  {...base,leadId:'multi',start:'2026-10-16T08:00',end:'2026-10-18T18:00'},
  {...base,leadId:'next',start:'2026-10-17T13:00',end:'2026-10-17T14:00'},
  {...base,leadId:'tomorrow',start:'2026-10-18T08:00',end:'2026-10-18T18:00'},
];
const leads=bookings.map(b=>({id:b.leadId,status:'confirme',departureAddress:'Paris',arrivalAddress:'Lyon'}));
const before=structuredClone({leads,bookings});
assert.deepEqual(missionTimeline(bookings,leads,now).map(r=>[r.booking.leadId,r.bucket]),[['old','review'],['end','review'],['start','ongoing'],['multi','ongoing'],['next','upcoming']]);
assert.equal(missionTimeline(bookings,leads,now,{state:'review'}).length,2);
assert.equal(missionTimeline(bookings,leads,now,{query:'elodie bleu lyon'}).length,5);
assert.equal(missionTimeline(bookings,leads,now,{query:'inexistant'}).length,0);
assert.deepEqual(missionTimeline(bookings,leads,'invalid'),[]);
for(const b of [{...bookings[0],cancelled:true},{...bookings[0],closure:{}},{...bookings[0],end:bookings[0].start},{...bookings[0],start:'2026-02-30T08:00'}])assert.deepEqual(missionTimeline([b],leads,now),[]);
for(const status of ['refuse','nouveau'])assert.deepEqual(missionTimeline([bookings[0]],[{...leads[0],status}],now),[]);
assert.equal(missionTimeline([bookings[0]],[{...leads[0],status:'termine'}],now).length,1,'An old completed dossier may still lack its report');
assert.equal(missionTimeline([bookings[4]],[{...leads[4],status:'termine'}],now).length,0);
assert.equal(missionTimeline([bookings[0]],[],now)[0].lead,undefined,'Keep unavailable dossiers visible without an action');
assert.deepEqual({leads,bookings},before,'Time passing never closes a mission or mutates a dossier');
console.log('Missions à suivre : heure de Paris, minuit, changement d’heure, bornes exactes, multijour, anciens comptes rendus, exclusions, recherche et absence de mutation vérifiés.');
