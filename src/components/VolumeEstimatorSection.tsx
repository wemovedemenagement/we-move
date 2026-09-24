/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HOUSING_PRESETS } from '../data/content';
import { Link } from '../router';

interface VolumeEstimatorSectionProps {
  onOpenVolumeModal?: (initialVolume?: number) => void;
  onOpenQuoteWithVolume?: (volume: number) => void;
}

export const VolumeEstimatorSection: React.FC<VolumeEstimatorSectionProps> = ({
  onOpenVolumeModal,
  onOpenQuoteWithVolume,
}) => {
  const [selectedPresetIndex, setSelectedPresetIndex] = useState(1);
  const currentPreset = HOUSING_PRESETS[selectedPresetIndex];

  return (
    <section id="volume" className="relative py-20 sm:py-28 lg:py-32 bg-[#FAFAF8] border-b border-[#E2E8F0]/70 overflow-hidden">
      
      {/* Decorative ambient background radial lighting */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0082CA]/10 via-slate-100/30 to-transparent pointer-events-none blur-3xl -z-0" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-[1240px] mx-auto px-5 sm:px-8">
        
        {/* Main Sublimated Container Card */}
        <div className="bg-gradient-to-br from-white via-slate-50/90 to-sky-50/20 rounded-3xl border border-[#E2E8F0] shadow-md p-7 sm:p-12 lg:p-14 relative overflow-hidden group">
          {/* Ambient glow decoration inside card */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#0082CA]/5 rounded-full blur-3xl pointer-events-none -z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center relative z-10">
            
            {/* Left Column: Context & Intent */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Néo-Glassmorphic Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#0082CA]/25 text-[#0082CA] shadow-2xs font-mono text-[12px] font-semibold tracking-wide">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0082CA] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0082CA]"></span>
                </span>
                <span>Outil d'estimation · Précision & Simplicité</span>
              </div>
              
              {/* Main Headline */}
              <h2 className="text-[32px] sm:text-[42px] lg:text-[46px] font-bold text-[#0F172A] tracking-tight leading-[1.12] font-display [text-wrap:balance]">
                Une première idée du volume à{' '}
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-[#0082CA] via-[#0284C7] to-[#0369A1] bg-clip-text text-transparent">
                    déménager
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
              
              {/* Description */}
              <p className="text-[16.5px] sm:text-[17.5px] text-[#475569] leading-relaxed font-normal">
                Le cubage détermine directement la taille du véhicule mobilisé, le temps de chargement et le nombre de déménageurs requis pour l'opération.
              </p>

              {/* Disclaimer Note */}
              <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-[13px] leading-relaxed flex items-start gap-3 shadow-2xs">
                <svg className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>* Le résultat obtenu est une estimation indicative. Nos conseillers vérifient la liste définitive avec vous avant toute signature.</span>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <Link
                  href={`/volume/?initial=${currentPreset.volume}`}
                  className="inline-flex items-center justify-center gap-2.5 h-12 px-7 rounded-2xl bg-gradient-to-r from-[#0082CA] to-[#006FA8] text-white text-[14px] font-bold hover:from-[#0074B5] hover:to-[#005B8C] transition-all duration-300 shadow-md shadow-[#0082CA]/20 hover:shadow-lg hover:shadow-[#0082CA]/30"
                >
                  <span>Calculer mon volume en détail</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Quick Preset Reference */}
            <div className="lg:col-span-6 bg-white/90 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-[#E2E8F0] shadow-md">
              <div className="flex items-center justify-between mb-5">
                <span className="text-[14px] font-bold text-[#0F172A] font-display flex items-center gap-2">
                  <svg className="w-4.5 h-4.5 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Repère rapide par superficie
                </span>
                <span className="text-[12px] font-mono font-semibold px-3 py-1 rounded-full bg-[#EBF5FB] text-[#0082CA] border border-[#0082CA]/20">
                  Cubage moyen
                </span>
              </div>

              {/* Segmented Housing Selector */}
              <div className="space-y-3" role="radiogroup" aria-label="Sélectionnez un type de logement">
                {HOUSING_PRESETS.map((preset, index) => {
                  const isSelected = selectedPresetIndex === index;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedPresetIndex(index)}
                      className={`w-full text-left p-4 rounded-2xl border text-[14px] transition-all duration-300 flex items-center justify-between cursor-pointer group/preset ${
                        isSelected 
                          ? 'border-[#0082CA] bg-white shadow-md shadow-[#0082CA]/10 ring-2 ring-[#0082CA]/20' 
                          : 'border-slate-200/80 bg-white/70 hover:bg-white hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all ${
                          isSelected ? 'border-[#0082CA] bg-[#0082CA]' : 'border-slate-300 bg-white'
                        }`}>
                          {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                        </div>
                        <div>
                          <div className={`font-bold transition-colors ${isSelected ? 'text-[#0082CA]' : 'text-[#0F172A] group-hover/preset:text-[#0082CA]'}`}>
                            {preset.label}
                          </div>
                          <div className="text-[12.5px] text-[#64748B] mt-0.5">
                            {preset.description}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <span className={`text-[20px] font-bold font-mono tabular-nums ${isSelected ? 'text-[#0082CA]' : 'text-[#0F172A]'}`}>
                          ~{preset.volume}
                        </span>
                        <span className="text-xs font-mono text-[#64748B] ml-1">m³</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Calculated result summary & action */}
              <div className="mt-6 pt-5 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-[13.5px] text-[#475569] flex items-center gap-2">
                  <span>Volume sélectionné :</span>
                  <span className="font-bold text-[#0F172A] font-mono text-[15px] px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                    {currentPreset.volume} m³
                  </span>
                </div>
                <Link
                  href={`/devis/?volume=${currentPreset.volume}`}
                  className="inline-flex items-center gap-1.5 text-[13.5px] font-bold text-[#0082CA] hover:text-[#006FA8] transition-colors group/link"
                >
                  <span>Inclure dans mon devis</span>
                  <svg className="w-4 h-4 transition-transform group-hover/link:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </Link>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
