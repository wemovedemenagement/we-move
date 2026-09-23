/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { Link, useRouter } from '../router';
import { Logo } from './Logo';

interface ServiceItem {
  title: string;
  href: string;
  description: string;
  badge?: string;
  badgeColor?: string;
  iconBg: string;
  iconColor: string;
  icon: React.ReactNode;
}

const SERVICES_LIST: ServiceItem[] = [
  {
    title: 'Déménagement de particuliers',
    href: '/demenagement-particuliers/',
    description: 'Studios, appartements et maisons. Formules sur-mesure de l’économique au tout inclus.',
    badge: 'Le plus demandé',
    badgeColor: 'text-[#EE3E38] bg-[#FEF2F2]',
    iconBg: 'bg-[#EBF5FB]',
    iconColor: 'text-[#0082CA]',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: 'Transfert d’entreprises',
    href: '/demenagement-entreprises/',
    description: 'Bureaux, parcs informatiques, open-spaces et archives. Zéro interruption d’activité.',
    badge: 'Pro & B2B',
    badgeColor: 'text-[#0082CA] bg-[#EBF5FB]',
    iconBg: 'bg-[#EFF6FF]',
    iconColor: 'text-[#0082CA]',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  {
    title: 'Stockage & Garde-meubles',
    href: '/stockage-garde-meubles/',
    description: 'Box sécurisés individuels, télésurveillés 24/7, tempérés et ventilés à Paris & Île-de-France.',
    iconBg: 'bg-[#ECFDF5]',
    iconColor: 'text-[#059669]',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'Location de monte-meubles',
    href: '/location-monte-meubles/',
    description: 'Monte-charges jusqu’au 10ᵉ étage avec technicien habilité pour passages difficiles.',
    badge: 'Avec opérateur',
    badgeColor: 'text-[#D97706] bg-[#FFFBEB]',
    iconBg: 'bg-[#FFFBEB]',
    iconColor: 'text-[#D97706]',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
      </svg>
    ),
  },
];

