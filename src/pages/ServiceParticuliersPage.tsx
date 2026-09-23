/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';
import heroImage from '../assets/images/hero_moving_service_1790153159353.jpg';

export const ServiceParticuliersPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Hero split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-16 border-b border-[#E6E8EB]">
          <div className="lg:col-span-7 space-y-6">
            <span className="text-[13px] font-semibold text-[#0082CA] tracking-wider uppercase">
              Prestation Résidentielle
            </span>
            <h1 className="text-[34px] sm:text-[44px] font-semibold text-[#20252B] tracking-tight leading-[1.15] [text-wrap:balance]">
              Déménagement de particuliers, sans stress ni imprévu.
            </h1>
            <p className="text-[17px] text-[#59616C] leading-relaxed max-w-xl">
              Changer de domicile est une étape importante. WE MOVE prend en charge la protection de votre mobilier, l'emballage de vos objets délicats et le transport sécurisé jusqu'à votre nouveau logement.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <Link
                href="/devis/?service=particuliers"
                className="px-6 h-12 rounded-md bg-[#0082CA] text-white text-[15px] font-medium hover:bg-[#006FA8] transition-colors flex items-center justify-center"
              >
                Demander un devis particulier
              </Link>
              <Link
                href="/volume/"
                className="px-5 h-12 rounded-md border border-[#E6E8EB] bg-white text-[#20252B] text-[15px] font-medium hover:bg-[#FAFAF8] transition-colors flex items-center justify-center"
              >
                Estimer mon volume en m³
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-lg overflow-hidden border border-[#E6E8EB] aspect-[4/3] bg-[#FAFAF8] shadow-xs">
              <img 
                src={heroImage} 
                alt="Équipe WE MOVE assurant un déménagement résidentiel"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="mt-2 text-[12px] text-[#59616C]/80 text-right">
              Équipement de portage adapté et couvertures matelassées
            </p>
          </div>
        </div>

        {/* 3 Formules d'accompagnement */}
        <div className="py-16 border-b border-[#E6E8EB]">
          <div className="max-w-2xl mb-12">
            <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#20252B] tracking-tight">
              Nos formules d'accompagnement
            </h2>
            <p className="mt-2 text-[15.5px] text-[#59616C]">
              Trois niveaux de service clairs pour s'adapter à votre budget et au temps que vous souhaitez consacrer aux préparatifs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Formule 1 */}
            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8] flex flex-col justify-between">
              <div>
                <div className="text-[13px] font-mono text-[#0082CA] font-semibold uppercase">Formule 01</div>
                <h3 className="text-[20px] font-semibold text-[#20252B] mt-1 mb-3">Économique</h3>
                <p className="text-[14px] text-[#59616C] leading-relaxed mb-6">
                  Vous emballez vos effets personnels dans vos cartons. Nos déménageurs s'occupent du chargement, du calage en camion et du déchargement.
                </p>
                <ul className="space-y-2.5 text-[13.5px] text-[#59616C]">
                  <li className="flex items-start gap-2"><span>✔</span> Protection du mobilier sous couvertures</li>
                  <li className="flex items-start gap-2"><span>✔</span> Transport sécurisé et assurance route</li>
                  <li className="flex items-start gap-2"><span>✔</span> Dépôt des meubles dans les pièces choisies</li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E6E8EB]">
                <Link href="/devis/?formule=economique" className="text-[14px] font-medium text-[#0082CA] hover:underline">
                  Choisir cette formule →
                </Link>
              </div>
            </div>

            {/* Formule 2 */}
            <div className="p-8 rounded-lg border-2 border-[#0082CA] bg-white flex flex-col justify-between shadow-xs relative">
              <div className="absolute -top-3 right-6 bg-[#0082CA] text-white text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded">
                La plus choisie
              </div>
              <div>
                <div className="text-[13px] font-mono text-[#0082CA] font-semibold uppercase">Formule 02</div>
                <h3 className="text-[20px] font-semibold text-[#20252B] mt-1 mb-3">Standard</h3>
                <p className="text-[14px] text-[#59616C] leading-relaxed mb-6">
                  Le juste équilibre : nous fournissons les cartons et prenons en charge le démontage et remontage de votre gros mobilier.
                </p>
                <ul className="space-y-2.5 text-[13.5px] text-[#59616C]">
                  <li className="flex items-start gap-2"><span>✔</span> Tout le contenu de la formule Économique</li>
                  <li className="flex items-start gap-2"><span>✔</span> Démontage et remontage du mobilier volumineux</li>
                  <li className="flex items-start gap-2"><span>✔</span> Emballage de la vaisselle et des objets fragiles</li>
                  <li className="flex items-start gap-2"><span>✔</span> Cartons et rouleaux d'adhésif fournis en amont</li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E6E8EB]">
                <Link href="/devis/?formule=standard" className="text-[14px] font-medium text-[#0082CA] hover:underline">
                  Choisir cette formule →
                </Link>
              </div>
            </div>

            {/* Formule 3 */}
            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8] flex flex-col justify-between">
              <div>
                <div className="text-[13px] font-mono text-[#0082CA] font-semibold uppercase">Formule 03</div>
                <h3 className="text-[20px] font-semibold text-[#20252B] mt-1 mb-3">Confort / Clé en main</h3>
                <p className="text-[14px] text-[#59616C] leading-relaxed mb-6">
                  Sérénité absolue : notre équipe prépare l'intégralité de vos cartons, protège chaque pièce et déballe vos affaires à l'arrivée.
                </p>
                <ul className="space-y-2.5 text-[13.5px] text-[#59616C]">
                  <li className="flex items-start gap-2"><span>✔</span> Tout le contenu de la formule Standard</li>
                  <li className="flex items-start gap-2"><span>✔</span> Emballage complet de tous les vêtements et livres</li>
                  <li className="flex items-start gap-2"><span>✔</span> Déballage et remise en place à destination</li>
                  <li className="flex items-start gap-2"><span>✔</span> Reprise de tous les cartons et emballages vides</li>
                </ul>
              </div>
              <div className="mt-8 pt-4 border-t border-[#E6E8EB]">
                <Link href="/devis/?formule=confort" className="text-[14px] font-medium text-[#0082CA] hover:underline">
                  Choisir cette formule →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Déroulement de la journée */}
        <div className="py-16">
          <div className="max-w-2xl mb-10">
            <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#20252B] tracking-tight">
              Le déroulement de votre journée de déménagement
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-5 border border-[#E6E8EB] rounded-md bg-white">
              <div className="text-sm font-mono text-[#0082CA] font-medium">01. Arrivée & Briefing</div>
              <p className="mt-2 text-[13.5px] text-[#59616C]">L'équipe arrive à l'heure convenue, effectue le tour des pièces et valide les priorités de chargement.</p>
            </div>
            <div className="p-5 border border-[#E6E8EB] rounded-md bg-white">
              <div className="text-sm font-mono text-[#0082CA] font-medium">02. Protection & Port</div>
              <p className="mt-2 text-[13.5px] text-[#59616C]">Chaque meuble est emballé sous housse ou couverture avant d'être arrimé méthodiquement dans le camion.</p>
            </div>
            <div className="p-5 border border-[#E6E8EB] rounded-md bg-white">
              <div className="text-sm font-mono text-[#0082CA] font-medium">03. Acheminement</div>
              <p className="mt-2 text-[13.5px] text-[#59616C]">Trajet sécurisé par nos chauffeurs expérimentés sous lettre de voiture réglementaire.</p>
            </div>
            <div className="p-5 border border-[#E6E8EB] rounded-md bg-white">
              <div className="text-sm font-mono text-[#0082CA] font-medium">04. Dépose & Contrôle</div>
              <p className="mt-2 text-[13.5px] text-[#59616C]">Chaque meuble et carton est déposé dans la pièce correspondante selon vos indications.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
