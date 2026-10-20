import {validPlanningTime} from './resourceAvailability.mjs';

export function closurePendingReasons(value) {
  return [
    !value.letterReceived && 'Lettre de voiture signée non reçue',
    !!value.reservations.trim() && 'Réserves ou incidents signalés',
    !!value.missingDocuments.trim() && 'Documents restant à recevoir',
  ].filter(reason=>typeof reason==='string');
}

export function parisMinute(now=new Date()) {
  return new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(now).replace(' ','T');
}

/** Guidance only: the server remains responsible for permissions and validation.
 * @param {import('../src/services/crmService').MoveClosure} value
 * @param {Date} now
 */
export function closureGuidance(value,now=new Date()) {
  const pendingReasons=closurePendingReasons(value);
  /** @type {{fieldId:string,label:string}[]} */
  const issues=[];
  const add=(fieldId,label)=>{if(!issues.some(issue=>issue.fieldId===fieldId))issues.push({fieldId,label});};
  const startValid=validPlanningTime(value.actualStart),endValid=validPlanningTime(value.actualEnd);
  if(!startValid)add('closure-actualStart','Indiquez le début réel de l’intervention.');
  if(!endValid)add('closure-actualEnd','Indiquez la fin réelle de l’intervention.');
  if(startValid&&endValid&&value.actualEnd<=value.actualStart)add('closure-actualEnd','La fin réelle doit être après le début réel.');
  if(endValid&&value.actualEnd>parisMinute(now))add('closure-actualEnd','Une mission future ne peut pas être terminée.');
  const hasFollowUp=!!value.followUp.trim();
  if((pendingReasons.length||value.owner.trim()||value.due)&&!hasFollowUp)add('closure-followUp','Précisez l’action à traiter, ou retirez le responsable et l’échéance si aucun suivi n’est nécessaire.');
  if(hasFollowUp&&!value.owner.trim())add('closure-owner','Indiquez le responsable du suivi.');
  if(hasFollowUp&&!validPlanningTime(value.due))add('closure-due','Indiquez une échéance valide pour le suivi.');
  return {pendingReasons,needsFollowUp:pendingReasons.length>0,hasFollowUp,issues};
}

export function changeClosure(value,key,next) {
  const affectsFollowUp=['followUp','owner','due','reservations','missingDocuments','letterReceived'].includes(key);
  return {...value,[key]:next,...(affectsFollowUp&&value[key]!==next?{resolved:false}:{})};
}
