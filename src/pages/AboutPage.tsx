/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';
import { Logo } from '../components/Logo';
import heroImage from '../assets/images/hero_moving_service_1790153159353.jpg';

export const AboutPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Hero split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center pb-16 border-b border-[#E6E8EB]">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-block p-4 sm:p-5 rounded-2xl bg-[#FAFAF8] border border-[#E2E8F0] shadow-2xs">
              <Logo variant="horizontal" size="lg" />
            </div>

            <div className="text-[13px] font-semibold text-[#0082CA] tracking-wider uppercase font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#EE3E38]" />
              <span>Notre Entreprise & Nos Valeurs</span>
            </div>
            <h1 className="text-[34px] sm:text-[44px] font-semibold text-[#20252B] tracking-tight leading-[1.15] [text-wrap:balance]">
              « Déménager avec le sourire », bien plus qu’une signature.
            </h1>
            <p className="text-[17px] text-[#59616C] leading-relaxed max-w-xl">
              WE MOVE est née avec une ambition claire : réconcilier les clients avec l'expérience du déménagement grâce à un professionnalisme rigoureux, une écoute bienveillante et des prix justes sans mauvaise surprise.
            </p>
            <div className="pt-2">
              <Link
                href="/devis/"
                className="inline-flex items-center justify-center px-6 h-12 rounded-md bg-[#0082CA] text-white text-[15px] font-medium hover:bg-[#006FA8] transition-colors"
              >
                Parler de votre projet
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-lg overflow-hidden border border-[#E6E8EB] aspect-[4/3] bg-[#FAFAF8] shadow-xs">
              <img 
                src={heroImage} 
                alt="L'équipe WE MOVE sur le terrain"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <p className="mt-2 text-[12px] text-[#59616C]/80 text-right">
              Équipes formées aux techniques de portage et au respect des biens
            </p>
          </div>
        </div>

        {/* Les 4 piliers */}
        <div className="py-16 border-b border-[#E6E8EB]">
          <div className="max-w-2xl mb-12">
            <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#20252B] tracking-tight">
              Nos 4 engagements fondamentaux
            </h2>
            <p className="mt-2 text-[15.5px] text-[#59616C]">
              Chaque intervention est encadrée par des exigences de qualité strictes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[14px] font-mono text-[#0082CA] font-semibold mb-2">01. Soin du mobilier</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mb-2">Protection systématique</h3>
              <p className="text-[14.5px] text-[#59616C] leading-relaxed">
                Aucun meuble ne quitte votre domicile sans être houssé ou enveloppé sous couverture épaisse. Nous traitons vos biens avec le même égard que les nôtres.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[14px] font-mono text-[#0082CA] font-semibold mb-2">02. Ponctualité & Rigueur</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mb-2">Planning maîtrisé</h3>
              <p className="text-[14.5px] text-[#59616C] leading-relaxed">
                Nous respectons les créneaux d'arrivée convenus et anticipons les temps de route et de stationnement pour que votre journée se déroule sans retard.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[14px] font-mono text-[#0082CA] font-semibold mb-2">03. Transparence tarifaire</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mb-2">Aucun coût caché</h3>
              <p className="text-[14.5px] text-[#59616C] leading-relaxed">
                Nos devis sont détaillés poste par poste : assurance, fournitures, nombre d'hommes et véhicules nécessaires sont clairement précisés avant acceptation.
              </p>
            </div>

            <div className="p-8 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8]">
              <div className="text-[14px] font-mono text-[#0082CA] font-semibold mb-2">04. Équipes qualifiées</div>
              <h3 className="text-[19px] font-semibold text-[#20252B] mb-2">Personnel permanent</h3>
              <p className="text-[14.5px] text-[#59616C] leading-relaxed">
                Nos déménageurs et chauffeurs sont formés aux règles de sécurité, à l'arrimage en camion et à la manipulation des pièces lourdes et précieuses.
              </p>
            </div>
          </div>
        </div>

        {/* Flotte & Matériel */}
        <div className="py-16">
          <div className="max-w-2xl mb-8">
            <h2 className="text-[26px] sm:text-[32px] font-semibold text-[#20252B] tracking-tight">
              Flotte de véhicules & Moyens techniques
            </h2>
            <p className="mt-2 text-[15.5px] text-[#59616C]">
              Un parc matériel régulièrement renouvelé et entretenu pour assurer des liaisons locales et nationales.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <h4 className="text-[17px] font-semibold text-[#20252B]">Camions capitonnés 20 m³ & 30 m³</h4>
              <p className="mt-2 text-[14px] text-[#59616C]">Équipés de hayons élévateurs et barres d'arrimage pour un maintien parfait du mobilier sur la route.</p>
            </div>
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <h4 className="text-[17px] font-semibold text-[#20252B]">Fourgons urbains 12 m³</h4>
              <p className="mt-2 text-[14px] text-[#59616C]">Gabarits maniables pour accéder aux ruelles historiques et parkings souterrains en centre-ville.</p>
            </div>
            <div className="p-6 border border-[#E6E8EB] rounded-lg bg-white">
              <h4 className="text-[17px] font-semibold text-[#20252B]">Échelles élévatrices tractées</h4>
              <p className="mt-2 text-[14px] text-[#59616C]">Monte-meubles compacts avec moteur thermique ou électrique silencieux pour le confort du voisinage.</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
