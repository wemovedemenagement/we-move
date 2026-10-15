import {workQueue} from './crmWorkflow.mjs';
import {parisToday} from './followUp.mjs';

// One actionable alert per open dossier, using the same priorities as the dashboard.
export function crmNotifications(leads,today=parisToday()) {
  return workQueue(leads,today)
    .filter(({lead,step,bucket})=>(!['refuse','termine'].includes(lead.status)||step.key==='aftercare')&&
      (['overdue','today'].includes(bucket)||lead.status==='nouveau'||step.key==='stale'))
    .map(({lead,step,bucket})=>({lead,label:step.label,reason:step.reason,bucket,
      badge:bucket==='overdue'?'En retard':bucket==='today'?'Aujourd’hui':step.key==='stale'?'Suivi à actualiser':'Nouvelle demande'}));
}
