/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';

interface StepDetail {
  number: string;
  phase: string;
  badge: string;
  title: string;
  description: string;
  highlights: string[];
  deliverable: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

const STEPS: StepDetail[] = [
  {
    number: '01',
    phase: 'Phase 1',
    badge: 'Analyse des accès',
    title: 'Définition du projet & repérage des contraintes',
    description:
      'Renseignez vos adresses de départ et d’arrivée, la présence d’ascenseurs, les particularités d’accès (cours d’immeuble, rues piétonnes) et vos dates cibles.',
    highlights: [
      'Étude des accès (escaliers, ascenseur, cour pavée)',
      'Vérification du besoin en monte-meubles extérieur',
      'Anticipation de la réservation de stationnement en voirie',
    ],
    deliverable: 'Diagnostic logistique d’accès',
    iconBg: 'bg-[#EBF5FB]',
    iconColor: 'text-[#0082CA]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    number: '02',
    phase: 'Phase 2',
    badge: 'Cubage & Formule',
    title: 'Estimation du volume et choix des options',
    description:
      'Évaluez votre cubage meuble par meuble avec notre calculateur interactif ou lors d’une visite vidéo, puis sélectionnez la formule adaptée à votre rythme.',
    highlights: [
      'Calcul précis des mètres cubes (m³) pièce par pièce',
      'Fourniture de cartons renforcés & matériel d’emballage',
      'Options d’emballage complet des objets fragiles',
    ],
    deliverable: 'Gabarit camion & volume calibrés',
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#1D4ED8]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    number: '03',
    phase: 'Phase 3',
    badge: 'Engagement ferme',
    title: 'Proposition transparente & devis sous 24h',
    description:
      'Vous recevez un devis ferme et sans mauvaise surprise. Un conseiller dédié reste à votre disposition pour affiner les horaires et formaliser l’assurance.',
    highlights: [
      'Tarification détaillée sans frais cachés à l’arrivée',
      'Assurance professionnelle tous risques formalisée',
      'Réservation garantie de votre créneau d’intervention',
    ],
    deliverable: 'Contrat clair & date verrouillée',
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#059669]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    number: '04',
    phase: 'Phase 4',
    badge: 'Exécution Jour J',
    title: 'Prise en charge totale par nos déménageurs',
    description:
      'Le jour convenu, notre équipe salariée prend tout en main avec bienveillance : protection des parties communes, manutention sécurisée et installation finale.',
    highlights: [
      'Arrivée ponctuelle avec camion capitonné équipé',
      'Housses de protection pour literie & canapés',
      'Dépose et remontage dans les pièces de votre choix',
    ],
    deliverable: 'Emménagement l’esprit tranquille',
    iconBg: 'bg-[#FFFBEB]',
    iconColor: 'text-[#D97706]',
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
];

export const ProcessSection: React.FC = () => {
  return (
    <section id="methode" className="relative py-20 sm:py-28 lg:py-32 bg-[#FAFAF8] border-b border-[#E2E8F0]/70 overflow-hidden">
      
      {/* Decorative ambient background radial lighting */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0082CA]/10 via-slate-100/30 to-transparent pointer-events-none blur-3xl -z-0" 
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -z-0"
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* ================= 1. EXECUTIVE NEO-GLASS HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-14 sm:mb-20">
          <div className="max-w-2xl space-y-4">
            
            {/* Néo-Glassmorphic Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#0082CA]/25 text-[#0082CA] shadow-2xs font-mono text-[12px] font-semibold tracking-wide">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0082CA] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0082CA]"></span>
              </span>
              <span>Méthode de travail · Rigueur & sérénité</span>
            </div>

            {/* Headline with Gradient Accent */}
            <h2 className="text-[34px] sm:text-[46px] lg:text-[52px] font-bold text-[#0F172A] tracking-tight leading-[1.12] font-display [text-wrap:balance]">
              Préparer votre déménagement,{' '}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-[#0082CA] via-[#0284C7] to-[#0369A1] bg-clip-text text-transparent">
                  étape par étape
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
              </span>
              .
            </h2>

            {/* Subtitle */}
            <p className="text-[17px] sm:text-[18.5px] text-[#475569] leading-relaxed max-w-xl font-normal">
              Une organisation rigoureuse en amont évite les imprévus le jour J. Voici comment se déroule la préparation de votre intervention avec WE MOVE.
            </p>
          </div>

          {/* Quick Pillars on the right */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end shrink-0 pt-2 lg:pt-0">
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-emerald-200/80 text-[13px] font-semibold text-slate-800 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Accompagnement personnalisé de A à Z</span>
            </div>
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-white/90 backdrop-blur-md border border-sky-200/80 text-[13px] font-semibold text-slate-800 shadow-2xs">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0082CA]" />
              <span>Devis ferme et transparent sous 24h</span>
            </div>
          </div>
        </div>

        {/* ================= 2. 4-STEPS TIMELINE GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-7 relative">
          
          {/* Subtle horizontal connecting progress bar for desktop */}
          <div 
            className="hidden lg:block absolute top-[52px] left-16 right-16 h-[2.5px] bg-gradient-to-r from-[#0082CA] via-sky-400 to-emerald-400 opacity-30 z-0"
            aria-hidden="true"
          />

          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative bg-white rounded-3xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between hover:border-[#0082CA]/40 shadow-xs hover:shadow-2xl hover:shadow-[#0082CA]/10 transition-all duration-500 hover:-translate-y-1.5 z-10"
            >
              {/* Top Accent Gradient Line on Hover */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0082CA] via-sky-400 to-[#0284C7] opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-20 rounded-t-3xl" />

              <div>
                {/* Step Top Row: Number Circle + Badge */}
                <div className="flex items-center justify-between mb-6 relative z-10">
                  {/* Step Number Circle with Icon */}
                  <div
                    className={`w-14 h-14 rounded-2xl ${step.iconBg} ${step.iconColor} border border-white/80 flex items-center justify-center font-mono font-bold text-[18px] shadow-md transition-all duration-500 group-hover:scale-110 group-hover:shadow-xl group-hover:border-[#0082CA]/30`}
                  >
                    {step.icon}
                  </div>

                  {/* Micro badge */}
                  <span className="text-[11.5px] font-mono font-bold px-3 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200/60 shadow-2xs">
                    {step.badge}
                  </span>
                </div>

                {/* Step Number Indicator */}
                <div className="text-[12px] font-mono font-bold text-[#0082CA] tracking-wider mb-1 uppercase">
                  Étape {step.number}
                </div>

                {/* Step Title */}
                <h3 className="text-[18px] sm:text-[19px] font-bold text-[#0F172A] group-hover:text-[#0082CA] transition-colors leading-snug font-display">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="mt-2.5 text-[13.5px] sm:text-[14px] text-[#475569] leading-relaxed">
                  {step.description}
                </p>

                {/* Key check highlights */}
                <ul className="mt-5 space-y-2.5 pt-4 border-t border-[#F1F5F9] text-[12.5px] text-[#334155]">
                  {step.highlights.map((item, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2.5">
                      <div className="w-4.5 h-4.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom deliverable footer badge */}
              <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-[11.5px]">
                <span className="text-[#94A3B8] font-mono font-semibold">{step.phase}</span>
                <span className="font-semibold text-[#0082CA] bg-[#EBF5FB] px-2.5 py-1 rounded-xl border border-[#0082CA]/20">
                  {step.deliverable}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ================= 3. SUBLIMATED BOTTOM ENGAGEMENT BANNER ================= */}
        <div className="mt-14 sm:mt-20 p-7 sm:p-10 bg-gradient-to-br from-white via-slate-50/80 to-sky-50/30 rounded-3xl border border-[#E2E8F0] shadow-md relative overflow-hidden flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 group">
          {/* Ambient glow decoration inside banner */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-sky-100/50 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="relative z-10 flex items-start gap-4 sm:gap-6 max-w-2xl">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0082CA] to-[#00537A] text-white flex items-center justify-center shrink-0 shadow-md shadow-[#0082CA]/20 group-hover:scale-105 transition-transform duration-300">
              <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="space-y-1.5">
              <h3 className="text-[18.5px] sm:text-[20px] font-bold text-[#0F172A] font-display">
                Prêt à démarrer l’étape 1 en quelques clics ?
              </h3>
              <p className="text-[14.5px] sm:text-[15.5px] text-[#475569] leading-relaxed">
                Obtenez une proposition détaillée sous 24h ou contactez nos spécialistes pour une visite technique d’accès à Paris & en Île-de-France.
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
              <span>Calculateur de cubage</span>
            </Link>

            <Link
              href="/devis/"
              className="inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-2xl bg-gradient-to-r from-[#0082CA] to-[#006FA8] text-white text-[14px] font-bold hover:from-[#0074B5] hover:to-[#005B8C] transition-all duration-300 shadow-md shadow-[#0082CA]/20 hover:shadow-lg hover:shadow-[#0082CA]/30"
            >
              <span>Demander mon devis</span>
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
