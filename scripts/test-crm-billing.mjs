import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
const live = process.argv.includes('--firestore-isolated');
if (
  live &&
  (process.env.NODE_ENV !== 'test' ||
    !/^integration_[a-z0-9_]+$/.test(
      process.env.CRM_FIRESTORE_TEST_NAMESPACE || '',
    ))
)
  throw Error('Espace isolé obligatoire');
process.env.NODE_ENV = 'test';
process.env.CRM_STORAGE = live ? 'firestore' : 'sqlite';
process.env.CRM_LOCAL_ACCESS = 'true';
process.env.CRM_DATA_DIR = mkdtempSync(
  path.join(tmpdir(), 'wemove-live-billing-'),
);
process.env.CRM_LEAD_NOTIFICATIONS = 'false';
process.env.CRM_CUSTOMER_RECEIPTS = 'false';
process.env.CRM_BILLING_LIVE_ENABLED = 'false';
const store = await import('../server/crmStore.mjs');
const billing = await import('../server/crmBilling.mjs');
const { billingSummary } = await import('../server/crmBillingModel.mjs');
const { parisToday } = await import('../shared/followUp.mjs');
const today = parisToday(),
  actor = {
    role: 'gerant',
    email: 'test@example.invalid',
    name: 'Contrôle isolé',
  };
const reject = (promise, status) =>
  assert.rejects(promise, (e) => e.status === status);
let config = await billing.billingSettings();
assert.equal(config.state.active, false);
assert.ok(config.issues.length);
const settings = {
  action: 'save',
  revision: config.state.revision,
  company: {
    ...config.state.company,
    name: 'Société de test isolé',
    address: 'Adresse de contrôle, Paris',
    legalForm: 'SAS',
    capital: '15000',
    siret: '89158794100032',
    vat: 'FR87891587941',
    registration: 'Paris 891587941',
    email: 'test@example.invalid',
    insurance: 'Contrat de contrôle isolé',
  },
  terms: {
    ...config.state.terms,
    latePenalty: 'Taux BCE majoré de 10 points',
    defaultDays: 30,
  },
  migration: { lastParcNumber: 'FAC-00200', cutoverDate: today },
};
await reject(
  billing.saveBillingSettings(settings, { role: 'secretaire' }),
  403,
);
await reject(
  billing.saveBillingSettings(
    {
      ...settings,
      company: { ...settings.company, iban: 'FR0000000000000000000000000' },
    },
    actor,
  ),
  400,
);
config = await billing.saveBillingSettings(settings, actor);
await reject(
  billing.saveBillingSettings(
    {
      action: 'activate',
      revision: config.state.revision,
      confirm: true,
      parcClosed: true,
    },
    actor,
  ),
  409,
);
const lead = await store.createQuoteLead({
  fullName: 'Client de contrôle isolé',
  email: 'test@example.invalid',
  departureAddress: 'Paris',
  arrivalAddress: 'Versailles',
});
await store.updateQuoteLead(lead.id, { status: 'confirme' });
let quote = await store.createQuoteDraft(lead.id);
quote.document.fields.clientAddress = 'Adresse de test, Paris';
quote = await store.saveQuoteDraft(quote.id, {
  revision: quote.revision,
  items: [
    {
      description: 'Protection et transport du mobilier',
      quantity: 1,
      unitPriceHT: 1234.57,
    },
  ],
  taxRate: 20,
  depositRate: 30,
  validUntil: '',
  notes: '',
  document: quote.document,
});
const source = await store.createInvoicePreparation(quote.id, actor);
const details = {
  clientType: 'particulier',
  serviceDate: today,
  clientSiren: '',
  clientVat: '',
  orderNumber: '',
  deliveryAddress: 'Versailles',
};
const payload = async (kind = 'facture') => ({
  revision: (await store.getBillingState()).revision,
  invoiceId: source.id,
  sourceRevision: source.revision,
  kind,
  depositRate: 30,
  dueDate: today,
  details,
  confirm: true,
});
const before = await store.getBillingState();
const preview = await billing.prepareBillingDocument(await payload(), actor, {
  preview: true,
});
assert.equal(preview.pdf.subarray(0, 4).toString(), '%PDF');
assert.deepEqual(await store.getBillingState(), before);
await reject(billing.prepareBillingDocument(await payload(), actor), 409);
process.env.CRM_BILLING_LIVE_ENABLED = 'true';
config = await billing.saveBillingSettings(
  {
    action: 'activate',
    revision: config.state.revision,
    confirm: true,
    parcClosed: true,
  },
  actor,
);
assert.equal(config.state.counter, 200);
await reject(
  billing.saveBillingSettings(
    {
      ...settings,
      revision: config.state.revision,
      migration: { ...settings.migration, lastParcNumber: 'FAC-00001' },
    },
    actor,
  ),
  409,
);
await reject(
  billing.prepareBillingDocument(
    {
      ...(await payload()),
      details: { ...details, serviceDate: '2099-01-01' },
    },
    actor,
  ),
  400,
);
await reject(
  billing.prepareBillingDocument(await payload('solde'), actor),
  409,
);
await reject(
  billing.prepareBillingDocument(await payload(), { role: 'commercial' }),
  403,
);
const p = await payload('acompte');
const concurrent = await Promise.allSettled([
  billing.prepareBillingDocument(p, actor),
  billing.prepareBillingDocument(p, actor),
]);
assert.equal(concurrent.filter((r) => r.status === 'fulfilled').length, 1);
assert.equal((await store.getBillingState()).counter, 201);
const deposit = concurrent.find((r) => r.status === 'fulfilled').value.document;
assert.equal(deposit.number, 'FAC-00201');
assert.equal(deposit.amountTTC, 44444);
assert.equal(deposit.dueCents, 44444);
await reject(
  billing.prepareBillingDocument(await payload('acompte'), actor),
  409,
);
const original = await store.getBillingDocument(deposit.id);
const pay = {
  revision: deposit.revision,
  action: 'add',
  kind: 'payment',
  amountCents: deposit.amountTTC,
  date: today,
  method: 'virement',
  reference: 'Virement de contrôle',
};
await reject(
  billing.saveBillingPayment(
    deposit.id,
    { ...pay, amountCents: deposit.amountTTC + 1 },
    actor,
  ),
  400,
);
const payments = await Promise.allSettled([
  billing.saveBillingPayment(deposit.id, pay, actor),
  billing.saveBillingPayment(deposit.id, pay, actor),
]);
assert.equal(payments.filter((r) => r.status === 'fulfilled').length, 1);
assert.equal(
  (await store.getBillingDocument(deposit.id)).pdfBase64,
  original.pdfBase64,
);
const balance = (
  await billing.prepareBillingDocument(await payload('solde'), actor)
).document;
assert.equal(
  balance.amountTTC + deposit.amountTTC,
  Math.round(source.amountTTC * 100),
);
const credit = async (doc, amount, reason = 'Correction de contrôle') =>
  billing.prepareBillingDocument(
    {
      revision: (await store.getBillingState()).revision,
      kind: 'avoir',
      targetId: doc.id,
      documentRevision: (await store.getBillingDocument(doc.id)).revision,
      creditHT: amount,
      reason,
      confirm: true,
    },
    actor,
  );
