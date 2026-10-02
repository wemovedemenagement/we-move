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
  throw Error('Espace de test isolé obligatoire.');
process.env.CRM_STORAGE = live ? 'firestore' : 'sqlite';
process.env.CRM_LOCAL_ACCESS = 'true';
process.env.CRM_DATA_DIR = mkdtempSync(path.join(tmpdir(), 'wemove-billing-'));
process.env.CRM_LEAD_NOTIFICATIONS = 'false';
process.env.CRM_CUSTOMER_RECEIPTS = 'false';
const store = await import('../server/crmStore.mjs');
const { generateTestBillingPdf } = await import(
  '../server/crmTestBillingPdf.mjs'
);
const { testPaymentSummary } = await import(
  '../server/crmTestBillingModel.mjs'
);
const { PDFDocument } = await import('pdf-lib');
const actor = {
  role: 'gerant',
  name: 'Test isolé',
  email: 'test@example.invalid',
};
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
      description: 'Transport et protection du mobilier',
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
const invoice = await store.createInvoicePreparation(quote.id, actor);
const issue = (state, kind, depositRate) =>
  store.createTestBillingDocument(
    {
      revision: state.revision,
      invoiceId: invoice.id,
      kind,
      ...(kind === 'acompte' ? { depositRate } : {}),
    },
    actor,
  );
let state = await store.getInvoiceTestState();
await assert.rejects(
  () => issue(state, 'solde'),
  (e) => e.status === 409,
);
await assert.rejects(
  () => issue(state, 'acompte', 100),
  (e) => e.status === 400,
);
await assert.rejects(
  () =>
    store.createTestBillingDocument(
      { revision: state.revision, invoiceId: invoice.id, kind: 'facture' },
      { ...actor, role: 'secretaire' },
    ),
  (e) => e.status === 403,
);
const concurrent = await Promise.allSettled([
  issue(state, 'acompte', 30),
  issue(state, 'acompte', 30),
]);
assert.equal(concurrent.filter((r) => r.status === 'fulfilled').length, 1);
const deposit = concurrent.find((r) => r.status === 'fulfilled').value;
state = deposit.state;
assert.equal(deposit.document.amountHT, 37037);
assert.equal(deposit.document.taxAmount, 7407);
assert.equal(deposit.document.amountTTC, 44444);
await assert.rejects(
  () => issue(state, 'facture'),
  (e) => e.status === 409,
);
await assert.rejects(
  () => issue(state, 'acompte', 30),
  (e) => e.status === 409,
);
const balance = await issue(state, 'solde');
state = balance.state;
assert.equal(
  balance.document.amountTTC + deposit.document.amountTTC,
  Math.round(invoice.amountTTC * 100),
);
assert.equal(
  balance.document.taxAmount + deposit.document.taxAmount,
  Math.round(invoice.taxAmount * 100),
);
assert.equal(testPaymentSummary(deposit.document).paidCents, 0);
const payment = {
  revision: 1,
  action: 'add',
  amountCents: 10000,
  date: '2026-10-01',
  method: 'virement',
  reference: 'ESSAI',
};
await assert.rejects(
  () =>
    store.saveTestBillingPayment(
      deposit.document.id,
      { ...payment, amountCents: 44445 },
      actor,
    ),
  (e) => e.status === 400,
);
await assert.rejects(
  () =>
    store.saveTestBillingPayment(
      deposit.document.id,
      { ...payment, date: '2026-02-30' },
      actor,
    ),
  (e) => e.status === 400,
);
const attempts = await Promise.allSettled([
  store.saveTestBillingPayment(deposit.document.id, payment, actor),
  store.saveTestBillingPayment(deposit.document.id, payment, actor),
]);
assert.equal(attempts.filter((r) => r.status === 'fulfilled').length, 1);
const paid = attempts.find((r) => r.status === 'fulfilled').value;
assert.equal(testPaymentSummary(paid).dueCents, 34444);
const before = await generateTestBillingPdf(deposit.document),
  after = await generateTestBillingPdf(paid);
