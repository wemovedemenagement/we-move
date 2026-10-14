import assert from 'node:assert/strict';
import {createCrmAuthenticator,crmMembers} from '../server/crmAuth.mjs';
const member=crmMembers()[0];assert.ok(member);
const valid={uid:'isolated-test',email:member.email,email_verified:true,firebase:{sign_in_provider:'password'}};
async function attempt({token=valid,factors=[],failure=false,bearer='Bearer test',lookupFailure=false}={}){
 let admitted=false,checkedRevocation=false,lookups=0;
 const auth={verifyIdToken:async(_,revoked)=>{checkedRevocation=revoked;if(failure)throw Error('invalid');return token;},getUser:async()=>{lookups++;if(lookupFailure)throw Error('unavailable');return{multiFactor:{enrolledFactors:factors}};}};
 const req={get:()=>bearer};const res={statusCode:200,status(code){this.statusCode=code;return this;},json(body){this.body=body;return this;}};
 await createCrmAuthenticator(()=>auth)(req,res,()=>{admitted=true;});return{admitted,checkedRevocation,lookups,res,req};
}
let result=await attempt();assert.ok(result.admitted);assert.ok(result.checkedRevocation);assert.equal(result.req.crmIdentity.role,member.role);
result=await attempt({token:{...valid,firebase:{sign_in_provider:'google.com'}}});assert.ok(result.admitted);
result=await attempt({factors:[{factorId:'totp'}]});assert.equal(result.admitted,false);assert.equal(result.res.statusCode,401);
result=await attempt({factors:[{factorId:'totp'}],token:{...valid,firebase:{sign_in_provider:'password',sign_in_second_factor:'totp'}}});assert.ok(result.admitted);assert.ok(result.checkedRevocation);
for(const token of [{...valid,email_verified:false},{...valid,email:'outside@example.invalid'}]){result=await attempt({token});assert.equal(result.admitted,false);assert.equal(result.res.statusCode,403);}
for(const options of [{failure:true},{lookupFailure:true},{bearer:'not-bearer'}]){result=await attempt(options);assert.equal(result.admitted,false);assert.equal(result.res.statusCode,401);}
console.log('Authentification : accès autorisé, e-mail vérifié, révocation, MFA et refus des sessions incomplètes validés.');
