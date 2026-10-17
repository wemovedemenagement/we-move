import {normalizeAbsences,resourceAbsence,absenceLabels} from '../shared/resourceAvailability.mjs';
import {normalizeMoveOperations} from './crmMoveOperations.mjs';
import {normalizeMoveClosure} from './crmMoveClosure.mjs';
import { randomUUID } from 'node:crypto';
import { draftError } from './crmDraftModel.mjs';
export const emptyRegistry = () => ({ revision: 0, resources: [] });
export function reviseRegistry(current, payload, actor, bookings=[]) {
  if (actor.role !== 'gerant')
    draftError(403, 'Le gérant administre les ressources.');
  if (!payload || payload.revision !== current.revision)
    draftError(409, 'Le registre a changé. Fermez puis rouvrez la ressource avant de réessayer.');
  if (
    Object.keys(payload).some(
      (k) =>
        !['revision', 'id', 'name', 'kind', 'active', 'detail', 'unavailablePeriods', 'capacityM3'].includes(k),
    )
  )
    draftError(400, 'Champ de ressource invalide.');
  const previous = payload.id
    ? current.resources.find((r) => r.id === payload.id)
    : null;
  if (payload.id && !previous) draftError(404, 'Ressource introuvable.');
  if (
    typeof payload.name !== 'string' ||
    !payload.name.trim() ||
    payload.name.length > 100 ||
    typeof payload.detail !== 'string' ||
    payload.detail.length > 200 ||
    !['vehicle', 'person', 'lift'].includes(payload.kind) ||
    typeof payload.active !== 'boolean'
  )
    draftError(400, 'Nom, type ou disponibilité invalide.');
  if (previous && previous.kind !== payload.kind)
    draftError(
      400,
      'Le type d’une ressource existante ne peut pas être changé.',
    );
  const capacityM3=payload.capacityM3===undefined?previous?.capacityM3??null:payload.capacityM3;
  if(capacityM3!==null&&(payload.kind!=='vehicle'||typeof capacityM3!=='number'||!Number.isFinite(capacityM3)||capacityM3<0.01||capacityM3>200||Math.abs(capacityM3*100-Math.round(capacityM3*100))>0.000001))
    draftError(400,'La capacité du véhicule doit être comprise entre 0,01 et 200 m³, avec deux décimales maximum.');
  if (
    current.resources.some(
      (r) =>
        r.id !== payload.id &&
        r.kind === payload.kind &&
        r.name.toLocaleLowerCase('fr') ===
          payload.name.trim().toLocaleLowerCase('fr'),
    )
  )
    draftError(409, 'Cette ressource existe déjà.');
  if (!previous && current.resources.length >= 300)
    draftError(400, 'Limite du registre atteinte.');
  const unavailablePeriods=normalizeAbsences(payload.unavailablePeriods===undefined?previous?.unavailablePeriods||[]:payload.unavailablePeriods);
  const conflict=bookings.find(b=>!b.cancelled&&b.resourceIds.includes(previous?.id)&&resourceAbsence({unavailablePeriods},b.start,b.end));
  if(conflict)draftError(409,'Cette indisponibilité chevauche la mission de '+conflict.clientName+'. Réaffectez ou déplacez la mission avant de bloquer ce créneau.');
  const resource = {
    unavailablePeriods,
    id: previous?.id || randomUUID(),
    name: payload.name.trim(),
    kind: payload.kind,
    detail: payload.detail.trim(),
    ...(payload.kind==='vehicle'?{capacityM3}:{}),
    active: payload.active,
    updatedAt: new Date().toISOString(),
    updatedBy: actor.email || actor.name,
  };
  const result = {
    revision: current.revision + 1,
    resources: [
      ...current.resources.filter((r) => r.id !== resource.id),
      resource,
    ],
  };
  if(Buffer.byteLength(JSON.stringify(result),"utf8")>750000)draftError(400,"Le registre est trop volumineux. Retirez des indisponibilités anciennes avant de continuer.");
  return result;
}
function validTime(value) {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value) &&
    Number.isFinite(Date.parse(value + 'Z')) &&
    new Date(value + 'Z').toISOString().slice(0, 16) === value
  );
}
export function makeBooking(lead, current, others, registry, payload, actor) {
  if (!['gerant', 'secretaire'].includes(actor.role))
    draftError(403, 'Planification réservée au gérant et au secrétariat.');
  if (!lead) draftError(404, 'Dossier introuvable.');
  if (
    !payload ||
    Object.keys(payload).some(
      (k) => !['revision', 'start', 'end', 'resourceIds', 'cancel', 'operations', 'closure'].includes(k),
    )
  )
    draftError(400, 'Planification invalide.');
  if (payload.revision !== (current?.revision || 0))
    draftError(409, 'Cette mission a changé. Actualisez avant de réessayer.');
  const now = new Date().toISOString();
  if (payload.closure !== undefined) {
    if(Object.keys(payload).some(k=>!['revision','closure'].includes(k))) draftError(400,'Enregistrez séparément la préparation et la clôture.');
    if(!current||current.cancelled||!['confirme','termine'].includes(lead.status)) draftError(409,'Une mission active et acceptée est nécessaire.');
    return {...current,closure:normalizeMoveClosure(payload.closure,actor),revision:current.revision+1,updatedAt:now,updatedBy:actor.email||actor.name};
  }
  if(current?.closure) draftError(409,'Cette mission est réalisée. Son compte rendu reste modifiable.');
  if (payload.cancel === true) {
    if (!current || current.cancelled)
      draftError(409, 'Aucune réservation active.');
    return {
      ...current,
      cancelled: true,
      revision: current.revision + 1,
      updatedAt: now,
      updatedBy: actor.email || actor.name,
    };
  }
  if (lead.status !== 'confirme')
    draftError(
      409,
      'Le dossier doit être accepté avant de réserver les ressources.',
    );
  if (
    !validTime(payload.start) ||
    !validTime(payload.end) ||
    payload.end <= payload.start
  )
    draftError(
      400,
      'Choisissez un début et une fin valides, à l’heure de Paris.',
    );
  if (
    !Array.isArray(payload.resourceIds) ||
    !payload.resourceIds.length ||
    payload.resourceIds.length > 50 ||
    new Set(payload.resourceIds).size !== payload.resourceIds.length
  )
    draftError(400, 'Sélectionnez les ressources de la mission.');
  const resources = payload.resourceIds.map((id) =>
    registry.resources.find((r) => r.id === id),
  );
  if (resources.some((r) => !r || !r.active))
    draftError(409, 'Une ressource est indisponible. Actualisez le registre.');
  const absent=resources.find(r=>resourceAbsence(r,payload.start,payload.end));
  if(absent){const period=resourceAbsence(absent,payload.start,payload.end);draftError(409,absent.name+' : '+absenceLabels[period.reason]+' du '+period.start.replace('T',' à ')+' au '+period.end.replace('T',' à ')+'. Choisissez une autre ressource ou un autre créneau.');}
  if (!resources.some((r) => r.kind === 'vehicle'))
    draftError(400, 'Sélectionnez au moins un véhicule.');
  const conflict = others.find(
    (b) =>
      b.leadId !== lead.id &&
      !b.cancelled &&
      b.start < payload.end &&
      b.end > payload.start &&
      b.resourceIds.some((id) => payload.resourceIds.includes(id)),
  );
  if (conflict)
    draftError(
      409,
      `Une ressource est déjà réservée du ${conflict.start.replace('T', ' à ')} au ${conflict.end.replace('T', ' à ')}. Choisissez un autre créneau ou une autre ressource.`,
    );
  return {
    leadId: lead.id,
    clientName: lead.fullName,
    start: payload.start,
    end: payload.end,
    resourceIds: payload.resourceIds,
    resources: resources.map(({ id, name, kind }) => ({ id, name, kind })),
    operations: normalizeMoveOperations(payload.operations,current?.operations),
    cancelled: false,
    revision: (current?.revision || 0) + 1,
    updatedAt: now,
    updatedBy: actor.email || actor.name,
  };
}
export function applyBooking(lead, booking, actor) {
  return {
    ...lead,
    ...(booking.closure ? {status:'termine'} : {}),
    scheduledTime: booking.cancelled ? '' : booking.start,
    scheduledEnd: booking.cancelled ? '' : booking.end,
    assignedTruckId: booking.cancelled
      ? ''
      : booking.resources.find((r) => r.kind === 'vehicle')?.id || '',
    assignedTruckName: booking.cancelled
      ? ''
      : booking.resources
          .filter((r) => r.kind === 'vehicle')
          .map((r) => r.name)
          .join(', '),
    assignedDriver: '',
    teamMembers: booking.cancelled
      ? []
      : booking.resources.filter((r) => r.kind === 'person').map((r) => r.name),
    assignedEquipment: booking.cancelled
      ? []
      : booking.resources.filter((r) => r.kind === 'lift').map((r) => r.name),
    updatedAt: booking.updatedAt,
    internalNotes: [
      {
        id: randomUUID(),
        author: actor.name,
        createdAt: booking.updatedAt,
        content: booking.closure ? (booking.closure.followUp && !booking.closure.resolved ? 'Mission réalisée · suivi à traiter : '+booking.closure.followUp+' · '+booking.closure.owner+' · '+booking.closure.due : 'Mission clôturée · compte rendu complet. Préparation de facturation à vérifier.') : booking.cancelled
          ? 'Réservation annulée, ressources libérées.'
          : `Mission planifiée du ${booking.start.replace('T', ' à ')} au ${booking.end.replace('T', ' à ')} : ${booking.resources.map((r) => r.name).join(', ')}.`,
      },
      ...(lead.internalNotes || []),
    ],
  };
}
