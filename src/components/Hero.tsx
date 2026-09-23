/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link } from '../router';
import heroImage from '../assets/images/hero_moving_service_1790153159353.jpg';

interface HeroProps {
  onOpenQuote?: () => void;
  onScrollToVolume?: () => void;
}

export const Hero: React.FC<HeroProps> = () => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-[#FBFBFA] via-white to-[#FAFAF8] border-b border-[#E6E8EB]/70 pt-8 pb-16 sm:pt-14 sm:pb-20 lg:pt-16 lg:pb-24">
      {/* Subtle architectural background accents */}
      <div
        className="absolute top-0 right-0 -z-10 w-[640px] h-[640px] rounded-full bg-[#0082CA]/[0.03] blur-3xl pointer-events-none"
        aria-hidden="true"
      />
      <div
        className="absolute -bottom-24 left-1/4 -z-10 w-[500px] h-[500px] rounded-full bg-[#FBBC05]/[0.025] blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* ================= LEFT COLUMN: EDITORIAL CONTENT & GOOGLE TRUST BADGE ================= */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6 sm:space-y-7">
            
            {/* GOOGLE TRUST BADGE (Top of Hero, interactive, certified) */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#avis"
                className="group inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-[#E2E8F0] shadow-2xs hover:border-[#1A73E8]/60 hover:shadow-xs transition-all cursor-pointer"
                title="Consulter les 114 avis Google vérifiés de WE MOVE DEMENAGEMENT"
              >
                {/* Official Google 'G' Icon */}
                <div className="w-5 h-5 flex items-center justify-center shrink-0">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                </div>

                <div className="flex items-center gap-1.5 text-[12.5px]">
                  <span className="font-semibold text-[#111827] font-mono">4,8</span>
                  <div className="flex items-center text-[#FBBC05]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[#64748B] font-medium hidden xs:inline">·</span>
                  <span className="text-[#334155] font-medium group-hover:text-[#1A73E8] transition-colors">
                    114 avis vérifiés
                  </span>
                  <svg className="w-3.5 h-3.5 text-[#94A3B8] group-hover:text-[#1A73E8] transition-colors ml-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </a>

              {/* Geographical & Legal Trust Indicator */}
              <div className="hidden sm:flex items-center gap-1.5 text-[12px] font-mono text-[#64748B]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
                <span>Paris 15ᵉ · Île-de-France & National</span>
              </div>
            </div>

            {/* Signature historical brand kicker */}
            <div className="text-[12.5px] sm:text-[13px] font-semibold tracking-wider uppercase text-[#0082CA] flex items-center gap-2">
              <span className="w-5 h-[1.5px] bg-[#0082CA]" />
              <span>Déménager avec le sourire · Depuis Paris</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-[38px] sm:text-[50px] lg:text-[58px] font-bold text-[#111827] leading-[1.12] tracking-tight [text-wrap:balance]">
              Votre déménagement,<br className="hidden sm:inline" />{' '}
              <span className="relative inline-block text-[#0082CA]">
                l’esprit tranquille.
                <svg
                  className="absolute left-0 -bottom-1 w-full h-2 text-[#0082CA]/25 -z-10"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path d="M0,10 Q50,0 100,10" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                </svg>
              </span>
            </h1>

            {/* Introduction Copy with crisp typographic hierarchy */}
            <p className="text-[16.5px] sm:text-[18.5px] text-[#475569] leading-[1.65] max-w-[580px]">
              Particuliers, entreprises, garde-meubles ou monte-meubles : nos déménageurs professionnels prennent soin de votre mobilier avec rigueur, ponctualité et transparence tarifaire.
            </p>

            {/* Premium Action Group */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <Link
                href="/devis/"
                className="inline-flex items-center justify-center gap-2.5 h-[52px] px-8 rounded-xl bg-[#0082CA] text-white text-[15px] font-semibold hover:bg-[#006FA8] active:scale-[0.99] transition-all shadow-md shadow-[#0082CA]/20 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0082CA] cursor-pointer group"
              >
                <span>Demander un devis gratuit</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href="/volume/"
                className="inline-flex items-center justify-center gap-2.5 h-[52px] px-6 rounded-xl bg-white border border-[#CBD5E1] text-[15px] font-medium text-[#1E293B] hover:border-[#0082CA] hover:text-[#0082CA] hover:bg-[#F8FAFC] transition-all focus-visible:ring-2 focus-visible:ring-[#0082CA] cursor-pointer shadow-2xs"
              >
                <svg className="w-4 h-4 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Calculateur de volume (m³)</span>
              </Link>

              {/* Direct Call Quick Reassurance */}
              <a
                href="tel:0173743690"
                className="inline-flex sm:hidden items-center justify-center gap-2 h-11 text-[13.5px] font-medium text-[#475569] hover:text-[#0082CA]"
              >
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span>Conseiller en direct : <strong>01 73 74 36 90</strong></span>
              </a>
            </div>

            {/* Quiet baseline trust elements without candy pills */}
            <div className="pt-3 border-t border-[#E2E8F0]/80 flex flex-wrap items-center gap-y-2 gap-x-5 text-[12.5px] text-[#475569]">
              <span className="flex items-center gap-1.5 font-medium text-[#1E293B]">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Devis ferme sous 24h
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Assurance transport incluse
              </span>
              <span aria-hidden="true" className="text-[#CBD5E1]">·</span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Équipes salariées expérimentées
              </span>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: REFINED PHOTOGRAPHY & FLOATING PROOF ================= */}
          <div className="lg:col-span-5 w-full relative">
            
            {/* Visual Frame */}
            <div className="relative rounded-2xl overflow-hidden bg-white border border-[#E2E8F0] shadow-xl shadow-slate-900/5 aspect-[4/3] sm:aspect-[14/11] lg:aspect-[4/3]">
              
              {!imageError ? (
                <img
                  src={heroImage}
                  alt="Déménageurs professionnels WE MOVE préparant le transport soigneux de mobilier dans un appartement"
                  referrerPolicy="no-referrer"
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageError(true)}
                  className={`w-full h-full object-cover transition-opacity duration-300 ${
                    imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-[1.02]'
                  }`}
                />
              ) : null}

              {/* Graceful Fallback Container if image doesn't render */}
              {(imageError || !imageLoaded) && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center bg-[#FAFAF8] text-[#59616C]">
                  <div className="w-12 h-12 mb-3 rounded-full bg-[#E6E8EB]/50 flex items-center justify-center text-[#0082CA]">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-[#20252B]">WE MOVE DÉMÉNAGEMENT</span>
                  <span className="text-xs mt-1 text-[#59616C]">Protection soignée du mobilier & transport sécurisé</span>
                </div>
              )}

              {/* Top-Right Floating Live Badge: Intervention 7j/7 */}
              <div className="absolute top-3.5 right-3.5 bg-white/95 backdrop-blur-md border border-white/60 px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[11.5px] font-semibold text-[#0F172A] tracking-tight">
                  Interventions 7j/7
                </span>
              </div>
            </div>

            {/* Subtle photographic caption */}
            <p className="mt-2.5 text-[12px] text-[#64748B] text-right font-normal">
              Protection méticuleuse du mobilier & transport sécurisé WE MOVE
            </p>
          </div>

        </div>
      </div>
    </section>
  );
};
