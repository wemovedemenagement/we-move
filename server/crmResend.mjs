import {createHash} from 'node:crypto';
import {mailApiKey} from './crmMailSecret.mjs';
export async function resendSend(message,{fetcher=fetch,keyReader=mailApiKey}={}){
 const key=await keyReader();
 const response=await fetcher('https://api.resend.com/emails',{
  method:'POST',signal:AbortSignal.timeout(30000),redirect:'error',
  headers:{Authorization:'Bearer '+key,'Content-Type':'application/json','Idempotency-Key':'quote-'+createHash('sha256').update(message.messageId).digest('hex')},
  body:JSON.stringify({from:'WE MOVE <'+message.from.address+'>',to:[message.to.address],reply_to:message.from.address,subject:message.subject,text:message.text,...(message.html?{html:message.html}:{}),attachments:message.attachments.map(a=>({filename:a.filename,content:a.content.toString('base64')}))})
 });
 const data=await response.json().catch(()=>null);
 if(!response.ok){const error=new Error('Le prestataire e-mail a refusé la requête.');if(response.status>=400&&response.status<500&&![408,409].includes(response.status))error.code='EPROVIDER_REJECTED';throw error;}
 if(typeof data?.id!=='string'||!data.id)throw new Error('Réponse du prestataire indéterminée.');
 return {accepted:[message.to.address],messageId:data.id};
}
