import {useEffect,useState,type ReactNode} from 'react';
import {ShieldCheck,LoaderCircle} from 'lucide-react';
import {Logo} from './Logo';
import type {CrmIdentity} from '../types/crm';
import {fetchCrmIdentity,setCrmTokenProvider} from '../services/crmService';
let authPromise:Promise<import('firebase/auth').Auth>|null=null;
async function firebaseAuth(){
  if(!authPromise)authPromise=(async()=>{
    const [app,authSdk,response]=await Promise.all([import('firebase/app'),import('firebase/auth'),fetch('/api/crm/auth-config',{cache:'no-store'})]);
    const data=await response.json();if(!response.ok||!data.config)throw new Error('Configuration de connexion indisponible.');
    const auth=authSdk.getAuth(app.getApps().length?app.getApp():app.initializeApp(data.config));
    await authSdk.setPersistence(auth,authSdk.browserSessionPersistence);
    await auth.authStateReady();
    setCrmTokenProvider(async()=>auth.currentUser?auth.currentUser.getIdToken():null);
    return auth;
  })().catch(error=>{authPromise=null;throw error;});
  return authPromise;
}
export default function CrmSessionGate({children}:{children:(identity:CrmIdentity,connect:()=>void,logout:()=>void)=>ReactNode}){
  const [identity,setIdentity]=useState<CrmIdentity|null>(null),[checking,setChecking]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{let alive=true;void(async()=>{try{const auth=await firebaseAuth();const session=await fetchCrmIdentity();if(alive)setIdentity(session);}catch{if(alive)setError('Connectez-vous avec le compte autorisé de votre entreprise.');}finally{if(alive)setChecking(false);}})();return()=>{alive=false;};},[]);
  const connect=async()=>{
    setBusy(true);setError('');
    try{const auth=await firebaseAuth();const sdk=await import('firebase/auth');const provider=new sdk.GoogleAuthProvider();provider.setCustomParameters({prompt:'select_account'});await sdk.signInWithPopup(auth,provider);setIdentity(await fetchCrmIdentity());}
    catch(e){const code=(e as {code?:string}).code;setError(code==='auth/popup-closed-by-user'?'Connexion annulée.':code==='auth/operation-not-allowed'||code==='auth/configuration-not-found'?'La connexion Google doit encore être activée dans Firebase.':code==='auth/unauthorized-domain'?'Ce domaine doit être autorisé dans Firebase Authentication.':e instanceof Error?e.message:'Connexion impossible.');}
    finally{setBusy(false);}
  };
  const logout=async()=>{try{const auth=await firebaseAuth();await(await import('firebase/auth')).signOut(auth);}finally{setIdentity(null);setError('');}};
  if(checking)return <div className="min-h-screen grid place-items-center bg-slate-50"><h1 className="sr-only">Votre espace We Move</h1><p role="status" className="flex items-center gap-3 text-sm text-slate-500"><LoaderCircle size={18} className="animate-spin"/>Vérification de votre accès…</p></div>;
  if(identity)return <>{error&&<p role="alert" className="bg-rose-50 p-3 text-center text-sm text-rose-700">{error}</p>}{children(identity,()=>void connect(),()=>void logout())}</>;
  return <main className="min-h-screen grid place-items-center bg-[#f3f6f8] p-5"><section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8"><Logo size="sm"/><ShieldCheck className="mt-9 text-sky-700" size={25}/><h1 className="mt-4 text-2xl font-semibold text-slate-900">Votre espace We Move</h1><p className="mt-3 text-sm leading-7 text-slate-500">Connectez-vous avec votre compte professionnel autorisé.</p>{error&&<p role="alert" className="mt-4 text-sm text-rose-700">{error}</p>}<button disabled={busy} onClick={()=>void connect()} className="mt-7 min-h-12 w-full rounded-xl bg-[#193e50] px-5 text-sm font-semibold text-white">{busy?'Connexion…':'Continuer avec Google'}</button></section></main>;
}
