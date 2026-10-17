import {useEffect,useState,useRef} from 'react';
import {Copy,Check,MessageSquare} from 'lucide-react';
import CrmFollowUp from './CrmFollowUp';
import {documentReminderText,documentFollowUpNote} from '../../shared/documentReminder.mjs';
import {documentChecklistIssues} from '../../shared/documentChecklist.mjs';
import {saveRequestFollowUp,type CrmDossier} from '../services/crmService';
import type {QuoteLead} from '../types/crm';
import './crmDocumentReminder.css';

export default function CrmDocumentReminder({dossier,canEdit,disabled,onSaved,onDirty,onBusy,onReload,onAgreement}:{dossier:CrmDossier;canEdit:boolean;disabled:boolean;onSaved:(lead:QuoteLead)=>void;onDirty:(dirty:boolean)=>void;onBusy:(busy:boolean)=>void;onReload:()=>void;onAgreement:()=>void}) {
  const lead=dossier.lead;
  const [message,setMessage]=useState(()=>documentReminderText(lead,dossier.acceptance?.quote)),[textDirty,setTextDirty]=useState(false),[followDirty,setFollowDirty]=useState(false),[copied,setCopied]=useState(false),[copyError,setCopyError]=useState(''),[busy,setBusy]=useState(false);
  const latestMessage=useRef(message);latestMessage.current=message;
  useEffect(()=>onDirty(textDirty||followDirty),[textDirty,followDirty,onDirty]);
  const issues=documentChecklistIssues(lead);
  if(lead.status!=='confirme'||!issues.length&&lead.nextAction?.type!=='documents')return null;
  return <details className="crm-document-reminder"><summary><MessageSquare size={20}/><span>{issues.length?'Préparer la demande de pièces':'Vérifier le suivi des pièces'}<small>{lead.nextAction?.type==='documents'?`Suivi prévu le ${lead.nextAction.dueDate.split('-').reverse().join('/')}`:lead.nextAction?'Une prochaine action est déjà enregistrée':'Message à copier et prochaine action à définir'}</small></span></summary><div className="document-reminder-content">
    {!!issues.length&&<><p>Adaptez le texte puis copiez-le dans votre messagerie. Copier ne signifie pas envoyer : aucune réception ni relance effectuée n’est enregistrée automatiquement.</p>{!dossier.acceptance?<div className="document-reminder-notice"><p>Vérifiez d’abord la version ayant reçu l’accord du client pour préparer le bon message.</p><button type="button" className="crm-quiet-action" disabled={disabled||busy} onClick={onAgreement}>Vérifier le devis de référence</button></div>:<fieldset disabled={disabled||busy}><label>Message à adapter<textarea aria-label="Message de demande des pièces" rows={11} maxLength={6000} value={message} onChange={e=>{setMessage(e.target.value);setTextDirty(true);setCopied(false);setCopyError('');}}/></label><button type="button" className="crm-quiet-action" disabled={!message.trim()} onClick={async()=>{try{await navigator.clipboard.writeText(message);setCopied(latestMessage.current===message);if(latestMessage.current===message)setTextDirty(false);setCopyError('');}catch{setCopyError('Copie indisponible. Sélectionnez le texte pour le copier dans votre messagerie.');}}}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Texte copié':'Copier le texte avec l’objet'}</button>{textDirty&&<button type="button" className="crm-quiet-action" onClick={()=>{setMessage(documentReminderText(lead,dossier.acceptance?.quote));setTextDirty(false);setCopied(false);setCopyError('');}}>Rétablir le message proposé</button>}{copied&&<p role="status">Texte copié. Aucun message envoyé par le CRM.</p>}{copyError&&<p role="alert">{copyError}</p>}</fieldset>}</>}
    {!issues.length&&<p>Les deux réceptions sont renseignées. Vérifiez la suite à donner avant de terminer l’action existante.</p>}
    {canEdit&&<div className="document-reminder-followup"><p>Enregistrez la prochaine action après avoir vérifié le responsable et choisi une date. Une action existante reste conservée tant que vous ne décidez pas de la remplacer.</p><CrmFollowUp lead={lead} disabled={disabled} suggestion={issues.length?{type:'documents',note:documentFollowUpNote(lead)}:undefined} onReload={onReload} onSave={async payload=>{const saved=await saveRequestFollowUp(lead.id,payload);onSaved(saved);}} onDirtyChange={setFollowDirty} onBusyChange={value=>{setBusy(value);onBusy(value);}}/></div>}
  </div></details>;
}
