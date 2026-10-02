import assert from 'node:assert/strict';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
process.env.CRM_STORAGE = process.argv.includes('--firestore-isolated')
  ? 'firestore'
  : 'sqlite';
process.env.CRM_LOCAL_ACCESS = 'true';
process.env.CRM_DATA_DIR = mkdtempSync(
  path.join(tmpdir(), 'wemove-workspace-'),
);
process.env.CRM_LEAD_NOTIFICATIONS = 'false';
process.env.CRM_CUSTOMER_RECEIPTS = 'false';
if (
  process.env.CRM_STORAGE === 'firestore' &&
  (process.env.NODE_ENV !== 'test' ||
    !/^integration_[a-z0-9_]+$/.test(
      process.env.CRM_FIRESTORE_TEST_NAMESPACE || '',
    ))
)
  throw new Error('Espace Firestore de test isolé obligatoire.');
const store = await import('../server/crmStore.mjs');
const { createApp } = await import('../server.mjs');
const { nextStep, workQueue } = await import('../shared/crmWorkflow.mjs');
const actor = {
  role: 'gerant',
  email: 'test@example.invalid',
  name: 'Test isolé',
};
let registry = (await store.getPlanning()).registry;
const payload = {
  revision: registry.revision,
  name: 'Camion test isolé',
  kind: 'vehicle',
  detail: '',
  active: true,
};
await assert.rejects(
  () => store.saveResource(payload, { ...actor, role: 'commercial' }),
  (e) => e.status === 403,
);
registry = await store.saveResource(payload, actor);
const vehicle = registry.resources[0];
await assert.rejects(
  () => store.saveResource(payload, actor),
  (e) => e.status === 409,
);
await assert.rejects(
  () => store.saveResource({ ...payload, revision: registry.revision }, actor),
  (e) => e.status === 409,
);
registry = await store.saveResource(
  {
    ...payload,
    revision: registry.revision,
    name: 'Équipier isolé',
    kind: 'person',
  },
  actor,
);
const person = registry.resources.find((r) => r.kind === 'person');
const a = await store.createQuoteLead({
    fullName: 'Dossier A isolé',
    email: 'a@example.invalid',
  }),
  b = await store.createQuoteLead({
    fullName: 'Dossier B isolé',
    email: 'b@example.invalid',
  });
const request = {
  revision: 0,
  start: '2026-11-01T08:00',
  end: '2026-11-01T16:00',
  resourceIds: [vehicle.id, person.id],
};
await assert.rejects(
  () => store.saveBooking(a.id, request, actor),
  (e) => e.status === 409,
);
await store.updateQuoteLead(a.id, { status: 'confirme' });
await store.updateQuoteLead(b.id, { status: 'confirme' });
await assert.rejects(
  () =>
    store.saveBooking(a.id, { ...request, start: '2026-02-30T08:00' }, actor),
  (e) => e.status === 400,
);
await assert.rejects(
  () => store.saveBooking(a.id, { ...request, end: request.start }, actor),
  (e) => e.status === 400,
);
await assert.rejects(
  () => store.saveBooking(a.id, request, { ...actor, role: 'commercial' }),
  (e) => e.status === 403,
);
const attempts = await Promise.allSettled([
  store.saveBooking(a.id, request, actor),
  store.saveBooking(b.id, request, actor),
]);
assert.equal(attempts.filter((r) => r.status === 'fulfilled').length, 1);
assert.equal(attempts.find((r) => r.status === 'rejected').reason.status, 409);
const winner = attempts.find((r) => r.status === 'fulfilled').value,
  loser = winner.lead.id === a.id ? b : a;
assert.equal(winner.lead.teamMembers[0], person.name);
assert.equal(winner.lead.assignedTruckName, vehicle.name);
assert.ok(winner.lead.internalNotes[0].content.includes('Mission planifiée'));
await assert.rejects(
  () => store.saveBooking(winner.lead.id, request, actor),
  (e) => e.status === 409,
);
await store.saveBooking(
  loser.id,
  { ...request, start: '2026-11-01T16:00', end: '2026-11-01T19:00' },
  actor,
);
await store.saveBooking(winner.lead.id, { revision: 1, cancel: true }, actor);
assert.equal(
  (await store.getDossierRecords(winner.lead.id)).lead.scheduledTime,
  '',
);
const latest = (await store.getPlanning()).registry;
await store
  .saveResource({ ...vehicle, revision: latest.revision, active: false }, actor)
  .catch(async (e) => {
    // send only allowed editable fields
    if (e.status !== 400) throw e;
    await store.saveResource(
      {
        id: vehicle.id,
        name: vehicle.name,
        kind: vehicle.kind,
        detail: vehicle.detail,
        active: false,
        revision: latest.revision,
      },
      actor,
    );
  });
