import {useEffect,useRef,useState,type FormEvent} from 'react';
import {X,Phone,Copy,Check,CalendarDays} from 'lucide-react';
import type {CrmMember,CrmQuoteDraft,QuoteLead,RequestAction,FollowUpUpdate} from '../types/crm';
import {fetchCrmMembers,fetchCrmDossier,saveRequestFollowUp} from '../services/crmService';
import {useUnsavedChanges} from '../hooks/useUnsavedChanges';
import {actionLabels,followUpDateIn} from '../../shared/followUp.mjs';
import {contactOutcomes,contactChannels,quoteReminderText} from '../../shared/commercialContact.mjs';
import {quoteFollowUp} from '../../shared/quoteFollowUp.mjs';
import './crmQuoteContact.css';
export default function CrmQuoteContact({draft,lead:initialLead,onClose,onSaved,onReloaded}:{draft:CrmQuoteDraft;lead:QuoteLead;onClose:()=>void;onSaved:(lead:QuoteLead,logged:boolean,completed?:boolean)=>void;onReloaded:(lead:QuoteLead)=>void}){
  const dialog=useRef<HTMLDialogElement>(null),reviewPanel=useRef<HTMLElement>(null),lock=useRef(false);
  const [lead,setLead]=useState(initialLead),[review,setReview]=useState<QuoteLead|null>(null),[readError,setReadError]=useState(''),[reloadNotice,setReloadNotice]=useState('');
  const [logging,setLogging]=useState(false);
  const [channel,setChannel]=useState<'phone'|'email'|'other'>('phone'),[outcome,setOutcome]=useState(''),[note,setNote]=useState('');
  const [owner,setOwner]=useState(lead.assigneeId||''),[type,setType]=useState(lead.nextAction?.type||''),[dueDate,setDueDate]=useState(lead.nextAction?.dueDate||''),[actionNote,setActionNote]=useState(lead.nextAction?.note||'');
  const [members,setMembers]=useState<CrmMember[]>([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState(''),[retry,setRetry]=useState(0);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[dirty,setDirty]=useState(false),[copied,setCopied]=useState(false);
  const [message,setMessage]=useState(()=>quoteReminderText(draft));
  const follow=quoteFollowUp(draft,lead);
  const closed=['confirme','termine','refuse'].includes(lead.status);
  useUnsavedChanges(dirty||busy);
  useEffect(()=>{dialog.current?.showModal();},[]);
  useEffect(()=>{if(review)reviewPanel.current?.focus();},[review]);
  useEffect(()=>{let alive=true;setLoading(true);setLoadError('');fetchCrmMembers().then(data=>{if(alive)setMembers(data);}).catch(()=>{if(alive)setLoadError('Responsables indisponibles. Vos saisies sont conservées.');}).finally(()=>{if(alive)setLoading(false);});return()=>{alive=false;};},[retry]);
  const close=()=>{if(!busy&&(!dirty||window.confirm('Fermer sans enregistrer vos modifications du suivi ?')))onClose();};
  const readCurrent=async()=>{
    if(lock.current)return;
    lock.current=true;setBusy(true);setReadError('');setReview(null);setReloadNotice('');
    try{
      const dossier=await fetchCrmDossier(lead.id);
      if(dossier.lead.id!==lead.id)throw new Error('Le dossier reçu ne correspond pas à ce devis.');
      setReview(dossier.lead);
    }catch(e){setReadError(e instanceof Error?e.message:'Lecture du suivi impossible.');}
    finally{setBusy(false);lock.current=false;}
  };
  const adoptCurrent=()=>{
    if(busy||!review)return;
    if(dirty&&!window.confirm('Reprendre le suivi enregistré et remplacer votre saisie du suivi et de l’échange ? Aucune donnée ne sera enregistrée par cette opération.'))return;
    setLead(review);setOwner(review.assigneeId||'');setType(review.nextAction?.type||'');setDueDate(review.nextAction?.dueDate||'');setActionNote(review.nextAction?.note||'');
    setLogging(false);setChannel('phone');setOutcome('');setNote('');setDirty(false);setError('');setReadError('');setReview(null);
    setReloadNotice('Suivi rechargé. Aucune modification enregistrée.');onReloaded(review);
  };
  const complete=async()=>{
    if(lock.current||loading||loadError||dirty||review||closed||!lead.nextAction)return;
    lock.current=true;setBusy(true);setError('');
    try{
      const result=await saveRequestFollowUp(lead.id,{revision:lead.followUpRevision||0,complete:true});
      onSaved(result,false,true);
    }catch(e){setError(e instanceof Error?e.message:'Impossible de terminer cette action.');}
    finally{setBusy(false);lock.current=false;}
  };
  const save=async(e:FormEvent)=>{e.preventDefault();if(lock.current||loading||loadError||review||closed||!dirty)return;lock.current=true;setBusy(true);setError('');setReloadNotice('');try{const contact={channel,outcome:outcome as NonNullable<FollowUpUpdate['contact']>['outcome'],note};const result=await saveRequestFollowUp(lead.id,{revision:lead.followUpRevision||0,assigneeId:owner,action:type?{type:type as RequestAction['type'],dueDate,note:actionNote}:null,...(logging?{contact}:{})});setDirty(false);onSaved(result,logging);}catch(e){setError(e instanceof Error?e.message:'Enregistrement impossible.');}finally{setBusy(false);lock.current=false;}};
  return <dialog ref={dialog} className="crm-request-dialog quote-contact-dialog" aria-labelledby="quote-contact-title" onCancel={e=>{e.preventDefault();close();}}>
    <header><div><p className="crm-eyebrow">SUIVI COMMERCIAL</p><h2 id="quote-contact-title">Une suite claire pour ce devis.</h2><p>{draft.clientName} · {draft.reference}</p></div><button type="button" aria-label="Fermer le suivi du devis" disabled={busy} onClick={close}><X size={21}/></button></header>
    <div className="quote-contact-context"><span>{follow.deliveryLabel}</span>{closed?<p>Le dossier n’est plus au stade du suivi commercial.</p>:lead.nextAction?<p>Action actuellement prévue : {follow.actionLabel}. Elle reste dans le formulaire ci-dessous.</p>:<p>Aucune prochaine action enregistrée.</p>}{lead.lastCommercialContact&&<p>Dernier échange : {new Date(lead.lastCommercialContact.createdAt).toLocaleString('fr-FR',{timeZone:'Europe/Paris'})} · {contactOutcomes[lead.lastCommercialContact.outcome]}</p>}</div>
    {reloadNotice&&<p role="status">{reloadNotice}</p>}{closed&&<p role="status">Ce dossier a changé d’étape. Le suivi commercial est désormais en lecture seule ; consultez sa fiche pour poursuivre.</p>}
    <div className="quote-contact-links">{lead.phone&&<a href={'tel:'+lead.phone}><Phone size={15}/>Appeler {lead.phone}</a>}{lead.email&&<span>{lead.email}</span>}</div>
    <details className="quote-contact-message"><summary>Préparer un message de relance</summary><p>Texte à adapter et à copier dans votre messagerie. Le CRM n’envoie pas ce message.</p><label>Message proposé<textarea aria-label="Message de relance" rows={7} maxLength={6000} value={message} onChange={e=>{setMessage(e.target.value);setCopied(false);}}/></label><button type="button" className="crm-quiet-action" onClick={async()=>{try{await navigator.clipboard.writeText(message);setCopied(true);}catch{setError('Copie indisponible. Sélectionnez le texte du message pour le copier.');}}}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Message copié':'Copier le message'}</button><p>Copier le texte ne journalise pas un échange. Enregistrez ci-dessous uniquement une action réellement effectuée.</p></details>
    <form onSubmit={save} onChange={()=>setDirty(true)}>
      <fieldset disabled={busy||loading||!!loadError||!!review||closed}>
        <label className="quote-contact-toggle"><input type="checkbox" checked={logging} onChange={e=>setLogging(e.target.checked)}/><span><strong>Consigner un échange effectué</strong><small>À cocher uniquement après un appel ou un échange réel.</small></span></label>{logging&&<><div className="quote-contact-grid"><label>Canal<select aria-label="Canal de l’échange" value={channel} onChange={e=>setChannel(e.target.value as typeof channel)}>{Object.entries(contactChannels).map(([id,label])=><option key={id} value={id} disabled={id==='documents'}>{label as string}</option>)}</select></label><label>Résultat<select required aria-label="Résultat de l’échange" value={outcome} onChange={e=>setOutcome(e.target.value)}><option value="">Choisir le résultat constaté</option>{Object.entries(contactOutcomes).map(([id,label])=><option key={id} value={id}>{label as string}</option>)}</select></label></div>
        <label>Compte rendu {outcome==='changes'?'(obligatoire)':'(facultatif)'}<textarea aria-label="Compte rendu de l’échange" required={outcome==='changes'} rows={3} maxLength={1000} value={note} onChange={e=>setNote(e.target.value)} placeholder="Précisions du client, questions à traiter, disponibilités…"/></label>
        </>}<h3>La prochaine action</h3><p>Vérifiez la suite à donner avant d’enregistrer. Le statut du dossier et le devis restent inchangés.</p>
        <label>Responsable<select aria-label="Responsable du suivi commercial" value={owner} onChange={e=>setOwner(e.target.value)}><option value="">Non attribué</option>{owner&&!members.some(m=>m.id===owner)&&<option value={owner}>Compte à réattribuer</option>}{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></label>
        <div className="quote-contact-grid"><label>Prochaine action<select aria-label="Prochaine action commerciale" value={type} onChange={e=>setType(e.target.value as typeof type)}><option value="">Aucune action à prévoir</option>{Object.entries(actionLabels).filter(([id])=>id!=='documents'||type==='documents').map(([id,label])=><option key={id} value={id}>{label as string}</option>)}</select></label><label>Échéance<input aria-label="Échéance commerciale" type="date" required={!!type} disabled={!type} value={dueDate} onChange={e=>setDueDate(e.target.value)}/></label></div>
        {!!type&&<><div className="follow-up-date-shortcuts" role="group" aria-label="Raccourcis de relance">{([[1,'Demain'],[3,'Dans 3 jours'],[7,'Dans une semaine']] as const).map(([days,label])=><button type="button" key={days} aria-pressed={dueDate===followUpDateIn(days)} onClick={()=>{setDueDate(followUpDateIn(days));setDirty(true);}}><CalendarDays size={13}/>{label}</button>)}</div><label>Précision sur la prochaine action<input aria-label="Précision de l’action commerciale" maxLength={1000} value={actionNote} onChange={e=>setActionNote(e.target.value)}/></label></>}
        {!type&&<p>Aucune échéance de suivi ne sera créée. Sélectionnez une prochaine action si le dossier doit être repris.</p>}
        {lead.nextAction&&<div className="quote-contact-complete"><button type="button" className="crm-quiet-action" disabled={busy||dirty} onClick={()=>void complete()}><Check size={16}/>Marquer l’action comme terminée</button><p>{dirty?'Enregistrez vos modifications avant de terminer l’action.':'Termine uniquement l’action enregistrée, sans ajouter d’échange ni clôturer le dossier.'}</p></div>}
        <footer><button type="button" disabled={busy} className="crm-quiet-action" onClick={close}>Annuler</button><button className="requests-primary" disabled={busy||!dirty}>{busy?'Enregistrement…':logging?'Enregistrer l’échange et la suite':'Enregistrer le suivi'}</button></footer>
      </fieldset>
      {loading&&<p role="status">Chargement des responsables…</p>}{(error||loadError)&&<p role="alert" className="quote-contact-error">{error||loadError}</p>}{loadError&&<button type="button" className="crm-quiet-action" onClick={()=>setRetry(v=>v+1)}>Réessayer</button>}
      {error&&<button type="button" className="crm-quiet-action" disabled={busy} onClick={()=>void readCurrent()}>{busy?'Lecture en cours…':'Consulter le suivi actuel'}</button>}
      {readError&&<p role="alert" className="quote-contact-error">{readError} Votre saisie est conservée.</p>}
      {review&&<section ref={reviewPanel} tabIndex={-1} className="quote-contact-review" aria-label="Suivi actuellement enregistré"><h3>Le suivi actuellement enregistré</h3><p>Cette consultation ne remplace pas votre saisie.</p><dl><div><dt>Responsable</dt><dd>{review.assigneeId?review.assigneeName?.trim()||'Responsable à vérifier':'Non attribué'}</dd></div><div><dt>Prochaine action</dt><dd>{review.nextAction?quoteFollowUp(draft,review).actionLabel||'Dossier passé à une autre étape':'Aucune action enregistrée'}</dd></div>{review.nextAction?.note&&<div><dt>Précision</dt><dd>{review.nextAction.note}</dd></div>}{review.lastCommercialContact&&<div><dt>Dernier échange</dt><dd>{contactOutcomes[review.lastCommercialContact.outcome]}{review.lastCommercialContact.note&&' · '+review.lastCommercialContact.note}</dd></div>}</dl><div><button type="button" className="crm-quiet-action" onClick={adoptCurrent}>Reprendre ce suivi</button><button type="button" className="crm-quiet-action" onClick={()=>setReview(null)}>Garder ma saisie</button></div></section>}
    </form>
    {closed&&<button type="button" className="crm-quiet-action" onClick={close}>Fermer le suivi</button>}
  </dialog>;
}
