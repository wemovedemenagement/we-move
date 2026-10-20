import assert from 'node:assert/strict';
import {quoteReadiness,quotePeriodIssues} from '../shared/quoteReadiness.mjs';
import {sendIssues} from '../server/crmMail.mjs';
import {parisToday,followUpDateIn} from '../shared/followUp.mjs';
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
const datesBefore=structuredClone(fields);
const dateCase=(changes,validUntil=draft.validUntil)=>({...draft,validUntil,document:{fields:{...fields,...changes}}});
for(const key of ['issueDate','departureStart','departureEnd','arrivalStart','arrivalEnd']){
  for(const invalid of ['2026-02-31','2026-13-01','2026-10-20T09:00','  ',123]){
    const value=dateCase({[key]:invalid});
    const issue=quoteReadiness(value,today).find(issue=>issue.key===key);
    assert.equal(issue.fieldId,'qd-'+key);assert.equal(issue.step,0);
    assert.deepEqual(sendIssues(value),quoteReadiness(value,today).map(issue=>issue.message));
  }
}
for(const prefix of ['departure','arrival']){
 const value=dateCase({[prefix+'Start']:followUpDateIn(2),[prefix+'End']:followUpDateIn(1)});
 const issues=quoteReadiness(value,today);assert.equal(issues.length,1);assert.equal(issues[0].key,prefix+'End');assert.equal(issues[0].fieldId,'qd-'+prefix+'End');
 assert.deepEqual(quoteReadiness(dateCase({[prefix+'End']:today}),today),[],'Same-day periods are allowed');
 assert.deepEqual(quoteReadiness(dateCase({[prefix+'End']:followUpDateIn(2)}),today),[],'Multi-day periods are allowed');
 const missing=quoteReadiness(dateCase({[prefix+'Start']:'',[prefix+'End']:today}),today);assert.equal(missing.length,1);assert.equal(missing[0].key,prefix+'Start');
}
for(const invalid of ['2026-02-31','2026-13-01','2099-01-01T09:00','  ']){
 const issues=quoteReadiness(dateCase({},invalid),today);assert.equal(issues.length,1);assert.equal(issues[0].key,'validUntil');assert.equal(issues[0].fieldId,'quote-validUntil');
}
assert.equal(quoteReadiness(dateCase({issueDate:followUpDateIn(10)},followUpDateIn(5)),today)[0].key,'validUntil');
assert.deepEqual(quoteReadiness(dateCase({issueDate:followUpDateIn(5)},followUpDateIn(5)),today),[],'Validity can equal the issue date');
assert.deepEqual(quoteReadiness(dateCase({departureStart:followUpDateIn(-3),arrivalStart:followUpDateIn(-2)}),today),[],'Recorded past service dates are not newly prohibited');
assert.deepEqual(quoteReadiness(dateCase({departureStart:today,departureEnd:followUpDateIn(3),arrivalStart:followUpDateIn(1),arrivalEnd:followUpDateIn(4)}),today),[],'Loading and delivery ranges may overlap');
assert.deepEqual(quotePeriodIssues(),[]);assert.deepEqual(quotePeriodIssues({departureEnd:'',arrivalEnd:''}),[]);assert.deepEqual(fields,datesBefore);
console.log('Préparation devis : prérequis partagés serveur/formulaire, corrections ciblées, dates, e-mails, taux nuls et chiffrage incomplet vérifiés. Aucun envoi.');
