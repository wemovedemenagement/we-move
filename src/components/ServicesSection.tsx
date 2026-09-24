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
  category: 'particulier' | 'entreprise' | 'equipement';
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
    category: 'particulier',
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
    category: 'entreprise',
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
    category: 'equipement',
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
    category: 'equipement',
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
  const [activeTab, setActiveTab] = useState<'all' | 'particulier' | 'entreprise' | 'equipement'>('all');

  const handleImageLoad = (id: string) => {
    setLoadedImages((prev) => ({ ...prev, [id]: true }));
  };

  const filteredCards = SERVICES_CARDS.filter((card) => {
    if (activeTab === 'all') return true;
    return card.category === activeTab;
  });

  return (
    <section id="services" className="relative py-20 sm:py-28 lg:py-32 bg-[#FAFAF8] border-b border-[#E2E8F0]/70 overflow-hidden">
      {/* Decorative ambient background radial lighting */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0082CA]/10 via-slate-100/30 to-transparent pointer-events-none blur-3xl -z-0" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* ================= 1. EXECUTIVE NEO-GLASS HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12 sm:mb-16">
          <div className="max-w-2xl space-y-4">
            
            {/* Néo-Glassmorphic Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#0082CA]/25 text-[#0082CA] shadow-2xs font-mono text-[12px] font-semibold tracking-wide">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0082CA] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0082CA]"></span>
              </span>
              <span>Nos prestations · Rigueur & savoir-faire</span>
            </div>

            {/* Main Headline with Gradient Accent */}
            <h2 className="text-[34px] sm:text-[46px] lg:text-[52px] font-bold text-[#0F172A] tracking-tight leading-[1.12] font-display [text-wrap:balance]">
              Une solution{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#0082CA] via-[#0284C7] to-[#0369A1] bg-clip-text text-transparent">
                  sur-mesure
                </span>
                <svg
                  className="absolute -bottom-1 left-0 w-full h-2.5 text-[#0082CA]/30"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M0 15 Q 50 0, 100 15"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{' '}
              pour chaque déménagement.
            </h2>

            {/* Subtitle */}
            <p className="text-[17px] sm:text-[18.5px] text-[#475569] leading-relaxed max-w-xl font-normal">
              Chaque projet répond à des contraintes spécifiques de volume, d'accès et d'organisation. Nous adaptons nos moyens humains et matériels à votre situation.
            </p>

            {/* Micro-puces de garantie et réassurance */}
            <div className="flex flex-wrap items-center gap-2.5 pt-2 text-[12.5px] font-semibold text-[#334155]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs text-slate-700">
                <svg className="w-3.5 h-3.5 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Équipes salariées qualifiées
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs text-slate-700">
                <svg className="w-3.5 h-3.5 text-[#059669]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Assurance Ad Valorem
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E2E8F0] shadow-2xs text-slate-700">
                <svg className="w-3.5 h-3.5 text-[#D97706]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Devis gratuit en 24h
              </span>
            </div>
          </div>

          {/* Interactive Filter Pills */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-white/90 backdrop-blur-md border border-[#E2E8F0] rounded-2xl shadow-xs self-start lg:self-end">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-[#0082CA] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span>Toutes</span>
              <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono ${
                activeTab === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
              }`}>4</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('particulier')}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'particulier'
                  ? 'bg-[#0082CA] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span>Particuliers</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('entreprise')}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'entreprise'
                  ? 'bg-[#0082CA] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span>Entreprises</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('equipement')}
              className={`px-4 py-2 rounded-xl text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'equipement'
                  ? 'bg-[#0082CA] text-white shadow-sm'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F8FAFC]'
              }`}
            >
              <span>Garde-meubles & Lift</span>
            </button>
          </div>
        </div>

        {/* ================= 2. 4 SERVICES SUBLIMATED PREMIUM CARDS ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {filteredCards.map((service) => {
            const isLoaded = loadedImages[service.id];

            return (
              <article
                key={service.id}
                className="group relative bg-white rounded-3xl border border-[#E2E8F0] overflow-hidden flex flex-col justify-between hover:border-[#0082CA]/40 shadow-xs hover:shadow-2xl hover:shadow-[#0082CA]/10 transition-all duration-500 hover:-translate-y-1.5"
              >
                {/* Accent top gradient line on hover */}
                <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0082CA] via-sky-400 to-[#0284C7] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20" />

                <div>
                  {/* Photo Header with smooth zoom on hover */}
                  <div className="relative aspect-[16/10] sm:aspect-[16/9] w-full overflow-hidden bg-slate-100">
                    <img
                      src={service.image}
                      alt={service.imageAlt}
                      referrerPolicy="no-referrer"
                      onLoad={() => handleImageLoad(service.id)}
                      className={`w-full h-full object-cover transition-all duration-700 group-hover:scale-105 ${
                        isLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                    />

                    {/* Gradient Overlay for visual depth */}
                    <div
                      className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/15 to-transparent pointer-events-none"
                      aria-hidden="true"
                    />

                    {/* Top Row inside Photo: Service Number & Category Badge */}
                    <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
                      <span className="font-mono text-[11.5px] font-bold tracking-wider px-3 py-1 rounded-full bg-slate-950/70 backdrop-blur-md text-white border border-white/20 shadow-xs">
                        {service.number}
                      </span>
                      <span
                        className={`text-[11.5px] font-bold font-mono px-3.5 py-1 rounded-full backdrop-blur-md shadow-xs border border-white/30 ${service.tagColor}`}
                      >
                        {service.categoryBadge}
                      </span>
                    </div>

                    {/* Bottom floating 3D icon over photo boundary */}
                    <div className="absolute -bottom-5 right-6 w-12 h-12 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-md flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:border-[#0082CA]/30 z-10">
                      <div className={`${service.iconColor}`}>
                        {service.icon}
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 sm:p-8 pt-8">
                    <h3 className="text-[22px] sm:text-[24px] font-bold text-[#0F172A] group-hover:text-[#0082CA] transition-colors leading-snug font-display">
                      <Link
                        href={service.route}
                        onClick={() => {
                          if (onSelectService) onSelectService(service.slug);
                        }}
                        className="flex items-center justify-between gap-2"
                      >
                        <span>{service.title}</span>
                        <svg
                          className="w-5 h-5 text-slate-400 group-hover:text-[#0082CA] group-hover:translate-x-1 transition-all shrink-0 opacity-0 group-hover:opacity-100"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
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
                          <div className="w-5 h-5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                          <span className="font-medium">{feat}</span>
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
                      className="inline-flex items-center gap-2 text-[14px] font-bold text-[#0082CA] group-hover:text-[#006FA8] transition-colors"
                    >
                      <span>Découvrir la formule détaillée</span>
                      <svg
                        className="w-4 h-4 transition-transform group-hover:translate-x-1.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>

                    <span className="inline-flex items-center gap-1.5 text-[11.5px] font-mono font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200/70">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Devis sous 24h
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* ================= 3. SUBLIMATED REASSURANCE & VOLUME BANNER ================= */}
        <div className="mt-14 sm:mt-20 p-7 sm:p-10 bg-gradient-to-br from-white via-slate-50/80 to-sky-50/30 rounded-3xl border border-[#E2E8F0] shadow-md relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 group">
          {/* Ambient glow decoration inside banner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 flex items-start gap-4 sm:gap-6 max-w-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0082CA] to-[#00537A] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#0082CA]/20 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-[18.5px] sm:text-[20px] font-bold text-[#0F172A] font-display">
                Un doute sur la formule la plus adaptée à votre logement ?
              </h3>
              <p className="text-[14.5px] sm:text-[15.5px] text-[#475569] leading-relaxed">
                Nos conseillers en logistique évaluent gratuitement vos besoins d'accès (étages, ascenseur, cour, passage de rue) et vous orientent vers la formule idéale.
              </p>
            </div>
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto shrink-0">
            <Link
              href="/volume/"
              className="inline-flex items-center justify-center gap-2.5 h-12 px-6 rounded-2xl border border-[#CBD5E1] bg-white text-[14px] font-semibold text-[#1E293B] hover:border-[#0082CA] hover:text-[#0082CA] hover:bg-[#F8FAFC] hover:shadow-sm transition-all duration-300"
            >
              <svg className="w-4.5 h-4.5 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <span>Calculateur m³</span>
            </Link>

            <Link
              href="/devis/"
              className="inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-2xl bg-gradient-to-r from-[#0082CA] to-[#006FA8] text-white text-[14px] font-bold hover:from-[#0074B5] hover:to-[#005B8C] transition-all duration-300 shadow-md shadow-[#0082CA]/20 hover:shadow-lg hover:shadow-[#0082CA]/30"
            >
              <span>Demander un devis</span>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>

      </div>
    </section>
  );
};
