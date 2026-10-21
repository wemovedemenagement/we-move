import {useEffect,useRef,useState} from 'react';
import {History,ChevronDown,RefreshCw} from 'lucide-react';
import type {InternalNote} from '../types/crm';
import {fetchCrmDossier} from '../services/crmService';
import {requestedDate} from '../../shared/planningQueue.mjs';
import './crmFollowUpHistory.css';

const instant=(value:string)=>typeof value==='string'&&requestedDate(value.slice(0,10))&&/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)&&Number.isFinite(Date.parse(value))?Date.parse(value):null;
export default function CrmFollowUpHistory({leadId}:{leadId:string}){
 const lock=useRef(false),generation=useRef(0);
 const [notes,setNotes]=useState<InternalNote[]|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState(''),[readAt,setReadAt]=useState(''),[limit,setLimit]=useState(5);
 useEffect(()=>()=>{generation.current++;},[]);
 const load=async()=>{
  if(lock.current)return;
  lock.current=true;const request=++generation.current;setLoading(true);setError('');setNotes(null);setReadAt('');setLimit(5);
  try{
   const {lead}=await fetchCrmDossier(leadId);
   if(lead.id!==leadId)throw new Error('Le dossier reçu ne correspond pas à ce devis.');
   if(!Array.isArray(lead.internalNotes)||lead.internalNotes.some(note=>!note||typeof note.content!=='string'))throw new Error('Les notes du dossier sont indisponibles.');
   const ordered=[...lead.internalNotes].sort((a,b)=>(instant(b.createdAt)??Number.MIN_SAFE_INTEGER)-(instant(a.createdAt)??Number.MIN_SAFE_INTEGER));
   if(request===generation.current){setNotes(ordered);setReadAt(new Date().toLocaleTimeString('fr-FR',{timeZone:'Europe/Paris',hour:'2-digit',minute:'2-digit'}));}
  }catch(e){if(request===generation.current)setError(e instanceof Error?e.message:'Historique indisponible.');}
  finally{if(request===generation.current){setLoading(false);lock.current=false;}}
 };
 return <details className="crm-followup-history" onToggle={event=>{if(event.target===event.currentTarget&&event.currentTarget.open)void load();}}>
  <summary><History size={17} aria-hidden="true"/><span><strong>Historique du dossier</strong><small>Échanges, actions et notes enregistrés</small></span><ChevronDown size={16} aria-hidden="true"/></summary>
  <div className="crm-followup-history-content">
   <div className="crm-followup-history-toolbar"><p>{readAt?`Dernière lecture à ${readAt} · heure de Paris`:'Lecture des notes enregistrées'}</p><button type="button" disabled={loading} aria-label="Actualiser l’historique du dossier" onClick={()=>void load()}><RefreshCw size={14} aria-hidden="true"/>Actualiser</button></div>
   {loading&&<p role="status">Chargement de l’historique…</p>}
   {error&&<div role="alert" className="crm-followup-history-error"><p>{error} Votre saisie du suivi est conservée.</p><button type="button" onClick={()=>void load()}>Réessayer la lecture de l’historique</button></div>}
   {notes&&<>{notes.length===0?<p>Aucune note enregistrée dans ce dossier.</p>:<ol aria-label="Notes du dossier, les plus récentes en premier">{notes.slice(0,limit).map((note,index)=>{const date=instant(note.createdAt);return <li key={`${note.id||'note'}:${index}`}><div><strong>{typeof note.author==='string'&&note.author.trim()?note.author:'Auteur non renseigné'}</strong>{date===null?<span>Date non renseignée</span>:<time dateTime={note.createdAt}>{new Date(date).toLocaleString('fr-FR',{timeZone:'Europe/Paris',dateStyle:'medium',timeStyle:'short'})}</time>}</div><p>{note.content}</p></li>;})}</ol>}{notes.length>0&&<div className="crm-followup-history-more"><p>{Math.min(limit,notes.length)} sur {notes.length} entrées reçues</p>{limit<notes.length&&<button type="button" onClick={()=>setLimit(value=>value+5)}>Afficher plus</button>}</div>}</>}
  </div>
 </details>;
}
