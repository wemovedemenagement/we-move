import {spawn} from 'node:child_process';
import {createRequire} from 'node:module';
import {mkdir,writeFile} from 'node:fs/promises';
import {target,parseDeploymentArgs,rolloutArgs,runVerifiedDeployment} from './crm-deployment-policy.mjs';

const options = parseDeploymentArgs(process.argv.slice(2));
if (Number(process.versions.node.split('.')[0]) < 24) throw new Error('Node 24 ou supérieur requis pour cet outil de publication.');
process.env.CRM_FIREBASE_CLI_ACCOUNT = 'wemove.demenagement@gmail.com';
const {mailSecretClient} = await import('../server/crmMailSecret.mjs');
const client = mailSecretClient();
const auth = await client.auth.getClient();
const require = createRequire(import.meta.url);
const apphosting = 'https://firebaseapphosting.googleapis.com/v1beta/';
const backendName = `projects/${target.project}/locations/${target.region}/backends/${target.backend}`;
const request = async (url,method='GET',data) => (await auth.request({url,method,data,timeout:30000,retry:false})).data;
async function capture(command,args,env=process.env) {
  return new Promise((resolve,reject) => {
    const child=spawn(command,args,{env,stdio:['ignore','pipe','pipe'],shell:false});let output='';
    child.stdout.setEncoding('utf8');child.stdout.on('data',chunk=>{output+=chunk;});
    child.stderr.resume();
    child.once('error',()=>reject(new Error('GitHub CLI indisponible.')));
    child.once('exit',code=>code===0?resolve(output):reject(new Error('Lecture GitHub impossible ; vérifier la connexion du compte WE MOVE.')));
  });
}
const io = {
  async readCi(commit) {
    const token=(await capture('gh',['auth','token','--hostname','github.com','--user','wemovedemenagement'])).trim();
    return JSON.parse(await capture('gh',['run','list','--repo','wemovedemenagement/we-move','--workflow','validate.yml','--branch','main','--commit',commit,'--limit','20','--json','databaseId,headSha,headBranch,workflowName,createdAt,status,conclusion,url'],{...process.env,GH_TOKEN:token}));
  },
  async readCloud() {
    const [policy,database,backend,run] = await Promise.all([
      request(`https://cloudresourcemanager.googleapis.com/v1/projects/${target.project}:getIamPolicy`,'POST',{options:{requestedPolicyVersion:3}}),
      request(`https://firestore.googleapis.com/v1/projects/${target.project}/databases/(default)`),
      request(apphosting + backendName),
      request(`https://run.googleapis.com/v2/projects/${target.project}/locations/${target.region}/services/${target.backend}`),
    ]);
    return {policy,database,backend,run};
  },
  async launch(commit) {
    console.log('Contrôles préalables réussis. Publication GitHub du commit ' + commit + '.');
    const cli = require.resolve('firebase-tools/lib/bin/firebase.js');
    await new Promise((resolve,reject) => {
      const child = spawn(process.execPath,['--use-env-proxy',cli,...rolloutArgs(commit)],{stdio:'inherit',shell:false});
      child.once('error',reject);child.once('exit',(code,signal) => code===0?resolve():reject(new Error('Publication interrompue : '+(signal||code))));
    });
  },
  async readPublished() {
    const traffic = await request(apphosting + backendName + '/traffic');
    const name = traffic.current?.splits?.[0]?.build;
    if (!/^projects\/(wemove-b0057|694105269612)\/locations\/europe-west4\/backends\/we-move\/builds\/[^/]+$/.test(name||'')) throw new Error('Build courant introuvable dans le backend attendu.');
    return {traffic,build: await request(apphosting + name)};
  },
  async checkPublic() {
    const read = path => fetch(target.origin+path,{redirect:'error',signal:AbortSignal.timeout(30000)});
    const html = await read('/crm/');const text = await html.text();
    const entry = text.match(/src="(\/assets\/index-[A-Za-z0-9_-]+\.js)"/)?.[1];
    if (html.status!==200 || !entry || !/no-store/.test(html.headers.get('cache-control')||'')) throw new Error('HTML public du CRM ou cache inattendu.');
    const asset = await read(entry);await asset.arrayBuffer();if(!asset.ok)throw new Error('Asset principal inaccessible.');
    const config = await read('/api/crm/auth-config');if(!config.ok || (await config.json()).totpAvailable!==false)throw new Error('Configuration publique MFA inattendue.');
    const privateApi = await read('/api/crm/session');await privateApi.arrayBuffer();
    if(privateApi.status!==401 || !/no-store/.test(privateApi.headers.get('cache-control')||''))throw new Error('Protection de la session CRM inattendue.');
    return {htmlStatus:html.status,entry,anonymousSessionStatus:privateApi.status,cache:'no-store',totpAvailable:false};
  },
};
const startedAt = new Date().toISOString();
try {
  const result = await runVerifiedDeployment(options,io);
  const report = {startedAt,finishedAt:new Date().toISOString(),status:'passed',...result};
  await mkdir('tmp',{recursive:true});await writeFile('tmp/crm-deployment-latest.json',JSON.stringify(report,null,2)+'\n');
  console.log(JSON.stringify(report));
} catch(error) {
  await mkdir('tmp',{recursive:true});
  await writeFile('tmp/crm-deployment-latest.json',JSON.stringify({startedAt,finishedAt:new Date().toISOString(),status:'failed',commit:options.commit,error:error.message},null,2)+'\n');
  console.error(error.message);process.exitCode=1;
} finally { await client.close(); }
