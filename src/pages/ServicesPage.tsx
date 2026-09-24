/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SERVICES_DATA } from '../data/content';
import { Link } from '../router';
import craftImage from '../assets/images/service_craft_protection_1790153177359.jpg';

export const ServicesPage: React.FC = () => {
  return (
    <div className="py-12 sm:py-20 bg-white">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Page Header */}
        <div className="max-w-3xl mb-14">
          <span className="text-[13px] font-semibold text-[#0082CA] tracking-wider uppercase">
            Nos savoir-faire
          </span>
          <h1 className="text-[34px] sm:text-[44px] font-semibold text-[#20252B] tracking-tight mt-2 [text-wrap:balance]">
            Des prestations pensées pour chaque situation.
          </h1>
          <p className="mt-4 text-[17px] text-[#59616C] leading-relaxed">
            Déménagement d'un appartement, transfert de siège social, stockage temporaire ou levage par façade : nous mettons en œuvre les ressources adaptées pour une transition fluide.
          </p>
        </div>

        {/* Services List - Editorial layout */}
        <div className="space-y-12">
          {SERVICES_DATA.map((service, idx) => (
            <div 
              key={service.id}
              className="p-8 sm:p-12 rounded-lg border border-[#E6E8EB] bg-[#FAFAF8] grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              <div className="lg:col-span-8 space-y-4">
                <div className="flex items-center gap-3 text-[13px] text-[#59616C]">
                  <span className="font-mono text-[#0082CA] font-semibold">0{idx + 1}</span>
                  <span aria-hidden="true">·</span>
                  <span className="text-xs">Un accompagnement sur mesure</span>
                </div>

                <h2 className="text-[24px] sm:text-[28px] font-semibold text-[#20252B] tracking-tight">
                  {service.title}
                </h2>

                <p className="text-[16px] text-[#59616C] leading-relaxed">
                  {service.summary}
                </p>

                <div className="pt-2">
                  <div className="text-[13px] font-semibold text-[#20252B] mb-2 uppercase tracking-wide">
                    Prestations incluses :
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[14px] text-[#59616C]">
                    {service.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <span className="text-[#0082CA] mt-1 text-xs">✔</span>
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-4">
                  <Link
                    href={service.route}
                    className="inline-flex items-center gap-2 px-5 h-11 rounded-md bg-[#20252B] text-white text-[14px] font-medium hover:bg-[#323942] transition-colors"
                  >
                    <span>Consulter la page détaillée</span>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>

                  <Link
                    href={`/devis/?service=${service.id}`}
                    className="inline-flex items-center gap-2 px-5 h-11 rounded-md border border-[#E6E8EB] bg-white text-[#20252B] text-[14px] font-medium hover:bg-[#FAFAF8] transition-colors"
                  >
                    Demander un devis pour ce service
                  </Link>
                </div>
              </div>

              {/* Complementary photo box */}
              <div className="lg:col-span-4 rounded-lg overflow-hidden border border-[#E6E8EB] bg-white p-3">
                <div className="aspect-[4/3] rounded overflow-hidden">
                  <img 
                    src={craftImage} 
                    alt={`Équipements et soins apportés pour ${service.title}`}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="mt-3 text-[12px] text-[#59616C] text-center">
                  Matériel et protection certifiés WE MOVE
                </div>
              </div>

            </div>
          ))}
        </div>

        {/* Bottom Banner */}
        <div className="mt-16 p-8 bg-[#FFFFFF] border border-[#E6E8EB] rounded-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-[18px] font-semibold text-[#20252B]">
              Besoin de combiner plusieurs prestations ?
            </h3>
            <p className="mt-1 text-[14.5px] text-[#59616C]">
              Par exemple un déménagement avec garde-meubles temporaire et monte-meubles : nos conseillers étudient une formule globale.
            </p>
          </div>
          <Link
            href="/contact/"
            className="px-6 h-11 rounded-md bg-[#0082CA] text-white text-[14px] font-medium hover:bg-[#006FA8] transition-colors shrink-0"
          >
            Contacter un conseiller
          </Link>
        </div>

      </div>
    </div>
  );
};
