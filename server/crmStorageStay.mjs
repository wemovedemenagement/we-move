import {randomUUID} from 'node:crypto';
import {draftError,draftId} from './crmDraftModel.mjs';
import {parisToday} from '../shared/followUp.mjs';
import {storageStates,storageFields} from '../shared/storageStays.mjs';

export function reviseStorageStay(current,lead,payload,actor){
 if(!['gerant','secretaire'].includes(actor?.role))draftError(403,'Le suivi du stockage est réservé au gérant et au secrétariat.');
 if(!lead)draftError(404,'Dossier client introuvable.');
 if(!payload||typeof payload!=='object'||Array.isArray(payload)||Object.keys(payload).some(k=>!['id','leadId','revision','reason',...Object.keys(storageFields)].includes(k)))draftError(400,'Séjour de stockage invalide.');
 draftId(payload.id);draftId(payload.leadId);
 if(payload.leadId!==lead.id||current&&(current.leadId!==payload.leadId||current.id!==payload.id))draftError(400,'Le dossier lié à un séjour ne peut pas être changé.');
 if(payload.revision!==(current?.revision||0))draftError(409,'Ce séjour a été modifié ailleurs. Fermez puis rouvrez sa fiche.');
 if(!current&&lead.status==='refuse')draftError(409,'Ce dossier est non retenu. Vérifiez son avancement avant de créer un séjour.');
 if(!Object.hasOwn(storageStates,payload.status))draftError(400,'État de stockage invalide.');
 const allowed=current?{prevu:['prevu','stocke','annule'],stocke:['stocke','sorti'],sorti:['sorti'],annule:['annule']}[current.status]:['prevu','stocke'];
 if(!allowed.includes(payload.status))draftError(409,'Ce changement d’état ne correspond pas aux mouvements déjà enregistrés.');
 const terminal=current&&['sorti','annule'].includes(current.status);
 const text=(key,max)=>{if(typeof payload[key]!=='string'||payload[key].length>max)draftError(400,`${storageFields[key]||key} invalide.`);return payload[key].trim();};
 const reason=text('reason',500);
 if(terminal&&(actor.role!=='gerant'||!reason))draftError(403,'La correction d’un séjour finalisé est réservée au gérant, avec un motif.');
 const record={id:payload.id,leadId:lead.id,clientName:lead.fullName,status:payload.status,site:text('site',160),location:text('location',160),goods:text('goods',3000),notes:text('notes',3000)};
 if(payload.volume!==null&&(typeof payload.volume!=='number'||!Number.isFinite(payload.volume)||payload.volume<=0||payload.volume>1000||Math.abs(payload.volume*100-Math.round(payload.volume*100))>0.00001))draftError(400,'Indiquez un volume à stocker positif, de 1 000 m³ maximum.');
 record.volume=payload.volume;
 for(const key of ['expectedEntry','expectedExit','actualEntry','actualExit']){
   record[key]=text(key,10);
   if(record[key]&&(!/^\d{4}-\d{2}-\d{2}$/.test(record[key])||!Number.isFinite(Date.parse(record[key]))||new Date(record[key]).toISOString().slice(0,10)!==record[key]))draftError(400,'Date de stockage invalide.');
 }
 const today=parisToday();
 if(record.actualEntry>today||record.actualExit>today)draftError(400,'Les mouvements réels ne peuvent pas être enregistrés dans le futur.');
 if(record.expectedEntry&&record.expectedExit&&record.expectedExit<record.expectedEntry||record.actualEntry&&record.actualExit&&record.actualExit<record.actualEntry)draftError(400,'La sortie ne peut pas précéder l’entrée.');
 if(['stocke','sorti'].includes(record.status)&&(!record.actualEntry||!record.site||!record.location||!record.volume||!record.goods))draftError(400,'Pour confirmer l’entrée, précisez la date réelle, le site, l’emplacement, le volume et les biens confiés.');
 if(record.status==='sorti'&&!record.actualExit)draftError(400,'Indiquez la date réelle de restitution.');
 if(record.status==='stocke'&&record.actualExit||['prevu','annule'].includes(record.status)&&(record.actualEntry||record.actualExit))draftError(400,'Les dates réelles doivent correspondre à l’état du séjour.');
 const at=new Date().toISOString(),by=actor.email||actor.name;
 const stay={...record,revision:(current?.revision||0)+1,createdAt:current?.createdAt||at,createdBy:current?.createdBy||by,updatedAt:at,updatedBy:by};
 const changes=Object.keys(storageFields).filter(k=>(current?.[k]??null)!==(stay[k]??null)).map(field=>({field,from:current?.[field]??null,to:stay[field]}));
 const event={revision:stay.revision,at,actor:by,status:stay.status,reason,changes};
 const updatedLead={...lead,storageRequired:true,storageRevision:(lead.storageRevision||0)+1,updatedAt:at,internalNotes:[{id:randomUUID(),author:actor.name||actor.email,createdAt:at,content:`Garde-meubles · ${storageStates[stay.status]} · ${stay.site||'site à préciser'} · ${stay.volume===null?'volume à préciser':stay.volume+' m³'}.`},...(lead.internalNotes||[])]};
 return {stay,event,lead:updatedLead};
}
export function historyBefore(value){if(value===undefined)return Number.MAX_SAFE_INTEGER;const n=Number(value);if(!Number.isSafeInteger(n)||n<1)draftError(400,'Page d’historique invalide.');return n;}
