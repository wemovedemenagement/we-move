import assert from 'node:assert/strict';
import {aftercareQueue,aftercareDetails} from '../shared/aftercareQueue.mjs';
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
const enriched=[
 {leadId:'reserve',clientName:'Ancien nom',closure:{followUp:'Contacter le client',owner:' Bureau ',due:today+'T10:00',reservations:'Rayure sur le piano',letterReceived:true,missingDocuments:''}},
 {leadId:'docs',clientName:'Documents',closure:{followUp:'Réunir les pièces',owner:'Bureau',due:'2026-10-17T10:00',reservations:'',letterReceived:false,missingDocuments:'Photos du buffet'}},
 {leadId:'both',clientName:'Les deux',closure:{followUp:'Étudier le retour',owner:'Élodie',due:today+'T11:00',reservations:'Éclat sur une table',letterReceived:false}},
 {leadId:'unknown',clientName:'Historique incomplet',closure:{followUp:'Rappeler',owner:'',due:undefined}},
 {leadId:'invalid',clientName:'Date invalide',closure:{followUp:'Préciser les dates',owner:'Bureau',due:'2026-02-30T10:00'}},
 {leadId:'owner',clientName:'Responsable à attribuer',closure:{followUp:'Appeler',owner:' ',due:'2026-10-17T12:00',letterReceived:true}},
 {leadId:'blank',clientName:'Sans action',closure:{followUp:' \n ',owner:'Bureau',due:today+'T10:00'}},
 {leadId:'done',clientName:'Incident traité',closure:{followUp:'Réserve traitée',owner:'Élodie',due:today+'T10:00',reservations:'Observation historique',resolved:true}},
];
const enrichedLeads=[{id:'reserve',fullName:'Nouveau nom',departureAddress:'Paris'}];
const snapshot=structuredClone({enriched,enrichedLeads});
const selection=opts=>aftercareQueue(enriched,enrichedLeads,today,opts);
assert.deepEqual(selection({kind:'reservations'}).map(r=>r.booking.leadId),['reserve','both']);
assert.deepEqual(selection({kind:'documents'}).map(r=>r.booking.leadId),['both','docs']);
assert.deepEqual(selection({kind:'other'}).map(r=>r.booking.leadId),['invalid','unknown','owner']);
assert.deepEqual(selection({timing:'incomplete'}).map(r=>r.booking.leadId),['invalid','unknown','owner']);
assert.deepEqual(selection({owner:'__missing__'}).map(r=>r.booking.leadId),['unknown','owner']);
assert.equal(selection({owner:'Bureau',kind:'reservations',query:'RAYURE piano nouveau Paris'}).length,1);
assert.equal(selection({kind:'documents',query:'PHOTOS buffet'}).length,1);
assert.equal(selection({query:'2026-02-30'}).length,0,'Une date n’est pas inventée dans le texte de l’action');
assert.equal(selection({query:'reserve'}).some(r=>r.booking.leadId==='reserve'),true,'Référence du dossier recherchable');
assert.equal(selection({timing:'undated'}).length,2);
assert.equal(selection({timing:'overdue'}).length,0,'Une échéance absente ou invalide ne devient pas un retard');
assert.equal(selection({state:'resolved',kind:'reservations'})[0].booking.leadId,'done');
assert.equal(selection({state:'resolved',timing:'incomplete'}).length,0);
assert.equal(aftercareDetails({}).letterMissing,false,'Une réception inconnue ne doit pas être présentée comme manquante');
assert.deepEqual(aftercareDetails({}).kinds,['other']);
assert.deepEqual(aftercareDetails({reservations:' \n ',missingDocuments:' ',letterReceived:true}).kinds,['other']);
assert.deepEqual({enriched,enrichedLeads},snapshot);
for(const options of [{state:'inconnu'},{kind:'inconnu'},{timing:'inconnu'}])assert.deepEqual(selection(options),[]);
assert.deepEqual(aftercareQueue(enriched,enrichedLeads,'date invalide'),[]);
console.log('Vue après mission : échéances, responsables, recherche sans accents, états traités, annulations et dossiers absents vérifiés.');
