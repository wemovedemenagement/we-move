import assert from 'node:assert/strict';
import {quoteReadiness} from '../shared/quoteReadiness.mjs';
import {sendIssues} from '../server/crmMail.mjs';
import {parisToday} from '../shared/followUp.mjs';
const today=parisToday();
const fields={clientEmail:'test@example.invalid',clientName:'Test',clientAddress:'Paris',departureAddress:'Paris',arrivalAddress:'Lyon',formula:'MOVE Confort',issueDate:today,departureStart:today,arrivalStart:today,guarantee:'Responsabilité contractuelle',coveredValue:'10000',itemLimit:'1000',paymentKind:'Arrhes',balanceWhen:'À la livraison'};
const draft={document:{fields},items:[{description:'Déménagement',quantity:1,unitPriceHT:100}],amountTTC:120,taxRate:20,depositRate:30,validUntil:today};
assert.deepEqual(quoteReadiness(draft,today),[]);assert.deepEqual(sendIssues(draft),[]);
assert.deepEqual(quoteReadiness({...draft,taxRate:0,depositRate:0},today),[],'Zero rates are explicit values');
for(const [key,step,id] of [['clientEmail',0,'qd-clientEmail'],['clientAddress',0,'qd-clientAddress'],['formula',1,'qd-formula'],['guarantee',2,'qd-guarantee'],['paymentKind',1,'qd-paymentKind'],['balanceWhen',2,'qd-balanceWhen']]) {
  const partial={...draft,document:{fields:{...fields,[key]:''}}};
  const [issue]=quoteReadiness(partial,today);assert.equal(issue.key,key);assert.equal(issue.step,step);assert.equal(issue.fieldId,id);
  assert.deepEqual(sendIssues(partial),quoteReadiness(partial,today).map(i=>i.message));
}
assert.equal(quoteReadiness({...draft,validUntil:'2000-01-01'},today)[0].key,'validUntil');
assert.equal(quoteReadiness({...draft,items:[]},today)[0].fieldId,'quote-pricing');
assert.equal(quoteReadiness({...draft,taxRate:null,amountTTC:null},today)[0].fieldId,'quote-taxRate');
assert.equal(quoteReadiness({...draft,depositRate:null},today)[0].fieldId,'quote-depositRate');
assert.equal(quoteReadiness({...draft,amountTTC:0},today)[0].key,'pricing');
assert.equal(quoteReadiness({...draft,document:{fields:{...fields,clientEmail:'a@example.invalid,b@example.invalid'}}},today)[0].key,'clientEmail');
assert.ok(quoteReadiness({items:[],taxRate:null,depositRate:null,amountTTC:null,validUntil:''},today).length>10);
assert.equal(fields.clientAddress,'Paris');
console.log('Préparation devis : prérequis partagés serveur/formulaire, corrections ciblées, dates, e-mails, taux nuls et chiffrage incomplet vérifiés. Aucun envoi.');
