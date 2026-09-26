/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuoteLead, CrmStats, QuoteStatus, QuoteDocument, InvoiceDocument, CustomerProfile, TruckResource } from '../types/crm';

const LOCAL_STORAGE_KEY = 'wemove_crm_quotes_v1';

// Initial local fallback data if API is unavailable
const DEFAULT_LOCAL_QUOTES: QuoteLead[] = [
  {
    id: 'WM-2026-1001',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    status: 'nouveau',
    projectType: 'particulier',
    fullName: 'Alexandre Mercier',
    email: 'a.mercier@example.com',
    phone: '06 12 34 56 78',
    departureAddress: '12 Rue de la Paix, 75002 Paris',
    departureFloor: '3',
    departureElevator: true,
    arrivalAddress: '45 Avenue Jean Jaurès, 92100 Boulogne-Billancourt',
    arrivalFloor: '1',
    arrivalElevator: false,
    volume: 32,
    unknownVolume: false,
    moveDate: '2026-10-15',
    flexibleDate: true,
    formula: 'standard',
    liftRequired: false,
    storageRequired: false,
    notes: 'Canapé convertible 3 places et piano numérique.',
    estimatedPrice: 1760,
    assignedAgent: 'Équipe We Move',
    internalNotes: [
      {
        id: 'note-1',
        author: 'Système',
        content: 'Demande enregistrée via le formulaire en ligne du site web.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      }
    ],
    source: 'modal_devis'
  },
  {
    id: 'WM-2026-1002',
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    status: 'prise_contact',
    projectType: 'entreprise',
    fullName: 'Sophie Durand (TechCorp SAS)',
    email: 'sdurand@techcorp.fr',
    phone: '01 45 67 89 00',
    departureAddress: '88 Boulevard Haussmann, 75008 Paris',
    departureFloor: '4',
    departureElevator: true,
    arrivalAddress: '15 Rue de Vaugirard, 75006 Paris',
    arrivalFloor: '2',
    arrivalElevator: true,
    volume: 85,
    unknownVolume: false,
    moveDate: '2026-11-02',
    flexibleDate: false,
    formula: 'confort',
    liftRequired: true,
    storageRequired: true,
    notes: 'Transfert de 25 postes de travail et baie informatique.',
    estimatedPrice: 6925,
    assignedAgent: 'Jean Dupont',
    internalNotes: [
      {
        id: 'note-2',
        author: 'Jean Dupont',
        content: 'Prise de contact téléphonique effectuée. Visite technique programmée jeudi 10h.',
        createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
      }
    ],
    source: 'page_devis'
  },
  {
    id: 'WM-2026-1003',
    createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
    status: 'devis_envoye',
    projectType: 'particulier',
    fullName: 'Édouard de Montmirail',
    email: 'e.montmirail@chateau.fr',
    phone: '06 99 88 77 66',
    departureAddress: '5 Place Vendôme, 75001 Paris',
    departureFloor: '2',
    departureElevator: true,
    arrivalAddress: '18 Avenue Montaigne, 75008 Paris',
    arrivalFloor: '5',
    arrivalElevator: true,
    volume: 58,
    unknownVolume: false,
    moveDate: '2026-10-22',
    flexibleDate: false,
    formula: 'confort',
    liftRequired: true,
    storageRequired: false,
    notes: 'Objets d art et mobilier d époque. Protection capitonnée sur mesure.',
    estimatedPrice: 4850,
    assignedAgent: 'Marc Vasseur',
    internalNotes: [
      {
        id: 'note-3',
        author: 'Marc Vasseur',
        content: 'Appel direct du client suite recommandation de Barnes Immobilier.',
        createdAt: new Date(Date.now() - 1000 * 60 * 400).toISOString(),
      }
    ],
    source: 'telephone'
  },
  {
    id: 'WM-2026-1004',
    createdAt: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
    status: 'nouveau',
    projectType: 'particulier',
    fullName: 'Camille & Antoine Moreau',
    email: 'camille.moreau@gmail.com',
    phone: '06 33 22 11 00',
    departureAddress: '14 Rue de la République, 93100 Montreuil',
    departureFloor: '1',
    departureElevator: false,
    arrivalAddress: '8 Rue des Rosiers, 93400 Saint-Ouen',
    arrivalFloor: '3',
    arrivalElevator: false,
    volume: 22,
    unknownVolume: false,
    moveDate: '2026-11-10',
    flexibleDate: true,
    formula: 'economique',
    liftRequired: false,
    storageRequired: false,
    notes: 'Bouche-à-oreille via des voisins satisfaits.',
    estimatedPrice: 1150,
    assignedAgent: 'Équipe We Move',
    internalNotes: [
      {
        id: 'note-4',
        author: 'Marc Vasseur',
        content: 'Client venu par le bouche-à-oreille.',
        createdAt: new Date(Date.now() - 1000 * 60 * 900).toISOString(),
      }
    ],
    source: 'recommandation'
  },
  {
    id: 'WM-2026-1005',
    createdAt: new Date(Date.now() - 1000 * 60 * 1800).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 1500).toISOString(),
    status: 'confirme',
    projectType: 'entreprise',
    fullName: 'Bernard & Associés',
    email: 'contact@bernard-avocats.fr',
    phone: '01 42 68 00 11',
    departureAddress: '120 Rue de Courcelles, 75017 Paris',
    departureFloor: '3',
    departureElevator: true,
    arrivalAddress: '42 Rue de la Boétie, 75008 Paris',
    arrivalFloor: '4',
    arrivalElevator: true,
    volume: 45,
    unknownVolume: false,
    moveDate: '2026-10-30',
    flexibleDate: false,
    formula: 'standard',
    liftRequired: false,
    storageRequired: true,
    notes: 'Campagne Google Ads (Mots-clés: Déménagement entreprise Paris).',
    estimatedPrice: 3400,
    assignedAgent: 'Jean Dupont',
    internalNotes: [
      {
        id: 'note-5',
        author: 'Jean Dupont',
        content: 'Acquisition via Google Ads. Acompte 30% réglé.',
        createdAt: new Date(Date.now() - 1000 * 60 * 1500).toISOString(),
      }
    ],
    source: 'ads'
  },
  {
    id: 'WM-2026-1006',
    createdAt: new Date(Date.now() - 1000 * 60 * 2400).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2100).toISOString(),
    status: 'devis_envoye',
    projectType: 'entreprise',
    fullName: 'Immobilière Paris Capital (Partenaire)',
    email: 'contact@paris-capital.fr',
    phone: '01 53 00 22 44',
    departureAddress: '55 Avenue Marceau, 75016 Paris',
    departureFloor: '5',
    departureElevator: true,
    arrivalAddress: '10 Rue de la Paix, 75002 Paris',
    arrivalFloor: '3',
    arrivalElevator: true,
    volume: 60,
    unknownVolume: false,
    moveDate: '2026-11-15',
    flexibleDate: true,
    formula: 'confort',
    liftRequired: true,
    storageRequired: false,
    notes: 'Transmis par le réseau d agences immobilières partenaires.',
    estimatedPrice: 5200,
    assignedAgent: 'Marc Vasseur',
    internalNotes: [
      {
        id: 'note-6',
        author: 'Marc Vasseur',
        content: 'Lead qualifié partenaire immo.',
        createdAt: new Date(Date.now() - 1000 * 60 * 2100).toISOString(),
      }
    ],
    source: 'partenaire'
  },
  {
    id: 'WM-2026-1007',
    createdAt: new Date(Date.now() - 1000 * 60 * 3000).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 2800).toISOString(),
    status: 'nouveau',
    projectType: 'particulier',
    fullName: 'Jean-Marc Moreau',
    email: 'jm.moreau@outlook.fr',
    phone: '06 77 88 99 00',
    departureAddress: '34 Rue de Rivoli, 75004 Paris',
    departureFloor: '2',
    departureElevator: false,
    arrivalAddress: '12 Avenue de France, 75013 Paris',
    arrivalFloor: '4',
    arrivalElevator: true,
    volume: 28,
    unknownVolume: false,
    moveDate: '2026-11-20',
    flexibleDate: true,
    formula: 'standard',
    liftRequired: false,
    storageRequired: false,
    notes: 'Demande enregistrée directement par le commercial en agence.',
    estimatedPrice: 1580,
    assignedAgent: 'Sophie Durand',
    internalNotes: [
      {
        id: 'note-7',
        author: 'Sophie Durand',
        content: 'Saisie manuelle effectuée lors du passage du client en agence.',
        createdAt: new Date(Date.now() - 1000 * 60 * 2800).toISOString(),
      }
    ],
    source: 'crm_creation_manuelle'
  }
];

