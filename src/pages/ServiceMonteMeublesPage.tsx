/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';
import liftImage from '../assets/images/furniture_lift_exterior_1790153551793.jpg';

export const ServiceMonteMeublesPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Hero split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-16 border-b border-[#E6E8EB]">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[13px] font-semibold text-[#0082CA] tracking-wider uppercase">
              Élévation & Accès Difficiles
            </span>
            <h1 className="text-[34px] sm:text-[44px] font-semibold text-[#20252B] tracking-tight leading-[1.15] [text-wrap:balance]">
              Location de monte-meubles avec technicien qualifié.
            </h1>
            <p className="text-[17px] text-[#59616C] leading-relaxed max-w-xl">
              Cage d'escalier trop étroite, meuble monobloc ne passant pas dans l'ascenseur, ou étage élevé sans ascenseur : notre échelle élévatrice permet de monter et descendre vos biens par la fenêtre en toute sécurité.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/devis/?service=monte-meubles"
                className="px-6 h-12 rounded-md bg-[#0082CA] text-white text-[15px] font-medium hover:bg-[#006FA8] transition-colors flex items-center justify-center"
              >
                Réserver un monte-meubles
              </Link>
              <Link
                href="/contact/"
                className="px-5 h-12 rounded-md border border-[#E6E8EB] bg-white text-[#20252B] text-[15px] font-medium hover:bg-[#FAFAF8] transition-colors flex items-center justify-center"
              >
                Vérifier la faisabilité d'accès
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-lg overflow-hidden border border-[#E6E8EB] aspect-[4/3] bg-[#FAFAF8] shadow-xs">
              <img 
                src={liftImage} 
                alt="Monte-meubles extérieur déployé le long d'une façade d'immeuble"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="mt-2 text-[12px] text-[#59616C]/80 text-right">
              Mise en place avec balisage de sécurité sur voie publique ou cour intérieure
            </p>
          </div>
        </div>

        {/* Pourquoi louer un monte-meubles ? */}
        <div className="py-16 border-b border-[#E6E8EB]">
          <div className="max-w-2xl mb-12">
            <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#20252B] tracking-tight">
              Dans quels cas recourir au monte-meubles ?
            </h2>
            <p className="mt-2 text-[15.5px] text-[#59616C]">
              Une solution technique qui protège à la fois votre mobilier et les parties communes de l'immeuble.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[13px] font-mono text-[#0082CA] font-semibold">01</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mt-2 mb-3">Objets volumineux & indivisibles</h3>
              <p className="text-[14px] text-[#59616C] leading-relaxed">
                Canapés d'angle, pianos droits, réfrigérateurs américains, tables en marbre ou vitrines anciennes impossibles à démonter.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[13px] font-mono text-[#0082CA] font-semibold">02</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mt-2 mb-3">Étages élevés & cages étroites</h3>
              <p className="text-[14px] text-[#59616C] leading-relaxed">
                Immeubles anciens sans ascenseur, escaliers hélicoïdaux en colimaçon ou paliers étroits risquant d'endommager les murs.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[13px] font-mono text-[#0082CA] font-semibold">03</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mt-2 mb-3">Gain de temps considérable</h3>
              <p className="text-[14px] text-[#59616C] leading-relaxed">
                Le transfert direct du camion à votre fenêtre divise le temps de manutention par trois et évite l'encombrement du hall d'entrée.
              </p>
            </div>
          </div>
        </div>

        {/* Forfaits & caractéristiques techniques */}
        <div className="py-16">
          <div className="max-w-2xl mb-8">
            <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#20252B] tracking-tight">
              Modalités et forfaits disponibles
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <div className="text-[17px] font-semibold text-[#20252B]">Passage éclair (1 à 3 objets)</div>
              <div className="text-[13px] text-[#0082CA] font-medium mt-1">Intervention ciblée (durée ~1h)</div>
              <p className="mt-2 text-[13.5px] text-[#59616C] leading-relaxed">
                Pour faire monter un canapé venant d'être livré ou descendre une pièce lourde spécifique. Technicien inclus.
              </p>
            </div>
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <div className="text-[17px] font-semibold text-[#20252B]">Demi-journée (4 heures)</div>
              <div className="text-[13px] text-[#0082CA] font-medium mt-1">Idéal appartement 2 à 3 pièces</div>
              <p className="mt-2 text-[13.5px] text-[#59616C] leading-relaxed">
                Mise à disposition pour charger ou décharger la totalité de vos meubles et cartons avec opérateur permanent.
              </p>
            </div>
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <div className="text-[17px] font-semibold text-[#20252B]">Journée complète (8 heures)</div>
              <div className="text-[13px] text-[#0082CA] font-medium mt-1">Grand volume / Déménagement total</div>
              <p className="mt-2 text-[13.5px] text-[#59616C] leading-relaxed">
                Accompagnement continu sur la journée pour les opérations complètes de chargement et déchargement.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