await reject(credit(deposit, 100), 409);
await reject(credit(balance, balance.amountHT + 1), 400);
const partial = (await credit(balance, 10001)).document;
const remainder = (await credit(balance, balance.amountHT - 10001)).document;
assert.equal(partial.amountTTC + remainder.amountTTC, balance.amountTTC);
assert.equal(
  billingSummary(await store.getBillingDocument(balance.id)).status,
  'credite',
);
const creditDeposit = (await credit(deposit, deposit.amountHT)).document;
let d = await store.getBillingDocument(deposit.id);
assert.equal(billingSummary(d).refundDueCents, deposit.amountTTC);
const refund = await billing.saveBillingPayment(
  d.id,
  {
    revision: d.revision,
    action: 'add',
    kind: 'refund',
    amountCents: deposit.amountTTC,
    date: today,
    method: 'virement',
    reference: 'Remboursement de contrôle',
  },
  actor,
);
assert.equal(refund.refundDueCents, 0);
await reject(
  billing.saveBillingPayment(
    d.id,
    {
      revision: refund.revision,
      action: 'reverse',
      paymentId: d.payments[0].id,
      reason: 'Erreur',
    },
    actor,
  ),
  409,
);
const invoice = (await billing.prepareBillingDocument(await payload(), actor))
  .document;
