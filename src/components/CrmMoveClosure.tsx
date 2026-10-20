import {useEffect,useRef,useState} from 'react';
import {CheckCircle2,ClipboardCheck,Clock3,MessageSquare,ArrowRight} from 'lucide-react';
import {saveCrmBooking,type MoveBooking,type MoveClosure} from '../services/crmService';
import type {QuoteLead} from '../types/crm';
import {closureGuidance,changeClosure} from '../../shared/closureGuidance.mjs';
import {missionLocalTime} from '../../shared/missionFieldSheet.mjs';
import './crmMoveClosure.css';

export default function CrmMoveClosure({booking,disabled,disabledReason,onDirty,onBusy,onSaved}:{booking:MoveBooking;disabled:boolean;disabledReason?:string;onDirty:()=>void;onBusy:(v:boolean)=>void;onSaved:(b:MoveBooking,l:QuoteLead)=>void}) {
  const [value,setValue]=useState<MoveClosure>(()=>({actualStart:'',actualEnd:'',observations:'',reservations:'',letterReceived:false,missingDocuments:'',followUp:'',owner:'',due:'',...booking.closure}));
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(''),[attempted,setAttempted]=useState(false);
  const panel=useRef<HTMLDetailsElement>(null),lock=useRef(false);
  useEffect(()=>{if(booking.closure){if(panel.current)panel.current.open=true;panel.current?.scrollIntoView({block:'start'});}},[]);
  const guidance=closureGuidance(value);
  const invalid=(fieldId:string)=>attempted&&guidance.issues.some(issue=>issue.fieldId===fieldId);
  const change=<K extends keyof MoveClosure>(key:K,next:MoveClosure[K])=>{setValue(old=>changeClosure(old,key,next));onDirty();setSuccess('');setError('');};
  const focus=(id:string)=>{const field=panel.current?.querySelector<HTMLElement>('#'+id);if(!field)return;let parent=field.parentElement;while(parent&&parent!==panel.current){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}field.focus();field.scrollIntoView({block:'center'});};
  const followUpOpen=guidance.needsFollowUp||!!value.followUp.trim()||!!value.owner.trim()||!!value.due;
  return <details ref={panel} className="mission-closure">
    <summary><CheckCircle2 size={20}/><span>{booking.closure?'Compte rendu de fin de mission':'Retour d’intervention'}<small>{booking.closure?.followUp&&!booking.closure.resolved?'Une action reste à traiter':booking.closure?'Mission réalisée · compte rendu enregistré':'Horaires réels, retour terrain et documents'}</small></span></summary>
    {disabled&&!busy&&<p className="closure-disabled">{disabledReason||'Terminez les autres modifications du dossier avant de compléter le compte rendu.'}</p>}
    {booking.closure?.updatedAt&&<p className="closure-recorded">Dernière mise à jour : {new Date(booking.closure.updatedAt).toLocaleString('fr-FR',{timeZone:'Europe/Paris'})} · {booking.closure.updatedBy}</p>}
    <form noValidate onSubmit={async event=>{
      event.preventDefault();if(lock.current||disabled)return;setAttempted(true);setError('');
      const current=closureGuidance(value);if(current.issues.length){focus(current.issues[0].fieldId);return;}
      lock.current=true;setBusy(true);onBusy(true);
      try{
        const {updatedAt,updatedBy,...payload}=value;
        const result=await saveCrmBooking(booking.leadId,{revision:booking.revision,closure:payload});
        if(result.booking.closure)setValue(result.booking.closure);
        onSaved(result.booking,result.lead);setAttempted(false);setSuccess('Compte rendu enregistré. Aucune facture ni notification envoyée.');
      }catch(caught){setError(caught instanceof Error?caught.message:'Enregistrement impossible.');}
      finally{lock.current=false;setBusy(false);onBusy(false);}
    }}>
      <fieldset disabled={disabled||busy} className="mission-fields">
        <section className="closure-step" aria-labelledby="closure-hours-title">
          <h3 id="closure-hours-title"><span>01</span><Clock3 size={17}/>Les horaires constatés</h3>
          <p className="closure-plan">Réservation prévue : {missionLocalTime(booking.start)} → {missionLocalTime(booking.end)}.</p>
          <p>Renseignez les heures réelles, même si elles diffèrent du planning. Horaires de Paris.</p>
          <div className="mission-two-columns">{(['actualStart','actualEnd'] as const).map(key=><label key={key} htmlFor={'closure-'+key}>{key==='actualStart'?'Début réel *':'Fin réelle *'}<input id={'closure-'+key} required type="datetime-local" min={key==='actualEnd'?value.actualStart:undefined} aria-invalid={invalid('closure-'+key)} value={value[key]} onChange={event=>change(key,event.target.value)}/></label>)}</div>
        </section>
        <section className="closure-step" aria-labelledby="closure-feedback-title">
          <h3 id="closure-feedback-title"><span>02</span><MessageSquare size={17}/>Le retour du terrain</h3>
          <label htmlFor="closure-observations">Retour de l’équipe <small>Facultatif · déroulement et informations utiles au bureau.</small><textarea id="closure-observations" aria-label="Retour de l’équipe" rows={3} maxLength={3000} value={value.observations} onChange={event=>change('observations',event.target.value)}/></label>
          <label className="mission-check"><input type="checkbox" checked={value.letterReceived} onChange={event=>change('letterReceived',event.target.checked)}/><span>Lettre de voiture signée reçue<small>Cochez uniquement après réception. Ce contrôle ne téléverse pas le document.</small></span></label>
          <details className="closure-extra" open={!!value.reservations.trim()||!!value.missingDocuments.trim()}><summary>Réserves, incidents ou documents manquants</summary><div>{([['reservations','Réserves ou incidents'],['missingDocuments','Documents restant à recevoir']] as const).map(([key,label])=><label key={key} htmlFor={'closure-'+key}>{label}<textarea id={'closure-'+key} aria-label={label} rows={3} maxLength={3000} value={value[key]} onChange={event=>change(key,event.target.value)}/></label>)}</div></details>
        </section>
        <section className="closure-step" aria-labelledby="closure-followup-title">
          <h3 id="closure-followup-title"><span>03</span><ClipboardCheck size={17}/>La suite à donner</h3>
          {guidance.needsFollowUp?<div className="closure-reasons"><p>Une action est nécessaire pour ces points :</p><ul>{guidance.pendingReasons.map(reason=><li key={reason}>{reason}</li>)}</ul></div>:<p>Aucune action n’est imposée par les réserves ou les documents saisis. Vous pouvez ajouter un suivi si nécessaire.</p>}
          <details className="closure-extra" open={followUpOpen}><summary>{followUpOpen?'Action, responsable et échéance':'Ajouter un suivi facultatif'}</summary><div>
            <label htmlFor="closure-followUp">Action à traiter{guidance.needsFollowUp?' *':''}<textarea id="closure-followUp" aria-invalid={invalid('closure-followUp')} aria-label="Action à traiter" required={guidance.needsFollowUp} rows={2} maxLength={3000} value={value.followUp} onChange={event=>change('followUp',event.target.value)}/></label>
            <div className="mission-two-columns"><label htmlFor="closure-owner">Responsable{guidance.hasFollowUp?' *':''}<input id="closure-owner" aria-invalid={invalid('closure-owner')} required={guidance.hasFollowUp} maxLength={160} value={value.owner} onChange={event=>change('owner',event.target.value)}/></label><label htmlFor="closure-due">Échéance{guidance.hasFollowUp?' *':''}<input id="closure-due" aria-invalid={invalid('closure-due')} required={guidance.hasFollowUp} type="datetime-local" value={value.due} onChange={event=>change('due',event.target.value)}/></label></div>
            <label className="mission-check"><input type="checkbox" checked={value.resolved||false} onChange={event=>change('resolved',event.target.checked)}/><span>Action traitée · conserver le compte rendu<small>Modifier l’action, ses conditions, son responsable ou son échéance remet le suivi en attente.</small></span></label>
          </div></details>
        </section>
        {attempted&&guidance.issues.length>0&&<div className="closure-validation" role="alert"><strong>Quelques informations restent à préciser</strong><ul>{guidance.issues.map(issue=><li key={issue.fieldId}><button type="button" onClick={()=>focus(issue.fieldId)}>{issue.label}<ArrowRight size={14}/></button></li>)}</ul></div>}
        <div className="closure-submit"><p>{booking.closure?'Les corrections seront enregistrées sur le compte rendu.':'Le dossier passera en « Terminé ». La facturation se prépare séparément.'}</p><button className="requests-primary" disabled={busy||disabled}>{busy?'Enregistrement…':booking.closure?'Enregistrer le compte rendu':'Enregistrer et terminer la mission'}</button></div>
      </fieldset>
      {error&&<p role="alert" className="mission-error">{error} Vos saisies sont conservées. Fermez puis rouvrez la mission si elle a été modifiée ailleurs.</p>}
      {success&&<p role="status" className="mission-success">{success}</p>}
    </form>
  </details>;
}
