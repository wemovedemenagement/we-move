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
    <section id="contact" className="py-20 sm:py-28 bg-[#FAFAF8] border-b border-[#E6E8EB]/80">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <Logo variant="mark" size="md" />
          </div>

          <div className="text-[13px] font-semibold text-[#0082CA] tracking-wider uppercase font-mono flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#EE3E38]" />
            <span>Votre projet avec WE MOVE</span>
          </div>

          <h2 className="text-[32px] sm:text-[42px] font-semibold text-[#20252B] tracking-tight leading-[1.2] [text-wrap:balance]">
            Parlons de votre prochain déménagement.
          </h2>

          <p className="text-[16px] sm:text-[18px] text-[#59616C] leading-relaxed max-w-xl mx-auto">
            Décrivez-nous simplement votre projet : nous étudions vos contraintes d'accès, votre volume et votre calendrier pour vous transmettre une proposition adaptée.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/devis/"
              className="inline-flex items-center justify-center h-12 px-8 rounded-md bg-[#0082CA] text-white text-[15px] font-medium hover:bg-[#006FA8] active:bg-[#00537A] transition-colors shadow-xs focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0082CA] cursor-pointer"
            >
              Demander un devis
            </Link>

            <Link
              href="/contact/"
              className="inline-flex items-center justify-center h-12 px-6 rounded-md bg-white border border-[#E6E8EB] text-[#20252B] text-[15px] font-medium hover:bg-[#FAFAF8] hover:border-[#20252B]/20 transition-colors focus-visible:ring-2 focus-visible:ring-[#0082CA]"
            >
              Écrire à un conseiller
            </Link>
          </div>

          <div className="pt-6 text-[13px] text-[#59616C]/80 flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <span>Étude gratuite et sans engagement</span>
            <span aria-hidden="true" className="text-[#E6E8EB]">·</span>
            <span>Conseiller dédié</span>
            <span aria-hidden="true" className="text-[#E6E8EB]">·</span>
            <span>Réponse sous 24 à 48 heures ouvrées</span>
          </div>
        </div>

      </div>
    </section>
  );
};
