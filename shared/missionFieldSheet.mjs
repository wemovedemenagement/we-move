import {missionAgreementReview} from './missionHandover.mjs';
import {parkingStates, emptyMoveOperations} from './moveOperations.mjs';

const text = value => String(value ?? '').trim();
const known = value => text(value) && !['À préciser','À confirmer'].includes(text(value));
export function missionPhoneLink(value) {
  const phone=text(value).replace(/^(\+33)\s*\(0\)/,'$1').replace(/[\s.()\-]/g,'');
  return /^\+?\d{6,15}$/.test(phone) ? 'tel:'+phone : '';
}
export function missionDirections(address) {
  if (!known(address)) return '';
  const params=new URLSearchParams({api:'1',destination:text(address),travelmode:'driving'});
  const url='https://www.google.com/maps/dir/?'+params;
  return url.length<=2048?url:'';
}
export function missionLocalTime(value) {
  const match=/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(value||'');
  return match?`${match[3]}/${match[2]}/${match[1]} à ${match[4]}:${match[5]}`:'À confirmer';
}

// Saved operational data only: no reservation inferred from requested/legacy dates.
/**
 * @param {import('../src/services/crmService').CrmDossier} dossier
 * @param {import('../src/services/crmService').MoveBooking | null} booking
 * @param {import('../src/services/crmService').ResourceRegistry} registry
 */
export function missionFieldSheet(dossier, booking, registry) {
  const lead=dossier.lead, accepted=dossier.acceptance?.quote?.document;
  const reference=accepted || (!dossier.acceptance?dossier.quote?.document:null);
  const fields=reference?.fields || {};
  const referenceLabel=accepted?'Devis accepté':dossier.acceptance?'Copie du devis accepté indisponible':'Devis de travail · à confirmer';
  const access=['departure','arrival'].map(side=>{
    const visit=lead.technicalVisit?.[side];
    const entry=(key,suffix)=>{
      // An explicitly blank visit observation remains unknown, rather than
      // silently taking an older contractual value.
      if(visit)return {label:key==='carry'?'Portage':key==='floor'?'Étage':'Ascenseur',value:known(visit[key])?text(visit[key])+(key==='carry'?' m':''):'À confirmer',source:'Visite'};
      const current=key==='floor'?lead[side+'Floor']:key==='elevator'&&lead[side+'Elevator']===true?'Oui':'';
      return {label:key==='carry'?'Portage':key==='floor'?'Étage':'Ascenseur',value:known(current)?text(current):known(fields[side+suffix])?text(fields[side+suffix])+(key==='carry'?' m':''):'À confirmer',source:known(current)?'Dossier':known(fields[side+suffix])?referenceLabel:''};
    };
    const address=known(lead[side+'Address'])?text(lead[side+'Address']):'';
    return {side,title:side==='departure'?'Chargement':'Déchargement',address,directions:missionDirections(address),
      contact:text(fields[side+'Contact']),phone:text(fields[side+'Phone']),phoneLink:missionPhoneLink(fields[side+'Phone']),code:text(fields[side+'Code']),referenceLabel,
      rows:[entry('floor','Floor'),entry('elevator','Elevator'),entry('carry','Carry')],
      notes:visit?text(visit.notes):text(fields[side+'AccessNotes']),notesSource:visit?'Visite':referenceLabel};
  });
  const operations={...emptyMoveOperations(),...booking?.operations};
  const resources=(booking?.resourceIds || []).map(id=>{
    const saved=booking.resources.find(resource=>resource.id===id),current=registry.resources.find(resource=>resource.id===id);
    return {id,name:saved?.name || current?.name || 'Moyen non retrouvé',kind:saved?.kind || current?.kind || '',
      warning:!current?'Absent du registre actuel':!current.active?'Désactivé dans le registre':''};
  });
  return {access,resources,operations,referenceLabel,formula:text(fields.formula)||'À confirmer',
    volume:!lead.unknownVolume&&Number(lead.volume)>0?`${Number(lead.volume).toLocaleString('fr-FR')} m³`:'À confirmer',
    phone:text(lead.phone),phoneLink:missionPhoneLink(lead.phone),
    state:!booking?'Non planifiée':booking.cancelled?'Réservation annulée':booking.closure?'Mission clôturée':'Mission planifiée',
    active:!!booking&&!booking.cancelled&&!booking.closure,
    start:booking?missionLocalTime(booking.start):'À planifier',end:booking?missionLocalTime(booking.end):'À planifier',
    parking:[{label:'Départ',value:parkingStates[operations.departureParking]||'À vérifier'},{label:'Arrivée',value:parkingStates[operations.arrivalParking]||'À vérifier'}],
    agreementIssues:missionAgreementReview(lead,dossier.quote,dossier.acceptance,booking||null),
    services:(reference?.services || []).filter(row=>row.responsibility==='entreprise'||row.responsibility==='client')};
}
