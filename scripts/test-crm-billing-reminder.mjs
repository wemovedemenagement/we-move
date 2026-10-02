import assert from 'node:assert/strict';
import { billingReminder } from '../server/crmBillingReminder.mjs';
const now = new Date('2026-10-10T10:00:00Z');
const doc = {mode:'live',kind:'facture',number:'F-201',amountTTC:12000,creditedTTC:2000,dueDate:'2026-10-01',snapshot:{clientName:'Client de contrôle'},payments:[{kind:'payment',amountCents:3000,date:'2026-10-02'}],mails:[]};
const reminder = billingReminder(doc,now);
assert.equal(reminder.dueCents,7000);
assert.ok(reminder.message.includes('70,00'));
assert.ok(reminder.message.includes('01/10/2026'));
assert.equal(reminder.purpose,'reminder');
for (const patch of [{mode:'test'},{kind:'avoir'},{dueDate:'2026-10-10'},{dueDate:'2026-10-11'},{creditedTTC:12000},{payments:[{kind:'payment',amountCents:10000}]}]) {
 assert.throws(()=>billingReminder({...doc,...patch},now),e=>e.status===409);
}
const mail = {purpose:'reminder',state:'accepted',createdAt:'2026-10-09T10:00:01Z'};
assert.throws(()=>billingReminder({...doc,mails:[mail]},now),e=>e.status===409);
assert.equal(billingReminder({...doc,mails:[{...mail,createdAt:'2026-10-09T10:00:00Z'}]},now).dueCents,7000);
assert.equal(billingReminder({...doc,mails:[{...mail,state:'failed'}]},now).dueCents,7000);
assert.equal(billingReminder({...doc,payments:[...doc.payments,{kind:'payment',amountCents:7000,reversedAt:'2026-10-03'}]},now).dueCents,7000);
console.log('Relances : solde net, échéances, avoirs, règlements annulés et délai de 24 heures validés.');
