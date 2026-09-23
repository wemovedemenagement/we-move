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
    <section id="methode" className="py-16 sm:py-24 lg:py-28 bg-[#FAFAF8] border-b border-[#E6E8EB]/70 relative overflow-hidden">
      
      {/* Decorative ambient background accents */}
      <div 
        className="absolute top-1/2 left-0 -translate-y-1/2 w-96 h-96 bg-[#0082CA]/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true" 
      />
      <div 
        className="absolute bottom-0 right-0 w-80 h-80 bg-[#10B981]/5 rounded-full blur-3xl pointer-events-none"
        aria-hidden="true" 
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 relative">
        
        {/* ================= 1. SECTION HEADER (PREMIUM EDITORIAL) ================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="max-w-2xl space-y-3">
            <div className="text-[12.5px] font-mono uppercase tracking-wider text-[#0082CA] font-semibold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#0082CA]" />
              <span>Méthode de travail · Rigueur & sérénité</span>
            </div>

            <h2 className="text-[32px] sm:text-[42px] lg:text-[46px] font-bold text-[#111827] tracking-tight leading-[1.14] [text-wrap:balance]">
              Préparer votre déménagement, étape par étape.
            </h2>

            <p className="text-[16.5px] sm:text-[18px] text-[#475569] leading-relaxed max-w-xl">
              Une organisation rigoureuse en amont évite les imprévus le jour J. Voici comment se déroule la préparation de votre intervention avec WE MOVE.
            </p>
          </div>

          {/* Quick Pillars on the right */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 lg:items-end shrink-0 pt-2 lg:pt-0">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[12.5px] font-medium text-[#1E293B] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span>Accompagnement personnalisé de A à Z</span>
            </div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-white border border-[#E2E8F0] text-[12.5px] font-medium text-[#1E293B] shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-[#0082CA]" />
              <span>Devis ferme et transparent sous 24h</span>
            </div>
          </div>
        </div>

        {/* ================= 2. 4-STEPS TIMELINE GRID ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          
          {/* Subtle horizontal connecting bar for large screens */}
          <div 
            className="hidden lg:block absolute top-[45px] left-12 right-12 h-[2px] bg-gradient-to-r from-[#0082CA]/20 via-[#0082CA]/40 to-[#10B981]/40 -z-0"
            aria-hidden="true"
          />

          {STEPS.map((step) => (
            <div
              key={step.number}
              className="bg-white rounded-2xl border border-[#E2E8F0] p-6 sm:p-7 flex flex-col justify-between hover:border-[#CBD5E1] hover:shadow-xl hover:shadow-slate-900/5 transition-all duration-300 relative group z-10"
            >
              <div>
                {/* Step Top Row: Number Circle + Badge */}
                <div className="flex items-center justify-between mb-6">
                  {/* Step Number Circle with Icon */}
                  <div
                    className={`w-13 h-13 rounded-2xl ${step.iconBg} ${step.iconColor} border border-white flex items-center justify-center font-mono font-bold text-[17px] shadow-sm transition-transform group-hover:scale-105 group-hover:shadow-md`}
                  >
                    {step.number}
                  </div>

                  {/* Micro badge */}
                  <span className="text-[11px] font-mono font-semibold px-2.5 py-1 rounded-md bg-[#F1F5F9] text-[#475569]">
                    {step.badge}
                  </span>
                </div>

                {/* Step Title */}
                <h3 className="text-[17px] sm:text-[18px] font-bold text-[#111827] group-hover:text-[#0082CA] transition-colors leading-snug">
                  {step.title}
                </h3>

                {/* Step Description */}
                <p className="mt-2.5 text-[13.5px] sm:text-[14px] text-[#475569] leading-relaxed">
                  {step.description}
                </p>

                {/* Key check highlights */}
                <ul className="mt-5 space-y-2 pt-4 border-t border-[#F1F5F9] text-[12.5px] text-[#334155]">
                  {step.highlights.map((item, hIdx) => (
                    <li key={hIdx} className="flex items-start gap-2">
                      <svg
                        className="w-3.5 h-3.5 text-[#10B981] shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bottom deliverable footer badge */}
              <div className="mt-6 pt-4 border-t border-[#F1F5F9] flex items-center justify-between text-[11.5px]">
                <span className="text-[#94A3B8] font-mono">{step.phase}</span>
                <span className="font-semibold text-[#0082CA] bg-[#EBF5FB] px-2 py-0.5 rounded">
                  {step.deliverable}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ================= 3. BOTTOM ENGAGEMENT BANNER ================= */}
        <div className="mt-12 sm:mt-16 p-6 sm:p-9 bg-white rounded-2xl border border-[#E2E8F0] shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 sm:gap-5 max-w-2xl">
            <div className="w-12 h-12 rounded-xl bg-[#EBF5FB] text-[#0082CA] flex items-center justify-center shrink-0">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#111827]">
                Prêt à démarrer l’étape 1 en quelques clics ?
              </h3>
              <p className="mt-1 text-[14px] text-[#475569] leading-relaxed">
                Obtenez une proposition détaillée sous 24h ou contactez nos spécialistes pour une visite technique d’accès à Paris & en Île-de-France.
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
              <span>Calculateur de cubage</span>
            </Link>

            <Link
              href="/devis/"
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-xl bg-[#0082CA] text-white text-[13.5px] font-semibold hover:bg-[#006FA8] transition-colors shadow-xs"
            >
              <span>Demander mon devis</span>
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
