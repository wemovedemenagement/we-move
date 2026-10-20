import assert from 'node:assert/strict';
import {closureGuidance,closurePendingReasons,changeClosure,parisMinute} from '../shared/closureGuidance.mjs';
import {normalizeMoveClosure} from '../server/crmMoveClosure.mjs';

const now=new Date('2026-10-20T10:00:00Z');
const value={actualStart:'2020-01-01T08:00',actualEnd:'2020-01-01T17:00',observations:'',reservations:'',letterReceived:true,missingDocuments:'',followUp:'',owner:'',due:'',resolved:false};
assert.deepEqual(closureGuidance(value,now),{pendingReasons:[],needsFollowUp:false,hasFollowUp:false,issues:[]});
assert.equal(parisMinute(new Date('2026-01-01T23:30:00Z')),'2026-01-02T00:30');
assert.equal(parisMinute(new Date('2026-07-01T23:30:00Z')),'2026-07-02T01:30');
const empty=closureGuidance({...value,actualStart:'',actualEnd:'',letterReceived:false},now);
assert.deepEqual(empty.issues.map(issue=>issue.fieldId),['closure-actualStart','closure-actualEnd','closure-followUp']);
assert.deepEqual(empty.pendingReasons,['Lettre de voiture signée non reçue']);
for(const patch of [{actualStart:''},{actualEnd:value.actualStart},{actualEnd:'2099-01-01T17:00'},{letterReceived:false},{reservations:'Un incident'},{missingDocuments:'Un document'},{followUp:'Contacter le client'},{followUp:'Contacter le client',owner:'Bureau',due:'invalide'}]){
  assert.ok(closureGuidance({...value,...patch},now).issues.length>0);
  assert.throws(()=>normalizeMoveClosure({...value,...patch},{email:'test@example.invalid'}),error=>error.status===400);
}
assert.deepEqual(closurePendingReasons({...value,reservations:' ',missingDocuments:'\n'}),[]);
const followUp={...value,letterReceived:false,followUp:' Réunir la lettre ',owner:' Bureau ',due:'2026-10-21T10:00'};
assert.deepEqual(closureGuidance(followUp,now).issues,[]);
assert.equal(normalizeMoveClosure(followUp,{email:'test@example.invalid'}).followUp,'Réunir la lettre');
const orphan=closureGuidance({...value,owner:'Bureau',due:'2026-10-21T10:00'},now);
assert.equal(orphan.issues[0].fieldId,'closure-followUp','Ne pas laisser disparaître silencieusement un responsable sans action');
const done={...followUp,resolved:true};const before=structuredClone(done);
for(const [key,next] of [['followUp','Autre action'],['owner','Équipe'],['due','2026-10-22T10:00'],['reservations','Nouvelle réserve'],['missingDocuments','Autre pièce'],['letterReceived',true]])assert.equal(changeClosure(done,key,next).resolved,false);
assert.equal(changeClosure(done,'followUp',done.followUp).resolved,true);
assert.equal(changeClosure(done,'observations','Observation corrigée').resolved,true);
assert.deepEqual(done,before,'La préparation du formulaire ne modifie pas son état d’entrée');
console.log('Retour intervention : horaires Paris, chronologie, dates futures, motifs de suivi, responsable et échéance, prévention de perte silencieuse et remise en attente ciblée vérifiés.');
