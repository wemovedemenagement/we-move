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
  List,
  Lock,
  LogOut,
  Bell,
  Truck,
  FileCheck,
  CalendarDays,
  Settings,
  Sparkles,
  Printer,
  Share2,
  ChevronDown,
  UserPlus,
  Compass,
  Zap,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Check,
  AlertCircle,
  Sun,
  Moon,
  ExternalLink,
  Edit3,
  Sliders,
  DollarSign,
  Activity,
  CheckSquare,
  Video,
  Target,
  Award,
  Archive,
  Square,
  X
} from 'lucide-react';
import { Logo, LogoMark } from '../components/Logo';
import {
  QuoteLead,
  QuoteStatus,
  CrmStats,
  CrmUser,
  TruckResource,
  InvoiceDocument,
  QuoteDocument,
  QuoteDocStatus,
  InvoiceStatus,
  CustomerProfile
} from '../types/crm';
import {
  fetchQuoteLeads,
  updateQuoteLead,
  deleteQuoteLead,
  fetchCrmStats,
  submitQuoteLead,
  DEMO_CRM_USERS,
  DEFAULT_TRUCKS,
  DEFAULT_QUOTES,
  DEFAULT_INVOICES,
  DEFAULT_CUSTOMERS
} from '../services/crmService';

const STATUS_CONFIG: Record<QuoteStatus, { label: string; colorDark: string; bgDark: string; borderDark: string; colorLight: string; bgLight: string; borderLight: string; icon: any }> = {
  nouveau: { label: 'Nouveau Lead', colorDark: 'text-blue-400', bgDark: 'bg-blue-500/10', borderDark: 'border-blue-500/30', colorLight: 'text-blue-700', bgLight: 'bg-blue-50/90', borderLight: 'border-blue-200/80', icon: Clock },
  prise_contact: { label: 'Prise de Contact', colorDark: 'text-amber-400', bgDark: 'bg-amber-500/10', borderDark: 'border-amber-500/30', colorLight: 'text-amber-700', bgLight: 'bg-amber-50/90', borderLight: 'border-amber-200/80', icon: Phone },
  visite_technique: { label: 'Visite Technique', colorDark: 'text-indigo-400', bgDark: 'bg-indigo-500/10', borderDark: 'border-indigo-500/30', colorLight: 'text-indigo-700', bgLight: 'bg-indigo-50/90', borderLight: 'border-indigo-200/80', icon: Compass },
  devis_brouillon: { label: 'Devis Brouillon', colorDark: 'text-sky-400', bgDark: 'bg-sky-500/10', borderDark: 'border-sky-500/30', colorLight: 'text-sky-700', bgLight: 'bg-sky-50/90', borderLight: 'border-sky-200/80', icon: Edit3 },
  devis_envoye: { label: 'Devis Transmis', colorDark: 'text-purple-400', bgDark: 'bg-purple-500/10', borderDark: 'border-purple-500/30', colorLight: 'text-purple-700', bgLight: 'bg-purple-50/90', borderLight: 'border-purple-200/80', icon: Send },
  confirme: { label: 'Devis Accepté & Planifié', colorDark: 'text-emerald-400', bgDark: 'bg-emerald-500/10', borderDark: 'border-emerald-500/30', colorLight: 'text-emerald-700', bgLight: 'bg-emerald-50/90', borderLight: 'border-emerald-200/80', icon: CheckCircle2 },
  refuse: { label: 'Devis Refusé', colorDark: 'text-rose-400', bgDark: 'bg-rose-500/10', borderDark: 'border-rose-500/30', colorLight: 'text-rose-700', bgLight: 'bg-rose-50/90', borderLight: 'border-rose-200/80', icon: XCircle },
  termine: { label: 'Déménagement Effectué', colorDark: 'text-slate-300', bgDark: 'bg-slate-500/10', borderDark: 'border-slate-500/30', colorLight: 'text-slate-700', bgLight: 'bg-slate-100', borderLight: 'border-slate-200', icon: ShieldCheck }
};

type ActiveTab = 'dashboard' | 'pipeline' | 'commercial' | 'quotes_list' | 'invoices_list' | 'logistics' | 'customers' | 'settings';
type ThemeMode = 'dark' | 'light';

