/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';

interface VolumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyVolume: (volume: number) => void;
}

interface ItemPreset {
  id: string;
  name: string;
  category: string;
  m3: number;
}

const COMMON_ITEMS: ItemPreset[] = [
  { id: 'canape', name: 'Canapé 3 places', category: 'Salon', m3: 2.5 },
  { id: 'fauteuil', name: 'Fauteuil individuel', category: 'Salon', m3: 0.8 },
  { id: 'table_basse', name: 'Table basse & meuble TV', category: 'Salon', m3: 1.2 },
  { id: 'table_manger', name: 'Table à manger + chaises', category: 'Séjour', m3: 2.0 },
  { id: 'lit_double', name: 'Lit 2 places & matelas', category: 'Chambre', m3: 2.2 },
  { id: 'armoire', name: 'Armoire ou penderie 2 portes', category: 'Chambre', m3: 2.0 },
  { id: 'commode', name: 'Commode / Bureau', category: 'Chambre', m3: 1.0 },
  { id: 'frigo', name: 'Réfrigérateur / Congélateur', category: 'Cuisine', m3: 1.5 },
  { id: 'lave_linge', name: 'Lave-linge / Sèche-linge', category: 'Cuisine', m3: 0.8 },
  { id: 'cartons', name: 'Lot de 10 cartons standards', category: 'Divers', m3: 1.0 },
];

export const VolumeModal: React.FC<VolumeModalProps> = ({ isOpen, onClose, onApplyVolume }) => {
  const [quantities, setQuantities] = useState<Record<string, number>>({
    canape: 1,
    table_basse: 1,
    table_manger: 1,
    lit_double: 1,
    armoire: 1,
    commode: 1,
    frigo: 1,
    lave_linge: 1,
    cartons: 3,
  });

  if (!isOpen) return null;

  const updateQuantity = (id: string, delta: number) => {
    setQuantities(prev => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) + delta)
    }));
  };

  const totalM3 = Object.entries(quantities).reduce((acc, [id, qty]) => {
    const item = COMMON_ITEMS.find(i => i.id === id);
    return acc + (item ? item.m3 * qty : 0);
  }, 0);

  const roundedM3 = Math.max(5, Math.round(totalM3 * 10) / 10);
  const estimatedBoxes = Math.round(roundedM3 * 2.8);

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#20252B]/40 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="volume-modal-title"
    >
      <div 
        className="w-full max-w-2xl bg-white rounded-lg border border-[#E6E8EB] shadow-xl overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E6E8EB] flex items-center justify-between bg-[#FAFAF8]">
          <div>
            <h3 id="volume-modal-title" className="text-[18px] font-semibold text-[#20252B]">
              Calculateur de cubage indicatif
            </h3>
            <p className="text-[13px] text-[#59616C] mt-0.5">
              Ajustez les éléments principaux pour affiner l'estimation de votre déménagement
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-md flex items-center justify-center text-[#59616C] hover:text-[#20252B] hover:bg-[#E6E8EB]/50 transition-colors cursor-pointer"
            aria-label="Fermer le calculateur"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Inventory Items list */}
        <div className="p-6 max-h-[60vh] overflow-y-auto divide-y divide-[#E6E8EB]">
          {COMMON_ITEMS.map((item) => {
            const qty = quantities[item.id] || 0;
            return (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-[14.5px] font-medium text-[#20252B]">
                    {item.name}
                  </div>
                  <div className="text-[12px] text-[#59616C]">
                    {item.category} · {item.m3} m³ unité
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded border border-[#E6E8EB] flex items-center justify-center text-[#20252B] disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#FAFAF8] cursor-pointer"
                    aria-label={`Diminuer la quantité de ${item.name}`}
                  >
                    -
                  </button>
                  <span className="w-6 text-center font-mono font-medium text-[15px] tabular-nums text-[#20252B]">
                    {qty}
                  </span>
                  <button
                    type="button"
                    onClick={() => updateQuantity(item.id, 1)}
                    className="w-8 h-8 rounded border border-[#E6E8EB] flex items-center justify-center text-[#20252B] hover:bg-[#FAFAF8] cursor-pointer"
                    aria-label={`Augmenter la quantité de ${item.name}`}
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Summary */}
        <div className="p-6 border-t border-[#E6E8EB] bg-[#FAFAF8] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-center sm:text-left">
            <div className="text-[13px] text-[#59616C]">
              Volume estimé :
            </div>
            <div className="text-[26px] font-semibold text-[#20252B] font-mono tabular-nums leading-tight">
              {roundedM3} <span className="text-[16px] font-normal text-[#59616C]">m³</span>
            </div>
            <div className="text-[12px] text-[#59616C]">
              ~{estimatedBoxes} cartons nécessaires · Camion adapté 20 à 30 m³
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 h-11 rounded-md text-[#59616C] hover:text-[#20252B] text-[14px] cursor-pointer"
            >
              Fermer
            </button>
            <button
              type="button"
              onClick={() => {
                onApplyVolume(roundedM3);
                onClose();
              }}
              className="flex-1 sm:flex-initial px-6 h-11 rounded-md bg-[#0082CA] text-white text-[14px] font-medium hover:bg-[#006FA8] transition-colors cursor-pointer whitespace-nowrap"
            >
              Utiliser pour mon devis
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