function getLocalStorageQuotes(): QuoteLead[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(DEFAULT_LOCAL_QUOTES));
      return DEFAULT_LOCAL_QUOTES;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_LOCAL_QUOTES;
  }
}

function saveLocalStorageQuotes(quotes: QuoteLead[]): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(quotes));
  } catch (err) {
    console.warn('Could not save to localStorage:', err);
  }
}

/**
 * Submit a quote request to the API & sync with database
 */
export async function submitQuoteLead(payload: Partial<QuoteLead>): Promise<QuoteLead> {
  try {
    const response = await fetch('/api/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.quote) {
        // Sync local cache
        const local = getLocalStorageQuotes();
        saveLocalStorageQuotes([data.quote, ...local.filter(q => q.id !== data.quote.id)]);
        return data.quote;
      }
    }
  } catch (err) {
    console.warn('API submission failed, falling back to client storage:', err);
  }

  // Local Fallback creation
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newId = `WM-2026-${randomNum}`;
  const now = new Date().toISOString();
  const volume = Number(payload.volume) || 20;

  let rate = 50;
  if (payload.formula === 'economique') rate = 42;
  if (payload.formula === 'standard') rate = 55;
  if (payload.formula === 'confort') rate = 75;

  const estimatedPrice = payload.estimatedPrice || Math.max(450, volume * rate + (payload.liftRequired ? 350 : 0));

  const newQuote: QuoteLead = {
    id: newId,
    createdAt: now,
    updatedAt: now,
    status: 'nouveau',
    projectType: payload.projectType || 'particulier',
    fullName: payload.fullName || 'Client Anonyme',
    email: payload.email || '',
    phone: payload.phone || '',
    departureAddress: payload.departureAddress || '',
    departureFloor: String(payload.departureFloor || '0'),
    departureElevator: !!payload.departureElevator,
    arrivalAddress: payload.arrivalAddress || '',
    arrivalFloor: String(payload.arrivalFloor || '0'),
    arrivalElevator: !!payload.arrivalElevator,
    volume,
    unknownVolume: !!payload.unknownVolume,
    moveDate: payload.moveDate || '',
    flexibleDate: payload.flexibleDate !== false,
    formula: payload.formula || 'standard',
    liftRequired: !!payload.liftRequired,
    storageRequired: !!payload.storageRequired,
    notes: payload.notes || '',
    estimatedPrice,
    assignedAgent: 'Non assigné',
    internalNotes: [
      {
        id: `note-${Date.now()}`,
        author: 'Système',
        content: `Devis enregistré via ${payload.source || 'site web'}.`,
        createdAt: now
      }
    ],
    source: payload.source || 'formulaire_client'
  };

  const local = getLocalStorageQuotes();
  saveLocalStorageQuotes([newQuote, ...local]);
  return newQuote;
}

