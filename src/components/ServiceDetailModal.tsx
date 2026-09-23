/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SERVICES_DATA, ServiceItem } from '../data/content';

interface ServiceDetailModalProps {
  serviceSlug: string | null;
  onClose: () => void;
  onRequestQuote: () => void;
}

export const ServiceDetailModal: React.FC<ServiceDetailModalProps> = ({
  serviceSlug,
  onClose,
  onRequestQuote,
}) => {
  if (!serviceSlug) return null;

  const service: ServiceItem | undefined = SERVICES_DATA.find((s) => s.slug === serviceSlug);
  if (!service) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20252B]/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="service-modal-title"
    >
      <div 
        className="w-full max-w-xl bg-white rounded-lg border border-[#E6E8EB] shadow-xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with route indicator */}
        <div className="px-6 py-5 border-b border-[#E6E8EB] flex items-center justify-between bg-[#FAFAF8]">
          <div>
            <div className="text-[12px] font-mono text-[#0082CA] uppercase tracking-wider">
              Route cible : {service.route}
            </div>
            <h3 id="service-modal-title" className="text-[20px] font-semibold text-[#20252B] mt-1">
              {service.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#59616C] hover:text-[#20252B] hover:bg-[#E6E8EB]/50 transition-colors cursor-pointer"
            aria-label="Fermer la vue détaillée"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h4 className="text-[14px] font-semibold text-[#20252B] mb-2 uppercase tracking-wide text-xs">
              Présentation de la prestation
            </h4>
            <p className="text-[15px] text-[#59616C] leading-relaxed">
              {service.summary}
            </p>
          </div>

          <div className="border-t border-[#E6E8EB] pt-5">
            <h4 className="text-[14px] font-semibold text-[#20252B] mb-3 uppercase tracking-wide text-xs">
              Engagements & Modalités techniques
            </h4>
            <ul className="space-y-2.5 text-[14px] text-[#59616C]">
              {service.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <span className="text-[#0082CA] mt-1 text-xs shrink-0">■</span>
                  <span>{feat}</span>
                </li>
              ))}
              <li className="flex items-start gap-2.5">
                <span className="text-[#0082CA] mt-1 text-xs shrink-0">■</span>
                <span>Visite technique sur site ou visioconférence préalable selon accès</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="text-[#0082CA] mt-1 text-xs shrink-0">■</span>
                <span>Lettre de voiture réglementaire et bordereau de livraison émargé</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-[#FAFAF8] rounded-md border border-[#E6E8EB] text-[13px] text-[#59616C] space-y-1">
            <div className="font-medium text-[#20252B]">
              Information contractuelle
            </div>
            <div>
              Chaque intervention fait l'objet d'une déclaration de valeur et d'un contrat de transport conforme aux réglementations de la Fédération Française des Déménageurs.
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-[#E6E8EB] bg-[#FAFAF8] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] text-[#59616C] hover:text-[#20252B] cursor-pointer"
          >
            Retour à l'accueil
          </button>
          
          <button
            type="button"
            onClick={() => {
              onClose();
              onRequestQuote();
            }}
            className="px-5 h-10 rounded-md bg-[#0082CA] text-white text-[14px] font-medium hover:bg-[#006FA8] transition-colors cursor-pointer"
          >
            Demander un devis pour ce service
          </button>
        </div>

      </div>
    </div>
  );
};
