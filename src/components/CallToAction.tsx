/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';
import { Logo } from './Logo';

interface CallToActionProps {
  onOpenQuote?: () => void;
}

export const CallToAction: React.FC<CallToActionProps> = () => {
  return (
    <section id="contact" className="relative py-24 sm:py-32 bg-[#FAFAF8] border-b border-[#E2E8F0]/80 overflow-hidden">
      {/* Decorative ambient background radial lighting */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0082CA]/10 via-slate-100/30 to-transparent pointer-events-none blur-3xl -z-0" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Main Sublimated Luminous Dark Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-[#0B132B] via-[#0F172A] to-[#1E293B] text-white p-8 sm:p-14 lg:p-16 overflow-hidden shadow-2xl border border-white/15 group">
          
          {/* Accent top gradient glow line on hover */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0082CA] via-sky-400 to-[#10B981] opacity-60 group-hover:opacity-100 transition-opacity duration-500 z-20" />

          {/* Luminous ambient background radial blobs */}
          <div
            className="absolute top-0 right-0 w-96 h-96 bg-[#0082CA]/30 rounded-full blur-[120px] pointer-events-none -z-0"
            aria-hidden="true"
          />
          <div
            className="absolute bottom-0 left-0 w-80 h-80 bg-[#10B981]/20 rounded-full blur-[120px] pointer-events-none -z-0"
            aria-hidden="true"
          />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            
            {/* Logo Mark Frame */}
            <div className="flex justify-center">
              <div className="p-3.5 bg-white/10 backdrop-blur-2xl rounded-2xl border border-white/20 shadow-xl transition-transform duration-300 hover:scale-105">
                <Logo variant="mark" size="md" />
              </div>
            </div>

            {/* Néo-Glassmorphic Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[#38BDF8] shadow-sm font-mono text-[12px] font-semibold tracking-wide">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#10B981]"></span>
              </span>
              <span>Votre projet avec WE MOVE</span>
            </div>

            {/* Headline */}
            <h2 className="text-[36px] sm:text-[48px] lg:text-[54px] font-extrabold text-white tracking-tight leading-[1.10] font-display [text-wrap:balance]">
              Parlons de votre prochain{' '}
              <span className="bg-gradient-to-r from-white via-slate-100 to-[#38BDF8] bg-clip-text text-transparent">
                déménagement
              </span>
              .
            </h2>

            {/* Description */}
            <p className="text-[17px] sm:text-[19px] text-slate-300 leading-relaxed max-w-xl mx-auto font-normal">
              Décrivez-nous simplement votre projet : nous étudions vos contraintes d'accès, votre volume et votre calendrier pour vous transmettre une proposition gratuite et sans engagement.
            </p>

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/devis/"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-13 px-8 rounded-2xl bg-gradient-to-r from-[#0082CA] to-[#00537A] text-white text-[15px] font-bold hover:from-[#0074B5] hover:to-[#004263] transition-all duration-300 shadow-xl shadow-[#0082CA]/40 hover:shadow-2xl hover:shadow-[#0082CA]/50 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0082CA] cursor-pointer group"
              >
                <span>Demander un devis sous 24h</span>
                <svg className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <a
                href="tel:0173743690"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 h-13 px-7 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/25 text-white text-[15px] font-semibold backdrop-blur-2xl transition-all duration-300 hover:scale-[1.02] focus-visible:ring-2 focus-visible:ring-[#38BDF8]"
              >
                <svg className="w-4.5 h-4.5 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>01 73 74 36 90</span>
              </a>
            </div>

            {/* Reassurance Footer Pills */}
            <div className="pt-6 text-[13.5px] text-slate-300 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-semibold">
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Étude gratuite et sans engagement
              </span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#38BDF8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Conseiller dédié à Paris
              </span>
              <span aria-hidden="true" className="text-white/20">·</span>
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#FBBC05]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Réponse ferme sous 24h
              </span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
