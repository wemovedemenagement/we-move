import {createCrmLeadMatcher} from '../../shared/crmSearch.mjs';
import {useUnsavedChanges} from '../hooks/useUnsavedChanges';
import {requestCity} from '../../shared/requestCity.mjs';
import {actionLabels,followUpBucket,parisToday} from '../../shared/followUp.mjs';
import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Plus, RefreshCw, Search, ArrowRight, X, Phone, Mail, Globe, Inbox, CalendarDays, MapPin, SlidersHorizontal, Check, ArrowUpRight, LayoutGrid, List, ChevronLeft, ChevronRight, MoreHorizontal, FileText, Pencil, Trash2 } from 'lucide-react';
import {updateQuoteLead} from '../services/crmService';
import type { QuoteLead, QuoteStatus } from '../types/crm';

export const requestChannels = [
  ['site', 'Site internet'], ['telephone', 'Téléphone'], ['ads', 'Publicité / Ads'],
  ['recommandation', 'Recommandation'], ['partenaire', 'Partenaire'], ['email', 'E-mail'],
  ['crm_creation_manuelle', 'Saisie interne'], ['autre', 'Autre'],
] as const;
export function requestChannel(source: string) {
  return requestChannels.some(([id]) => id === source) ? source : ['page_devis', 'modal_devis', 'modal_devis_rapide', 'formulaire_site', 'formulaire_client', 'estimation_volume'].includes(source) ? 'site' : 'autre';
}
export const channelName = (source: string) => requestChannels.find(([id]) => id === requestChannel(source))?.[1] || 'Autre';
export const requestStatus = {nouveau:'Nouvelle',prise_contact:'Contact établi',visite_technique:'Visite',devis_brouillon:'Devis en préparation',devis_envoye:'Devis envoyé',confirme:'Acceptée',refuse:'Non retenue',termine:'Terminée'};
export const shortReference = (id:string) => id.length>22 ? id.slice(0,8)+'…'+id.slice(-6).toUpperCase() : id;
export const requestDate = (value:string) => value ? new Date(value.length===10?value+'T12:00:00':value).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric'}) : 'À définir';
type Props = { leads: QuoteLead[]; loading: boolean; error: string; syncedAt: string; isDark: boolean; onRefresh: () => void; onCreate: () => void; onOpen: (lead: QuoteLead) => void; onVisit: (lead: QuoteLead) => void; onQuote: (lead: QuoteLead) => void; onEdit: (lead: QuoteLead) => void; onDelete?: (lead: QuoteLead) => Promise<void> };
export default function CrmRequests({leads,loading,error,syncedAt,onRefresh,onCreate,onOpen,onVisit,onQuote,onEdit,onDelete}:Props) {
  const [preferences]=useState(()=>{try{return JSON.parse(sessionStorage.getItem('wemove_request_preferences')||'{}');}catch{return {};}});
  const [search,setSearch]=useState(''),[channel,setChannel]=useState(preferences.channel||'all'),[status,setStatus]=useState(preferences.status||'all');
  const [sort,setSort]=useState(preferences.sort||'newest'),[view,setView]=useState<'grid'|'list'>(preferences.view==='grid'?'grid':'list');
  useEffect(()=>{try{sessionStorage.setItem('wemove_request_preferences',JSON.stringify({channel,status,sort,view}));}catch{}},[channel,status,sort,view]);
  const [page,setPage]=useState(1),[limit,setLimit]=useState(9),[pageSize,setPageSize]=useState(10);
  const [dueFilter,setDueFilter]=useState('all'),[today,setToday]=useState(()=>parisToday());
  const [selected,setSelected]=useState<string[]>([]),[target,setTarget]=useState<QuoteStatus>('prise_contact');
  const [showFilters,setShowFilters]=useState(false);
  const [busy,setBusy]=useState(false),[message,setMessage]=useState('');
  const [deleting,setDeleting]=useState<QuoteLead|null>(null);
  const actionLock=useRef(false);
  const selectAll=useRef<HTMLInputElement>(null);
  useEffect(()=>{const timer=setInterval(()=>setToday(parisToday()),60000);return()=>clearInterval(timer);},[]);
  useEffect(()=>{setPage(1);setLimit(9);setSelected([]);},[search,channel,status,sort,dueFilter,view,pageSize]);
  useEffect(()=>{setSelected(ids=>ids.filter(id=>leads.some(l=>l.id===id)));},[leads]);
  const query=search.trim().toLocaleLowerCase('fr');
  const matches=createCrmLeadMatcher(search);
  const rows=leads.filter(lead=>(dueFilter==='all'||followUpBucket(lead,today)===dueFilter)&&(status==='all'||lead.status===status)&&(channel==='all'||requestChannel(lead.source)===channel)&&matches(lead)).sort((a,b)=>{
    const date=b.createdAt.localeCompare(a.createdAt);
    return (sort==='oldest'?-date:sort==='az'?a.fullName.localeCompare(b.fullName,'fr'):sort==='za'?b.fullName.localeCompare(a.fullName,'fr'):sort==='source'?channelName(a.source).localeCompare(channelName(b.source),'fr')||date:date)||a.id.localeCompare(b.id);
  });
  const pages=Math.max(1,Math.ceil(rows.length/pageSize)),currentPage=Math.min(page,pages);
  const visible=view==='grid'?rows.slice(0,limit):rows.slice((currentPage-1)*pageSize,currentPage*pageSize);
  const allVisible=visible.length>0&&visible.every(l=>selected.includes(l.id));
  useEffect(()=>{if(selectAll.current)selectAll.current.indeterminate=!allVisible&&visible.some(l=>selected.includes(l.id));},[selected,visible,allVisible]);
  const filtered=!!query||channel!=='all'||status!=='all'||dueFilter!=='all';
  const reset=()=>{setSearch('');setChannel('all');setStatus('all');setDueFilter('all');};
  const toggle=(id:string)=>setSelected(ids=>ids.includes(id)?ids.filter(x=>x!==id):[...ids,id]);
  const changeStatus=async(ids:string[],next:QuoteStatus)=>{
    if(actionLock.current||!ids.length)return;
    actionLock.current=true;setBusy(true);setMessage('');
    const failed:string[]=[];let count=0;
    for(const id of ids){try{const saved=await updateQuoteLead(id,{status:next,expectedUpdatedAt:leads.find(l=>l.id===id)?.updatedAt});if(!saved)throw new Error();count++;}catch{failed.push(id);}}
    setSelected(failed);setMessage(`${count} demande${count>1?'s':''} mise${count>1?'s':''} à jour.${failed.length?` ${failed.length} échec(s) : les demandes concernées restent sélectionnées pour réessayer.`:''}`);
    actionLock.current=false;setBusy(false);onRefresh();
  };
  return <section className="crm-requests requests-premium requests-studio" aria-labelledby="requests-title">
    <div className="requests-heading"><div><span className="crm-eyebrow">VOTRE RELATION CLIENT</span><h2 id="requests-title">Demandes</h2><p>Vos demandes, organisées. Vos prochaines actions, évidentes.</p></div><button className="requests-primary" onClick={onCreate}><Plus size={18}/>Nouvelle demande</button></div>
    <div className="requests-priorities" aria-label="Priorités des demandes">
      {[{id:'all',label:'Toutes les demandes',count:leads.length,note:'Votre portefeuille clients',icon:Inbox,active:status==='all'&&dueFilter==='all'}, {id:'new',label:'À prendre en charge',count:leads.filter(l=>l.status==='nouveau').length,note:'Nouvelles demandes',icon:Plus,active:status==='nouveau'&&dueFilter==='all'}, {id:'overdue',label:'À relancer',count:leads.filter(l=>followUpBucket(l,today)==='overdue').length,note:'Actions en retard',icon:CalendarDays,active:dueFilter==='overdue'&&status==='all'}].map(item=><button key={item.id} disabled={busy||!syncedAt} aria-pressed={item.active} onClick={()=>{reset();setStatus(item.id==='new'?'nouveau':'all');setDueFilter(item.id==='overdue'?'overdue':'all');}}><span className="request-priority-icon"><item.icon size={19}/></span><span className="request-priority-copy"><span>{item.label}</span><small>{item.note}</small></span><strong>{syncedAt?item.count:'—'}</strong><ArrowUpRight size={15}/></button>)}
    </div>
    <div className="requests-board">
      <div className="requests-board-top"><div className="request-reminders" aria-label="Filtrer les relances">{[['all','Tous les projets'],['today','Aujourd’hui'],['overdue','En retard']].map(([id,label])=><button disabled={busy} key={id} aria-pressed={dueFilter===id} onClick={()=>setDueFilter(id)}>{label}</button>)}</div><div className="requests-view-switch"><button aria-label="Vue en grille" aria-pressed={view==='grid'} disabled={busy} onClick={()=>setView('grid')}><LayoutGrid size={17}/></button><button aria-label="Vue liste" aria-pressed={view==='list'} disabled={busy} onClick={()=>setView('list')}><List size={18}/></button><button className="requests-sync" onClick={onRefresh} disabled={loading||busy} aria-label="Actualiser les demandes"><RefreshCw size={16} className={loading?'animate-spin':''}/></button></div></div>
      <fieldset className="requests-toolbar" disabled={busy}>
        <label className="requests-search"><Search size={18}/><span className="sr-only">Rechercher une demande</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un client, une ville…"/>{search&&<button type="button" aria-label="Effacer la recherche" onClick={()=>setSearch('')}><X size={15}/></button>}</label>
        <button className="requests-filter-toggle" type="button" aria-expanded={showFilters} aria-controls="request-advanced-filters" onClick={()=>setShowFilters(!showFilters)}><SlidersHorizontal size={16}/>Filtres{(status!=='all'||channel!=='all')&&<span>{Number(status!=='all')+Number(channel!=='all')}</span>}</button>
        <label className="requests-sort"><span className="sr-only">Trier par</span><select aria-label="Trier par" value={sort} onChange={e=>setSort(e.target.value)}><option value="newest">Plus récent d’abord</option><option value="oldest">Plus ancien d’abord</option><option value="az">Nom : A → Z</option><option value="za">Nom : Z → A</option><option value="source">Par source</option></select></label>
      </fieldset>
      {showFilters&&<fieldset id="request-advanced-filters" className="requests-advanced" disabled={busy}><label>Statut<select aria-label="Statut" value={status} onChange={e=>setStatus(e.target.value)}><option value="all">Tous les statuts</option>{Object.entries(requestStatus).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><label>Source<select aria-label="Source" value={channel} onChange={e=>setChannel(e.target.value)}><option value="all">Toutes les sources</option>{requestChannels.map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label></fieldset>}
      {filtered&&<div className="requests-active-filters" aria-label="Filtres actifs">{status!=='all'&&<button disabled={busy} onClick={()=>setStatus('all')}>{requestStatus[status as QuoteStatus]}<X size={13}/></button>}{channel!=='all'&&<button disabled={busy} onClick={()=>setChannel('all')}>{channelName(channel)}<X size={13}/></button>}{dueFilter!=='all'&&<button disabled={busy} onClick={()=>setDueFilter('all')}>{dueFilter==='today'?'Aujourd’hui':'En retard'}<X size={13}/></button>}<button disabled={busy} onClick={reset}>Tout effacer</button></div>}
      <div className="requests-sync-caption">{loading?'Actualisation en cours…':error&&syncedAt?'Données affichées à vérifier · actualisation interrompue':syncedAt?'Actualisé à '+syncedAt:'Connexion aux demandes…'}</div>
      {error&&<div role="alert" className="requests-error">{error}<button onClick={onRefresh}>Réessayer</button></div>}
      {message&&<p role="status" className="requests-feedback">{message}</p>}
      {rows.length>0&&<div className="requests-selection"><label><input ref={selectAll} type="checkbox" disabled={busy} checked={allVisible} onChange={()=>setSelected(ids=>allVisible?ids.filter(id=>!visible.some(l=>l.id===id)):[...new Set([...ids,...visible.map(l=>l.id)])])}/>Sélectionner cette {view==='grid'?'vue':'page'}</label><span>{rows.length} résultat{rows.length>1?'s':''}</span>{filtered&&<button onClick={reset} disabled={busy}>Réinitialiser</button>}</div>}
      {selected.length>0&&<div className="requests-bulk"><strong>{selected.length} sélectionnée{selected.length>1?'s':''}</strong><label><span className="sr-only">Statut à appliquer à la sélection</span><select disabled={busy} value={target} onChange={e=>setTarget(e.target.value as QuoteStatus)}>{Object.entries(requestStatus).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label><button disabled={busy} onClick={()=>void changeStatus([...selected],target)}>{busy?'Enregistrement…':'Appliquer le statut'}</button><button disabled={busy} aria-label="Annuler la sélection" onClick={()=>setSelected([])}><X size={16}/></button><small>Le statut est mis à jour. Aucun document n’est envoyé.</small></div>}
      {!syncedAt&&loading&&<div role="status" className="requests-empty">Chargement de vos demandes…</div>}
      {!error&&syncedAt&&rows.length===0&&<div className="requests-empty"><Inbox size={28}/><h3>{filtered?'Aucune demande ne correspond':'Vos prochains projets commencent ici'}</h3><p>{filtered?'Ajustez vos filtres pour retrouver un dossier.':'Les demandes du site et vos saisies apparaîtront ici.'}</p>{filtered&&<button className="requests-text-action" onClick={reset}>Effacer les filtres</button>}</div>}
      {view==='list'&&visible.length>0&&<div className="requests-column-labels" aria-hidden="true"><span/><span>CLIENT / ORIGINE</span><span>DÉMÉNAGEMENT</span><span>STATUT</span><span>PROCHAINE ACTION</span><span/></div>}
      <div className={'requests-collection requests-collection--'+view}>{visible.map(lead=><article key={lead.id} className="request-studio-card" data-selected={selected.includes(lead.id)}>
        <input className="request-studio-check" type="checkbox" aria-label={'Sélectionner '+lead.fullName} checked={selected.includes(lead.id)} disabled={busy} onChange={()=>toggle(lead.id)}/>
        <div className="request-studio-person"><span className="request-studio-avatar" aria-hidden="true">{lead.fullName.split(/\s+/).filter(Boolean).slice(0,2).map(s=>s[0]).join('').toUpperCase()}</span><div><button onClick={()=>onOpen(lead)}>{lead.fullName}</button><p>{lead.phone||lead.email||'Contact à compléter'}</p><small>{channelName(lead.source)}<span>·</span>{requestDate(lead.createdAt)}</small></div></div>
        <div className="request-studio-route"><p><span>{requestCity(lead.departureAddress)}</span><ArrowRight size={14}/><span>{requestCity(lead.arrivalAddress)}</span></p><small><CalendarDays size={13}/>{requestDate(lead.moveDate)}<span>·</span>{lead.volume?lead.volume+' m³':'Volume à estimer'}</small></div>
        <label className="request-studio-status" data-status={lead.status}><select aria-label={'Statut de '+lead.fullName} disabled={busy} value={lead.status} onChange={e=>void changeStatus([lead.id],e.target.value as QuoteStatus)}>{Object.entries(requestStatus).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select></label>
        <div className="request-studio-followup" data-due={followUpBucket(lead,today)}><span>{lead.nextAction?actionLabels[lead.nextAction.type]:'À organiser'}</span><small>{lead.nextAction?requestDate(lead.nextAction.dueDate):'Définir la prochaine étape'}</small></div>
        <div className="request-studio-actions"><button className="request-studio-open" aria-label={'Ouvrir le dossier de '+lead.fullName} onClick={()=>onOpen(lead)}>Dossier<ArrowUpRight size={15}/></button><button className="request-direct-edit" disabled={busy} onClick={()=>onEdit(lead)}><Pencil size={14}/>Modifier</button>{onDelete&&<button className="request-direct-delete" disabled={busy} onClick={()=>setDeleting(lead)}><Trash2 size={14}/>Supprimer</button>}<details onKeyDown={e=>{if(e.key==='Escape'){e.currentTarget.open=false;e.currentTarget.querySelector('summary')?.focus();}}}><summary aria-label={'Actions pour '+lead.fullName}><MoreHorizontal size={20}/></summary><div className="request-studio-menu"><button disabled={busy} onClick={()=>onEdit(lead)}><Pencil size={16}/>Modifier la demande</button><button disabled={busy} onClick={()=>onVisit(lead)}><CalendarDays size={16}/>Programmer une visite</button><button disabled={busy} onClick={()=>onQuote(lead)}><FileText size={16}/>Préparer un devis</button>{lead.phone&&<a href={'tel:'+lead.phone}><Phone size={16}/>Appeler le client</a>}{lead.email&&<a href={'mailto:'+lead.email}><Mail size={16}/>Écrire au client</a>}{onDelete&&<button className="request-delete-action" disabled={busy} onClick={()=>setDeleting(lead)}><Trash2 size={16}/>Supprimer la demande</button>}</div></details></div>
      </article>)}</div>
      {rows.length>0&&<div className="requests-pagination"><span>{view==='grid'?`${visible.length} sur ${rows.length} demandes`:`${(currentPage-1)*pageSize+1}–${Math.min(currentPage*pageSize,rows.length)} sur ${rows.length}`}</span>{view==='grid'?(limit<rows.length&&<button onClick={()=>setLimit(n=>n+9)}>Afficher plus <Plus size={15}/></button>):<><label><span className="sr-only">Demandes par page</span><select value={pageSize} disabled={busy} onChange={e=>setPageSize(Number(e.target.value))}>{[10,20,50].map(n=><option key={n} value={n}>{n} par page</option>)}</select></label><nav aria-label="Pagination des demandes"><button aria-label="Page précédente" disabled={currentPage===1||busy} onClick={()=>setPage(currentPage-1)}><ChevronLeft size={17}/></button><span>Page {currentPage} / {pages}</span><button aria-label="Page suivante" disabled={currentPage===pages||busy} onClick={()=>setPage(currentPage+1)}><ChevronRight size={17}/></button></nav></>}</div>}
    </div>
    {deleting&&onDelete&&<DeleteRequestDialog lead={deleting} onClose={()=>setDeleting(null)} onDelete={async()=>{await onDelete(deleting);setDeleting(null);setMessage('Demande supprimée.');}}/>}
  </section>;
}

export function NewRequestDialog({ onClose, onSave }: { onClose: () => void; onSave: (payload: Partial<QuoteLead>) => Promise<void> }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const lock = useRef(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [dirty,setDirty]=useState(false);
  useUnsavedChanges(dirty||busy);
  const close=()=>{if(!busy&&(!dirty||window.confirm('Fermer sans enregistrer cette demande ?')))onClose();};
  const [source, setSource] = useState('telephone');
  useEffect(() => { dialog.current?.showModal(); dialog.current?.querySelector<HTMLInputElement>('input[name=fullName]')?.focus(); }, []);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (lock.current) return;
    const form = new FormData(event.currentTarget);
    const text = (key: string) => String(form.get(key) || '').trim();
    if (!text('fullName') || (!text('phone') && !text('email'))) { setError('Indiquez le nom et au moins un téléphone ou un e-mail.'); return; }
    lock.current = true; setBusy(true); setError('');
    try { await onSave({ fullName: text('fullName'), phone: text('phone'), email: text('email'), source, sourceDetail: text('sourceDetail'), departureAddress: text('departureAddress'), arrivalAddress: text('arrivalAddress'), moveDate: text('moveDate'), notes: text('notes'), unknownVolume: true, volume: 0, formula: 'conseil', projectType: text('projectType') as QuoteLead['projectType'] }); }
    catch (err) { setError(err instanceof Error ? err.message : 'Enregistrement impossible. Réessayez.'); }
    finally { lock.current = false; setBusy(false); }
  };
  return <dialog ref={dialog} onCancel={event => { event.preventDefault(); close(); }} aria-labelledby="new-request-title" className="crm-request-dialog request-create-dialog">
    <div className="flex items-start justify-between gap-4"><div><h2 id="new-request-title" className="text-2xl font-semibold">Nouvelle demande</h2><p className="mt-2 text-sm text-slate-500">Un nom et un moyen de contact suffisent pour commencer.</p></div><button disabled={busy} onClick={close} aria-label="Fermer"><X size={20}/></button></div>
    <form onSubmit={submit} onChange={()=>setDirty(true)} aria-busy={busy} className="mt-6 space-y-4"><fieldset disabled={busy} className="space-y-4">
      <p className="request-form-step">Le client</p><label>Nom du client *<input autoFocus name="fullName" required maxLength={160} autoComplete="name"/></label>
      <div className="grid gap-4 sm:grid-cols-2"><label>Téléphone<input name="phone" type="tel" autoComplete="tel" maxLength={30}/></label><label>E-mail<input name="email" type="email" autoComplete="email" maxLength={254}/></label></div>
      <p className="text-xs text-slate-500">Un numéro de téléphone ou un e-mail suffit.</p>
      <p className="request-form-step">L’origine</p><div className="grid gap-4 sm:grid-cols-2"><label>Canal d’origine<select value={source} onChange={e => setSource(e.target.value)}>{requestChannels.filter(([id]) => id !== 'site').map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label><label>Projet<select name="projectType"><option value="particulier">Particulier</option><option value="entreprise">Entreprise</option></select></label></div>
      <label>Précision sur l’origine <span className="font-normal text-slate-400">(facultatif)</span><input name="sourceDetail" placeholder="Ex. Google Ads, nom du partenaire…" maxLength={200}/></label>
      <details><summary className="cursor-pointer py-2 text-sm font-semibold text-sky-600">Trajet et détails du projet (facultatif)</summary><div className="mt-3 space-y-4"><label>Départ<input name="departureAddress" maxLength={500}/></label><label>Arrivée<input name="arrivalAddress" maxLength={500}/></label><label>Date souhaitée<input name="moveDate" type="date"/></label><label>Notes<textarea name="notes" rows={3} maxLength={5000}/></label></div></details>
    </fieldset>{error && <p role="alert" className="text-sm text-rose-600">{error}</p>}<div className="flex justify-end gap-3 border-t border-slate-100 pt-4"><button disabled={busy} type="button" onClick={onClose} className="rounded-xl px-4 py-3 text-sm text-slate-500">Annuler</button><button disabled={busy} type="submit" className="rounded-xl bg-[#0082CA] px-5 py-3 text-sm font-semibold text-white">{busy ? 'Enregistrement…' : 'Enregistrer la demande'}</button></div></form>
  </dialog>;
}

function DeleteRequestDialog({lead,onClose,onDelete}:{lead:QuoteLead;onClose:()=>void;onDelete:()=>Promise<void>}) {
  const dialog=useRef<HTMLDialogElement>(null),lock=useRef(false);
  const [busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{const origin=document.activeElement as HTMLElement;dialog.current?.showModal();return()=>origin?.focus();},[]);
  const remove=async()=>{if(lock.current)return;lock.current=true;setBusy(true);setError('');try{await onDelete();}catch(e){setError(e instanceof Error?e.message:'Suppression impossible. Réessayez.');}finally{lock.current=false;setBusy(false);}};
  return <dialog ref={dialog} className="crm-request-dialog request-delete-dialog" aria-labelledby="delete-request-title" aria-describedby="delete-request-description" onCancel={e=>{e.preventDefault();if(!busy)onClose();}}><span className="request-delete-symbol"><Trash2 size={23}/></span><h2 id="delete-request-title">Supprimer cette demande ?</h2><p id="delete-request-description">La demande de <strong>{lead.fullName}</strong> sera définitivement supprimée. Cette action ne peut pas être annulée.</p><p className="request-delete-note">Un dossier lié à un devis ou à une réservation est conservé : sa suppression sera refusée.</p>{error&&<p role="alert" className="requests-error">{error}</p>}<div className="request-delete-buttons"><button autoFocus disabled={busy} onClick={onClose}>Annuler</button><button disabled={busy} onClick={()=>void remove()}>{busy?'Suppression…':'Supprimer définitivement'}</button></div></dialog>;
}
