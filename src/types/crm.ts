/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type QuoteStatus = 'nouveau' | 'prise_contact' | 'devis_envoye' | 'confirme' | 'refuse' | 'termine';

export type FormulaType = 'conseil' | 'economique' | 'standard' | 'confort';

export type ProjectType = 'particulier' | 'entreprise';

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

  // Commercial & CRM tracking
  estimatedPrice: number; // in Euros
  assignedAgent: string;
  internalNotes: InternalNote[];
  source: string; // e.g., 'page_devis', 'modal_devis', 'estimation_volume'
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
