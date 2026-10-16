import CrmStorage from '../components/CrmStorage';
import CrmVisitPhotos from '../components/CrmVisitPhotos';
import CrmTechnicalVisit from '../components/CrmTechnicalVisit';
import {useUnsavedChanges} from '../hooks/useUnsavedChanges';
import CrmVersion from '../components/CrmVersion';
import CrmPricingSettings from '../components/CrmPricingSettings';
import CrmCommandSearch from '../components/CrmCommandSearch';
import CrmVisits from '../components/CrmVisits';
import CrmStatistics from '../components/CrmStatistics';
import CrmResources from '../components/CrmResources';
import CrmBookingEditor from '../components/CrmBookingEditor';
import CrmPlanning from '../components/CrmPlanning';
import CrmToday from '../components/CrmToday';
import CrmBillingOverview from '../components/CrmBillingOverview';
import CrmInvoices from '../components/CrmInvoices';
import CrmHeaderActions from '../components/CrmHeaderActions';
import CrmSessionGate from '../components/CrmSessionGate';
import CrmRequestSummary from '../components/CrmRequestSummary';
import CrmQuotes from '../components/CrmQuotes';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { LayoutGrid, Inbox, FileText, CalendarDays, Receipt, Truck, Users, Box, BarChart3, Settings, ShieldCheck, Plus, RefreshCw, ArrowRight, X, Menu, Sun, Moon } from 'lucide-react';
import { Logo } from '../components/Logo';
import CrmRequests, { NewRequestDialog } from '../components/CrmRequests';
import CrmOperationsPanel from '../components/CrmOperationsPanel';
import { fetchQuoteLeads, submitQuoteLead, updateQuoteLead, deleteQuoteLead, createQuoteDraft, saveRequestFollowUp } from '../services/crmService';
import type { QuoteLead, QuoteStatus, CrmQuoteDraft, CrmIdentity } from '../types/crm';
import './crm-premium.css';
import './crm-colors.css';

const navigation = [
  {id:'dashboard', label:'Tableau de bord', icon:LayoutGrid}, {id:'requests', label:'Demandes', icon:Inbox},
  {id:'quotes', label:'Devis', icon:FileText}, {id:'visits', label:'Visites', icon:CalendarDays},
  {id:'invoices', label:'Factures', icon:Receipt}, {id:'planning', label:'Déménagements', icon:Truck},
  {id:'fleet', label:'Équipes et flotte', icon:Users}, {id:'storage', label:'Garde-meubles', icon:Box},
  {id:'statistics', label:'Stats', icon:BarChart3}, {id:'settings', label:'Paramètres', icon:Settings},
  {id:'access', label:'Gestion des accès', icon:ShieldCheck},
] as const;
type Tab = typeof navigation[number]['id'];
const statuses: Record<QuoteStatus,string> = {nouveau:'Nouvelle demande', prise_contact:'Contact établi', visite_technique:'Visite', devis_brouillon:'Devis en préparation', devis_envoye:'Devis envoyé', confirme:'Accepté', refuse:'Non retenu', termine:'Déménagement effectué'};
const unavailable: Partial<Record<Tab, {title:string; detail:string}>> = {

  access:{title:'Accès gérant',detail:'wemove.demenagement@gmail.com est le seul compte autorisé. Les rôles sont contrôlés par le serveur. Les collaborateurs seront ajoutés uniquement après validation de leurs adresses et de leurs droits.'},
};

