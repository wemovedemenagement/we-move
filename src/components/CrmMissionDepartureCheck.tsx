import {ArrowRight, ClipboardCheck, RefreshCw} from 'lucide-react';
import type {CrmDossier,MoveBooking,PlanningData} from '../services/crmService';
import {missionDepartureCheck} from '../../shared/missionDepartureCheck.mjs';
import './crmMissionDepartureCheck.css';

export default function CrmMissionDepartureCheck({dossier,booking,planning,stale,dirty,refreshDisabled,onRefresh,onCorrect}:{dossier:CrmDossier;booking:MoveBooking|null;planning:PlanningData;stale:boolean;dirty:boolean;refreshDisabled:boolean;onRefresh:()=>void;onCorrect:(target:string)=>void}) {
  const check=missionDepartureCheck(dossier,booking,planning,stale);
  return <section className="mission-departure-check" aria-label="Contrôle avant départ">
    <div className="departure-check-heading"><h4><ClipboardCheck size={18}/>Avant le départ</h4>{!check.inactive&&<button type="button" disabled={refreshDisabled||dirty} onClick={onRefresh}><RefreshCw size={14}/>Actualiser le contrôle</button>}</div>
    {check.inactive?<p>Mission annulée, clôturée ou dossier fermé : contrôle avant départ inactif.</p>:<>
      <p className="departure-check-count">{check.count?`${check.count} point${check.count>1?'s':''} à vérifier`:'Champs contrôlés renseignés'}</p>
      <p>Contrôle des informations enregistrées lors de la dernière lecture. Vérifiez les conditions réelles avec l’équipe avant le départ.</p>
      {dirty&&<p className="departure-check-dirty">Enregistrez ou abandonnez les saisies en cours avant d’actualiser le contrôle.</p>}
      {check.count>0&&<details><summary>Voir les points et les corrections</summary><div className="departure-check-groups">{check.groups.map(group=><section key={group.title}><h5>{group.title}</h5><ul>{group.issues.map((issue,index)=><li key={index}><span>{issue.label}</span><button type="button" onClick={()=>onCorrect(issue.target)} aria-label={'Vérifier : '+issue.label}>Vérifier<ArrowRight size={13}/></button></li>)}</ul></section>)}</div></details>}
    </>}
  </section>;
}
