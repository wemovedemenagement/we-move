import {mailSecretClient} from '../server/crmMailSecret.mjs';
// Creates only an empty secret and grants the existing runtime account access to it.
// The actual API key must be entered directly in the Google Cloud console.
const client=mailSecretClient(),project='wemove-b0057',secretId='we-move-mail-sending-key';
const name=`projects/${project}/secrets/${secretId}`;
try{
 try{await client.getSecret({name});}catch(e){if(e.code!==5)throw e;await client.createSecret({parent:`projects/${project}`,secretId,secret:{replication:{userManaged:{replicas:[{location:'europe-west9'}]}},labels:{application:'we-move',usage:'transactional-mail'}}});}
 const [policy]=await client.getIamPolicy({resource:name,options:{requestedPolicyVersion:3}});
 const role='roles/secretmanager.secretAccessor',member=`serviceAccount:firebase-app-hosting-compute@${project}.iam.gserviceaccount.com`;
 const bindings=policy.bindings||[];let binding=bindings.find(b=>b.role===role&&!b.condition);
 if(!binding){binding={role,members:[]};bindings.push(binding);}
 if(!binding.members.includes(member)){binding.members.push(member);await client.setIamPolicy({resource:name,policy:{...policy,bindings}});}
 console.log('Secret dédié préparé à Paris. Accès accordé au compte de service App Hosting sur ce secret uniquement. Aucune clé ni mot de passe importé.');
}catch(e){console.log('Préparation Secret Manager non aboutie (code '+(Number.isInteger(e.code)?e.code:'indisponible')+'). Aucun secret affiché.');process.exitCode=1;}
finally{await client.close();}
