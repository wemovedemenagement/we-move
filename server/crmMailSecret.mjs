import {SecretManagerServiceClient} from '@google-cloud/secret-manager';
import {createRequire} from 'node:module';
import './crmEnvironment.mjs';
let client,cache;
export function mailSecretClient(){
 if(client)return client;
 const options={};
 if(process.env.CRM_FIREBASE_CLI_ACCOUNT&&!process.env.K_SERVICE&&process.env.NODE_ENV!=='production'){
  const require=createRequire(import.meta.url),auth=require('firebase-tools/lib/auth.js'),api=require('firebase-tools/lib/api.js');
  const account=auth.findAccountByEmail(process.env.CRM_FIREBASE_CLI_ACCOUNT);
  if(!account?.tokens?.refresh_token)throw new Error('Session Google locale indisponible.');
  options.credentials={type:'authorized_user',client_id:api.clientId(),client_secret:api.clientSecret(),refresh_token:account.tokens.refresh_token};
 }
 client=new SecretManagerServiceClient(options);return client;
}
export async function mailApiKey(){
 const name=process.env.CRM_MAIL_API_KEY_SECRET||'';
 const project=process.env.FIREBASE_PROJECT_ID||JSON.parse(process.env.FIREBASE_CONFIG||'{}').projectId||process.env.GOOGLE_CLOUD_PROJECT;
 if(!name.startsWith('projects/'+project+'/secrets/')||!/^projects\/[^/]+\/secrets\/[A-Za-z0-9_-]+\/versions\/[1-9][0-9]*$/.test(name))throw new Error('Référence Secret Manager invalide : utilisez une version numérique explicite.');
 if(cache?.name===name&&cache.until>Date.now())return cache.value;
 const [version]=await mailSecretClient().accessSecretVersion({name},{timeout:10000});
 const value=Buffer.from(version.payload?.data||[]).toString('utf8').trim();
 if(!/^re_[A-Za-z0-9_-]+$/.test(value))throw new Error('Clé d’envoi invalide.');
 cache={name,value,until:Date.now()+300000};return value;
}
