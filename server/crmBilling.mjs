import { createHash, randomUUID } from 'node:crypto';
import {
  getBillingState,
  getBillingDocument,
  getBillingRelated,
  commitBilling,
  getInvoicePreparations,
  getDossierRecords,
} from './crmStore.mjs';
import {
  reviseBillingSettings,
  makeBillingDocument,
  reviseBillingPayment,
  publicBillingDocument,
  billingReadiness,
  billingStaff,
} from './crmBillingModel.mjs';
import { generateBillingPdf } from './crmBillingPdf.mjs';
import { draftError } from './crmDraftModel.mjs';
import {assertInvoiceReference} from './crmInvoiceModel.mjs';
import { mailConfiguration } from './crmMail.mjs';
import { resendSend } from './crmResend.mjs';
import { billingReminder } from './crmBillingReminder.mjs';
const liveAllowed = () => process.env.CRM_BILLING_LIVE_ENABLED === 'true';
const event = (action, actor, extra = {}) => ({
  action,
  at: new Date().toISOString(),
  actor: actor.email || actor.name,
  ...extra,
});
export async function billingSettings() {
  const state = await getBillingState();
  return { state, issues: billingReadiness(state), liveAllowed: liveAllowed() };
}
export async function saveBillingSettings(payload, actor) {
  const current = await getBillingState();
  const nextState = reviseBillingSettings(
    current,
    payload,
    actor,
    liveAllowed(),
  );
  await commitBilling({
    revision: current.revision,
    nextState,
    event: event(
      payload.action === 'activate' ? 'activation' : 'settings',
      actor,
      { before: current, after: nextState },
    ),
  });
  return billingSettings();
}
export async function prepareBillingDocument(
  p,
  actor,
  { preview = false } = {},
) {
  const state = await getBillingState();
  const target =
    p.kind === 'avoir' ? await getBillingDocument(p.targetId) : null;
  const source =
    p.kind === 'avoir'
      ? null
      : (await getInvoicePreparations()).find((d) => d.id === p.invoiceId);
  const invoiceId = target?.invoiceId || source?.id;
  const related = invoiceId ? await getBillingRelated(invoiceId) : [];
  const result = makeBillingDocument(
    { state, source, target, related },
    p,
    actor,
    { preview, liveAllowed: liveAllowed() },
  );
  if(source)assertInvoiceReference(source,(await getDossierRecords(source.leadId)).quote);
  const pdf = await generateBillingPdf(result.document, { preview });
  if (preview) return { pdf };
  result.document.pdfBase64 = pdf.toString('base64');
  result.document.sha256 = createHash('sha256').update(pdf).digest('hex');
  if (Buffer.byteLength(JSON.stringify(result.document)) > 700000)
    draftError(
      400,
      'Document trop volumineux pour l’archivage. Réduisez les précisions.',
    );
  const next = await commitBilling({
    revision: state.revision,
    nextState: result.nextState,
    documents: [
      result.document,
      ...(result.creditTarget ? [result.creditTarget] : []),
    ],
    sourceCheck: source ? { id: source.id, revision: source.revision } : null,
    event: event('issue', actor, {
      id: result.document.id,
      number: result.document.number,
      sha256: result.document.sha256,
      kind: p.kind,
    }),
  });
  return { state: next, document: publicBillingDocument(result.document) };
}
export async function saveBillingPayment(id, p, actor) {
  const state = await getBillingState();
  const current = await getBillingDocument(id);
  const document = reviseBillingPayment(current, p, actor);
  await commitBilling({
    revision: state.revision,
    documents: [document],
    event: event('payment', actor, {
      documentId: id,
      actionDetail: p.action,
      revision: document.revision,
    }),
  });
  return publicBillingDocument(document);
}
export async function prepareBillingMail(id, purpose = 'document') {
  if (!['document', 'reminder'].includes(purpose)) draftError(400, 'Type d’envoi invalide.');
  const d = await getBillingDocument(id);
  if (!d) draftError(404, 'Document introuvable.');
  return {
    revision: d.revision,
    to: d.snapshot.clientEmail,
    subject:
      (d.kind === 'avoir' ? 'Votre avoir' : 'Votre facture') +
      ' ' +
      d.number +
      ' — WE MOVE',
    message:
      'Bonjour ' +
      d.snapshot.clientName +
      ',\n\nVous trouverez votre ' +
      (d.kind === 'avoir' ? 'avoir' : 'facture') +
      ' en pièce jointe. Nous restons à votre disposition pour toute question.\n\nBien cordialement,\nL’équipe WE MOVE',
    configuration: await mailConfiguration(),
    history: d.mails,
    purpose,
    ...(purpose === 'reminder' ? billingReminder(d) : {}),
  };
}
const escape = (s) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        c
      ],
  );
