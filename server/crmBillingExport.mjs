import { billingSummary } from './crmBillingModel.mjs';
import { draftError } from './crmDraftModel.mjs';

export function billingExportPeriod(query) {
  const { from, to, kind } = query;
  const valid = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(v) && Number.isFinite(Date.parse(v)) && new Date(v).toISOString().slice(0,10) === v;
  if (!valid(from) || !valid(to) || from > to || Date.parse(to) - Date.parse(from) > 365 * 86400000)
    draftError(400, 'Choisissez une période valide de 366 jours maximum.');
  if (!['documents', 'payments'].includes(kind)) draftError(400, 'Type d’export invalide.');
  return { from, to, kind };
}

// Protect text cells from spreadsheet formula interpretation; numeric amounts stay numeric.
const cell = value => {
  let text = typeof value === 'number' ? value.toFixed(2).replace('.', ',') : String(value ?? '').replace(/[\r\n\t]/g, ' ');
  if (typeof value !== 'number' && /^[\s\uFEFF]*[=+@-]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
};
const money = cents => (cents || 0) / 100;
const names = {facture:'Facture',acompte:'Acompte',solde:'Solde',avoir:'Avoir'};
export function billingExport(records, query) {
  const { from, to, kind } = billingExportPeriod(query);
  const within = date => date >= from && date <= to;
  const docs = records.filter(d => d.mode === 'live');
  let header, rows;
  if (kind === 'documents') {
    header = ['Numéro','Type','Date émission','Échéance','Client','Facture corrigée','HT signé EUR','TVA signée EUR','TTC signé EUR','Avoirs cumulés TTC EUR à ce jour','Règlements nets EUR à ce jour','Reste à régler EUR à ce jour','À rembourser EUR à ce jour'];
    rows = docs.filter(d => within(d.issueDate)).sort((a,b)=>a.issueDate.localeCompare(b.issueDate)||a.number.localeCompare(b.number)).map(d => {
      const s = billingSummary(d), sign = d.kind === 'avoir' ? -1 : 1;
      return [d.number,names[d.kind]||d.kind,d.issueDate,d.dueDate,d.snapshot.clientName,d.creditNumber,money(sign*d.amountHT),money(sign*d.taxAmount),money(sign*d.amountTTC),money(d.creditedTTC),money(s.paidCents),money(s.dueCents),money(s.refundDueCents)];
    });
  } else {
    header = ['Date mouvement','Numéro document','Client','Identifiant mouvement','Type','Moyen','Référence','Montant signé EUR','État','Montant net retenu EUR','Date annulation','Motif annulation'];
    rows = docs.filter(d=>d.kind!=='avoir').flatMap(d => (d.payments || []).filter(p=>within(p.date)).map(p => {
      const amount = money(p.amountCents) * (p.kind === 'refund' ? -1 : 1);
      return [p.date,d.number,d.snapshot.clientName,p.id,p.kind === 'refund' ? 'Remboursement' : 'Règlement',p.method,p.reference,amount,p.reversedAt ? 'Annulé' : 'Enregistré',p.reversedAt ? 0 : amount,p.reversedAt,p.reversalReason];
    })).sort((a,b)=>String(a[0]).localeCompare(String(b[0]))||String(a[1]).localeCompare(String(b[1])));
  }
  return { count: rows.length, filename: `WE-MOVE-${kind}-${from}-${to}.csv`, csv: '\uFEFF' + [header,...rows].map(row=>row.map(cell).join(';')).join('\r\n') + '\r\n' };
}
