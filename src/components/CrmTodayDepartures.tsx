import CrmDocumentQueue from './CrmDocumentQueue';
import {useEffect, useState} from 'react';
import {ArrowUpRight, RefreshCw} from 'lucide-react';
import CrmDepartureReadiness from './CrmDepartureReadiness';
import {fetchPlanning, type PlanningData} from '../services/crmService';
import type {QuoteLead,MovePreparationTarget} from '../types/crm';

type Target=MovePreparationTarget;
// Bind planning results to the lead snapshot used for the request. A refresh or
// failed lead read must never leave old preparation counts presented as current.
export default function CrmTodayDepartures({leads,available,today,onOpen,onPlanning}:{leads:QuoteLead[];available:boolean;today:string;onOpen:(lead:QuoteLead,target:Target)=>void;onPlanning:()=>void}) {
  const [snapshot,setSnapshot]=useState<{leads:QuoteLead[];data:PlanningData}|null>(null);
  const [error,setError]=useState(''),[attempt,setAttempt]=useState(0),[loading,setLoading]=useState(true);
  useEffect(()=>{
    let active=true;
    setLoading(true);setError('');
    if(available)void fetchPlanning().then(data=>{if(active)setSnapshot({leads,data});}).catch(e=>{if(active)setError(e instanceof Error?e.message:'Planning indisponible.');}).finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[leads,available,attempt]);
  const current=available&&snapshot?.leads===leads&&!loading&&!error;
  return <section className="crm-today-departures" aria-label="Préparation des prochains déménagements">
    <div className="crm-worklist-head"><div><h3>Vos prochains départs</h3><p>Les points à compléter, sans quitter votre journée.</p></div><button type="button" className="crm-quiet-action" onClick={onPlanning}>Ouvrir le planning<ArrowUpRight size={15}/></button></div>
    <CrmDepartureReadiness initiallyOpen data={current?snapshot.data:null} leads={leads} today={today} loading={!error&&!current} error={!available?'Dossiers non vérifiés.':error} onOpen={onOpen}/>
    <CrmDocumentQueue leads={leads} data={current?snapshot.data:null} loading={!error&&!current} error={!available?'Dossiers non vérifiés.':error} today={today} onOpen={lead=>onOpen(lead,'documents')}/>
    {available&&error&&<button type="button" className="crm-quiet-action" onClick={()=>setAttempt(v=>v+1)}><RefreshCw size={14}/>Actualiser</button>}
  </section>;
}
