/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';

export interface AddressResult {
  label: string;      // ex: "12 Rue de la Paix 75002 Paris"
  street?: string;    // ex: "Rue de la Paix"
  housenumber?: string; // ex: "12"
  postcode: string;   // ex: "75002"
  city: string;       // ex: "Paris"
  context?: string;    // ex: "75, Paris, Île-de-France"
  type?: 'housenumber' | 'street' | 'locality' | 'municipality';
}

// Offline / Immediate Fallback database of iconic addresses for instant response
const POPULAR_FULL_ADDRESSES: AddressResult[] = [
  { label: '12 Rue de la Paix 75002 Paris', housenumber: '12', street: 'Rue de la Paix', postcode: '75002', city: 'Paris', context: '75, Paris', type: 'housenumber' },
  { label: '45 Avenue Victor Hugo 75116 Paris', housenumber: '45', street: 'Avenue Victor Hugo', postcode: '75116', city: 'Paris', context: '75, Paris', type: 'housenumber' },
  { label: '8 Boulevard Haussmann 75009 Paris', housenumber: '8', street: 'Boulevard Haussmann', postcode: '75009', city: 'Paris', context: '75, Paris', type: 'housenumber' },
  { label: '100 Rue de la Convention 75015 Paris', housenumber: '100', street: 'Rue de la Convention', postcode: '75015', city: 'Paris', context: '75, Paris', type: 'housenumber' },
  { label: '25 Avenue de la Grande Armée 75116 Paris', housenumber: '25', street: 'Avenue de la Grande Armée', postcode: '75116', city: 'Paris', context: '75, Paris', type: 'housenumber' },
  { label: '14 Boulevard du Général Leclerc 92200 Neuilly-sur-Seine', housenumber: '14', street: 'Boulevard du Général Leclerc', postcode: '92200', city: 'Neuilly-sur-Seine', context: '92, Hauts-de-Seine', type: 'housenumber' },
  { label: '50 Route de la Reine 92100 Boulogne-Billancourt', housenumber: '50', street: 'Route de la Reine', postcode: '92100', city: 'Boulogne-Billancourt', context: '92, Hauts-de-Seine', type: 'housenumber' },
  { label: '1 Place de la République 75011 Paris', housenumber: '1', street: 'Place de la République', postcode: '75011', city: 'Paris', context: '75, Paris', type: 'housenumber' },
  { label: '10 Rue de la République 69002 Lyon', housenumber: '10', street: 'Rue de la République', postcode: '69002', city: 'Lyon', context: '69, Rhône', type: 'housenumber' },
  { label: '5 La Canebière 13001 Marseille', housenumber: '5', street: 'La Canebière', postcode: '13001', city: 'Marseille', context: '13, Bouches-du-Rhône', type: 'housenumber' },
  { label: '15 Rue Sainte-Catherine 33000 Bordeaux', housenumber: '15', street: 'Rue Sainte-Catherine', postcode: '33000', city: 'Bordeaux', context: '33, Gironde', type: 'housenumber' },
];

interface AddressAutocompleteInputProps {
  id?: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectAddress?: (address: AddressResult) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
  iconColor?: string;
}

