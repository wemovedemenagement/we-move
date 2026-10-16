import assert from "node:assert/strict";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
process.env.CRM_STORAGE = "sqlite";
process.env.CRM_DATA_DIR = mkdtempSync(
  path.join(tmpdir(), "wemove-operations-"),
);
process.env.CRM_LEAD_NOTIFICATIONS = "false";
process.env.CRM_CUSTOMER_RECEIPTS = "false";
const store = await import("../server/crmStore.mjs");
const { emptyMoveOperations } = await import("../shared/moveOperations.mjs");
const { movePreparation } = await import("../shared/movePreparation.mjs");
const actor = {
  role: "gerant",
  email: "test@example.invalid",
  name: "Test isolé",
};
let registry = await store.saveResource(
  {
    revision: 0,
    name: "Véhicule isolé",
    kind: "vehicle",
    detail: "",
    active: true,
  },
  actor,
);
registry = await store.saveResource(
  {
    revision: registry.revision,
    name: "Équipier isolé",
    kind: "person",
    detail: "",
    active: true,
  },
  actor,
);
let lead = await store.createQuoteLead({
  fullName: "Mission isolée",
  email: "test@example.invalid",
  departureAddress: "Paris",
  arrivalAddress: "Lyon",
  volume: 20,
});
lead = await store.updateQuoteLead(lead.id, { status: "confirme" });
const base = {
  revision: 0,
  start: "2026-11-01T08:00",
  end: "2026-11-01T18:00",
  resourceIds: registry.resources.map((r) => r.id),
};
const operations = {
  ...emptyMoveOperations(),
  departureParking: "confirme",
  arrivalParking: "sans_objet",
  accessVerified: true,
  equipmentReady: true,
  equipmentNotes: " Deux chariots ",
  instructions: "Contacter le gardien avant arrivée.",
};
for (const invalid of [
  null,
  [],
  { ...operations, unknown: true },
  { ...operations, equipmentReady: "true" },
  { ...operations, departureParking: "ok" },
  { ...operations, instructions: "x".repeat(3001) },
])
  await assert.rejects(
    () => store.saveBooking(lead.id, { ...base, operations: invalid }, actor),
    (e) => e.status === 400,
  );
let result = await store.saveBooking(lead.id, { ...base, operations }, actor);
assert.equal(result.booking.operations.equipmentNotes, "Deux chariots");
assert.deepEqual(movePreparation(result.lead, result.booking, registry), ['Devis signé à réunir','Déclaration de valeur remplie à réunir']);
assert.equal(
  (await store.getPlanning()).bookings[0].operations.instructions,
  operations.instructions,
);
await assert.rejects(
  () => store.saveBooking(lead.id, { ...base, operations }, actor),
  (e) => e.status === 409,
);
await assert.rejects(
  () =>
    store.saveBooking(
      lead.id,
      { ...base, revision: 1, operations },
      { ...actor, role: "commercial" },
    ),
  (e) => e.status === 403,
);
result = await store.saveBooking(
  lead.id,
  { ...base, revision: 1, end: "2026-11-01T19:00" },
  actor,
);
assert.equal(
  result.booking.operations.instructions,
  operations.instructions,
  "An older client must preserve preparation",
);
result = await store.saveBooking(lead.id, { revision: 2, cancel: true }, actor);
assert.equal(result.booking.operations.instructions, operations.instructions);
assert.equal(result.booking.cancelled, true);
result = await store.saveBooking(
  lead.id,
  { ...base, revision: 3, operations: emptyMoveOperations() },
  actor,
);
assert.equal(movePreparation(result.lead, result.booking, registry).length, 6);
assert.equal(result.booking.operations.instructions, "");
assert.equal(result.lead.status, "confirme");
console.log(
  "Préparation mission : validation, persistance, concurrence, droits, compatibilité, annulation et points à vérifier validés.",
);
