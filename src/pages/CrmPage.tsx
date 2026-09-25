/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Download,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Box,
  CheckCircle2,
  Clock,
  Send,
  XCircle,
  FileText,
  Plus,
  Trash2,
  Eye,
  ChevronRight,
  TrendingUp,
  Euro,
  Layers,
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Building2,
  UserCheck,
  LayoutGrid,
  List
} from 'lucide-react';
import { QuoteLead, QuoteStatus, CrmStats } from '../types/crm';
import {
  fetchQuoteLeads,
  updateQuoteLead,
  deleteQuoteLead,
  fetchCrmStats,
  submitQuoteLead
} from '../services/crmService';

const STATUS_CONFIG: Record<QuoteStatus, { label: string; color: string; bg: string; icon: any }> = {
  nouveau: { label: 'Nouveau', color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: Clock },
  prise_contact: { label: 'Prise de contact', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: Phone },
  devis_envoye: { label: 'Devis envoyé', color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: Send },
  confirme: { label: 'Confirmé', color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle2 },
  refuse: { label: 'Refusé / Perdu', color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: XCircle },
  termine: { label: 'Terminé / Effectué', color: 'text-gray-700', bg: 'bg-gray-100 border-gray-300', icon: ShieldCheck }
};

export function CrmPage() {
  const [leads, setLeads] = useState<QuoteLead[]>([]);
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');
  const [selectedLead, setSelectedLead] = useState<QuoteLead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [agentName, setAgentName] = useState('Jean Dupont');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchQuoteLeads(selectedStatus, search);
      const crmStats = await fetchCrmStats();
      setLeads(data);
      setStats(crmStats);
    } catch (err) {
      console.error('Erreur chargement CRM:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, search]);

  const handleStatusChange = async (leadId: string, newStatus: QuoteStatus) => {
    const updated = await updateQuoteLead(leadId, {
      status: newStatus,
      newNote: `Statut changé vers "${STATUS_CONFIG[newStatus].label}".`,
      author: agentName
    });
    if (updated) {
      setLeads(prev => prev.map(l => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) setSelectedLead(updated);
      const crmStats = await fetchCrmStats();
      setStats(crmStats);
    }
  };

  const handlePriceUpdate = async (leadId: string, newPrice: number) => {
    const updated = await updateQuoteLead(leadId, {
      estimatedPrice: newPrice,
      newNote: `Tarif estimé ajusté à ${newPrice} € TTC.`,
      author: agentName
    });
    if (updated) {
      setLeads(prev => prev.map(l => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) setSelectedLead(updated);
      const crmStats = await fetchCrmStats();
      setStats(crmStats);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newNoteText.trim()) return;
    const updated = await updateQuoteLead(selectedLead.id, {
      newNote: newNoteText.trim(),
      author: agentName
    });
    if (updated) {
      setSelectedLead(updated);
      setLeads(prev => prev.map(l => (l.id === selectedLead.id ? updated : l)));
      setNewNoteText('');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce devis ?')) {
      await deleteQuoteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
      const crmStats = await fetchCrmStats();
      setStats(crmStats);
    }
  };

  const handleExportCSV = () => {
    if (!leads.length) return;
    const headers = ['Ref ID', 'Date', 'Statut', 'Client', 'Email', 'Telephone', 'Depart', 'Arrivee', 'Volume (m3)', 'Formule', 'Prix (EUR)'];
    const rows = leads.map(l => [
      l.id,
      new Date(l.createdAt).toLocaleDateString('fr-FR'),
      l.status,
      `"${l.fullName.replace(/"/g, '""')}"`,
      l.email,
      l.phone,
      `"${l.departureAddress.replace(/"/g, '""')}"`,
      `"${l.arrivalAddress.replace(/"/g, '""')}"`,
      l.volume,
      l.formula,
      l.estimatedPrice
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `wemove-devis-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCreateDemoLead = async () => {
    const demo = await submitQuoteLead({
      fullName: 'Marie Curie',
      email: 'm.curie@example.org',
      phone: '06 99 88 77 66',
      departureAddress: '15 Rue Pierre Curie, 75005 Paris',
      arrivalAddress: '3 Avenue de la Recherche, 91400 Orsay',
      volume: 28,
      formula: 'standard',
      projectType: 'particulier',
      notes: 'Test devis automatique CRM',
      source: 'test_admin_crm'
    });
    loadData();
    setSelectedLead(demo);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16">
      {/* Header Bar */}
      <header className="bg-[#0F172A] text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0082CA] flex items-center justify-center text-white font-bold text-lg shadow-sm">
              WM
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight">CRM We Move Premium</h1>
                <span className="text-xs bg-[#0082CA]/20 text-[#0082CA] border border-[#0082CA]/30 px-2 py-0.5 rounded-full font-mono font-medium">
                  v2.5 Sync
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Gestion des demandes de devis & suivi client de bout en bout
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-md border border-slate-700 text-xs">
              <UserCheck size={14} className="text-[#0082CA]" />
              <span className="text-slate-300">Agent :</span>
              <input
                type="text"
                value={agentName}
                onChange={e => setAgentName(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-hidden w-28 text-xs border-b border-slate-600 focus:border-[#0082CA]"
                title="Nom de l'agent commercial"
              />
            </div>

            <button
              type="button"
              onClick={handleCreateDemoLead}
              className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus size={14} /> Devis Test
            </button>

            <button
              type="button"
              onClick={handleExportCSV}
              className="px-3.5 py-1.5 rounded-md bg-[#0082CA] hover:bg-[#006FA8] text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
            >
              <Download size={14} /> Export CSV
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* KPI Summary Cards */}
        {stats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
              <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
                <span>Total Demandes</span>
                <Users size={16} className="text-slate-400" />
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono">{stats.totalLeads}</div>
              <div className="text-[11px] text-slate-500">Formulaires synchronisés</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs space-y-1">
              <div className="text-xs font-medium text-blue-600 flex items-center justify-between">
                <span>Nouveaux Leads</span>
                <Clock size={16} className="text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-blue-600 font-mono">{stats.newLeadsCount}</div>
              <div className="text-[11px] text-blue-600/80">En attente de traitement</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-2xs space-y-1">
              <div className="text-xs font-medium text-purple-600 flex items-center justify-between">
                <span>Devis Transmis</span>
                <Send size={16} className="text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-purple-600 font-mono">{stats.quotesSentCount}</div>
              <div className="text-[11px] text-purple-600/80">Offres envoyées</div>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-100 shadow-2xs space-y-1">
              <div className="text-xs font-medium text-emerald-600 flex items-center justify-between">
                <span>Dossiers Confirmés</span>
                <CheckCircle2 size={16} className="text-emerald-500" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 font-mono">{stats.confirmedCount}</div>
              <div className="text-[11px] text-emerald-600/80">Taux conv. : {stats.conversionRate}%</div>
            </div>

            <div className="col-span-2 sm:col-span-4 lg:col-span-1 bg-gradient-to-br from-[#0F172A] to-slate-800 text-white p-4 rounded-xl border border-slate-700 shadow-2xs space-y-1">
              <div className="text-xs font-medium text-slate-300 flex items-center justify-between">
                <span>Pipeline Estimé</span>
                <Euro size={16} className="text-[#0082CA]" />
              </div>
              <div className="text-2xl font-bold text-white font-mono">{stats.totalEstimatedRevenue.toLocaleString('fr-FR')} €</div>
              <div className="text-[11px] text-slate-400">Volume total : {stats.totalVolumeM3} m³</div>
            </div>
          </div>
        )}

        {/* Toolbar: Search, Filters & View Toggle */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col lg:flex-row items-center justify-between gap-4">
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Rechercher nom, email, ville, réf (ex: WM-2026)..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm text-slate-800 focus:outline-hidden focus:border-[#0082CA] focus:bg-white transition-colors"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
            <button
              type="button"
              onClick={() => setSelectedStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedStatus === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Tous ({stats?.totalLeads || 0})
            </button>
            {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map(st => (
              <button
                key={st}
                type="button"
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  selectedStatus === st
                    ? 'bg-[#0082CA] text-white border-[#0082CA] shadow-xs'
                    : `${STATUS_CONFIG[st].bg} ${STATUS_CONFIG[st].color}`
                }`}
              >
                {STATUS_CONFIG[st].label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 self-end lg:self-auto">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vue Tableau"
            >
              <List size={18} />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`p-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Vue Kanban"
            >
              <LayoutGrid size={18} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 bg-white rounded-xl border border-slate-200 shadow-2xs">
            <RefreshCw className="animate-spin mx-auto mb-2 text-[#0082CA]" size={28} />
            Chargement des devis synchronisés...
          </div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <Users className="mx-auto text-slate-300" size={48} />
            <h3 className="text-lg font-semibold text-slate-800">Aucune demande trouvée</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Aucun devis ne correspond à vos filtres actuels. Réinitialisez la recherche ou créez un devis de test.
            </p>
            <button
              type="button"
              onClick={() => { setSearch(''); setSelectedStatus('all'); }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium rounded-lg transition-colors cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : viewMode === 'table' ? (
          /* Table View */
          <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Réf & Date</th>
                    <th className="py-3.5 px-4">Client</th>
                    <th className="py-3.5 px-4">Trajet (Départ → Arrivée)</th>
                    <th className="py-3.5 px-4">Volume & Formule</th>
                    <th className="py-3.5 px-4">Tarif Estimé</th>
                    <th className="py-3.5 px-4">Statut CRM</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map(lead => {
                    const StatusIcon = STATUS_CONFIG[lead.status].icon;
                    return (
                      <tr
                        key={lead.id}
                        className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                          selectedLead?.id === lead.id ? 'bg-blue-50/50' : ''
                        }`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-slate-900 text-xs flex items-center gap-1.5">
                            <span className="text-[#0082CA]">{lead.id}</span>
                            {lead.projectType === 'entreprise' && (
                              <span className="bg-slate-100 text-slate-700 text-[10px] px-1.5 py-0.2 rounded border border-slate-200 font-sans font-normal">PRO</span>
                            )}
                          </div>
                          <div className="text-xs text-slate-400 mt-0.5">
                            {new Date(lead.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-900">{lead.fullName}</div>
                          <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                            <span className="flex items-center gap-1"><Mail size={12} /> {lead.email}</span>
                            {lead.phone && <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="text-xs text-slate-800 line-clamp-1 font-medium">
                            <MapPin size={12} className="inline text-blue-500 mr-1" />
                            {lead.departureAddress || 'Paris'}
                          </div>
                          <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                            <ArrowRight size={12} className="inline text-slate-400 mr-1" />
                            {lead.arrivalAddress || 'À préciser'}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-mono font-semibold text-slate-900 text-xs">
                            {lead.volume} m³
                          </div>
                          <div className="text-xs text-slate-500 capitalize">
                            Formule {lead.formula}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-mono font-bold text-slate-900">
                            {lead.estimatedPrice} €
                          </div>
                          <div className="text-[11px] text-slate-400">TTC estimé</div>
                        </td>

                        <td className="py-4 px-4" onClick={e => e.stopPropagation()}>
                          <select
                            value={lead.status}
                            onChange={e => handleStatusChange(lead.id, e.target.value as QuoteStatus)}
                            className={`px-2.5 py-1 rounded-md text-xs font-semibold border focus:outline-hidden cursor-pointer ${STATUS_CONFIG[lead.status].bg} ${STATUS_CONFIG[lead.status].color}`}
                          >
                            {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map(st => (
                              <option key={st} value={st}>
                                {STATUS_CONFIG[st].label}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="py-4 px-4 text-right" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedLead(lead)}
                              className="p-1.5 rounded-md hover:bg-slate-100 text-slate-600 transition-colors cursor-pointer"
                              title="Voir la fiche détaillée"
                            >
                              <Eye size={16} />
                            </button>
                            <a
                              href={`tel:${lead.phone}`}
                              className="p-1.5 rounded-md hover:bg-blue-50 text-blue-600 transition-colors cursor-pointer"
                              title="Appeler le client"
                            >
                              <Phone size={16} />
                            </a>
                            <a
                              href={`mailto:${lead.email}?subject=We%20Move%20-%20Votre%20devis%20${lead.id}`}
                              className="p-1.5 rounded-md hover:bg-purple-50 text-purple-600 transition-colors cursor-pointer"
                              title="Envoyer un email"
                            >
                              <Mail size={16} />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDelete(lead.id)}
                              className="p-1.5 rounded-md hover:bg-rose-50 text-rose-500 transition-colors cursor-pointer"
                              title="Supprimer"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Kanban View */
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
            {(['nouveau', 'prise_contact', 'devis_envoye', 'confirme', 'refuse'] as QuoteStatus[]).map(st => {
              const columnLeads = leads.filter(l => l.status === st);
              const colConfig = STATUS_CONFIG[st];
              return (
                <div key={st} className="bg-slate-100/70 p-3 rounded-xl border border-slate-200 flex flex-col min-h-[500px]">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${colConfig.color.replace('text-', 'bg-')}`} />
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">{colConfig.label}</h4>
                    </div>
                    <span className="text-xs font-mono font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full border border-slate-200">
                      {columnLeads.length}
                    </span>
                  </div>

                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {columnLeads.map(lead => (
                      <div
                        key={lead.id}
                        onClick={() => setSelectedLead(lead)}
                        className="bg-white p-3.5 rounded-lg border border-slate-200 shadow-2xs hover:shadow-md transition-shadow cursor-pointer space-y-2 group"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[#0082CA]">{lead.id}</span>
                          <span className="font-mono text-xs font-bold text-slate-900">{lead.estimatedPrice} €</span>
                        </div>

                        <div className="font-semibold text-slate-900 text-xs line-clamp-1">{lead.fullName}</div>

                        <div className="text-[11px] text-slate-500 space-y-0.5">
                          <div className="line-clamp-1"><MapPin size={10} className="inline text-blue-500 mr-1" />{lead.departureAddress}</div>
                          <div className="line-clamp-1"><ArrowRight size={10} className="inline text-slate-400 mr-1" />{lead.arrivalAddress}</div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>{lead.volume} m³ · {lead.formula}</span>
                          <span className="group-hover:text-[#0082CA] transition-colors flex items-center gap-0.5">Détails <ChevronRight size={12} /></span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Drawer Fiche Client & Devis Detail */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
          <div
            className="w-full max-w-2xl bg-white h-full shadow-2xl overflow-y-auto flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Header Drawer */}
            <div className="p-6 bg-[#0F172A] text-white flex items-center justify-between border-b border-slate-800 sticky top-0 z-10">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#0082CA] text-lg">{selectedLead.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_CONFIG[selectedLead.status].bg} ${STATUS_CONFIG[selectedLead.status].color}`}>
                    {STATUS_CONFIG[selectedLead.status].label}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mt-1">{selectedLead.fullName}</h3>
                <p className="text-xs text-slate-400">
                  Transmis le {new Date(selectedLead.createdAt).toLocaleString('fr-FR')} via {selectedLead.source}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Content Drawer */}
            <div className="p-6 space-y-6 flex-1">
              {/* Statut Modifier & Quick Actions */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Modifier le Statut CRM</label>
                  <select
                    value={selectedLead.status}
                    onChange={e => handleStatusChange(selectedLead.id, e.target.value as QuoteStatus)}
                    className="px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-hidden focus:border-[#0082CA] cursor-pointer"
                  >
                    {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map(st => (
                      <option key={st} value={st}>
                        {STATUS_CONFIG[st].label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Phone size={14} /> Appeler
                  </a>
                  <a
                    href={`https://wa.me/${selectedLead.phone.replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`mailto:${selectedLead.email}?subject=Votre%20Devis%20We%20Move%20${selectedLead.id}`}
                    className="px-3 py-1.5 bg-[#0082CA] hover:bg-[#006FA8] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Mail size={14} /> Email
                  </a>
                </div>
              </div>

              {/* Coordonnées Client */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Users size={14} /> Coordonnées du Prospect
                </h4>
                <div className="grid grid-cols-2 gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-500 block">Nom complet :</span>
                    <strong className="text-slate-900 font-semibold">{selectedLead.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Type de client :</span>
                    <strong className="text-slate-900 capitalize">{selectedLead.projectType}</strong>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Adresse Email :</span>
                    <a href={`mailto:${selectedLead.email}`} className="text-[#0082CA] underline">{selectedLead.email}</a>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Téléphone :</span>
                    <strong className="text-slate-900">{selectedLead.phone || 'Non renseigné'}</strong>
                  </div>
                </div>
              </div>

              {/* Détails du Trajet & Accès */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin size={14} /> Déménagement & Contraintes d'Accès
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-blue-50/60 p-3.5 rounded-xl border border-blue-100 space-y-1">
                    <span className="text-blue-600 font-bold uppercase text-[10px]">Lieu de Départ</span>
                    <div className="font-medium text-slate-900">{selectedLead.departureAddress || 'Paris'}</div>
                    <div className="text-slate-500">Étage : {selectedLead.departureFloor} · Ascenseur : {selectedLead.departureElevator ? 'Oui' : 'Non'}</div>
                  </div>

                  <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100 space-y-1">
                    <span className="text-emerald-600 font-bold uppercase text-[10px]">Lieu d'Arrivée</span>
                    <div className="font-medium text-slate-900">{selectedLead.arrivalAddress || 'À préciser'}</div>
                    <div className="text-slate-500">Étage : {selectedLead.arrivalFloor} · Ascenseur : {selectedLead.arrivalElevator ? 'Oui' : 'Non'}</div>
                  </div>
                </div>
              </div>

              {/* Spécifications & Calcul Tarif */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Box size={14} /> Prestation & Estimation Commerciale
                </h4>
                <div className="bg-white p-4 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center pb-3 border-b border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Volume</span>
                      <strong className="text-slate-900 font-mono text-sm">{selectedLead.volume} m³</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Formule</span>
                      <strong className="text-slate-900 capitalize text-sm">{selectedLead.formula}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[11px]">Date prévue</span>
                      <strong className="text-slate-900 text-sm">{selectedLead.moveDate || 'Flexible'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Monte-meubles :</span> {selectedLead.liftRequired ? 'Oui' : 'Non'}
                      <span className="mx-2 text-slate-300">|</span>
                      <span className="font-bold text-slate-800">Garde-meubles :</span> {selectedLead.storageRequired ? 'Oui' : 'Non'}
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 font-medium">Prix estimé :</span>
                      <input
                        type="number"
                        value={selectedLead.estimatedPrice}
                        onChange={e => handlePriceUpdate(selectedLead.id, Number(e.target.value))}
                        className="w-24 px-2 py-1 bg-slate-50 border border-slate-300 rounded font-mono font-bold text-slate-900 text-sm focus:outline-hidden focus:border-[#0082CA]"
                      />
                      <span className="font-bold text-slate-800">€ TTC</span>
                    </div>
                  </div>

                  {selectedLead.notes && (
                    <div className="pt-2 border-t border-slate-100 text-slate-600 bg-slate-50 p-2.5 rounded-lg">
                      <strong className="text-slate-800">Note du client :</strong> "{selectedLead.notes}"
                    </div>
                  )}
                </div>
              </div>

              {/* Historique & Notes Internes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MessageSquare size={14} /> Historique des Échanges & Notes Internes
                </h4>

                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ajouter une note de suivi (ex: rappel prévu le 28/09)..."
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-hidden focus:border-[#0082CA]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
                  >
                    Ajouter
                  </button>
                </form>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedLead.internalNotes?.map(note => (
                    <div key={note.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <strong className="text-slate-700">{note.author}</strong>
                        <span>{new Date(note.createdAt).toLocaleString('fr-FR')}</span>
                      </div>
                      <p className="text-slate-800">{note.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Drawer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleDelete(selectedLead.id)}
                className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1"
              >
                <Trash2 size={14} /> Supprimer le devis
              </button>

              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Fermer la fiche
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