/**
 * Fetch all quote leads with optional status or search filtering
 */
export async function fetchQuoteLeads(status?: string, search?: string): Promise<QuoteLead[]> {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search && search.trim()) params.append('search', search.trim());

    const response = await fetch(`/api/quotes?${params.toString()}`);
    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.quotes)) {
        saveLocalStorageQuotes(data.quotes);
        return data.quotes;
      }
    }
  } catch (err) {
    console.warn('API fetch failed, reading local cache:', err);
  }

  // Local fallback filtering
  let local = getLocalStorageQuotes();
  if (status && status !== 'all') {
    local = local.filter(q => q.status === status);
  }
  if (search && search.trim()) {
    const s = search.toLowerCase();
    local = local.filter(q =>
      q.fullName.toLowerCase().includes(s) ||
      q.email.toLowerCase().includes(s) ||
      q.phone.includes(s) ||
      q.id.toLowerCase().includes(s) ||
      q.departureAddress.toLowerCase().includes(s) ||
      q.arrivalAddress.toLowerCase().includes(s)
    );
  }
  return local;
}

/**
 * Update a quote lead status or add internal notes
 */
export async function updateQuoteLead(
  id: string,
  updates: Partial<QuoteLead> & { newNote?: string; author?: string }
): Promise<QuoteLead | null> {
  try {
    const response = await fetch(`/api/quotes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && data.quote) {
        const local = getLocalStorageQuotes();
        const index = local.findIndex(q => q.id === id);
        if (index !== -1) {
          local[index] = data.quote;
          saveLocalStorageQuotes(local);
        }
        return data.quote;
      }
    }
  } catch (err) {
    console.warn('API update failed, updating local storage:', err);
  }

  // Local fallback update
  const local = getLocalStorageQuotes();
  const index = local.findIndex(q => q.id === id);
  if (index === -1) return null;

  const current = local[index];
  const now = new Date().toISOString();

  const notes = [...(current.internalNotes || [])];
  if (updates.newNote && updates.newNote.trim()) {
    notes.unshift({
      id: `note-${Date.now()}`,
      author: updates.author || 'Agent We Move',
      content: updates.newNote.trim(),
      createdAt: now
    });
  }

  const updated: QuoteLead = {
    ...current,
    ...updates,
    internalNotes: notes,
    updatedAt: now
  };

  local[index] = updated;
  saveLocalStorageQuotes(local);
  return updated;
}

/**
 * Delete a quote lead
 */
export async function deleteQuoteLead(id: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/quotes/${id}`, { method: 'DELETE' });
    if (response.ok) {
      const data = await response.json();
      if (data.success) {
        const local = getLocalStorageQuotes().filter(q => q.id !== id);
        saveLocalStorageQuotes(local);
        return true;
      }
    }
  } catch (err) {
    console.warn('API delete failed, updating local storage:', err);
  }

  const local = getLocalStorageQuotes().filter(q => q.id !== id);
  saveLocalStorageQuotes(local);
  return true;
}

