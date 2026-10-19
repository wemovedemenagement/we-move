import assert from 'node:assert/strict';
import {target,runtimeRoles,parseDeploymentArgs,rolloutArgs,verifyCloudSnapshot,verifyPublishedBuild,verifyCiRuns,runVerifiedDeployment} from './crm-deployment-policy.mjs';
const commit='a'.repeat(40),repository=`projects/${target.project}/locations/europe-west4/connections/approved/gitRepositoryLinks/${target.repository}`;
const snapshot={
 policy:{bindings:runtimeRoles.map(role=>({role,members:['serviceAccount:'+target.account]}))},
 database:{name:`projects/${target.project}/databases/(default)`,databaseEdition:'STANDARD',locationId:'europe-west9',deleteProtectionState:'DELETE_PROTECTION_ENABLED',pointInTimeRecoveryEnablement:'POINT_IN_TIME_RECOVERY_ENABLED'},
 backend:{name:`projects/${target.project}/locations/europe-west4/backends/we-move`,serviceAccount:target.account,codebase:{repository}},
 run:{template:{serviceAccount:target.account,containers:[{env:Object.entries({CRM_STORAGE:'firestore',FIRESTORE_DATABASE_ID:'(default)',CRM_LOCAL_ACCESS:'false',CRM_BILLING_LIVE_ENABLED:'false'}).map(([name,value])=>({name,value}))}]}},
};
const build={name:`projects/694105269612/locations/europe-west4/backends/we-move/builds/approved`,state:'READY',source:{codebase:{hash:commit,repository}}};
const traffic={current:{splits:[{build:build.name,percent:100}]}};
assert.deepEqual(parseDeploymentArgs([]),{commit:null});assert.deepEqual(parseDeploymentArgs(['--check']),{commit:null});
assert.deepEqual(parseDeploymentArgs(['--commit',commit]),{commit});
assert.deepEqual(parseDeploymentArgs(['--verify',commit]),{commit,verifyOnly:true});
for(const args of [['main'],['--commit','abc1234'],['--commit',commit,'--force'],['--commit','$(malicious)'],['--project','other']])assert.throws(()=>parseDeploymentArgs(args));
const cli=rolloutArgs(commit);assert.equal(cli[0],'apphosting:rollouts:create');assert.ok(!cli.includes('deploy'));assert.equal(cli[cli.indexOf('--git-commit')+1],commit);assert.equal(cli[cli.indexOf('--project')+1],target.project);
assert.equal(verifyCloudSnapshot(snapshot).billingLive,false);
const badRoles=structuredClone(snapshot);badRoles.policy.bindings.push({role:'roles/firebase.sdkAdminServiceAgent',members:['serviceAccount:'+target.account]});
const modifications=[
 s=>s.policy.bindings.pop(),s=>s.policy.bindings[0].condition={expression:'true'},
 s=>s.policy.bindings.push({role:'roles/owner',members:['allUsers']}),
 s=>s.database.deleteProtectionState='DELETE_PROTECTION_DISABLED',
 s=>s.database.pointInTimeRecoveryEnablement='POINT_IN_TIME_RECOVERY_DISABLED',
 s=>s.database.locationId='us-central1',s=>s.database.name='projects/other/databases/(default)',
 s=>s.backend.serviceAccount='other',s=>s.backend.codebase.repository=repository.replace('wemove-b0057','other'),
 s=>s.run.template.serviceAccount='other',
 s=>s.run.template.containers[0].env.find(v=>v.name==='CRM_LOCAL_ACCESS').value='true',
 s=>s.run.template.containers[0].env.find(v=>v.name==='CRM_BILLING_LIVE_ENABLED').value='true',
 s=>s.run.template.containers[0].env.push({name:'CRM_TOTP_AVAILABLE',value:'true'}),
 s=>s.run.template.containers[0].env.push({name:'CRM_TOTP_AVAILABLE',valueSource:{secretKeyRef:{secret:'unknown'}}}),
];
for(const modify of modifications){const s=structuredClone(snapshot);modify(s);assert.throws(()=>verifyCloudSnapshot(s));}
const otherMember=structuredClone(snapshot);otherMember.policy.bindings.push({role:'roles/owner',members:['user:another@example.invalid']});assert.doesNotThrow(()=>verifyCloudSnapshot(otherMember));
assert.equal(verifyPublishedBuild(traffic,build,commit).commit,commit);
const resolvedBuild={...build,source:{codebase:{hash:commit,uri:`https://github.com/wemovedemenagement/we-move/commit/${commit}`}}};
assert.equal(verifyPublishedBuild(traffic,resolvedBuild,commit).commit,commit);
for(const codebase of [{hash:commit},{...build.source.codebase,uri:'https://github.com/other/repo/commit/'+commit},{...resolvedBuild.source.codebase,uri:resolvedBuild.source.codebase.uri+'?unverified=true'},{...resolvedBuild.source.codebase,repository:repository.replace('wemove-b0057','other')}])assert.throws(()=>verifyPublishedBuild(traffic,{...build,source:{codebase}},commit));
for(const changed of [{...build,state:'BUILDING'},{...build,source:{archive:{}}},{...build,source:{codebase:{hash:'b'.repeat(40),repository}}},{...build,source:{codebase:{hash:commit,repository:repository.replace('wemove-b0057','other')}}}])assert.throws(()=>verifyPublishedBuild(traffic,changed,commit));
for(const changed of [{...traffic,reconciling:true},{current:{splits:[{build:build.name,percent:50},{build:'previous',percent:50}]}}])assert.throws(()=>verifyPublishedBuild(changed,build,commit));
let launches=0,reads=0,publicReads=0;
const ci={headSha:commit,headBranch:'main',workflowName:'Validation de livraison',createdAt:'2026-10-19T10:00:00Z',databaseId:1,status:'completed',conclusion:'success',url:'https://github.com/wemovedemenagement/we-move/actions/runs/1'};
assert.equal(verifyCiRuns([ci],commit).conclusion,'success');
for(const runs of [[],[{...ci,headSha:'b'.repeat(40)}],[{...ci,headBranch:'unreviewed'}],[{...ci,conclusion:'failure'}],[ci,{...ci,databaseId:2,createdAt:'2026-10-19T11:00:00Z',status:'in_progress',conclusion:null}]])assert.throws(()=>verifyCiRuns(runs,commit));
const io={readCloud:async()=>{reads++;return snapshot;},readCi:async()=>[ci],launch:async c=>{assert.equal(c,commit);launches++;},readPublished:async()=>({traffic,build}),checkPublic:async()=>{publicReads++;return{htmlStatus:200};}};
await runVerifiedDeployment({commit:null},io);assert.equal(launches,0);assert.equal(reads,1);
assert.equal((await runVerifiedDeployment({commit},io)).published.commit,commit);assert.equal(launches,1);assert.equal(reads,3);
assert.equal((await runVerifiedDeployment({commit,verifyOnly:true},io)).mode,'verify');assert.equal(launches,1);
await assert.rejects(runVerifiedDeployment({commit},{...io,readCloud:async()=>badRoles}),/rôles/);assert.equal(launches,1);
await assert.rejects(runVerifiedDeployment({commit},{...io,readCi:async()=>[{...ci,conclusion:'failure'}]}),/GitHub/);assert.equal(launches,1);
let attempts=0;await assert.rejects(runVerifiedDeployment({commit},{...io,readCloud:async()=>++attempts===1?snapshot:badRoles}),/après tentative/);assert.equal(attempts,2);
attempts=0;await assert.rejects(runVerifiedDeployment({commit},{...io,readCloud:async()=>{attempts++;return snapshot;},launch:async()=>{throw Error('isolated failure');}}),/recontrôlées/);assert.equal(attempts,2);
const callsBefore=publicReads;await assert.rejects(runVerifiedDeployment({commit},{...io,readPublished:async()=>({traffic,build:{...build,state:'BUILDING'}})}));assert.equal(publicReads,callsBefore);
await assert.rejects(runVerifiedDeployment({commit},{...io,checkPublic:async()=>{throw Error('public health failed');}}),/public health failed/);
console.log('Publication : mode lecture seule, commit exact, rôles étendus refusés avant lancement, protections cloud, contrôle après échec, trafic partiel et mauvaise version refusés. Aucun appel cloud ni déploiement réel.');
