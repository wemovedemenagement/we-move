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
    <section id="volume" className="py-16 sm:py-24 bg-white border-b border-[#E6E8EB]/60">
      <div className="max-w-[1240px] mx-auto px-5 sm:px-8">
        
        <div className="bg-[#FAFAF8] rounded-xl border border-[#E6E8EB] p-8 sm:p-12 lg:p-14">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            
            {/* Left Column: Context & Intent */}
            <div className="lg:col-span-6 space-y-4">
              <span className="text-[13px] font-semibold text-[#0082CA] tracking-wider uppercase">
                Outil d'estimation
              </span>
              
              <h2 className="text-[28px] sm:text-[34px] font-semibold text-[#20252B] tracking-tight leading-snug [text-wrap:balance]">
                Une première idée du volume à déménager.
              </h2>
              
              <p className="text-[15px] sm:text-[16px] text-[#59616C] leading-relaxed">
                Le cubage détermine directement la taille du véhicule mobilisé, le temps de chargement et le nombre de déménageurs requis pour l'opération.
              </p>

              <p className="text-[13.5px] text-[#59616C]/80 italic">
                * Le résultat obtenu est une estimation indicative. Nos conseillers vérifient la liste définitive avec vous avant toute signature.
              </p>

              <div className="pt-3">
                <Link
                  href={`/volume/?initial=${currentPreset.volume}`}
                  className="inline-flex items-center gap-2 px-6 h-11 rounded-md bg-[#20252B] text-white text-[14px] font-medium hover:bg-[#323942] transition-colors focus-visible:ring-2 focus-visible:ring-[#20252B]"
                >
                  <span>Calculer mon volume en détail</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>

            {/* Right Column: Interactive Quick Preset Reference */}
            <div className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-lg border border-[#E6E8EB] shadow-2xs">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[13px] font-medium text-[#20252B]">
                  Repère rapide par superficie
                </span>
                <span className="text-[12px] font-mono text-[#0082CA]">
                  Cubage moyen
                </span>
              </div>

              {/* Segmented Housing Selector */}
              <div className="space-y-2" role="radiogroup" aria-label="Sélectionnez un type de logement">
                {HOUSING_PRESETS.map((preset, index) => {
                  const isSelected = selectedPresetIndex === index;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => setSelectedPresetIndex(index)}
                      className={`w-full text-left p-3.5 rounded-md border text-[14px] transition-all flex items-center justify-between cursor-pointer ${
                        isSelected 
                          ? 'border-[#0082CA] bg-[#0082CA]/5 text-[#20252B]' 
                          : 'border-[#E6E8EB] hover:border-[#20252B]/30 text-[#59616C]'
                      }`}
                    >
                      <div>
                        <div className={`font-medium ${isSelected ? 'text-[#0082CA]' : 'text-[#20252B]'}`}>
                          {preset.label}
                        </div>
                        <div className="text-[12px] text-[#59616C] mt-0.5">
                          {preset.description}
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <span className="text-[18px] font-semibold font-mono tabular-nums text-[#20252B]">
                          ~{preset.volume}
                        </span>
                        <span className="text-xs text-[#59616C] ml-1">m³</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Calculated result summary & action */}
              <div className="mt-5 pt-4 border-t border-[#E6E8EB] flex items-center justify-between">
                <div className="text-[13px] text-[#59616C]">
                  Volume sélectionné : <span className="font-semibold text-[#20252B] font-mono">{currentPreset.volume} m³</span>
                </div>
                <Link
                  href={`/devis/?volume=${currentPreset.volume}`}
                  className="text-[13px] font-medium text-[#0082CA] hover:text-[#006FA8] transition-colors flex items-center gap-1"
                >
                  <span>Inclure dans mon devis</span>
                  <span>→</span>
                </Link>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
