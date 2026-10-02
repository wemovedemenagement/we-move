import CrmDossierDetails from './CrmDossierDetails';

import CrmFollowUp from './CrmFollowUp';
import { useEffect, useRef, useState } from 'react';
import { X, Phone, Mail, MapPin, CalendarDays, Box, Pencil, FileText, ArrowRight, Clock, MessageSquare } from 'lucide-react';
import type { QuoteLead, FollowUpUpdate } from '../types/crm';
import { channelName, requestStatus, requestDate } from './CrmRequests';

type Props={lead:QuoteLead;onMove:()=>void;onInvoice:()=>void;canInvoice:boolean;onClose:()=>void;onEdit:()=>void;onVisit:()=>void;onQuote:()=>void;onSaveFollowUp:(payload:FollowUpUpdate)=>Promise<void>};
export default function CrmRequestSummary({lead,onClose,onEdit,onVisit,onQuote,onSaveFollowUp,onMove,onInvoice,canInvoice}:Props){

  const [dirty,setDirty]=useState(false);
  const [saving,setSaving]=useState(false);
  const leave=(action:()=>void)=>{if(saving)return;if(!dirty||window.confirm('Quitter sans enregistrer le suivi ?'))action();};
  const dialog=useRef<HTMLDialogElement>(null);
  useEffect(()=>{dialog.current?.showModal();},[]);
  return <dialog ref={dialog} className="request-sheet" aria-labelledby="request-sheet-title" onCancel={event=>{event.preventDefault();leave(onClose);}}>
    <header className="request-sheet-header"><div><h2 id="request-sheet-title">{lead.fullName}</h2><p>{channelName(lead.source)} · Reçue le {requestDate(lead.createdAt)}</p></div><button onClick={()=>leave(onClose)} aria-label="Fermer la fiche" className="request-icon-button"><X size={20}/></button></header>
    <div className="request-sheet-body">
      <div className="request-sheet-status"><span className="request-status" data-new={lead.status==='nouveau'}>{requestStatus[lead.status]}</span><button onClick={()=>leave(onEdit)}><Pencil size={14}/>Modifier les informations</button></div>

      <CrmDossierDetails id={lead.id} version={lead.updatedAt} onVisit={()=>leave(onVisit)} onEdit={()=>leave(onEdit)} onFollowUp={()=>{const section=dialog.current?.querySelector<HTMLElement>('.request-follow-up');section?.scrollIntoView({block:'start',behavior:'smooth'});section?.querySelector<HTMLSelectElement>('select')?.focus({preventScroll:true});}} onContact={()=>{const section=dialog.current?.querySelector<HTMLElement>('.request-contact-cards');section?.scrollIntoView({block:'center',behavior:'smooth'});section?.querySelector<HTMLAnchorElement>('a')?.focus({preventScroll:true});}} onQuote={()=>leave(onQuote)} onMove={()=>leave(onMove)} onInvoice={()=>leave(onInvoice)} canInvoice={canInvoice}/>
      <CrmFollowUp lead={lead} onSave={onSaveFollowUp} onDirtyChange={setDirty} onBusyChange={setSaving}/><section className="request-detail-section"><h3>Joindre le client</h3><div className="request-contact-cards">{lead.phone&&<a href={'tel:'+lead.phone}><Phone size={18}/><span><small>Téléphone</small><strong>{lead.phone}</strong></span><ArrowRight size={16}/></a>}{lead.email&&<a href={'mailto:'+lead.email}><Mail size={18}/><span><small>E-mail</small><strong>{lead.email}</strong></span><ArrowRight size={16}/></a>}</div></section>
      <section className="request-detail-section"><h3>Le projet <span>{lead.projectType==='entreprise'?'Entreprise':'Particulier'}</span></h3><div className="request-journey"><div><i/><span><small>ADRESSE DE DÉPART</small><strong>{lead.departureAddress||'À préciser avec le client'}</strong><p>Étage : {lead.departureFloor||'À préciser'}</p></span></div><div><i/><span><small>ADRESSE D’ARRIVÉE</small><strong>{lead.arrivalAddress||'À préciser avec le client'}</strong><p>Étage : {lead.arrivalFloor||'À préciser'}</p></span></div></div><div className="request-project-facts"><div><CalendarDays size={17}/><span><small>Date souhaitée</small><strong>{requestDate(lead.moveDate)}</strong></span></div><div><Box size={17}/><span><small>Volume</small><strong>{lead.volume?lead.volume+' m³':'À estimer'}</strong></span></div></div>{(lead.storageRequired||lead.liftRequired)&&<p className="request-options">{[lead.storageRequired&&'Garde-meubles demandé',lead.liftRequired&&'Monte-meubles demandé'].filter(Boolean).join(' · ')}</p>}{lead.notes&&<div className="request-project-notes"><MessageSquare size={16}/><p>{lead.notes}</p></div>}{lead.sourceDetail&&<p className="request-source-detail">Précision sur l’origine : {lead.sourceDetail}</p>}</section>
      <p className="request-full-reference">Référence complète : {lead.id}</p>
    </div>
    <footer className="request-sheet-footer"><span>Informations enregistrées dans votre dossier</span><button onClick={()=>leave(onClose)}>Fermer</button></footer>
  </dialog>;
}
