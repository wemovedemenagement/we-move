import {draftError} from './crmDraftModel.mjs';
import {validPlanningTime} from '../shared/resourceAvailability.mjs';

export function normalizeMoveClosure(input, actor) {
  const keys=['actualStart','actualEnd','observations','reservations','letterReceived','missingDocuments','followUp','owner','due','resolved'];
  if(!input || typeof input!=='object' || Array.isArray(input) || Object.keys(input).some(k=>!keys.includes(k))) draftError(400,'Compte rendu invalide.');
  if(!validPlanningTime(input.actualStart)||!validPlanningTime(input.actualEnd)||input.actualEnd<=input.actualStart) draftError(400,'Indiquez les horaires réels de début et de fin.');
  const nowParis=new Intl.DateTimeFormat('sv-SE',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',hour12:false}).format(new Date()).replace(' ','T');
  if(input.actualEnd>nowParis) draftError(400,'Une mission future ne peut pas être terminée.');
  for(const k of ['observations','reservations','missingDocuments','followUp','owner','due']) if(typeof input[k]!=='string'||input[k].length>(k==='owner'?160:k==='due'?16:3000)) draftError(400,'Compte rendu incomplet ou trop long.');
  if(typeof input.letterReceived!=='boolean') draftError(400,'Précisez si la lettre de voiture signée a été reçue.');
  if(input.resolved!==undefined&&typeof input.resolved!=='boolean') draftError(400,'État de suivi invalide.');
  const result=Object.fromEntries(keys.map(k=>[k,typeof input[k]==='string'?input[k].trim():input[k]]));
  result.resolved=input.resolved===true;
  if((!result.letterReceived||result.reservations||result.missingDocuments)&&!result.followUp) draftError(400,'Prévoyez une action pour les réserves ou les documents manquants.');
  if(result.followUp&&(!result.owner||!validPlanningTime(result.due))) draftError(400,'Indiquez le responsable et l’échéance du suivi.');
  if(!result.followUp){result.owner='';result.due='';}
  return {...result,updatedAt:new Date().toISOString(),updatedBy:actor.email||actor.name};
}
