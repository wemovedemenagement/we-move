import { randomUUID } from 'node:crypto';
import { draftError } from './crmDraftModel.mjs';
import { parisToday } from '../shared/followUp.mjs';
const fail = (message, status = 400) => draftError(status, message);
const cents = (value) => Math.round(value * 100);
const dateValid = (value) =>
  typeof value === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(value)) &&
  new Date(value).toISOString().slice(0, 10) === value;
export function issueTestDocument(state, invoice, documents, payload, actor) {
  if (actor.role !== 'gerant') fail('Action réservée au gérant.', 403);
  if (
    !payload ||
    Object.keys(payload).some(
      (k) => !['revision', 'invoiceId', 'kind', 'depositRate'].includes(k),
    )
  )
    fail('Simulation invalide.');
  if (payload.revision !== state.revision)
    fail('Le compteur a changé. Actualisez les essais.', 409);
  if (!invoice || invoice.status !== 'brouillon')
    fail('Brouillon introuvable.', 404);
  if (!['facture', 'acompte', 'solde'].includes(payload.kind))
    fail('Type de simulation invalide.');
  if (state.counter >= 500)
    fail('Ouvrez une nouvelle session pour poursuivre les essais.', 409);
  const related = documents.filter(
    (d) => d.session === state.session && d.invoiceId === invoice.id,
  );
  if (
    related.some((d) => d.kind === 'facture' || d.kind === 'solde') ||
    related.some((d) => d.kind === payload.kind)
  )
    fail(
      'Ce document a déjà été simulé pour ce dossier dans cette session.',
      409,
    );
  const deposit = related.find((d) => d.kind === 'acompte');
  if (payload.kind === 'facture' && deposit)
    fail('Un acompte existe : préparez le solde.', 409);
  if (payload.kind === 'solde' && !deposit)
    fail('Simulez un acompte avant le solde.', 409);
  const source = deposit?.snapshot || invoice;
  const totalHT = cents(source.amountHT),
    totalTax = cents(source.taxAmount),
    totalTTC = cents(source.amountTTC);
  if (
    !Number.isSafeInteger(totalHT) ||
    totalHT <= 0 ||
    totalTTC !== totalHT + totalTax
  )
    fail('Montants du brouillon incohérents.');
  let amountHT = totalHT,
    taxAmount = totalTax,
    depositRate = null;
  if (payload.kind === 'acompte') {
    depositRate = payload.depositRate;
    if (
      typeof depositRate !== 'number' ||
      !Number.isFinite(depositRate) ||
      depositRate <= 0 ||
      depositRate >= 100 ||
      Math.abs(depositRate * 100 - Math.round(depositRate * 100)) > 0.00001
    )
      fail(
        'Indiquez un acompte entre 0 et 100 %, avec deux décimales maximum.',
      );
    amountHT = Math.round((totalHT * depositRate) / 100);
    taxAmount = Math.round((amountHT * source.taxRate) / 100);
    if (amountHT <= 0 || amountHT >= totalHT)
      fail('L’acompte arrondi doit laisser un solde positif.');
  } else if (payload.kind === 'solde') {
    amountHT -= deposit.amountHT;
    taxAmount -= deposit.taxAmount;
  }
  const counter = state.counter + 1,
    id = `S${state.session}-${counter}`,
    number = `TEST-S${state.session}-${String(counter).padStart(5, '0')}`;
  const document = {
    id,
    number,
    mode: 'test',
    renderVersion: 1,
    session: state.session,
    invoiceId: invoice.id,
    kind: payload.kind,
    depositRate,
    depositNumber: deposit?.number || null,
    depositTTC: deposit?.amountTTC || 0,
    totalProjectTTC: totalTTC,
    amountHT,
    taxAmount,
    amountTTC: amountHT + taxAmount,
    taxRate: source.taxRate,
    snapshot: structuredClone(source),
    dueDate: invoice.dueDate,
    createdAt: new Date().toISOString(),
    issueDate: parisToday(),
    createdBy: actor.email || actor.name,
    revision: 1,
    payments: [],
  };
  return {
    state: {
      ...state,
      counter,
      revision: state.revision + 1,
      lastNumber: number,
    },
    document,
  };
}
export function testPaymentSummary(document) {
  const paid = document.payments
    .filter((p) => !p.reversedAt)
    .reduce((n, p) => n + p.amountCents, 0);
  return {
    paidCents: paid,
    dueCents: document.amountTTC - paid,
    status:
      paid === document.amountTTC ? 'regle' : paid ? 'partiel' : 'a_regler',
  };
}
export function reviseTestPayment(state, current, payload, actor) {
  if (actor.role !== 'gerant') fail('Action réservée au gérant.', 403);
  if (!current) fail('Simulation introuvable.', 404);
  if (current.session !== state.session)
    fail(
      'Cette session de test est archivée. Ses règlements ne peuvent plus être modifiés.',
      409,
    );
  if (!payload || payload.revision !== current.revision)
    fail('Les règlements ont changé. Actualisez avant de réessayer.', 409);
  if (
    Object.keys(payload).some(
      (k) =>
        ![
          'revision',
          'action',
          'amountCents',
          'date',
          'method',
          'reference',
          'paymentId',
          'reason',
        ].includes(k),
    )
  )
    fail('Règlement invalide.');
  const result = structuredClone(current),
    now = new Date().toISOString();
  if (payload.action === 'add') {
    if (
      !Number.isSafeInteger(payload.amountCents) ||
      payload.amountCents <= 0 ||
      payload.amountCents > testPaymentSummary(current).dueCents
    )
      fail(
        'Le montant doit être positif et ne pas dépasser le reste à régler.',
      );
    if (
      !dateValid(payload.date) ||
      !['virement', 'carte', 'cheque', 'especes', 'autre'].includes(
        payload.method,
      ) ||
      typeof payload.reference !== 'string' ||
      payload.reference.length > 120
    )
      fail('Date, moyen ou référence invalide.');
    if (result.payments.length >= 100)
      fail('Limite de règlements de test atteinte.');
    result.payments.push({
      id: randomUUID(),
      amountCents: payload.amountCents,
      date: payload.date,
      method: payload.method,
      reference: payload.reference.trim(),
      createdAt: now,
      createdBy: actor.email || actor.name,
    });
  } else if (payload.action === 'reverse') {
    const payment = result.payments.find((p) => p.id === payload.paymentId);
    if (!payment || payment.reversedAt)
      fail('Ce règlement est absent ou déjà annulé.', 409);
    if (
      typeof payload.reason !== 'string' ||
      !payload.reason.trim() ||
      payload.reason.length > 300
    )
      fail('Précisez le motif de l’annulation (300 caractères maximum).');
    Object.assign(payment, {
      reversedAt: now,
      reversedBy: actor.email || actor.name,
      reversalReason: payload.reason.trim(),
    });
  } else fail('Action de règlement invalide.');
  result.revision++;
  return result;
}
export function publicTestDocument(document) {
  const { snapshot, ...rest } = document;
  return {
    ...rest,
    clientName: snapshot.clientName,
    quoteReference: snapshot.quoteReference,
    ...testPaymentSummary(document),
  };
}
