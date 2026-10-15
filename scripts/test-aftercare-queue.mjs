import assert from 'node:assert/strict';
import {aftercareQueue} from '../shared/aftercareQueue.mjs';
const today='2026-10-15';
const bookings=[
 {leadId:'a',clientName:'Émilie Durand',closure:{followUp:'Lettre signée',owner:'Élodie',due:'2026-10-14T10:00'}},
 {leadId:'b',clientName:'B',closure:{followUp:'Appeler',owner:'Marc',due:today+'T14:00'}},
 {leadId:'c',clientName:'C',closure:{followUp:'Vérifier',owner:'Marc',due:'2026-10-17T09:00'}},
 {leadId:'d',clientName:'D',closure:{followUp:'Réserve traitée',owner:'Élodie',due:'2026-10-01T10:00',resolved:true}},
 {leadId:'e',clientName:'E',cancelled:true,closure:{followUp:'Ancien',due:'2026-10-01T10:00'}},
 {leadId:'f',clientName:'F'},
 {leadId:'g',clientName:'G',closure:{followUp:'Refusé',owner:'Marc',due:today+'T10:00'}},
];
const leads=[{id:'a',departureAddress:'Paris'},{id:'g',status:'refuse'}];
const ids=opts=>aftercareQueue(bookings,leads,today,opts).map(r=>r.booking.leadId);
assert.deepEqual(ids(),['a','b','c']);assert.deepEqual(ids({state:'all'}),['a','b','c','d']);assert.deepEqual(ids({state:'resolved'}),['d']);
assert.deepEqual(ids({timing:'today'}),['b']);assert.deepEqual(ids({timing:'overdue'}),['a']);assert.deepEqual(ids({timing:'upcoming'}),['c']);
assert.deepEqual(ids({owner:'Marc'}),['b','c']);assert.deepEqual(ids({query:'EMILIE signee Paris'}),['a']);assert.deepEqual(ids({owner:'Marc',query:'Paris'}),[]);
assert.equal(aftercareQueue(bookings,leads,today).find(r=>r.booking.leadId==='b').lead,undefined);
assert.deepEqual(ids({state:'resolved',timing:'overdue'}),[]);assert.equal(bookings[0].leadId,'a');
console.log('Vue après mission : échéances, responsables, recherche sans accents, états traités, annulations et dossiers absents vérifiés.');
