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

interface CategoryFilterDef {
  id: string;
  label: string;
  icon: string;
  categories: FurnitureCategory[];
}

const CATEGORY_FILTERS: CategoryFilterDef[] = [
  { id: 'salon_sejour', label: 'Salon', icon: 'sofa-large', categories: ['Salon', 'Séjour'] },
  { id: 'chambre', label: 'Chambre', icon: 'bed-double', categories: ['Chambre', 'Enfants'] },
  { id: 'cuisine', label: 'Cuisine', icon: 'fridge', categories: ['Cuisine'] },
  { id: 'bain', label: 'Bain', icon: 'bath', categories: ['Salle de bain'] },
  { id: 'bureau', label: 'Bureau', icon: 'desk', categories: ['Bureau'] },
  { id: 'cartons', label: 'Cartons', icon: 'boxes', categories: ['Cartons'] },
  { id: 'speciaux', label: 'Spéciaux', icon: 'piano', categories: ['Extérieur & Garage', 'Objets Spéciaux'] },
];

const STORAGE_KEY = 'wemove_calculator_inventory';

export const VolumePage: React.FC = () => {
  const { push, query } = useRouter();
  const initialFromQuery = query.initial ? Number(query.initial) : null;

  const [activeCategory, setActiveCategory] = useState<string>('salon_sejour');
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
    const currentFilter = CATEGORY_FILTERS.find(f => f.id === activeCategory) || CATEGORY_FILTERS[0];
    return INVENTORY_ITEMS.filter(item => {
      const matchesCat = currentFilter.categories.includes(item.category);
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
    <div className="relative py-10 sm:py-16 bg-[#FAFAF8] min-h-screen text-[#0F172A] overflow-hidden">
      {/* Decorative ambient background radial lighting */}
      <div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#0082CA]/10 via-slate-100/30 to-transparent pointer-events-none blur-3xl -z-0" 
        aria-hidden="true" 
      />

      <div className="relative z-10 max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">

        {/* ================= SUBLIMATED EXECUTIVE HEADER ================= */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 pb-8 border-b border-[#E2E8F0]">
          <div className="space-y-3">
            
            {/* Néo-Glassmorphic Badge */}
            <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/90 backdrop-blur-md border border-[#0082CA]/25 text-[#0082CA] shadow-2xs font-mono text-[12px] font-semibold tracking-wide">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0082CA] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0082CA]"></span>
              </span>
              <span>Calculateur officiel · Norme NF Logistique Déménagement</span>
            </div>

            {/* Headline */}
            <h1 className="text-[32px] sm:text-[44px] lg:text-[48px] font-bold text-[#0F172A] tracking-tight leading-[1.12] font-display">
              Calculateur de{' '}
              <span className="relative inline-block text-[#0082CA]">
                <span className="bg-gradient-to-r from-[#0082CA] via-[#0284C7] to-[#0369A1] bg-clip-text text-transparent">
                  volume
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
            </h1>

            <p className="text-[16px] sm:text-[17.5px] text-[#475569] max-w-2xl font-normal leading-relaxed">
              Ajustez vos meubles et cartons ci-dessous. Le cubage, le camion adapté et le devis se mettent à jour instantanément.
            </p>
          </div>

          {/* Presets Quick Selector */}
          <div className="flex items-center gap-2 flex-wrap p-1.5 bg-white/90 backdrop-blur-md border border-[#E2E8F0] rounded-2xl shadow-xs">
            <span className="text-[12px] text-[#64748B] font-mono font-semibold px-2 hidden sm:inline">
              Preset rapide :
            </span>
            {VOLUME_PRESETS.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-[#0F172A] text-white shadow-sm ring-1 ring-slate-700'
                      : 'bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 border border-[#E2E8F0]'
                  }`}
                  title={`${p.name} (${p.area} · ~${p.badge})`}
                >
                  <span>{p.name.split('/')[0].trim()}</span>
                  <span className={`text-[10.5px] font-mono font-bold ${isSelected ? 'text-sky-300' : 'text-[#0082CA]'}`}>
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
          <div className="lg:col-span-8 space-y-5">
            
            {/* Filter Controls Bar */}
            <div className="bg-white/90 backdrop-blur-md rounded-2xl border border-[#E2E8F0] p-4 shadow-xs space-y-3.5">
              
              {/* Category Tabs Bar */}
              <div 
                className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none"
                role="tablist"
                aria-label="Catégories de meubles"
              >
                {CATEGORY_FILTERS.map((cat) => {
                  const isActive = activeCategory === cat.id;
                  const countInCat = INVENTORY_ITEMS
                    .filter(i => cat.categories.includes(i.category))
                    .reduce((acc, i) => acc + (quantities[i.id] || 0), 0);

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => setActiveCategory(cat.id)}
                      className={`px-3 py-1.5 rounded-xl text-[12.5px] font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-[#0F172A] text-white shadow-sm'
                          : 'bg-white text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 border border-[#E2E8F0]'
                      }`}
                    >
                      <FurnitureIcon name={cat.icon} className={`w-4 h-4 ${isActive ? 'text-white' : 'text-[#0082CA]'}`} />
                      <span>{cat.label}</span>
                      {countInCat > 0 && (
                        <span className={`text-[10.5px] font-mono px-1.5 py-0.2 rounded-md font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-[#EBF5FB] text-[#0082CA]'
                        }`}>
                          {countInCat}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Search & Only Selected Toggle Row */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filtrer un meuble (ex: canapé, armoire, frigo, cartons...)"
                    className="w-full pl-9 pr-8 py-2 text-[13px] bg-slate-50 border border-slate-200 rounded-xl text-[#0F172A] placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0082CA]/20 focus:border-[#0082CA] transition-all"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-[#0F172A]"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-2.5 text-[12.5px]">
                  <button
                    type="button"
                    onClick={() => setOnlySelected(!onlySelected)}
                    className={`px-3.5 py-1.5 rounded-xl border text-[12.5px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                      onlySelected
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-bold'
                        : 'bg-white border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-50'
                    }`}
                  >
                    <span>{onlySelected ? '✓' : '○'}</span>
                    <span>Sélectionnés ({selectedItemsSummary.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={resetAll}
                    disabled={totalItemsCount === 0}
                    className="text-[#64748B] hover:text-red-600 disabled:opacity-30 disabled:hover:text-[#64748B] transition-colors underline cursor-pointer text-[12.5px] ml-1 font-semibold"
                  >
                    Vider
                  </button>
                </div>
              </div>

            </div>

            {/* Clean Grid of Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredItems.map((item) => {
                const qty = quantities[item.id] || 0;
                const isSelected = qty > 0;
                const isCarton = item.group === 'carton';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col justify-between group ${
                      isSelected
                        ? 'bg-white border-[#0082CA] shadow-md shadow-[#0082CA]/10 ring-2 ring-[#0082CA]/20'
                        : 'bg-white/80 border-[#E2E8F0] hover:bg-white hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Icon + Title & Unit m³ */}
                    <div className="flex items-start gap-3.5">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                          isSelected
                            ? 'bg-[#0082CA] text-white shadow-md'
                            : 'bg-[#EBF5FB] text-[#0082CA] border border-[#0082CA]/20 group-hover:scale-105'
                        }`}
                        aria-hidden="true"
                      >
                        <FurnitureIcon name={item.iconType} className="w-8 h-8" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-1">
                          <h3 className="text-[14.5px] font-bold text-[#0F172A] leading-snug truncate font-display">
                            {item.name}
                          </h3>
                        </div>

                        <p className="text-[12px] text-[#64748B] leading-snug line-clamp-1 mt-0.5">
                          {item.subtitle}
                        </p>

                        <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#64748B] font-mono font-medium">
                          <span className="text-[#0082CA] font-bold">{item.m3} m³</span>
                          <span aria-hidden="true">·</span>
                          <span>{item.category}</span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Stepper Controls */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="text-[12px] font-mono">
                        {qty > 0 ? (
                          <span className="text-[#0082CA] font-bold">
                            {Math.round(item.m3 * qty * 10) / 10} m³
                          </span>
                        ) : (
                          <span className="text-slate-400 font-normal">0 m³</span>
                        )}
                      </div>

                      {/* Accessible Tactile Stepper */}
                      <div className="flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, -1)}
                          disabled={qty === 0}
                          aria-label={`Retirer un ${item.name}`}
                          className="w-7 h-7 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0F172A] disabled:opacity-25 disabled:cursor-not-allowed hover:bg-slate-100 active:scale-95 transition-all cursor-pointer font-bold text-sm select-none shadow-2xs"
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
                          className="w-8 text-center font-mono font-bold text-[13.5px] text-[#0F172A] bg-transparent focus:outline-hidden focus:bg-white rounded py-0.5"
                        />

                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, 1)}
                          aria-label={`Ajouter un ${item.name}`}
                          className="w-7 h-7 rounded-lg bg-[#0082CA] text-white flex items-center justify-center hover:bg-[#006FA8] active:scale-95 transition-all cursor-pointer font-bold text-sm select-none shadow-2xs"
                        >
                          +
                        </button>

                        {isCarton && (
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, 5)}
                            title="Ajouter 5 cartons"
                            className="px-1.5 h-7 rounded-lg bg-white border border-slate-200 text-[11px] font-mono font-bold text-[#0082CA] hover:bg-slate-100 transition-all cursor-pointer ml-0.5"
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
              <div className="p-12 text-center bg-white rounded-3xl border border-[#E2E8F0] space-y-3 shadow-xs">
                <p className="text-[16px] font-bold text-[#0F172A]">
                  Aucun meuble ne correspond à votre filtre
                </p>
                <p className="text-[14px] text-[#64748B]">
                  Désactivez le filtre "Sélectionnés uniquement" ou modifiez votre recherche.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setOnlySelected(false);
                    setSearchQuery('');
                  }}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#0082CA] text-white text-[13px] font-bold hover:bg-[#006FA8] cursor-pointer shadow-xs"
                >
                  Afficher tout le catalogue
                </button>
              </div>
            )}

            {/* Small note on heavy items */}
            <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-white flex items-center justify-between gap-3 text-[13px] text-[#475569] shadow-2xs">
              <div className="flex items-center gap-2.5">
                <span className="text-[18px]">🎹</span>
                <span>Un piano, coffre-fort ou passage difficile ? Notre monte-meubles monte jusqu’au 8ᵉ étage.</span>
              </div>
              <Link href="/location-monte-meubles/" className="text-[#0082CA] font-bold hover:underline shrink-0">
                En savoir plus →
              </Link>
            </div>

          </div>

          {/* ================= RIGHT COLUMN: STICKY COCKPIT (4 Cols) ================= */}
          <div className="lg:col-span-4 sticky top-24 space-y-4">
            
            {/* Live Truck Simulation Widget */}
            <TruckVisualizer
              totalVolume={totalVolume}
              maxTruckCapacity={logisticsAdvice.truckCapacity}
              vehicleType={logisticsAdvice.vehicleType}
              fillPercentage={logisticsAdvice.fillPercentage}
            />

            {/* Main Sublimated Volume Cockpit Card */}
            <div className="bg-white rounded-3xl border-2 border-[#0082CA] p-6 shadow-xl space-y-5 relative overflow-hidden group">
              {/* Accent top gradient line */}
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0082CA] via-sky-400 to-[#10B981]" />
              
              {/* Big Volume Display */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#0082CA] font-bold block">
                    Volume estimé
                  </span>
                  <div className="flex items-baseline gap-2 mt-1">
                    <span className="text-[48px] font-mono tabular-nums font-black text-[#0F172A] leading-none">
                      {totalVolume}
                    </span>
                    <span className="text-[24px] font-extrabold text-[#0082CA]">m³</span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">Articles</span>
                  <span className="text-[20px] font-mono font-bold text-[#0F172A]">{totalItemsCount}</span>
                  <span className="text-[11.5px] font-mono text-slate-500 block">~{estimatedWeightKg} kg</span>
                </div>
              </div>

              {/* Logistic Specifications */}
              <div className="space-y-2.5 pt-3 border-t border-slate-100 text-[13px]">
                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-[#64748B] flex items-center gap-2">
                    <span>🚛</span>
                    <span>Véhicule conseillé</span>
                  </span>
                  <span className="font-bold text-[#0F172A] text-right">
                    {logisticsAdvice.vehicleType}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-[#64748B] flex items-center gap-2">
                    <span>👷</span>
                    <span>Équipe requise</span>
                  </span>
                  <span className="font-bold text-[#0F172A]">
                    {logisticsAdvice.team}
                  </span>
                </div>

                <div className="flex items-center justify-between py-1 border-b border-slate-100">
                  <span className="text-[#64748B] flex items-center gap-2">
                    <span>📦</span>
                    <span>Cartons conseillés</span>
                  </span>
                  <span className="font-mono font-bold text-[#0F172A]">
                    ~{logisticsAdvice.boxes} cartons
                  </span>
                </div>

                <div className="flex items-center justify-between py-1">
                  <span className="text-[#64748B] flex items-center gap-2">
                    <span>🅿️</span>
                    <span>Voirie recommandée</span>
                  </span>
                  <span className="font-semibold text-[#0F172A]">
                    {logisticsAdvice.parkingMeter}
                  </span>
                </div>
              </div>

              {/* Primary Call to Action */}
              <div className="pt-2 space-y-2.5">
                <button
                  type="button"
                  onClick={() => push(`/devis/?volume=${totalVolume}`)}
                  className="w-full h-13 rounded-2xl bg-gradient-to-r from-[#0082CA] to-[#006FA8] hover:from-[#0074B5] hover:to-[#005B8C] active:scale-[0.99] text-white text-[15px] font-bold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-[#0082CA]/30 hover:shadow-xl hover:shadow-[#0082CA]/40"
                >
                  <span>Demander un devis ({totalVolume} m³)</span>
                  <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>

                <p className="text-[11.5px] text-[#64748B] text-center font-medium">
                  Devis gratuit sous 2h · Injection automatique du volume
                </p>
              </div>

              {/* Quick Actions (Copy / Detail Drawer) */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[12.5px]">
                <button
                  type="button"
                  onClick={copyToClipboard}
                  disabled={selectedItemsSummary.length === 0}
                  className="text-[#0082CA] font-bold hover:underline disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                  {copyFeedback ? '✓ Copié !' : '📋 Copier la liste'}
                </button>

                <button
                  type="button"
                  onClick={() => setShowItemListModal(true)}
                  disabled={selectedItemsSummary.length === 0}
                  className="text-[#64748B] font-semibold hover:text-[#0F172A] disabled:opacity-40 cursor-pointer"
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
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setShowItemListModal(false)}
        >
          <div 
            className="bg-white rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#E2E8F0] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between">
              <div>
                <h3 className="text-[17px] font-bold text-[#0F172A] font-display">
                  Votre sélection ({totalItemsCount} articles)
                </h3>
                <p className="text-[12.5px] text-[#64748B] mt-0.5">
                  Total cubage calculé : <strong className="text-[#0082CA] font-bold">{totalVolume} m³</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowItemListModal(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 font-bold cursor-pointer transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal List */}
            <div className="p-5 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
              {selectedItemsSummary.map(({ item, qty }) => (
                <div key={item.id} className="pt-2.5 first:pt-0 flex items-center justify-between text-[13.5px]">
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <span className="font-mono font-bold text-[#0082CA] shrink-0">{qty}×</span>
                    <span className="truncate text-[#0F172A] font-semibold">{item.name}</span>
                  </div>

                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="font-mono text-[#64748B] font-medium text-[12.5px]">
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
            <div className="p-4.5 border-t border-[#E2E8F0] bg-slate-50 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetAll}
                className="text-[12.5px] text-red-600 hover:underline font-bold cursor-pointer"
              >
                Tout réinitialiser
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowItemListModal(false);
                  push(`/devis/?volume=${totalVolume}`);
                }}
                className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-[#0082CA] to-[#006FA8] text-white text-[13.5px] font-bold hover:from-[#0074B5] hover:to-[#005B8C] cursor-pointer shadow-md shadow-[#0082CA]/20"
              >
                Passer au devis →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE BOTTOM BAR ================= */}
      {totalVolume > 0 && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0] p-3.5 shadow-xl z-40 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10.5px] text-[#64748B] uppercase font-mono font-bold block">Volume calculé</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-[24px] font-bold text-[#0F172A]">{totalVolume}</span>
              <span className="text-[13px] font-bold text-[#0082CA]">m³</span>
              <button
                type="button"
                onClick={() => setShowItemListModal(true)}
                className="text-[11.5px] text-[#0082CA] underline ml-2 font-mono font-bold"
              >
                ({totalItemsCount} art.)
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={() => push(`/devis/?volume=${totalVolume}`)}
            className="px-5 h-11 rounded-2xl bg-gradient-to-r from-[#0082CA] to-[#006FA8] text-white text-[13.5px] font-bold flex items-center gap-2 shadow-md shadow-[#0082CA]/25 cursor-pointer"
          >
            <span>Devis ({totalVolume} m³)</span>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      )}

    </div>
  );
};
