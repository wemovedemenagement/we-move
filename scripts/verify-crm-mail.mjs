import '../server/crmEnvironment.mjs';
import nodemailer from 'nodemailer';
import {mailConfiguration} from '../server/crmMail.mjs';
if(!(await mailConfiguration()).ready){console.log('Configuration e-mail incomplète. Aucun e-mail envoyé.');process.exitCode=1;}
else if(process.env.CRM_MAIL_PROVIDER==='resend'){console.log('Clé dédiée accessible dans Secret Manager. Validation du domaine et envoi réel restent à vérifier. Aucun e-mail envoyé.');}
else{
 const port=Number(process.env.CRM_SMTP_PORT||465);
 const transport=nodemailer.createTransport({host:process.env.CRM_SMTP_HOST,port,secure:port===465,requireTLS:true,auth:{user:process.env.CRM_SMTP_USER,pass:process.env.CRM_SMTP_PASSWORD},connectionTimeout:15000,greetingTimeout:15000,socketTimeout:15000,logger:false,debug:false});
 try{await transport.verify();console.log('Connexion TLS et authentification SMTP vérifiées. Aucun e-mail envoyé.');}
 catch(e){console.log('Vérification SMTP non aboutie ('+(/^[A-Z_]+$/.test(e.code||'')?e.code:'connexion')+'). Aucun e-mail envoyé.');process.exitCode=1;}
 finally{transport.close();}
}