assert.deepEqual(before, after);
const reversed = await store.saveTestBillingPayment(
  paid.id,
  {
    revision: paid.revision,
    action: 'reverse',
    paymentId: paid.payments[0].id,
    reason: 'Erreur simulée',
  },
  actor,
);
assert.equal(testPaymentSummary(reversed).paidCents, 0);
assert.equal(reversed.payments.length, 1);
const paidFull = await store.saveTestBillingPayment(
  reversed.id,
  { ...payment, revision: reversed.revision, amountCents: 44444 },
  actor,
);
assert.equal(testPaymentSummary(paidFull).status, 'regle');
await store.saveInvoicePreparation(
  invoice.id,
  {
    revision: invoice.revision,
    dueDate: '2026-12-01',
    notes: 'Modification ultérieure',
  },
  actor,
);
assert.equal(
  (await store.getTestBillingDocument(deposit.document.id)).snapshot.notes,
  '',
);
state = await store.changeInvoiceTestState(
  { action: 'reset', revision: state.revision },
  actor,
);
await assert.rejects(
  () =>
    store.saveTestBillingPayment(
      paidFull.id,
      { ...payment, revision: paidFull.revision },
      actor,
    ),
  (e) => e.status === 409,
);
const full = await issue(state, 'facture');
assert.ok(full.document.number.startsWith('TEST-S2-'));
assert.equal(full.document.snapshot.notes, 'Modification ultérieure');
mkdirSync('tmp/pdfs', { recursive: true });
writeFileSync(
  'tmp/pdfs/test-facture.pdf',
  await generateTestBillingPdf(full.document),
);
writeFileSync('tmp/pdfs/test-acompte.pdf', before);
writeFileSync(
  'tmp/pdfs/test-solde.pdf',
  await generateTestBillingPdf(balance.document),
);
const long = structuredClone(full.document);
long.snapshot.items = Array.from({ length: 30 }, (_, i) => ({
  description:
    'Prestation détaillée de contrôle ' +
    i +
    ' : protection, transport et livraison du mobilier. '.repeat(5),
  quantity: 1,
  unitPriceHT: 12.34,
}));
long.snapshot.notes = 'Note de contrôle détaillée. '.repeat(70);
const bytes = await generateTestBillingPdf(long);
assert.ok((await PDFDocument.load(bytes)).getPageCount() > 2);
writeFileSync('tmp/pdfs/test-long.pdf', bytes);
const { createApp } = await import('../server.mjs');
const server = createApp().listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = 'http://127.0.0.1:' + server.address().port;
try {
  process.env.CRM_LOCAL_ACCESS = 'false';
  for (const [p, method] of [
    ['', 'GET'],
    ['', 'POST'],
    ['/' + full.document.id + '/pdf', 'GET'],
    ['/' + full.document.id + '/payments', 'PATCH'],
  ])
    assert.equal(
      (
        await fetch(base + '/api/crm/invoice-tests/documents' + p, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: ['POST', 'PATCH'].includes(method) ? '{}' : undefined,
        })
      ).status,
      401,
    );
  process.env.CRM_LOCAL_ACCESS = 'true';
  const list = await (
    await fetch(base + '/api/crm/invoice-tests/documents')
  ).json();
  assert.equal(list.documents.length, 3);
  assert.equal(list.documents[0].snapshot, undefined);
  const pdf = await fetch(
    base + '/api/crm/invoice-tests/documents/' + full.document.id + '/pdf',
  );
  assert.equal(pdf.status, 200);
  assert.equal(pdf.headers.get('cache-control'), 'private, no-store');
} finally {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
}
console.log(
  'Facturation TEST : acompte/solde au centime, doublons concurrents, règlements, annulation, archives, PDF stable, pagination et accès privé validés. Aucun envoi ni encaissement réel.',
);
