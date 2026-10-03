import { parisToday, actionLabels } from './followUp.mjs';
export function nextStep(lead, today = parisToday()) {
  if (lead.status === 'refuse')
    return {
      key: 'archive',
      label: 'Consulter le dossier',
      reason: 'Projet non retenu',
      priority: 9,
      target: 'summary',
    };
  if (lead.status === 'termine')
    return {
      key: 'billing',
      label: 'Consulter la facturation',
      reason: 'Déménagement effectué',
      priority: 4,
      target: 'invoice',
    };
  if (lead.status==='confirme'&&(!lead.nextAction||['visite','devis','planifier'].includes(lead.nextAction.type))) {
    if(lead.scheduledTime)return {key:'mission',label:lead.scheduledTime.slice(0,10)<today?'Vérifier le déménagement':'Préparer la mission',reason:lead.scheduledTime.replace('T',' à '),priority:lead.scheduledTime.slice(0,10)<today?0:lead.scheduledTime.slice(0,10)===today?1:5,target:'move'};
    return {key:'planning',label:'Planifier le déménagement',reason:'Dossier accepté, créneau à confirmer',priority:2,target:'move'};
  }
  if ((!lead.nextAction||lead.nextAction.type==='visite')&&lead.visitStatus==='effectuee') {
    if(lead.nextAction)return {key:'stale',label:'Mettre à jour le suivi',reason:'Visite effectuée · action de suivi encore ouverte',priority:2,target:'summary'};
    return {key:'quote',label:'Préparer le devis',reason:'Visite effectuée · proposition à préparer ou à vérifier',priority:3,target:'quote'};
  }
  if (lead.visitDate&&lead.visitStatus!=='effectuee'&&(!lead.nextAction||lead.nextAction.type==='visite')) {
    const day=lead.visitDate.slice(0,10);
    return {key:'visit',label:day<today?'Vérifier la visite passée':'Consulter la visite',reason:lead.visitDate.replace('T',' à '),priority:day<today?0:day===today?1:5,target:'visit'};
  }
  if (lead.nextAction) {
    const a = lead.nextAction;
    return {
      key: 'action',
      label: actionLabels[a.type] || 'Ouvrir le suivi',
      reason: `${a.note ? a.note+' · ' : ''}Échéance : ${a.dueDate}`,
      priority: a.dueDate < today ? 0 : a.dueDate === today ? 1 : 5,
      target:
        a.type === 'visite'
          ? 'visit'
          : a.type === 'devis'
            ? 'quote'
            : a.type === 'planifier'
              ? 'move'
              : a.type === 'facturer'
                ? 'invoice'
                : 'summary',
    };
  }
  if (lead.status === 'confirme')
    return lead.scheduledTime
      ? {
          key: 'mission',
          label: 'Préparer la mission',
          reason: lead.scheduledTime.replace('T', ' à '),
          priority: lead.scheduledTime.slice(0, 10) <= today ? 1 : 5,
          target: 'move',
        }
      : {
          key: 'planning',
          label: 'Planifier le déménagement',
          reason: 'Dossier accepté, créneau à confirmer',
          priority: 2,
          target: 'move',
        };
  if (lead.visitDate && lead.visitStatus !== 'effectuee')
    return {
      key: 'visit',
      label: 'Consulter la visite',
      reason: lead.visitDate.replace('T', ' à '),
      priority: lead.visitDate.slice(0, 10) <= today ? 1 : 5,
      target: 'visit',
    };
  if (lead.status === 'devis_envoye')
    return {
      key: 'followup',
      label: 'Prévoir une relance',
      reason: 'Devis envoyé, prochaine action à définir',
      priority: 3,
      target: 'summary',
    };
  if (lead.status === 'nouveau')
    return {
      key: 'new',
      label: 'Prendre contact',
      reason: 'Nouvelle demande à qualifier',
      priority: 2,
      target: 'summary',
    };
  return {
    key: 'quote',
    label: 'Préparer le devis',
    reason: 'Vérifier les accès et les prestations',
    priority: 4,
    target: 'quote',
  };
}
export function workQueue(leads, today = parisToday()) {
  return leads.filter(l=>l.status!=='refuse').map(lead=>{
    const step=nextStep(lead,today);
    const date=lead.status==='termine'?'':step.key==='visit'?lead.visitDate?.slice(0,10):step.key==='mission'?lead.scheduledTime?.slice(0,10):step.key==='stale'||step.key==='planning'?'':lead.nextAction?.dueDate||'';
    const bucket=date?(date<today?'overdue':date===today?'today':'upcoming'):'undated';
    return {lead,step,bucket,date};
  }).sort((a,b)=>a.step.priority-b.step.priority||(a.date||a.lead.createdAt||'').localeCompare(b.date||b.lead.createdAt||'')||String(a.lead.id).localeCompare(String(b.lead.id)));
}

export function matchesWorkFilter({lead,step,bucket}, filter, today=parisToday()) {
  if(filter==='urgent')return ['today','overdue'].includes(bucket);
  if(filter==='new')return lead.status==='nouveau';
  if(filter==='visit')return lead.visitDate?.slice(0,10)===today&&lead.visitStatus!=='effectuee'&&!['refuse','termine'].includes(lead.status);
  if(filter==='planning')return lead.status==='confirme'&&!lead.scheduledTime;
  if(filter==='followup')return step.key==='followup';
  return true;
}
