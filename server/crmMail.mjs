import nodemailer from 'nodemailer';
import {createHash,randomUUID} from 'node:crypto';
import {generateCrmPdf} from './crmPdf.mjs';
import {getQuoteDrafts,getQuoteMails,quoteMailTransaction} from './crmStore.mjs';
import {draftError} from './crmDraftModel.mjs';
import {mailApiKey} from './crmMailSecret.mjs';
import {resendSend} from './crmResend.mjs';

const email=/^[^\s<>\r\n,;]+@[^\s<>\r\n,;]+\.[^\s<>\r\n,;]+$/;
export async function mailConfiguration() {
 const from=process.env.CRM_MAIL_FROM||'',host=process.env.CRM_SMTP_HOST||'',port=Number(process.env.CRM_SMTP_PORT||465);
 const provider=process.env.CRM_MAIL_PROVIDER||'smtp';
 if(provider==='resend'){
  let ready=false;try{ready=email.test(from)&&!!(await mailApiKey());}catch{/* Never expose secret-manager errors or credentials to the browser. */}
  return {ready,from,provider,message:ready?'Clé d’envoi dédiée accessible.':'La clé d’envoi dédiée doit être ajoutée à Secret Manager et le domaine validé chez Resend.'};
 }
 if(provider!=='smtp')return {ready:false,from,message:'Service e-mail non configuré.'};
 const ready=email.test(from)&&!!host&&[465,587].includes(port)&&!!process.env.CRM_SMTP_USER&&!!process.env.CRM_SMTP_PASSWORD;
 return {ready,from,message:ready?'Expéditeur configuré.':'L’envoi e-mail doit être configuré par le gérant avant le premier envoi.'};
}
export function sendIssues(d) {
 const f=d.document?.fields||{},issues=[];
 if(!email.test(f.clientEmail||''))issues.push('Renseignez une adresse e-mail client valide.');
 for(const [key,label] of [['clientName','le nom du client'],['clientAddress','l’adresse de facturation'],['departureAddress','l’adresse de chargement'],['arrivalAddress','l’adresse de livraison'],['formula','la formule'],['issueDate','la date du devis'],['departureStart','la période de chargement'],['arrivalStart','la période de livraison'],['guarantee','la garantie'],['coveredValue','la valeur garantie'],['itemLimit','le plafond par objet'],['paymentKind','le versement à la commande'],['balanceWhen','l’échéance du solde']])if(!f[key])issues.push('Complétez '+label+'.');
 const today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Paris',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
 if(!d.validUntil||d.validUntil<today)issues.push('Renseignez une validité non expirée.');
 if(!d.items?.length||d.amountTTC===null||d.amountTTC<=0||d.taxRate===null||d.depositRate===null)issues.push('Vérifiez le chiffrage, la TVA et le taux de versement.');
 return issues;
}
export const publicMail=r=>({id:r.id,revision:r.revision,reference:r.reference,to:r.to,from:r.from,subject:r.subject,message:r.message,state:r.state,createdAt:r.createdAt,acceptedAt:r.acceptedAt||null,actor:r.actor,error:r.error||null});
export async function prepareQuoteMail(id) {
 const d=(await getQuoteDrafts()).find(d=>d.id===id);if(!d)draftError(404,'Devis introuvable.');
 return {revision:d.revision,to:d.document?.fields.clientEmail||'',reference:d.reference,subject:'Votre devis de déménagement — WE MOVE',message:'Bonjour '+d.clientName+',\n\nVous trouverez en pièce jointe votre devis de déménagement et ses annexes.\n\nNous restons à votre disposition pour toute question. Pour confirmer votre projet, merci de nous retourner les documents complétés et signés.\n\nBien cordialement,\nL’équipe WE MOVE',issues:sendIssues(d),configuration:await mailConfiguration(),history:(await getQuoteMails(id)).map(publicMail)};
}
async function smtpSend(message) {
 const port=Number(process.env.CRM_SMTP_PORT||465);
 const transport=nodemailer.createTransport({host:process.env.CRM_SMTP_HOST,port,secure:port===465,requireTLS:true,auth:{user:process.env.CRM_SMTP_USER,pass:process.env.CRM_SMTP_PASSWORD},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:30000,disableFileAccess:true,disableUrlAccess:true,logger:false,debug:false});
 try{return await transport.sendMail(message);}finally{transport.close();}
}
const configuredSend=message=>process.env.CRM_MAIL_PROVIDER==='resend'?resendSend(message):smtpSend(message);
export async function sendQuoteMail(id,payload,actor,{transport=configuredSend,configuration=mailConfiguration}={}) {
 if(!['gerant','commercial','secretaire'].includes(actor?.role))draftError(403,'Accès non autorisé.');
 if(!payload||payload.confirm!==true||!Number.isInteger(payload.revision)||Object.keys(payload).some(k=>!['confirm','revision','subject','message'].includes(k)))draftError(400,'Confirmez l’envoi de la version affichée.');
 if(typeof payload.subject!=='string'||!payload.subject.trim()||payload.subject.length>180||/[\r\n]/.test(payload.subject)||typeof payload.message!=='string'||!payload.message.trim()||payload.message.length>6000)draftError(400,'Vérifiez l’objet et le message.');
 const config=await configuration();if(!config.ready)draftError(409,config.message);
 const d=(await getQuoteDrafts()).find(d=>d.id===id);if(!d)draftError(404,'Devis introuvable.');
 if(d.revision!==payload.revision)draftError(409,'Le devis a changé. Rechargez la préparation de l’envoi.');
 const issues=sendIssues(d);if(issues.length)draftError(400,issues.join(' '));
 const key='revision-'+d.revision,now=new Date().toISOString(),reference=d.reference.replace(/^BR-/,'DEV-')+'-R'+d.revision;
 const snapshot={...d,reference,issuedAt:now};
 const pdf=await generateCrmPdf('devis',snapshot);
 const candidate={id:key,revision:d.revision,reference,to:d.document.fields.clientEmail,from:config.from,subject:payload.subject.trim(),message:payload.message.trim(),state:'sending',createdAt:now,actor:actor.email||actor.name||'Utilisateur CRM',snapshot,pdfBase64:pdf.toString('base64'),sha256:createHash('sha256').update(pdf).digest('hex'),attempt:randomUUID()};
 if(Buffer.byteLength(JSON.stringify(candidate))>900000)draftError(400,'Ce PDF est trop volumineux pour l’archivage sécurisé. Réduisez les textes avant l’envoi.');
 const claim=await quoteMailTransaction(id,key,(current,existing)=>{
  if(current.revision!==payload.revision)draftError(409,'Le devis a changé. Rechargez la préparation de l’envoi.');
  if(existing)return {write:false,record:existing};
  return {write:true,record:candidate};
 });
 if(!claim.write){if(claim.record.state==='accepted')return publicMail(claim.record);draftError(409,'Cette version a déjà une tentative d’envoi. Consultez son historique avant toute nouvelle action.');}
 let info;
 try{
  info=await transport({from:{name:'WE MOVE',address:candidate.from},to:{address:candidate.to},subject:candidate.subject,text:candidate.message,messageId:'<'+candidate.attempt+'@'+candidate.from.split('@')[1]+'>',attachments:[{filename:reference+'.pdf',content:pdf,contentType:'application/pdf'}]});
  if(!info.accepted?.length){const e=new Error('Rejected');e.responseCode=550;throw e;}
 }catch(error){
  const definitelyFailed=['EAUTH','ECONNECTION','EDNS','EENVELOPE','EPROVIDER_REJECTED'].includes(error.code)||(error.responseCode>=400&&error.responseCode<=599);
  const state=definitelyFailed?'failed':'uncertain';
  const message=definitelyFailed?'Le serveur e-mail a refusé l’envoi.':'Résultat incertain : vérifiez la messagerie avant de renvoyer pour éviter un doublon.';
  const result=await quoteMailTransaction(id,key,(current,r)=>({write:true,record:{...r,state,error:message},...(current.revision===r.revision?{summary:{revision:r.revision,state,createdAt:r.createdAt}}:{})}));
  return publicMail(result.record);
 }
 const result=await quoteMailTransaction(id,key,(current,r)=>({write:true,record:{...r,state:'accepted',acceptedAt:new Date().toISOString(),providerId:info.messageId||candidate.attempt},...(current.revision===r.revision?{summary:{revision:r.revision,state:'accepted',acceptedAt:new Date().toISOString(),to:r.to,reference:r.reference}}:{})}));
 return publicMail(result.record);
}
