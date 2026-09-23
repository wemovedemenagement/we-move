/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from '../router';

import craftImage from '../assets/images/service_craft_protection_1790153177359.jpg';
import officeImage from '../assets/images/office_move_logistics_1790153527033.jpg';
import storageImage from '../assets/images/storage_warehouse_facility_1790153540073.jpg';
import liftImage from '../assets/images/furniture_lift_exterior_1790153551793.jpg';

interface ServicesSectionProps {
  onSelectService?: (slug: string) => void;
}

interface ServiceCardData {
  id: string;
  slug: string;
  number: string;
  categoryBadge: string;
  title: string;
  summary: string;
  features: string[];
  route: string;
  image: string;
  imageAlt: string;
  tagColor: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

const SERVICES_CARDS: ServiceCardData[] = [
  {
    id: 'particuliers',
    slug: 'demenagement-particuliers',
    number: '01',
    categoryBadge: 'Particuliers & Familles',
    title: 'Déménagement de particuliers',
    summary:
      'Studios, appartements parisiens et résidences familiales : nous prenons soin de votre mobilier avec emballage sur-mesure, démontage et remontage soigné.',
    features: [
      'Housses capitonnées pour literie & canapés',
      'Fourniture de cartons renforcés & papier bulle',
      'Manutention adaptée aux escaliers étroits et cours',
    ],
    route: '/demenagement-particuliers/',
    image: craftImage,
    imageAlt: 'Déménageur WE MOVE protégeant méticuleusement un meuble avec une couverture capitonnée',
    tagColor: 'text-[#0082CA] bg-[#EBF5FB]',
    iconBg: 'bg-[#EBF5FB]',
    iconColor: 'text-[#0082CA]',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        />
      </svg>
    ),
  },
  {
    id: 'entreprises',
    slug: 'demenagement-entreprises',
    number: '02',
    categoryBadge: 'Bureaux & Professionnels',
    title: 'Transfert d’entreprises',
    summary:
      'Transfert de bureaux, parcs informatiques, open spaces et archives. Une organisation millimétrée, de nuit ou le week-end, pour garantir zéro coupure d’activité.',
    features: [
      'Repérage technique préalable & plan de transfert',
      'Conditionnement antistatique pour serveurs et PC',
      'Interventions en horaires décalés & week-end',
    ],
    route: '/demenagement-entreprises/',
    image: officeImage,
    imageAlt: 'Déménagement d’entreprise et transfert logistique d’espace de bureaux à Paris',
    tagColor: 'text-[#1D4ED8] bg-[#EFF6FF]',
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#1D4ED8]',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
        />
      </svg>
    ),
  },
  {
    id: 'stockage',
    slug: 'stockage-garde-meubles',
    number: '03',
    categoryBadge: 'Box Sécurisés 24/7',
    title: 'Stockage & Garde-meubles',
    summary:
      'Box individuels tempérés et ventilés à Paris et en Île-de-France. Idéal pendant des travaux, une période de transition ou un stockage d’archives sécurisé.',
    features: [
      'Surveillance vidéo 24h/24 & détection incendie',
      'Mise sous scellés et inventaire détaillé à l’entrée',
      'Contrats flexibles sans durée d’engagement contraignante',
    ],
    route: '/stockage-garde-meubles/',
    image: storageImage,
    imageAlt: 'Entrepôt moderne de garde-meubles sécurisé avec box individuels propres',
    tagColor: 'text-[#059669] bg-[#ECFDF5]',
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#059669]',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
        />
      </svg>
    ),
  },
  {
    id: 'monte-meubles',
    slug: 'location-monte-meubles',
    number: '04',
    categoryBadge: 'Avec Opérateur Habilité',
    title: 'Location de monte-meubles',
    summary:
      'Échelle élévatrice et monte-charges jusqu’au 10ᵉ étage. Franchissement des cours intérieures, fenêtres et escaliers étroits sous la conduite d’un technicien certifié.',
    features: [
      'Opérateur qualifié présent pendant toute l’opération',
      'Levage jusqu’à 400 kg par montée sécurisée',
      'Prise en charge des démarches de voirie à Paris',
    ],
    route: '/location-monte-meubles/',
    image: liftImage,
    imageAlt: 'Monte-meuble déployé en façade d’un immeuble parisien pour passage par fenêtre',
    tagColor: 'text-[#D97706] bg-[#FFFBEB]',
    iconBg: 'bg-[#FFFBEB]',
    iconColor: 'text-[#D97706]',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.8}
          d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z"
        />
      </svg>
    ),
  },
];

