import {useEffect,useRef,useState} from 'react';
import './crmMoveClosure.css';
import {CheckCircle2, ClipboardCheck} from 'lucide-react';
import {saveCrmBooking,type MoveBooking,type MoveClosure} from '../services/crmService';
import type {QuoteLead} from '../types/crm';

export default function CrmMoveClosure({booking,disabled,onDirty,onBusy,onSaved}:{booking:MoveBooking;disabled:boolean;onDirty:()=>void;onBusy:(v:boolean)=>void;onSaved:(b:MoveBooking,l:QuoteLead)=>void}) {
  const [value,setValue]=useState<MoveClosure>(()=>({actualStart:'',actualEnd:'',observations:'',reservations:'',letterReceived:false,missingDocuments:'',followUp:'',owner:'',due:'',...booking.closure}));
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState('');
  const panel=useRef<HTMLDetailsElement>(null);
  useEffect(()=>{if(booking.closure){panel.current!.open=true;panel.current?.scrollIntoView({block:'start'});}},[]);
  const change=<K extends keyof MoveClosure>(key:K,v:MoveClosure[K])=>{setValue(old=>({...old,[key]:v,...(['followUp','owner','due'].includes(key)&&old[key]!==v?{resolved:false}:{})}));onDirty();setSuccess('');};
  const pending=!value.letterReceived||!!value.reservations.trim()||!!value.missingDocuments.trim();
  return <details ref={panel} className="mission-closure"><summary><CheckCircle2 size={20}/><span>{booking.closure?'Compte rendu de fin de mission':'Terminer la mission'}<small>{booking.closure?.followUp&&!booking.closure.resolved?'Une action reste à traiter':booking.closure?'Mission réalisée · compte rendu enregistré':'Horaires réels, retour terrain et documents'}</small></span></summary>
    {disabled&&!busy&&<p className="mission-hint">Enregistrez d’abord les modifications de la préparation pour compléter le compte rendu.</p>}
    {booking.closure?.updatedAt&&<p className="mission-hint">Dernière mise à jour : {new Date(booking.closure.updatedAt).toLocaleString('fr-FR',{timeZone:'Europe/Paris'})} · {booking.closure.updatedBy}</p>}
    <form onSubmit={async e=>{e.preventDefault();if(busy||disabled)return;setBusy(true);onBusy(true);setError('');try{const {updatedAt,updatedBy,...payload}=value;const result=await saveCrmBooking(booking.leadId,{revision:booking.revision,closure:payload});onSaved(result.booking,result.lead);setSuccess('Compte rendu enregistré. Aucune facture ni notification envoyée.');}catch(e){setError(e instanceof Error?e.message:'Enregistrement impossible.');}finally{setBusy(false);onBusy(false);}}}>
      <fieldset disabled={disabled||busy} className="mission-fields">
        <p>Renseignez les informations constatées après le déménagement. Horaires de Paris.</p>
        <div className="mission-two-columns">{(['actualStart','actualEnd'] as const).map(k=><label key={k}>{k==='actualStart'?'Début réel':'Fin réelle'}<input required type="datetime-local" value={value[k]} onChange={e=>change(k,e.target.value)}/></label>)}</div>
        {([['observations','Retour de l’équipe'],['reservations','Réserves ou incidents'],['missingDocuments','Documents restant à recevoir']] as const).map(([k,label])=><label key={k}>{label}<textarea aria-label={label} rows={2} maxLength={3000} value={value[k]} onChange={e=>change(k,e.target.value)}/></label>)}
        <label className="mission-check"><input type="checkbox" checked={value.letterReceived} onChange={e=>change('letterReceived',e.target.checked)}/><span>Lettre de voiture signée reçue<small>Ce contrôle confirme sa réception ; il ne téléverse pas le document.</small></span></label>
        <div className="closure-followup"><h3><ClipboardCheck size={17}/> Suite à donner</h3><p>{pending?'Une action est nécessaire pour traiter les réserves ou réunir les documents.':'Laissez vide si aucun suivi opérationnel ne reste à traiter.'}</p>
          <label>Action à traiter<textarea aria-label="Action à traiter" required={pending} rows={2} maxLength={3000} value={value.followUp} onChange={e=>change('followUp',e.target.value)}/></label>
          <label className="mission-check"><input type="checkbox" checked={value.resolved||false} onChange={e=>change('resolved',e.target.checked)}/><span>Action traitée · conserver le compte rendu</span></label><div className="mission-two-columns"><label>Responsable<input required={!!value.followUp.trim()} maxLength={160} value={value.owner} onChange={e=>change('owner',e.target.value)}/></label><label>Échéance<input required={!!value.followUp.trim()} type="datetime-local" value={value.due} onChange={e=>change('due',e.target.value)}/></label></div>
        </div>
        <p className="mission-hint">Le dossier passera en « Terminé ». La facturation devra être préparée séparément.</p>
        <button className="requests-primary">{busy?'Enregistrement…':booking.closure?'Enregistrer le compte rendu':'Confirmer la fin de mission'}</button>
      </fieldset>
      {error&&<p role="alert" className="mission-error">{error} Fermez puis rouvrez la mission si elle a été modifiée ailleurs.</p>}
      {success&&<p role="status" className="mission-success">{success}</p>}
    </form>
  </details>;
}