export function CrmPage() { return <CrmSessionGate>{(identity,connect,logout)=><CrmWorkspace identity={identity} onConnect={connect} onLogout={logout}/>}</CrmSessionGate>; }
function CrmWorkspace({identity,onConnect,onLogout}:{identity:CrmIdentity;onConnect:()=>void;onLogout:()=>void}) {
  const [invoiceLeadId,setInvoiceLeadId]=useState<string|undefined>();
  const [invoiceDocumentId,setInvoiceDocumentId]=useState<string|undefined>();
  const [draftToOpen,setDraftToOpen] = useState<CrmQuoteDraft|null>(null);
  const prepareLock = useRef(false);
  const [preparing,setPreparing] = useState(false);
  const [tab, setTab] = useState<Tab>('dashboard');
  const [mobileNav, setMobileNav] = useState(false);
  const [dark, setDark] = useState(() => { try { return typeof window !== 'undefined' && localStorage.getItem('wemove_crm_theme') === 'dark'; } catch { return false; } });
  const [leads,setLeads] = useState<QuoteLead[]>([]);
  const [loading,setLoading] = useState(true);
  const [loaded,setLoaded] = useState(false);
  const [error,setError] = useState('');
  const [syncedAt,setSyncedAt] = useState('');
  const [create,setCreate] = useState(false);
  const [selected,setSelected] = useState<QuoteLead|null>(null);
  const [editorSection,setEditorSection] = useState<'summary'|'details'|'visit'|'move'>('summary');
  const lock = useRef(false);
  const refresh = async () => {
    if(lock.current) return;
    lock.current = true; setLoading(true);
    try { const data = await fetchQuoteLeads(); setLeads(data); setLoaded(true); setError(''); setSyncedAt(new Date().toLocaleTimeString('fr-FR')); }
    catch(e) { setError(e instanceof Error ? e.message : 'Lecture impossible.'); }
    finally {lock.current=false;setLoading(false);}
  };
  useEffect(() => {
    void refresh();
    const poll = () => {if(document.visibilityState === 'visible') void refresh();};
    const timer = window.setInterval(poll,20000);
    window.addEventListener('focus',poll);
    return () => {clearInterval(timer);window.removeEventListener('focus',poll);};
  },[]);
  const open = (lead:QuoteLead, section:typeof editorSection = 'summary') => {setSelected(lead);setEditorSection(section);};
  const prepareQuote = async (lead:QuoteLead) => {
    if(prepareLock.current)return;prepareLock.current=true;setPreparing(true);
    try {setDraftToOpen(await createQuoteDraft(lead.id));setTab('quotes');setError('');}
    catch(e) {setError(e instanceof Error?e.message:'Le brouillon n’a pas pu être créé.');}
    finally {prepareLock.current=false;setPreparing(false);}
  };
  const choose = (value:Tab) => {setTab(value);setMobileNav(false);};
  const panel = dark ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900';
  const visibleNavigation=navigation.filter(item=>(item.id!=='access'||identity.role==='gerant')&&(item.id!=='invoices'||identity.role!=='commercial'));
  const current = navigation.find(n=>n.id===tab)!;
  const unavailableModule = unavailable[tab];
  const empty = (title:string, detail:string) => <div className={`crm-surface border border-dashed p-8 sm:p-12 ${panel}`}><current.icon size={28} className="mb-5 text-sky-600"/><h3 className="text-lg font-semibold">{title}</h3><p className="mt-3 max-w-xl text-sm leading-7 text-slate-500">{detail}</p></div>;
  return <div className={`crm-workspace min-h-screen ${dark?'text-slate-100':'text-slate-900'}`} data-theme={dark?'dark':'light'}>
    <header className="crm-topbar sticky top-0 z-20 flex h-16 items-center justify-between border-b px-5"><div className="flex items-center gap-3"><button aria-label="Ouvrir la navigation" className="p-2 lg:hidden" onClick={()=>setMobileNav(!mobileNav)}><Menu size={20}/></button><h1>WE MOVE <span className="ml-2 font-normal text-slate-500">Espace de gestion</span></h1></div><div className="crm-topbar-tools"><CrmCommandSearch leads={leads} loaded={loaded} error={error} destinations={visibleNavigation.map(({id,label})=>({id,label}))} onNavigate={id=>choose(id as Tab)} onOpen={lead=>open(lead)} onCreate={()=>setCreate(true)}/><CrmHeaderActions identity={identity} dark={dark} loaded={loaded} error={error} leads={leads} onTheme={()=>{setDark(!dark);try{localStorage.setItem('wemove_crm_theme',dark?'light':'dark');}catch{}}} onConnect={onConnect} onLogout={onLogout} onSettings={()=>choose('settings')} onAccess={()=>choose('access')} onOpen={lead=>open(lead)}/></div></header>
    <div className="flex min-h-[calc(100vh-4rem)]">
      <aside className={`crm-sidebar sticky top-16 h-[calc(100vh-4rem)] w-64 shrink-0 overflow-y-auto ${mobileNav?'!fixed left-0 z-30 block shadow-xl':'hidden lg:block'}`}><div className="px-4"><div className="crm-brand"><Logo size="sm" showSubtitle/></div><nav className="crm-navigation flex flex-col gap-1" aria-label="Navigation du CRM">{visibleNavigation.map(item=><button key={item.id} aria-current={tab===item.id?'page':undefined} onClick={()=>choose(item.id)} className="flex items-center gap-3 rounded-xl px-4 py-3 text-left"><item.icon size={19}/><span>{item.label}</span></button>)}</nav></div></aside>
      <div className="flex min-w-0 flex-1 flex-col">
      <main className="crm-content min-w-0 flex-1 space-y-6">
        {tab!=='requests' && <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs text-slate-500">Gestion / {current.label}</p><button onClick={()=>void refresh()} disabled={loading} className="crm-quiet-action"><RefreshCw size={14} className={loading?'animate-spin':''}/>{loading?'Actualisation…':syncedAt?`Actualisé à ${syncedAt}`:'Actualiser'}</button></div>}
        {error && tab!=='requests' && <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">{error} {loaded?'Les dernières données reçues restent affichées ; elles peuvent être anciennes.':'Aucune donnée n’a pu être chargée.'}</div>}
        {!loaded && !error && <p role="status" className="p-6 text-sm text-slate-500">Chargement des données enregistrées…</p>}
        {tab==='dashboard' && <CrmToday error={error} onPrepare={(lead,target)=>open(lead,target)} onPlanning={()=>choose('planning')} finance={['gerant','secretaire'].includes(identity.role)?<CrmBillingOverview onOpen={id=>{setInvoiceLeadId(undefined);setInvoiceDocumentId(id);choose('invoices');}}/>:undefined} leads={leads} loaded={loaded} onOpen={lead=>open(lead)} onCreate={()=>setCreate(true)} onAction={(lead,target)=>{if(target==='quote')void prepareQuote(lead);else if(target==='invoice'&&identity.role!=='commercial'){setInvoiceDocumentId(undefined);setInvoiceLeadId(lead.id);choose('invoices');}else open(lead,target==='move'?'move':target==='visit'?'visit':'summary');}}/>}
        {tab==='requests' && <CrmRequests leads={leads} loading={loading} error={error} syncedAt={syncedAt} isDark={dark} onRefresh={()=>void refresh()} onCreate={()=>setCreate(true)} onOpen={lead=>open(lead)} onVisit={lead=>open(lead,'visit')} onQuote={lead=>void prepareQuote(lead)} onEdit={lead=>open(lead,'details')} onDelete={identity.role==='gerant'?async lead=>{await deleteQuoteLead(lead.id);setLeads(current=>current.filter(item=>item.id!==lead.id));void refresh();}:undefined}/>}
        {preparing && <p role="status" className="text-sm text-sky-700">Ouverture du brouillon enregistré…</p>}
        {tab==='quotes' && <CrmQuotes onLeadSaved={saved=>{setLeads(current=>current.map(l=>l.id===saved.id?saved:l));void refresh();}} onOpenDossier={lead=>open(lead)} leads={leads} isDark={dark} initialDraft={draftToOpen} onInitialConsumed={()=>setDraftToOpen(null)} onNewRequest={()=>setCreate(true)}/>}
        {tab==='visits' && <CrmVisits leads={leads} loaded={loaded} loading={loading} onRefresh={()=>void refresh()} onVisit={lead=>open(lead,'visit')} onOpen={lead=>open(lead)}/>}
        {tab==='storage' && loaded && <CrmStorage leads={leads} identity={identity} onLeadSaved={saved=>{setLeads(current=>current.map(l=>l.id===saved.id?saved:l));void refresh();}} onOpen={lead=>open(lead)}/>}
        {tab==='statistics'&&loaded&&<CrmStatistics leads={leads}/>}
        {tab==='fleet'&&<CrmResources identity={identity}/>}
        {tab==='planning'&&loaded&&<CrmPlanning leads={leads} onOpen={lead=>open(lead)} onFollowUp={lead=>open(lead,'move')} onPrepare={(lead,target)=>open(lead,target)}/>}
        {tab==='invoices' && <CrmInvoices leads={leads} identity={identity} initialLeadId={invoiceLeadId} initialDocumentId={invoiceDocumentId}/>}
        {unavailableModule && <><h2>{current.label}</h2>{empty(unavailableModule.title,unavailableModule.detail)}</>}
        {tab==='settings' && (identity.role==='gerant'?<CrmPricingSettings/>:<><h2>Paramètres</h2><p>La grille tarifaire est configurée par le gérant. Les propositions sont disponibles dans l’édition des devis.</p></>)}
      </main>
      <footer className="crm-footer">© {new Date().getFullYear()} We Move Déménagement. Tous droits réservés.<CrmVersion/></footer>
      </div>
    </div>
    {create && <NewRequestDialog onClose={()=>setCreate(false)} onSave={async payload=>{const saved=await submitQuoteLead(payload);setLeads(current=>[saved,...current.filter(l=>l.id!==saved.id)]);setCreate(false);setSelected(saved);setEditorSection('summary');setTab('requests');void refresh();}}/>}
    {selected && editorSection==='summary' && <CrmRequestSummary lead={selected} canInvoice={identity.role!=='commercial'} onMove={()=>setEditorSection('move')} onInvoice={()=>{setInvoiceDocumentId(undefined);setInvoiceLeadId(selected.id);setSelected(null);choose('invoices');}} onSaveFollowUp={async payload=>{const saved=await saveRequestFollowUp(selected.id,payload);setSelected(saved);setLeads(current=>current.map(l=>l.id===saved.id?saved:l));}} onClose={()=>setSelected(null)} onEdit={()=>setEditorSection('details')} onVisit={()=>setEditorSection('visit')} onQuote={()=>{const lead=selected;setSelected(null);void prepareQuote(lead);}}/>}
    {selected && editorSection==='move' && <CrmBookingEditor canEdit={identity.role!=='commercial'} onEdit={()=>setEditorSection('details')} onQuote={()=>{const lead=selected;setSelected(null);void prepareQuote(lead);}} lead={selected} onClose={()=>setEditorSection('summary')} onSaved={saved=>{setSelected(saved);setLeads(current=>current.map(l=>l.id===saved.id?saved:l));void refresh();}}/>}
    {selected && (editorSection==='details'||editorSection==='visit') && <RequestEditor key={selected.id+editorSection} onQuote={()=>{const lead=selected;setSelected(null);void prepareQuote(lead);}} lead={selected} section={editorSection} onClose={()=>setEditorSection('summary')} onSave={async updates=>{const saved=await updateQuoteLead(selected.id,updates);if(!saved)throw new Error('Le dossier est introuvable.');setLeads(current=>current.map(l=>l.id===saved.id?saved:l));setSelected(saved);void refresh();}}/>}
  </div>;
}

function RequestEditor({lead,section,onClose,onSave,onQuote}:{onQuote:()=>void;lead:QuoteLead;section:'details'|'visit'|'move';onClose:()=>void;onSave:(updates:Partial<QuoteLead>&{newNote?:string;author?:string})=>Promise<void>}) {
  const dialog=useRef<HTMLDialogElement>(null);
  const [busy,setBusy]=useState(false),[error,setError]=useState(''),[success,setSuccess]=useState(false);
  const busyRef=useRef(false);
  const [dirty,setDirty]=useState(false);
  useUnsavedChanges(dirty||busy);
  const close=()=>{if(!busy&&(!dirty||window.confirm('Fermer sans enregistrer vos modifications ?')))onClose();};
  useEffect(()=>{dialog.current?.showModal();},[]);
  const submit=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();if(busyRef.current)return;
    const form=new FormData(event.currentTarget),text=(name:string)=>String(form.get(name)||'').trim();
    busyRef.current=true;setBusy(true);setError('');setSuccess(false);
    try {
      const updates:Partial<QuoteLead>&{newNote?:string;author?:string}={expectedUpdatedAt:lead.updatedAt};
      if(section==='details')Object.assign(updates,{expectedUpdatedAt:lead.updatedAt,fullName:text('fullName'),phone:text('phone'),email:text('email'),departureAddress:text('departureAddress'),arrivalAddress:text('arrivalAddress'),status:text('status') as QuoteStatus,notes:text('notes'),newNote:text('newNote'),author:'Saisie locale',moveDate:text('moveDate'),volume:Number(text('volume')),unknownVolume:!text('volume'),storageRequired:form.has('storageRequired')});
      if(section==='visit')Object.assign(updates,{visitDate:text('visitDate'),visitType:text('visitType'),visitStatus:text('visitStatus'),visitNotes:text('visitNotes'),technicalVisit:JSON.parse(text('technicalVisit')), ...(form.has('applyVisitVolume')?{volume:Number(text('visitVolume')),unknownVolume:false}:{})});
      if(section==='move')Object.assign(updates,{scheduledTime:text('scheduledTime'),assignedTruckName:text('assignedTruckName'),assignedDriver:text('assignedDriver'),teamMembers:text('teamMembers').split('\n').map(s=>s.trim()).filter(Boolean)});
      await onSave(updates);setDirty(false);setSuccess(true);if(section==='details')(event.target as HTMLFormElement).querySelector<HTMLTextAreaElement>('[name=newNote]')!.value='';
    }catch(e){setError(e instanceof Error?e.message:'Enregistrement impossible.');}finally{busyRef.current=false;setBusy(false);}
  };
  const input='mt-2 block min-h-11 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm';
  return <dialog ref={dialog} aria-labelledby="request-edit-title" onCancel={event=>{event.preventDefault();close();}} className="crm-request-dialog request-edit-dialog"><div className="flex items-start justify-between gap-4"><div><p className="text-xs text-slate-500 break-all">{lead.fullName}</p><h2 id="request-edit-title" className="mt-2 text-xl font-semibold">{section==='visit'?'Visite technique':section==='move'?'Organiser le déménagement':'Modifier les informations'}</h2></div><button disabled={busy} onClick={close} aria-label="Retour à la fiche" className="p-2"><X size={20}/></button></div><form onSubmit={submit} onInvalidCapture={event=>{const target=event.target as HTMLElement;let parent=target.parentElement;while(parent){if(parent instanceof HTMLDetailsElement)parent.open=true;parent=parent.parentElement;}window.requestAnimationFrame(()=>target.focus());}} onChange={()=>{setDirty(true);setSuccess(false);}} className="mt-6 space-y-5"><fieldset disabled={busy} className="space-y-5">
    {section==='details'&&<><label className="block text-sm">Nom<input required name="fullName" defaultValue={lead.fullName} className={input}/></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Téléphone<input name="phone" defaultValue={lead.phone} className={input}/></label><label className="text-sm">E-mail<input type="email" name="email" defaultValue={lead.email} className={input}/></label></div><label className="block text-sm">Départ<input name="departureAddress" defaultValue={lead.departureAddress} className={input}/></label><label className="block text-sm">Arrivée<input name="arrivalAddress" defaultValue={lead.arrivalAddress} className={input}/></label><div className="grid gap-4 sm:grid-cols-2"><label className="text-sm">Date souhaitée<input type="date" name="moveDate" defaultValue={lead.moveDate} className={input}/></label><label className="text-sm">Volume connu (m³)<input type="number" min="0" max="1000" step="0.1" name="volume" placeholder="À estimer" defaultValue={lead.volume||''} className={input}/></label></div><label className="block text-sm"><input type="checkbox" name="storageRequired" defaultChecked={lead.storageRequired} className="mr-2"/>Besoin de garde-meubles</label><label className="block text-sm">Avancement constaté<select name="status" defaultValue={lead.status} className={input}>{Object.entries(statuses).map(([id,label])=><option key={id} value={id}>{label}</option>)}</select><span className="mt-2 block text-xs text-slate-500">Ce suivi manuel ne crée ni n’envoie de devis ou facture.</span></label><label className="block text-sm">Informations du projet<textarea name="notes" defaultValue={lead.notes} rows={3} className={input}/></label><label className="block text-sm">Ajouter une note interne<textarea name="newNote" maxLength={5000} rows={2} className={input}/></label></>}
    {section==='visit'&&<><div className="visit-field-contact">{lead.phone&&<a href={'tel:'+lead.phone}>Appeler {lead.phone}</a>}<span>{lead.departureAddress} → {lead.arrivalAddress}</span></div><label className="block text-sm">Date et heure convenues<input required type="datetime-local" name="visitDate" defaultValue={lead.visitDate?.includes('T')?lead.visitDate:''} className={input}/></label>{lead.visitDate&&!lead.visitDate.includes('T')&&<p className="text-sm text-slate-500">Rendez-vous enregistré : {lead.visitDate}</p>}<label className="block text-sm">Format<select name="visitType" defaultValue={lead.visitType||'domicile'} className={input}><option value="domicile">À domicile</option><option value="visio">Visioconférence</option><option value="telephonique">Téléphone</option></select></label><label className="block text-sm">État<select name="visitStatus" defaultValue={lead.visitStatus||'programmee'} className={input}><option value="programmee">Programmée</option><option value="effectuee">Effectuée</option></select></label><label className="block text-sm">Informations pratiques<textarea name="visitNotes" defaultValue={lead.visitNotes} className={input}/></label><CrmTechnicalVisit lead={lead} onDirty={()=>{setDirty(true);setSuccess(false);}}/></>}
    {section==='move'&&<><p className="text-sm text-slate-500">Renseignez uniquement les affectations réellement confirmées.</p><label className="block text-sm">Date et heure confirmées<input required type="datetime-local" name="scheduledTime" defaultValue={lead.scheduledTime?.includes('T')?lead.scheduledTime:''} className={input}/></label><label className="block text-sm">Véhicule affecté<input required name="assignedTruckName" defaultValue={lead.assignedTruckName} placeholder="Nom ou immatriculation du véhicule" className={input}/></label><label className="block text-sm">Responsable de la mission<input name="assignedDriver" defaultValue={lead.assignedDriver} className={input}/></label><label className="block text-sm">Membres de l’équipe, un nom par ligne<textarea name="teamMembers" defaultValue={lead.teamMembers?.join('\n')} className={input}/></label></>}
    </fieldset>{error&&<p role="alert" className="text-sm text-rose-700">{error}</p>}{success&&<p role="status" className="text-sm text-emerald-700">Modifications enregistrées.</p>}<div className="flex justify-end gap-3 visit-field-footer">{section==='visit'&&<button type="button" disabled={busy||dirty} title={dirty?'Enregistrez la visite avant de préparer le devis':undefined} onClick={onQuote} className="requests-primary">Préparer le devis<ArrowRight size={15}/></button>}<button type="button" disabled={busy} onClick={close} className="rounded-xl border px-5 py-3 text-sm">Retour à la fiche</button><button type="submit" disabled={busy} className="rounded-xl bg-[#0082CA] px-5 py-3 text-sm font-semibold text-white">{busy?'Enregistrement…':'Enregistrer'}</button></div>
  </form>{section==='visit'&&<CrmVisitPhotos leadId={lead.id} disabled={busy} onBusy={setBusy}/>} {section==='details'&&lead.internalNotes?.length>0&&<div className="mt-6 space-y-3 border-t pt-5"><h3 className="font-semibold">Historique des notes</h3>{lead.internalNotes.map(note=><div key={note.id} className="rounded-xl bg-slate-50 p-3 text-sm"><p className="whitespace-pre-wrap">{note.content}</p><p className="mt-2 text-xs text-slate-500">{note.author} · {new Date(note.createdAt).toLocaleString('fr-FR')}</p></div>)}</div>}</dialog>;
}
