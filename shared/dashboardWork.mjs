import {workQueue,matchesWorkFilter} from './crmWorkflow.mjs';
import {validPlanningTime} from './resourceAvailability.mjs';

// A category is a navigation context; it does not change the saved next action.
export function dashboardWork(leads,today,filter='all') {
  const rows=workQueue(leads,today).map(row=>{
    const visitToday=matchesWorkFilter(row,'visit',today);
    const contextVisit=filter==='visit'&&visitToday||['all','urgent'].includes(filter)&&visitToday&&!['today','overdue'].includes(row.bucket);
    if(!contextVisit)return row;
    const date=row.lead.visitDate;
    return {...row,bucket:'today',date:today,step:{key:'visit',priority:1,label:'Consulter la visite',target:'visit',reason:validPlanningTime(date)?`Visite prévue le ${date.slice(8,10)}/${date.slice(5,7)}/${date.slice(0,4)} à ${date.slice(11)}`:'Horaire de visite à vérifier'}};
  }).filter(row=>matchesWorkFilter(row,filter,today));
  return rows.sort((a,b)=>filter==='visit'?String(a.lead.visitDate||'').localeCompare(String(b.lead.visitDate||''))||String(a.lead.id).localeCompare(String(b.lead.id)):a.step.priority-b.step.priority||(a.date||a.lead.createdAt||'').localeCompare(b.date||b.lead.createdAt||'')||String(a.lead.id).localeCompare(String(b.lead.id)));
}

export function isWorkDueNow({lead,step,bucket}) {
  return ['overdue','today'].includes(bucket)||bucket==='undated'&&(step.key==='aftercare'||!['termine','refuse'].includes(lead.status));
}

export function dashboardResponsible(lead) {
  if(lead.moveFollowUp){
    const name=String(lead.moveFollowUp.owner||'').trim();
    return name?{id:'mission:'+name,name}:{id:'',name:'Responsable à définir'};
  }
  const id=String(lead.assigneeId||'').trim();
  return {id,name:id?String(lead.assigneeName||'').trim()||'Responsable enregistré':'Responsable à définir'};
}
