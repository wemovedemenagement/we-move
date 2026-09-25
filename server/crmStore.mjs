import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'quotes.json');

// Ensure directory exists
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true });
}

// Calculate an estimated price based on volume, formula, and access options
export function calculateEstimatedPrice(volume, formula, liftRequired, storageRequired) {
  const baseVolume = Number(volume) || 20;
  
  // Rate per m3 according to formula
  let ratePerM3 = 45; // default conseil / eco base
  if (formula === 'economique') ratePerM3 = 42;
  else if (formula === 'standard') ratePerM3 = 55;
  else if (formula === 'confort') ratePerM3 = 75;

  let total = baseVolume * ratePerM3;

  // Additional options
  if (liftRequired) total += 350;
  if (storageRequired) total += 200;

  // Minimum job price
  return Math.round(Math.max(450, total));
}

// Sample demo quotes to populate DB if empty initially
const DEMO_QUOTES = [
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
  },
  {
    id: 'WM-2026-1003',
    createdAt: new Date(Date.now() - 1000 * 60 * 1440).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
    status: 'devis_envoye',
    projectType: 'particulier',
    fullName: 'Thomas Bernard',
    email: 'thomas.b@gmail.com',
    phone: '07 89 12 34 56',
    departureAddress: '4 Place de la Bastille, 75011 Paris',
    departureFloor: '5',
    departureElevator: false,
    arrivalAddress: '18 Rue de Lyon, 75012 Paris',
    arrivalFloor: '2',
    arrivalElevator: true,
    volume: 22,
    unknownVolume: false,
    moveDate: '2026-10-20',
    flexibleDate: true,
    formula: 'economique',
    liftRequired: true,
    storageRequired: false,
    notes: '5e étage sans ascenseur au départ, monte-meubles indispensable.',
    estimatedPrice: 1274,
    assignedAgent: 'Marc Lambert',
    internalNotes: [
      {
        id: 'note-3',
        author: 'Marc Lambert',
        content: 'Devis officiel #WM-2026-1003 transmis par email (1274 € TTC).',
        createdAt: new Date(Date.now() - 1000 * 60 * 720).toISOString(),
      }
    ],
    source: 'modal_devis'
  },
  {
    id: 'WM-2026-1004',
    createdAt: new Date(Date.now() - 1000 * 60 * 2880).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
    status: 'confirme',
    projectType: 'particulier',
    fullName: 'Camille & Antoine Morel',
    email: 'morel.famille@outlook.com',
    phone: '06 55 44 33 22',
    departureAddress: '10 Rue de la République, 93100 Montreuil',
    departureFloor: '0',
    departureElevator: true,
    arrivalAddress: '24 Allée des Roses, 94300 Vincennes',
    arrivalFloor: '1',
    arrivalElevator: true,
    volume: 45,
    unknownVolume: false,
    moveDate: '2026-10-08',
    flexibleDate: false,
    formula: 'standard',
    liftRequired: false,
    storageRequired: false,
    notes: 'Acompte versé. Déménagement confirmé pour le 8 octobre.',
    estimatedPrice: 2475,
    assignedAgent: 'Jean Dupont',
    internalNotes: [
      {
        id: 'note-4',
        author: 'Jean Dupont',
        content: 'Acompte de 30% reçu. Équipe de 3 déménageurs et camion 30m3 réservés.',
        createdAt: new Date(Date.now() - 1000 * 60 * 1200).toISOString(),
      }
    ],
    source: 'page_devis'
  }
];

// Read quotes from JSON file
export function getAllQuotes() {
  try {
    if (!existsSync(DB_FILE)) {
      writeFileSync(DB_FILE, JSON.stringify(DEMO_QUOTES, null, 2), 'utf-8');
      return DEMO_QUOTES;
    }
    const content = readFileSync(DB_FILE, 'utf-8');
    const data = JSON.parse(content);
    return Array.isArray(data) ? data : DEMO_QUOTES;
  } catch (error) {
    console.error('Error reading quotes DB:', error);
    return DEMO_QUOTES;
  }
}

// Save quotes to JSON file
export function saveAllQuotes(quotes) {
  try {
    writeFileSync(DB_FILE, JSON.stringify(quotes, null, 2), 'utf-8');
    return true;
  } catch (error) {
    console.error('Error saving quotes DB:', error);
    return false;
  }
}

// Create a new quote lead
export function createQuoteLead(payload) {
  const quotes = getAllQuotes();
  
  // Generate ID
  const randomNum = Math.floor(1000 + Math.random() * 9000);
  const newId = `WM-2026-${randomNum}`;

  const volumeNum = Number(payload.volume) || 20;
  const estimatedPrice = payload.estimatedPrice || calculateEstimatedPrice(
    volumeNum,
    payload.formula || 'standard',
    !!payload.liftRequired,
    !!payload.storageRequired
  );

  const now = new Date().toISOString();

  const newQuote = {
    id: newId,
    createdAt: now,
    updatedAt: now,
    status: 'nouveau',
    projectType: payload.projectType || 'particulier',
    fullName: payload.fullName || 'Client Sans Nom',
    email: payload.email || '',
    phone: payload.phone || '',
    departureAddress: payload.departureAddress || payload.departureCity || '',
    departureFloor: String(payload.departureFloor || '0'),
    departureElevator: !!payload.departureElevator,
    arrivalAddress: payload.arrivalAddress || payload.arrivalCity || '',
    arrivalFloor: String(payload.arrivalFloor || '0'),
    arrivalElevator: !!payload.arrivalElevator,
    volume: volumeNum,
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
        content: `Devis créé automatiquement via ${payload.source || 'le site web'}.`,
        createdAt: now
      }
    ],
    source: payload.source || 'formulaire_site'
  };

  quotes.unshift(newQuote);
  saveAllQuotes(quotes);
  return newQuote;
}

// Update a quote lead
export function updateQuoteLead(id, updates) {
  const quotes = getAllQuotes();
  const index = quotes.findIndex(q => q.id === id);
  if (index === -1) return null;

  const current = quotes[index];
  const now = new Date().toISOString();

  const updatedNotes = [...(current.internalNotes || [])];
  if (updates.newNote && updates.newNote.trim()) {
    updatedNotes.unshift({
      id: `note-${Date.now()}`,
      author: updates.author || 'Agent We Move',
      content: updates.newNote.trim(),
      createdAt: now
    });
  }

  const updatedQuote = {
    ...current,
    ...updates,
    internalNotes: updatedNotes,
    updatedAt: now
  };

  delete updatedQuote.newNote;
  delete updatedQuote.author;

  quotes[index] = updatedQuote;
  saveAllQuotes(quotes);
  return updatedQuote;
}

// Delete a quote lead
export function deleteQuoteLead(id) {
  const quotes = getAllQuotes();
  const filtered = quotes.filter(q => q.id !== id);
  if (filtered.length === quotes.length) return false;
  saveAllQuotes(filtered);
  return true;
}

// Get CRM statistics
export function getCrmStats() {
  const quotes = getAllQuotes();
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