/**
 * Get CRM Statistics
 */
export async function fetchCrmStats(): Promise<CrmStats> {
  try {
    const response = await fetch('/api/crm/stats');
    if (response.ok) {
      const data = await response.json();
      if (data.success && data.stats) return data.stats;
    }
  } catch (err) {
    console.warn('API stats failed, calculating from local cache:', err);
  }

  const quotes = getLocalStorageQuotes();
  const totalLeads = quotes.length;
  const newLeadsCount = quotes.filter(q => q.status === 'nouveau').length;
  const contactedCount = quotes.filter(q => q.status === 'prise_contact').length;
  const quotesSentCount = quotes.filter(q => q.status === 'devis_envoye').length;
  const confirmedCount = quotes.filter(q => q.status === 'confirme').length;

  const totalVolumeM3 = quotes.reduce((acc, q) => acc + (Number(q.volume) || 0), 0);
  const totalEstimatedRevenue = quotes.reduce((acc, q) => acc + (Number(q.estimatedPrice) || 0), 0);
  const conversionRate = totalLeads > 0 ? Math.round((confirmedCount / totalLeads) * 100) : 0;

  return {
    totalLeads,
    newLeadsCount,
    contactedCount,
    quotesSentCount,
    confirmedCount,
    totalVolumeM3,
    totalEstimatedRevenue,
    conversionRate
  };
}

