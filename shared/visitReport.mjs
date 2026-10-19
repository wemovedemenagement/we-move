import {inventoryVolume, visitRooms} from './technicalVisit.mjs';
import {visitChecks} from './visitChecks.mjs';

const number = value => Number(value).toLocaleString('fr-FR', {maximumFractionDigits: 2});
const recorded = value => String(value ?? '').trim() || 'À confirmer';

// Read-only synthesis of the saved visit. Never applies its estimate to the dossier.
export function visitReport(lead) {
  const visit = lead.technicalVisit;
  if (!visit) return null;
  const groups = visitRooms.map(room => {
    const items = visit.items.filter(item => item.room === room);
    return {room, items, volume: number(inventoryVolume(items))};
  }).filter(group => group.items.length);
  const retainedVolume = !lead.unknownVolume && Number(lead.volume) > 0 ? `${number(lead.volume)} m³` : 'À confirmer';
  const estimate = visit.items.length ? `${number(inventoryVolume(visit.items))} m³` : 'Non renseigné';
  const issues = visitChecks(lead, visit).map(issue => issue.label);
  if (retainedVolume === 'À confirmer') issues.push('Volume retenu au dossier à confirmer');
  const status = {programmee:'Programmée', effectuee:'Effectuée'}[lead.visitStatus] || 'Statut non renseigné';
  const type = {domicile:'À domicile', visio:'Visioconférence', telephonique:'Téléphone'}[lead.visitType] || 'Format non renseigné';
  // Dates are saved as local wall time: do not convert them through a UTC timezone.
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(lead.visitDate || '');
  const date = match ? `${match[3]}/${match[2]}/${match[1]} à ${match[4]}:${match[5]}` : 'Date à confirmer';
  const access = ['departure','arrival'].map(side => ({
    title: side === 'departure' ? 'Au départ' : 'À l’arrivée',
    address: recorded(lead[side + 'Address']),
    floor: recorded(visit[side].floor), elevator: recorded(visit[side].elevator),
    carry: String(visit[side].carry ?? '').trim() ? `${visit[side].carry} m` : 'À confirmer',
    notes: visit[side].notes.trim(),
  }));
  const notes = (lead.visitNotes || '').trim();
  const text = [
    'WE MOVE — SYNTHÈSE DE VISITE', `Client : ${recorded(lead.fullName)}`,
    `${status} · ${type} · ${date}`, '',
    `Volume retenu au dossier : ${retainedVolume}`,
    `Estimation de l’inventaire : ${estimate} (indicative)`,
    ...access.flatMap(part => ['', part.title.toUpperCase(), part.address,
      `Étage : ${part.floor} · Ascenseur : ${part.elevator} · Portage : ${part.carry}`,
      ...(part.notes ? [part.notes] : [])]),
    '', 'INVENTAIRE PAR PIÈCE',
    ...(groups.length ? groups.flatMap(group => [
      `${group.room} — ${group.volume} m³`,
      ...group.items.map(item => `${item.quantity} × ${item.label} — ${number(item.quantity * item.unitVolume)} m³`),
    ]) : ['Aucun bien enregistré.']),
    ...(notes ? ['', 'OBSERVATIONS', notes] : []),
    '', 'POINTS À CONFIRMER',
    ...(issues.length ? issues.map(issue => `• ${issue}`) : ['Aucun champ manquant parmi les contrôles du relevé.']),
    '', 'Synthèse interne des données enregistrées. Les conditions contractuelles restent celles du devis accepté.',
  ].join('\n');
  return {groups, retainedVolume, estimate, issues, status, type, date, access, notes, text};
}