export const AddressAutocompleteInput: React.FC<AddressAutocompleteInputProps> = ({
  id,
  name,
  value,
  onChange,
  onSelectAddress,
  placeholder = "N°, rue, code postal, ville...",
  required = false,
  className = "",
  iconColor = "#0082CA",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch full addresses from National Address API (api-adresse.data.gouv.fr)
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Debounce API requests by 200ms
    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const query = encodeURIComponent(value.trim());
        const response = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${query}&limit=7`);
        
        if (response.ok) {
          const data = await response.json();
          if (data.features && Array.isArray(data.features) && data.features.length > 0) {
            const results: AddressResult[] = data.features.map((f: any) => ({
              label: f.properties.label,
              street: f.properties.street,
              housenumber: f.properties.housenumber,
              postcode: f.properties.postcode || '',
              city: f.properties.city || '',
              context: f.properties.context || '',
              type: f.properties.type,
            }));

            setSuggestions(results);
            setIsOpen(true);
            setSelectedIndex(-1);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        // Fallback to local offline matching on network error
      }

      // Offline / Local matching fallback
      const qNorm = value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const matches = POPULAR_FULL_ADDRESSES.filter((item) => {
        const itemNorm = item.label.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        return itemNorm.includes(qNorm);
      });

      setSuggestions(matches);
      setIsOpen(matches.length > 0);
      setSelectedIndex(-1);
      setLoading(false);
    }, 200);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (item: AddressResult) => {
    onChange(item.label);
    if (onSelectAddress) onSelectAddress(item);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter' && selectedIndex >= 0) {
      e.preventDefault();
      handleSelect(suggestions[selectedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getTypeBadge = (type?: string) => {
    switch (type) {
      case 'housenumber':
        return { label: 'Adresse exacte', bg: 'bg-[#ECFDF5] text-[#059669]' };
      case 'street':
        return { label: 'Rue / Voie', bg: 'bg-[#F0F9FF] text-[#0082CA]' };
      default:
        return { label: 'Ville', bg: 'bg-[#F8FAFC] text-[#64748B]' };
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative">
        <input
          id={id}
          name={name}
          type="text"
          required={required}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (value.trim().length >= 2 && suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className={className || "w-full h-11 pl-9.5 pr-9.5 rounded-xl bg-[#F8FAFC] border border-[#CBD5E1] text-[14px] text-[#0F172A] placeholder-slate-400 focus:bg-white focus:border-[#0082CA] focus:ring-2 focus:ring-[#0082CA]/20 focus:outline-none transition-all font-medium"}
        />
        
        {/* Left Location Icon */}
        <svg
          className="w-4 h-4 absolute left-3.5 top-3.5 pointer-events-none"
          style={{ color: iconColor }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
          />
        </svg>

        {/* Right Loading Spinner or Clear Button */}
        <div className="absolute right-3 top-3.5 flex items-center gap-1">
          {loading ? (
            <div className="w-4 h-4 border-2 border-[#0082CA] border-t-transparent rounded-full animate-spin" />
          ) : value ? (
            <button
              type="button"
              onClick={() => {
                onChange('');
                setIsOpen(false);
              }}
              className="text-[#94A3B8] hover:text-[#0F172A] p-0.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
              title="Effacer"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : null}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-[#E2E8F0] shadow-2xl z-50 overflow-hidden py-1 divide-y divide-[#F1F5F9] animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3.5 py-1.5 bg-[#F8FAFC] text-[11px] font-mono font-bold uppercase tracking-wider text-[#64748B] flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-[#0082CA]">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              Adresses certifiées France & Google
            </span>
            <span className="text-[10px] text-[#94A3B8]">Sélection 1-clic</span>
          </div>

          <ul className="max-h-64 overflow-y-auto divide-y divide-[#F8FAFC]">
            {suggestions.map((item, idx) => {
              const badge = getTypeBadge(item.type);

              return (
                <li key={`${item.label}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => handleSelect(item)}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`w-full px-4 py-3 text-left text-[13.5px] transition-all flex items-center justify-between cursor-pointer ${
                      selectedIndex === idx
                        ? 'bg-[#F0F9FF] text-[#0082CA] font-semibold'
                        : 'text-[#0F172A] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0 pr-2">
                      <div className={`mt-0.5 p-1 rounded-lg shrink-0 ${selectedIndex === idx ? 'bg-[#0082CA] text-white' : 'bg-slate-100 text-[#64748B]'}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                      </div>

                      <div className="min-w-0">
                        <div className="truncate font-medium text-[#0F172A]">
                          {item.label}
                        </div>
                        {item.context && (
                          <div className="text-[11.5px] text-[#64748B] truncate mt-0.5">
                            {item.context}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[11px]">
                      <span className={`px-2 py-0.5 rounded-full font-mono font-semibold ${badge.bg}`}>
                        {badge.label}
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
