/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, Link } from '../router';
import {
  INVENTORY_ITEMS,
  VOLUME_PRESETS,
  FurnitureCategory,
  FurnitureItem,
} from '../data/volumeData';
import { FurnitureIcon } from '../components/FurnitureIcon';
import { TruckVisualizer } from '../components/TruckVisualizer';

const CATEGORY_FILTERS: Array<{ id: 'Tous' | FurnitureCategory; label: string; icon: string }> = [
  { id: 'Tous', label: 'Tous les objets', icon: 'category-all' },
  { id: 'Salon', label: 'Salon', icon: 'sofa-large' },
  { id: 'Chambre', label: 'Chambre', icon: 'bed-double' },
  { id: 'Séjour', label: 'Séjour', icon: 'dining-table' },
  { id: 'Cuisine', label: 'Cuisine & Électro', icon: 'fridge' },
  { id: 'Bureau', label: 'Bureau', icon: 'desk' },
  { id: 'Cartons', label: 'Cartons', icon: 'boxes' },
  { id: 'Enfants', label: 'Enfants', icon: 'crib' },
  { id: 'Extérieur & Garage', label: 'Extérieur', icon: 'outdoor' },
  { id: 'Objets Spéciaux', label: 'Spéciaux & Art', icon: 'piano' },
];

const STORAGE_KEY = 'wemove_calculator_inventory';

