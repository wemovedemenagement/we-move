import assert from 'node:assert/strict';
import {requestQualification} from '../shared/requestQualification.mjs';

const today='2026-10-20';
const lead={fullName:'Client de recette',phone:'+33 (0)1 23 45 67 89',email:'',departureAddress:'Paris',arrivalAddress:'Versailles',volume:20,unknownVolume:false,moveDate:today,flexibleDate:false};
const before=structuredClone(lead);
let result=requestQualification(lead,today);
assert.equal(result.pending,1);assert.deepEqual(result.rows.filter(r=>!r.recorded).map(r=>r.id),['access']);
assert.deepEqual(lead,before,'Qualification is read-only');
const row=(updates,id)=>requestQualification({...lead,...updates},today).rows.find(r=>r.id===id);
assert.equal(row({unknownVolume:true},'volume').recorded,false,'An old numeric volume must not override unknownVolume');
for(const volume of [0,-1,NaN,Infinity,'20',null])assert.equal(row({volume},'volume').recorded,false);
assert.equal(row({phone:'',email:'client@example.invalid'},'contact').recorded,true);
for(const email of ['client@example','a@example.invalid,b@example.invalid','\r\nclient@example.invalid'])assert.equal(row({phone:'inconnu',email},'contact').recorded,email.trim()==='client@example.invalid');
assert.equal(row({fullName:'   '},'contact').recorded,false);
for(const departureAddress of ['','  ','À préciser','À confirmer'])assert.equal(row({departureAddress},'addresses').recorded,false);
assert.match(row({arrivalAddress:''},'addresses').detail,/arrivée/);
assert.equal(row({moveDate:'2026-02-31'},'date').recorded,false);
assert.equal(row({moveDate:'2026-10-19'},'date').recorded,false);assert.match(row({moveDate:'2026-10-19'},'date').detail,/reconfirmer/);
assert.equal(row({moveDate:'2026-10-21',flexibleDate:true},'date').recorded,true);assert.match(row({moveDate:'2026-10-21',flexibleDate:true},'date').detail,/Flexibilité/);
assert.match(row({},'date').detail,/sans réservation/);
const access={floor:'0',elevator:'Non',carry:'0',notes:''};
const visit={items:[],departure:{...access},arrival:{...access}};
result=requestQualification({...lead,technicalVisit:visit},today);assert.equal(result.pending,0);
assert.equal(row({departureFloor:'0',arrivalFloor:'0',departureElevator:false,arrivalElevator:false},'access').recorded,false,'Default false must not prove an absence of elevator');
for(const updates of [{carry:''},{carry:'-1'},{carry:'5001'},{elevator:''},{elevator:'inconnu'},{floor:'À confirmer'}]){
 const value={...visit,arrival:{...access,...updates}};
 const missing=row({technicalVisit:value},'access');assert.equal(missing.recorded,false);assert.match(missing.detail,/arrivée/);assert.equal(missing.target,'visit');
}
assert.deepEqual(Object.keys(lead),Object.keys(before));assert.deepEqual(visit,{items:[],departure:access,arrival:access});
console.log('Repères demande : contact utilisable, adresses à préciser, volume explicitement inconnu, dates réelles, accès zéro et absence de mutation vérifiés.');
