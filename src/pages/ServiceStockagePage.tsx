/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';
import storageImage from '../assets/images/storage_warehouse_facility_1790153540073.jpg';

export const ServiceStockagePage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Hero split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-16 border-b border-[#E6E8EB]">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[13px] font-semibold text-[#0082CA] tracking-wider uppercase">
              Stockage Sécurisé & Entreposage
            </span>
            <h1 className="text-[34px] sm:text-[44px] font-semibold text-[#20252B] tracking-tight leading-[1.15] [text-wrap:balance]">
              Garde-meubles sécurisé, propre et ventilé.
            </h1>
            <p className="text-[17px] text-[#59616C] leading-relaxed max-w-xl">
              Entre deux baux, lors de travaux de rénovation ou pour stocker des archives : vos biens sont placés dans des conteneurs individuels fermés sous scellés, abrités de l'humidité et sous vidéosurveillance permanente.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/devis/?service=stockage"
                className="px-6 h-12 rounded-md bg-[#0082CA] text-white text-[15px] font-medium hover:bg-[#006FA8] transition-colors flex items-center justify-center"
              >
                Demander un devis stockage
              </Link>
              <Link
                href="/volume/"
                className="px-5 h-12 rounded-md border border-[#E6E8EB] bg-white text-[#20252B] text-[15px] font-medium hover:bg-[#FAFAF8] transition-colors flex items-center justify-center"
              >
                Calculer le volume de box nécessaire
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-lg overflow-hidden border border-[#E6E8EB] aspect-[4/3] bg-[#FAFAF8] shadow-xs">
              <img 
                src={storageImage} 
                alt="Entrepôt de stockage et conteneurs garde-meubles sécurisés WE MOVE"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="mt-2 text-[12px] text-[#59616C]/80 text-right">
              Conteneurs individuels en bois ventilé et bâtiment sous alarme 24/7
            </p>
          </div>
        </div>

        {/* Caractéristiques de l'entrepôt */}
        <div className="py-16 border-b border-[#E6E8EB]">
          <div className="max-w-2xl mb-12">
            <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#20252B] tracking-tight">
              Une conservation optimale de vos meubles
            </h2>
            <p className="mt-2 text-[15.5px] text-[#59616C]">
              Contrairement à un garage ou une cave humide, notre garde-meubles répond aux normes professionnelles de préservation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[13px] font-mono text-[#0082CA] font-semibold">01</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mt-2 mb-3">Hygrométrie & Température régulées</h3>
              <p className="text-[14px] text-[#59616C] leading-relaxed">
                Conteneurs en bois aéré évitant toute condensation, protégeant vos meubles vernis, tissus, literie et instruments de musique.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[13px] font-mono text-[#0082CA] font-semibold">02</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mt-2 mb-3">Sécurité anti-intrusion & Incendie</h3>
              <p className="text-[14px] text-[#59616C] leading-relaxed">
                Vidéosurveillance continue reliée à une société de télésurveillance certifiée, détecteurs de fumée et contrôle d'accès nominatif.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[13px] font-mono text-[#0082CA] font-semibold">03</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mt-2 mb-3">Mise sous scellés en votre présence</h3>
              <p className="text-[14px] text-[#59616C] leading-relaxed">
                Inventaire contradictoire à l'entrée et scellés numérotés posés sur votre box, dont vous conservez les références jusqu'au déchargement.
              </p>
            </div>
          </div>
        </div>

        {/* Tailles de conteneurs */}
        <div className="py-16">
          <div className="max-w-2xl mb-8">
            <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#20252B] tracking-tight">
              Volumes de conteneurs disponibles
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <div className="text-[18px] font-semibold font-mono text-[#20252B]">8 m³</div>
              <div className="text-[13px] text-[#0082CA] font-medium mt-1">Box Studio</div>
              <p className="mt-2 text-[13px] text-[#59616C]">Équivalent d'un studio d'étudiant ou 20 à 30 cartons avec petit électroménager.</p>
            </div>
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <div className="text-[18px] font-semibold font-mono text-[#20252B]">12 m³</div>
              <div className="text-[13px] text-[#0082CA] font-medium mt-1">Box 2 pièces</div>
              <p className="mt-2 text-[13px] text-[#59616C]">Mobilier complet d'un appartement 2 pièces, canapé, lit double et cartons.</p>
            </div>
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <div className="text-[18px] font-semibold font-mono text-[#20252B]">20 m³</div>
              <div className="text-[13px] text-[#0082CA] font-medium mt-1">Box 3-4 pièces</div>
              <p className="mt-2 text-[13px] text-[#59616C]">Volume moyen d'un logement familial avec plusieurs chambres et électroménager.</p>
            </div>
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <div className="text-[18px] font-semibold font-mono text-[#20252B]">30 m³ et +</div>
              <div className="text-[13px] text-[#0082CA] font-medium mt-1">Grand volume / Maison</div>
              <p className="mt-2 text-[13px] text-[#59616C]">Conteneurs multiples combinés pour grandes demeures ou stocks d'entreprise.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