// ================= DEMO USERS & AUTH =================
export const DEMO_CRM_USERS = [
  {
    id: 'user-1',
    name: 'Jean Dupont',
    email: 'jean.dupont@wemove.fr',
    role: 'admin' as const,
    title: 'Directeur Général & Commercial',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-2',
    name: 'Sophie Laurent',
    email: 'sophie.laurent@wemove.fr',
    role: 'logistique' as const,
    title: 'Responsable Flotte & Operations',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
  },
  {
    id: 'user-3',
    name: 'Marc Vasseur',
    email: 'marc.vasseur@wemove.fr',
    role: 'commercial' as const,
    title: 'Conseiller Commercial Senior',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
  }
];

// ================= LOGISTICS TRUCKS DATA =================
export const DEFAULT_TRUCKS = [
  { id: 'T-01', name: 'Camion Grand Volume 30m³', type: '30 m³ Capitonné + Hayon', plateNumber: 'GK-482-WM', driver: 'Karim B.', teamSize: 4, status: 'en_mission' as const },
  { id: 'T-02', name: 'Camion Standard 20m³', type: '20 m³ Capitonnage renforcé', plateNumber: 'FZ-913-WM', driver: 'Nicolas P.', teamSize: 3, status: 'disponible' as const },
  { id: 'T-03', name: 'Fourgon Urbain 12m³', type: '12 m³ Agilité Centre-Ville', plateNumber: 'HH-204-WM', driver: 'Thomas L.', teamSize: 2, status: 'en_mission' as const },
  { id: 'T-04', name: 'Monte-Meubles Télescopique', type: 'Échelle Élevatrice 10e ét.', plateNumber: 'EX-771-WM', driver: 'Éric D. (Technicien)', teamSize: 1, status: 'disponible' as const }
];

