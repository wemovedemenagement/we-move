import {useEffect, useRef, useState} from 'react';
import {Bell, ChevronDown, Settings, ShieldCheck, UserRound, LogOut, Sun, Moon, ArrowUpRight, CheckCheck} from 'lucide-react';
import type {CrmIdentity, QuoteLead} from '../types/crm';
import {parisToday} from '../../shared/followUp.mjs';
import {crmNotifications} from '../../shared/crmNotifications.mjs';

type Props = {identity:CrmIdentity; dark:boolean; loaded:boolean; error:string; leads:QuoteLead[]; onTheme:()=>void; onConnect:()=>void; onLogout:()=>void; onSettings:()=>void; onAccess:()=>void; onOpen:(lead:QuoteLead)=>void};
export default function CrmHeaderActions({identity,dark,loaded,error,leads,onTheme,onConnect,onLogout,onSettings,onAccess,onOpen}:Props) {
  const [panel,setPanel]=useState<'profile'|'settings'|'notifications'|null>(null);
  const [filter,setFilter]=useState('all'),[limit,setLimit]=useState(10);
  const [today,setToday]=useState(parisToday());
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement|null>(null);
  useEffect(()=>{const timer=setInterval(()=>setToday(parisToday()),60000);return()=>clearInterval(timer);},[]);
  useEffect(()=>{
    if(!panel)return;
    const outside=(event:PointerEvent)=>{if(!root.current?.contains(event.target as Node))setPanel(null);};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setPanel(null);trigger.current?.focus();}};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[panel]);
  const toggle=(name:typeof panel,event:React.MouseEvent<HTMLButtonElement>)=>{trigger.current=event.currentTarget;if(name==='notifications'){setFilter('all');setLimit(10);}setPanel(panel===name?null:name);};
  const go=(action:()=>void)=>{setPanel(null);action();};
  const role={gerant:'Gérant',commercial:'Commercial',secretaire:'Secrétaire'}[identity.role];
  const alerts=crmNotifications(leads,today) as {lead:QuoteLead;label:string;reason:string;bucket:string;badge:string}[];
  const shown=alerts.filter(alert=>filter==='all'||alert.bucket===filter);
  return <div ref={root} className="crm-header-actions" onBlur={event=>{if(!event.currentTarget.contains(event.relatedTarget as Node))setPanel(null);}}>
    <button className="crm-header-icon" aria-label={dark?'Activer le thème clair':'Activer le thème sombre'} title={dark?'Thème clair':'Thème sombre'} onClick={onTheme}>{dark?<Sun size={18}/>:<Moon size={18}/>}</button>
    <button className="crm-header-icon" aria-label={`Notifications${loaded&&!error?` : ${alerts.length} à traiter`:''}`} aria-expanded={panel==='notifications'} aria-controls="crm-notifications" title="Notifications" onClick={event=>toggle('notifications',event)}><Bell size={18}/>{loaded&&!error&&alerts.length>0&&<span className="crm-header-count">{alerts.length>99?'99+':alerts.length}</span>}</button>
    <button className="crm-header-icon" aria-label="Paramètres du CRM" aria-expanded={panel==='settings'} aria-controls="crm-header-settings" title="Paramètres" onClick={event=>toggle('settings',event)}><Settings size={18}/></button>
    <span className="crm-header-divider"/>
    <button className="crm-profile-trigger" aria-label="Mon profil" aria-expanded={panel==='profile'} aria-controls="crm-header-profile" onClick={event=>toggle('profile',event)}><span className="crm-profile-avatar"><UserRound size={18}/><i/></span><span className="crm-profile-caption"><strong>Mon espace</strong><small>{identity.mode==='local'?'Accès local':role}</small></span><ChevronDown size={14}/></button>
    {panel==='profile'&&<section id="crm-header-profile" className="crm-header-popover" aria-label="Mon profil"><div className="crm-popover-heading"><span className="crm-popover-eyebrow">MON PROFIL</span><h2>{identity.mode==='local'?'Session locale':role}</h2><p>{identity.email||'Connexion Google non établie'}</p><span className="crm-account-status"><ShieldCheck size={13}/>{identity.mode==='firebase'?'Connecté avec Google':'Mode de développement local'}</span></div><button className="crm-popover-link" onClick={()=>setPanel('settings')}><Settings size={16}/>Paramètres du compte<ArrowUpRight size={14}/></button><button className="crm-popover-link" onClick={()=>go(identity.mode==='local'?onConnect:onLogout)}><LogOut size={16}/>{identity.mode==='local'?'Se connecter avec Google':'Se déconnecter'}</button></section>}
    {panel==='settings'&&<section id="crm-header-settings" className="crm-header-popover" aria-label="Paramètres"><div className="crm-popover-heading"><span className="crm-popover-eyebrow">VOTRE ESPACE</span><h2>Paramètres</h2></div><button className="crm-popover-link" onClick={()=>setPanel('profile')}><UserRound size={16}/>Mon profil<ArrowUpRight size={14}/></button><button className="crm-popover-link" onClick={()=>go(onSettings)}><Settings size={16}/>Configuration du CRM<ArrowUpRight size={14}/></button>{identity.role==='gerant'&&<button className="crm-popover-link" onClick={()=>go(onAccess)}><ShieldCheck size={16}/>Gestion des accès<span className="crm-role-tag">Gérant</span></button>}</section>}
    {panel==='notifications'&&<section id="crm-notifications" className="crm-header-popover crm-notification-panel" aria-label="Notifications"><div className="crm-popover-heading"><span className="crm-popover-eyebrow">LE FIL DE VOTRE ACTIVITÉ</span><h2>Notifications</h2><p>Demandes, visites et missions · heure de Paris</p></div>{error?<p className="crm-notification-empty" role="status">Actualisation indisponible. Réessayez depuis le tableau de bord.</p>:!loaded?<p className="crm-notification-empty" role="status">Chargement des demandes…</p>:alerts.length===0?<div className="crm-notification-empty"><CheckCheck size={26}/><strong>Aucune alerte à traiter</strong><p>Aucune nouvelle demande ni échéance détectée dans les dossiers ouverts.</p></div>:<><div className="crm-notification-filters" role="group" aria-label="Filtrer les notifications">{[['all','Toutes'],['overdue','En retard'],['today','Aujourd’hui']].map(([id,label])=><button key={id} type="button" aria-pressed={filter===id} onClick={()=>{setFilter(id);setLimit(10);}}>{label} <span>{id==='all'?alerts.length:alerts.filter(a=>a.bucket===id).length}</span></button>)}</div><div className="crm-notification-list">{shown.slice(0,limit).map(({lead,label,reason,bucket,badge})=><button key={lead.id} className="crm-notification-item" onClick={()=>go(()=>onOpen(lead))}><span className={bucket==='overdue'?'crm-notification-dot is-overdue':'crm-notification-dot'}/><span><strong>{lead.fullName}</strong><small>{label}</small><span className="crm-notification-badge" data-timing={bucket}>{badge}</span><small>{reason}</small></span><ArrowUpRight size={15}/></button>)}{!shown.length&&<p className="crm-notification-empty" role="status">Aucune alerte dans cette sélection.</p>}</div>{shown.length>limit&&<button type="button" className="crm-notification-more" onClick={()=>setLimit(value=>value+10)}>Afficher plus ({shown.length-limit} restantes)</button>}<p className="crm-notification-footnote">Les alertes suivent l’avancement enregistré dans les dossiers.</p></>}</section>}
  </div>;
}
