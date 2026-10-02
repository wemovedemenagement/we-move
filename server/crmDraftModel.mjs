import {emptyQuoteDocument,validateQuoteDocument} from '../shared/quoteDocument.mjs';
import { randomUUID } from 'node:crypto';
import { quoteTotals } from '../shared/quoteTotals.mjs';
export function draftError(status, message) { const error = new Error(message); error.status = status; throw error; }
export function draftId(value) {
  if (typeof value !== 'string' || !/^[A-Za-z0-9_-]{1,160}$/.test(value)) draftError(400, 'Référence de demande invalide.');
  return value;
}
export function newDraft(lead) {
  const now = new Date().toISOString();
  return { id: lead.id, leadId: lead.id, reference: 'BR-' + randomUUID().slice(0,8).toUpperCase(),
    clientName: lead.fullName, clientEmail: lead.email, clientPhone: lead.phone,
    departureAddress: lead.departureAddress, arrivalAddress: lead.arrivalAddress,
    moveDate: lead.moveDate, validUntil: '', items: [], taxRate: null, depositRate: null,
    document: emptyQuoteDocument(lead), notes: lead.notes || '', status: 'brouillon', revision: 1, createdAt: now, updatedAt: now,
    ...quoteTotals([], null, null) };
}
export function reviseDraft(current, payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) draftError(400, 'Brouillon invalide.');
  const keys = ['revision','items','taxRate','depositRate','validUntil','notes','document'];
  if (Object.keys(payload).some(key => !keys.includes(key))) draftError(400, 'Champ de devis non modifiable.');
  if (payload.revision !== current.revision) draftError(409, 'Ce brouillon a été modifié ailleurs. Rechargez la version enregistrée avant de réessayer.');
  if (!Array.isArray(payload.items) || payload.items.length > 50) draftError(400, 'Le devis accepte au maximum 50 prestations.');
  const numeric = (value, min, max, precision, label) => {
    if (typeof value !== 'number' || !Number.isFinite(value) || value < min || value > max || Math.abs(value * precision - Math.round(value * precision)) > 0.00001) draftError(400, label + ' invalide.');
    return value;
  };
  const text = (value, max, label) => {
    if (typeof value !== 'string' || value.length > max) draftError(400, label + ' invalide.');
    return value.trim();
  };
  const items = payload.items.map(item => {
    if (!item || typeof item !== 'object') draftError(400, 'Prestation invalide.');
    const description = text(item.description, 1000, 'Description');
    if (!description) draftError(400, 'Décrivez chaque prestation.');
    return {description, quantity: numeric(item.quantity,0.001,10000,1000,'Quantité'), unitPriceHT: numeric(item.unitPriceHT,0,1000000,100,'Prix unitaire')};
  });
  const taxRate = payload.taxRate === null ? null : numeric(payload.taxRate,0,100,100,'Taux de TVA');
  const depositRate = payload.depositRate === null ? null : numeric(payload.depositRate,0,100,100,'Acompte');
  const validUntil = text(payload.validUntil,10,'Date de validité');
  if (validUntil && (!/^\d{4}-\d{2}-\d{2}$/.test(validUntil) || !Number.isFinite(Date.parse(validUntil)) || new Date(validUntil).toISOString().slice(0,10) !== validUntil)) draftError(400, 'Date de validité invalide.');
  const document = payload.document === undefined ? current.document : validateQuoteDocument(payload.document);
  if(document?.fields.issueDate && validUntil && validUntil < document.fields.issueDate) draftError(400, 'La validité doit suivre la date du devis.');
  return {...current, ...(document ? {document,clientName:document.fields.clientName,clientEmail:document.fields.clientEmail,clientPhone:document.fields.clientPhone,departureAddress:document.fields.departureAddress,arrivalAddress:document.fields.arrivalAddress,moveDate:document.fields.departureStart} : {}), items, taxRate, depositRate, validUntil, notes:text(payload.notes,5000,'Notes'),
    ...quoteTotals(items,taxRate,depositRate), updatedAt:new Date().toISOString(), revision:current.revision+1};
}
