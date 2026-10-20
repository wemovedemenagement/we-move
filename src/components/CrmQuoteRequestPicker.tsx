import {useState} from 'react';
import {ArrowRight,Search,FileText,Check} from 'lucide-react';
import type {QuoteLead,CrmQuoteDraft} from '../types/crm';
import {searchCrmLeads} from '../../shared/crmSearch.mjs';
import {requestCity} from '../../shared/requestCity.mjs';
import {requestStatus} from './CrmRequests';
import './crmQuoteRequestPicker.css';

type Props={leads:QuoteLead[];drafts:CrmQuoteDraft[];ready:boolean;busy:boolean;problem:string;onRetry:()=>void;onChoose:(lead:QuoteLead)=>void;onNewRequest:()=>void};
export default function CrmQuoteRequestPicker({leads,drafts,ready,busy,problem,onRetry,onChoose,onNewRequest}:Props){
  const [query,setQuery]=useState(''),[all,setAll]=useState(false),[limit,setLimit]=useState(6),[selectedId,setSelectedId]=useState('');
  const candidates=leads.filter(lead=>all||!['refuse','termine'].includes(lead.status));
  const matches=searchCrmLeads(candidates,query,candidates.length) as QuoteLead[];
  const selected=matches.find(lead=>lead.id===selectedId);
  const quotes=new Map(drafts.map(draft=>[draft.leadId,draft]));
  const existing=selected?quotes.get(selected.id):undefined;
  return <section id="quote-create" className="quote-request-picker" aria-labelledby="quote-picker-title">
    <header><h3 id="quote-picker-title">Quel dossier souhaitez-vous chiffrer ?</h3><p>Retrouvez le client. Son devis existant sera repris ; sinon, un brouillon sera préparé à partir de sa demande.</p></header>
    <fieldset disabled={busy||!ready}>
      <legend className="sr-only">Choisir le dossier du devis</legend>
      <label className="quote-picker-search"><Search size={17} aria-hidden="true"/><span className="sr-only">Rechercher le dossier à chiffrer</span><input type="search" value={query} placeholder="Nom, ville, téléphone ou e-mail…" onChange={e=>{setQuery(e.target.value);setLimit(6);setSelectedId('');}}/></label>
      <div className="quote-picker-options"><label><input type="checkbox" checked={all} onChange={e=>{setAll(e.target.checked);setLimit(6);setSelectedId('');}}/>Inclure les dossiers terminés ou non retenus</label><span aria-live="polite">{ready?`${matches.length} dossier${matches.length>1?'s':''}`:'Dossiers non vérifiés'}</span></div>
      {ready&&<div className="quote-picker-results">{matches.slice(0,limit).map(lead=>{const quote=quotes.get(lead.id);return <label key={lead.id} className="quote-picker-row" data-selected={selectedId===lead.id}>
        <input type="radio" name="quote-client-dossier" value={lead.id} checked={selectedId===lead.id} onChange={()=>setSelectedId(lead.id)} aria-label={`Choisir le dossier de ${lead.fullName} · ${lead.id}`}/>
        <span className="quote-picker-client"><strong>{lead.fullName}</strong><span>{requestCity(lead.departureAddress)}<ArrowRight size={13} aria-hidden="true"/>{requestCity(lead.arrivalAddress)}</span><small>{lead.phone||lead.email||'Coordonnées à compléter'}</small></span>
        <span className="quote-picker-context"><span>{requestStatus[lead.status]}</span><small>{quote?<><FileText size={12} aria-hidden="true"/>{quote.reference} · v{quote.revision}</>:'Aucun devis enregistré'}</small></span>
      </label>;})}
      {!matches.length&&<div className="quote-picker-empty"><strong>{leads.length?'Aucun dossier ne correspond.':'Aucune demande enregistrée.'}</strong><p>{leads.length?'Adaptez la recherche ou incluez les dossiers terminés.':'Créez d’abord une demande pour renseigner le client et son projet.'}</p></div>}
      {matches.length>limit&&<button type="button" className="crm-quiet-action quote-picker-more" onClick={()=>setLimit(value=>value+6)}>Afficher 6 dossiers supplémentaires</button>}</div>}
      <footer><div aria-live="polite">{selected?<><Check size={15} aria-hidden="true"/><span><strong>{selected.fullName}</strong><small>{existing?`Reprendre ${existing.reference} · version ${existing.revision}`:'Un nouveau brouillon sera préparé pour ce dossier.'}</small></span></>:<span>Sélectionnez un dossier pour continuer.</span>}</div><button type="button" className="quotes-new" disabled={!selected||!ready||busy} onClick={()=>{if(selected)onChoose(selected);}}>{busy?'Ouverture…':existing?'Reprendre le devis':'Préparer le devis'}<ArrowRight size={16}/></button></footer>
    </fieldset>
    {!ready&&!problem&&<p role="status">Chargement des dossiers et des devis…</p>}
    {problem&&<div role="alert" className="quote-picker-problem"><p>{problem} La sélection est conservée ; vérifiez les données avant de continuer.</p><button type="button" className="crm-quiet-action" disabled={busy} onClick={onRetry}>Revérifier les dossiers et devis</button></div>}
    <button type="button" className="quote-picker-new" disabled={busy} onClick={onNewRequest}>Le client n’a pas encore de dossier ? Créer une demande</button>
  </section>;
}
