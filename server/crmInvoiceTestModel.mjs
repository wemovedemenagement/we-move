import {draftError} from './crmDraftModel.mjs';
export const initialInvoiceTestState=()=>({mode:'test',session:1,counter:0,revision:0,lastNumber:null});
export function invoiceTestChange(current,payload,invoice,actor){
 if(actor.role!=='gerant')draftError(403,'Action réservée au gérant.');
 if(!payload||!['number','reset'].includes(payload.action)||Object.keys(payload).some(k=>!['action','revision','invoiceId'].includes(k)))draftError(400,'Action de test invalide.');
 if(payload.revision!==current.revision)draftError(409,'Le compteur a changé. Actualisez avant de réessayer.');
 const state={...current,revision:current.revision+1};
 const event={action:payload.action,at:new Date().toISOString(),actor:actor.email||actor.name,session:current.session};
 if(payload.action==='reset'){state.session++;state.counter=0;state.lastNumber=null;}
 else{
  if(!invoice||invoice.status!=='brouillon')draftError(404,'Brouillon introuvable.');
  state.counter++;
  state.lastNumber=`TEST-S${state.session}-${String(state.counter).padStart(5,'0')}`;
  Object.assign(event,{number:state.lastNumber,invoice:structuredClone(invoice),notice:'TEST — SANS VALEUR COMPTABLE'});
 }
 return {state,event};
}
