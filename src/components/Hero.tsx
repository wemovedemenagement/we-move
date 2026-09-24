/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Link, useRouter } from '../router';
import { AddressAutocompleteInput } from './AddressAutocompleteInput';

interface HeroProps {
  onOpenQuote?: () => void;
  onScrollToVolume?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onOpenQuote, onScrollToVolume }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { push } = useRouter();

  // Quick interactive widget state inside Hero card
  const [heroDeparture, setHeroDeparture] = useState('Paris 15e (75015)');
  const [heroArrival, setHeroArrival] = useState('');
  const [heroVolume, setHeroVolume] = useState<number>(25);

  const handleQuickEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    push(`/devis/?volume=${heroVolume}&dep=${encodeURIComponent(heroDeparture)}&arr=${encodeURIComponent(heroArrival)}`);
  };

  return (
    <section className="relative w-full overflow-hidden bg-white text-[#0F172A] border-b border-[#E2E8F0] min-h-[640px] sm:min-h-[680px] lg:min-h-[720px] flex items-center">
      
      {/* FULL-WIDTH BACKGROUND IMAGE */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden">
        <img
          src="/images/we-move-demenagement-paris-hero.webp"
          alt="WE MOVE Déménagement Paris et Île-de-France"
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover object-center transition-opacity duration-1000 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
        />
        
        {/* Luminous Light Overlay (Gradient from bright white on left to semi-transparent white on right) */}
        <div 
          className="absolute inset-0 bg-gradient-to-r from-white via-white/95 to-white/40 lg:via-white/90 lg:to-white/30" 
          aria-hidden="true"
        />
        {/* Vertical Top-to-Bottom Soft Glow Gradient */}
        <div 
          className="absolute inset-0 bg-gradient-to-b from-[#F0F9FF]/80 via-transparent to-white/90" 
          aria-hidden="true"
        />
        {/* Ambient Subtle Accent Glow */}
        <div 
          className="absolute -top-24 left-1/4 w-[600px] h-[600px] bg-[#0082CA]/10 rounded-full blur-[140px] pointer-events-none"
          aria-hidden="true"
        />
      </div>

      {/* Subtle Grid Accent Pattern Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#0082ca06_1px,transparent_1px),linear-gradient(to_bottom,#0082ca06_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none opacity-60 z-0"
        aria-hidden="true"
      />

      {/* ================= HERO CONTENT CONTAINER (2 COLUMNS) ================= */}
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8 relative z-10 w-full py-12 sm:py-16 lg:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: EDITORIAL & BRANDING */}
          <div className="lg:col-span-7 flex flex-col justify-center space-y-6">
            
            {/* GOOGLE TRUST BADGE & LIVE STATUS */}
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="#avis"
                className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-sm hover:border-[#0082CA] hover:shadow-md transition-all cursor-pointer"
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

                <div className="flex items-center gap-1.5 text-[13px]">
                  <span className="font-extrabold text-[#0F172A] font-mono">4,8</span>
                  <div className="flex items-center text-[#FBBC05]">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-[#94A3B8] font-medium hidden xs:inline">·</span>
                  <span className="text-[#334155] font-semibold group-hover:text-[#0082CA] transition-colors">
                    114 avis vérifiés
                  </span>
                </div>
              </a>

              {/* Status Indicator Pill */}
              <div className="inline-flex items-center gap-2 text-[12.5px] font-mono font-medium text-[#059669] bg-[#ECFDF5]/90 backdrop-blur-md border border-[#A7F3D0] px-3.5 py-1.5 rounded-full shadow-2xs">
                <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse shadow-sm shadow-[#10B981]" />
                <span>Paris & Île-de-France · France Entière</span>
              </div>
            </div>

            {/* Signature Kicker */}
            <div className="text-[13px] sm:text-[14px] font-bold tracking-wider uppercase text-[#0082CA] flex items-center gap-2 font-display">
              <span className="w-8 h-[2.5px] bg-[#0082CA] rounded-full" />
              <span>Déménager avec le sourire · Service Premium</span>
            </div>

            {/* Main Editorial Headline */}
            <h1 className="text-[40px] sm:text-[56px] lg:text-[64px] font-extrabold text-[#0F172A] leading-[1.08] tracking-tight [text-wrap:balance] font-display">
              Votre déménagement,<br className="hidden sm:inline" />{' '}
              <span className="bg-gradient-to-r from-[#0082CA] via-[#006FA8] to-[#00537A] bg-clip-text text-transparent">
                l’esprit tranquille.
              </span>
            </h1>

            {/* Introduction Copy */}
            <p className="text-[17.5px] sm:text-[19.5px] text-[#334155] leading-[1.65] max-w-[620px] font-normal">
              Particuliers, entreprises, garde-meubles ou monte-meubles : nos déménageurs expérimentés prennent soin de vos biens avec rigueur, ponctualité et garantie zéro frais cachés.
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
              <Link
                href="/devis/"
                onClick={onOpenQuote}
                className="inline-flex items-center justify-center gap-2.5 h-[56px] px-8 rounded-2xl bg-gradient-to-r from-[#0082CA] to-[#00537A] hover:from-[#0070AE] hover:to-[#004263] text-white text-[15.5px] font-bold active:scale-[0.99] transition-all shadow-xl shadow-[#0082CA]/25 focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0082CA] cursor-pointer group"
              >
                <span>Demander un devis gratuit</span>
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </Link>

              <Link
                href="/volume/"
                onClick={onScrollToVolume}
                className="inline-flex items-center justify-center gap-2.5 h-[56px] px-6 rounded-2xl bg-white/90 backdrop-blur-md border border-[#CBD5E1] hover:border-[#0082CA] hover:bg-white text-[15.5px] font-bold text-[#0F172A] transition-all focus-visible:ring-2 focus-visible:ring-[#0082CA] cursor-pointer shadow-xs"
              >
                <svg className="w-5 h-5 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span>Calculateur m³</span>
              </Link>
            </div>

            {/* Reassurance Row Pills */}
            <div className="pt-3 flex flex-wrap items-center gap-2.5 text-[13px] text-[#334155]">
              <span className="inline-flex items-center gap-2 font-semibold px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-xs">
                <svg className="w-4 h-4 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                Devis ferme sous 24h
              </span>
              <span className="inline-flex items-center gap-2 font-semibold px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-xs">
                <svg className="w-4 h-4 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                Assurance transport incluse
              </span>
              <span className="inline-flex items-center gap-2 font-semibold px-3.5 py-2 rounded-xl bg-white/90 backdrop-blur-md border border-[#E2E8F0] shadow-xs">
                <svg className="w-4 h-4 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Équipes salariées WE MOVE
              </span>
            </div>

          </div>

          {/* RIGHT COLUMN: ELEGANT FLOATING QUICK ESTIMATE WIDGET */}
          <div className="lg:col-span-5 flex flex-col justify-center">
            
            {/* Ultra-Clean & Luminous Quick Estimate Card */}
            <div className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-[#E2E8F0] shadow-2xl shadow-slate-900/10 relative overflow-hidden ring-1 ring-black/5">
              
              {/* Header Badge */}
              <div className="flex items-center justify-between gap-2 mb-6">
                <div>
                  <span className="text-[11.5px] font-mono font-bold uppercase tracking-wider text-[#0082CA]">
                    Calculateur Express
                  </span>
                  <h3 className="text-[20px] font-bold text-[#0F172A] font-display mt-0.5">
                    Estimer mon tarif en 2 min
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-[#ECFDF5] border border-[#A7F3D0] text-[#059669] text-[11px] font-mono font-bold flex items-center gap-1.5 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
                  <span>Devis instantané</span>
                </div>
              </div>

              <form onSubmit={handleQuickEstimate} className="space-y-4">
                {/* Departure City with Autocomplete */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#475569] mb-1">
                    Ville de départ (ou CP)
                  </label>
                  <AddressAutocompleteInput
                    value={heroDeparture}
                    onChange={setHeroDeparture}
                    placeholder="ex: Paris 15e, Lyon..."
                    iconColor="#0082CA"
                  />
                </div>

                {/* Arrival City with Autocomplete */}
                <div>
                  <label className="block text-[12px] font-semibold text-[#475569] mb-1">
                    Ville d’arrivée (ou CP)
                  </label>
                  <AddressAutocompleteInput
                    value={heroArrival}
                    onChange={setHeroArrival}
                    placeholder="ex: Boulogne-Billancourt, Bordeaux..."
                    iconColor="#10B981"
                  />
                </div>

                {/* Quick Volume Preset Pills */}
                <div>
                  <div className="flex items-center justify-between text-[12px] font-semibold text-[#475569] mb-1.5">
                    <span>Volume estimé :</span>
                    <span className="font-mono font-bold text-[#0082CA] text-[13px]">{heroVolume} m³</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { vol: 15, label: 'Studio (15m³)' },
                      { vol: 25, label: 'T2/T3 (25m³)' },
                      { vol: 45, label: 'Maison (45m³)' },
                    ].map((preset) => (
                      <button
                        key={preset.vol}
                        type="button"
                        onClick={() => setHeroVolume(preset.vol)}
                        className={`py-2 px-2 rounded-xl text-[11.5px] font-semibold transition-all border cursor-pointer text-center ${
                          heroVolume === preset.vol
                            ? 'bg-[#0082CA] border-[#0082CA] text-white shadow-sm font-bold'
                            : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569] hover:bg-white hover:border-[#CBD5E1]'
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full h-12.5 rounded-xl bg-gradient-to-r from-[#0082CA] to-[#00537A] hover:from-[#0070AE] hover:to-[#004263] text-white text-[14.5px] font-bold transition-all shadow-lg shadow-[#0082CA]/25 flex items-center justify-center gap-2 cursor-pointer group"
                  >
                    <span>Calculer mon tarif sur-mesure</span>
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </button>
                </div>
              </form>

              {/* Guarantees Footer inside Card */}
              <div className="mt-4 pt-3.5 border-t border-[#F1F5F9] flex items-center justify-between text-[11.5px] text-[#64748B]">
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-[#10B981]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                  Sans engagement
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-3.5 h-3.5 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Réponse en 24h
                </span>
              </div>

            </div>

          </div>

        </div>
      </div>
    </section>
  );
};


