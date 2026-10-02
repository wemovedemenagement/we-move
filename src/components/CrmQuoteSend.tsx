import {useRef,useState} from 'react';
import {Mail,Send,Paperclip,RefreshCw} from 'lucide-react';
import {prepareQuoteMail,sendQuoteMail,downloadQuoteMailPdf,type QuoteMailPreparation} from '../services/crmService';

const labels={accepted:'Transmis au serveur e-mail',sending:'Envoi en cours ou à vérifier',failed:'Envoi refusé',uncertain:'Envoi à vérifier'};
export default function CrmQuoteSend({id,disabled=false}:{id:string;disabled?:boolean}){
 const [data,setData]=useState<QuoteMailPreparation|null>(null),[subject,setSubject]=useState(''),[message,setMessage]=useState(''),[confirmed,setConfirmed]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const lock=useRef(false);
 const load=async()=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{const p=await prepareQuoteMail(id);setData(p);setSubject(p.subject);setMessage(p.message);setConfirmed(false);}catch(e){setError(e instanceof Error?e.message:'Chargement impossible.');}finally{lock.current=false;setBusy(false);}};
 const previous=data?.history.find(r=>r.revision===data.revision);
 return <section className="crm-quote-send" aria-label="Envoyer le devis par e-mail">
  <div className="quote-send-heading"><div><Mail size={18}/><strong>Envoyer au client</strong></div><button type="button" disabled={disabled||busy} onClick={()=>void load()}>{data?<><RefreshCw size={15}/>Actualiser</>:<><Send size={15}/>Préparer l’envoi</>}</button></div>
  <p>Le devis et ses annexes seront joints au message. La version envoyée sera conservée dans le dossier.</p>
  {disabled&&<p>Enregistrez les modifications avant de préparer l’envoi.</p>}
  {error&&<p role="alert" className="quote-send-alert">{error}</p>}{notice&&<p role="status">{notice}</p>}
  {data&&<div className="quote-send-body">
   <div className="quote-send-addresses"><p><small>De</small>{data.configuration.from||'Expéditeur à connecter'}</p><p><small>À</small><strong>{data.to||'E-mail client manquant'}</strong></p></div>
   {!data.configuration.ready&&<p className="quote-send-alert">{data.configuration.message}</p>}
   {data.issues.length>0&&<div className="quote-send-alert"><strong>À compléter dans le devis</strong><ul>{data.issues.map(issue=><li key={issue}>{issue}</li>)}</ul></div>}
   <label>Objet<input value={subject} maxLength={180} disabled={busy} onChange={e=>{setSubject(e.target.value);setConfirmed(false);}}/></label>
   <label>Message<textarea rows={8} maxLength={6000} value={message} disabled={busy} onChange={e=>{setMessage(e.target.value);setConfirmed(false);}}/></label>
   <p className="quote-send-attachment"><Paperclip size={16}/>Devis et annexes PDF · version {data.revision}</p>
   {previous?<p role="status">{labels[previous.state]}. Cette version ne sera pas envoyée deux fois.</p>:<><label className="quote-send-confirm"><input type="checkbox" checked={confirmed} disabled={busy||disabled} onChange={e=>setConfirmed(e.target.checked)}/>J’ai vérifié le destinataire, le message et le devis enregistré.</label><button type="button" className="quote-send-primary" disabled={busy||disabled||!confirmed||!data.configuration.ready||!!data.issues.length||!subject.trim()||!message.trim()} onClick={async()=>{
    if(lock.current)return;lock.current=true;setBusy(true);setError('');setNotice('');
    try{const result=await sendQuoteMail(id,{confirm:true,revision:data.revision,subject,message});setNotice(result.state==='accepted'?'Le serveur e-mail a accepté votre message. Cela ne confirme pas encore sa réception par le client.':result.error||labels[result.state]);setData(await prepareQuoteMail(id));setConfirmed(false);}catch(e){setError((e instanceof Error?e.message:'Envoi impossible.')+' Actualisez l’historique avant de réessayer.');try{setData(await prepareQuoteMail(id));}catch{/* Keep existing preparation visible. */}}finally{lock.current=false;setBusy(false);}
   }}><Send size={16}/>{busy?'Envoi en cours…':'Envoyer le devis'}</button></>}
   {!!data.history.length&&<div className="quote-send-history"><strong>Historique des envois</strong>{data.history.map(r=><article key={r.id}><div><strong>{labels[r.state]}</strong><small>{new Date(r.acceptedAt||r.createdAt).toLocaleString('fr-FR')} · {r.to} · version {r.revision}</small>{r.error&&<p>{r.error}</p>}</div><button type="button" onClick={()=>void downloadQuoteMailPdf(id,r.id).catch(()=>setError('Archive indisponible.'))}>PDF archivé</button></article>)}</div>}
  </div>}
 </section>;
}