// ================= DEVIS / QUOTES DOCUMENTS MOCK DATA =================
export const DEFAULT_QUOTES: QuoteDocument[] = [
  {
    id: 'DEV-2026-089',
    leadId: 'WM-2026-1001',
    clientName: 'Alexandre Mercier',
    clientEmail: 'a.mercier@example.com',
    clientPhone: '06 12 34 56 78',
    moveDate: '2026-10-10',
    validUntil: '2026-10-05',
    createdAt: '2026-09-20',
    departureCity: 'Paris (75002)',
    arrivalCity: 'Boulogne (92100)',
    departureAddress: '15 Rue Réaumur, 75002 Paris',
    arrivalAddress: '42 Avenue Jean Jaurès, 92100 Boulogne-Billancourt',
    volume: 32,
    volumeM3: 32,
    formula: 'standard',
    amountHT: 1466.67,
    tvaRate: 20,
    tvaAmount: 293.33,
    amountTTC: 1760.00,
    depositPercentage: 30,
    depositAmount: 528.00,
    status: 'accepte',
    items: [
      { description: 'Forfait Transport Déménagement Particulier 32 m³ (Paris → Boulogne)', quantity: 1, unitPriceHT: 1200, totalHT: 1200, unitPrice: 1200, total: 1200 },
      { description: 'Fourniture cartons renforcés + Housses literie', quantity: 1, unitPriceHT: 150, totalHT: 150, unitPrice: 150, total: 150 },
      { description: 'Option démontage/remontage armoire parentale', quantity: 1, unitPriceHT: 116.67, totalHT: 116.67, unitPrice: 116.67, total: 116.67 }
    ]
  },
  {
    id: 'DEV-2026-090',
    leadId: 'WM-2026-1002',
    clientName: 'Sophie Durand (TechCorp SAS)',
    clientEmail: 'sdurand@techcorp.fr',
    clientPhone: '01 45 67 89 00',
    moveDate: '2026-10-18',
    validUntil: '2026-10-15',
    createdAt: '2026-09-22',
    departureCity: 'Paris (75008)',
    arrivalCity: 'Paris (75006)',
    departureAddress: '88 Boulevard Haussmann, 75008 Paris',
    arrivalAddress: '12 Rue de Sèvres, 75006 Paris',
    volume: 85,
    volumeM3: 85,
    formula: 'prestige',
    amountHT: 5770.83,
    tvaRate: 20,
    tvaAmount: 1154.17,
    amountTTC: 6925.00,
    depositPercentage: 30,
    depositAmount: 2077.50,
    status: 'envoye',
    items: [
      { description: 'Transfert de Bureaux & Open Space 85 m³ (Horaires décalés)', quantity: 1, unitPriceHT: 4500, totalHT: 4500, unitPrice: 4500, total: 4500 },
      { description: 'Conditionnement spécialisé matériel informatique & baie', quantity: 1, unitPriceHT: 850, totalHT: 850, unitPrice: 850, total: 850 },
      { description: 'Mise à disposition Monte-meubles avec opérateur (4 heures)', quantity: 1, unitPriceHT: 420.83, totalHT: 420.83, unitPrice: 420.83, total: 420.83 }
    ]
  },
  {
    id: 'DEV-2026-091',
    leadId: 'WM-2026-1003',
    clientName: 'Édouard de Montmirail',
    clientEmail: 'e.montmirail@chateau.fr',
    clientPhone: '06 99 88 77 66',
    moveDate: '2026-10-25',
    validUntil: '2026-10-20',
    createdAt: '2026-09-24',
    departureCity: 'Paris (75001)',
    arrivalCity: 'Paris (75008)',
    departureAddress: '3 Place Vendôme, 75001 Paris',
    arrivalAddress: '14 Avenue Montaigne, 75008 Paris',
    volume: 58,
    volumeM3: 58,
    formula: 'prestige',
    amountHT: 4041.67,
    tvaRate: 20,
    tvaAmount: 808.33,
    amountTTC: 4850.00,
    depositPercentage: 30,
    depositAmount: 1455.00,
    status: 'en_attente',
    items: [
      { description: 'Transport Objets d\'art et Mobilier d\'époque (Emb. Capitonnée)', quantity: 1, unitPriceHT: 3500, totalHT: 3500, unitPrice: 3500, total: 3500 },
      { description: 'Passage Monte-meubles télescopique Vendôme', quantity: 1, unitPriceHT: 541.67, totalHT: 541.67, unitPrice: 541.67, total: 541.67 }
    ]
  },
  {
    id: 'DEV-2026-092',
    leadId: 'WM-2026-1004',
    clientName: 'Camille & Antoine Moreau',
    clientEmail: 'camille.moreau@gmail.com',
    clientPhone: '06 33 22 11 00',
    moveDate: '2026-11-02',
    validUntil: '2026-10-25',
    createdAt: '2026-09-25',
    departureCity: 'Montreuil (93100)',
    arrivalCity: 'Saint-Ouen (93400)',
    departureAddress: '24 Rue de Paris, 93100 Montreuil',
    arrivalAddress: '15 Rue Gabriel Péri, 93400 Saint-Ouen',
    volume: 22,
    volumeM3: 22,
    formula: 'economique',
    amountHT: 958.33,
    tvaRate: 20,
    tvaAmount: 191.67,
    amountTTC: 1150.00,
    depositPercentage: 30,
    depositAmount: 345.00,
    status: 'brouillon',
    items: [
      { description: 'Déménagement Formule Économique 22 m³ (Montreuil → Saint-Ouen)', quantity: 1, unitPriceHT: 958.33, totalHT: 958.33, unitPrice: 958.33, total: 958.33 }
    ]
  },
  {
    id: 'DEV-2026-093',
    leadId: 'WM-2026-1005',
    clientName: 'Bernard & Associés',
    clientEmail: 'contact@bernard-avocats.fr',
    clientPhone: '01 42 68 00 11',
    moveDate: '2026-10-12',
    validUntil: '2026-10-01',
    createdAt: '2026-09-18',
    departureCity: 'Paris (75017)',
    arrivalCity: 'Paris (75008)',
    departureAddress: '55 Rue de Courcelles, 75017 Paris',
    arrivalAddress: '10 Rue de la Paix, 75008 Paris',
    volume: 45,
    volumeM3: 45,
    formula: 'standard',
    amountHT: 2833.33,
    tvaRate: 20,
    tvaAmount: 566.67,
    amountTTC: 3400.00,
    depositPercentage: 30,
    depositAmount: 1020.00,
    status: 'refuse',
    refusalReason: 'Prix jugé trop élevé',
    items: [
      { description: 'Transfert de Cabinet d\'Avocats & Archives 45 m³', quantity: 1, unitPriceHT: 2833.33, totalHT: 2833.33, unitPrice: 2833.33, total: 2833.33 }
    ]
  }
];

