import {useEffect,useRef,useState,type FormEvent} from 'react';
import {X,Phone,Copy,Check,CalendarDays} from 'lucide-react';
import type {CrmMember,CrmQuoteDraft,QuoteLead,RequestAction,FollowUpUpdate} from '../types/crm';
import {fetchCrmMembers,saveRequestFollowUp} from '../services/crmService';
import {useUnsavedChanges} from '../hooks/useUnsavedChanges';
import {actionLabels,followUpDateIn} from '../../shared/followUp.mjs';
import {contactOutcomes,contactChannels,quoteReminderText} from '../../shared/commercialContact.mjs';
import {quoteFollowUp} from '../../shared/quoteFollowUp.mjs';
import './crmQuoteContact.css';
export default function CrmQuoteContact({draft,lead,onClose,onSaved}:{draft:CrmQuoteDraft;lead:QuoteLead;onClose:()=>void;onSaved:(lead:QuoteLead)=>void}){
  const dialog=useRef<HTMLDialogElement>(null),lock=useRef(false);
  const [channel,setChannel]=useState<'phone'|'email'|'other'>('phone'),[outcome,setOutcome]=useState(''),[note,setNote]=useState('');
  const [owner,setOwner]=useState(lead.assigneeId||''),[type,setType]=useState(lead.nextAction?.type||''),[dueDate,setDueDate]=useState(lead.nextAction?.dueDate||''),[actionNote,setActionNote]=useState(lead.nextAction?.note||'');
  const [members,setMembers]=useState<CrmMember[]>([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState(''),[retry,setRetry]=useState(0);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[dirty,setDirty]=useState(false),[copied,setCopied]=useState(false);
  const [message,setMessage]=useState(()=>quoteReminderText(draft));
  const follow=quoteFollowUp(draft,lead);
  useUnsavedChanges(dirty||busy);
  useEffect(()=>{dialog.current?.showModal();},[]);
  useEffect(()=>{let alive=true;setLoading(true);setLoadError('');fetchCrmMembers().then(data=>{if(alive)setMembers(data);}).catch(()=>{if(alive)setLoadError('Responsables indisponibles. Vos saisies sont conservées.');}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[retry]);
  const close=()=>{if(!busy&&(!dirty||window.confirm('Fermer sans enregistrer cet échange et sa prochaine action ?')))onClose();};
  const save=async(e:FormEvent)=>{e.preventDefault();if(lock.current||loading||loadError)return;lock.current=true;setBusy(true);setError('');try{const contact={channel,outcome:outcome as NonNullable<FollowUpUpdate['contact']>['outcome'],note};const result=await saveRequestFollowUp(lead.id,{revision:lead.followUpRevision||0,assigneeId:owner,action:type?{type:type as RequestAction['type'],dueDate,note:actionNote}:null,contact});setDirty(false);onSaved(result);}catch(e){setError(e instanceof Error?e.message:'Enregistrement impossible.');}finally{setBusy(false);lock.current=false;}};
  return <dialog ref={dialog} className="crm-request-dialog quote-contact-dialog" aria-labelledby="quote-contact-title" onCancel={e=>{e.preventDefault();close();}}>
    <header><div><p className="crm-eyebrow">SUIVI COMMERCIAL</p><h2 id="quote-contact-title">Un échange, une suite claire.</h2><p>{draft.clientName} · {draft.reference}</p></div><button type="button" aria-label="Fermer le suivi du devis" disabled={busy} onClick={close}><X size={21}/></button></header>
    <div className="quote-contact-context"><span>{follow.deliveryLabel}</span>{lead.nextAction?<p>Action actuellement prévue : {actionLabels[lead.nextAction.type]} · {lead.nextAction.dueDate.split('-').reverse().join('/')}. Elle reste dans le formulaire ci-dessous.</p>:<p>Aucune prochaine action enregistrée.</p>}{lead.lastCommercialContact&&<p>Dernier échange : {new Date(lead.lastCommercialContact.createdAt).toLocaleString('fr-FR',{timeZone:'Europe/Paris'})} · {contactOutcomes[lead.lastCommercialContact.outcome]}</p>}</div>
    <div className="quote-contact-links">{lead.phone&&<a href={'tel:'+lead.phone}><Phone size={15}/>Appeler {lead.phone}</a>}{lead.email&&<span>{lead.email}</span>}</div>
    <details className="quote-contact-message"><summary>Préparer un message de relance</summary><p>Texte à adapter et à copier dans votre messagerie. Le CRM n’envoie pas ce message.</p><label>Message proposé<textarea aria-label="Message de relance" rows={7} maxLength={6000} value={message} onChange={e=>{setMessage(e.target.value);setCopied(false);}}/></label><button type="button" className="crm-quiet-action" onClick={async()=>{try{await navigator.clipboard.writeText(message);setCopied(true);}catch{setError('Copie indisponible. Sélectionnez le texte du message pour le copier.');}}}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Message copié':'Copier le message'}</button><p>Copier le texte ne journalise pas un échange. Enregistrez ci-dessous uniquement une action réellement effectuée.</p></details>
    <form onSubmit={save} onChange={()=>setDirty(true)}>
      <fieldset disabled={busy||loading||!!loadError}>
        <h3>1. Ce qui vient d’être fait</h3><div className="quote-contact-grid"><label>Canal<select aria-label="Canal de l’échange" value={channel} onChange={e=>setChannel(e.target.value as typeof channel)}>{Object.entries(contactChannels).map(([id,label])=><option key={id} value={id} disabled={id==='documents'}>{label as string}</option>)}</select></label><label>Résultat<select required aria-label="Résultat de l’échange" value={outcome} onChange={e=>setOutcome(e.target.value)}><option value="">Choisir le résultat constaté</option>{Object.entries(contactOutcomes).map(([id,label])=><option key={id} value={id}>{label as string}</option>)}</select></label></div>
        <label>Compte rendu {outcome==='changes'?'(obligatoire)':'(facultatif)'}<textarea aria-label="Compte rendu de l’échange" required={outcome==='changes'} rows={3} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} placeholder="Précisions du client, questions à traiter, disponibilités…"/></label>
        <h3>2. La prochaine action</h3><p>Vérifiez la suite à donner avant d’enregistrer. Le statut du dossier et le devis restent inchangés.</p>
        <label>Responsable<select aria-label="Responsable du suivi commercial" value={owner} onChange={e=>setOwner(e.target.value)}><option value="">Non attribué</option>{owner&&!members.some(m=>m.id===owner)&&<option value={owner}>Compte à réattribuer</option>}{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
        <div className="quote-contact-grid"><label>Prochaine action<select aria-label="Prochaine action commerciale" value={type} onChange={e=>setType(e.target.value as typeof type)}><option value="">Aucune action à prévoir</option>{Object.entries(actionLabels).filter(([id])=>id!=='documents'||type==='documents').map(([id,label])=><option key={id} value={id}>{label as string}</option>)}</select></label><label>Échéance<input aria-label="Échéance commerciale" type="date" required={!!type} disabled={!type} value={dueDate} onChange={e=>setDueDate(e.target.value)}/></label></div>
        {!!type&&<><div className="follow-up-date-shortcuts" role="group" aria-label="Raccourcis de relance">{([[1,'Demain'],[3,'Dans 3 jours'],[7,'Dans une semaine']] as const).map(([days,label])=><button type="button" key={days} aria-pressed={dueDate===followUpDateIn(days)} onClick={()=>{setDueDate(followUpDateIn(days));setDirty(true);}}><CalendarDays size={13}/>{label}</button>)}</div><label>Précision sur la prochaine action<input aria-label="Précision de l’action commerciale" maxLength={1000} value={actionNote} onChange={e=>setActionNote(e.target.value)}/></label></>}
        {!type&&<p>Aucune échéance de suivi ne sera créée. Sélectionnez une prochaine action si le dossier doit être repris.</p>}
        <footer><button type="button" disabled={busy} className="crm-quiet-action" onClick={close}>Annuler</button><button className="requests-primary" disabled={busy}>{busy?'Enregistrement…':'Enregistrer l’échange et la suite'}</button></footer>
      </fieldset>
      {loading&&<p role="status">Chargement des responsables…</p>}{(error||loadError)&&<p role="alert" className="quote-contact-error">{error||loadError}</p>}{loadError&&<button type="button" className="crm-quiet-action" onClick={()=>setRetry(v=>v+1)}>Réessayer</button>}
    </form>
  </dialog>;
}
