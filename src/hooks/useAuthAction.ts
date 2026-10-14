import {useRef,useState} from 'react';
import type {MultiFactorError,MultiFactorResolver} from 'firebase/auth';
import {authError,firebaseAuth} from '../services/crmAuth';
// A successful second factor resumes the pending operation, never grants access by itself.
export function useAuthAction(){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  const [resolver,setResolver]=useState<MultiFactorResolver|null>(null);
  const continuation=useRef<()=>Promise<void>>(async()=>{}),lock=useRef(false);
  const run=async(operation:()=>Promise<unknown>,complete:()=>Promise<void>=async()=>{})=>{
    if(lock.current)return;lock.current=true;setBusy(true);setError('');
    try{await operation();await complete();}
    catch(e){if((e as {code?:string}).code==='auth/multi-factor-auth-required'){
      const sdk=await import('firebase/auth');const next=sdk.getMultiFactorResolver(await firebaseAuth(),e as MultiFactorError);
      if(!next.hints.some(h=>h.factorId==='totp'))setError('Ce compte utilise une méthode de vérification non prise en charge ici. Contactez le gérant.');
      else{continuation.current=complete;setResolver(next);}
    }else setError(authError(e));}
    finally{lock.current=false;setBusy(false);}
  };
  const verify=async(factorId:string,code:string)=>{
    if(!resolver||lock.current)return;lock.current=true;setBusy(true);setError('');
    try{const sdk=await import('firebase/auth');await resolver.resolveSignIn(sdk.TotpMultiFactorGenerator.assertionForSignIn(factorId,code));setResolver(null);const complete=continuation.current;continuation.current=async()=>{};await complete();}
    catch(e){setError(authError(e));}finally{lock.current=false;setBusy(false);}
  };
  const cancel=()=>{if(lock.current)return;setResolver(null);setError('');continuation.current=async()=>{};};
  return {busy,error,setError,resolver,run,verify,cancel};
}
