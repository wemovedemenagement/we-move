/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useId } from 'react';
import { FaqItem } from '../data/content';

interface FaqAccordionProps {
  items: FaqItem[];
  defaultOpenId?: string;
  allowMultiple?: boolean;
}

export const FaqAccordion: React.FC<FaqAccordionProps> = ({
  items,
  defaultOpenId = 'devis-preparation',
  allowMultiple = false,
}) => {
  const baseId = useId();
  const [openIds, setOpenIds] = useState<string[]>(
    defaultOpenId ? [defaultOpenId] : []
  );
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const triggerRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Unique categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    items.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return Array.from(set);
  }, [items]);

  // Filtered items
  const filteredItems = React.useMemo(() => {
    if (selectedCategory === 'all') return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const toggleItem = (id: string) => {
    setOpenIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      }
      return allowMultiple ? [...prev, id] : [id];
    });
  };

  const expandAll = () => {
    setOpenIds(filteredItems.map((item) => item.id));
  };

  const collapseAll = () => {
    setOpenIds([]);
  };

  // Keyboard navigation across accordion headers (W3C WAI-ARIA Accordion Pattern)
  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    const total = filteredItems.length;
    let nextIndex: number | null = null;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (index + 1) % total;
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = (index - 1 + total) % total;
        break;
      case 'Home':
        e.preventDefault();
        nextIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        nextIndex = total - 1;
        break;
      default:
        break;
    }

    if (nextIndex !== null) {
      triggerRefs.current[nextIndex]?.focus();
    }
  };

  return (
    <div className="w-full">
      {/* Category selector & Batch controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E2E8F0]">
        
        {/* Category Pills/Buttons */}
        <div 
          className="flex items-center flex-wrap gap-2"
          role="tablist"
          aria-label="Catégories de questions"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-[#0F172A] text-white shadow-sm'
                : 'bg-white/90 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 border border-[#E2E8F0]'
            }`}
          >
            <span>Toutes</span>
            <span className={`px-1.5 py-0.5 rounded-md text-[11px] font-mono ${
              selectedCategory === 'all' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}>{items.length}</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0F172A] text-white shadow-sm'
                  : 'bg-white/90 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 border border-[#E2E8F0]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Global Expand / Collapse accessibility toggles */}
        <div className="flex items-center gap-2.5 text-[12.5px] text-[#64748B] shrink-0 self-start sm:self-auto font-medium">
          <button
            type="button"
            onClick={expandAll}
            className="hover:text-[#0082CA] font-semibold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#0082CA]"
          >
            Tout déplier
          </button>
          <span aria-hidden="true" className="text-[#E2E8F0]">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="hover:text-[#0082CA] font-semibold transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#0082CA]"
          >
            Tout replier
          </button>
        </div>

      </div>

      {/* Accordion List */}
      <div 
        className="space-y-3 pt-6" 
        role="region" 
        aria-label="Questions utiles accordéon"
      >
        {filteredItems.map((item, index) => {
          const isOpen = openIds.includes(item.id);
          const headerId = `${baseId}-header-${item.id}`;
          const panelId = `${baseId}-panel-${item.id}`;

          return (
            <div 
              key={item.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen 
                  ? 'bg-white border-[#E2E8F0] shadow-md shadow-slate-900/5 ring-1 ring-[#0082CA]/10' 
                  : 'bg-white/60 border-[#E2E8F0]/80 hover:bg-white hover:border-slate-300'
              }`}
            >
              <h3>
                <button
                  ref={(el) => {
                    triggerRefs.current[index] = el;
                  }}
                  id={headerId}
                  type="button"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  onClick={() => toggleItem(item.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-full py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between text-left gap-4 group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0082CA]"
                >
                  <div className="flex-1 pr-2">
                    {item.category && (
                      <span className="block text-[11px] font-mono uppercase tracking-wider text-[#0082CA] mb-1 font-bold">
                        {item.category}
                      </span>
                    )}
                    <span className="text-[16px] sm:text-[17.5px] font-bold text-[#0F172A] group-hover:text-[#0082CA] transition-colors leading-snug font-display">
                      {item.question}
                    </span>
                  </div>

                  {/* Brand deployment icon */}
                  <span
                    className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 border ${
                      isOpen
                        ? 'bg-[#0082CA] border-[#0082CA] text-white shadow-sm rotate-180'
                        : 'bg-[#EBF5FB] border-[#0082CA]/20 text-[#0082CA] group-hover:bg-[#0082CA] group-hover:border-[#0082CA] group-hover:text-white'
                    }`}
                    aria-hidden="true"
                  >
                    <svg 
                      className="w-4.5 h-4.5 transition-transform duration-300" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2.5}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
              </h3>

              <div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                hidden={!isOpen}
                className={`overflow-hidden transition-all duration-300 ${
                  isOpen ? 'pb-6 px-5 sm:px-6 pt-1 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="max-w-3xl text-[14.5px] sm:text-[15.5px] text-[#475569] leading-relaxed pl-4 border-l-2 border-[#0082CA]">
                  <div>
                    {item.answer}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
