import CrmPlanningQueue from './CrmPlanningQueue';
import CrmMissionTimeline from './CrmMissionTimeline';
import CrmDocumentQueue from './CrmDocumentQueue';
import {ArrowUpRight, RefreshCw} from 'lucide-react';
import CrmDepartureReadiness from './CrmDepartureReadiness';
import type {PlanningData} from '../services/crmService';
import type {QuoteLead,MovePreparationTarget} from '../types/crm';

type Target=MovePreparationTarget;
// All operational panels receive the same verified snapshot as the priorities.
export default function CrmTodayDepartures({leads,available,today,onOpen,onPlanning,data,loading,error,onRetry}:{data:PlanningData|null;loading:boolean;error:string;onRetry:()=>void;leads:QuoteLead[];available:boolean;today:string;onOpen:(lead:QuoteLead,target:Target)=>void;onPlanning:()=>void}) {
  return <section className="crm-today-departures" aria-label="Préparation des prochains déménagements">
    <div className="crm-worklist-head"><div><h3>Vos missions au quotidien</h3><p>Préparez les départs et retrouvez les comptes rendus à compléter.</p></div><button type="button" className="crm-quiet-action" onClick={onPlanning}>Ouvrir le planning<ArrowUpRight size={15}/></button></div>
    <CrmPlanningQueue data={data} leads={leads} loading={loading} error={error} today={today} onOpen={lead=>onOpen(lead,'slot')}/>
    <CrmMissionTimeline data={data} leads={leads} loading={loading} error={error} onOpen={onOpen}/>
    <CrmDepartureReadiness initiallyOpen data={data} leads={leads} today={today} loading={loading} error={error} onOpen={onOpen}/>
    <CrmDocumentQueue leads={leads} data={data} loading={loading} error={error} today={today} onOpen={lead=>onOpen(lead,'documents')}/>
    {available&&error&&<button type="button" className="crm-quiet-action" onClick={onRetry}><RefreshCw size={14}/>Actualiser</button>}
  </section>;
}
