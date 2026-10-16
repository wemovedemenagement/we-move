import {useRef,useState} from 'react';
import {FileCheck2,History,CheckCircle2,Clock3} from 'lucide-react';
import {documentKinds} from '../../shared/documentChecklist.mjs';
import {parisToday} from '../../shared/followUp.mjs';
import {saveDocumentChecks,fetchDocumentCheckHistory,type DocumentCheckEvent} from '../services/crmService';
import type {QuoteLead} from '../types/crm';
import './crmDocumentChecklist.css';

type Kind='signedQuote'|'valueDeclaration';
type Input={received:boolean;receivedOn:string;reference:string};
const initial=(lead:QuoteLead)=>Object.fromEntries(Object.keys(documentKinds).map(key=>{const row=lead.documentChecklist?.[key as Kind];return [key,{received:row?.received||false,receivedOn:row?.receivedOn||'',reference:row?.reference||''}];})) as Record<Kind,Input>;
export default function CrmDocumentChecklist({lead,acceptedRevision,canEdit,disabled,onSaved,onDirty,onBusy,onReload,onAgreement}:{lead:QuoteLead;acceptedRevision:number;canEdit:boolean;disabled:boolean;onSaved:(lead:QuoteLead)=>void;onDirty:(dirty:boolean)=>void;onBusy:(busy:boolean)=>void;onReload:()=>void;onAgreement:()=>void}) {
  const [value,setValue]=useState(()=>initial(lead)),[reason,setReason]=useState(''),[dirty,setDirty]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
  const [events,setEvents]=useState<DocumentCheckEvent[]|null>(null),[next,setNext]=useState<number|null>(null),[historyError,setHistoryError]=useState(''),[historyBusy,setHistoryBusy]=useState(false);
  const lock=useRef(false);
  const mayEdit=canEdit&&['confirme','termine'].includes(lead.status)&&acceptedRevision>0;
  const change=(key:Kind,patch:Partial<Input>)=>{setValue(old=>({...old,[key]:{...old[key],...patch}}));setDirty(true);onDirty(true);setError('');};
  const submit=async(e:React.FormEvent)=>{
    e.preventDefault();if(lock.current||disabled||!mayEdit)return;lock.current=true;setBusy(true);onBusy(true);setError('');
    try{const result=await saveDocumentChecks(lead.id,{revision:lead.documentChecklist?.revision||0,acceptedQuoteRevision:acceptedRevision,...value,reason});setDirty(false);onDirty(false);onSaved(result.lead);}
    catch(e){setError(e instanceof Error?e.message:'Enregistrement impossible.');}
    finally{lock.current=false;setBusy(false);onBusy(false);}
  };
  const history=async(before?:number)=>{if(historyBusy)return;setHistoryBusy(true);setHistoryError('');try{const data=await fetchDocumentCheckHistory(lead.id,before);setEvents(old=>before?[...(old||[]),...data.events]:data.events);setNext(data.next);}catch(e){setHistoryError(e instanceof Error?e.message:'Historique indisponible.');}finally{setHistoryBusy(false);}};
  const correctionNeeded=(Object.keys(documentKinds) as Kind[]).some(key=>{const old=lead.documentChecklist?.[key];return old?.received&&(old.quoteRevision!==acceptedRevision||old.received!==value[key].received||old.receivedOn!==value[key].receivedOn||old.reference!==value[key].reference.trim());});
  return <section className="crm-document-checks" aria-label="Pièces reçues du client"><div className="document-check-heading"><FileCheck2 size={21}/><div><h3>Les pièces du client</h3><p>Vérifiez les documents réellement reçus et indiquez où les retrouver.</p></div></div>
    <p className="document-check-notice">Ce suivi ne dépose aucun fichier et ne crée aucune signature. Les pièces restent dans votre messagerie ou votre dossier papier.</p>
    {!acceptedRevision&&<div className="document-check-notice"><p>Enregistrez d’abord l’accord sur une version précise du devis pour confirmer ses pièces.</p><button type="button" className="crm-quiet-action" disabled={busy||disabled} onClick={onAgreement}>Vérifier l’accord client</button></div>}
    <form onSubmit={submit}><fieldset disabled={!mayEdit||disabled||busy}><div className="document-check-grid">{(Object.entries(documentKinds) as [Kind,string][]).map(([key,label])=>{
      const saved=lead.documentChecklist?.[key],stale=saved?.received&&saved.quoteRevision!==acceptedRevision,current=saved?.received&&!stale;
      return <article key={key} data-state={stale?'stale':current?'received':'missing'}><div className="document-check-state">{current?<CheckCircle2 size={17}/>:<Clock3 size={17}/>}<span>{stale?`À revérifier · ancienne version ${saved.quoteRevision}`:current?`Réception vérifiée · version ${saved.quoteRevision}`:'À réunir'}</span></div><h4>{label}</h4><label className="document-check-toggle"><input type="checkbox" checked={value[key].received} onChange={e=>change(key,{received:e.target.checked})}/><span>{key==='signedQuote'?'Devis signé reçu et vérifié':'Déclaration remplie reçue et vérifiée'}</span></label>
        {value[key].received&&<><label>Date de réception<input aria-label={`Date de réception · ${label}`} required type="date" max={parisToday()} value={value[key].receivedOn} onChange={e=>change(key,{receivedOn:e.target.value})}/></label><label>Où retrouver cette pièce ?<textarea aria-label={`Référence · ${label}`} required minLength={10} maxLength={500} rows={2} placeholder="E-mail du… ; référence du dossier papier…" value={value[key].reference} onChange={e=>change(key,{reference:e.target.value})}/></label>{saved?.verifiedAt&&<small>Vérifié le {new Date(saved.verifiedAt).toLocaleString('fr-FR',{timeZone:'Europe/Paris'})} · {saved.verifiedBy}</small>}</>}
      </article>;
    })}</div>
      {(dirty||correctionNeeded)&&<label className="document-check-reason">{correctionNeeded?'Motif de correction ou de nouvelle vérification':'Précision facultative'}<textarea aria-label="Motif de correction des pièces" required={correctionNeeded} minLength={correctionNeeded?10:undefined} maxLength={1000} rows={2} value={reason} onChange={e=>{setReason(e.target.value);setDirty(true);onDirty(true);}}/></label>}
      {mayEdit&&<div className="document-check-actions"><button type="submit" className="requests-primary" disabled={!dirty&&!correctionNeeded}>{busy?'Enregistrement…':`Enregistrer les réceptions · version ${acceptedRevision}`}</button>{dirty&&<button type="button" className="crm-quiet-action" onClick={()=>{setValue(initial(lead));setReason('');setDirty(false);onDirty(false);setError('');}}>Annuler la saisie</button>}</div>}
    </fieldset>{error&&<div role="alert" className="document-check-error"><p>{error}</p><button type="button" className="crm-quiet-action" disabled={busy||disabled} onClick={onReload}>Recharger les pièces</button></div>}{dirty&&<p className="document-check-notice">Réceptions non enregistrées. Les compteurs utilisent les dernières vérifications sauvegardées.</p>}</form>
    <div className="document-check-history"><button type="button" className="crm-quiet-action" disabled={historyBusy} onClick={()=>void history()}><History size={15}/>{historyBusy?'Chargement…':'Consulter l’historique des pièces'}</button>{historyError&&<p role="alert">{historyError}</p>}{events&&!historyError&&<>{!events.length?<p>Aucune réception enregistrée.</p>:events.map(event=><article key={event.revision}><strong>{new Date(event.at).toLocaleString('fr-FR',{timeZone:'Europe/Paris'})} · {event.actor}</strong>{event.reason&&<p>{event.reason}</p>}{event.changes.map(change=><div key={change.key}><b>{change.label}</b><p>{change.before?.received?`Avant : version ${change.before.quoteRevision} · ${change.before.receivedOn} · ${change.before.reference}`:'Avant : à réunir'}</p><p>{change.after.received?`Après : version ${change.after.quoteRevision} · ${change.after.receivedOn} · ${change.after.reference}`:'Après : à réunir'}</p></div>)}</article>)}{next&&<button type="button" className="crm-quiet-action" disabled={historyBusy} onClick={()=>void history(next)}>Afficher les vérifications précédentes</button>}</>}</div>
  </section>;
}