export const Header: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesMenuOpen, setServicesMenuOpen] = useState(false);
  const { pathname } = useRouter();

  const menuTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navContainerRef = useRef<HTMLDivElement | null>(null);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setServicesMenuOpen(false);
  }, [pathname]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        setServicesMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle click outside to close mega menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (navContainerRef.current && !navContainerRef.current.contains(e.target as Node)) {
        setServicesMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleMouseEnter = () => {
    if (menuTimeoutRef.current) {
      clearTimeout(menuTimeoutRef.current);
    }
    setServicesMenuOpen(true);
  };

  const handleMouseLeave = () => {
    menuTimeoutRef.current = setTimeout(() => {
      setServicesMenuOpen(false);
    }, 220); // 220ms grace period for smooth cursor transit
  };

  const isServicesActive =
    pathname.startsWith('/services') ||
    pathname.startsWith('/demenagement-') ||
    pathname.startsWith('/stockage-') ||
    pathname.startsWith('/location-');

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-xl border-b border-[#E5E7EB] shadow-xs transition-all">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-8 h-[74px] sm:h-[80px] flex items-center justify-between">
        
        {/* Official Brand Logo */}
        <Link
          href="/"
          className="group flex items-center focus-visible:ring-2 focus-visible:ring-[#0082CA] rounded-xl py-1 transition-transform group-hover:scale-[1.01]"
          aria-label="WE MOVE DÉMÉNAGEMENT — Accueil"
        >
          <Logo variant="horizontal" size="md" />
        </Link>

        {/* Desktop Navigation Zone: À propos · Services (Mega Menu) · Secteurs · Blog */}
        <nav
          ref={navContainerRef}
          className="hidden lg:flex items-center gap-1 xl:gap-2 text-[14.5px] font-medium text-[#475569]"
          aria-label="Navigation principale"
        >
          {/* 1. À propos */}
          <Link
            href="/qui-sommes-nous/"
            className="px-3.5 py-2 rounded-lg hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors"
            activeClassName="text-[#0082CA] font-semibold bg-[#EBF5FB]"
          >
            À propos
          </Link>

          {/* 2. Services with Interactive Mega Menu */}
          <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              type="button"
              onClick={() => setServicesMenuOpen(!servicesMenuOpen)}
              className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition-colors cursor-pointer ${
                servicesMenuOpen || isServicesActive
                  ? 'text-[#0082CA] bg-[#EBF5FB] font-semibold'
                  : 'hover:text-[#111827] hover:bg-[#F8FAFC]'
              }`}
              aria-expanded={servicesMenuOpen}
              aria-haspopup="true"
            >
              <span>Services</span>
              <svg
                className={`w-4 h-4 text-[#94A3B8] transition-transform duration-200 ${
                  servicesMenuOpen ? 'rotate-180 text-[#0082CA]' : ''
                }`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* ================= MEGA MENU FLYOUT ================= */}
            {servicesMenuOpen && (
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[720px] z-50 transition-all animate-in fade-in slide-in-from-top-2 duration-150"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl shadow-slate-900/10 overflow-hidden p-6">
                  
                  {/* Header line of the Mega Menu */}
                  <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#F1F5F9]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#0082CA]" />
                      <span className="text-[12px] font-mono font-semibold uppercase tracking-wider text-[#64748B]">
                        Nos 4 expertises certifiées
                      </span>
                    </div>
                    <Link
                      href="/services/"
                      className="text-[12.5px] font-medium text-[#0082CA] hover:underline flex items-center gap-1"
                      onClick={() => setServicesMenuOpen(false)}
                    >
                      <span>Vue d'ensemble de l’offre</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>

                  {/* 2x2 Services Grid with custom high-end icons */}
                  <div className="grid grid-cols-2 gap-3.5">
                    {SERVICES_LIST.map((srv) => (
                      <Link
                        key={srv.href}
                        href={srv.href}
                        onClick={() => setServicesMenuOpen(false)}
                        className="group flex items-start gap-3.5 p-3.5 rounded-xl border border-transparent hover:border-[#E2E8F0] hover:bg-[#F8FAFC] transition-all"
                      >
                        {/* Service Icon Box */}
                        <div
                          className={`w-11 h-11 rounded-xl ${srv.iconBg} ${srv.iconColor} flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 shadow-2xs`}
                        >
                          {srv.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[14px] font-semibold text-[#111827] group-hover:text-[#0082CA] transition-colors leading-snug">
                              {srv.title}
                            </h3>
                            {srv.badge && (
                              <span
                                className={`text-[10px] font-medium font-mono px-1.5 py-0.5 rounded ${
                                  srv.badgeColor || 'text-[#0082CA] bg-[#EBF5FB]'
                                }`}
                              >
                                {srv.badge}
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-[12px] text-[#64748B] leading-relaxed line-clamp-2">
                            {srv.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Bottom Utility Card inside Mega Menu */}
                  <div className="mt-5 pt-4 border-t border-[#F1F5F9] bg-[#FAFAF8] -mx-6 -mb-6 px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0082CA] flex items-center justify-center shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-[#111827]">
                          Vous hésitez sur le cubage de votre déménagement ?
                        </div>
                        <div className="text-[11.5px] text-[#64748B]">
                          Utilisez notre calculateur pièce par pièce gratuit
                        </div>
                      </div>
                    </div>

                    <Link
                      href="/volume/"
                      onClick={() => setServicesMenuOpen(false)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white border border-[#CBD5E1] text-[12px] font-semibold text-[#111827] hover:border-[#0082CA] hover:text-[#0082CA] transition-colors shadow-2xs"
                    >
                      <span>Estimer mon volume</span>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </Link>
                  </div>

                </div>
              </div>
            )}
          </div>

          {/* 3. Secteurs */}
          <Link
            href="/secteurs/"
            className="px-3.5 py-2 rounded-lg hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors"
            activeClassName="text-[#0082CA] font-semibold bg-[#EBF5FB]"
          >
            Secteurs
          </Link>

          {/* 4. Blog */}
          <Link
            href="/blog/"
            className="px-3.5 py-2 rounded-lg hover:text-[#111827] hover:bg-[#F8FAFC] transition-colors"
            activeClassName="text-[#0082CA] font-semibold bg-[#EBF5FB]"
          >
            Blog
          </Link>
        </nav>

        {/* Action Zone: Phone call & Primary Quote CTA */}
        <div className="flex items-center gap-3 sm:gap-4">
          
          {/* Direct Phone button */}
          <a
            href="tel:0173743690"
            className="inline-flex items-center gap-2 h-11 px-3 sm:px-3.5 rounded-xl text-[13.5px] sm:text-[14px] font-semibold text-[#1E293B] hover:text-[#0082CA] hover:bg-[#F8FAFC] transition-colors"
            title="Appeler WE MOVE DÉMÉNAGEMENT"
          >
            <div className="w-8 h-8 rounded-lg bg-[#EBF5FB] text-[#0082CA] flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </div>
            <span className="font-mono hidden sm:inline">01 73 74 36 90</span>
          </a>

          {/* Primary Devis Button in Brand Blue */}
          <Link
            href="/devis/"
            className="inline-flex items-center justify-center gap-2 h-11 px-5 sm:px-6 rounded-xl bg-[#0082CA] text-white text-[14px] font-semibold hover:bg-[#006FA8] active:scale-[0.99] transition-all shadow-xs hover:shadow-md focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0082CA] whitespace-nowrap cursor-pointer"
          >
            <span>Demander un devis</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl text-[#111827] hover:bg-[#F3F4F6] focus-visible:ring-2 focus-visible:ring-[#0082CA] cursor-pointer"
            aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

      </div>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 top-[74px] sm:top-[80px] z-50 bg-black/40 backdrop-blur-xs lg:hidden overflow-y-auto"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-full bg-white border-b border-[#E5E7EB] px-5 py-6 shadow-2xl space-y-6 max-h-[calc(100vh-80px)] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label="Menu de navigation mobile"
          >
            
            {/* Quick Contact & Brand Header in Drawer */}
            <div className="flex items-center justify-between p-3.5 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0] text-[13px]">
              <span className="text-[#64748B]">Conseiller en ligne</span>
              <a
                href="tel:0173743690"
                className="font-semibold text-[#0082CA] flex items-center gap-1.5"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <span>01 73 74 36 90</span>
              </a>
            </div>

            {/* 1. À propos */}
            <div>
              <Link
                href="/qui-sommes-nous/"
                className="block py-2.5 px-3 rounded-lg text-[15px] font-semibold text-[#111827] hover:bg-[#F8FAFC]"
                activeClassName="text-[#0082CA] bg-[#EBF5FB]"
              >
                À propos
              </Link>
            </div>

            {/* 2. Services with Icons Section */}
            <div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-[#94A3B8] font-semibold mb-2.5 px-3">
                Nos Services
              </div>
              <div className="space-y-1.5">
                {SERVICES_LIST.map((srv) => (
                  <Link
                    key={srv.href}
                    href={srv.href}
                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#F8FAFC] active:bg-[#F1F5F9] transition-colors border border-transparent hover:border-[#E2E8F0]"
                  >
                    <div className={`w-9 h-9 rounded-lg ${srv.iconBg} ${srv.iconColor} flex items-center justify-center shrink-0`}>
                      {srv.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13.5px] font-semibold text-[#111827]">
                        {srv.title}
                      </div>
                      <div className="text-[11px] text-[#64748B] truncate">
                        {srv.description}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Secteurs & 4. Blog */}
            <div className="pt-2 border-t border-[#F1F5F9] space-y-1">
              <Link
                href="/secteurs/"
                className="block py-2.5 px-3 rounded-lg text-[15px] font-semibold text-[#111827] hover:bg-[#F8FAFC]"
                activeClassName="text-[#0082CA] bg-[#EBF5FB]"
              >
                Secteurs d’intervention
              </Link>

              <Link
                href="/blog/"
                className="block py-2.5 px-3 rounded-lg text-[15px] font-semibold text-[#111827] hover:bg-[#F8FAFC]"
                activeClassName="text-[#0082CA] font-semibold bg-[#EBF5FB]"
              >
                Blog & Conseils
              </Link>
            </div>

            {/* Mobile Devis CTA */}
            <div className="pt-3">
              <Link
                href="/devis/"
                className="w-full h-12 flex items-center justify-center gap-2 rounded-xl bg-[#0082CA] text-white text-[14.5px] font-semibold hover:bg-[#006FA8] shadow-sm"
              >
                <span>Demander un devis</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>
            </div>

          </div>
        </div>
      )}

    </header>
  );
};