export async function sendBillingMail(
  id,
  p,
  actor,
  { transport = resendSend, configuration = mailConfiguration } = {},
) {
  billingStaff(actor);
  if (
    p?.confirm !== true ||
    !Number.isInteger(p.revision) ||
    !str(p.subject, 180) ||
    !p.subject.trim() ||
    /[\r\n]/.test(p.subject) ||
    !str(p.message, 6000) ||
    !p.message.trim()
  )
    draftError(400, 'Confirmez l’objet et le message à envoyer.');
  const config = await configuration();
  if (!config.ready || config.provider !== 'resend')
    draftError(409, 'Configurez Resend avant l’envoi des factures.');
  let state = await getBillingState();
  let doc = await getBillingDocument(id);
  if (!doc) draftError(404, 'Document introuvable.');
  const purpose = p.purpose || 'document';
  if (!['document', 'reminder'].includes(purpose)) draftError(400, 'Type d’envoi invalide.');
  const reminder = purpose === 'reminder' ? billingReminder(doc) : null;
  if (doc.revision !== p.revision)
    draftError(409, 'Le document a changé. Préparez à nouveau l’envoi.');
  if (!/^[^\s<>@,;]+@[^\s<>@,;]+\.[^\s<>@,;]+$/.test(doc.snapshot.clientEmail))
    draftError(400, 'E-mail client invalide dans le document émis.');
  if (doc.mails.some((m) => ['sending', 'uncertain'].includes(m.state)))
    draftError(
      409,
      'Un envoi est en cours ou incertain. Vérifiez son résultat chez Resend avant tout nouvel envoi.',
    );
  if (doc.mails.length >= 30) draftError(409, 'Limite d’envois atteinte.');
  if (doc.mails.some((m) => m.state === 'accepted') && p.confirmResend !== true)
    draftError(
      409,
      'Ce document a déjà été envoyé. Confirmez explicitement le renvoi.',
    );
  const mail = {
    purpose,
    ...(reminder ? { dueCentsAtSend: reminder.dueCents } : {}),
    id: randomUUID(),
    to: doc.snapshot.clientEmail,
    from: config.from,
    subject: p.subject.trim(),
    message: p.message.trim(),
    state: 'sending',
    createdAt: new Date().toISOString(),
    actor: actor.email || actor.name,
  };
  doc = { ...doc, revision: doc.revision + 1, mails: [...doc.mails, mail] };
  await commitBilling({
    revision: state.revision,
    documents: [doc],
    event: event('mail_claim', actor, { id, mailId: mail.id }),
  });
  let outcome;
  try {
    const info = await transport({
      from: { address: config.from },
      to: { address: mail.to },
      subject: mail.subject,
      text: mail.message,
      html:
        '<div style="background:#f3f7f9;padding:32px;font-family:Arial,sans-serif;color:#183644"><div style="max-width:600px;margin:auto;background:white;padding:32px;border-radius:16px"><img src="https://we-move.fr/images/we-move-logo-email.png" alt="WE MOVE" width="160"><p style="color:#177287">Votre déménagement, en toute sérénité.</p><h2>' +
        escape(mail.subject) +
        '</h2><div style="white-space:pre-line;line-height:1.7">' +
        escape(mail.message) +
        '</div><p style="margin-top:28px;color:#657984">Document ' +
        escape(doc.number) +
        ' joint à cet e-mail.</p></div></div>',
      messageId: '<billing-' + mail.id + '@we-move.fr>',
      attachments: [
        {
          filename: 'WE-MOVE-' + doc.number + '.pdf',
          content: Buffer.from(doc.pdfBase64, 'base64'),
        },
      ],
    });
    if (!info.accepted?.length) throw Error('Réponse indéterminée');
    outcome = {
      state: 'accepted',
      acceptedAt: new Date().toISOString(),
      providerId: info.messageId,
    };
  } catch (e) {
    outcome = {
      state: e.code === 'EPROVIDER_REJECTED' ? 'failed' : 'uncertain',
      error:
        e.code === 'EPROVIDER_REJECTED'
          ? 'Envoi refusé par Resend.'
          : 'Résultat incertain : consultez Resend avant de réessayer.',
    };
  }
  for (let attempt = 0; attempt < 5; attempt++) {
    state = await getBillingState();
    doc = await getBillingDocument(id);
    const updated = {
      ...doc,
      revision: doc.revision + 1,
      mails: doc.mails.map((m) =>
        m.id === mail.id ? { ...m, ...outcome } : m,
      ),
    };
    try {
      await commitBilling({
        revision: state.revision,
        documents: [updated],
        event: event('mail_result', actor, {
          id,
          mailId: mail.id,
          state: outcome.state,
        }),
      });
      return publicBillingDocument(updated);
    } catch (e) {
      if (e.status !== 409 || attempt === 4) throw e;
    }
  }
}
function str(v, max) {
  return typeof v === 'string' && v.length <= max;
}
export async function resolveBillingMail(id,mailId,p,actor){
 if(actor?.role!=='gerant')draftError(403,'Rapprochement réservé au gérant.');
 if(p?.confirm!==true||!['accepted','failed'].includes(p.outcome)||!str(p.evidence,500)||!p.evidence.trim())draftError(400,'Indiquez le résultat vérifié et sa référence Resend.');
 const state=await getBillingState(),d=await getBillingDocument(id);if(!d)draftError(404,'Document introuvable.');if(d.revision!==p.revision)draftError(409,'Le document a changé.');const m=d.mails.find(x=>x.id===mailId);if(!m||!['sending','uncertain'].includes(m.state))draftError(409,'Cet envoi n’attend pas de rapprochement.');if(m.state==='sending'&&Date.now()-Date.parse(m.createdAt)<120000)draftError(409,'Laissez l’envoi en cours se terminer avant tout rapprochement.');
 const updated={...d,revision:d.revision+1,mails:d.mails.map(x=>x.id===mailId?{...x,state:p.outcome,error:null,resolvedAt:new Date().toISOString(),resolvedBy:actor.email||actor.name,resolutionEvidence:p.evidence.trim(),previousState:x.state}:x)};
 await commitBilling({revision:state.revision,documents:[updated],event:event('mail_reconciled',actor,{id,mailId,outcome:p.outcome,evidence:p.evidence.trim()})});return publicBillingDocument(updated);
}