export const VolumePage: React.FC = () => {
  const { push, query } = useRouter();
  const initialFromQuery = query.initial ? Number(query.initial) : null;

  const [activeCategory, setActiveCategory] = useState<'Tous' | FurnitureCategory>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlySelected, setOnlySelected] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [showItemListModal, setShowItemListModal] = useState(false);

  // Initialize preset according to URL query or default
  const [activePresetId, setActivePresetId] = useState<string | null>(() => {
    if (initialFromQuery && initialFromQuery >= 45) return 'maison';
    if (initialFromQuery && initialFromQuery >= 30) return 't3_t4';
    if (initialFromQuery && initialFromQuery >= 18) return 't2';
    if (initialFromQuery && initialFromQuery >= 8) return 'studio';
    return null; // start clean or preset if requested
  });

  // Quantities state with LocalStorage recovery
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === 'object' && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    // If query initial, load corresponding preset
    if (initialFromQuery) {
      const targetPresetId =
        initialFromQuery >= 45 ? 'maison' :
        initialFromQuery >= 30 ? 't3_t4' :
        initialFromQuery >= 18 ? 't2' : 'studio';
      const preset = VOLUME_PRESETS.find(p => p.id === targetPresetId);
      if (preset) return { ...preset.quantities };
    }
    // Default starter preset (T2)
    const defaultPreset = VOLUME_PRESETS.find(p => p.id === 't2');
    return defaultPreset ? { ...defaultPreset.quantities } : {};
  });

  // Persist to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quantities));
    } catch {
      // ignore
    }
  }, [quantities]);

  // Apply a preset
  const applyPreset = (presetId: string) => {
    const preset = VOLUME_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setActivePresetId(presetId);
    setQuantities({ ...preset.quantities });
  };

  // Modify quantity (+ / -)
  const updateQuantity = (id: string, delta: number) => {
    setActivePresetId(null);
    setQuantities(prev => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      const copy = { ...prev };
      if (next === 0) {
        delete copy[id];
      } else {
        copy[id] = next;
      }
      return copy;
    });
  };

  // Direct manual quantity input
  const setDirectQuantity = (id: string, val: number) => {
    setActivePresetId(null);
    const valid = Math.max(0, Math.min(99, Math.floor(val || 0)));
    setQuantities(prev => {
      const copy = { ...prev };
      if (valid === 0) {
        delete copy[id];
      } else {
        copy[id] = valid;
      }
      return copy;
    });
  };

  // Reset all
  const resetAll = () => {
    setActivePresetId(null);
    setQuantities({});
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  // Calculations
  const { totalVolume, totalItemsCount, estimatedWeightKg } = useMemo(() => {
    let vol = 0;
    let count = 0;

    Object.entries(quantities).forEach(([id, qty]) => {
      if (qty > 0) {
        const item = INVENTORY_ITEMS.find(i => i.id === id);
        if (item) {
          vol += item.m3 * qty;
          count += qty;
        }
      }
    });

    const roundedVol = Math.round(vol * 10) / 10;
    const weight = Math.round(roundedVol * 120);

    return {
      totalVolume: roundedVol,
      totalItemsCount: count,
      estimatedWeightKg: weight,
    };
  }, [quantities]);

  // Logistics recommendation engine
  const logisticsAdvice = useMemo(() => {
    if (totalVolume <= 0) {
      return {
        vehicle: 'En attente de sélection',
        vehicleType: 'Calcul automatique',
        team: '1 à 2 pros',
        truckCapacity: 14,
        fillPercentage: 0,
        boxes: 0,
        parkingMeter: '1 place (5 m)',
      };
    }
    if (totalVolume <= 14) {
      const maxCap = 14;
      return {
        vehicle: 'Fourgon 12 - 14 m³',
        vehicleType: 'Fourgon 14 m³ urbain',
        team: '2 déménageurs pros',
        truckCapacity: maxCap,
        fillPercentage: Math.min(100, Math.round((totalVolume / maxCap) * 100)),
        boxes: Math.round(totalVolume * 2.8),
        parkingMeter: '1 place utilitaire (7 m)',
      };
    }
    if (totalVolume <= 24) {
      const maxCap = 24;
      return {
        vehicle: 'Camion 22 m³ avec hayon',
        vehicleType: 'Camion 22 m³ avec hayon',
        team: '2 à 3 déménageurs pros',
        truckCapacity: maxCap,
        fillPercentage: Math.min(100, Math.round((totalVolume / maxCap) * 100)),
        boxes: Math.round(totalVolume * 2.8),
        parkingMeter: '2 places (10 m)',
      };
    }
    if (totalVolume <= 36) {
      const maxCap = 40;
      return {
        vehicle: 'Porteur 35 m³ capitonné',
        vehicleType: 'Porteur 35 m³ capitonné',
        team: '3 déménageurs pros',
        truckCapacity: maxCap,
        fillPercentage: Math.min(100, Math.round((totalVolume / maxCap) * 100)),
        boxes: Math.round(totalVolume * 2.8),
        parkingMeter: '3 places (14 m)',
      };
    }
    const maxCap = 60;
    return {
      vehicle: 'Flotte combinée 50 m³+',
      vehicleType: 'Flotte combinée 50 m³+',
      team: '3 à 4 déménageurs qualifiés',
      truckCapacity: maxCap,
      fillPercentage: Math.min(100, Math.round((totalVolume / maxCap) * 100)),
      boxes: Math.round(totalVolume * 2.8),
      parkingMeter: 'Voirie réservée (16-20 m)',
    };
  }, [totalVolume]);

  // Filtered items list
  const filteredItems = useMemo(() => {
    return INVENTORY_ITEMS.filter(item => {
      const matchesCat = activeCategory === 'Tous' || item.category === activeCategory;
      const matchesSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSelected = !onlySelected || (quantities[item.id] || 0) > 0;
      return matchesCat && matchesSearch && matchesSelected;
    });
  }, [activeCategory, searchQuery, onlySelected, quantities]);

  // Selected items summary
  const selectedItemsSummary = useMemo(() => {
    return Object.entries(quantities)
      .map(([id, qty]) => {
        const item = INVENTORY_ITEMS.find(i => i.id === id);
        return { item, qty };
      })
      .filter((entry): entry is { item: FurnitureItem; qty: number } => Boolean(entry.item && entry.qty > 0));
  }, [quantities]);

  // Copy plain text inventory
  const copyToClipboard = () => {
    if (selectedItemsSummary.length === 0) return;
    const text = [
      `📋 INVENTAIRE DE DÉMÉNAGEMENT WE MOVE`,
      `Volume total estimé : ${totalVolume} m³ (${totalItemsCount} articles)`,
      `Véhicule conseillé : ${logisticsAdvice.vehicleType}`,
      `Équipe : ${logisticsAdvice.team}`,
      `Poids estimé : ~${estimatedWeightKg} kg`,
      `----------------------------------------`,
      `DÉTAIL DES ARTICLES :`,
      ...selectedItemsSummary.map(
        ({ item, qty }) =>
          `• ${qty}× ${item.name} (${item.category}) — ${Math.round(item.m3 * qty * 10) / 10} m³`
      ),
      `----------------------------------------`,
      `Généré sur wemove.fr`,
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    });
  };

  return (
    <div className="py-8 sm:py-12 bg-[#FBFBFA] min-h-screen text-[#111827]">
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ================= COMPACT & ELEGANT HEADER ================= */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6 pb-6 border-b border-[#EAEBED]">
          <div>
            <div className="flex items-center gap-2 text-[12px] text-[#59616C] mb-1.5 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#0082CA]" />
              <span className="text-[#0082CA] font-semibold uppercase tracking-wider">Calculateur officiel</span>
              <span aria-hidden="true">·</span>
              <span>Norme NF Logistique Déménagement</span>
            </div>

            <h1 className="text-[28px] sm:text-[36px] font-bold text-[#111827] tracking-tight leading-tight">
              Calculateur de volume
            </h1>

            <p className="mt-1 text-[14.5px] sm:text-[15.5px] text-[#59616C] max-w-2xl">
              Ajustez vos meubles et cartons ci-dessous. Le cubage, le camion adapté et le devis se mettent à jour instantanément.
            </p>
          </div>

          {/* Quick presets row in header */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[12px] text-[#59616C] font-medium mr-1 hidden sm:inline">
              Base rapide :
            </span>
            {VOLUME_PRESETS.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#0082CA] text-white shadow-xs font-semibold'
                      : 'bg-white border border-[#E5E7EB] text-[#59616C] hover:text-[#111827] hover:border-[#0082CA]/50'
                  }`}
                  title={`${p.name} (${p.area} · ~${p.badge})`}
                >
                  <span>{p.name.split('/')[0].trim()}</span>
                  <span className={`text-[10px] font-mono ${isSelected ? 'text-white/80' : 'text-[#0082CA]'}`}>
                    {p.badge.replace(' à ', '-')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ================= 2-COLUMN MAIN LAYOUT ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ================= LEFT COLUMN: INVENTORY PICKER (8 Cols) ================= */}
          <div className="lg:col-span-8 space-y-4">
            
            {/* Filter Controls Bar */}
            <div className="bg-white rounded-xl border border-[#E5E7EB] p-3 sm:p-3.5 shadow-2xs space-y-3">
              
              {/* Clean Category Tabs */}
              <div 
                className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none"
                role="tablist"
                aria-label="Catégories de meubles"
              >
                {CATEGORY_FILTERS.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const countInCat = cat.id === 'Tous'
                    ? totalItemsCount
                    : INVENTORY_ITEMS.filter(i => i.category === cat.id).reduce((acc, i) => acc + (quantities[i.id] || 0), 0);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-2 rounded-lg text-[13px] font-medium transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                        isActive
                          ? 'bg-[#111827] text-white shadow-xs font-semibold'
                          : 'bg-[#F9FAFB] text-[#4B5563] hover:text-[#111827] hover:bg-[#F3F4F6]'
                      }`}
                    >
                      <FurnitureIcon name={cat.icon} className={`w-5 h-5 ${isActive ? 'text-white' : 'text-[#0082CA]'}`} />
                      <span>{cat.label}</span>
                      {countInCat > 0 && (
                        <span className={`text-[11px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#0082CA]/10 text-[#0082CA]'
                        }`}>
                          {countInCat}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Search & Only Selected Toggle Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-2 border-t border-[#F3F4F6]">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#9CA3AF]">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer un meuble (ex: canapé, armoire, frigo, cartons...)"
                    className="w-full pl-9 pr-8 h-9 text-[13px] rounded-lg border border-[#E5E7EB] bg-[#F9FAFB] focus:bg-white focus:border-[#0082CA] focus:outline-hidden transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#9CA3AF] hover:text-[#111827]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2 text-[12px]">
                  <button
                    type="button"
                    onClick={() => setOnlySelected(!onlySelected)}
                    className={`px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      onlySelected
                        ? 'bg-[#0082CA]/10 border-[#0082CA] text-[#0082CA] font-semibold'
                        : 'bg-white border-[#E5E7EB] text-[#4B5563] hover:text-[#111827] hover:border-[#D1D5DB]'
                    }`}
                  >
                    <span>{onlySelected ? '✓' : '○'}</span>
                    <span>Sélectionnés ({selectedItemsSummary.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetAll}
                    disabled={totalItemsCount === 0}
                    className="text-[#6B7280] hover:text-red-600 disabled:opacity-30 disabled:hover:text-[#6B7280] transition-colors underline cursor-pointer text-[12px] ml-1"
                  >
                    Vider
                  </button>
                </div>
              </div>

            </div>

            {/* Clean Grid of Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredItems.map((item) => {
                const qty = quantities[item.id] || 0;
                const isSelected = qty > 0;
                const isCarton = item.group === 'carton';

                return (
                  <div
                    key={item.id}
                    className={`p-3.5 rounded-xl border transition-all duration-150 flex flex-col justify-between ${
                      isSelected
                        ? 'bg-white border-[#0082CA] shadow-xs ring-1 ring-[#0082CA]/20'
                        : 'bg-white border-[#E5E7EB] hover:border-[#CBD5E1]'
                    }`}
                  >
                    {/* Top Row: Icon + Title & Unit m³ */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#0082CA] text-white shadow-xs'
                            : 'bg-[#F0F5FA] text-[#0082CA] border border-[#D9E3EE]'
                        }`}
                        aria-hidden="true"
                      >
                        <FurnitureIcon name={item.iconType} className="w-8 h-8" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1">
                          <h3 className="text-[14px] font-semibold text-[#111827] leading-snug truncate">
                            {item.name}
                          </h3>
                        </div>

                        <p className="text-[12px] text-[#6B7280] leading-snug line-clamp-1 mt-0.5">
                          {item.subtitle}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#6B7280] font-mono">
                          <span className="text-[#0082CA] font-semibold">{item.m3} m³</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Stepper Controls */}
                    <div className="mt-3 pt-2.5 border-t border-[#F3F4F6] flex items-center justify-between">
                      <div className="text-[11.5px] font-mono">
                        {qty > 0 ? (
                          <span className="text-[#0082CA] font-bold">
                            {Math.round(item.m3 * qty * 10) / 10} m³
                          </span>
                        ) : (
                          <span className="text-slate-400">0</span>
                        )}
                      </div>

                      {/* Accessible Tactile Stepper */}
                      <div className="flex items-center gap-1 bg-[#F9FAFB] p-0.5 rounded-lg border border-[#E5E7EB]">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={qty === 0}
                          aria-label={`Retirer un ${item.name}`}
                          className="w-7 h-7 rounded-md bg-white border border-[#E5E7EB] flex items-center justify-center text-[#111827] disabled:opacity-25 disabled:cursor-not-allowed hover:bg-[#F3F4F6] active:scale-95 transition-all cursor-pointer font-bold text-sm select-none"
                        >
                          −
                        </button>

                        <input
                          type="number"
                          min="0"
                          max="99"
                          value={qty}
                          onChange={(e) => setDirectQuantity(item.id, parseInt(e.target.value, 10) || 0)}
                          aria-label={`Quantité de ${item.name}`}
                          className="w-8 text-center font-mono font-bold text-[13.5px] text-[#111827] bg-transparent focus:outline-hidden focus:bg-white rounded py-0.5"
                        />

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label={`Ajouter un ${item.name}`}
                          className="w-7 h-7 rounded-md bg-[#0082CA] text-white flex items-center justify-center hover:bg-[#006FA8] active:scale-95 transition-all cursor-pointer font-bold text-sm select-none"
                        >
                          +
                        </button>

                        {isCarton && (
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 5)}
                            title="Ajouter 5 cartons"
                            className="px-1.5 h-7 rounded-md bg-white border border-[#E5E7EB] text-[10.5px] font-mono font-semibold text-[#0082CA] hover:bg-[#F3F4F6] transition-all cursor-pointer ml-0.5"
                          >
                            +5
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Empty state */}
            {filteredItems.length === 0 && (
              <div className="p-10 text-center bg-white rounded-xl border border-[#E5E7EB] space-y-2">
                <p className="text-[14.5px] font-semibold text-[#111827]">
                  Aucun meuble ne correspond à votre filtre
                </p>
                <p className="text-[13px] text-[#6B7280]">
                  Désactivez le filtre "Sélectionnés uniquement" ou modifiez votre recherche.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOnlySelected(false);
                    setSearchQuery('');
                  }}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-[#0082CA] text-white text-[12px] font-medium hover:bg-[#006FA8] cursor-pointer"
                >
                  Afficher tout le catalogue
                </button>
              </div>
            )}

            {/* Small note on heavy items */}
            <div className="p-3.5 rounded-xl border border-[#E5E7EB] bg-white flex items-center justify-between gap-3 text-[12.5px] text-[#59616C]">
              <div className="flex items-center gap-2">
                <span className="text-[16px]">🎹</span>
                <span>Un piano, coffre-fort ou passage difficile ? Notre monte-meubles monte jusqu’au 8ᵉ étage.</span>
              </div>
              <Link href="/location-monte-meubles/" className="text-[#0082CA] font-semibold hover:underline shrink-0">
                En savoir plus →
              </Link>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: STICKY COCKPIT (4 Cols) ================= */}
          <div className="lg:col-span-4 sticky top-20 space-y-4">
            
            {/* Live Truck Simulation Widget */}
            <TruckVisualizer
              totalVolume={totalVolume}
              maxTruckCapacity={logisticsAdvice.truckCapacity}
              vehicleType={logisticsAdvice.vehicleType}
              fillPercentage={logisticsAdvice.fillPercentage}
            />

            {/* Main Volume Cockpit Card */}
            <div className="bg-white rounded-2xl border-2 border-[#0082CA] p-5 shadow-sm space-y-4">
              
              {/* Big Volume Display */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#0082CA] font-semibold block">
                    Volume estimé
                  </span>
                  <div className="flex items-baseline gap-2 mt-0.5">
                    <span className="text-[44px] font-mono tabular-nums font-black text-[#111827] leading-none">
                      {totalVolume}
                    </span>
                    <span className="text-[22px] font-extrabold text-[#0082CA]">m³</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono uppercase text-[#6B7280] block">Articles</span>
                  <span className="text-[18px] font-mono font-bold text-[#111827]">{totalItemsCount}</span>
                  <span className="text-[11px] font-mono text-[#6B7280] block">~{estimatedWeightKg} kg</span>
                </div>
              </div>

              {/* Logistic Specifications */}
              <div className="space-y-2 pt-2 border-t border-[#F3F4F6] text-[12.5px]">
                <div className="flex items-center justify-between py-1 border-b border-[#F3F4F6]">
                  <span className="text-[#59616C] flex items-center gap-1.5">
                    <span>🚛</span>
                    <span>Véhicule conseillé</span>
                  </span>
                  <span className="font-semibold text-[#111827] text-right">
                    {logisticsAdvice.vehicleType}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#F3F4F6]">
                  <span className="text-[#59616C] flex items-center gap-1.5">
                    <span>👷</span>
                    <span>Équipe requise</span>
                  </span>
                  <span className="font-semibold text-[#111827]">
                    {logisticsAdvice.team}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-[#F3F4F6]">
                  <span className="text-[#59616C] flex items-center gap-1.5">
                    <span>📦</span>
                    <span>Cartons conseillés</span>
                  </span>
                  <span className="font-mono font-semibold text-[#111827]">
                    ~{logisticsAdvice.boxes} cartons
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[#59616C] flex items-center gap-1.5">
                    <span>🅿️</span>
                    <span>Voirie recommandée</span>
                  </span>
                  <span className="font-medium text-[#111827]">
                    {logisticsAdvice.parkingMeter}
                  </span>
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => push(`/devis/?volume=${totalVolume}`)}
                  className="w-full h-12 rounded-xl bg-[#0082CA] hover:bg-[#006FA8] active:scale-[0.99] text-white text-[15px] font-semibold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-[#0082CA]/25"
                >
                  <span>Demander un devis ({totalVolume} m³)</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <p className="text-[11.5px] text-[#6B7280] text-center">
                  Devis gratuit sous 2h · Injection automatique du volume
                </p>
              </div>

              {/* Quick Actions (Copy / Detail Drawer) */}
              <div className="pt-2 border-t border-[#F3F4F6] flex items-center justify-between text-[12px]">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  disabled={selectedItemsSummary.length === 0}
                  className="text-[#0082CA] font-medium hover:underline disabled:opacity-40 cursor-pointer flex items-center gap-1"
                >
                  {copyFeedback ? '✓ Copié !' : '📋 Copier la liste'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowItemListModal(true)}
                  disabled={selectedItemsSummary.length === 0}
                  className="text-[#59616C] font-medium hover:text-[#111827] disabled:opacity-40 cursor-pointer"
                >
                  Voir détail ({selectedItemsSummary.length}) →
                </button>
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* ================= MODAL: DETAIL LIST OF SELECTED ITEMS ================= */}
      {showItemListModal && (
        <div 
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowItemListModal(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E5E7EB] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E5E7EB] flex items-center justify-between">
              <div>
                <h3 className="text-[16px] font-semibold text-[#111827]">
                  Votre sélection ({totalItemsCount} articles)
                </h3>
                <p className="text-[12px] text-[#6B7280]">
                  Total cubage calculé : <strong className="text-[#0082CA] font-bold">{totalVolume} m³</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowItemListModal(false)}
                className="w-8 h-8 rounded-lg bg-[#F9FAFB] hover:bg-[#F3F4F6] flex items-center justify-center text-[#6B7280] font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Modal List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-2 flex-1 divide-y divide-[#F3F4F6]">
              {selectedItemsSummary.map(({ item, qty }) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-[13px]">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="font-mono font-bold text-[#0082CA] shrink-0">{qty}×</span>
                    <span className="truncate text-[#111827] font-medium">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[#6B7280] text-[12px]">
                      {Math.round(item.m3 * qty * 10) / 10} m³
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="text-slate-400 hover:text-red-500 font-bold px-1 transition-colors cursor-pointer"
                      title="Retirer une unité"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-[#E5E7EB] bg-[#F9FAFB] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="text-[12px] text-red-600 hover:underline font-medium cursor-pointer"
              >
                Tout réinitialiser
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowItemListModal(false);
                  push(`/devis/?volume=${totalVolume}`);
                }}
                className="px-4 py-2 rounded-xl bg-[#0082CA] text-white text-[13px] font-semibold hover:bg-[#006FA8] cursor-pointer"
              >
                Passer au devis →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM BAR (<15% viewport height) ================= */}
      {totalVolume > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E5E7EB] p-3 shadow-lg z-40 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10.5px] text-[#6B7280] uppercase font-mono block">Volume calculé</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[22px] font-bold text-[#111827]">{totalVolume}</span>
              <span className="text-[13px] font-bold text-[#0082CA]">m³</span>
              <button
                type="button"
                onClick={() => setShowItemListModal(true)}
                className="text-[11px] text-[#0082CA] underline ml-2 font-mono"
              >
                ({totalItemsCount} art.)
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => push(`/devis/?volume=${totalVolume}`)}
            className="px-4 h-10 rounded-xl bg-[#0082CA] hover:bg-[#006FA8] text-white text-[13px] font-semibold flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>Devis ({totalVolume} m³)</span>
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

    </div>
  );
};