// ================= INVOICE DOCUMENTS MOCK DATA =================
export const DEFAULT_INVOICES = [
  {
    id: 'FAC-2026-001',
    quoteId: 'DEV-2026-089',
    leadId: 'WM-2026-1001',
    type: 'acompte' as const,
    clientName: 'Alexandre Mercier',
    clientEmail: 'a.mercier@example.com',
    clientPhone: '06 12 34 56 78',
    issueDate: '2026-09-21',
    dueDate: '2026-10-01',
    amountHT: 440.00,
    tvaAmount: 88.00,
    amountTTC: 528.00,
    status: 'paye' as const,
    items: [
      { description: 'Acompte 30% sur devis DEV-2026-089 (Déménagement 32 m³ Paris → Boulogne)', quantity: 1, unitPrice: 440, total: 440 }
    ]
  },
  {
    id: 'FAC-2026-002',
    quoteId: 'DEV-2026-090',
    leadId: 'WM-2026-1002',
    type: 'acompte' as const,
    clientName: 'Sophie Durand (TechCorp SAS)',
    clientEmail: 'sdurand@techcorp.fr',
    clientPhone: '01 45 67 89 00',
    issueDate: '2026-09-23',
    dueDate: '2026-10-07',
    amountHT: 1731.25,
    tvaAmount: 346.25,
    amountTTC: 2077.50,
    status: 'envoye' as const,
    items: [
      { description: 'Acompte 30% sur devis DEV-2026-090 (Transfert Open Space TechCorp)', quantity: 1, unitPrice: 1731.25, total: 1731.25 }
    ]
  },
  {
    id: 'FAC-2026-003',
    quoteId: 'DEV-2026-085',
    leadId: 'WM-2026-0980',
    type: 'solde' as const,
    clientName: 'Julien Lambert',
    clientEmail: 'j.lambert@gmail.com',
    clientPhone: '06 88 11 22 33',
    issueDate: '2026-09-15',
    dueDate: '2026-09-25',
    amountHT: 2041.67,
    tvaAmount: 408.33,
    amountTTC: 2450.00,
    status: 'paye' as const,
    items: [
      { description: 'Solde Facture Déménagement & Garde-meubles (Mission accomplie)', quantity: 1, unitPrice: 2041.67, total: 2041.67 }
    ]
  }
];

// ================= CUSTOMERS DIRECTORY =================
export const DEFAULT_CUSTOMERS = [
  { id: 'CUST-101', fullName: 'Alexandre Mercier', email: 'a.mercier@example.com', phone: '06 12 34 56 78', type: 'particulier' as const, totalMoves: 1, totalSpent: 1760, lastMoveDate: '2026-09-20', tags: ['Appartement T3', 'Paris 2e'] },
  { id: 'CUST-102', fullName: 'Sophie Durand (TechCorp SAS)', email: 'sdurand@techcorp.fr', phone: '01 45 67 89 00', type: 'entreprise' as const, totalMoves: 2, totalSpent: 14200, lastMoveDate: '2026-09-22', tags: ['Bureaux 25p', 'Client VIP Pro', 'Haussmann'] },
  { id: 'CUST-103', fullName: 'Julien Lambert', email: 'j.lambert@gmail.com', phone: '06 88 11 22 33', type: 'particulier' as const, totalMoves: 1, totalSpent: 2450, lastMoveDate: '2026-08-14', tags: ['Garde-Meubles', 'Longue durée'] }
];

