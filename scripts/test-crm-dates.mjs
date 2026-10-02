import assert from 'node:assert/strict';
import {makeQuote} from '../server/crmModel.mjs';
for(const moveDate of ['2026-02-30','2026-02-29','2026-04-31','2026-13-01']) assert.throws(()=>makeQuote({fullName:'Test isolé',email:'test@example.invalid',moveDate}),/Date invalide/);
for(const moveDate of ['2028-02-29','2026-12-31','']) assert.equal(makeQuote({fullName:'Test isolé',email:'test@example.invalid',moveDate}).moveDate,moveDate);
console.log('Dates calendaires validées sans stockage ni envoi.');