assert.equal(invoice.amountTTC, Math.round(source.amountTTC * 100));
let sent = 0;
const deps = {
  configuration: async () => ({
    ready: true,
    provider: 'resend',
    from: 'sender@example.invalid',
  }),
  transport: async (message) => {
    sent++;
    assert.equal(message.to.address, 'test@example.invalid');
    assert.equal(
      message.attachments[0].content.toString('base64'),
      (await store.getBillingDocument(invoice.id)).pdfBase64,
    );
    return { accepted: ['test@example.invalid'], messageId: 'mock-provider' };
  },
};
const send = {
  revision: invoice.revision,
  confirm: true,
  subject: 'Facture de contrôle',
  message: 'Message isolé',
};
const mailResults = await Promise.allSettled([
  billing.sendBillingMail(invoice.id, send, actor, deps),
  billing.sendBillingMail(invoice.id, send, actor, deps),
]);
assert.equal(mailResults.filter((r) => r.status === 'fulfilled').length, 1);
assert.equal(sent, 1);
let current = await store.getBillingDocument(invoice.id);
await reject(
  billing.sendBillingMail(
    invoice.id,
    { ...send, revision: current.revision },
    actor,
    deps,
  ),
  409,
);
const uncertain = await billing.sendBillingMail(
  invoice.id,
  { ...send, revision: current.revision, confirmResend: true },
  actor,
  {
    ...deps,
    transport: async () => {
      throw Error('timeout');
    },
  },
);
assert.equal(uncertain.mails.at(-1).state, 'uncertain');
await reject(billing.resolveBillingMail(invoice.id,uncertain.mails.at(-1).id,{revision:uncertain.revision,confirm:true,outcome:'failed',evidence:'Contrôle isolé'},{role:'secretaire'}),403);
await reject(
  billing.sendBillingMail(
    invoice.id,
    { ...send, revision: uncertain.revision, confirmResend: true },
    actor,
    deps,
  ),
  409,
);
assert.equal(sent, 1);
mkdirSync('tmp/pdfs', { recursive: true });
const {generateBillingPdf}=await import('../server/crmBillingPdf.mjs');
const business=structuredClone(await store.getBillingDocument(invoice.id));business.details={...business.details,clientType:'entreprise',clientSiren:'891587941',clientVat:'FR87891587941',orderNumber:'BC-CONTROLE'};business.company.iban='FR1420041010050500013M02606';business.company.bic='PSSTFRPPPAR';writeFileSync('tmp/pdfs/billing-business.pdf',await generateBillingPdf(business));
const long=structuredClone(business);long.snapshot.items=Array.from({length:30},(_,i)=>({description:'Prestation détaillée '+(i+1)+' : protection des meubles, emballage et livraison. '.repeat(4),quantity:1,unitPriceHT:10}));long.snapshot.notes='Note de préparation détaillée. '.repeat(60);long.amountHT=30000;long.taxAmount=6000;long.amountTTC=36000;long.totalProjectTTC=36000;writeFileSync('tmp/pdfs/billing-long.pdf',await generateBillingPdf(long));
const resolved=await billing.resolveBillingMail(invoice.id,uncertain.mails.at(-1).id,{revision:uncertain.revision,confirm:true,outcome:'failed',evidence:'Contrôle isolé : aucune acceptation chez le prestataire'},actor);assert.equal(resolved.mails.at(-1).state,'failed');assert.equal(resolved.mails.at(-1).previousState,'uncertain');
writeFileSync('tmp/pdfs/billing-preview.pdf', preview.pdf);
for (const [name, doc] of [
  ['invoice', invoice],
  ['deposit', deposit],
  ['balance', balance],
  ['credit', creditDeposit],
])
  writeFileSync(
    'tmp/pdfs/billing-' + name + '.pdf',
    Buffer.from((await store.getBillingDocument(doc.id)).pdfBase64, 'base64'),
  );
