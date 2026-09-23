/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface RoutePreviewModalProps {
  currentRoute: string | null;
  onClose: () => void;
  onOpenQuote: () => void;
}

export const RoutePreviewModal: React.FC<RoutePreviewModalProps> = ({
  currentRoute,
  onClose,
  onOpenQuote,
}) => {
  if (!currentRoute) return null;

  const getRouteDetails = (route: string) => {
    switch (route) {
      case '/qui-sommes-nous/':
        return {
          title: 'Qui sommes-nous — WE MOVE',
          tag: 'Présentation de l’entreprise',
          content: (
            <div className="space-y-4 text-[14.5px] text-[#59616C] leading-relaxed">
              <p>
                Fondée sur une exigence de rigueur, de courtoisie et de transparence, WE MOVE s’est développée autour d’une conviction simple : un déménagement réussi repose avant tout sur l’écoute, le soin apporté aux biens confiés et le respect des engagements pris.
              </p>
              <p>
                Nos équipes de déménageurs qualifiés et chauffeurs expérimentés interviennent avec un matériel récent et entretenu : camions capitonnés, hayons élévateurs, monte-meubles, protections adaptées à tous types de mobilier.
              </p>
              <div className="p-4 bg-[#FAFAF8] rounded-md border border-[#E6E8EB] space-y-1 text-[13px]">
                <div className="font-semibold text-[#20252B]">Notre engagement de service</div>
                <div>« Déménager avec le sourire » : une approche humaine, sans promesses intenables, avec une tarification transparente et un suivi personnalisé.</div>
              </div>
            </div>
          )
        };
      case '/contact/':
        return {
          title: 'Contacter WE MOVE',
          tag: 'Service client & Logistique',
          content: (
            <div className="space-y-4 text-[14.5px] text-[#59616C] leading-relaxed">
              <p>
                Vous préparez un déménagement ou souhaitez un renseignement technique sur nos solutions de monte-meubles ou de garde-meubles ? Notre équipe vous répond avec précision.
              </p>
              <div className="space-y-2 border-t border-[#E6E8EB] pt-3 text-[14px]">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#20252B]">Courriel d'information :</span>
                  <a href="mailto:contact@wemove.fr" className="text-[#0082CA] hover:underline">contact@wemove.fr</a>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#20252B]">Horaires d'accueil :</span>
                  <span>Du lundi au samedi : 08h00 - 19h00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[#20252B]">Zone d’intervention :</span>
                  <span>Régionale, nationale et transferts longue distance</span>
                </div>
              </div>
            </div>
          )
        };
      case '/mentions-legales/':
        return {
          title: 'Mentions légales',
          tag: 'Informations juridiques & Éditeur',
          content: (
            <div className="space-y-3 text-[13.5px] text-[#59616C] leading-relaxed">
              <p>
                <strong className="text-[#20252B]">Éditeur du site :</strong> WE MOVE — Entreprise de déménagement et transport de marchandises.<br />
                <strong className="text-[#20252B]">Activité réglementée :</strong> Transport routier de marchandises, déménagement de particuliers et transfert professionnel sous licence de transport.<br />
                <strong className="text-[#20252B]">Conformité :</strong> Contrat de transport régi par le Code de commerce et les règles de la Fédération Française des Déménageurs.
              </p>
              <p className="text-xs text-[#59616C]/80">
                Note de maquette : Ce texte constitue une base éditoriale conforme. Les mentions légales finales (SIRET, RCS, capital social et hébergeur) seront renseignées avec les données administratives exactes lors de la mise en production Next.js.
              </p>
            </div>
          )
        };
      case '/politique-confidentialite/':
        return {
          title: 'Politique de confidentialité',
          tag: 'Protection des données personnelles (RGPD)',
          content: (
            <div className="space-y-3 text-[13.5px] text-[#59616C] leading-relaxed">
              <p>
                Les informations recueillies via les formulaires de demande de devis sont enregistrées uniquement pour permettre à WE MOVE d'établir une proposition commerciale et de coordonner les opérations logistiques.
              </p>
              <p>
                Elles ne sont en aucun cas vendues, cédées ou transmises à des tiers à des fins publicitaires. Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et d'effacement de vos données sur simple demande.
              </p>
            </div>
          )
        };
      default:
        return {
          title: `Page : ${route}`,
          tag: 'Navigation interne',
          content: (
            <p className="text-[14.5px] text-[#59616C]">
              Contenu de la route {route} intégré dans le plan de site WE MOVE.
            </p>
          )
        };
    }
  };

  const details = getRouteDetails(currentRoute);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20252B]/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div 
        className="w-full max-w-lg bg-white rounded-lg border border-[#E6E8EB] shadow-xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-[#E6E8EB] flex items-center justify-between bg-[#FAFAF8]">
          <div>
            <span className="text-[12px] font-mono text-[#0082CA] uppercase tracking-wider">
              {details.tag}
            </span>
            <h3 className="text-[19px] font-semibold text-[#20252B] mt-0.5">
              {details.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#59616C] hover:text-[#20252B] hover:bg-[#E6E8EB]/50 transition-colors cursor-pointer"
            aria-label="Fermer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {details.content}
        </div>

        <div className="px-6 py-4 border-t border-[#E6E8EB] bg-[#FAFAF8] flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="text-[14px] text-[#59616C] hover:text-[#20252B] cursor-pointer"
          >
            Fermer
          </button>
          
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenQuote();
            }}
            className="px-5 h-10 rounded-md bg-[#0082CA] text-white text-[14px] font-medium hover:bg-[#006FA8] transition-colors cursor-pointer"
          >
            Demander un devis
          </button>
        </div>
      </div>
    </div>
  );
};
