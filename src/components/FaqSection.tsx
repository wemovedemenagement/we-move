/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FAQ_DATA } from '../data/content';
import { FaqAccordion } from './FaqAccordion';
import { Link } from '../router';
import verticalProcessImage from '../assets/images/moving_process_vertical_1790189469694.jpg';

export const FaqSection: React.FC = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Schema.org FAQPage structured data for SEO and accessibility
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_DATA.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  return (
    <section id="questions" className="relative py-20 sm:py-28 lg:py-32 bg-[#FAFAF8] border-b border-[#E2E8F0]/70 overflow-hidden">
      {/* Schema.org microdata injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Decorative ambient background radial lighting */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0082CA]/10 via-slate-100/30 to-transparent pointer-events-none blur-3xl -z-0" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* ================= 2-COLUMN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          
          {/* ================= COLONNE 1 (GAUCHE) : EN-TÊTE + ACCORDÉON FAQ ================= */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Section Header */}
            <div className="space-y-4">
              {/* Néo-Glassmorphic Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#0082CA]/25 text-[#0082CA] shadow-2xs font-mono text-[12px] font-semibold tracking-wide">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0082CA] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0082CA]"></span>
                </span>
                <span>Questions utiles · Anticipation & Clarté</span>
              </div>

              {/* Headline with Gradient Accent */}
              <h2 className="text-[34px] sm:text-[44px] lg:text-[48px] font-bold text-[#0F172A] tracking-tight leading-[1.12] font-display [text-wrap:balance]">
                Les questions utiles pour bien préparer votre{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#0082CA] via-[#0284C7] to-[#0369A1] bg-clip-text text-transparent">
                    projet
                  </span>
                  <svg
                    className="absolute -bottom-1 left-0 w-full h-2.5 text-[#0082CA]/30"
                    viewBox="0 0 100 20"
                    preserveAspectRatio="none"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path d="M0 15 Q 50 0, 100 15" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                  </svg>
                </span>
                .
              </h2>

              {/* Subtitle */}
              <p className="text-[17px] sm:text-[18.5px] text-[#475569] leading-relaxed font-normal">
                Pour anticiper chaque étape de votre déménagement en toute sérénité, retrouvez les réponses vérifiées à vos interrogations les plus fréquentes.
              </p>
            </div>

            {/* Accessible Accordion Component */}
            <div className="pt-2">
              <FaqAccordion 
                items={FAQ_DATA} 
                defaultOpenId="devis-preparation" 
                allowMultiple={true}
              />
            </div>

            {/* Direct question assistance banner */}
            <div className="p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] bg-gradient-to-br from-white via-slate-50/80 to-sky-50/30 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-md relative overflow-hidden group">
              <div className="space-y-1 relative z-10">
                <h4 className="text-[16px] sm:text-[17px] font-bold text-[#0F172A] font-display">
                  Une situation particulière ou un doute d'accès ?
                </h4>
                <p className="text-[14px] text-[#475569]">
                  Nos conseillers analysent vos contraintes spécifiques sous 24h ouvrées.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-3 relative z-10">
                <Link
                  href="/contact/"
                  className="px-4.5 py-2.5 rounded-2xl bg-white border border-[#CBD5E1] text-[13.5px] font-semibold text-[#1E293B] hover:border-[#0082CA] hover:text-[#0082CA] transition-colors shadow-2xs"
                >
                  Poser une question
                </Link>
                <Link
                  href="/devis/"
                  className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0082CA] to-[#006FA8] text-[13.5px] font-bold text-white hover:from-[#0074B5] hover:to-[#005B8C] transition-all duration-300 shadow-md shadow-[#0082CA]/20"
                >
                  Demander un devis
                </Link>
              </div>
            </div>

          </div>

          {/* ================= COLONNE 2 (DROITE) : RÉSERVÉE POUR L'IMAGE VERTICALE ================= */}
          <div className="lg:col-span-5 w-full lg:sticky lg:top-28">
            
            <div className="relative rounded-3xl overflow-hidden bg-white border border-[#E2E8F0] shadow-xl shadow-slate-900/10 aspect-[3/4] sm:aspect-[4/5] lg:aspect-[3/4]">
              
              {!imageError ? (
                <img
                  src={verticalProcessImage}
                  alt="Déménageurs professionnels WE MOVE préparant le transport minutieux du mobilier dans un appartement parisien"
                  referrerPolicy="no-referrer"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className={`w-full h-full object-cover transition-opacity duration-500 ${
                    imageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                />
              ) : null}

              {/* Graceful fallback if image is loading or error */}
              {(imageError || !imageLoaded) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#FAFAF8] text-[#59616C]">
                  <div className="w-12 h-12 mb-3 rounded-full bg-[#E6E8EB]/50 flex items-center justify-center text-[#0082CA]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-[#111827]">WE MOVE DÉMÉNAGEMENT</span>
                  <span className="text-xs mt-1 text-[#64748B]">Conseils & assistance personnalisée</span>
                </div>
              )}

              {/* Gradient vignette for text clarity */}
              <div
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent pointer-events-none"
                aria-hidden="true"
              />

              {/* Top Floating Badge */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-white/60 shadow-sm text-[12px] font-semibold text-[#0F172A]">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Conseils 7j/7</span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white font-mono text-[11.5px] font-bold">
                  <span>Paris & IDF</span>
                </div>
              </div>

              {/* Bottom Reassurance Card over the image */}
              <div className="absolute bottom-4 left-4 right-4 p-5 rounded-2xl bg-white/95 backdrop-blur-md border border-white/80 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <span className="text-[13.5px] font-bold text-[#0F172A]">
                      Une question en direct ?
                    </span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#0082CA] bg-[#EBF5FB] px-2.5 py-0.5 rounded-full border border-[#0082CA]/20">
                    Ligne dédiée
                  </span>
                </div>

                <p className="text-[12.5px] text-[#475569] leading-relaxed">
                  Nos coordinateurs étudient gratuitement vos accès, escaliers et démarches de voirie.
                </p>

                <a
                  href="tel:0173743690"
                  className="flex items-center justify-between pt-2.5 border-t border-[#F1F5F9] text-[13.5px] font-bold text-[#0082CA] hover:text-[#006FA8] transition-colors group/tel"
                >
                  <span className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>01 73 74 36 90</span>
                  </span>
                  <span className="text-[11.5px] font-semibold text-[#64748B] group-hover/tel:translate-x-1 transition-transform">Appel gratuit &rarr;</span>
                </a>
              </div>

            </div>

            {/* Photo caption */}
            <p className="mt-3 text-[12px] text-[#64748B] text-center lg:text-right font-normal">
              Accompagnement rigoureux et réponses transparentes par nos équipes WE MOVE
            </p>

          </div>

        </div>

      </div>
    </section>
  );
};
