import { randomUUID } from 'node:crypto';
import { draftError } from './crmDraftModel.mjs';
import { parisToday } from '../shared/followUp.mjs';
import {emptyQuoteDocument} from '../shared/quoteDocument.mjs';
const defaults=emptyQuoteDocument().fields;
const fail = (s, m) => draftError(s, m);
export const billingStaff = (actor) => {
  if (!['gerant', 'secretaire'].includes(actor?.role))
    fail(403, 'Facturation réservée au gérant et au secrétariat.');
};
const manager = (actor) => {
  if (actor?.role !== 'gerant') fail(403, 'Action réservée au gérant.');
};
const str = (v, max = 300) => typeof v === 'string' && v.length <= max;
export const billingDate = (v) =>
  typeof v === 'string' &&
  /^\d{4}-\d{2}-\d{2}$/.test(v) &&
  Number.isFinite(Date.parse(v)) &&
  new Date(v).toISOString().slice(0, 10) === v;
const revision = (current, payload) => {
  if (payload?.revision !== current.revision)
    fail(409, 'Les données ont changé. Actualisez avant de réessayer.');
};
export const initialBilling = () => ({
  revision: 0,
  active: false,
  counter: null,
  lastIssueDate: '',
  activatedAt: null,
  company: {
    name: 'WE MOVE',
    address: defaults.companyAddress,
    legalForm: '',
    capital: defaults.companyCapital,
    siret: defaults.companySiret,
    vat: defaults.companyVat,
    registration: defaults.companyRcs,
    email: 'contact@we-move.fr',
    phone: defaults.companyPhone,
    iban: '',
    bic: '',
    insurance: '',
    vatOnDebits: false,
  },
  terms: {
    discount: 'Escompte pour paiement anticipé : néant.',
    latePenalty: '',
    exemption: '',
    defaultDays: 0,
  },
  migration: { lastParcNumber: '', cutoverDate: '' },
});
export function billingReadiness(s) {
  const missing = [];
  for (const [k, label] of Object.entries({
    name: 'Dénomination sociale',
    address: 'Adresse du siège',
    legalForm: 'Forme juridique',
    capital: 'Capital social',
    siret: 'SIRET',
    vat: 'N° TVA',
    registration: 'Immatriculation RCS',
    email: 'E-mail société',
  }))
    if (!s.company[k]?.trim()) missing.push(label);
  if (!/^\d{14}$/.test(s.company.siret)) missing.push('SIRET à 14 chiffres');
  if (!/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(s.company.email))
    missing.push('E-mail valide');
  if (!s.terms.discount.trim()) missing.push('Conditions d’escompte');
  if (!s.terms.latePenalty.trim())
    missing.push('Conditions de pénalités professionnelles');
  if (s.migration.lastParcNumber.length>24 || !/^([A-Za-z0-9_-]*?)(\d{1,12})$/.test(s.migration.lastParcNumber))
    missing.push('Dernier numéro PARC, terminé par un compteur numérique');
  if (!billingDate(s.migration.cutoverDate)) missing.push('Date de bascule');
  return missing;
}
export function reviseBillingSettings(current, payload, actor, liveAllowed) {
  manager(actor);
  revision(current, payload);
  if (payload.action === 'activate') {
    if (!liveAllowed)
      fail(
        409,
        'Activation réelle encore verrouillée côté serveur. Confirmez la reprise PARC avant sa mise en service.',
      );
    if (current.active) fail(409, 'Facturation déjà activée.');
    if (payload.confirm !== true || payload.parcClosed !== true)
      fail(
        400,
        'Confirmez la numérotation et l’arrêt de l’émission dans PARC.',
      );
    const issues = billingReadiness(current);
    if (issues.length) fail(400, issues.join(' · '));
    if (current.migration.cutoverDate > parisToday())
      fail(409, 'La date de bascule n’est pas encore atteinte.');
    const match = current.migration.lastParcNumber.match(/^(.*?)(\d+)$/);
    return {
      ...current,
      active: true,
      counter: Number(match[2]),
      prefix: match[1],
      digits: match[2].length,
      activatedAt: new Date().toISOString(),
      activatedBy: actor.email || actor.name,
    };
  }
  if (
    payload.action !== 'save' ||
    Object.keys(payload).some(
      (k) =>
        !['revision', 'action', 'company', 'terms', 'migration'].includes(k),
    )
  )
    fail(400, 'Paramètres invalides.');
  const next = structuredClone(current);
  for (const [section, keys] of Object.entries({
    company: Object.keys(current.company),
    terms: Object.keys(current.terms),
    migration: Object.keys(current.migration),
  })) {
    const value = payload[section];
    if (
      !value ||
      Object.keys(value).length !== keys.length ||
      keys.some((k) => !Object.hasOwn(value, k))
    )
      fail(400, 'Paramètres incomplets.');
    for (const k of keys) {
      if (section === 'terms' && k === 'defaultDays') {
        if (!Number.isInteger(value[k]) || value[k] < 0 || value[k] > 30)
          fail(400, 'Échéance par défaut entre 0 et 30 jours.');
      } else if (k === 'vatOnDebits') {
        if (typeof value[k] !== 'boolean') fail(400, 'Option TVA invalide.');
      } else if (
        !str(value[k], k === 'insurance' ? 1200 : 500) ||
        /[\u0000-\u0008]/.test(value[k])
      )
        fail(400, 'Champ invalide : ' + k);
      next[section][k] =
        typeof value[k] === 'string' ? value[k].trim() : value[k];
    }
  }
  next.company.siret = next.company.siret.replace(/\s/g, '');
  next.company.iban = next.company.iban.replace(/\s/g, '').toUpperCase();
  next.company.bic = next.company.bic.replace(/\s/g, '').toUpperCase();
  if (next.company.iban) {
    if (!/^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/.test(next.company.iban))
      fail(400, 'IBAN invalide.');
    let n = 0;
    for (const c of next.company.iban.slice(4) +
      next.company.iban.slice(0, 4)) {
      for (const d of /\d/.test(c) ? c : String(c.charCodeAt(0) - 55))
        n = (n * 10 + Number(d)) % 97;
    }
    if (n !== 1) fail(400, 'Clé IBAN invalide.');
  }
  if (
    next.company.bic &&
    !/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/.test(next.company.bic)
  )
    fail(400, 'BIC invalide.');
  if (
    current.active &&
    JSON.stringify(current.migration) !== JSON.stringify(next.migration)
  )
    fail(409, 'La reprise de numérotation est figée après activation.');
  if (current.active && billingReadiness(next).length)
    fail(400, 'Les mentions obligatoires doivent rester complètes.');
  return next;
}
export function billingSummary(d, today=parisToday()) {
  const paid = d.payments
      .filter((p) => !p.reversedAt)
      .reduce(
        (sum, p) => sum + (p.kind === 'refund' ? -1 : 1) * p.amountCents,
        0,
      ),
    net = d.amountTTC - (d.creditedTTC || 0);
  return {
    paidCents: paid,
    dueCents: d.kind === 'avoir' ? 0 : Math.max(0, net - paid),
    refundDueCents: Math.max(0, paid - net),
    status:
      d.kind === 'avoir'
        ? 'avoir'
        : net === 0
          ? 'credite'
          : paid >= net
            ? 'regle'
            : d.dueDate < today
              ? 'retard'
              : paid > 0
                ? 'partiel'
                : 'a_regler',
  };
}
export function publicBillingDocument(d) {
  if (!d) return null;
  const { pdfBase64, snapshot, company, terms, ...safe } = d;
  return {
    ...safe,
    clientName: snapshot.clientName,
    clientEmail: snapshot.clientEmail,
    ...billingSummary(d),
  };
}
export function makeBillingDocument(
  context,
  p,
  actor,
  { liveAllowed = false, preview = false } = {},
) {
  billingStaff(actor);
  const { state, source, related = [], target } = context;
  revision(state, p);
  if (!preview && (!liveAllowed || !state.active))
    fail(409, 'L’émission réelle n’est pas activée.');
  if (!preview && p.confirm !== true)
    fail(400, 'Confirmez l’émission définitive.');
  if (!['facture', 'acompte', 'solde', 'avoir'].includes(p.kind))
    fail(400, 'Type de document invalide.');
  const today = parisToday();
  if (
    !preview &&
    (state.migration.cutoverDate > today || state.lastIssueDate > today)
  )
    fail(409, 'Date incompatible avec la séquence de facturation.');
  const issues = billingReadiness(state);
  if (issues.length && !preview) fail(400, issues.join(' · '));
  let snapshot,
    amountHT,
    taxAmount,
    deposit = null,
    creditTarget = null;
  const isCredit = p.kind === 'avoir';
  if (isCredit) {
    if (!target || target.kind === 'avoir')
      fail(404, 'Facture à corriger introuvable.');
    revision(target, { revision: p.documentRevision });
    if (!str(p.reason, 1000) || !p.reason.trim())
      fail(400, 'Indiquez le motif de l’avoir.');
    if (
      target.kind === 'acompte' &&
      related.some(
        (d) =>
          d.kind === 'solde' &&
          d.creditedTTC < d.amountTTC &&
          d.depositId === target.id,
      )
    )
      fail(409, 'Corrigez d’abord le solde associé à cet acompte.');
    const remaining = target.amountHT - target.creditedHT;
    if (
      !Number.isSafeInteger(p.creditHT) ||
      p.creditHT <= 0 ||
      p.creditHT > remaining
    )
      fail(
        400,
        'Le montant HT de l’avoir dépasse le montant encore disponible.',
      );
    amountHT = p.creditHT;
    taxAmount =
      amountHT === remaining
        ? target.taxAmount - target.creditedTax
        : Math.round(((target.creditedHT + amountHT) * target.taxRate) / 100) -
          target.creditedTax;
    snapshot = structuredClone(target.snapshot);
    creditTarget = {
      ...target,
      creditedHT: target.creditedHT + amountHT,
      creditedTax: target.creditedTax + taxAmount,
      creditedTTC: target.creditedTTC + amountHT + taxAmount,
      revision: target.revision + 1,
    };
  } else {
    if (!source || source.status !== 'brouillon')
      fail(404, 'Brouillon introuvable.');
    if (source.revision !== p.sourceRevision)
      fail(409, 'Le brouillon a changé.');
    const active = related.filter(
      (d) => d.kind !== 'avoir' && d.creditedTTC < d.amountTTC,
    );
    if (active.some((d) => ['facture', 'solde'].includes(d.kind)))
      fail(
        409,
        'Ce dossier est déjà facturé. Utilisez un avoir pour le corriger.',
      );
    deposit = active.find((d) => d.kind === 'acompte');
    if (p.kind === 'acompte' && deposit) fail(409, 'Un acompte existe déjà.');
    if (p.kind === 'facture' && deposit)
      fail(409, 'Un acompte existe : émettez le solde.');
    if (p.kind === 'solde' && (!deposit || deposit.creditedTTC > 0))
      fail(409, 'Un acompte non corrigé est nécessaire avant le solde.');
    snapshot = structuredClone(deposit?.snapshot || source);
    amountHT = Math.round(snapshot.amountHT * 100);
    taxAmount = Math.round(snapshot.taxAmount * 100);
    if (
      !Number.isSafeInteger(amountHT) ||
      amountHT <= 0 ||
      amountHT + taxAmount !== Math.round(snapshot.amountTTC * 100)
    )
      fail(400, 'Montants incohérents.');
    if (p.kind === 'acompte') {
      if (
        typeof p.depositRate !== 'number' ||
        !Number.isFinite(p.depositRate) ||
        p.depositRate <= 0 ||
        p.depositRate >= 100 ||
        Math.abs(p.depositRate * 100 - Math.round(p.depositRate * 100)) >
          0.00001
      )
        fail(400, 'Pourcentage d’acompte invalide.');
      const total = amountHT;
      amountHT = Math.round((amountHT * p.depositRate) / 100);
      taxAmount = Math.round((amountHT * snapshot.taxRate) / 100);
      if (amountHT <= 0 || amountHT >= total)
        fail(400, 'Acompte arrondi invalide.');
    }
    if (p.kind === 'solde') {
      amountHT -= deposit.amountHT;
      taxAmount -= deposit.taxAmount;
    }
  }
  const details = isCredit ? target.details : p.details;
  if (
    !details ||
    Object.keys(details).some(k=>!['clientType','serviceDate','clientSiren','clientVat','orderNumber','deliveryAddress'].includes(k)) ||
    !['particulier', 'entreprise'].includes(details.clientType) ||
    !billingDate(details.serviceDate) ||
    !str(details.clientSiren, 9) ||
    !str(details.clientVat, 40) ||
    !str(details.orderNumber, 120) ||
    !str(details.deliveryAddress, 500)
  )
    fail(
      400,
      'Complétez le type de client, la date de prestation/versement et les informations de facturation.',
    );
  if (
    !isCredit &&
    (details.serviceDate > today ||
      !billingDate(p.dueDate) ||
      p.dueDate < today)
  )
    fail(
      400,
      'La prestation/le versement doit être daté au plus tard aujourd’hui ; l’échéance ne peut pas précéder l’émission.',
    );
  if (
    details.clientType === 'entreprise' &&
    !/^\d{9}$/.test(details.clientSiren)
  )
    fail(400, 'Indiquez le SIREN du client professionnel.');
  if(!isCredit&&details.clientType==='entreprise'&&Date.parse(p.dueDate)-Date.parse(today)>30*86400000)fail(400,'Pour ce parcours de déménagement professionnel, l’échéance est limitée à 30 jours après émission.');
  if (snapshot.taxRate === 0 && !state.terms.exemption && !isCredit)
    fail(400, 'Renseignez la mention justifiant la TVA à 0 %.');
  const counter = (state.counter ?? 0) + 1;
  if (!Number.isSafeInteger(counter) || counter > 999999999999)
    fail(409, 'Compteur hors limite.');
  const now = new Date().toISOString();
  const document = {
    id: preview ? 'preview' : String(counter),
    number: preview
      ? 'APERÇU NON ÉMIS'
      : (state.prefix || '') + String(counter).padStart(state.digits || 1, '0'),
    mode: 'live',
    kind: p.kind,
    invoiceId: snapshot.id,
    quoteReference: snapshot.quoteReference,
    leadId: snapshot.leadId,
    revision: 1,
    createdAt: now,
    issueDate: today,
    createdBy: actor.email || actor.name,
    snapshot,
    company: structuredClone(isCredit ? target.company : state.company),
    terms: structuredClone(isCredit ? target.terms : state.terms),
    details: structuredClone(details),
    dueDate: isCredit ? today : p.dueDate,
    amountHT,
    taxAmount,
    amountTTC: amountHT + taxAmount,
    taxRate: snapshot.taxRate,
    totalProjectTTC: Math.round(snapshot.amountTTC * 100),
    depositId: deposit?.id || null,
    depositNumber: deposit?.number || null,
    depositTTC: deposit?.amountTTC || 0,
    depositRate: p.kind === 'acompte' ? p.depositRate : null,
    creditOf: isCredit ? target.id : null,
    creditNumber: isCredit ? target.number : null,
    reason: isCredit ? p.reason.trim() : '',
    creditedHT: 0,
    creditedTax: 0,
    creditedTTC: 0,
    payments: [],
    mails: [],
    renderVersion: 1,
  };
  return {
    document,
    creditTarget,
    nextState: { ...state, counter, lastIssueDate: today },
  };
}
export function reviseBillingPayment(current, p, actor) {
  billingStaff(actor);
  if (!current || current.kind === 'avoir')
    fail(400, 'Sélectionnez une facture.');
  revision(current, p);
  const document = structuredClone(current),
    summary = billingSummary(current);
  if (p.action === 'reverse') {
    const payment = document.payments.find((x) => x.id === p.paymentId);
    if (!payment || payment.reversedAt)
      fail(409, 'Règlement absent ou déjà annulé.');
    if (!str(p.reason, 500) || !p.reason.trim())
      fail(400, 'Précisez le motif d’annulation.');
    if (payment.kind !== 'refund' && summary.paidCents < payment.amountCents)
      fail(409, 'Annulez le remboursement associé avant ce règlement.');
    Object.assign(payment, {
      reversedAt: new Date().toISOString(),
      reversedBy: actor.email || actor.name,
      reversalReason: p.reason.trim(),
    });
  } else if (p.action === 'add') {
    if (
      !['payment', 'refund'].includes(p.kind) ||
      !Number.isSafeInteger(p.amountCents) ||
      p.amountCents <= 0 ||
      p.amountCents >
        (p.kind === 'refund' ? summary.refundDueCents : summary.dueCents)
    )
      fail(400, 'Montant supérieur au solde disponible.');
    if (
      !billingDate(p.date) ||
      p.date > parisToday() ||
      p.date < current.issueDate
    )
      fail(400, 'Date de règlement invalide.');
    if (
      !['virement', 'carte', 'cheque', 'especes', 'autre'].includes(p.method) ||
      !str(p.reference, 120)
    )
      fail(400, 'Moyen de règlement invalide.');
    if (document.payments.length >= 300)
      fail(409, 'Limite de mouvements atteinte.');
    document.payments.push({
      id: randomUUID(),
      kind: p.kind,
      amountCents: p.amountCents,
      date: p.date,
      method: p.method,
      reference: p.reference.trim(),
      createdAt: new Date().toISOString(),
      createdBy: actor.email || actor.name,
    });
  } else fail(400, 'Action invalide.');
  document.revision++;
  return document;
}
