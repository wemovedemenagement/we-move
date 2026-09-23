/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';
import officeImage from '../assets/images/office_move_logistics_1790153527033.jpg';

export const ServiceEntreprisesPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Hero split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-16 border-b border-[#E6E8EB]">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[13px] font-semibold text-[#0082CA] tracking-wider uppercase">
              Transfert Professionnel & Tertiaire
            </span>
            <h1 className="text-[34px] sm:text-[44px] font-semibold text-[#20252B] tracking-tight leading-[1.15] [text-wrap:balance]">
              Déménagement d’entreprises, de bureaux et de parcs informatiques.
            </h1>
            <p className="text-[17px] text-[#59616C] leading-relaxed max-w-xl">
              Une méthodologie rigoureuse pour limiter au maximum l'interruption de votre activité. Nos coordinateurs planifient chaque phase en étroite collaboration avec vos équipes de direction et responsables généraux.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/devis/?service=entreprises"
                className="px-6 h-12 rounded-md bg-[#0082CA] text-white text-[15px] font-medium hover:bg-[#006FA8] transition-colors flex items-center justify-center"
              >
                Demander un devis entreprise
              </Link>
              <Link
                href="/contact/"
                className="px-5 h-12 rounded-md border border-[#E6E8EB] bg-white text-[#20252B] text-[15px] font-medium hover:bg-[#FAFAF8] transition-colors flex items-center justify-center"
              >
                Organiser une visite de repérage
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-lg overflow-hidden border border-[#E6E8EB] aspect-[4/3] bg-[#FAFAF8] shadow-xs">
              <img 
                src={officeImage} 
                alt="Déménagement professionnel de bureaux d'entreprise par WE MOVE"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="mt-2 text-[12px] text-[#59616C]/80 text-right">
              Bacs sécurisés et manutention soignée des postes de travail
            </p>
          </div>
        </div>

        {/* Domaines d'intervention pro */}
        <div className="py-16 border-b border-[#E6E8EB]">
          <div className="max-w-2xl mb-12">
            <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#20252B] tracking-tight">
              Nos domaines d'intervention pour les professionnels
            </h2>
            <p className="mt-2 text-[15.5px] text-[#59616C]">
              Du cabinet libéral au siège social de plusieurs dizaines de collaborateurs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[13px] font-mono text-[#0082CA] font-semibold">01</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mt-2 mb-3">Mobilier de bureaux & espaces partagés</h3>
              <p className="text-[14px] text-[#59616C] leading-relaxed">
                Démontage méthodique des banques d'accueil, cloisons amovibles, bureaux bench, salles de réunion et fauteuils ergonomiques.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[13px] font-mono text-[#0082CA] font-semibold">02</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mt-2 mb-3">Parc informatique & serveurs</h3>
              <p className="text-[14px] text-[#59616C] leading-relaxed">
                Conditionnement sous housses antistatiques, chariots suspendus pour les baies serveurs et bacs individuels étiquetés par collaborateur.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[13px] font-mono text-[#0082CA] font-semibold">03</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mt-2 mb-3">Archives & dossiers confidentiels</h3>
              <p className="text-[14px] text-[#59616C] leading-relaxed">
                Mise en caisses scellées avec respect rigoureux du classement alphabétique ou numérique et réinstallation exacte sur rayonnage.
              </p>
            </div>
          </div>
        </div>

        {/* Garanties continuité de service */}
        <div className="py-16">
          <div className="max-w-2xl mb-8">
            <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#20252B] tracking-tight">
              Continuité d'activité garantie
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <h4 className="text-[16px] font-semibold text-[#20252B]">Interventions en horaires décalés</h4>
              <p className="mt-2 text-[14px] text-[#59616C] leading-relaxed">
                Possibilité d'intervenir le vendredi soir, le samedi ou le dimanche pour que vos collaborateurs reprennent leur poste le lundi matin dans leurs nouveaux locaux sans interruption.
              </p>
            </div>
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <h4 className="text-[16px] font-semibold text-[#20252B]">Coordinateur de projet dédié</h4>
              <p className="mt-2 text-[14px] text-[#59616C] leading-relaxed">
                Un interlocuteur unique WE MOVE coordonne les équipes, organise les accès quai de livraison, les demandes d'ascenseurs privatifs et le plan d'implantation.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
