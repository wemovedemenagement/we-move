import { ArrowRight, Box, CalendarDays, TrendingUp } from 'lucide-react';
import type { QuoteLead } from '../types/crm';
import { pipelineStage } from './CrmPipeline';

type Props = {
  tab: 'planning' | 'storage' | 'statistics';
  leads: QuoteLead[];
  isDark: boolean;
  onOpen: (lead: QuoteLead) => void;
};

export default function CrmOperationsPanel({ tab, leads, isDark, onOpen }: Props) {
  const panel = isDark ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900';
  const title = isDark ? 'text-white' : 'text-slate-900';
  const planning = tab === 'planning';
  const storage = tab === 'storage';
  const Icon = planning ? CalendarDays : storage ? Box : TrendingUp;
  const scheduled = leads.filter(lead => pipelineStage(lead) === 'planifie');
  const waiting = leads.filter(lead => pipelineStage(lead) === 'accepte');
  const stored = leads.filter(lead => lead.storageRequired && lead.status !== 'refuse');
  const rows = storage ? stored : [...scheduled, ...waiting].sort((a, b) => (a.moveDate || '9999').localeCompare(b.moveDate || '9999'));
  return <section className="space-y-6">
    <div className="flex items-start gap-3"><div className="rounded-xl bg-sky-500/10 p-3 text-sky-600"><Icon size={23}/></div><div><h2 className={`text-2xl font-bold ${title}`}>{planning ? 'Planification des déménagements' : storage ? 'Garde-meubles' : 'Statistiques'}</h2><p className="mt-2 text-sm text-slate-500">{planning ? 'Les missions prévues et les dossiers acceptés qui restent à organiser.' : storage ? 'Les dossiers comportant une demande de stockage.' : 'Indicateurs calculés à partir des dossiers actuellement chargés.'}</p></div></div>
    {tab === 'statistics' ? <>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{[
        ['Demandes', leads.length],
        ['Devis en attente de réponse', leads.filter(lead => lead.status === 'devis_envoye').length],
        ['À planifier', waiting.length],
        ['Missions planifiées', scheduled.length],
      ].map(([label, value]) => <div key={label} className={`rounded-2xl border p-6 ${panel}`}><p className="text-sm text-slate-500">{label}</p><p className="mt-4 text-3xl font-bold">{value}</p></div>)}</div>
      <p className="text-sm text-slate-500">Ces compteurs reflètent les dossiers chargés, enregistrés sur le serveur. Les montants encaissés et l’historique des périodes ne sont pas encore raccordés.</p>
    </> : <>
      {planning && <div className="flex flex-wrap gap-3 text-sm"><span className="rounded-full bg-emerald-500/10 px-4 py-2 text-emerald-600">{scheduled.length} mission(s) planifiée(s)</span><span className="rounded-full bg-amber-500/10 px-4 py-2 text-amber-600">{waiting.length} dossier(s) à planifier</span></div>}
      {storage && <p className={`rounded-xl border p-4 text-sm ${panel}`}>Le suivi des box, des entrées et des sorties reste à configurer. Les dossiers ci-dessous indiquent un besoin de stockage, pas une occupation confirmée.</p>}
      {rows.length === 0 ? <div className={`rounded-2xl border border-dashed p-10 text-center ${panel}`}><p className="font-semibold">{storage ? 'Aucune demande de stockage' : 'Aucun déménagement à organiser'}</p><p className="mt-2 text-sm text-slate-500">Les dossiers concernés apparaîtront ici automatiquement.</p></div> : <div className="space-y-3">{rows.map(lead => <article key={lead.id} className={`flex flex-col gap-4 rounded-2xl border p-5 sm:flex-row sm:items-center sm:justify-between ${panel}`}><div className="min-w-0"><p className="text-xs text-slate-500">{lead.id}</p><h3 className="mt-1 font-semibold">{lead.fullName}</h3><p className="mt-2 break-words text-sm text-slate-500">{storage ? `${lead.volume ? `${lead.volume} m³ de volume total à déménager` : `Volume à estimer`} · volume à stocker à confirmer` : pipelineStage(lead) === 'planifie' ? `${lead.scheduledTime} · ${lead.assignedTruckName || 'Véhicule affecté'}` : `À planifier · date souhaitée : ${lead.moveDate || 'à définir'}`}</p></div><button type="button" onClick={() => onOpen(lead)} className="flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-[#0082CA] px-4 py-3 text-sm font-semibold text-white hover:bg-sky-700">Ouvrir le dossier <ArrowRight size={15}/></button></article>)}</div>}
    </>}
  </section>;
}