export function CrmPage() {
  // Theme Mode (Default is Clean Light Mode)
  const [theme, setTheme] = useState<ThemeMode>(() => {
    try {
      return (localStorage.getItem('wemove_crm_theme') as ThemeMode) || 'light';
    } catch {
      return 'light';
    }
  });

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('wemove_crm_theme', next);
  };

  // Authentication State
  const [currentUser, setCurrentUser] = useState<CrmUser | null>(() => {
    try {
      const stored = localStorage.getItem('wemove_crm_user');
      return stored ? JSON.parse(stored) : DEMO_CRM_USERS[0];
    } catch {
      return DEMO_CRM_USERS[0];
    }
  });

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // CRM Data State
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    try {
      if (typeof window !== 'undefined' && (window.location.pathname.includes('demandes') || window.location.hash.includes('demandes'))) {
        return 'pipeline';
      }
    } catch {}
    return 'pipeline';
  });
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'date-desc' | 'date-asc' | 'price-desc' | 'price-asc' | 'volume-desc' | 'name-asc'>('date-desc');
  const [leads, setLeads] = useState<QuoteLead[]>([]);
  const [stats, setStats] = useState<CrmStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'kanban'>('kanban');
  const [selectedLead, setSelectedLead] = useState<QuoteLead | null>(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [timeString, setTimeString] = useState('');

  // Commercial & Visites State (Multi-views)
  const [commercialViewMode, setCommercialViewMode] = useState<'calendar' | 'list' | 'map' | 'performance'>('calendar');
  const [selectedAgentFilter, setSelectedAgentFilter] = useState<string>('all');
  const [visitFormatFilter, setVisitFormatFilter] = useState<string>('all');

  // Modals & Drawers
  const [showCreateLeadModal, setShowCreateLeadModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState<InvoiceDocument | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerProfile | null>(null);
  
  // Workflow Specific Modals (Visite technique, Planification, Refus & Ordre de Mission)
  const [showVisitModal, setShowVisitModal] = useState<QuoteLead | null>(null);
  const [showScheduleModal, setShowScheduleModal] = useState<QuoteLead | null>(null);
  const [showRefuseModal, setShowRefuseModal] = useState<QuoteLead | null>(null);
  const [refusalReasonInput, setRefusalReasonInput] = useState<string>('Prix jugé trop élevé');
  const [showMissionOrderModal, setShowMissionOrderModal] = useState<QuoteLead | null>(null);

  const [visitForm, setVisitForm] = useState({
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '10:30',
    type: 'domicile' as 'domicile' | 'visio' | 'telephonique',
    notes: 'Visite de volumétrie et vérification des accès escalier.'
  });

  const DEFAULT_EQUIPMENT_ITEMS = [
    'Monte-meubles télescopique (10e ét.)',
    '50 Cartons renforcés + Adhésifs pro',
    '10 Housses étanches matelas',
    '20 Couvertures capitonnées d\'arrimage',
    'Sangles de manutention & Chariots',
    'Valise d\'outillage démontage/remontage'
  ];

  const [scheduleForm, setScheduleForm] = useState({
    truckId: DEFAULT_TRUCKS[0].id,
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '08:00',
    driver: DEFAULT_TRUCKS[0].driver,
    teamSize: 3,
    equipment: [
      '50 Cartons renforcés + Adhésifs pro',
      '10 Housses étanches matelas',
      '20 Couvertures capitonnées d\'arrimage',
      'Sangles de manutention & Chariots'
    ]
  });

  // Logistics, Devis & Factures local state
  const [trucks, setTrucks] = useState<TruckResource[]>(DEFAULT_TRUCKS);
  const [quotes, setQuotes] = useState<QuoteDocument[]>(DEFAULT_QUOTES);
  const [quotesSearch, setQuotesSearch] = useState('');
  const [quoteStatusFilter, setQuoteStatusFilter] = useState<string>('all');
  const [selectedQuoteIds, setSelectedQuoteIds] = useState<string[]>([]);
  const [editingQuote, setEditingQuote] = useState<QuoteDocument | null>(null);
  const [previewQuote, setPreviewQuote] = useState<QuoteDocument | null>(null);

  const [invoices, setInvoices] = useState<InvoiceDocument[]>(DEFAULT_INVOICES);
  const [invoicesSearch, setInvoicesSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState<string>('all');
  const [previewInvoice, setPreviewInvoice] = useState<InvoiceDocument | null>(null);
  const [customers, setCustomers] = useState<CustomerProfile[]>(DEFAULT_CUSTOMERS);

  // New Lead Form State
  const [newLeadForm, setNewLeadForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    projectType: 'particulier' as 'particulier' | 'entreprise',
    departureAddress: '',
    arrivalAddress: '',
    volume: 25,
    formula: 'standard' as any,
    estimatedPrice: 1450,
    notes: '',
    source: 'crm_creation_manuelle'
  });

  const getSourceBadge = (source: string) => {
    switch (source) {
      case 'telephone':
        return { label: '📞 Téléphone', bgDark: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30', bgLight: 'bg-emerald-50 text-emerald-700 border-emerald-200/70' };
      case 'recommandation':
        return { label: '🗣️ Bouche-à-oreille', bgDark: 'bg-purple-500/15 text-purple-400 border-purple-500/30', bgLight: 'bg-purple-50 text-purple-700 border-purple-200/70' };
      case 'ads':
        return { label: '📣 Ads', bgDark: 'bg-amber-500/15 text-amber-400 border-amber-500/30', bgLight: 'bg-amber-50 text-amber-700 border-amber-200/70' };
      case 'partenaire':
        return { label: '🤝 Partenaire', bgDark: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30', bgLight: 'bg-indigo-50 text-indigo-700 border-indigo-200/70' };
      case 'crm_creation_manuelle':
        return { label: '✍️ Saisie CRM', bgDark: 'bg-slate-500/15 text-slate-300 border-slate-500/30', bgLight: 'bg-slate-100 text-slate-700 border-slate-200' };
      case 'modal_devis':
      case 'page_devis':
      case 'estimation_volume':
      case 'site':
      default:
        return { label: '🌐 Site Web', bgDark: 'bg-sky-500/15 text-sky-400 border-sky-500/30', bgLight: 'bg-sky-50 text-sky-700 border-sky-200/70' };
    }
  };

  const filterAndSortLeads = (leadList: QuoteLead[]) => {
    return leadList
      .filter(l => {
        if (sourceFilter !== 'all') {
          if (sourceFilter === 'site') {
            const nonSiteSources = ['telephone', 'recommandation', 'ads', 'partenaire', 'crm_creation_manuelle'];
            if (nonSiteSources.includes(l.source)) return false;
          } else if (l.source !== sourceFilter) {
            return false;
          }
        }
        if (projectTypeFilter !== 'all' && l.projectType !== projectTypeFilter) {
          return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortOrder === 'date-desc') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        if (sortOrder === 'date-asc') return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortOrder === 'price-desc') return (b.estimatedPrice || 0) - (a.estimatedPrice || 0);
        if (sortOrder === 'price-asc') return (a.estimatedPrice || 0) - (b.estimatedPrice || 0);
        if (sortOrder === 'volume-desc') return (b.volume || 0) - (a.volume || 0);
        if (sortOrder === 'name-asc') return a.fullName.localeCompare(b.fullName, 'fr');
        return 0;
      });
  };

  // Clock tick
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeString(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    if (currentUser) {
      loadData();
    }
  }, [selectedStatus, search, currentUser]);

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoginError('');

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginError('Veuillez renseigner votre identifiant et votre mot de passe.');
      return;
    }

    const found = DEMO_CRM_USERS.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase());
    if (found || loginPassword === 'admin' || loginPassword === 'wemove2026') {
      const userToSet = found || DEMO_CRM_USERS[0];
      setCurrentUser(userToSet);
      localStorage.setItem('wemove_crm_user', JSON.stringify(userToSet));
    } else {
      setLoginError('Identifiants incorrects. Utilisez les accès de démo 1-clic ci-dessous.');
    }
  };

  const handleQuickDemoLogin = (user: CrmUser) => {
    setCurrentUser(user);
    localStorage.setItem('wemove_crm_user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('wemove_crm_user');
  };

  const handleStatusChange = async (leadId: string, newStatus: QuoteStatus) => {
    if (!currentUser) return;
    const updated = await updateQuoteLead(leadId, {
      status: newStatus,
      newNote: `Statut mis à jour vers "${STATUS_CONFIG[newStatus].label}".`,
      author: currentUser.name
    });
    if (updated) {
      setLeads(prev => prev.map(l => (l.id === leadId ? updated : l)));
      if (selectedLead?.id === leadId) setSelectedLead(updated);
      const crmStats = await fetchCrmStats();
      setStats(crmStats);
    }
  };

  const handleScheduleVisitSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showVisitModal || !currentUser) return;

    const visitDateTime = `${visitForm.date} à ${visitForm.time}`;
    const visitTypeName = visitForm.type === 'domicile' ? 'à domicile' : visitForm.type === 'visio' ? 'en visioconférence' : 'téléphonique';

    const updated = await updateQuoteLead(showVisitModal.id, {
      status: 'visite_technique',
      visitDate: visitDateTime,
      visitType: visitForm.type,
      visitStatus: 'programmee',
      visitNotes: visitForm.notes,
      newNote: `Visite technique ${visitTypeName} programmée le ${visitDateTime}. Notes : ${visitForm.notes || 'Aucune'}`,
      author: currentUser.name
    });

    if (updated) {
      setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
      if (selectedLead?.id === updated.id) setSelectedLead(updated);
      setShowVisitModal(null);
      const crmStats = await fetchCrmStats();
      setStats(crmStats);
    }
  };

  const handleDevisStatusChange = async (leadId: string, devisStatus: 'brouillon' | 'envoye' | 'accepte' | 'refuse') => {
    if (!currentUser) return;

    let targetLeadStatus: QuoteStatus = 'devis_brouillon';
    let noteMessage = '';

    if (devisStatus === 'brouillon') {
      targetLeadStatus = 'devis_brouillon';
      noteMessage = 'Devis créé en statut Brouillon.';
    } else if (devisStatus === 'envoye') {
      targetLeadStatus = 'devis_envoye';
      noteMessage = 'Devis officiel envoyé au client par Email / WhatsApp.';
    } else if (devisStatus === 'accepte') {
      targetLeadStatus = 'confirme';
      noteMessage = '🎉 Devis accepté et signé par le client ! Ouverture de l\'étape de planification logistique du déménagement.';
    } else if (devisStatus === 'refuse') {
      targetLeadStatus = 'refuse';
      noteMessage = 'Devis refusé par le client.';
    }

    const updated = await updateQuoteLead(leadId, {
      status: targetLeadStatus,
      devisStatus,
      newNote: noteMessage,
      author: currentUser.name
    });

    if (updated) {
      setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
      if (selectedLead?.id === updated.id) setSelectedLead(updated);
      const crmStats = await fetchCrmStats();
      setStats(crmStats);

      if (devisStatus === 'accepte') {
        setShowScheduleModal(updated);
        setScheduleForm({
          truckId: DEFAULT_TRUCKS[0].id,
          date: updated.moveDate || new Date().toISOString().split('T')[0],
          time: '08:00',
          driver: DEFAULT_TRUCKS[0].driver,
          teamSize: DEFAULT_TRUCKS[0].teamSize,
          equipment: DEFAULT_EQUIPMENT_ITEMS.slice(1, 5)
        });
      }
    }
  };

  const handleScheduleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showScheduleModal || !currentUser) return;

    const selectedTruck = trucks.find(t => t.id === scheduleForm.truckId) || DEFAULT_TRUCKS[0];
    const teamList = [`${scheduleForm.driver || selectedTruck.driver} (Chef d'équipe)`, ...Array.from({ length: Math.max(1, scheduleForm.teamSize - 1) }, (_, i) => `Déménageur ${i + 1}`)];

    const updated = await updateQuoteLead(showScheduleModal.id, {
      status: 'confirme',
      assignedTruckId: selectedTruck.id,
      assignedTruckName: selectedTruck.name,
      assignedDriver: scheduleForm.driver || selectedTruck.driver,
      scheduledTime: `${scheduleForm.date} à ${scheduleForm.time}`,
      assignedEquipment: scheduleForm.equipment,
      teamMembers: teamList,
      newNote: `🚛 Déménagement planifié avec succès pour le ${scheduleForm.date} à ${scheduleForm.time}. Camion : ${selectedTruck.name} (${selectedTruck.plateNumber}) - Chauffeur : ${scheduleForm.driver || selectedTruck.driver} - Équipe : ${scheduleForm.teamSize} pers. Matériel mobilisé : ${scheduleForm.equipment.join(', ')}.`,
      author: currentUser.name
    });

    setTrucks(prev => prev.map(t => t.id === selectedTruck.id ? { ...t, status: 'en_mission', driver: scheduleForm.driver || t.driver, teamSize: scheduleForm.teamSize || t.teamSize } : t));

    if (updated) {
      setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
      if (selectedLead?.id === updated.id) setSelectedLead(updated);
      setShowScheduleModal(null);
      const crmStats = await fetchCrmStats();
      setStats(crmStats);
    }
  };

  const handleRefusalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!showRefuseModal || !currentUser) return;

    const updated = await updateQuoteLead(showRefuseModal.id, {
      status: 'refuse',
      devisStatus: 'refuse',
      refusalReason: refusalReasonInput,
      newNote: `❌ Devis refusé et archivé. Motif de refus : ${refusalReasonInput}`,
      author: currentUser.name
    });

    if (updated) {
      setLeads(prev => prev.map(l => (l.id === updated.id ? updated : l)));
      if (selectedLead?.id === updated.id) setSelectedLead(updated);
      setShowRefuseModal(null);
      const crmStats = await fetchCrmStats();
      setStats(crmStats);
    }
  };

  const handlePriceUpdate = async (leadId: string, newPrice: number) => {
    if (!currentUser) return;
    const updated = await updateQuoteLead(leadId, {
      estimatedPrice: newPrice,
      newNote: `Révision tarifaire : ${newPrice} € TTC.`,
      author: currentUser.name
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
    if (!selectedLead || !newNoteText.trim() || !currentUser) return;
    const updated = await updateQuoteLead(selectedLead.id, {
      newNote: newNoteText.trim(),
      author: currentUser.name
    });
    if (updated) {
      setSelectedLead(updated);
      setLeads(prev => prev.map(l => (l.id === selectedLead.id ? updated : l)));
      setNewNoteText('');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Voulez-vous vraiment archiver/supprimer cette demande de devis ?')) {
      await deleteQuoteLead(id);
      setLeads(prev => prev.filter(l => l.id !== id));
      if (selectedLead?.id === id) setSelectedLead(null);
      const crmStats = await fetchCrmStats();
      setStats(crmStats);
    }
  };

  // ================= DEVIS BULK & SINGLE ACTION HANDLERS =================
  const handleToggleSelectQuote = (id: string) => {
    setSelectedQuoteIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAllQuotes = (filteredList: QuoteDocument[]) => {
    if (selectedQuoteIds.length === filteredList.length) {
      setSelectedQuoteIds([]);
    } else {
      setSelectedQuoteIds(filteredList.map(q => q.id));
    }
  };

  const handleBulkSendQuotes = () => {
    if (!selectedQuoteIds.length) return;
    setQuotes(prev =>
      prev.map(q => selectedQuoteIds.includes(q.id) ? { ...q, status: 'envoye' as const } : q)
    );
    alert(`✉️ ${selectedQuoteIds.length} devis envoyé(s) par email/WhatsApp avec succès !`);
    setSelectedQuoteIds([]);
  };

  const handleBulkArchiveQuotes = () => {
    if (!selectedQuoteIds.length) return;
    setQuotes(prev =>
      prev.map(q => selectedQuoteIds.includes(q.id) ? { ...q, status: 'archive' as const } : q)
    );
    alert(`📂 ${selectedQuoteIds.length} devis archivé(s).`);
    setSelectedQuoteIds([]);
  };

  const handleBulkDeleteQuotes = () => {
    if (!selectedQuoteIds.length) return;
    if (confirm(`Voulez-vous vraiment supprimer définitivement ces ${selectedQuoteIds.length} devis ?`)) {
      setQuotes(prev => prev.filter(q => !selectedQuoteIds.includes(q.id)));
      setSelectedQuoteIds([]);
    }
  };

  const handleBulkDownloadQuotes = () => {
    if (!selectedQuoteIds.length) return;
    alert(`📥 Génération du paquet d'impression pour ${selectedQuoteIds.length} devis au format PDF.`);
  };

  const handleUpdateQuoteStatus = (id: string, newStatus: QuoteDocStatus) => {
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: newStatus } : q));
  };

  const handleDeleteSingleQuote = (id: string) => {
    if (confirm(`Supprimer le devis ${id} ?`)) {
      setQuotes(prev => prev.filter(q => q.id !== id));
      setSelectedQuoteIds(prev => prev.filter(item => item !== id));
    }
  };

  const handleSaveEditedQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuote) return;
    setQuotes(prev => prev.map(q => q.id === editingQuote.id ? editingQuote : q));
    setEditingQuote(null);
  };

  const handleUpdateInvoiceStatus = (id: string, newStatus: InvoiceStatus) => {
    setInvoices(prev => prev.map(inv => inv.id === id ? { ...inv, status: newStatus } : inv));
  };

  const handleGenerateInvoiceFromLead = (lead: QuoteLead) => {
    const amountTTC = lead.estimatedPrice || 1500;
    const amountHT = Number((amountTTC / 1.2).toFixed(2));
    const tvaAmount = Number((amountTTC - amountHT).toFixed(2));
    const depositAmount = Number((amountTTC * 0.3).toFixed(2));

    const newDoc: InvoiceDocument = {
      id: `FAC-2026-${Math.floor(100 + Math.random() * 900)}`,
      leadId: lead.id,
      type: 'solde',
      clientName: lead.fullName,
      clientEmail: lead.email,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amountHT,
      tvaAmount,
      amountTTC,
      depositAmount,
      status: lead.status === 'confirme' ? 'payee' : 'envoyee',
      items: [
        {
          description: `Prestation Déménagement (${lead.projectType.toUpperCase()}) - Volume : ${lead.volume} m³ (${lead.formula})`,
          quantity: 1,
          unitPrice: amountHT * 0.8,
          total: amountHT * 0.8
        },
        {
          description: `Protections & Manutention Spéciale (Départ: Étage ${lead.departureFloor} / Arrivée: Étage ${lead.arrivalFloor})`,
          quantity: 1,
          unitPrice: amountHT * 0.2,
          total: amountHT * 0.2
        }
      ]
    };

    setInvoices(prev => [newDoc, ...prev.filter(d => d.id !== newDoc.id)]);
    setShowInvoiceModal(newDoc);
  };

  const handleCreateNewLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLeadForm.fullName.trim() || !newLeadForm.phone.trim()) return;

    const created = await submitQuoteLead({
      fullName: newLeadForm.fullName,
      email: newLeadForm.email || 'client@wemove.fr',
      phone: newLeadForm.phone,
      projectType: newLeadForm.projectType,
      departureAddress: newLeadForm.departureAddress || 'Paris 75000',
      arrivalAddress: newLeadForm.arrivalAddress || 'Île-de-France',
      volume: newLeadForm.volume,
      formula: newLeadForm.formula,
      estimatedPrice: newLeadForm.estimatedPrice,
      notes: newLeadForm.notes,
      source: newLeadForm.source || 'crm_creation_manuelle'
    });

    setShowCreateLeadModal(false);
    setNewLeadForm({
      fullName: '',
      email: '',
      phone: '',
      projectType: 'particulier',
      departureAddress: '',
      arrivalAddress: '',
      volume: 25,
      formula: 'standard',
      estimatedPrice: 1450,
      notes: '',
      source: 'crm_creation_manuelle'
    });

    await loadData();
    setSelectedLead(created);
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
    link.setAttribute('download', `wemove-crm-export-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const isDark = theme === 'dark';

  // Dynamic Theme Classes (Clean, Crisp Light & Luxury Dark)
  const bgMain = isDark ? 'bg-[#090D16] text-slate-100' : 'bg-[#F8FAFC] text-slate-900';
  const bgHeader = isDark ? 'bg-[#0B0F19]/90 border-slate-800' : 'bg-white/90 border-slate-200/80 shadow-xs';
  const bgCard = isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80 shadow-2xs';
  const bgCardSub = isDark ? 'bg-slate-950/60 border-slate-800/80' : 'bg-slate-50/80 border-slate-200/70';
  const textTitle = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-500';

  // ================= 1. LOGIN SCREEN (IF NOT AUTHENTICATED) =================
  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#070A11] text-white flex items-center justify-center p-4 relative overflow-hidden font-sans">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[750px] h-[550px] bg-gradient-to-tr from-[#0082CA]/25 via-sky-500/15 to-transparent blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[450px] h-[450px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-8">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0082CA] to-[#004E7A] text-white font-bold text-2xl shadow-xl shadow-[#0082CA]/30 border border-white/20">
              WM
            </div>
            <div className="space-y-1">
              <span className="inline-block px-3 py-1 rounded-full bg-white/10 text-[#38BDF8] text-[11px] font-mono font-bold tracking-wider uppercase backdrop-blur-md border border-white/10">
                We Move CRM
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white font-display">
                Espace Gestion & Operations
              </h1>
              <p className="text-sm text-slate-400">
                Plateforme de suivi commercial et logistique
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 backdrop-blur-2xl border border-slate-800 p-7 sm:p-8 rounded-3xl shadow-2xl space-y-6">
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-300">Adresse Email Professionnelle</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 text-slate-500" size={18} />
                  <input
                    type="email"
                    required
                    placeholder="jean.dupont@wemove.fr"
                    value={loginEmail}
                    onChange={e => setLoginEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-[#0082CA] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-semibold text-slate-300">Mot de Passe</label>
                  <span className="text-slate-500 hover:text-slate-300 cursor-pointer">Mot de passe oublié ?</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 text-slate-500" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-600 focus:outline-hidden focus:border-[#0082CA] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-500 hover:text-slate-300 text-xs"
                  >
                    {showPassword ? 'Masquer' : 'Afficher'}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#0082CA] to-[#005B8C] text-white font-semibold text-sm hover:from-[#0074B5] hover:to-[#004B73] transition-all shadow-lg shadow-[#0082CA]/25 cursor-pointer flex items-center justify-center gap-2"
              >
                <span>Accéder au CRM</span>
                <ArrowRight size={16} />
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-800 w-full" />
              <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase tracking-wider font-mono shrink-0">
                Connexion rapide 1-clic
              </span>
            </div>

            <div className="space-y-2">
              {DEMO_CRM_USERS.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickDemoLogin(u)}
                  className="w-full p-2.5 rounded-2xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between group cursor-pointer text-left"
                >
                  <div className="flex items-center gap-3">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-white/20" />
                    <div>
                      <div className="text-xs font-bold text-white group-hover:text-[#38BDF8] transition-colors">
                        {u.name}
                      </div>
                      <div className="text-[11px] text-slate-400">{u.title}</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                    {u.role.toUpperCase()}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-6 text-[11.5px] text-slate-500">
            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-emerald-500" /> SSL 256-bit</span>
            <span className="flex items-center gap-1.5"><Lock size={14} className="text-[#0082CA]" /> Session Sécurisée</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={14} className="text-purple-400" /> RGPD Conforme</span>
          </div>
        </div>
      </div>
    );
  }

  // ================= 2. MAIN ENTERPRISE CRM WORKSPACE =================
  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-[#0082CA]/30 ${bgMain}`}>
      
      {/* TOP EXECUTIVE HEADER BAR WITH BREADCRUMB & ACTIONS */}
      <header className={`h-16 border-b px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl ${bgHeader}`}>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-semibold text-slate-400">CRM Operations</span>
          <ChevronRight size={14} className="text-slate-400" />
          <h1 className={`font-bold text-sm tracking-tight ${textTitle}`}>
            {activeTab === 'pipeline' && 'Demandes & Pipeline'}
            {activeTab === 'dashboard' && 'Tableau de Bord'}
            {activeTab === 'commercial' && 'Commercial & Visites'}
            {activeTab === 'quotes_list' && 'Gestion des Devis'}
            {activeTab === 'invoices_list' && 'Factures Clients'}
            {activeTab === 'logistics' && 'Planning & Flotte'}
            {activeTab === 'customers' && 'Fichier Clients'}
            {activeTab === 'settings' && 'Paramètres'}
          </h1>
          <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0082CA]/10 text-[#0082CA] border border-[#0082CA]/25">
            v2.6
          </span>
        </div>

        {/* Header Actions, Theme Switcher & Profile */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={toggleTheme}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              isDark ? 'bg-slate-800 text-amber-400 border-slate-700 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80'
            }`}
            title={isDark ? 'Passer au Mode Clair' : 'Passer au Mode Sombre'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <div className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-mono ${
            isDark ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-100/90 border-slate-200 text-slate-600'
          }`}>
            <Clock size={14} className="text-[#0082CA]" />
            <span>{timeString}</span>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateLeadModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#0082CA] hover:bg-[#0070B0] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <Plus size={15} />
            <span className="hidden sm:inline">Nouveau Devis</span>
          </button>

          {/* Notifications Bell */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowNotifications(!showNotifications)}
              className={`w-9 h-9 rounded-xl border flex items-center justify-center relative transition-colors cursor-pointer ${
                isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
              }`}
            >
              <Bell size={16} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center">
                3
              </span>
            </button>

            {showNotifications && (
              <div className={`absolute right-0 mt-2 w-80 border rounded-2xl shadow-2xl p-4 z-50 space-y-3 ${
                isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              }`}>
                <div className="flex items-center justify-between border-b pb-2 border-slate-700/50">
                  <h4 className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>Notifications</h4>
                  <span className="text-[10px] text-[#0082CA] cursor-pointer hover:underline">Tout marquer comme lu</span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-300">
                    <strong>Nouveau Lead :</strong> Alexandre Mercier (32 m³) a validé son devis.
                  </div>
                  <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300">
                    <strong>Devis Signé :</strong> TechCorp SAS a accepté la proposition (6 925 €).
                  </div>
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <strong>Planning Flotte :</strong> Camion T-01 prêt pour le départ.
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-800">
            <img src={currentUser.avatar} alt={currentUser.name} className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-white/20" />
            <div className="hidden lg:block text-left text-xs">
              <div className={`font-bold leading-tight ${textTitle}`}>{currentUser.name}</div>
              <div className="text-[10px] text-[#0082CA] font-medium capitalize">{currentUser.role}</div>
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer ml-1"
              title="Déconnexion"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT WITH SUBLIME ORGANIZED SIDEBAR & CONTENT */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* LEFT NAVIGATION SIDEBAR WITH OFFICIAL LOGO & CATEGORIZED SECTIONS */}
        <aside className={`w-16 lg:w-64 border-r flex flex-col justify-between shrink-0 transition-all ${
          isDark ? 'bg-slate-900/80 border-slate-800' : 'bg-white border-slate-200/80'
        }`}>
          <div className="p-3 lg:p-4 space-y-5">
            
            {/* Sidebar Logo Box */}
            <div className="hidden lg:flex items-center justify-between p-3 rounded-2xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
              <Logo variant="horizontal" size="sm" showSubtitle={true} />
              <span className="px-1.5 py-0.5 rounded-md text-[9px] font-mono font-bold bg-[#0082CA]/15 text-[#0082CA] border border-[#0082CA]/25">
                PRO
              </span>
            </div>
            <div className="flex lg:hidden justify-center py-1">
              <LogoMark width={32} height={24} />
            </div>

            {/* SECTION 1: COMMERCIAL & DEMANDES */}
            <div className="space-y-1">
              <div className="hidden lg:block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Commercial & Ventes
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'dashboard', label: 'Tableau de Bord', icon: BarChart3, badge: null },
                  { id: 'pipeline', label: 'Demandes', icon: Layers, badge: stats?.newLeadsCount || 0 },
                  { id: 'commercial', label: 'Commercial & Visites', icon: Compass, badge: 3 },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id as ActiveTab)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0082CA] text-white shadow-sm font-bold'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={18} className={isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'} />
                        <span className="hidden lg:inline">{item.label}</span>
                      </div>
                      {item.badge !== null && item.badge > 0 && (
                        <span className={`hidden lg:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* SECTION 2: OPÉRATIONS & LOGISTIQUE */}
            <div className="space-y-1 pt-1">
              <div className="hidden lg:block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Opérations & Flotte
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'quotes_list', label: 'Gestion Devis', icon: FileText, badge: quotes.filter(q => q.status !== 'archive').length },
                  { id: 'invoices_list', label: 'Factures Clients', icon: Euro, badge: invoices.length },
                  { id: 'logistics', label: 'Planning & Flotte', icon: Truck, badge: trucks.filter(t => t.status === 'en_mission').length },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id as ActiveTab)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0082CA] text-white shadow-sm font-bold'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={18} className={isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'} />
                        <span className="hidden lg:inline">{item.label}</span>
                      </div>
                      {item.badge !== null && item.badge > 0 && (
                        <span className={`hidden lg:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* SECTION 3: CLIENTÈLE & CONFIGURATION */}
            <div className="space-y-1 pt-1">
              <div className="hidden lg:block px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Clientèle & Administration
              </div>
              <nav className="space-y-1">
                {[
                  { id: 'customers', label: 'Fichier Clients', icon: Users, badge: customers.length },
                  { id: 'settings', label: 'Paramètres', icon: Settings, badge: null },
                ].map(item => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTab(item.id as ActiveTab)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-[#0082CA] text-white shadow-sm font-bold'
                          : isDark
                          ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon size={18} className={isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'} />
                        <span className="hidden lg:inline">{item.label}</span>
                      </div>
                      {item.badge !== null && item.badge > 0 && (
                        <span className={`hidden lg:inline-block px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                          isActive ? 'bg-white/20 text-white' : isDark ? 'bg-slate-800 text-slate-300 border border-slate-700' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

          </div>

          {/* Bottom Sidebar Target Widget */}
          <div className="p-3.5 hidden lg:block border-t border-slate-200/60 dark:border-slate-800/60">
            <div className={`p-3 rounded-2xl border space-y-2 ${bgCardSub}`}>
              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                <span>Objectif Mensuel</span>
                <span className="text-[#0082CA] font-bold">82%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#0082CA] to-emerald-400 h-full w-[82%] rounded-full" />
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-400 pt-0.5">
                <span>32 800 € / 40 000 €</span>
                <span className="text-emerald-500 font-semibold">+14.2%</span>
              </div>
            </div>
          </div>
        </aside>

        {/* RIGHT MAIN VIEW AREA */}
        <main className={`flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 ${bgMain}`}>
          
          {/* ================= TAB 1: DEMANDES (PIPELINE KANBAN / TABLE) ================= */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              {/* Header Title & View Toggle */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className={`text-xl sm:text-2xl font-bold font-display ${textTitle}`}>Demandes</h2>
                  <p className={`text-xs ${textSub}`}>Gestion centralisée des leads et propositions commerciales</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`p-1 rounded-xl border flex items-center gap-1 ${
                    isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setViewMode('kanban')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'kanban' ? 'bg-[#0082CA] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <LayoutGrid size={14} /> Kanban
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                        viewMode === 'table' ? 'bg-[#0082CA] text-white shadow-xs' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      <List size={14} /> Tableau
                    </button>
                  </div>
                </div>
              </div>

              {/* STREAMLINED TOOLBAR: Row 1 (Search + Select Filters) & Row 2 (Source Pills + Status Pills) */}
              <div className={`p-3.5 rounded-2xl border space-y-3 ${bgCard}`}>
                
                {/* Row 1: Search + Project Filter + Sort Filter */}
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
                    <input
                      type="text"
                      placeholder="Rechercher un client, une ville, réf ID (WM-2026)..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      className={`w-full pl-9 pr-3 py-1.5 rounded-xl text-xs focus:outline-hidden focus:border-[#0082CA] transition-colors ${
                        isDark ? 'bg-slate-950/70 border border-slate-800 text-white placeholder-slate-500' : 'bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400'
                      }`}
                    />
                    {search && (
                      <button onClick={() => setSearch('')} className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600">
                        <X size={14} />
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto">
                    <select
                      value={projectTypeFilter}
                      onChange={e => setProjectTypeFilter(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer shrink-0 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="all">Tous projets</option>
                      <option value="particulier">👤 Particuliers</option>
                      <option value="entreprise">🏢 Entreprises</option>
                    </select>

                    <select
                      value={sortOrder}
                      onChange={e => setSortOrder(e.target.value as any)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer shrink-0 ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="date-desc">📅 Plus récents</option>
                      <option value="date-asc">📅 Plus anciens</option>
                      <option value="price-desc">💶 Prix : élevé</option>
                      <option value="price-asc">💶 Prix : bas</option>
                      <option value="volume-desc">📦 Volume max</option>
                      <option value="name-asc">🔤 Nom A-Z</option>
                    </select>
                  </div>
                </div>

                {/* Row 2: Canal Filters & Status Pills */}
                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-xs">
                  {/* Source / Canal Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
                    <span className="text-[11px] font-medium text-slate-400 shrink-0 mr-1">Canal :</span>
                    {[
                      { id: 'all', label: `Tous (${leads.length})` },
                      { id: 'site', label: '🌐 Site Web' },
                      { id: 'telephone', label: '📞 Téléphone' },
                      { id: 'recommandation', label: '🗣️ Recommandation' },
                      { id: 'ads', label: '📣 Ads' },
                      { id: 'partenaire', label: '🤝 Partenaire' },
                      { id: 'crm_creation_manuelle', label: '✍️ CRM' },
                    ].map(src => {
                      const isActive = sourceFilter === src.id;
                      return (
                        <button
                          key={src.id}
                          type="button"
                          onClick={() => setSourceFilter(src.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer whitespace-nowrap ${
                            isActive
                              ? 'bg-[#0082CA] text-white font-semibold'
                              : isDark
                              ? 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-white'
                              : 'bg-slate-100 text-slate-600 border border-slate-200/80 hover:bg-slate-200/80'
                          }`}
                        >
                          {src.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Status Pills Dropdown/Pill selector */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    <span className="text-[11px] font-medium text-slate-400 shrink-0 mr-1">Statut :</span>
                    <button
                      type="button"
                      onClick={() => setSelectedStatus('all')}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        selectedStatus === 'all'
                          ? 'bg-[#0082CA] text-white font-semibold'
                          : isDark
                          ? 'bg-slate-950/60 text-slate-400 border border-slate-800'
                          : 'bg-slate-100 text-slate-600 border border-slate-200/80'
                      }`}
                    >
                      Tous
                    </button>
                    {[
                      { id: 'nouveau', label: '1. Demandes' },
                      { id: 'visite_technique', label: '2. Visites' },
                      { id: 'devis_envoye', label: '3. Devis Transmis' },
                      { id: 'confirme', label: '4. Déménagements' },
                      { id: 'refuse', label: '5. Archives' }
                    ].map(st => {
                      const isSelected = selectedStatus === st.id;
                      return (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setSelectedStatus(st.id)}
                          className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-all cursor-pointer whitespace-nowrap ${
                            isSelected
                              ? 'bg-[#0082CA] text-white border-[#0082CA] font-semibold'
                              : isDark
                              ? 'bg-slate-950/60 text-slate-300 border-slate-800'
                              : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}
                        >
                          {st.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* WORKFLOW STEPPER BANNER - VISUAL PIPELINE SUMMARY */}
              <div className={`p-3 rounded-2xl border hidden md:grid grid-cols-5 gap-2 ${bgCard}`}>
                {[
                  { step: '1', title: 'Captation Demandes', desc: 'Site & Tous Canaux', icon: Clock, count: leads.filter(l => l.status === 'nouveau' || l.status === 'prise_contact').length, color: 'text-blue-500 bg-blue-500/10' },
                  { step: '2', title: 'Visite Technique', desc: 'Physique ou Visio', icon: Compass, count: leads.filter(l => l.status === 'visite_technique').length, color: 'text-indigo-500 bg-indigo-500/10' },
                  { step: '3', title: 'Devis Client', desc: 'Chiffrage & Envoi', icon: Send, count: leads.filter(l => l.status === 'devis_brouillon' || l.status === 'devis_envoye').length, color: 'text-purple-500 bg-purple-500/10' },
                  { step: '4', title: 'Mobilisation & Move', desc: 'Camions & Équipes', icon: Truck, count: leads.filter(l => l.status === 'confirme').length, color: 'text-emerald-500 bg-emerald-500/10' },
                  { step: '5', title: 'Clôture & Archives', desc: 'Terminés ou Refusés', icon: ShieldCheck, count: leads.filter(l => l.status === 'refuse' || l.status === 'termine').length, color: 'text-slate-400 bg-slate-500/10' },
                ].map((st, idx) => {
                  const Icon = st.icon;
                  return (
                    <div key={st.step} className={`p-2.5 rounded-xl border flex items-center gap-2.5 relative ${bgCardSub}`}>
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold shrink-0 ${st.color}`}>
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span className={`text-[11px] font-bold truncate ${textTitle}`}>{st.title}</span>
                          <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#0082CA]/10 text-[#0082CA]">{st.count}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{st.desc}</div>
                      </div>
                      {idx < 4 && <ChevronRight size={12} className="absolute -right-2.5 top-1/2 -translate-y-1/2 text-slate-400 z-10 hidden lg:block" />}
                    </div>
                  );
                })}
              </div>

              {/* View Rendering */}
              {loading ? (
                <div className={`py-16 text-center text-slate-400 rounded-2xl border ${bgCard}`}>
                  <RefreshCw className="animate-spin mx-auto mb-2 text-[#0082CA]" size={24} />
                  Chargement des demandes...
                </div>
              ) : viewMode === 'kanban' ? (
                /* KANBAN BOARD 5 WORKFLOW COLUMNS - SUBLIME & CLEAR */
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3.5 overflow-x-auto pb-4">
                  {[
                    { id: 'demandes', label: '1. Demandes Reçues', statuses: ['nouveau', 'prise_contact'], colorDark: 'text-blue-400', bgBadge: 'bg-blue-500/15 text-blue-600', icon: Clock },
                    { id: 'visites', label: '2. Visites Techniques', statuses: ['visite_technique'], colorDark: 'text-indigo-400', bgBadge: 'bg-indigo-500/15 text-indigo-600', icon: Compass },
                    { id: 'devis', label: '3. Devis Transmis', statuses: ['devis_brouillon', 'devis_envoye'], colorDark: 'text-purple-400', bgBadge: 'bg-purple-500/15 text-purple-600', icon: Send },
                    { id: 'demenagements', label: '4. Déménagements Planifiés', statuses: ['confirme'], colorDark: 'text-emerald-400', bgBadge: 'bg-emerald-500/15 text-emerald-600', icon: Truck },
                    { id: 'archives', label: '5. Archivés & Terminés', statuses: ['refuse', 'termine'], colorDark: 'text-slate-400', bgBadge: 'bg-slate-500/15 text-slate-600', icon: ShieldCheck },
                  ].map(col => {
                    const columnLeads = filterAndSortLeads(leads.filter(l => col.statuses.includes(l.status)));
                    const Icon = col.icon;

                    return (
                      <div key={col.id} className={`p-3 rounded-2xl border flex flex-col min-h-[620px] ${bgCard}`}>
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-3 px-1 pb-2 border-b border-slate-200/60 dark:border-slate-800">
                          <div className="flex items-center gap-2">
                            <Icon size={15} className={col.colorDark} />
                            <h4 className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>{col.label}</h4>
                          </div>
                          <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                            isDark ? 'bg-slate-800 text-slate-300 border-slate-700' : 'bg-slate-100 text-slate-700 border-slate-200'
                          }`}>
                            {columnLeads.length}
                          </span>
                        </div>

                        {/* Cards List */}
                        <div className="space-y-3 flex-1 overflow-y-auto">
                          {columnLeads.map(lead => {
                            const badge = getSourceBadge(lead.source);

                            return (
                              <div
                                key={lead.id}
                                className={`p-3.5 rounded-xl border hover:border-[#0082CA]/60 transition-all duration-200 space-y-2.5 group shadow-xs hover:shadow-md ${bgCardSub}`}
                              >
                                {/* Header: Réf ID + Canal Source Badge */}
                                <div className="flex items-center justify-between gap-1">
                                  <span onClick={() => setSelectedLead(lead)} className="font-mono text-[11px] font-bold text-[#0082CA] hover:underline cursor-pointer">
                                    {lead.id}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${isDark ? badge.bgDark : badge.bgLight}`}>
                                    {badge.label}
                                  </span>
                                </div>

                                {/* Body: Client Name + Trajet */}
                                <div onClick={() => setSelectedLead(lead)} className="cursor-pointer space-y-1">
                                  <div className="flex items-center justify-between gap-2">
                                    <div className={`font-bold text-xs sm:text-sm group-hover:text-[#0082CA] transition-colors ${textTitle}`}>
                                      {lead.fullName}
                                    </div>
                                    <span className="text-[10px] text-slate-400 capitalize shrink-0 font-medium">
                                      {lead.projectType === 'entreprise' ? '🏢 Pro' : '👤 Part.'}
                                    </span>
                                  </div>

                                  <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                                    <MapPin size={11} className="text-blue-500 shrink-0" />
                                    <span className="truncate">{lead.departureAddress.split(',')[0]} → {lead.arrivalAddress.split(',')[0]}</span>
                                  </div>
                                </div>

                                {/* Visite Details Badge (If Column 2) */}
                                {col.id === 'visites' && lead.visitDate && (
                                  <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-[10.5px] text-indigo-700 dark:text-indigo-300 space-y-0.5 font-mono">
                                    <div className="flex items-center justify-between font-bold">
                                      <span className="flex items-center gap-1">
                                        {lead.visitType === 'domicile' ? '🏠 Domicile' : lead.visitType === 'visio' ? '📹 Visio' : '📞 Téléphone'}
                                      </span>
                                      <span>{lead.visitDate}</span>
                                    </div>
                                  </div>
                                )}

                                {/* Logistics Breakdown (If Column 4) */}
                                {col.id === 'demenagements' && (
                                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[10.5px] text-emerald-700 dark:text-emerald-300 space-y-1">
                                    <div className="flex items-center justify-between font-bold font-mono">
                                      <span className="flex items-center gap-1"><Truck size={11} /> {lead.assignedTruckName || 'Camion 30m³'}</span>
                                      <span>{lead.scheduledTime || '08:00'}</span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400">
                                      Chauffeur: <strong>{lead.assignedDriver || 'Karim B.'}</strong>
                                    </div>
                                  </div>
                                )}

                                {/* Refusal Motif (If Refusé in Column 5) */}
                                {lead.status === 'refuse' && (
                                  <div className="p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-[10.5px] text-rose-700 dark:text-rose-300">
                                    ❌ Motif : <strong>{lead.refusalReason || 'Prix / Date non retenue'}</strong>
                                  </div>
                                )}

                                {/* Price & Volume Summary */}
                                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
                                  <span className={`font-mono font-bold ${textTitle}`}>
                                    {lead.estimatedPrice} € <span className="text-[10px] font-normal text-slate-400">({lead.volume} m³)</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedLead(lead)}
                                    className="text-[#0082CA] text-[11px] font-semibold hover:underline flex items-center gap-0.5"
                                  >
                                    Fiche <ChevronRight size={12} />
                                  </button>
                                </div>

                                {/* WORKFLOW DIRECT QUICK ACTIONS ON CARD */}
                                <div className="pt-1.5 flex items-center gap-1.5">
                                  {col.id === 'demandes' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); setShowVisitModal(lead); }}
                                        className="flex-1 py-1 px-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[10.5px] transition-all cursor-pointer flex items-center justify-center gap-1"
                                      >
                                        <Compass size={11} />
                                        <span>Planifier Visite</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleDevisStatusChange(lead.id, 'brouillon'); }}
                                        className="py-1 px-2 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-[#0082CA] hover:text-white font-medium text-[10.5px] transition-all cursor-pointer"
                                        title="Créer Devis sans visite"
                                      >
                                        ✍️ Devis
                                      </button>
                                    </>
                                  )}

                                  {col.id === 'visites' && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); handleGenerateInvoiceFromLead(lead); handleDevisStatusChange(lead.id, 'envoye'); }}
                                      className="w-full py-1 px-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold text-[10.5px] transition-all cursor-pointer flex items-center justify-center gap-1"
                                    >
                                      <Send size={11} />
                                      <span>Rédiger & Transmettre Devis</span>
                                    </button>
                                  )}

                                  {col.id === 'devis' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleDevisStatusChange(lead.id, 'accepte'); }}
                                        className="flex-1 py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10.5px] transition-all cursor-pointer flex items-center justify-center gap-1"
                                      >
                                        <CheckCircle2 size={11} />
                                        <span>Accepté & Planifier</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setShowRefuseModal(lead); }}
                                        className="py-1 px-2 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400 hover:bg-rose-600 hover:text-white font-medium text-[10.5px] transition-all cursor-pointer"
                                        title="Refuser et Archiver"
                                      >
                                        ❌ Refuser
                                      </button>
                                    </>
                                  )}

                                  {col.id === 'demenagements' && (
                                    <>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setShowMissionOrderModal(lead); }}
                                        className="flex-1 py-1 px-2 rounded-lg bg-slate-800 text-slate-200 hover:bg-slate-700 font-semibold text-[10.5px] transition-all cursor-pointer flex items-center justify-center gap-1 border border-slate-700"
                                      >
                                        <FileText size={11} />
                                        <span>Ordre de Mission</span>
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); handleStatusChange(lead.id, 'termine'); }}
                                        className="py-1 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10.5px] transition-all cursor-pointer"
                                        title="Marquer comme déménagement effectué avec succès"
                                      >
                                        🎉 Terminé
                                      </button>
                                    </>
                                  )}

                                  {col.id === 'archives' && (
                                    <button
                                      type="button"
                                      onClick={(e) => { e.stopPropagation(); setSelectedLead(lead); }}
                                      className="w-full py-1 px-2 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-[10.5px] hover:bg-slate-300 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center justify-center gap-1"
                                    >
                                      <Eye size={11} />
                                      <span>Consulter Historique</span>
                                    </button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* TABLE VIEW - CLEAN & ELEGANT */
                <div className={`rounded-2xl border overflow-hidden ${bgCard}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className={`border-b font-semibold uppercase tracking-wider text-[11px] ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50/80 border-slate-200 text-slate-500'
                      }`}>
                        <tr>
                          <th className="py-3 px-4">Réf & Source</th>
                          <th className="py-3 px-4">Client</th>
                          <th className="py-3 px-4">Trajet</th>
                          <th className="py-3 px-4">Volume & Formule</th>
                          <th className="py-3 px-4">Prix</th>
                          <th className="py-3 px-4">Statut</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                        {filterAndSortLeads(leads).map(lead => {
                          const cfg = STATUS_CONFIG[lead.status];
                          const badge = getSourceBadge(lead.source);

                          return (
                            <tr
                              key={lead.id}
                              onClick={() => setSelectedLead(lead)}
                              className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                            >
                              <td className="py-3 px-4 font-mono font-semibold text-[#0082CA]">
                                <div>{lead.id}</div>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-medium border inline-block mt-0.5 ${isDark ? badge.bgDark : badge.bgLight}`}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className={`font-semibold ${textTitle}`}>{lead.fullName}</div>
                                <div className="text-[10px] text-slate-400 capitalize">{lead.projectType === 'entreprise' ? '🏢 Entreprise' : '👤 Particulier'}</div>
                              </td>
                              <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{lead.departureAddress.split(',')[0]} → {lead.arrivalAddress.split(',')[0]}</td>
                              <td className="py-3 px-4">{lead.volume} m³ ({lead.formula})</td>
                              <td className={`py-3 px-4 font-mono font-semibold ${textTitle}`}>{lead.estimatedPrice} €</td>
                              <td className="py-3 px-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${isDark ? `${cfg.bgDark} ${cfg.colorDark} ${cfg.borderDark}` : `${cfg.bgLight} ${cfg.colorLight} ${cfg.borderLight}`}`}>
                                  {cfg.label}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <button type="button" onClick={() => setSelectedLead(lead)} className="p-1.5 rounded-lg bg-[#0082CA]/10 text-[#0082CA] hover:bg-[#0082CA] hover:text-white transition-colors">
                                  <Eye size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: DASHBOARD EXECUTIVE ================= */}
          {activeTab === 'dashboard' && (
            <div className="space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className={`text-xl sm:text-2xl font-bold font-display ${textTitle}`}>Tableau de Bord Operations</h2>
                  <p className={`text-xs ${textSub}`}>Synthèse commerciale et opérationnelle We Move</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={loadData}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isDark ? 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    }`}
                  >
                    <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
                    <span>Rafraîchir</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-xl bg-[#0082CA] hover:bg-[#0070B0] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                  >
                    <Download size={13} /> Export CSV
                  </button>
                </div>
              </div>

              {/* KPI Cards */}
              {stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className={`p-4 rounded-2xl border space-y-2 ${bgCard}`}>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>Chiffre d'Affaires Estimé</span>
                      <div className="p-2 rounded-xl bg-[#0082CA]/10 text-[#0082CA]"><Euro size={16} /></div>
                    </div>
                    <div className={`text-2xl font-bold font-mono ${textTitle}`}>{stats.totalEstimatedRevenue.toLocaleString('fr-FR')} €</div>
                    <div className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      <TrendingUp size={13} /> +14.2% ce mois-ci
                    </div>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2 ${bgCard}`}>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>Dossiers Confirmés</span>
                      <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600"><CheckCircle2 size={16} /></div>
                    </div>
                    <div className={`text-2xl font-bold font-mono ${textTitle}`}>{stats.confirmedCount} <span className="text-xs font-normal text-slate-400">/ {stats.totalLeads}</span></div>
                    <div className="text-xs text-slate-500">Taux de transformation : <strong className={textTitle}>{stats.conversionRate}%</strong></div>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2 ${bgCard}`}>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>Volume Transporté (m³)</span>
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600"><Box size={16} /></div>
                    </div>
                    <div className={`text-2xl font-bold font-mono ${textTitle}`}>{stats.totalVolumeM3} m³</div>
                    <div className="text-xs text-slate-500">Moyenne : <strong className={textTitle}>{(stats.totalVolumeM3 / (stats.totalLeads || 1)).toFixed(1)} m³/projet</strong></div>
                  </div>

                  <div className={`p-4 rounded-2xl border space-y-2 ${bgCard}`}>
                    <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                      <span>Leads en Attente</span>
                      <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600"><Clock size={16} /></div>
                    </div>
                    <div className={`text-2xl font-bold font-mono ${textTitle}`}>{stats.newLeadsCount}</div>
                    <div className="text-xs text-amber-600 font-medium flex items-center gap-1">
                      <Zap size={12} /> Temps de réponse moyen : 18 min
                    </div>
                  </div>
                </div>
              )}

              {/* Conversion Funnel */}
              <div className={`p-5 rounded-2xl border space-y-3 ${bgCard}`}>
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-bold flex items-center gap-2 ${textTitle}`}>
                    <Activity size={16} className="text-[#0082CA]" />
                    <span>Entonnoir Commercial</span>
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">Total : {stats?.totalLeads || 0} devis</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { label: '1. Nouveaux Leads', count: stats?.newLeadsCount || 0, color: 'bg-blue-500' },
                    { label: '2. Contactés', count: stats?.contactedCount || 0, color: 'bg-amber-500' },
                    { label: '3. Devis Transmis', count: stats?.quotesSentCount || 0, color: 'bg-purple-500' },
                    { label: '4. Dossiers Confirmés', count: stats?.confirmedCount || 0, color: 'bg-emerald-500' },
                    { label: '5. Effectués', count: leads.filter(l => l.status === 'termine').length, color: 'bg-slate-400' }
                  ].map(step => (
                    <div key={step.label} className={`p-3 rounded-xl border text-center space-y-1 ${bgCardSub}`}>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 truncate">{step.label}</div>
                      <div className={`text-lg font-bold font-mono ${textTitle}`}>{step.count}</div>
                      <div className="w-full bg-slate-200 dark:bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                        <div className={`${step.color} h-full`} style={{ width: `${Math.min(100, (step.count / (stats?.totalLeads || 1)) * 100)}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Grid: Recent Leads & Fleet */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className={`lg:col-span-2 p-5 rounded-2xl border space-y-3 ${bgCard}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${textTitle}`}>
                      <Layers size={16} className="text-[#0082CA]" />
                      <span>Dernières Demandes Récentes</span>
                    </h3>
                    <button
                      type="button"
                      onClick={() => setActiveTab('pipeline')}
                      className="text-xs text-[#0082CA] font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>Voir tout</span>
                      <ArrowRight size={13} />
                    </button>
                  </div>

                  <div className="space-y-2">
                    {leads.slice(0, 4).map(lead => {
                      const cfg = STATUS_CONFIG[lead.status];
                      return (
                        <div
                          key={lead.id}
                          onClick={() => { setSelectedLead(lead); setActiveTab('pipeline'); }}
                          className={`p-3 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 group ${bgCardSub}`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-semibold text-[#0082CA]">{lead.id}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${isDark ? `${cfg.bgDark} ${cfg.colorDark} ${cfg.borderDark}` : `${cfg.bgLight} ${cfg.colorLight} ${cfg.borderLight}`}`}>
                                {cfg.label}
                              </span>
                            </div>
                            <div className={`font-semibold text-xs sm:text-sm group-hover:text-[#0082CA] transition-colors ${textTitle}`}>{lead.fullName}</div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 text-right">
                            <div>
                              <div className={`font-mono font-semibold text-xs sm:text-sm ${textTitle}`}>{lead.estimatedPrice} €</div>
                              <div className="text-[10px] text-slate-400">{lead.volume} m³</div>
                            </div>
                            <ChevronRight size={16} className="text-slate-400 group-hover:text-[#0082CA] transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className={`p-5 rounded-2xl border space-y-3 ${bgCard}`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${textTitle}`}>
                      <Truck size={16} className="text-purple-500" />
                      <span>Flotte Logistique</span>
                    </h3>
                    <button type="button" onClick={() => setActiveTab('logistics')} className="text-xs text-[#0082CA] font-semibold hover:underline">
                      Planning
                    </button>
                  </div>

                  <div className="space-y-2">
                    {trucks.map(truck => (
                      <div key={truck.id} className={`p-3 rounded-xl border text-xs space-y-1.5 ${bgCardSub}`}>
                        <div className="flex items-center justify-between">
                          <span className={`font-semibold ${textTitle}`}>{truck.name}</span>
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                            truck.status === 'en_mission' ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                          }`}>
                            {truck.status === 'en_mission' ? 'En Mission' : 'Disponible'}
                          </span>
                        </div>
                        <div className="text-slate-400 flex items-center justify-between text-[11px]">
                          <span>{truck.driver}</span>
                          <span className="font-mono">{truck.plateNumber}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= TAB: COMMERCIAL & VISITES (PLANNING MULTI-VUES) ================= */}
          {activeTab === 'commercial' && (
            <div className="space-y-5">
              {/* Header Title & Controls */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className={`text-xl sm:text-2xl font-bold font-display ${textTitle}`}>Commercial & Visites Techniques</h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#0082CA]/15 text-[#0082CA] border border-[#0082CA]/25">
                      3 RDVs Aujourd'hui
                    </span>
                  </div>
                  <p className={`text-xs mt-0.5 ${textSub}`}>
                    Gestion globale du planning commercial, visites à domicile / visio / téléphone, secteurs et performance de conversion.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  {/* View Mode Switcher */}
                  <div className={`p-1 rounded-xl border flex items-center gap-1 ${isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'}`}>
                    {[
                      { id: 'agenda', label: 'Agenda & Planning', icon: CalendarDays },
                      { id: 'list', label: 'Suivi RDVs', icon: List },
                      { id: 'map', label: 'Carte & Secteurs', icon: MapPin },
                      { id: 'performance', label: 'Performances', icon: TrendingUp },
                    ].map(mode => {
                      const Icon = mode.icon;
                      const isActive = commercialViewMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setCommercialViewMode(mode.id as any)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                            isActive
                              ? 'bg-[#0082CA] text-white shadow-xs'
                              : isDark
                              ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                          }`}
                        >
                          <Icon size={14} />
                          <span>{mode.label}</span>
                        </button>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const firstLead = leads[0];
                      if (firstLead) {
                        setSelectedLead(firstLead);
                        setShowVisitModal(firstLead);
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0082CA] hover:bg-[#0070B0] text-white text-xs font-semibold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Plus size={15} />
                    <span>Planifier Visite</span>
                  </button>
                </div>
              </div>

              {/* Filters Bar for Commercial Module */}
              <div className={`p-3.5 rounded-2xl border flex flex-wrap items-center justify-between gap-3 ${bgCard}`}>
                <div className="flex flex-wrap items-center gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Format Visite :</span>
                    <select
                      value={visitFormatFilter}
                      onChange={e => setVisitFormatFilter(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="all">Tous formats (Domicile, Visio, Tél)</option>
                      <option value="domicile">🏠 Domicile (Présentiel)</option>
                      <option value="visio">📹 Visio-Guidée</option>
                      <option value="telephone">📞 Téléphonique</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">Commercial :</span>
                    <select
                      value={selectedAgentFilter}
                      onChange={e => setSelectedAgentFilter(e.target.value)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-medium border cursor-pointer ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <option value="all">Tous les commerciaux (3)</option>
                      <option value="Thomas L.">Thomas L. (Secteur Paris / 92)</option>
                      <option value="Sarah M.">Sarah M. (Secteur 93 / 94)</option>
                      <option value="Karim B.">Karim B. (Secteur 78 / 91 / 95)</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-semibold flex items-center gap-1">
                    <CheckCircle2 size={13} /> 12 RDVs confirmés cette semaine
                  </span>
                </div>
              </div>

              {/* VIEW 1: AGENDA & PLANNING (CALENDAR GRID VIEW) */}
              {commercialViewMode === 'calendar' && (
                <div className="space-y-4">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: 'Visites Domicile', value: '8 planifiées', icon: MapPin, color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
                      { label: 'Visites Visio', value: '5 réalisées', icon: Video, color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
                      { label: 'Visites Tél.', value: '4 effectuées', icon: Phone, color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
                      { label: 'Taux de Transformation', value: '68.4% devis signés', icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
                    ].map(card => {
                      const Icon = card.icon;
                      return (
                        <div key={card.label} className={`p-3.5 rounded-2xl border flex items-center gap-3 ${bgCard}`}>
                          <div className={`p-2.5 rounded-xl border ${card.color}`}>
                            <Icon size={18} />
                          </div>
                          <div>
                            <div className="text-[11px] text-slate-400 font-medium">{card.label}</div>
                            <div className={`text-sm font-bold font-mono ${textTitle}`}>{card.value}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Calendar Grid Header & Days */}
                  <div className={`p-4 rounded-2xl border space-y-4 ${bgCard}`}>
                    <div className="flex items-center justify-between pb-3 border-b border-slate-200/60 dark:border-slate-800/60">
                      <div className="flex items-center gap-3">
                        <span className={`text-base font-bold font-display ${textTitle}`}>Semaine du 25 au 30 Septembre 2026</span>
                        <span className="px-2.5 py-0.5 rounded-md text-[11px] font-mono bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                          Semaine 39
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span> Domicile</span>
                        <span className="flex items-center gap-1 pl-2"><span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block"></span> Visio</span>
                        <span className="flex items-center gap-1 pl-2"><span className="w-2.5 h-2.5 rounded-full bg-purple-500 inline-block"></span> Téléphone</span>
                      </div>
                    </div>

                    {/* Weekly Days Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
                      {[
                        {
                          day: 'Lun 25 Sept',
                          visits: [
                            { time: '09:30', client: 'Alexandre Mercier', type: 'domicile', agent: 'Thomas L.', volume: '32 m³', place: 'Paris (75016)', status: 'confirme' },
                            { time: '14:00', client: 'Sophie & Marc Laurent', type: 'visio', agent: 'Sarah M.', volume: '48 m³', place: 'Boulogne (92100)', status: 'realise' },
                          ]
                        },
                        {
                          day: 'Mar 26 Sept',
                          visits: [
                            { time: '10:00', client: 'Cabinet Juridique Maillard', type: 'domicile', agent: 'Thomas L.', volume: '110 m³', place: 'Paris (75008)', status: 'confirme' },
                            { time: '15:30', client: 'Dr. Émilie Moreau', type: 'telephone', agent: 'Karim B.', volume: '22 m³', place: 'Neuilly (92200)', status: 'confirme' },
                          ]
                        },
                        {
                          day: 'Mer 27 Sept',
                          visits: [
                            { time: '09:00', client: 'Julien Bernard', type: 'domicile', agent: 'Sarah M.', volume: '38 m³', place: 'Montreuil (93100)', status: 'confirme' },
                            { time: '11:30', client: 'Camille & Antoine Petit', type: 'visio', agent: 'Karim B.', volume: '55 m³', place: 'Versailles (78000)', status: 'confirme' },
                            { time: '16:00', client: 'Isabelle & François Dupont', type: 'domicile', agent: 'Thomas L.', volume: '62 m³', place: 'Paris (75015)', status: 'realise' },
                          ]
                        },
                        {
                          day: 'Jeu 28 Sept',
                          visits: [
                            { time: '10:30', client: 'TechCorp SAS (Locaux)', type: 'domicile', agent: 'Thomas L.', volume: '140 m³', place: 'La Défense (92800)', status: 'confirme' },
                            { time: '14:30', client: 'Nicolas Vasseur', type: 'telephone', agent: 'Sarah M.', volume: '18 m³', place: 'Créteil (94000)', status: 'confirme' },
                          ]
                        },
                        {
                          day: 'Ven 29 Sept',
                          visits: [
                            { time: '09:30', client: 'Madame Hélène Roche', type: 'domicile', agent: 'Karim B.', volume: '42 m³', place: 'Saint-Germain (78100)', status: 'confirme' },
                            { time: '15:00', client: 'Pierre-Antoine Giraud', type: 'visio', agent: 'Sarah M.', volume: '28 m³', place: 'Vincennes (94300)', status: 'confirme' },
                          ]
                        },
                        {
                          day: 'Sam 30 Sept',
                          visits: [
                            { time: '10:00', client: 'Famille Leroy', type: 'domicile', agent: 'Thomas L.', volume: '75 m³', place: 'Rueil-Malmaison (92500)', status: 'confirme' },
                          ]
                        }
                      ].map((dayCol, colIdx) => (
                        <div key={dayCol.day} className={`p-3 rounded-xl border flex flex-col justify-between space-y-3 ${bgCardSub}`}>
                          <div className="flex items-center justify-between border-b pb-2 border-slate-200/60 dark:border-slate-800/60">
                            <span className={`text-xs font-bold ${colIdx === 0 ? 'text-[#0082CA]' : textTitle}`}>
                              {dayCol.day}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-slate-500 font-semibold">
                              {dayCol.visits.length} rdv
                            </span>
                          </div>

                          <div className="space-y-2.5 flex-1">
                            {dayCol.visits.map((visit, vIdx) => {
                              const formatColor = visit.type === 'domicile'
                                ? 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
                                : visit.type === 'visio'
                                ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-500/20'
                                : 'bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20';

                              const badgeLabel = visit.type === 'domicile' ? '🏠 Domicile' : visit.type === 'visio' ? '📹 Visio' : '📞 Téléphone';

                              return (
                                <div
                                  key={vIdx}
                                  onClick={() => {
                                    const matchLead = leads.find(l => l.fullName.toLowerCase().includes(visit.client.split(' ')[0].toLowerCase())) || leads[0];
                                    setSelectedLead(matchLead);
                                    setShowVisitModal(matchLead);
                                  }}
                                  className={`p-2.5 rounded-xl border transition-all cursor-pointer hover:scale-[1.02] shadow-2xs space-y-1.5 ${
                                    isDark ? 'bg-slate-900/90 border-slate-800 hover:border-[#0082CA]/50' : 'bg-white border-slate-200/90 hover:border-[#0082CA]/50'
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-[11px] font-bold text-[#0082CA] flex items-center gap-1">
                                      <Clock size={11} /> {visit.time}
                                    </span>
                                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold border ${formatColor}`}>
                                      {badgeLabel}
                                    </span>
                                  </div>

                                  <div className={`text-xs font-bold line-clamp-1 ${textTitle}`}>
                                    {visit.client}
                                  </div>

                                  <div className="text-[10px] text-slate-500 dark:text-slate-400 space-y-0.5">
                                    <div className="flex items-center gap-1">
                                      <MapPin size={10} className="text-slate-400 shrink-0" />
                                      <span className="truncate">{visit.place}</span>
                                    </div>
                                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800/80">
                                      <span className="font-mono font-medium text-slate-600 dark:text-slate-300">{visit.volume}</span>
                                      <span className="font-semibold text-[#0082CA]">{visit.agent}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 2: SUIVI DES RDVS (LISTING DATA TABLE VIEW) */}
              {commercialViewMode === 'list' && (
                <div className={`p-4 rounded-2xl border space-y-3 ${bgCard}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
                    <h3 className={`text-sm font-bold flex items-center gap-2 ${textTitle}`}>
                      <List size={16} className="text-[#0082CA]" />
                      <span>Liste Complète des Visites Techniques ({leads.filter(l => l.visitDate || true).length + 4})</span>
                    </h3>
                    <div className="text-xs text-slate-400">Filtré par date décroissante</div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                          isDark ? 'border-slate-800 text-slate-400 bg-slate-900/50' : 'border-slate-200 text-slate-500 bg-slate-50'
                        }`}>
                          <th className="p-3">Réf & Client</th>
                          <th className="p-3">Date & Créneau</th>
                          <th className="p-3">Format Visite</th>
                          <th className="p-3">Secteur / Adresse</th>
                          <th className="p-3">Commercial</th>
                          <th className="p-3">Statut Visite</th>
                          <th className="p-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                        {[
                          { id: 'WM-2026-001', client: 'Alexandre Mercier', type: 'domicile', date: '25/09/2026', time: '09:30', place: '75016 Paris', agent: 'Thomas L.', status: 'confirme', volume: '32 m³' },
                          { id: 'WM-2026-002', client: 'Sophie & Marc Laurent', type: 'visio', date: '25/09/2026', time: '14:00', place: '92100 Boulogne', agent: 'Sarah M.', status: 'realise', volume: '48 m³' },
                          { id: 'WM-2026-003', client: 'TechCorp SAS', type: 'domicile', date: '28/09/2026', time: '10:30', place: '92800 La Défense', agent: 'Thomas L.', status: 'confirme', volume: '140 m³' },
                          { id: 'WM-2026-004', client: 'Julien Bernard', type: 'domicile', date: '27/09/2026', time: '09:00', place: '93100 Montreuil', agent: 'Sarah M.', status: 'planifie', volume: '38 m³' },
                          { id: 'WM-2026-005', client: 'Dr. Émilie Moreau', type: 'telephone', date: '26/09/2026', time: '15:30', place: '92200 Neuilly-sur-Seine', agent: 'Karim B.', status: 'devis_genere', volume: '22 m³' },
                          { id: 'WM-2026-006', client: 'Famille Leroy', type: 'domicile', date: '30/09/2026', time: '10:00', place: '92500 Rueil-Malmaison', agent: 'Thomas L.', status: 'confirme', volume: '75 m³' },
                        ].map(rdv => (
                          <tr key={rdv.id} className={`hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors`}>
                            <td className="p-3">
                              <div className="font-mono text-[11px] text-[#0082CA] font-bold">{rdv.id}</div>
                              <div className={`font-semibold ${textTitle}`}>{rdv.client}</div>
                              <div className="text-[10px] text-slate-400 font-mono">Volume estimé: {rdv.volume}</div>
                            </td>
                            <td className="p-3">
                              <div className={`font-medium ${textTitle}`}>{rdv.date}</div>
                              <div className="text-[10px] text-[#0082CA] font-mono font-bold flex items-center gap-1">
                                <Clock size={10} /> {rdv.time}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                                rdv.type === 'domicile'
                                  ? 'bg-amber-500/15 text-amber-600 border-amber-500/30'
                                  : rdv.type === 'visio'
                                  ? 'bg-blue-500/15 text-blue-600 border-blue-500/30'
                                  : 'bg-purple-500/15 text-purple-600 border-purple-500/30'
                              }`}>
                                {rdv.type === 'domicile' ? '🏠 Domicile' : rdv.type === 'visio' ? '📹 Visio-Guidée' : '📞 Téléphone'}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className={`font-medium flex items-center gap-1 ${textTitle}`}>
                                <MapPin size={12} className="text-slate-400" />
                                {rdv.place}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className={`font-semibold text-xs ${textTitle}`}>{rdv.agent}</div>
                              <div className="text-[10px] text-slate-400">Technicien métreur</div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                rdv.status === 'realise'
                                  ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                                  : rdv.status === 'devis_genere'
                                  ? 'bg-purple-500/15 text-purple-600 border border-purple-500/30'
                                  : 'bg-blue-500/15 text-blue-600 border border-blue-500/30'
                              }`}>
                                {rdv.status === 'realise' ? '✓ Réalisée' : rdv.status === 'devis_genere' ? '📄 Devis Généré' : '📅 Planifiée'}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchLead = leads.find(l => l.fullName.toLowerCase().includes(rdv.client.split(' ')[0].toLowerCase())) || leads[0];
                                    setSelectedLead(matchLead);
                                    setShowVisitModal(matchLead);
                                  }}
                                  className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors cursor-pointer ${
                                    isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                  }`}
                                >
                                  Modifier RDV
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const matchLead = leads.find(l => l.fullName.toLowerCase().includes(rdv.client.split(' ')[0].toLowerCase())) || leads[0];
                                    setSelectedLead(matchLead);
                                    setActiveTab('pipeline');
                                  }}
                                  className="px-2.5 py-1 rounded-lg bg-[#0082CA] text-white text-[11px] font-medium hover:bg-[#0070B0] transition-colors cursor-pointer"
                                >
                                  Fiche Devis
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* VIEW 3: CARTE & SECTEURS D'INTERVENTION */}
              {commercialViewMode === 'map' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                    {/* Left: Territory Sectors Breakdown */}
                    <div className="lg:col-span-2 space-y-3">
                      <div className={`p-5 rounded-2xl border space-y-4 ${bgCard}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className={`text-base font-bold flex items-center gap-2 ${textTitle}`}>
                              <MapPin size={18} className="text-[#0082CA]" />
                              <span>Découpage des Secteurs Commercial Île-de-France</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-0.5">Optimisation des kilomètres et affectation par zones</p>
                          </div>
                          <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold">
                            Tournées Optimisées AI
                          </span>
                        </div>

                        {/* Interactive Sector Cards */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {[
                            {
                              zone: 'Secteur Paris Intra-Muros (75)',
                              agent: 'Thomas L.',
                              visitsThisWeek: 6,
                              density: 'Très Forte',
                              avgDistance: '4.2 km / rdv',
                              color: 'border-l-4 border-l-[#0082CA]',
                              departments: 'Paris 1er à 20ème arrondissement'
                            },
                            {
                              zone: 'Secteur Petite Couronne (92, 93, 94)',
                              agent: 'Sarah M.',
                              visitsThisWeek: 8,
                              density: 'Haute',
                              avgDistance: '9.8 km / rdv',
                              color: 'border-l-4 border-l-emerald-500',
                              departments: 'Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne'
                            },
                            {
                              zone: 'Secteur Grande Couronne Ouest (78, 95)',
                              agent: 'Karim B.',
                              visitsThisWeek: 4,
                              density: 'Moyenne',
                              avgDistance: '18.5 km / rdv',
                              color: 'border-l-4 border-l-purple-500',
                              departments: 'Yvelines (Versailles, St-Germain), Val-d\'Oise'
                            },
                            {
                              zone: 'Secteur Grande Couronne Est (91, 77)',
                              agent: 'Thomas L.',
                              visitsThisWeek: 3,
                              density: 'Modérée',
                              avgDistance: '22.0 km / rdv',
                              color: 'border-l-4 border-l-amber-500',
                              departments: 'Essonne (Évry), Seine-et-Marne (Melun, Meaux)'
                            },
                          ].map((sect, idx) => (
                            <div key={idx} className={`p-4 rounded-xl border space-y-2.5 ${sect.color} ${bgCardSub}`}>
                              <div className="flex items-center justify-between">
                                <span className={`font-bold text-xs ${textTitle}`}>{sect.zone}</span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#0082CA]/10 text-[#0082CA] font-bold">
                                  {sect.visitsThisWeek} RDVs
                                </span>
                              </div>

                              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                                {sect.departments}
                              </div>

                              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between text-xs">
                                <div>
                                  <span className="text-[10px] text-slate-400">Responsable: </span>
                                  <strong className={textTitle}>{sect.agent}</strong>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] text-slate-400">Densité: </span>
                                  <span className="font-semibold text-emerald-600">{sect.density}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right: Geographical Map Visualizer Placeholder Widget */}
                    <div className={`p-5 rounded-2xl border flex flex-col justify-between space-y-4 ${bgCard}`}>
                      <div className="space-y-1">
                        <h4 className={`text-sm font-bold ${textTitle}`}>Cartographie des Tournées</h4>
                        <p className="text-xs text-slate-400">Superposition GPS des visites programmées</p>
                      </div>

                      <div className={`h-64 rounded-xl border flex flex-col items-center justify-center p-4 text-center space-y-3 relative overflow-hidden ${
                        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
                      }`}>
                        {/* Simulated map background lines */}
                        <div className="absolute inset-0 opacity-10 bg-[radial-[#0082CA]_1px,transparent_1px] [background-size:16px_16px]" />
                        
                        <div className="relative z-10 w-12 h-12 rounded-full bg-[#0082CA]/15 text-[#0082CA] flex items-center justify-center">
                          <MapPin size={24} />
                        </div>

                        <div className="relative z-10 space-y-1">
                          <div className={`font-bold text-xs ${textTitle}`}>Île-de-France (100% Couverture)</div>
                          <div className="text-[11px] text-slate-400 max-w-xs">
                            4 tournées commerciales actives aujourd'hui avec parcours GPS optimisé.
                          </div>
                        </div>

                        <div className="relative z-10 flex gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-blue-500/20 text-blue-600 font-bold">Paris 16e</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-600 font-bold">Boulogne</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-500/20 text-purple-600 font-bold">Neuilly</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => alert("Lancement du calcul d'itinéraire optimisé GPS pour l'ensemble des techniciens commercial.")}
                        className="w-full py-2 rounded-xl bg-[#0082CA] hover:bg-[#0070B0] text-white text-xs font-semibold transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
                      >
                        <Zap size={14} /> Recalculer Itinéraires Optimisés GPS
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* VIEW 4: PERFORMANCES COMMERCIALES */}
              {commercialViewMode === 'performance' && (
                <div className="space-y-4">
                  {/* Top Stats Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                    {[
                      { label: 'Taux de Conversion Visite -> Devis Signé', value: '68.4%', trend: '+4.2%', color: 'emerald' },
                      { label: 'Précision Estimation Cubage (m³)', value: '96.2%', trend: 'Ultra-Précis', color: 'blue' },
                      { label: 'Délai Moyen Visite -> Envoi Devis', value: '2.4 heures', trend: '-30 min', color: 'purple' },
                      { label: 'Satisfaction Client Post-Visite', value: '4.9 / 5.0', trend: '★ 128 avis', color: 'amber' },
                    ].map(st => (
                      <div key={st.label} className={`p-4 rounded-2xl border space-y-2 ${bgCard}`}>
                        <div className="flex items-center justify-between text-[11px] text-slate-400 font-medium">
                          <span>{st.label}</span>
                        </div>
                        <div className="flex items-baseline justify-between">
                          <div className={`text-xl font-bold font-mono ${textTitle}`}>{st.value}</div>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">
                            {st.trend}
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                          <div className="bg-[#0082CA] h-full w-[78%] rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Commercial Leaderboard Table */}
                  <div className={`p-5 rounded-2xl border space-y-4 ${bgCard}`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className={`text-base font-bold flex items-center gap-2 ${textTitle}`}>
                          <BarChart3 size={18} className="text-[#0082CA]" />
                          <span>Classement & Performance des Commerciaux</span>
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">Suivi individuel des visites effectuées et chiffre d'affaires concrétisé</p>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">Mois en cours : Septembre 2026</span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className={`border-b text-[10px] font-bold uppercase tracking-wider ${
                            isDark ? 'border-slate-800 text-slate-400 bg-slate-900/50' : 'border-slate-200 text-slate-500 bg-slate-50'
                          }`}>
                            <th className="p-3">Commercial</th>
                            <th className="p-3">Secteur Attribué</th>
                            <th className="p-3">Visites Réalisées</th>
                            <th className="p-3">Devis Acceptés</th>
                            <th className="p-3">Taux de Concrétisation</th>
                            <th className="p-3 font-mono text-right">CA Généré</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
                          {[
                            { name: 'Thomas L.', sector: 'Paris (75) & Petite Couronne', visits: 24, accepted: 17, rate: '70.8%', revenue: '48 950 €', badge: '🥇 Top Performer' },
                            { name: 'Sarah M.', sector: '93 / 94 & Est Parisien', visits: 21, accepted: 14, rate: '66.6%', revenue: '38 400 €', badge: '🥈 Excellent' },
                            { name: 'Karim B.', sector: '78 / 91 / 95 (Grande Couronne)', visits: 18, accepted: 12, rate: '66.7%', revenue: '34 800 €', badge: '🥉 Régulier' },
                          ].map((rep, idx) => (
                            <tr key={idx} className="hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                              <td className="p-3">
                                <div className={`font-bold ${textTitle}`}>{rep.name}</div>
                                <span className="text-[10px] text-[#0082CA] font-semibold">{rep.badge}</span>
                              </td>
                              <td className="p-3 text-slate-500 dark:text-slate-400 font-medium">
                                {rep.sector}
                              </td>
                              <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-200">
                                {rep.visits} visites
                              </td>
                              <td className="p-3 font-mono font-bold text-emerald-600">
                                {rep.accepted} devis
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono font-bold text-xs text-[#0082CA]">{rep.rate}</span>
                                  <div className="w-16 bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-emerald-500 h-full" style={{ width: rep.rate }} />
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 font-mono font-bold text-right text-sm text-[#0082CA]">
                                {rep.revenue}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: GESTION DES DEVIS ================= */}
          {activeTab === 'quotes_list' && (() => {
            const filteredQuotesList = quotes.filter(q => {
              const searchLower = quotesSearch.toLowerCase();
              const matchesSearch = quotesSearch === '' ||
                q.id.toLowerCase().includes(searchLower) ||
                q.clientName.toLowerCase().includes(searchLower) ||
                q.clientEmail.toLowerCase().includes(searchLower);
              const matchesStatus = quoteStatusFilter === 'all' || q.status === quoteStatusFilter;
              return matchesSearch && matchesStatus;
            });

            const totalAmount = filteredQuotesList.reduce((acc, q) => acc + q.amountTTC, 0);
            const pendingCount = quotes.filter(q => q.status === 'en_attente' || q.status === 'envoye').length;
            const acceptedCount = quotes.filter(q => q.status === 'accepte').length;

            return (
              <div className="space-y-5">
                {/* Header & New Quote Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-bold font-display ${textTitle}`}>Gestion des Devis Client</h2>
                    <p className={`text-xs ${textSub}`}>Création, modification, envoi, archivage et suivi des propositions financières</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newId = `DEV-2026-${Math.floor(100 + Math.random() * 900)}`;
                      setEditingQuote({
                        id: newId,
                        leadId: 'DEM-NEW',
                        clientName: 'Nouveau Client',
                        clientEmail: 'client@example.com',
                        clientPhone: '06 00 00 00 00',
                        moveDate: new Date().toISOString().split('T')[0],
                        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        formula: 'standard',
                        volume: 25,
                        departureAddress: 'Paris, France',
                        arrivalAddress: 'Lyon, France',
                        items: [
                          { description: 'Prestation globale de déménagement', quantity: 1, unitPriceHT: 1200, totalHT: 1200 }
                        ],
                        amountHT: 1200,
                        tvaRate: 20,
                        tvaAmount: 240,
                        amountTTC: 1440,
                        depositPercentage: 30,
                        depositAmount: 432,
                        status: 'brouillon',
                        createdAt: new Date().toISOString().split('T')[0]
                      });
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0082CA] text-white text-xs font-semibold hover:bg-[#0070B0] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus size={15} /> Nouveau Devis
                  </button>
                </div>

                {/* KPI Overview Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className={`p-4 rounded-2xl border space-y-1 ${bgCard}`}>
                    <div className="text-[11px] font-semibold text-slate-400">Total Devis</div>
                    <div className={`text-xl font-bold font-mono ${textTitle}`}>{quotes.length}</div>
                    <div className="text-[10px] text-slate-400">Toutes catégories</div>
                  </div>
                  <div className={`p-4 rounded-2xl border space-y-1 ${bgCard}`}>
                    <div className="text-[11px] font-semibold text-slate-400">En Attente / Envoyés</div>
                    <div className="text-xl font-bold font-mono text-purple-600 dark:text-purple-400">{pendingCount}</div>
                    <div className="text-[10px] text-slate-400">En cours de décision</div>
                  </div>
                  <div className={`p-4 rounded-2xl border space-y-1 ${bgCard}`}>
                    <div className="text-[11px] font-semibold text-slate-400">Devis Acceptés</div>
                    <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{acceptedCount}</div>
                    <div className="text-[10px] text-emerald-500 font-medium">Taux conv. ~{quotes.length ? Math.round((acceptedCount / quotes.length) * 100) : 0}%</div>
                  </div>
                  <div className={`p-4 rounded-2xl border space-y-1 ${bgCard}`}>
                    <div className="text-[11px] font-semibold text-slate-400">Montant Filtré TTC</div>
                    <div className="text-xl font-bold font-mono text-[#0082CA]">{totalAmount.toLocaleString('fr-FR')} €</div>
                    <div className="text-[10px] text-slate-400">{filteredQuotesList.length} devis affichés</div>
                  </div>
                </div>

                {/* Search & Filters & Bulk Actions Toolbar */}
                <div className={`p-3.5 rounded-2xl border space-y-3 ${bgCard}`}>
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="relative flex-1">
                      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={quotesSearch}
                        onChange={e => setQuotesSearch(e.target.value)}
                        placeholder="Rechercher par N° devis, nom ou email client..."
                        className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs outline-none transition-all ${
                          isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-[#0082CA]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0082CA]'
                        }`}
                      />
                    </div>

                    {/* Status Pill Filters */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                      {[
                        { id: 'all', label: 'Tous' },
                        { id: 'en_attente', label: 'En attente' },
                        { id: 'envoye', label: 'Envoyés' },
                        { id: 'accepte', label: 'Acceptés' },
                        { id: 'refuse', label: 'Refusés' },
                        { id: 'archive', label: 'Archivés' },
                        { id: 'brouillon', label: 'Brouillons' }
                      ].map(st => (
                        <button
                          key={st.id}
                          type="button"
                          onClick={() => setQuoteStatusFilter(st.id)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                            quoteStatusFilter === st.id
                              ? 'bg-[#0082CA] text-white shadow-xs'
                              : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Bulk Actions Bar (When Items Selected) */}
                  {selectedQuoteIds.length > 0 && (
                    <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/30 flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-2 text-purple-600 dark:text-purple-300 font-semibold">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white text-[10px] flex items-center justify-center font-bold">
                          {selectedQuoteIds.length}
                        </span>
                        <span>devis sélectionné(s)</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleBulkSendQuotes}
                          className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Send size={12} /> Envoyer en masse
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkDownloadQuotes}
                          className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Download size={12} /> Télécharger Pack PDF
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkArchiveQuotes}
                          className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Archive size={12} /> Archiver
                        </button>
                        <button
                          type="button"
                          onClick={handleBulkDeleteQuotes}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Trash2 size={12} /> Supprimer
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quotes Table */}
                <div className={`rounded-2xl border overflow-hidden ${bgCard}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className={`border-b font-semibold uppercase tracking-wider text-[10px] ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50/90 border-slate-200 text-slate-500'
                      }`}>
                        <tr>
                          <th className="py-3 px-3 w-8 text-center">
                            <input
                              type="checkbox"
                              checked={filteredQuotesList.length > 0 && selectedQuoteIds.length === filteredQuotesList.length}
                              onChange={() => handleToggleSelectAllQuotes(filteredQuotesList)}
                              className="rounded border-slate-400 cursor-pointer"
                            />
                          </th>
                          <th className="py-3 px-4">N° Devis</th>
                          <th className="py-3 px-4">Client & Contact</th>
                          <th className="py-3 px-4">Formule & Vol.</th>
                          <th className="py-3 px-4">Montant TTC</th>
                          <th className="py-3 px-4">Acompte (30%)</th>
                          <th className="py-3 px-4">Statut</th>
                          <th className="py-3 px-4">Dates</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                        {filteredQuotesList.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="py-8 text-center text-slate-400">
                              Aucun devis ne correspond aux critères de recherche.
                            </td>
                          </tr>
                        ) : (
                          filteredQuotesList.map(q => {
                            const isSelected = selectedQuoteIds.includes(q.id);
                            return (
                              <tr key={q.id} className={`transition-colors ${isSelected ? (isDark ? 'bg-purple-950/20' : 'bg-purple-50/50') : (isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100/60')}`}>
                                <td className="py-3 px-3 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggleSelectQuote(q.id)}
                                    className="rounded border-slate-400 cursor-pointer"
                                  />
                                </td>
                                <td className="py-3 px-4 font-mono font-semibold text-[#0082CA]">
                                  {q.id}
                                  <div className="text-[10px] text-slate-400 font-normal">Ref {q.leadId}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className={`font-semibold ${textTitle}`}>{q.clientName}</div>
                                  <div className="text-[10px] text-slate-400">{q.clientEmail} · {q.clientPhone}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <span className="capitalize font-semibold text-slate-700 dark:text-slate-200">{q.formula}</span>
                                  <div className="text-[10px] text-slate-400">{q.volume} m³</div>
                                </td>
                                <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                  {q.amountTTC.toFixed(2)} €
                                  <div className="text-[10px] text-slate-400 font-normal">HT: {q.amountHT.toFixed(2)} €</div>
                                </td>
                                <td className="py-3 px-4 font-mono text-purple-600 dark:text-purple-400 font-semibold">
                                  {q.depositAmount.toFixed(2)} €
                                </td>
                                <td className="py-3 px-4">
                                  <select
                                    value={q.status}
                                    onChange={e => handleUpdateQuoteStatus(q.id, e.target.value as QuoteDocStatus)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer outline-none ${
                                      q.status === 'accepte' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' :
                                      q.status === 'envoye' ? 'bg-purple-500/15 text-purple-600 border-purple-500/30' :
                                      q.status === 'en_attente' ? 'bg-amber-500/15 text-amber-600 border-amber-500/30' :
                                      q.status === 'refuse' ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' :
                                      q.status === 'archive' ? 'bg-slate-400/15 text-slate-400 border-slate-400/30' :
                                      'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                    }`}
                                  >
                                    <option value="brouillon" className="bg-slate-900 text-white">Brouillon</option>
                                    <option value="en_attente" className="bg-slate-900 text-white">En attente</option>
                                    <option value="envoye" className="bg-slate-900 text-white">Envoyé</option>
                                    <option value="accepte" className="bg-slate-900 text-white">Accepté</option>
                                    <option value="refuse" className="bg-slate-900 text-white">Refusé</option>
                                    <option value="archive" className="bg-slate-900 text-white">Archivé</option>
                                  </select>
                                </td>
                                <td className="py-3 px-4 text-[10px] text-slate-400">
                                  <div>Créé: {q.createdAt}</div>
                                  <div>Dém.: {q.moveDate}</div>
                                </td>
                                <td className="py-3 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <button
                                      type="button"
                                      title="Aperçu PDF"
                                      onClick={() => setPreviewQuote(q)}
                                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                                      }`}
                                    >
                                      <Eye size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Éditer le devis"
                                      onClick={() => setEditingQuote(q)}
                                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-[#0082CA] border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-[#0082CA] border-slate-200'
                                      }`}
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Envoyer par email/WhatsApp"
                                      onClick={() => {
                                        handleUpdateQuoteStatus(q.id, 'envoye');
                                        alert(`✉️ Devis ${q.id} transmis au client ${q.clientName}`);
                                      }}
                                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-purple-400 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-purple-600 border-slate-200'
                                      }`}
                                    >
                                      <Send size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Archiver"
                                      onClick={() => handleUpdateQuoteStatus(q.id, 'archive')}
                                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-amber-600 border-slate-200'
                                      }`}
                                    >
                                      <Archive size={13} />
                                    </button>
                                    <button
                                      type="button"
                                      title="Supprimer"
                                      onClick={() => handleDeleteSingleQuote(q.id)}
                                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                                        isDark ? 'bg-slate-800 hover:bg-slate-700 text-rose-400 border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-rose-600 border-slate-200'
                                      }`}
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ================= TAB 4: FACTURES CLIENTS ================= */}
          {activeTab === 'invoices_list' && (() => {
            const filteredInvoicesList = invoices.filter(inv => {
              const searchLower = invoicesSearch.toLowerCase();
              const matchesSearch = invoicesSearch === '' ||
                inv.id.toLowerCase().includes(searchLower) ||
                inv.clientName.toLowerCase().includes(searchLower) ||
                inv.leadId.toLowerCase().includes(searchLower);
              const matchesStatus = invoiceStatusFilter === 'all' || inv.status === invoiceStatusFilter;
              return matchesSearch && matchesStatus;
            });

            const totalInvoiced = filteredInvoicesList.reduce((acc, inv) => acc + inv.amountTTC, 0);
            const paidInvoiced = invoices.filter(inv => inv.status === 'payee').reduce((acc, inv) => acc + inv.amountTTC, 0);
            const pendingInvoiced = invoices.filter(inv => inv.status === 'envoyee' || inv.status === 'en_retard').reduce((acc, inv) => acc + inv.amountTTC, 0);

            return (
              <div className="space-y-5">
                {/* Header & New Invoice Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-bold font-display ${textTitle}`}>Factures Clients Centralisées</h2>
                    <p className={`text-xs ${textSub}`}>Historique d'émission des factures d'acompte (30%) et factures de solde (70%)</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const newInvoiceId = `FAC-2026-${Math.floor(100 + Math.random() * 900)}`;
                      const newDoc: InvoiceDocument = {
                        id: newInvoiceId,
                        leadId: 'DEM-NEW',
                        clientName: 'Client Facture',
                        clientEmail: 'facture@client.com',
                        type: 'solde',
                        amountHT: 1500,
                        tvaRate: 20,
                        tvaAmount: 300,
                        amountTTC: 1800,
                        status: 'envoyee',
                        issueDate: new Date().toISOString().split('T')[0],
                        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
                      };
                      setInvoices(prev => [newDoc, ...prev]);
                      setShowInvoiceModal(newDoc);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-[#0082CA] text-white text-xs font-semibold hover:bg-[#0070B0] transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <Plus size={15} /> Nouvelle Facture Client
                  </button>
                </div>

                {/* KPI Overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className={`p-4 rounded-2xl border space-y-1 ${bgCard}`}>
                    <div className="text-[11px] font-semibold text-slate-400">Total Factures</div>
                    <div className={`text-xl font-bold font-mono ${textTitle}`}>{invoices.length}</div>
                    <div className="text-[10px] text-slate-400">Toutes pièces émises</div>
                  </div>
                  <div className={`p-4 rounded-2xl border space-y-1 ${bgCard}`}>
                    <div className="text-[11px] font-semibold text-slate-400">Total Encaissé</div>
                    <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{paidInvoiced.toLocaleString('fr-FR')} €</div>
                    <div className="text-[10px] text-emerald-500 font-medium">Payé sur compte bancaire</div>
                  </div>
                  <div className={`p-4 rounded-2xl border space-y-1 ${bgCard}`}>
                    <div className="text-[11px] font-semibold text-slate-400">Factures En Attente</div>
                    <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{pendingInvoiced.toLocaleString('fr-FR')} €</div>
                    <div className="text-[10px] text-slate-400">À recevoir</div>
                  </div>
                  <div className={`p-4 rounded-2xl border space-y-1 ${bgCard}`}>
                    <div className="text-[11px] font-semibold text-slate-400">Montant Filtré TTC</div>
                    <div className="text-xl font-bold font-mono text-[#0082CA]">{totalInvoiced.toLocaleString('fr-FR')} €</div>
                    <div className="text-[10px] text-slate-400">{filteredInvoicesList.length} factures sélectionnées</div>
                  </div>
                </div>

                {/* Search & Filters Toolbar */}
                <div className={`p-3.5 rounded-2xl border flex flex-col md:flex-row md:items-center justify-between gap-3 ${bgCard}`}>
                  <div className="relative flex-1">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={invoicesSearch}
                      onChange={e => setInvoicesSearch(e.target.value)}
                      placeholder="Rechercher par N° facture, nom client ou dossier..."
                      className={`w-full pl-9 pr-3 py-1.5 rounded-xl border text-xs outline-none transition-all ${
                        isDark ? 'bg-slate-950 border-slate-800 text-white focus:border-[#0082CA]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-[#0082CA]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs">
                    {[
                      { id: 'all', label: 'Toutes' },
                      { id: 'payee', label: 'Payées' },
                      { id: 'envoyee', label: 'Envoyées' },
                      { id: 'en_retard', label: 'En retard' },
                      { id: 'brouillon', label: 'Brouillons' }
                    ].map(st => (
                      <button
                        key={st.id}
                        type="button"
                        onClick={() => setInvoiceStatusFilter(st.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                          invoiceStatusFilter === st.id
                            ? 'bg-[#0082CA] text-white shadow-xs'
                            : isDark ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Invoices Table */}
                <div className={`rounded-2xl border overflow-hidden ${bgCard}`}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                      <thead className={`border-b font-semibold uppercase tracking-wider text-[10px] ${
                        isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50/90 border-slate-200 text-slate-500'
                      }`}>
                        <tr>
                          <th className="py-3 px-4">N° Facture</th>
                          <th className="py-3 px-4">Type</th>
                          <th className="py-3 px-4">Client & Dossier</th>
                          <th className="py-3 px-4">Montant HT</th>
                          <th className="py-3 px-4">Total TTC</th>
                          <th className="py-3 px-4">Statut Paiement</th>
                          <th className="py-3 px-4">Échéance</th>
                          <th className="py-3 px-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                        {filteredInvoicesList.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="py-8 text-center text-slate-400">
                              Aucune facture client trouvée.
                            </td>
                          </tr>
                        ) : (
                          filteredInvoicesList.map(inv => (
                            <tr key={inv.id} className={`transition-colors ${isDark ? 'hover:bg-slate-800/40' : 'hover:bg-slate-100/60'}`}>
                              <td className="py-3 px-4 font-mono font-semibold text-[#0082CA]">
                                {inv.id}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border ${
                                  inv.type === 'acompte' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                                  inv.type === 'solde' ? 'bg-purple-500/10 text-purple-600 border-purple-500/20' :
                                  'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                                }`}>
                                  {inv.type === 'acompte' ? 'Acompte 30%' : inv.type === 'solde' ? 'Solde 70%' : 'Globale 100%'}
                                </span>
                              </td>
                              <td className="py-3 px-4">
                                <div className={`font-semibold ${textTitle}`}>{inv.clientName}</div>
                                <div className="text-[10px] text-slate-400">Dossier: {inv.leadId}</div>
                              </td>
                              <td className="py-3 px-4 font-mono">
                                {inv.amountHT.toFixed(2)} €
                              </td>
                              <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-white">
                                {inv.amountTTC.toFixed(2)} €
                              </td>
                              <td className="py-3 px-4">
                                <select
                                  value={inv.status}
                                  onChange={e => handleUpdateInvoiceStatus(inv.id, e.target.value as InvoiceStatus)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-semibold border cursor-pointer outline-none ${
                                    inv.status === 'payee' ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30' :
                                    inv.status === 'envoyee' ? 'bg-blue-500/15 text-blue-600 border-blue-500/30' :
                                    inv.status === 'en_retard' ? 'bg-rose-500/15 text-rose-600 border-rose-500/30' :
                                    'bg-slate-500/10 text-slate-500 border-slate-500/20'
                                  }`}
                                >
                                  <option value="brouillon" className="bg-slate-900 text-white">Brouillon</option>
                                  <option value="envoyee" className="bg-slate-900 text-white">Envoyée</option>
                                  <option value="payee" className="bg-slate-900 text-white">Payée</option>
                                  <option value="en_retard" className="bg-slate-900 text-white">En Retard</option>
                                </select>
                              </td>
                              <td className="py-3 px-4 text-[10px] text-slate-400 font-mono">
                                {inv.dueDate || inv.issueDate}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => setShowInvoiceModal(inv)}
                                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                                      isDark ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700' : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                                    }`}
                                  >
                                    <Eye size={12} /> PDF Facture
                                  </button>
                                  {inv.status !== 'payee' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateInvoiceStatus(inv.id, 'payee')}
                                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                    >
                                      <CheckCircle2 size={12} /> Payer
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ================= TAB 4: PLANNING & LOGISTIQUE ================= */}
          {activeTab === 'logistics' && (
            <div className="space-y-5">
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold font-display ${textTitle}`}>Planning Logistique</h2>
                <p className={`text-xs ${textSub}`}>Camions et équipes d'intervention</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {trucks.map(truck => (
                  <div key={truck.id} className={`p-4 rounded-2xl border space-y-3 ${bgCard}`}>
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600">
                        <Truck size={20} />
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${
                        truck.status === 'en_mission' ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30'
                      }`}>
                        {truck.status === 'en_mission' ? 'EN MISSION' : 'DISPONIBLE'}
                      </span>
                    </div>

                    <div>
                      <h4 className={`font-semibold text-xs sm:text-sm ${textTitle}`}>{truck.name}</h4>
                      <p className="text-[11px] text-slate-400">{truck.type}</p>
                    </div>

                    <div className={`p-3 rounded-xl border text-xs space-y-1 ${bgCardSub}`}>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Chauffeur :</span>
                        <strong className={textTitle}>{truck.driver}</strong>
                      </div>
                      <div className="flex justify-between text-slate-400 text-[11px]">
                        <span>Équipe :</span>
                        <strong className={textTitle}>{truck.teamSize} pers.</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 5: CUSTOMER DIRECTORY ================= */}
          {activeTab === 'customers' && (
            <div className="space-y-5">
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold font-display ${textTitle}`}>Fichier Clients</h2>
                <p className={`text-xs ${textSub}`}>Base clients centralisée</p>
              </div>

              <div className={`rounded-2xl border overflow-hidden ${bgCard}`}>
                <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                  <thead className={`border-b font-semibold uppercase tracking-wider text-[11px] ${
                    isDark ? 'bg-slate-950 border-slate-800 text-slate-400' : 'bg-slate-50/80 border-slate-200 text-slate-500'
                  }`}>
                    <tr>
                      <th className="py-3 px-4">Client ID</th>
                      <th className="py-3 px-4">Nom & Contact</th>
                      <th className="py-3 px-4">Type</th>
                      <th className="py-3 px-4">Missions</th>
                      <th className="py-3 px-4">Total Dépensé</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
                    {customers.map(c => (
                      <tr key={c.id} className="hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-semibold text-[#0082CA]">{c.id}</td>
                        <td className="py-3 px-4">
                          <div className={`font-semibold ${textTitle}`}>{c.fullName}</div>
                          <div className="text-[10px] text-slate-400">{c.email} · {c.phone}</div>
                        </td>
                        <td className="py-3 px-4 capitalize">{c.type}</td>
                        <td className="py-3 px-4 font-mono">{c.totalMoves} mission(s)</td>
                        <td className="py-3 px-4 font-mono font-semibold text-emerald-600">{c.totalSpent.toLocaleString('fr-FR')} €</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedCustomer(c)}
                            className="p-1.5 rounded-lg bg-[#0082CA]/10 text-[#0082CA] hover:bg-[#0082CA] hover:text-white inline-block transition-colors"
                          >
                            <Eye size={13} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= TAB 6: SETTINGS ================= */}
          {activeTab === 'settings' && (
            <div className="space-y-5">
              <div>
                <h2 className={`text-xl sm:text-2xl font-bold font-display ${textTitle}`}>Paramètres CRM</h2>
                <p className={`text-xs ${textSub}`}>Gestion des utilisateurs et rôles</p>
              </div>

              <div className={`p-5 rounded-2xl border space-y-3 ${bgCard}`}>
                <h3 className={`text-xs font-bold uppercase tracking-wider ${textTitle}`}>Équipe Commerciale</h3>
                <div className="space-y-2">
                  {DEMO_CRM_USERS.map(u => (
                    <div key={u.id} className={`p-3 rounded-xl border flex items-center justify-between ${bgCardSub}`}>
                      <div className="flex items-center gap-3">
                        <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover border border-slate-300 dark:border-white/20" />
                        <div>
                          <div className={`font-semibold text-xs sm:text-sm ${textTitle}`}>{u.name}</div>
                          <div className="text-[11px] text-slate-400">{u.title}</div>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#0082CA]/10 text-[#0082CA] uppercase">
                        {u.role}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* ================= MODAL 1: LEAD DETAILS DRAWER ================= */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className={`w-full max-w-2xl h-full shadow-2xl border-l overflow-y-auto flex flex-col ${
            isDark ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`} onClick={e => e.stopPropagation()}>
            <div className={`p-4 sm:p-5 border-b flex items-center justify-between sticky top-0 z-10 ${
              isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-50 border-slate-200'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-[#0082CA] text-base">{selectedLead.id}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                    isDark ? `${STATUS_CONFIG[selectedLead.status].bgDark} ${STATUS_CONFIG[selectedLead.status].colorDark} ${STATUS_CONFIG[selectedLead.status].borderDark}` : `${STATUS_CONFIG[selectedLead.status].bgLight} ${STATUS_CONFIG[selectedLead.status].colorLight} ${STATUS_CONFIG[selectedLead.status].borderLight}`
                  }`}>
                    {STATUS_CONFIG[selectedLead.status].label}
                  </span>
                </div>
                <h3 className={`text-base sm:text-lg font-bold mt-0.5 ${textTitle}`}>{selectedLead.fullName}</h3>
              </div>
              <button type="button" onClick={() => setSelectedLead(null)} className="p-1.5 rounded-xl bg-slate-200/60 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-4 flex-1 text-xs">
              <div className={`p-3.5 rounded-xl border space-y-2 ${bgCardSub}`}>
                <label className="block font-semibold text-slate-500 dark:text-slate-400">Changer de Statut Commercial</label>
                <select
                  value={selectedLead.status}
                  onChange={e => handleStatusChange(selectedLead.id, e.target.value as QuoteStatus)}
                  className={`w-full px-3 py-1.5 rounded-xl font-semibold cursor-pointer ${
                    isDark ? 'bg-slate-900 border border-slate-700 text-white' : 'bg-white border border-slate-300 text-slate-900'
                  }`}
                >
                  {(Object.keys(STATUS_CONFIG) as QuoteStatus[]).map(st => (
                    <option key={st} value={st}>{STATUS_CONFIG[st].label}</option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <a
                  href={`tel:${selectedLead.phone}`}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                >
                  <Phone size={13} /> Appeler
                </a>
                <a
                  href={`https://wa.me/${selectedLead.phone.replace(/\s+/g, '')}?text=Bonjour%20${encodeURIComponent(selectedLead.fullName)},%20We%20Move%20souhaite%20faire%20le%20point%20sur%20votre%20devis%20${selectedLead.id}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                >
                  WhatsApp
                </a>
                <a
                  href={`mailto:${selectedLead.email}?subject=We%20Move%20-%20Votre%20devis%20${selectedLead.id}`}
                  className="p-2 rounded-xl bg-[#0082CA] hover:bg-[#0070B0] text-white font-semibold text-center flex items-center justify-center gap-1 transition-colors"
                >
                  <Mail size={13} /> Email
                </a>
                <button
                  type="button"
                  onClick={() => handleGenerateInvoiceFromLead(selectedLead)}
                  className="p-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-center flex items-center justify-center gap-1 transition-colors cursor-pointer"
                >
                  <FileText size={13} /> Devis PDF
                </button>
              </div>

              <div className={`grid grid-cols-2 gap-2.5 p-3.5 rounded-xl border ${bgCardSub}`}>
                <div><span className="text-slate-400 block text-[10px]">Email :</span><a href={`mailto:${selectedLead.email}`} className="text-[#0082CA] font-semibold">{selectedLead.email}</a></div>
                <div><span className="text-slate-400 block text-[10px]">Téléphone :</span><strong className={textTitle}>{selectedLead.phone}</strong></div>
                <div><span className="text-slate-400 block text-[10px]">Départ :</span><strong className={textTitle}>{selectedLead.departureAddress}</strong></div>
                <div><span className="text-slate-400 block text-[10px]">Arrivée :</span><strong className={textTitle}>{selectedLead.arrivalAddress}</strong></div>
              </div>

              {/* WORKFLOW PIPELINE CARDS: VISITE -> DEVIS -> PLANIFICATION */}
              <div className="space-y-3 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <h4 className={`font-semibold text-xs flex items-center gap-1.5 ${textTitle}`}>
                  <Zap size={14} className="text-[#0082CA]" />
                  <span>Avancement du Dossier</span>
                </h4>

                {/* STEP 1: VISITE TECHNIQUE */}
                <div className={`p-3.5 rounded-xl border space-y-2.5 ${bgCardSub}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Compass size={14} className="text-indigo-500" /> 1. Visite Technique
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      selectedLead.visitDate ? 'bg-indigo-500/15 text-indigo-600 border border-indigo-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {selectedLead.visitDate ? 'Programmée' : 'Non programmée'}
                    </span>
                  </div>

                  {selectedLead.visitDate && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 bg-indigo-500/10 p-2.5 rounded-lg border border-indigo-500/20">
                      <div><strong>Date :</strong> {selectedLead.visitDate}</div>
                      <div><strong>Format :</strong> {selectedLead.visitType === 'domicile' ? '🏠 Domicile' : selectedLead.visitType === 'visio' ? '📹 Visio' : '📞 Téléphone'}</div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowVisitModal(selectedLead);
                      setVisitForm({
                        date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        time: '10:30',
                        type: 'domicile',
                        notes: `Visite pour ${selectedLead.fullName}`
                      });
                    }}
                    className="w-full py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Compass size={13} />
                    <span>{selectedLead.visitDate ? 'Modifier Visite' : 'Programmer Visite'}</span>
                  </button>
                </div>

                {/* STEP 2: DEVIS COMMERCIAL */}
                <div className={`p-3.5 rounded-xl border space-y-2.5 ${bgCardSub}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <FileText size={14} className="text-purple-500" /> 2. Statut Devis
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      selectedLead.status === 'confirme' ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30' :
                      selectedLead.status === 'devis_envoye' ? 'bg-purple-500/15 text-purple-600 border border-purple-500/30' :
                      selectedLead.status === 'refuse' ? 'bg-rose-500/15 text-rose-600 border border-rose-500/30' :
                      'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {selectedLead.status === 'confirme' ? '✅ Accepté' :
                       selectedLead.status === 'devis_envoye' ? '✉️ Envoyé' :
                       selectedLead.status === 'devis_brouillon' ? '📄 Brouillon' :
                       selectedLead.status === 'refuse' ? '❌ Refusé' : 'En attente'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleDevisStatusChange(selectedLead.id, 'brouillon')}
                      className={`py-1.5 px-2 rounded-lg border text-center font-medium text-[11px] cursor-pointer transition-colors ${
                        selectedLead.status === 'devis_brouillon' ? 'bg-sky-600 text-white border-sky-600' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      📄 Brouillon
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDevisStatusChange(selectedLead.id, 'envoye')}
                      className={`py-1.5 px-2 rounded-lg border text-center font-medium text-[11px] cursor-pointer transition-colors ${
                        selectedLead.status === 'devis_envoye' ? 'bg-purple-600 text-white border-purple-600' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      ✉️ Envoyer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDevisStatusChange(selectedLead.id, 'accepte')}
                      className={`py-1.5 px-2 rounded-lg border text-center font-semibold text-[11px] cursor-pointer transition-colors ${
                        selectedLead.status === 'confirme' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40 hover:bg-emerald-600 hover:text-white'
                      }`}
                    >
                      ✅ Accepter Devis
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDevisStatusChange(selectedLead.id, 'refuse')}
                      className={`py-1.5 px-2 rounded-lg border text-center font-medium text-[11px] cursor-pointer transition-colors ${
                        selectedLead.status === 'refuse' ? 'bg-rose-600 text-white border-rose-600' : isDark ? 'bg-slate-900 border-slate-700 text-slate-300' : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      ❌ Refuser
                    </button>
                  </div>
                </div>

                {/* STEP 3: PLANIFICATION */}
                <div className={`p-3.5 rounded-xl border space-y-2.5 ${bgCardSub}`}>
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                      <Truck size={14} className="text-emerald-500" /> 3. Planification
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      selectedLead.assignedTruckName ? 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/30' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {selectedLead.assignedTruckName ? 'Planifié' : 'À planifier'}
                    </span>
                  </div>

                  {selectedLead.assignedTruckName && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-300 space-y-1 bg-emerald-500/10 p-2.5 rounded-lg border border-emerald-500/20">
                      <div><strong>Camion :</strong> {selectedLead.assignedTruckName}</div>
                      <div><strong>Chauffeur :</strong> {selectedLead.assignedDriver}</div>
                      <div><strong>Date/Heure :</strong> {selectedLead.scheduledTime}</div>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowScheduleModal(selectedLead);
                      setScheduleForm({
                        truckId: DEFAULT_TRUCKS[0].id,
                        date: selectedLead.moveDate || new Date().toISOString().split('T')[0],
                        time: '08:00',
                        driver: DEFAULT_TRUCKS[0].driver,
                        teamSize: 3,
                        equipment: DEFAULT_EQUIPMENT_ITEMS.slice(1, 5)
                      });
                    }}
                    className="w-full py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex items-center justify-center gap-1 transition-colors cursor-pointer"
                  >
                    <Truck size={13} />
                    <span>{selectedLead.assignedTruckName ? 'Modifier Planning' : 'Planifier Intervention'}</span>
                  </button>
                </div>
              </div>

              {/* Internal Notes */}
              <div className="space-y-2 pt-2 border-t border-slate-200/60 dark:border-slate-800">
                <h4 className={`font-semibold ${textTitle}`}>Notes Internes</h4>
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Ajouter une note..."
                    value={newNoteText}
                    onChange={e => setNewNoteText(e.target.value)}
                    className={`flex-1 px-3 py-1.5 rounded-xl text-xs ${
                      isDark ? 'bg-slate-950 border border-slate-800 text-white' : 'bg-slate-100 border border-slate-200 text-slate-900'
                    }`}
                  />
                  <button type="submit" className="px-3 py-1.5 bg-[#0082CA] text-white rounded-xl font-semibold cursor-pointer">Ajouter</button>
                </form>

                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {selectedLead.internalNotes?.map(n => (
                    <div key={n.id} className={`p-2.5 rounded-lg border space-y-0.5 text-[11px] ${bgCardSub}`}>
                      <div className="flex justify-between text-slate-400 text-[10px]">
                        <strong>{n.author}</strong>
                        <span>{new Date(n.createdAt).toLocaleDateString('fr-FR')}</span>
                      </div>
                      <p className={textTitle}>{n.content}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 2: OFFICIAL INVOICE PREVIEW ================= */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-xl">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0082CA] text-white font-bold flex items-center justify-center text-xs">WM</div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Document Officiel We Move</h3>
                  <p className="text-xs text-slate-500">Réf : {showInvoiceModal.id}</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowInvoiceModal(null)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <strong className="block text-slate-900 font-bold mb-1">Émetteur :</strong>
                  <p>We Move SAS</p>
                  <p>12 Rue de la Paix, 75002 Paris</p>
                  <p>SIRET : 892 104 992 00012</p>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold mb-1">Destinataire :</strong>
                  <p className="font-bold">{showInvoiceModal.clientName}</p>
                  <p>{showInvoiceModal.clientEmail}</p>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-300 bg-slate-100 font-semibold text-[11px]">
                    <th className="p-2">Description</th>
                    <th className="p-2 text-center">Qté</th>
                    <th className="p-2 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {(showInvoiceModal.items || []).map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-center">{item.quantity}</td>
                      <td className="p-2 text-right font-mono font-semibold">{item.total.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="flex justify-end pt-3 border-t border-slate-200">
                <div className="w-56 space-y-1 text-right font-mono text-xs">
                  <div className="flex justify-between text-slate-600"><span>Total HT :</span><span>{showInvoiceModal.amountHT.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-slate-600"><span>TVA 20% :</span><span>{showInvoiceModal.tvaAmount.toFixed(2)} €</span></div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-1 border-t"><span>Total TTC :</span><span>{showInvoiceModal.amountTTC.toFixed(2)} €</span></div>
                  <div className="flex justify-between text-emerald-600 font-semibold text-xs"><span>Acompte 30% :</span><span>{(showInvoiceModal.depositAmount ?? (showInvoiceModal.amountTTC * 0.3)).toFixed(2)} €</span></div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button type="button" onClick={() => window.print()} className="px-3.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs flex items-center gap-1.5">
                <Printer size={14} /> Imprimer / PDF
              </button>
              <button type="button" onClick={() => setShowInvoiceModal(null)} className="px-4 py-1.5 rounded-xl bg-[#0082CA] text-white font-semibold text-xs">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 3: MANUAL NEW LEAD CREATION ================= */}
      {showCreateLeadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="font-bold text-base">Créer un Nouveau Devis</h3>
              <button type="button" onClick={() => setShowCreateLeadModal(false)} className="text-slate-400">✕</button>
            </div>

            <form onSubmit={handleCreateNewLeadSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Nom du Client</label>
                <input
                  type="text"
                  required
                  placeholder="Jean-Marc Moreau"
                  value={newLeadForm.fullName}
                  onChange={e => setNewLeadForm({ ...newLeadForm, fullName: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="client@example.com"
                    value={newLeadForm.email}
                    onChange={e => setNewLeadForm({ ...newLeadForm, email: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    placeholder="06 11 22 33 44"
                    value={newLeadForm.phone}
                    onChange={e => setNewLeadForm({ ...newLeadForm, phone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Canal d'origine</label>
                  <select
                    value={newLeadForm.source}
                    onChange={e => setNewLeadForm({ ...newLeadForm, source: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                  >
                    <option value="telephone">📞 Appel Téléphonique</option>
                    <option value="recommandation">🗣️ Recommandation</option>
                    <option value="ads">📣 Ads</option>
                    <option value="partenaire">🤝 Partenaire</option>
                    <option value="crm_creation_manuelle">✍️ Saisie CRM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Type de Projet</label>
                  <select
                    value={newLeadForm.projectType}
                    onChange={e => setNewLeadForm({ ...newLeadForm, projectType: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                  >
                    <option value="particulier">👤 Particulier</option>
                    <option value="entreprise">🏢 Entreprise</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Adresse Départ</label>
                  <input
                    type="text"
                    placeholder="Paris 15e"
                    value={newLeadForm.departureAddress}
                    onChange={e => setNewLeadForm({ ...newLeadForm, departureAddress: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Adresse Arrivée</label>
                  <input
                    type="text"
                    placeholder="Boulogne-Billancourt"
                    value={newLeadForm.arrivalAddress}
                    onChange={e => setNewLeadForm({ ...newLeadForm, arrivalAddress: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Volume (m³)</label>
                  <input
                    type="number"
                    value={newLeadForm.volume}
                    onChange={e => setNewLeadForm({ ...newLeadForm, volume: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Formule</label>
                  <select
                    value={newLeadForm.formula}
                    onChange={e => setNewLeadForm({ ...newLeadForm, formula: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="economique">Économique</option>
                    <option value="standard">Standard</option>
                    <option value="confort">Confort</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Prix TTC (€)</label>
                  <input
                    type="number"
                    value={newLeadForm.estimatedPrice}
                    onChange={e => setNewLeadForm({ ...newLeadForm, estimatedPrice: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateLeadModal(false)} className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300">Annuler</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-[#0082CA] text-white font-semibold">Enregistrer le Devis</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 4: CUSTOMER PROFILE MODAL ================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0082CA]/20 text-[#38BDF8] flex items-center justify-center font-bold">
                  <Users size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-base">{selectedCustomer.fullName}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.id} · {selectedCustomer.type.toUpperCase()}</p>
                </div>
              </div>
              <button type="button" onClick={() => setSelectedCustomer(null)} className="text-slate-400">✕</button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                <div className="flex justify-between text-slate-400"><span>Email :</span><strong className="text-white">{selectedCustomer.email}</strong></div>
                <div className="flex justify-between text-slate-400"><span>Téléphone :</span><strong className="text-white">{selectedCustomer.phone}</strong></div>
                <div className="flex justify-between text-slate-400"><span>Missions Réalisées :</span><strong className="text-white">{selectedCustomer.totalMoves}</strong></div>
                <div className="flex justify-between text-slate-400"><span>Total Dépensé :</span><strong className="text-emerald-400 font-mono font-semibold">{selectedCustomer.totalSpent.toLocaleString('fr-FR')} €</strong></div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <a href={`tel:${selectedCustomer.phone}`} className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-semibold flex items-center gap-1.5">
                  <Phone size={13} /> Appeler
                </a>
                <button type="button" onClick={() => setSelectedCustomer(null)} className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300">
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL 5: VISITE TECHNIQUE MODAL ================= */}
      {showVisitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Compass className="text-[#0082CA]" size={18} />
                <h3 className="font-bold text-base">Programmer une Visite Technique</h3>
              </div>
              <button type="button" onClick={() => setShowVisitModal(null)} className="text-slate-400">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Dossier <strong className="text-white">{showVisitModal.fullName}</strong> ({showVisitModal.id})
            </p>

            <form onSubmit={handleScheduleVisitSubmit} className="space-y-2.5 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Format de la Visite</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setVisitForm({ ...visitForm, type: 'domicile' })}
                    className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                      visitForm.type === 'domicile' ? 'bg-[#0082CA] text-white border-[#0082CA]' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    🏠 Domicile
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitForm({ ...visitForm, type: 'visio' })}
                    className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                      visitForm.type === 'visio' ? 'bg-[#0082CA] text-white border-[#0082CA]' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    📹 Visio
                  </button>
                  <button
                    type="button"
                    onClick={() => setVisitForm({ ...visitForm, type: 'telephonique' })}
                    className={`p-2 rounded-xl border text-center font-semibold cursor-pointer transition-all ${
                      visitForm.type === 'telephonique' ? 'bg-[#0082CA] text-white border-[#0082CA]' : 'bg-slate-950 text-slate-400 border-slate-800'
                    }`}
                  >
                    📞 Téléphone
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={visitForm.date}
                    onChange={e => setVisitForm({ ...visitForm, date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Heure</label>
                  <input
                    type="text"
                    required
                    value={visitForm.time}
                    onChange={e => setVisitForm({ ...visitForm, time: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Notes d'Accès</label>
                <textarea
                  rows={2}
                  placeholder="Notes pour l'expert..."
                  value={visitForm.notes}
                  onChange={e => setVisitForm({ ...visitForm, notes: e.target.value })}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setShowVisitModal(null)} className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold">Annuler</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition-colors">Valider Visite</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 6: PLANIFICATION LOGISTIQUE & MOBILISATION ================= */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 text-white shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Truck className="text-emerald-400" size={18} />
                <h3 className="font-bold text-base">Mobilisation Logistique & Déménagement</h3>
              </div>
              <button type="button" onClick={() => setShowScheduleModal(null)} className="text-slate-400">✕</button>
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Devis accepté ! Affectez le camion, l'équipe et mobilisez le matériel requis.</span>
            </div>

            <form onSubmit={handleScheduleMoveSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">1. Camion & Véhicule Mobilisé</label>
                <select
                  value={scheduleForm.truckId}
                  onChange={e => {
                    const found = trucks.find(t => t.id === e.target.value);
                    setScheduleForm({ ...scheduleForm, truckId: e.target.value, driver: found?.driver || scheduleForm.driver });
                  }}
                  className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-semibold"
                >
                  {trucks.map(t => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.type}) - {t.plateNumber} [{t.status === 'en_mission' ? 'En mission' : 'Disponible'}]
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Date de Déménagement</label>
                  <input
                    type="date"
                    required
                    value={scheduleForm.date}
                    onChange={e => setScheduleForm({ ...scheduleForm, date: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Heure de Prise en Charge</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.time}
                    onChange={e => setScheduleForm({ ...scheduleForm, time: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Chef d'Équipe / Chauffeur</label>
                  <input
                    type="text"
                    required
                    value={scheduleForm.driver}
                    onChange={e => setScheduleForm({ ...scheduleForm, driver: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Effectif Équipe (Déménageurs)</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={scheduleForm.teamSize}
                    onChange={e => setScheduleForm({ ...scheduleForm, teamSize: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono"
                  />
                </div>
              </div>

              {/* Matériel Mobilisé Checkboxes */}
              <div>
                <label className="block text-slate-400 mb-1.5 font-semibold">2. Mobilisation du Matériel & Fournitures</label>
                <div className="space-y-1.5 bg-slate-950/80 p-3 rounded-xl border border-slate-800 max-h-36 overflow-y-auto">
                  {DEFAULT_EQUIPMENT_ITEMS.map((item, idx) => {
                    const isChecked = scheduleForm.equipment.includes(item);
                    return (
                      <label key={idx} className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-300 hover:text-white">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={e => {
                            if (e.target.checked) {
                              setScheduleForm({ ...scheduleForm, equipment: [...scheduleForm.equipment, item] });
                            } else {
                              setScheduleForm({ ...scheduleForm, equipment: scheduleForm.equipment.filter(i => i !== item) });
                            }
                          }}
                          className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
                        />
                        <span>{item}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowScheduleModal(null)} className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold">Plus tard</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 transition-colors shadow-sm">
                  <CheckCircle2 size={14} /> Confirmer Mobilisation & Déménagement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 7: MOTIF DE REFUS MODAL ================= */}
      {showRefuseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3.5 text-white shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <XCircle className="text-rose-400" size={18} />
                <h3 className="font-bold text-base">Archiver & Indiquer Motif de Refus</h3>
              </div>
              <button type="button" onClick={() => setShowRefuseModal(null)} className="text-slate-400">✕</button>
            </div>

            <p className="text-xs text-slate-400">
              Devis <strong className="text-white">{showRefuseModal.id}</strong> — Client : <strong className="text-white">{showRefuseModal.fullName}</strong>
            </p>

            <form onSubmit={handleRefusalSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-semibold">Motif du Refus Client</label>
                <select
                  value={refusalReasonInput}
                  onChange={e => setRefusalReasonInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-medium"
                >
                  <option value="Prix jugé trop élevé">💶 Prix jugé trop élevé par le client</option>
                  <option value="Date de déménagement indisponible">📅 Date non compatible</option>
                  <option value="Choix d'un déménageur concurrent">🏢 Choix d'un autre déménageur</option>
                  <option value="Projet de déménagement annulé/reporté">🚫 Projet du client annulé ou reporté</option>
                  <option value="Absence de réponse / Relance infructueuse">🔕 Client injoignable après relances</option>
                </select>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-800">
                <button type="button" onClick={() => setShowRefuseModal(null)} className="px-3.5 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-semibold">Annuler</button>
                <button type="submit" className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors">
                  Archiver en Devis Refusé
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL 8: ORDRE DE MISSION DÉMÉNAGEMENT (PRINTABLE) ================= */}
      {showMissionOrderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="w-full max-w-2xl bg-white text-slate-900 rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto shadow-2xl font-sans">
            <div className="flex items-center justify-between border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">WM</div>
                <div>
                  <h3 className="font-bold text-base text-slate-900">Ordre de Mission Déménagement</h3>
                  <p className="text-xs text-slate-500 font-mono">Dossier : {showMissionOrderModal.id} · Date intervention : {showMissionOrderModal.scheduledTime || showMissionOrderModal.moveDate}</p>
                </div>
              </div>
              <button type="button" onClick={() => setShowMissionOrderModal(null)} className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Clients & Route */}
              <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div>
                  <strong className="block text-slate-900 font-bold mb-1">📍 Départ :</strong>
                  <p className="font-bold text-slate-800">{showMissionOrderModal.departureAddress}</p>
                  <p className="text-slate-600">Étage {showMissionOrderModal.departureFloor} · Ascenseur : {showMissionOrderModal.departureElevator ? 'Oui' : 'Non'}</p>
                </div>
                <div>
                  <strong className="block text-slate-900 font-bold mb-1">📍 Arrivée :</strong>
                  <p className="font-bold text-slate-800">{showMissionOrderModal.arrivalAddress}</p>
                  <p className="text-slate-600">Étage {showMissionOrderModal.arrivalFloor} · Ascenseur : {showMissionOrderModal.arrivalElevator ? 'Oui' : 'Non'}</p>
                </div>
              </div>

              {/* Client Contacts & Move Specs */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-900">
                <div><strong>Client :</strong> {showMissionOrderModal.fullName}</div>
                <div><strong>Téléphone :</strong> {showMissionOrderModal.phone}</div>
                <div><strong>Volume :</strong> {showMissionOrderModal.volume} m³ ({showMissionOrderModal.formula.toUpperCase()})</div>
              </div>

              {/* Mobilization Resources: Crew & Equipment */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b pb-1">
                    <Truck size={14} className="text-emerald-600" /> Camion & Équipe Mobilisés
                  </h4>
                  <p><strong>Véhicule :</strong> {showMissionOrderModal.assignedTruckName || 'Camion 30m³ Hayon'}</p>
                  <p><strong>Chauffeur / Chef :</strong> {showMissionOrderModal.assignedDriver || 'Karim B.'}</p>
                  <div>
                    <strong>Effectif Déménageurs :</strong>
                    <ul className="list-disc list-inside text-slate-600 mt-1 space-y-0.5">
                      {(showMissionOrderModal.teamMembers || [`${showMissionOrderModal.assignedDriver || 'Karim B.'} (Chef)`, 'Déménageur 1', 'Déménageur 2']).map((m, i) => (
                        <li key={i}>{m}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <h4 className="font-bold text-slate-900 flex items-center gap-1.5 border-b pb-1">
                    <Box size={14} className="text-blue-600" /> Matériel Mobilisé
                  </h4>
                  <ul className="space-y-1 text-slate-700">
                    {(showMissionOrderModal.assignedEquipment || DEFAULT_EQUIPMENT_ITEMS.slice(1, 5)).map((item, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Instructions / Notes */}
              {showMissionOrderModal.notes && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                  <strong>Notes d'accès & consignes particulières :</strong>
                  <p className="mt-0.5">{showMissionOrderModal.notes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button type="button" onClick={() => window.print()} className="px-4 py-2 rounded-xl bg-slate-100 text-slate-800 font-semibold text-xs flex items-center gap-1.5 hover:bg-slate-200">
                <Printer size={14} /> Imprimer Ordre de Mission
              </button>
              <button type="button" onClick={() => setShowMissionOrderModal(null)} className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-700">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDITING QUOTE ================= */}
      {editingQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 text-white shadow-2xl my-8">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0082CA]/20 text-[#0082CA] flex items-center justify-center font-bold">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="font-bold text-base">Éditer le Devis <span className="font-mono text-[#0082CA]">{editingQuote.id}</span></h3>
                  <p className="text-xs text-slate-400">Modification des prestations, tarifs HT/TTC et acomptes</p>
                </div>
              </div>
              <button type="button" onClick={() => setEditingQuote(null)} className="text-slate-400 hover:text-white p-1">✕</button>
            </div>

            <form onSubmit={handleSaveEditedQuote} className="space-y-4 text-xs">
              {/* Client Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Nom du Client</label>
                  <input
                    type="text"
                    required
                    value={editingQuote.clientName}
                    onChange={e => setEditingQuote({ ...editingQuote, clientName: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Email Client</label>
                  <input
                    type="email"
                    required
                    value={editingQuote.clientEmail}
                    onChange={e => setEditingQuote({ ...editingQuote, clientEmail: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={editingQuote.clientPhone}
                    onChange={e => setEditingQuote({ ...editingQuote, clientPhone: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Move Details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Date Déménagement</label>
                  <input
                    type="date"
                    value={editingQuote.moveDate}
                    onChange={e => setEditingQuote({ ...editingQuote, moveDate: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Validité Devis Jusqu'au</label>
                  <input
                    type="date"
                    value={editingQuote.validUntil}
                    onChange={e => setEditingQuote({ ...editingQuote, validUntil: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Formule Choisie</label>
                  <select
                    value={editingQuote.formula}
                    onChange={e => setEditingQuote({ ...editingQuote, formula: e.target.value as any })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white capitalize"
                  >
                    <option value="economique">Économique</option>
                    <option value="standard">Standard</option>
                    <option value="prestige">Prestige</option>
                    <option value="sur_mesure">Sur Mesure</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">Volume (m³)</label>
                  <input
                    type="number"
                    value={editingQuote.volume}
                    onChange={e => setEditingQuote({ ...editingQuote, volume: Number(e.target.value) })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>
              </div>

              {/* Route Addresses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 p-3.5 bg-slate-950 border border-slate-800 rounded-xl">
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">📍 Adresse de Départ</label>
                  <input
                    type="text"
                    value={editingQuote.departureAddress}
                    onChange={e => setEditingQuote({ ...editingQuote, departureAddress: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1 font-semibold">📍 Adresse d'Arrivée</label>
                  <input
                    type="text"
                    value={editingQuote.arrivalAddress}
                    onChange={e => setEditingQuote({ ...editingQuote, arrivalAddress: e.target.value })}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-300">Lignes de Prestations (HT)</h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newItems = [...editingQuote.items, { description: 'Nouvelle prestation', quantity: 1, unitPriceHT: 100, totalHT: 100 }];
                      const newHT = newItems.reduce((acc, it) => acc + it.totalHT, 0);
                      const newTva = Number((newHT * 0.2).toFixed(2));
                      const newTTC = Number((newHT + newTva).toFixed(2));
                      const newDep = Number((newTTC * (editingQuote.depositPercentage / 100)).toFixed(2));
                      setEditingQuote({
                        ...editingQuote,
                        items: newItems,
                        amountHT: newHT,
                        tvaAmount: newTva,
                        amountTTC: newTTC,
                        depositAmount: newDep
                      });
                    }}
                    className="px-2.5 py-1 rounded-lg bg-[#0082CA]/20 text-[#0082CA] hover:bg-[#0082CA]/30 font-semibold text-[11px] flex items-center gap-1"
                  >
                    <Plus size={12} /> Ajouter une ligne
                  </button>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <tr>
                        <th className="p-2">Description</th>
                        <th className="p-2 w-16">Qté</th>
                        <th className="p-2 w-28">Prix Unit. HT</th>
                        <th className="p-2 w-28">Total HT</th>
                        <th className="p-2 w-10 text-center"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {editingQuote.items.map((item, idx) => (
                        <tr key={idx} className="bg-slate-900/60">
                          <td className="p-2">
                            <input
                              type="text"
                              value={item.description}
                              onChange={e => {
                                const newItems = [...editingQuote.items];
                                newItems[idx].description = e.target.value;
                                setEditingQuote({ ...editingQuote, items: newItems });
                              }}
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-white"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              min="1"
                              value={item.quantity}
                              onChange={e => {
                                const q = Number(e.target.value);
                                const newItems = [...editingQuote.items];
                                newItems[idx].quantity = q;
                                newItems[idx].totalHT = Number((q * newItems[idx].unitPriceHT).toFixed(2));
                                const newHT = newItems.reduce((acc, it) => acc + it.totalHT, 0);
                                const newTva = Number((newHT * 0.2).toFixed(2));
                                const newTTC = Number((newHT + newTva).toFixed(2));
                                const newDep = Number((newTTC * (editingQuote.depositPercentage / 100)).toFixed(2));
                                setEditingQuote({
                                  ...editingQuote,
                                  items: newItems,
                                  amountHT: newHT,
                                  tvaAmount: newTva,
                                  amountTTC: newTTC,
                                  depositAmount: newDep
                                });
                              }}
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-white font-mono text-center"
                            />
                          </td>
                          <td className="p-2">
                            <input
                              type="number"
                              step="0.01"
                              value={item.unitPriceHT}
                              onChange={e => {
                                const p = Number(e.target.value);
                                const newItems = [...editingQuote.items];
                                newItems[idx].unitPriceHT = p;
                                newItems[idx].totalHT = Number((newItems[idx].quantity * p).toFixed(2));
                                const newHT = newItems.reduce((acc, it) => acc + it.totalHT, 0);
                                const newTva = Number((newHT * 0.2).toFixed(2));
                                const newTTC = Number((newHT + newTva).toFixed(2));
                                const newDep = Number((newTTC * (editingQuote.depositPercentage / 100)).toFixed(2));
                                setEditingQuote({
                                  ...editingQuote,
                                  items: newItems,
                                  amountHT: newHT,
                                  tvaAmount: newTva,
                                  amountTTC: newTTC,
                                  depositAmount: newDep
                                });
                              }}
                              className="w-full px-2 py-1 bg-slate-950 border border-slate-800 rounded text-white font-mono"
                            />
                          </td>
                          <td className="p-2 font-mono font-bold text-slate-200">
                            {item.totalHT.toFixed(2)} €
                          </td>
                          <td className="p-2 text-center">
                            {editingQuote.items.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  const newItems = editingQuote.items.filter((_, i) => i !== idx);
                                  const newHT = newItems.reduce((acc, it) => acc + it.totalHT, 0);
                                  const newTva = Number((newHT * 0.2).toFixed(2));
                                  const newTTC = Number((newHT + newTva).toFixed(2));
                                  const newDep = Number((newTTC * (editingQuote.depositPercentage / 100)).toFixed(2));
                                  setEditingQuote({
                                    ...editingQuote,
                                    items: newItems,
                                    amountHT: newHT,
                                    tvaAmount: newTva,
                                    amountTTC: newTTC,
                                    depositAmount: newDep
                                  });
                                }}
                                className="text-rose-400 hover:text-rose-300"
                              >
                                ✕
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Summary */}
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Total HT :</span>
                  <span>{editingQuote.amountHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>TVA (20%) :</span>
                  <span>{editingQuote.tvaAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-base font-bold text-[#0082CA] pt-1 border-t border-slate-800">
                  <span>Total TTC :</span>
                  <span>{editingQuote.amountTTC.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-purple-400 font-semibold pt-1 border-t border-slate-800">
                  <span>Acompte à la commande ({editingQuote.depositPercentage}%) :</span>
                  <span>{editingQuote.depositAmount.toFixed(2)} €</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingQuote(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#0082CA] hover:bg-[#0070B0] text-white font-semibold flex items-center gap-1.5 shadow-md"
                >
                  <Check size={14} /> Enregistrer le Devis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: PREVIEW PRINTABLE QUOTE ================= */}
      {previewQuote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white text-slate-900 rounded-2xl p-8 space-y-6 shadow-2xl font-sans my-8">
            {/* Document Letterhead Header */}
            <div className="flex items-start justify-between border-b pb-6 border-slate-200">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-[#0082CA] text-white flex items-center justify-center font-bold text-sm">WM</div>
                  <div>
                    <h3 className="font-extrabold text-xl tracking-tight text-slate-900">WE MOVE DÉMÉNAGEMENT</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Services de Déménagement Professionnel & Transfert d'Entreprise</p>
                  </div>
                </div>
                <p className="text-[11px] text-slate-600 pt-2">
                  124 Avenue des Champs-Élysées, 75008 Paris · SIRET: 892 410 902 00014<br />
                  Tél: 01 84 25 30 00 · Email: contact@wemove-demenagement.fr
                </p>
              </div>

              <div className="text-right space-y-1">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#0082CA]/10 text-[#0082CA] inline-block">
                  DEVIS OFFICIEL
                </span>
                <div className="font-mono font-bold text-lg text-slate-900">{previewQuote.id}</div>
                <div className="text-xs text-slate-500">Date : <strong>{previewQuote.createdAt}</strong></div>
                <div className="text-xs text-slate-500">Valable jusqu'au : <strong>{previewQuote.validUntil}</strong></div>
              </div>
            </div>

            {/* Client & Move Specs Grid */}
            <div className="grid grid-cols-2 gap-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-[#0082CA]">Informations Client</h4>
                <p className="font-bold text-sm text-slate-900">{previewQuote.clientName}</p>
                <p className="text-slate-600">Email : {previewQuote.clientEmail}</p>
                <p className="text-slate-600">Téléphone : {previewQuote.clientPhone}</p>
              </div>

              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] text-[#0082CA]">Détails du Déménagement</h4>
                <p className="text-slate-800">Formule : <strong className="capitalize">{previewQuote.formula}</strong></p>
                <p className="text-slate-800">Volume estimé : <strong>{previewQuote.volume} m³</strong></p>
                <p className="text-slate-800">Date souhaitée : <strong>{previewQuote.moveDate}</strong></p>
              </div>

              <div className="col-span-2 pt-2 border-t border-slate-200 grid grid-cols-2 gap-4">
                <div>
                  <strong className="text-slate-900 block font-semibold mb-0.5">📍 Adresse de Départ :</strong>
                  <p className="text-slate-600">{previewQuote.departureAddress}</p>
                </div>
                <div>
                  <strong className="text-slate-900 block font-semibold mb-0.5">📍 Adresse d'Arrivée :</strong>
                  <p className="text-slate-600">{previewQuote.arrivalAddress}</p>
                </div>
              </div>
            </div>

            {/* Financial Line Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Désignation de la prestation</th>
                    <th className="p-3 w-16 text-center">Qté</th>
                    <th className="p-3 w-28 text-right">Prix Unit. HT</th>
                    <th className="p-3 w-28 text-right">Total HT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {previewQuote.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="p-3 font-medium text-slate-800">{item.description}</td>
                      <td className="p-3 text-center font-mono text-slate-600">{item.quantity}</td>
                      <td className="p-3 text-right font-mono text-slate-600">{item.unitPriceHT.toFixed(2)} €</td>
                      <td className="p-3 text-right font-mono font-semibold text-slate-900">{item.totalHT.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals & Deposit Calculation */}
            <div className="flex justify-end pt-2">
              <div className="w-72 space-y-2 text-xs font-mono p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between text-slate-600">
                  <span>Total HT :</span>
                  <span>{previewQuote.amountHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TVA ({previewQuote.tvaRate}%) :</span>
                  <span>{previewQuote.tvaAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-[#0082CA] pt-2 border-t border-slate-200">
                  <span>Total TTC :</span>
                  <span>{previewQuote.amountTTC.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-purple-700 font-bold pt-2 border-t border-slate-200">
                  <span>Acompte ({previewQuote.depositPercentage}%) :</span>
                  <span>{previewQuote.depositAmount.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1">
                  <span>Solde à la livraison :</span>
                  <span>{(previewQuote.amountTTC - previewQuote.depositAmount).toFixed(2)} €</span>
                </div>
              </div>
            </div>

            {/* Terms & Signature Box */}
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-200 text-[10px] text-slate-500">
              <div className="space-y-1">
                <p className="font-bold text-slate-700">Conditions de règlement :</p>
                <p>• Acompte de 30% payable à la confirmation du devis.</p>
                <p>• Solde de 70% réglable à la fin du déménagement.</p>
                <p>• Assurance marchande jusqu'à 50 000€ incluse.</p>
              </div>

              <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center space-y-6">
                <p className="font-bold text-slate-700">Mention "Bon pour accord" + Signature Client :</p>
                <div className="h-8"></div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Printer size={14} /> Imprimer / PDF
              </button>
              <button
                type="button"
                onClick={() => {
                  handleUpdateQuoteStatus(previewQuote.id, 'envoye');
                  alert(`✉️ Devis ${previewQuote.id} envoyé par email au client.`);
                  setPreviewQuote(null);
                }}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={14} /> Transmettre au Client
              </button>
              <button
                type="button"
                onClick={() => setPreviewQuote(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
