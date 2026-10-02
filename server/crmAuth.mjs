import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {getApps, initializeApp, applicationDefault, refreshToken} from 'firebase-admin/app';
import {getAuth} from 'firebase-admin/auth';
import './crmEnvironment.mjs';
export function crmMembers() {
  return JSON.parse(readFileSync(new URL('./crmAccess.json',import.meta.url),'utf8').replace(/^\uFEFF/,'')).filter(user=>user.active && ['gerant','commercial','secretaire'].includes(user.role));
}
export function memberForIdentity(token) {
  if (!token.email_verified || typeof token.email !== 'string') return null;
  return crmMembers().find(member=>member.email.toLowerCase()===token.email.toLowerCase()) || null;
}
function firebaseAuth() {
  const name='wemove-crm-auth';const existing=getApps().find(app=>app.name===name);if(existing)return getAuth(existing);
  const projectId=process.env.FIREBASE_PROJECT_ID||JSON.parse(process.env.FIREBASE_CONFIG||'{}').projectId;
  let credential;
  if(process.env.CRM_FIREBASE_CLI_ACCOUNT){
    if(process.env.K_SERVICE||process.env.NODE_ENV==='production')throw new Error('Session CLI interdite en production');
    const require=createRequire(import.meta.url),auth=require('firebase-tools/lib/auth.js'),api=require('firebase-tools/lib/api.js');
    const account=auth.findAccountByEmail(process.env.CRM_FIREBASE_CLI_ACCOUNT);
    if(!account?.tokens?.refresh_token)throw new Error('Session Firebase locale absente');
    credential=refreshToken({type:'authorized_user',client_id:api.clientId(),client_secret:api.clientSecret(),refresh_token:account.tokens.refresh_token});
  }else credential=applicationDefault();
  return getAuth(initializeApp({projectId,credential},name));
}
export function localCrmAccess(req) {
  const local=['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress);
  const host=/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(req.get('host')||'');
  const origin=req.get('origin');
  return !process.env.K_SERVICE && process.env.NODE_ENV!=='production' && process.env.CRM_LOCAL_ACCESS==='true' && local && host && (!origin||origin==='http://'+req.get('host'));
}
export async function authenticateCrm(req,res,next){
  try{
    const bearer=req.get('authorization');
    if(bearer){
      if(!bearer.startsWith('Bearer '))return res.status(401).json({success:false,error:'Connexion requise.'});
      const token=await firebaseAuth().verifyIdToken(bearer.slice(7),true);
      const member=memberForIdentity(token);
      if(!member)return res.status(403).json({success:false,error:'Ce compte n’est pas autorisé à accéder au CRM.'});
      req.crmIdentity={mode:'firebase',id:member.id,name:member.name,email:member.email,role:member.role};return next();
    }
    if(localCrmAccess(req)){req.crmIdentity={mode:'local',id:null,name:'Accès local',email:null,role:'gerant'};return next();}
    return res.status(401).json({success:false,error:'Connectez-vous avec votre compte autorisé.'});
  }catch{return res.status(401).json({success:false,error:'Session expirée ou invalide. Reconnectez-vous.'});}
}
export const firebaseWebConfig={projectId:'wemove-b0057',appId:'1:694105269612:web:a2f6342574aaeaf2dbff49',apiKey:'AIzaSyChmZd6_5r06-B4UqGXX59B8KzzunFkJzw',authDomain:'wemove-b0057.firebaseapp.com'};
