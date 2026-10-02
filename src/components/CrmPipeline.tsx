import type { QuoteLead } from '../types/crm';

export function pipelineStage(lead: QuoteLead) {
  if (lead.status === 'refuse') return 'archives';
  if (lead.status === 'termine') return 'reglement';
  if (lead.status === 'confirme') return (lead.assignedTruckId || lead.assignedTruckName) && lead.scheduledTime ? 'planifie' : 'accepte';
  if (['visite_technique', 'devis_brouillon', 'devis_envoye'].includes(lead.status)) return 'proposition';
  return 'demande';
}

