import {actionLabels} from '../../shared/followUp.mjs';
import {useUnsavedChanges} from '../hooks/useUnsavedChanges';
import {requestCity} from '../../shared/requestCity.mjs';
import CrmDossierDetails from './CrmDossierDetails';

import CrmFollowUp from './CrmFollowUp';
import { useEffect, useRef, useState } from 'react';
import { X, Phone, Mail, MapPin, CalendarDays, Box, Pencil, FileText, ArrowRight, Clock, MessageSquare, ChevronDown } from 'lucide-react';
import type { QuoteLead, FollowUpUpdate } from '../types/crm';
import { channelName, requestStatus, requestDate } from './CrmRequests';

type Props={lead:QuoteLead;onMove:()=>void;onInvoice:()=>void;canInvoice:boolean;onClose:()=>void;onEdit:()=>void;onVisit:()=>void;onQuote:()=>void;onSaveFollowUp:(payload:FollowUpUpdate)=>Promise<void>};
export default function CrmRequestSummary({lead,onClose,onEdit,onVisit,onQuote,onSaveFollowUp,onMove,onInvoice,canInvoice}:Props){

  const [dirty,setDirty]=useState(false);
  const [saving,setSaving]=useState(false);
  useUnsavedChanges(dirty||saving);
  const leave=(action:()=>void)=>{if(saving)return;if(!dirty||window.confirm('Quitter sans enregistrer le suivi ?'))action();};
  const dialog=useRef<HTMLDialogElement>(null);
  const followPanel=useRef<HTMLDetailsElement>(null);
  const projectPanel=useRef<HTMLDetailsElement>(null);
  const reveal=(panel:HTMLDetailsElement|null,selector:string)=>{
    if(!panel)return;
    panel.open=true;
    requestAnimationFrame(()=>{panel.scrollIntoView({block:'start',behavior:'smooth'});panel.querySelector<HTMLElement>(selector)?.focus({preventScroll:true});});
  };
  useEffect(()=>{dialog.current?.showModal();},[]);
  return <dialog ref={dialog} className="request-sheet" aria-labelledby="request-sheet-title" onCancel={event=>{event.preventDefault();leave(onClose);}}>
    <header className="request-sheet-header"><div><h2 id="request-sheet-title">{lead.fullName}</h2><p>{channelName(lead.source)} · Reçue le {requestDate(lead.createdAt)}</p></div><button onClick={()=>leave(onClose)} aria-label="Fermer la fiche" className="request-icon-button"><X size={20}/></button></header>
    <div className="request-sheet-body">
      <div className="request-sheet-status"><span className="request-status" data-new={lead.status==='nouveau'}>{requestStatus[lead.status]}</span><button onClick={()=>leave(onEdit)}><Pencil size={14}/>Modifier les informations</button></div>

      <div className="dossier-project-glance"><div className="dossier-route"><span>{requestCity(lead.departureAddress)}</span><ArrowRight size={18} aria-hidden="true"/><span>{requestCity(lead.arrivalAddress)}</span></div><p><span><CalendarDays size={14}/>Date souhaitée : {requestDate(lead.moveDate)}</span><span><Box size={14}/>{lead.volume?lead.volume+' m³':'Volume à estimer'}</span></p><div className="dossier-contact-shortcuts">{lead.phone&&<a href={'tel:'+lead.phone}><Phone size={14}/>Appeler</a>}{lead.email&&<a href={'mailto:'+lead.email}><Mail size={14}/>Écrire au client</a>}</div></div>
      <CrmDossierDetails id={lead.id} version={lead.updatedAt} onVisit={()=>leave(onVisit)} onEdit={()=>leave(onEdit)} onFollowUp={()=>reveal(followPanel.current,'select')} onContact={()=>reveal(projectPanel.current,'.request-contact-cards a')} onQuote={()=>leave(onQuote)} onMove={()=>leave(onMove)} onInvoice={()=>leave(onInvoice)} canInvoice={canInvoice}/>
      <details ref={followPanel} className="dossier-disclosure"><summary><span className="dossier-disclosure-icon"><Clock size={18}/></span><span><strong>Responsable et suivi</strong><small>{dirty?'Modifications non enregistrées':lead.nextAction?`${actionLabels[lead.nextAction.type]} · ${requestDate(lead.nextAction.dueDate)}`:'Prochaine action à définir'} · {lead.assigneeName||'Non attribué'}</small></span><ChevronDown size={18}/></summary><div className="dossier-disclosure-content"><CrmFollowUp lead={lead} onSave={onSaveFollowUp} onDirtyChange={setDirty} onBusyChange={setSaving}/></div></details><details ref={projectPanel} className="dossier-disclosure"><summary><span className="dossier-disclosure-icon"><MapPin size={18}/></span><span><strong>Coordonnées et projet</strong><small>Adresses complètes, accès et précisions du client</small></span><ChevronDown size={18}/></summary><div className="dossier-disclosure-content"><section className="request-detail-section"><h3>Joindre le client</h3><div className="request-contact-cards">{lead.phone&&<a href={'tel:'+lead.phone}><Phone size={18}/><span><small>Téléphone</small><strong>{lead.phone}</strong></span><ArrowRight size={16}/></a>}{lead.email&&<a href={'mailto:'+lead.email}><Mail size={18}/><span><small>E-mail</small><strong>{lead.email}</strong></span><ArrowRight size={16}/></a>}</div></section>
      <section className="request-detail-section"><h3>Le projet <span>{lead.projectType==='entreprise'?'Entreprise':'Particulier'}</span></h3><div className="request-journey"><div><i/><span><small>ADRESSE DE DÉPART</small><strong>{lead.departureAddress||'À préciser avec le client'}</strong><p>Étage : {lead.departureFloor||'À préciser'}</p></span></div><div><i/><span><small>ADRESSE D’ARRIVÉE</small><strong>{lead.arrivalAddress||'À préciser avec le client'}</strong><p>Étage : {lead.arrivalFloor||'À préciser'}</p></span></div></div><div className="request-project-facts"><div><CalendarDays size={17}/><span><small>Date souhaitée</small><strong>{requestDate(lead.moveDate)}</strong></span></div><div><Box size={17}/><span><small>Volume</small><strong>{lead.volume?lead.volume+' m³':'À estimer'}</strong></span></div></div>{(lead.storageRequired||lead.liftRequired)&&<p className="request-options">{[lead.storageRequired&&'Garde-meubles demandé',lead.liftRequired&&'Monte-meubles demandé'].filter(Boolean).join(' · ')}</p>}{lead.notes&&<div className="request-project-notes"><MessageSquare size={16}/><p>{lead.notes}</p></div>}{lead.sourceDetail&&<p className="request-source-detail">Précision sur l’origine : {lead.sourceDetail}</p>}</section>
      </div></details><p className="request-full-reference">Référence complète : {lead.id}</p>
    </div>
    <footer className="request-sheet-footer"><span aria-live="polite">{saving?'Enregistrement…':dirty?'Modifications non enregistrées':'Informations enregistrées dans votre dossier'}</span><button onClick={()=>leave(onClose)}>Fermer</button></footer>
  </dialog>;
}
