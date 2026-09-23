/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useRouter, Link } from '../router';

export interface BreadcrumbCrumb {
  label: string;
  href?: string;
}

export const Breadcrumb: React.FC = () => {
  const { pathname } = useRouter();

  // If on the homepage, do not display the breadcrumb bar
  if (pathname === '/') {
    return null;
  }

  // Derive breadcrumbs trail based on the current pathname
  const getCrumbs = (): BreadcrumbCrumb[] => {
    switch (pathname) {
      case '/services/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Prestations & Services' },
        ];
      case '/demenagement-particuliers/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Prestations', href: '/services/' },
          { label: 'Déménagement de particuliers' },
        ];
      case '/demenagement-entreprises/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Prestations', href: '/services/' },
          { label: 'Transfert d’entreprises' },
        ];
      case '/stockage-garde-meubles/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Prestations', href: '/services/' },
          { label: 'Stockage & Garde-meubles' },
        ];
      case '/location-monte-meubles/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Prestations', href: '/services/' },
          { label: 'Location de monte-meubles' },
        ];
      case '/qui-sommes-nous/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Qui sommes-nous' },
        ];
      case '/volume/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Calculateur de volume' },
        ];
      case '/devis/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Demande de devis' },
        ];
      case '/contact/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Contact' },
        ];
      case '/mentions-legales/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Mentions légales' },
        ];
      case '/politique-confidentialite/':
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Politique de confidentialité' },
        ];
      default:
        return [
          { label: 'Accueil', href: '/' },
          { label: 'Page introuvable' },
        ];
    }
  };

  const crumbs = getCrumbs();

  // Schema.org BreadcrumbList structured data for search engines
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.label,
      item: crumb.href ? `https://wemove.fr${crumb.href}` : `https://wemove.fr${pathname}`,
    })),
  };

  return (
    <div className="bg-[#FAFAF8] border-b border-[#E6E8EB] w-full">
      {/* Schema.org microdata injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* Breadcrumb Navigation Trail */}
          <nav aria-label="Fil d'Ariane" className="flex-1 min-w-0">
            <ol className="flex items-center flex-wrap gap-1.5 sm:gap-2 text-[13px] text-[#59616C]">
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                const isFirst = index === 0;

                return (
                  <li key={index} className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                    {index > 0 && (
                      <svg
                        className="w-3 h-3 text-[#59616C]/40 shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}

                    {isLast || !crumb.href ? (
                      <span
                        aria-current="page"
                        className="font-medium text-[#20252B] truncate max-w-[240px] sm:max-w-none"
                      >
                        {crumb.label}
                      </span>
                    ) : (
                      <Link
                        href={crumb.href}
                        className="hover:text-[#0082CA] transition-colors flex items-center gap-1.5 group"
                      >
                        {isFirst && (
                          <svg
                            className="w-3.5 h-3.5 text-[#59616C] group-hover:text-[#0082CA] transition-colors"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={1.8}
                              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                            />
                          </svg>
                        )}
                        <span>{crumb.label}</span>
                      </Link>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>

          {/* Quick back or context link on desktop */}
          <div className="hidden md:flex items-center gap-3 text-[12.5px] text-[#59616C]">
            <Link
              href="/"
              className="text-[#59616C] hover:text-[#20252B] transition-colors"
            >
              ← Retour à l'accueil
            </Link>
            <span aria-hidden="true" className="text-[#E6E8EB]">|</span>
            <Link
              href="/devis/"
              className="text-[#0082CA] hover:text-[#006FA8] font-medium transition-colors"
            >
              Devis gratuit
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
};
