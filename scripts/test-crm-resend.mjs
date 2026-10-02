import assert from 'node:assert/strict';
import {resendSend} from '../server/crmResend.mjs';
const message={from:{address:'sender@example.invalid'},to:{address:'client@example.invalid'},subject:'Test',text:'Texte',html:'<p>Texte</p>',messageId:'<id@example.invalid>',attachments:[{filename:'test.pdf',content:Buffer.from('%PDF-test')}]};
let calls=0;
const options={keyReader:async()=> 're_test_only',fetcher:async(url,init)=>{
 calls++;assert.equal(url,'https://api.resend.com/emails');assert.equal(init.redirect,'error');assert.equal(init.headers.Authorization,'Bearer re_test_only');assert.match(init.headers['Idempotency-Key'],/^quote-[a-f0-9]{64}$/);
 const body=JSON.parse(init.body);assert.equal(body.html,message.html);assert.equal(body.text,message.text);assert.equal(body.reply_to,message.from.address);assert.deepEqual(body.to,[message.to.address]);assert.equal(body.attachments[0].content,message.attachments[0].content.toString('base64'));return {ok:true,json:async()=>({id:'test-provider-id'})};
}};
assert.deepEqual(await resendSend(message,options),{accepted:[message.to.address],messageId:'test-provider-id'});assert.equal(calls,1);
for(const status of [400,401,403,422,429])await assert.rejects(resendSend(message,{...options,fetcher:async()=>({ok:false,status,json:async()=>({message:'do not log this'})})}),e=>e.code==='EPROVIDER_REJECTED'&&!e.message.includes('do not log'));
for(const status of [408,409,500,503])await assert.rejects(resendSend(message,{...options,fetcher:async()=>({ok:false,status,json:async()=>null})}),e=>e.code===undefined);
await assert.rejects(resendSend(message,{...options,keyReader:async()=>{throw new Error('Missing secret');}}));assert.equal(calls,1);
console.log('Transport transactionnel vérifié : endpoint fixe HTTPS, destinataire unique, PDF, Reply-To, idempotence et gestion prudente des erreurs. Aucun envoi réel.');