const { createApp } = await import('../server.mjs');
const server = createApp().listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
try {
  const base = 'http://127.0.0.1:' + server.address().port;
  process.env.CRM_LOCAL_ACCESS = 'false';
  for (const [url, method] of [
    ['settings', 'PUT'],
    ['preview', 'POST'],
    ['overview', 'GET'],
    ['search', 'GET'],
    ['export?kind=documents&from='+today+'&to='+today, 'GET'],
    ['dossier/'+lead.id, 'GET'],
    ['documents', 'GET'],
    ['documents/' + invoice.id + '/pdf', 'GET'],
    ['documents/' + invoice.id + '/mail', 'POST'],
  ])
    assert.equal(
      (
        await fetch(base + '/api/crm/billing/' + url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          ...(method === 'GET' ? {} : { body: '{}' }),
        })
      ).status,
      401,
    );
  process.env.CRM_LOCAL_ACCESS = 'true';
  const list = await (await fetch(base + '/api/crm/billing/documents')).json();
  assert.equal(list.documents.length, 6);
  assert.ok(list.documents.every((d) => !d.pdfBase64 && !d.snapshot));
  const overview=(await (await fetch(base+'/api/crm/billing/overview')).json()).overview;
  assert.equal(overview.documentCount,6);assert.equal(overview.dueCents,invoice.amountTTC);assert.equal(overview.refundDueCents,0);assert.equal(overview.netReceivedCents,0);assert.equal(overview.receivedCents,deposit.amountTTC);assert.equal(overview.refundedCents,deposit.amountTTC);
  const projected=await store.getBillingOverviewRecords();assert.ok(projected.every(d=>!d.pdfBase64&&!d.company&&!d.terms&&!d.snapshot.clientEmail));
  const dossier=(await (await fetch(base+'/api/crm/dossiers/'+lead.id)).json()).dossier;assert.equal(dossier.billing.length,6);assert.ok(dossier.billing.every(d=>!d.payments&&!d.pdfBase64&&!d.snapshot));
  const scoped=await(await fetch(base+'/api/crm/billing/documents?invoiceId='+source.id)).json();assert.equal(scoped.documents.length,6);assert.equal(scoped.cursor,null);
  const {billingExport}=await import('../server/crmBillingExport.mjs');
  const exportResponse=await fetch(base+'/api/crm/billing/export?kind=documents&from='+today+'&to='+today);
  assert.equal(exportResponse.status,200);
  assert.equal(exportResponse.headers.get('cache-control'),'private, no-store');
  assert.equal(exportResponse.headers.get('x-export-count'),'6');
  assert.equal(await exportResponse.text(),billingExport(projected,{kind:'documents',from:today,to:today}).csv.replace(/^\uFEFF/,''));
  assert.ok(projected.every(d=>Number.isInteger(d.amountHT)&&Number.isInteger(d.taxAmount)));
  assert.equal((await fetch(base+'/api/crm/billing/export?kind=documents&from=bad&to='+today)).status,400);
  const searched=await(await fetch(base+'/api/crm/billing/search?search='+encodeURIComponent(invoice.number))).json();
  assert.equal(searched.documents[0].id,invoice.id);assert.equal(searched.total,1);
  assert.equal(searched.documents[0].quoteReference,invoice.quoteReference);
  assert.ok(searched.documents.every(d=>!d.payments&&!d.pdfBase64&&!d.snapshot));
  const scopedSearch=await(await fetch(base+'/api/crm/billing/search?invoiceId='+source.id)).json();assert.equal(scopedSearch.total,6);
  const pdf = await fetch(
    base + '/api/crm/billing/documents/' + invoice.id + '/pdf',
  );
  assert.equal(pdf.headers.get('cache-control'), 'private, no-store');
  assert.deepEqual(
    Buffer.from(await pdf.arrayBuffer()),
    Buffer.from(
      (await store.getBillingDocument(invoice.id)).pdfBase64,
      'base64',
    ),
  );
} finally {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
}
// Facture échue dans cet espace de test uniquement ; aucun transport réel.
const overdue = structuredClone(await store.getBillingDocument(invoice.id));
overdue.issueDate = '2020-01-01';
overdue.dueDate = '2020-01-02';
overdue.revision++;
await store.commitBilling({revision:(await store.getBillingState()).revision,documents:[overdue],event:{action:'isolated_test_overdue',at:new Date().toISOString()}});
const { billingReminder } = await import('../server/crmBillingReminder.mjs');
const reminderDraft = billingReminder(overdue);
await reject(billing.sendBillingMail(invoice.id,{...send,purpose:'reminder',revision:overdue.revision-1,confirmResend:true},actor,deps),409);
const beforeReminder = sent;
const reminderResult = await billing.sendBillingMail(invoice.id,{...send,...reminderDraft,revision:overdue.revision,confirmResend:true},actor,deps);
assert.equal(sent,beforeReminder+1);
assert.equal(reminderResult.mails.at(-1).purpose,'reminder');
assert.equal(reminderResult.mails.at(-1).dueCentsAtSend,invoice.amountTTC);
await reject(billing.sendBillingMail(invoice.id,{...send,...reminderDraft,revision:reminderResult.revision,confirmResend:true},actor,deps),409);
assert.equal(sent,beforeReminder+1);
console.log(
  'Facturation : activation verrouillée, reprise PARC, concurrence, PDF immuable, acomptes/solde, avoirs partiels, remboursements, double envoi, résultat incertain et accès privés validés. Aucun envoi réel.',
);
