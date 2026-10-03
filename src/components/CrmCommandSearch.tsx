import {requestStatus} from './CrmRequests';
import {nextStep} from '../../shared/crmWorkflow.mjs';
import {useEffect,useRef,useState} from 'react';
import {Search,X,ArrowUpRight,FolderOpen,Command,Plus} from 'lucide-react';
import type {QuoteLead} from '../types/crm';
import {searchCrmLeads} from '../../shared/crmSearch.mjs';
import {requestCity} from '../../shared/requestCity.mjs';
type Destination={id:string;label:string};
const normal=(s:string)=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLocaleLowerCase('fr');
export default function CrmCommandSearch({leads,loaded,error,destinations,onNavigate,onOpen,onCreate}:{leads:QuoteLead[];loaded:boolean;error:string;destinations:Destination[];onNavigate:(id:string)=>void;onOpen:(lead:QuoteLead)=>void;onCreate:()=>void}) {
 const [opened,setOpened]=useState(false),[query,setQuery]=useState(''),[active,setActive]=useState(0),[limit,setLimit]=useState(8);
 const dialog=useRef<HTMLDialogElement>(null),input=useRef<HTMLInputElement>(null),origin=useRef<HTMLElement|null>(null);
 const open=()=>{if(document.querySelector('dialog[open]'))return;origin.current=document.activeElement as HTMLElement;setQuery('');setActive(0);setLimit(8);setOpened(true);};
 const close=()=>{dialog.current?.close();setOpened(false);origin.current?.focus();};
 useEffect(()=>{const key=(e:KeyboardEvent)=>{if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='k'){if(document.querySelector('dialog[open]'))return;e.preventDefault();open();}};window.addEventListener('keydown',key);return()=>window.removeEventListener('keydown',key);},[]);
 useEffect(()=>{if(opened){dialog.current?.showModal();input.current?.focus();}},[opened]);
 const allMatched=searchCrmLeads(leads,query,leads.length) as QuoteLead[];
 const matched=allMatched.slice(0,limit);
 const options:{id:string;title:string;detail:string;type:string;run:()=>void;status?:string;statusLabel?:string;next?:string}[]=[...(!query||normal('Nouvelle demande').includes(normal(query))?[{id:'new',title:'Nouvelle demande',detail:'Créer un dossier client',type:'action',run:onCreate}]:[]),...destinations.filter(d=>!query||normal(d.label).includes(normal(query))).map(d=>({id:'nav-'+d.id,title:d.label,detail:'Ouvrir le module',type:'page',run:()=>onNavigate(d.id)})),...matched.map(lead=>({id:'lead-'+lead.id,title:lead.fullName,detail:`${requestCity(lead.departureAddress)} → ${requestCity(lead.arrivalAddress)}${lead.phone?' · '+lead.phone:''}`,type:'lead',status:lead.status,statusLabel:requestStatus[lead.status],next:nextStep(lead).target==='invoice'?'Déménagement effectué':nextStep(lead).label,run:()=>onOpen(lead)}))];
 const current=Math.min(active,Math.max(0,options.length-1));
 const execute=(index:number)=>{const option=options[index];if(option){close();option.run();}};
 useEffect(()=>{if(opened)document.getElementById('crm-command-option-'+current)?.scrollIntoView({block:'nearest'});},[current,opened]);
 return <><button className="crm-command-trigger" aria-label="Rechercher un dossier ou un module" aria-haspopup="dialog" onClick={open}><Search size={17}/><span>Rechercher…</span><kbd>Ctrl K</kbd></button>
 {opened&&<dialog ref={dialog} className="crm-command-dialog" aria-labelledby="crm-command-title" onCancel={e=>{e.preventDefault();close();}} onClick={e=>{if(e.target===e.currentTarget){const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)close();}}}>
   <header><div><span className="crm-eyebrow">ACCÈS RAPIDE</span><h2 id="crm-command-title">Retrouvez votre dossier.</h2></div><button aria-label="Fermer la recherche" onClick={close}><X size={20}/></button></header>
   <div className="crm-command-input"><Search size={21}/><input ref={input} role="combobox" aria-label="Rechercher dans le CRM" aria-autocomplete="list" aria-expanded="true" aria-controls="crm-command-options" aria-activedescendant={options.length?'crm-command-option-'+current:undefined} value={query} maxLength={180} placeholder="Nom, téléphone, e-mail, ville, référence…" onChange={e=>{setQuery(e.target.value);setActive(0);setLimit(8);}} onKeyDown={e=>{if(e.key==='ArrowDown'){e.preventDefault();setActive((current+1)%Math.max(1,options.length));}if(e.key==='ArrowUp'){e.preventDefault();setActive((current-1+options.length)%Math.max(1,options.length));}if(e.key==='Enter'){e.preventDefault();execute(current);}}}/></div>
   {error&&<p className="crm-command-message" role="alert">Synchronisation indisponible : les dossiers affichés peuvent être anciens.</p>}
   {!loaded&&<p className="crm-command-message" role="status">Chargement des dossiers… Les modules restent accessibles.</p>}
   <div className="crm-command-results" id="crm-command-options" role="listbox" aria-label="Résultats de recherche">{options.map((o,i)=><button type="button" role="option" aria-selected={i===current} id={'crm-command-option-'+i} key={o.id} onMouseMove={()=>setActive(i)} onClick={()=>execute(i)}>{o.type==='lead'?<FolderOpen size={18}/>:o.type==='action'?<Plus size={18}/>:<Command size={18}/>}<span><strong>{o.title}</strong><small>{o.detail}</small>{'statusLabel' in o&&<span className="crm-search-context"><span data-status={o.status}>{o.statusLabel}</span><small>{o.next}</small></span>}</span><ArrowUpRight size={16}/></button>)}</div>
   {allMatched.length>matched.length&&<button className="crm-search-more" type="button" onClick={()=>setLimit(value=>value+8)}>Afficher plus de dossiers ({allMatched.length-matched.length} restant{allMatched.length-matched.length>1?'s':''})</button>}
   {loaded&&!options.length&&<p className="crm-command-message" role="status">Aucun résultat. Essayez un nom, une ville ou les derniers chiffres du téléphone.</p>}
   <footer><span>↑ ↓ parcourir · Entrée ouvrir · Échap fermer</span><span>{matched.length} dossier{matched.length===1?'':'s'} affiché{matched.length===1?'':'s'} sur {allMatched.length}</span></footer>
 </dialog>}</>;
}
