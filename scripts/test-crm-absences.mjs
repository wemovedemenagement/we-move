import assert from 'node:assert/strict';
import {mkdtempSync} from 'node:fs';import {tmpdir} from 'node:os';import path from 'node:path';
import {normalizeAbsences,resourceAbsence} from '../shared/resourceAvailability.mjs';
process.env.CRM_STORAGE='sqlite';process.env.CRM_DATA_DIR=mkdtempSync(path.join(tmpdir(),'wemove-absence-'));process.env.CRM_LEAD_NOTIFICATIONS='false';process.env.CRM_CUSTOMER_RECEIPTS='false';
const store=await import('../server/crmStore.mjs');const actor={role:'gerant',name:'Contrôle isolé',email:'test@example.invalid'};
const period={start:'2026-11-16T08:00',end:'2026-11-18T18:00',reason:'maintenance'};
for(const invalid of [null,{},[{...period,end:period.start}],[{...period,start:'2026-02-30T08:00'}],[{...period,reason:'maladie'}],[period,period],[{...period,extra:true}]])assert.throws(()=>normalizeAbsences(invalid),{status:400});
assert.equal(resourceAbsence({unavailablePeriods:[period]},period.end,'2026-11-19T18:00'),undefined);
let registry=await store.saveResource({revision:0,name:'Camion contrôlé',detail:'',kind:'vehicle',active:true,unavailablePeriods:[period]},actor);
const id=registry.resources[0].id;
let lead=await store.createQuoteLead({fullName:'Mission isolée',email:'test@example.invalid'});lead=await store.updateQuoteLead(lead.id,{status:'confirme'});
await assert.rejects(()=>store.saveBooking(lead.id,{revision:0,start:'2026-11-15T08:00',end:'2026-11-19T18:00',resourceIds:[id]},actor),{status:409});
await store.saveBooking(lead.id,{revision:0,start:period.end,end:'2026-11-19T18:00',resourceIds:[id]},actor);
registry=(await store.getPlanning()).registry;
const payload={revision:registry.revision,id,name:'Camion contrôlé',detail:'Contrôle',kind:'vehicle',active:true};
await assert.rejects(()=>store.saveResource({...payload,unavailablePeriods:[{...period,end:'2026-11-20T18:00'}]},actor),{status:409});
await assert.rejects(()=>store.saveResource(payload,{...actor,role:'commercial'}),{status:403});
await assert.rejects(()=>store.saveResource({...payload,revision:0},actor),{status:409});
registry=await store.saveResource(payload,actor);assert.deepEqual(registry.resources[0].unavailablePeriods,[period],'Legacy resource updates preserve periods');
registry=await store.saveResource({...payload,revision:registry.revision,unavailablePeriods:[]},actor);assert.deepEqual(registry.resources[0].unavailablePeriods,[]);
await store.saveBooking(lead.id,{revision:1,start:period.start,end:period.end,resourceIds:[id]},actor);
const latest=await store.getPlanning();assert.equal(latest.bookings[0].start,period.start);assert.equal(latest.bookings[0].end,period.end);
let second=await store.createQuoteLead({fullName:'Concurrence isolée',email:'test@example.invalid'});second=await store.updateQuoteLead(second.id,{status:'confirme'});
const future={start:'2026-12-01T08:00',end:'2026-12-03T18:00',reason:'maintenance'};
const competing=await Promise.allSettled([
 store.saveResource({...payload,revision:latest.registry.revision,unavailablePeriods:[future]},actor),
 store.saveBooking(second.id,{revision:0,start:future.start,end:future.end,resourceIds:[id]},actor),
]);
assert.equal(competing.filter(r=>r.status==='fulfilled').length,1);
assert.equal(competing.find(r=>r.status==='rejected').reason.status,409);
console.log('Indisponibilités : validation, persistance, rôles, concurrence de révision, chevauchements dans les deux sens, bornes adjacentes et mission multijour validés.');
