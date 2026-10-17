import {useEffect,useState} from 'react';
import {fetchPlanning,type PlanningData} from '../services/crmService';
import type {QuoteLead} from '../types/crm';

// A planning result is usable only with the lead snapshot it was loaded for.
// One read serves both the priority counter and the operational panels.
export function useCrmPlanningSnapshot(leads:QuoteLead[],available:boolean){
  const [snapshot,setSnapshot]=useState<{leads:QuoteLead[];data:PlanningData}|null>(null);
  const [error,setError]=useState(''),[attempt,setAttempt]=useState(0),[loading,setLoading]=useState(true);
  useEffect(()=>{
    let active=true;
    setLoading(true);setError('');
    if(available)void fetchPlanning().then(data=>{if(active)setSnapshot({leads,data});}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Planning indisponible.');}).finally(()=>{if(active)setLoading(false);});
    return()=>{active=false;};
  },[leads,available,attempt]);
  const current=available&&snapshot?.leads===leads&&!loading&&!error;
  return {data:current?snapshot.data:null,error:available?error:'Dossiers non vérifiés.',loading:available&&!error&&!current,retry:()=>setAttempt(value=>value+1)};
}
