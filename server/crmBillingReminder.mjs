import { billingSummary } from './crmBillingModel.mjs';
import { draftError } from './crmDraftModel.mjs';
import { parisToday } from '../shared/followUp.mjs';

export function billingReminder(document, now = new Date()) {
  if (!document) draftError(404, 'Document introuvable.');
  const today = parisToday(now);
  const { dueCents } = billingSummary(document, today);
  if (document.mode !== 'live' || document.kind === 'avoir' || dueCents <= 0 || !document.dueDate || document.dueDate >= today)
    draftError(409, 'Seule une facture réelle avec une échéance dépassée et un reste à régler peut être relancée.');
  const last = [...(document.mails || [])].reverse().find(m => m.purpose === 'reminder' && m.state === 'accepted');
  if (last && now.getTime() - Date.parse(last.createdAt) < 86400000)
    draftError(409, 'Une relance a déjà été acceptée dans les dernières 24 heures.');
  const amount = (dueCents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  const date = document.dueDate.split('-').reverse().join('/');
  return {
    purpose: 'reminder', dueCents,
    subject: 'Rappel de règlement — facture ' + document.number + ' — WE MOVE',
    message: `Bonjour ${document.snapshot.clientName},\n\nSauf erreur ou règlement récent de votre part, notre suivi indique un solde de ${amount} pour la facture ${document.number}, arrivée à échéance le ${date}.\n\nVous trouverez la facture originale en pièce jointe. Les règlements et avoirs enregistrés sont pris en compte dans le solde indiqué ci-dessus.\n\nSi vous avez déjà effectué le règlement, merci de nous en préciser la date et la référence afin que nous puissions mettre votre dossier à jour. Pour toute question, vous pouvez simplement répondre à cet e-mail.\n\nMerci pour votre confiance,\nL’équipe WE MOVE`,
  };
}
