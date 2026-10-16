import assert from 'node:assert/strict';
import {movePreparation} from '../shared/movePreparation.mjs';
const lead={status:'confirme',departureAddress:'Paris',arrivalAddress:'Versailles',phone:'0100000000',volume:20,acceptedQuoteRevision:1,documentChecklist:{signedQuote:{received:true,quoteRevision:1},valueDeclaration:{received:true,quoteRevision:1}}};
const registry={resources:[{id:'v',kind:'vehicle',active:true},{id:'p',kind:'person',active:true}]};
const booking={resourceIds:['v','p'],cancelled:false,operations:{departureParking:'confirme',arrivalParking:'sans_objet',accessVerified:true,equipmentReady:true}};
assert.deepEqual(movePreparation(lead,booking,registry),[]);
assert.deepEqual(movePreparation({...lead,volume:0},booking,registry),['Volume à préciser']);
assert.ok(movePreparation({...lead,phone:'',email:''},booking,registry).includes('Contact client à compléter'));
assert.ok(movePreparation(lead,{...booking,resourceIds:['v']},registry).includes('Intervenant à affecter'));
assert.ok(movePreparation(lead,booking,{resources:[registry.resources[0],{...registry.resources[1],active:false}]}).includes('Ressource supprimée ou désactivée'));
assert.deepEqual(movePreparation(null,booking,registry),['Dossier client indisponible']);
for(const status of ['termine','refuse'])assert.deepEqual(movePreparation({...lead,status},booking,registry),[]);
assert.deepEqual(movePreparation(null,{...booking,cancelled:true},registry),[]);
assert.equal(movePreparation(lead,{...booking,operations:undefined},registry).length,4);
assert.ok(movePreparation({...lead,unknownVolume:true},booking,registry).includes('Volume à préciser'));
console.log('Préparation : coordonnées, volume, affectations actives, dossiers absents et missions clôturées validés.');

assert.equal(movePreparation({...lead,documentChecklist:undefined},booking,registry).length,2);
assert.equal(movePreparation({...lead,acceptedQuoteRevision:2},booking,registry).filter(s=>s.includes('à revérifier')).length,2);
