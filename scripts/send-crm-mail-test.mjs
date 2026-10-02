import '../server/crmEnvironment.mjs';
import {randomUUID} from 'node:crypto';
import {mailConfiguration} from '../server/crmMail.mjs';
import {resendSend} from '../server/crmResend.mjs';

// Run only after the owner explicitly authorizes this test and its recipient.
const recipient=process.argv.find(v=>v.startsWith('--to='))?.slice(5);
if(!process.argv.includes('--send')||!recipient||!/^[^\s<>\r\n,;]+@[^\s<>\r\n,;]+\.[^\s<>\r\n,;]+$/.test(recipient)){
 console.log('Indiquez --send et --to=adresse après autorisation du destinataire.');process.exitCode=1;
}else{
 try{
  const config=await mailConfiguration();
  if(!config.ready||config.provider!=='resend')throw new Error('Configuration indisponible');
  const result=await resendSend({from:{address:config.from},to:{address:recipient},subject:'WE MOVE — Test de connexion du CRM',text:'Bonjour,\n\nCeci est un test d’envoi du CRM WE MOVE via Resend. Il ne contient aucune donnée client et ne nécessite aucune action.\n\nWE MOVE',messageId:'<crm-test-'+randomUUID()+'@we-move.fr>',attachments:[]});
  console.log('Message de test accepté par Resend. Identifiant : '+result.messageId+'. La réception reste à confirmer dans la boîte destinataire.');
 }catch{console.log('Le test n’a pas pu être confirmé. Vérifiez le service avant de renouveler l’envoi.');process.exitCode=1;}
}
