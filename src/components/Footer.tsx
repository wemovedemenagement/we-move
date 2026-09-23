/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';
import { Logo } from './Logo';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-[#FFFFFF] border-t border-[#E6E8EB] pt-16 pb-12 text-[#59616C]">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-14 pb-14 border-b border-[#E6E8EB]">
          
          {/* Brand & Editorial Column */}
          <div className="md:col-span-5 space-y-4">
            <Link href="/" className="inline-block group focus-visible:ring-2 focus-visible:ring-[#0082CA] rounded-xl">
              <Logo variant="horizontal" size="lg" />
            </Link>

            <p className="text-[14px] text-[#0082CA] font-semibold">
              « Déménager avec le sourire »
            </p>

            <p className="text-[14px] text-[#475569] leading-relaxed max-w-sm">
              Entreprise spécialisée dans le déménagement de particuliers, le transfert de bureaux, le stockage sécurisé en garde-meubles et la mise à disposition de monte-meubles à Paris et en Île-de-France.
            </p>

            <div className="pt-2 text-[13px] text-[#64748B] space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
                <span>Du lundi au samedi : 08h00 - 19h00</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#EE3E38]" />
                <span className="font-semibold text-[#111827]">Devis ferme et gratuit sous 24h</span>
              </div>
            </div>
          </div>

          {/* Services Column */}
          <div className="md:col-span-4 space-y-3">
            <div className="text-[13px] font-semibold text-[#111827] tracking-wider uppercase font-mono">
              Prestations
            </div>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link 
                  href="/demenagement-particuliers/" 
                  className="hover:text-[#0082CA] transition-colors"
                >
                  Déménagement de particuliers
                </Link>
              </li>
              <li>
                <Link 
                  href="/demenagement-entreprises/" 
                  className="hover:text-[#0082CA] transition-colors"
                >
                  Transfert d’entreprises & bureaux
                </Link>
              </li>
              <li>
                <Link 
                  href="/stockage-garde-meubles/" 
                  className="hover:text-[#0082CA] transition-colors"
                >
                  Stockage et garde-meubles
                </Link>
              </li>
              <li>
                <Link 
                  href="/location-monte-meubles/" 
                  className="hover:text-[#0082CA] transition-colors"
                >
                  Location de monte-meubles
                </Link>
              </li>
              <li className="pt-1">
                <Link 
                  href="/services/" 
                  className="text-[13px] font-medium text-[#0082CA] hover:underline inline-flex items-center gap-1"
                >
                  <span>Voir toutes les prestations</span>
                  <span>&rarr;</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Navigation & Outils Column */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-[13px] font-semibold text-[#111827] tracking-wider uppercase font-mono">
              Navigation & Outils
            </div>
            <ul className="space-y-2.5 text-[14px]">
              <li>
                <Link 
                  href="/qui-sommes-nous/" 
                  className="hover:text-[#0082CA] transition-colors"
                >
                  À propos de WE MOVE
                </Link>
              </li>
              <li>
                <Link 
                  href="/volume/" 
                  className="hover:text-[#0082CA] transition-colors"
                >
                  Calculateur de volume (m³)
                </Link>
              </li>
              <li>
                <Link 
                  href="/secteurs/" 
                  className="hover:text-[#0082CA] transition-colors"
                >
                  Secteurs d’intervention
                </Link>
              </li>
              <li>
                <Link 
                  href="/blog/" 
                  className="hover:text-[#0082CA] transition-colors"
                >
                  Conseils & Guides déménagement
                </Link>
              </li>
              <li>
                <Link 
                  href="/devis/" 
                  className="hover:text-[#0082CA] font-medium text-[#0082CA] transition-colors"
                >
                  Demande de devis en ligne
                </Link>
              </li>
              <li>
                <Link 
                  href="/contact/" 
                  className="hover:text-[#0082CA] transition-colors"
                >
                  Contact & Assistance
                </Link>
              </li>
              <li>
                <a
                  href="https://www.google.com/search?sca_esv=1b6fe3863ca969d6&rlz=1C1ORZA_frFR1104FR1106&sxsrf=APpeQnv4YFC7T2qmRScyt16JhsaG0y88Nw:1790156249155&q=WE+MOVE+DEMENAGEMENT&si=APenkKm7iecQ4G6P-TsbSMFKIQtv3EFIqRAFw-i8uEbk55Z-_0rxogtCdZhOQiWPmnrLqh8UVcM7dfcVhnqyPWpW8dVYX0drjGLS2msDubR0ql9uF0APImY%3D&uds=AJ5uw19ot_8pmnrWc3HjfIZM6VfDCHBDU-pp5774vSgrZfhvGr5vu7HS971r1wAiT8fMqNsirDH8IYie6c91b3PAd_52LjDjlsjSc0w0ceXprXoC9xkUp38&sa=X&ved=2ahUKEwix3cras4SXAxVsTqQEHbn_PBUQ3PALegQIGxAE&biw=1920&bih=911&dpr=1"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#0082CA] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Avis Google certifiés (4.8 ★ · 114 avis)</span>
                  <svg className="w-3 h-3 text-[#9CA3AF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar: Quiet Legal Notices */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[12.5px] text-[#59616C]">
          <div className="flex items-center gap-2">
            <span>© {new Date().getFullYear()} WE MOVE DÉMÉNAGEMENT. Tous droits réservés.</span>
          </div>

          <div className="flex items-center gap-6">
            <Link 
              href="/mentions-legales/" 
              className="hover:text-[#20252B] transition-colors"
            >
              Mentions légales
            </Link>
            <Link 
              href="/politique-confidentialite/" 
              className="hover:text-[#20252B] transition-colors"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