await assert.rejects(
  () => store.saveBooking(winner.lead.id, { ...request, revision: 2 }, actor),
  (e) => e.status === 409,
);
const c = await store.createQuoteLead({
  fullName: 'Envoi simulé',
  email: 'c@example.invalid',
});
await store.createQuoteDraft(c.id);
await store.quoteMailTransaction(c.id, 'test-accepted', () => ({
  write: true,
  record: {
    id: 'test-accepted',
    state: 'accepted',
    createdAt: new Date().toISOString(),
    actor: 'Test',
    pdfBase64: 'PRIVATE',
  },
  summary: { state: 'accepted', revision: 1 },
}));
assert.equal((await store.getDossierRecords(c.id)).lead.status, 'devis_envoye');
assert.equal(
  (await store.getDossierRecords(c.id)).mails[0].pdfBase64,
  undefined,
);
await store.updateQuoteLead(c.id, { status: 'confirme' });
await store.quoteMailTransaction(c.id, 'test-repeat', () => ({
  write: true,
  record: {
    id: 'test-repeat',
    state: 'accepted',
    createdAt: new Date().toISOString(),
    actor: 'Test',
  },
  summary: { state: 'accepted', revision: 1 },
}));
assert.equal((await store.getDossierRecords(c.id)).lead.status, 'confirme');
const current = (await store.getDossierRecords(a.id)).lead;
await assert.rejects(
  () =>
    store.updateQuoteLead(a.id, {
      expectedUpdatedAt: 'old',
      notes: 'overwrite',
    }),
  (e) => e.status === 409,
);
assert.equal(
  nextStep({ ...a, status: 'confirme' }, '2026-11-01').target,
  'move',
);
assert.equal(
  nextStep(
    {
      ...a,
      status: 'refuse',
      nextAction: { type: 'rappeler', dueDate: '2026-01-01' },
    },
    '2026-11-01',
  ).key,
  'archive',
);
assert.equal(
  nextStep(
    {
      ...a,
      status: 'termine',
      nextAction: { type: 'rappeler', dueDate: '2026-01-01' },
    },
    '2026-11-01',
  ).key,
  'billing',
);
assert.equal(
  workQueue(
    [{ ...a, nextAction: { type: 'rappeler', dueDate: '2026-01-01' } }, b],
    '2026-11-01',
  )[0].lead.id,
  a.id,
);
const server = createApp().listen(0, '127.0.0.1');
await new Promise((r) => server.once('listening', r));
const base = 'http://127.0.0.1:' + server.address().port;
try {
  process.env.CRM_LOCAL_ACCESS = 'false';
  for (const [url, method] of [
    ['/api/crm/planning', 'GET'],
    ['/api/crm/resources', 'POST'],
    ['/api/crm/dossiers/' + a.id, 'GET'],
    ['/api/crm/planning/' + a.id, 'PUT'],
    ['/api/crm/invoice-tests', 'POST'],
  ]) {
    assert.equal(
      (
        await fetch(base + url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: method === 'GET' ? undefined : '{}',
        })
      ).status,
      401,
    );
  }
  process.env.CRM_LOCAL_ACCESS = 'true';
  assert.equal(
    (
      await fetch(base + '/api/quotes/' + a.id, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduledTime: '2026-11-01T08:00' }),
      })
    ).status,
    400,
  );
  const dossier = await (
    await fetch(base + '/api/crm/dossiers/' + a.id)
  ).json();
  assert.equal(dossier.success, true);
  assert.equal(dossier.dossier.lead.id, a.id);
} finally {
  server.closeAllConnections();
  await new Promise((r) => server.close(r));
}
console.log(
  'Dossier unifié, rôles, authentification, ressources, conflit simultané, créneaux adjacents, annulation, désactivation, versions et priorités validés. Données de test isolées uniquement.',
);
