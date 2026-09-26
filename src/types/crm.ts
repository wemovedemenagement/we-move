/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuoteStatus = 'nouveau' | 'prise_contact' | 'visite_technique' | 'devis_brouillon' | 'devis_envoye' | 'confirme' | 'refuse' | 'termine';

export type FormulaType = 'conseil' | 'economique' | 'standard' | 'confort';

export type ProjectType = 'particulier' | 'entreprise';

export type CrmRole = 'admin' | 'commercial' | 'logistique';

export interface CrmUser {
  id: string;
  name: string;
  email: string;
  role: CrmRole;
  avatar: string;
  title: string;
}

export interface InternalNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface QuoteLead {
  id: string; // e.g. WM-2026-4892
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
  status: QuoteStatus;
  projectType: ProjectType;
  
  // Client Contact
  fullName: string;
  email: string;
  phone: string;

  // Departure details
  departureAddress: string;
  departureFloor: string;
  departureElevator: boolean;

  // Arrival details
  arrivalAddress: string;
  arrivalFloor: string;
  arrivalElevator: boolean;

  // Move Specifications
  volume: number; // in m3
  unknownVolume?: boolean;
  moveDate: string;
  flexibleDate: boolean;
  formula: FormulaType;
  liftRequired: boolean;
  storageRequired: boolean;
  notes: string;

  // Technical Visit tracking
  visitDate?: string;
  visitType?: 'domicile' | 'visio' | 'telephonique';
  visitStatus?: 'programmee' | 'effectuee';
  visitNotes?: string;

  // Devis status tracking
  devisStatus?: 'brouillon' | 'envoye' | 'accepte' | 'refuse';
  devisNumber?: string;

  // Planning & Logistics assignment
  assignedTruckId?: string;
  assignedTruckName?: string;
  assignedDriver?: string;
  scheduledTime?: string;
  assignedEquipment?: string[];
  teamMembers?: string[];
  refusalReason?: string;

  // Commercial & CRM tracking
  estimatedPrice: number; // in Euros
  assignedAgent: string;
  internalNotes: InternalNote[];
  source: string; // e.g., 'page_devis', 'modal_devis', 'estimation_volume', 'telephone', 'recommandation', 'ads', 'partenaire', 'crm_creation_manuelle'
}

export interface CrmStats {
  totalLeads: number;
  newLeadsCount: number;
  contactedCount: number;
  quotesSentCount: number;
  confirmedCount: number;
  totalVolumeM3: number;
  totalEstimatedRevenue: number;
  conversionRate: number;
}

export interface TruckResource {
  id: string;
  name: string;
  type: string; // e.g. '30 m³ Capitonné', '20 m³ Hayon', 'Monte-meubles 10e'
  plateNumber: string;
  driver: string;
  teamSize: number;
  status: 'disponible' | 'en_mission' | 'maintenance';
}

export type QuoteDocStatus = 'en_attente' | 'envoye' | 'accepte' | 'refuse' | 'brouillon' | 'archive';

export interface QuoteDocumentItem {
  description: string;
  quantity: number;
  unitPriceHT: number;
  totalHT: number;
  unitPrice?: number;
  total?: number;
}

export interface QuoteDocument {
  id: string; // e.g. DEV-2026-089
  leadId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  moveDate: string;
  validUntil: string;
  createdAt?: string;
  validityDate?: string;
  formula: string;
  volume: number;
  volumeM3?: number;
  departureAddress: string;
  arrivalAddress: string;
  departureCity?: string;
  arrivalCity?: string;
  items: QuoteDocumentItem[];
  amountHT: number;
  tvaRate?: number;
  tvaAmount: number;
  amountTTC: number;
  depositPercentage: number;
  depositAmount: number;
  status: QuoteDocStatus;
  refusalReason?: string;
}

export type InvoiceStatus = 'brouillon' | 'envoye' | 'envoyee' | 'paye' | 'payee' | 'signe' | 'en_retard';
export type InvoiceType = 'devis' | 'acompte' | 'solde' | 'facture';

export interface InvoiceDocument {
  id: string; // e.g. FAC-2026-001
  quoteId?: string;
  leadId: string;
  type: InvoiceType;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  issueDate: string;
  dueDate: string;
  amountHT: number;
  tvaRate?: number;
  tvaAmount: number;
  amountTTC: number;
  depositAmount?: number;
  status: InvoiceStatus;
  items?: {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
}

export interface CustomerProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  type: ProjectType;
  totalMoves: number;
  totalSpent: number;
  lastMoveDate: string;
  tags: string[];
}

