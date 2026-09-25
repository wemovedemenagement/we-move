/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { QuoteLead, CrmStats, QuoteStatus } from '../types/crm';

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
        content: 'Demande enregistrée via le formulaire en ligne.',
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