export const ServicesSection: React.FC<ServicesSectionProps> = ({ onSelectService }) => {
  const [loadedImages, setLoadedImages] = useState<Record<string, boolean>>({});

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  return (
    <section id="services" className="py-16 sm:py-24 lg:py-28 bg-[#FAFAF8] border-b border-[#E6E8EB]/70">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* ================= 1. SECTION HEADER (PREMIUM EDITORIAL) ================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl space-y-3">
            <div className="text-[12.5px] font-mono uppercase tracking-wider text-[#0082CA] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0082CA]" />
              <span>Nos prestations · Rigueur & savoir-faire</span>
            </div>

            <h2 className="text-[32px] sm:text-[42px] lg:text-[46px] font-bold text-[#111827] tracking-tight leading-[1.14] [text-wrap:balance]">
              Une solution pour chaque projet.
            </h2>

            <p className="text-[16.5px] sm:text-[18px] text-[#475569] leading-relaxed max-w-xl">
              Chaque déménagement répond à des contraintes spécifiques de volume, d'accès et d'organisation. Nous adaptons nos moyens humains et matériels à votre situation.
            </p>
          </div>

          {/* Quiet Trust Points on the Right */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end shrink-0 pt-2 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] font-medium text-[#1E293B] shadow-2xs">
              <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Matériel capitonné & sangles certifiées</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-[#E2E8F0] text-[12.5px] font-medium text-[#1E293B] shadow-2xs">
              <svg className="w-4 h-4 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>Assurance professionnelle tous risques incluse</span>
            </div>
          </div>
        </div>

        {/* ================= 2. 4 SERVICES PREMIUM CARDS (IMAGES + ICONS) ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {SERVICES_CARDS.map((service) => {
            const isLoaded = loadedImages[service.id];

            return (
              <article
                key={service.id}
                className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden flex flex-col justify-between hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 group"
              >
                <div>
                  {/* Photo Header with subtle zoom on hover */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-[#F1F5F9]">
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      referrerPolicy="no-referrer"
                      onLoad={() => handleImageLoad(service.id)}
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    {/* Gradient Overlay for visual prestige */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* Top Row inside Photo: Service Number & Category Badge */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                      <span className="font-mono text-[12px] font-bold tracking-wider px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-white border border-white/20">
                        {service.number}
                      </span>
                      <span
                        className={`text-[11.5px] font-semibold font-mono px-3 py-1 rounded-lg backdrop-blur-md shadow-2xs ${service.tagColor}`}
                      >
                        {service.categoryBadge}
                      </span>
                    </div>

                    {/* Bottom floating icon over photo boundary */}
                    <div className="absolute -bottom-5 right-6 w-12 h-12 rounded-2xl bg-white border border-[#E2E8F0] shadow-md flex items-center justify-center transition-transform group-hover:scale-110 group-hover:shadow-lg">
                      <div className={`${service.iconColor}`}>
                        {service.icon}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 pt-7">
                    <h3 className="text-[21px] sm:text-[23px] font-bold text-[#111827] group-hover:text-[#0082CA] transition-colors leading-snug">
                      <Link
                        href={service.route}
                        onClick={() => {
                          if (onSelectService) onSelectService(service.slug);
                        }}
                      >
                        {service.title}
                      </Link>
                    </h3>

                    <p className="mt-3 text-[14.5px] sm:text-[15.5px] text-[#475569] leading-relaxed">
                      {service.summary}
                    </p>

                    {/* Key features checklist */}
                    <ul
                      className="mt-6 space-y-2.5 pt-6 border-t border-[#F1F5F9] text-[13.5px] text-[#334155]"
                      aria-label={`Avantages clés de ${service.title}`}
                    >
                      {service.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2">
                  <div className="pt-5 border-t border-[#F1F5F9] flex items-center justify-between">
                    <Link
                      href={service.route}
                      onClick={() => {
                        if (onSelectService) onSelectService(service.slug);
                      }}
                      className="inline-flex items-center gap-2 text-[14px] font-semibold text-[#0082CA] group-hover:text-[#006FA8] transition-colors"
                    >
                      <span>Découvrir la formule détaillée</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>

                    <span className="text-[11.5px] font-mono text-[#64748B]">
                      Devis en 24h
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ================= 3. BOTTOM REASSURANCE & VOLUME PROMPT ================= */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-9 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5 max-w-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#EBF5FB] text-[#0082CA] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#111827]">
                Un doute sur la formule la plus adaptée à vos besoins ?
              </h3>
              <p className="mt-1 text-[14px] text-[#475569] leading-relaxed">
                Nos spécialistes logistiques évaluent gratuitement vos accès (étages, cour, voirie) et vous conseillent sur la meilleure combinaison matériel / équipe.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <Link
              href="/volume/"
              className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl border border-[#CBD5E1] text-[13.5px] font-semibold text-[#1E293B] hover:border-[#0082CA] hover:text-[#0082CA] hover:bg-[#F8FAFC] transition-colors"
            >
              <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Calculateur m³</span>
            </Link>

            <Link
              href="/devis/"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#0082CA] text-white text-[13.5px] font-semibold hover:bg-[#006FA8] transition-colors shadow-xs"
            >
              <span>Demander un devis</span>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
