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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E8EB]">
        
        {/* Category Pills/Buttons */}
        <div 
          className="flex items-center flex-wrap gap-1.5"
          role="tablist"
          aria-label="Catégories de questions"
        >
          <button
            type="button"
            role="tab"
            aria-selected={selectedCategory === 'all'}
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-[#0082CA] text-white shadow-2xs'
                : 'bg-[#FAFAF8] text-[#59616C] hover:text-[#20252B] hover:bg-[#E6E8EB]/50 border border-[#E6E8EB]'
            }`}
          >
            Toutes ({items.length})
          </button>

          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              role="tab"
              aria-selected={selectedCategory === cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-md text-[13px] font-medium transition-colors cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-[#0082CA] text-white shadow-2xs'
                  : 'bg-[#FAFAF8] text-[#59616C] hover:text-[#20252B] hover:bg-[#E6E8EB]/50 border border-[#E6E8EB]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Global Expand / Collapse accessibility toggles */}
        <div className="flex items-center gap-2 text-[12.5px] text-[#59616C] shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={expandAll}
            className="hover:text-[#0082CA] font-medium underline underline-offset-2 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#0082CA]"
          >
            Tout déplier
          </button>
          <span aria-hidden="true" className="text-[#E6E8EB]">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="hover:text-[#0082CA] font-medium underline underline-offset-2 transition-colors cursor-pointer focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-[#0082CA]"
          >
            Tout replier
          </button>
        </div>

      </div>

      {/* Accordion List */}
      <div 
        className="divide-y divide-[#E6E8EB]" 
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
              className={`transition-colors duration-150 ${isOpen ? 'bg-[#FAFAF8]/50' : 'bg-transparent'}`}
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
                  className="w-full py-5 sm:py-6 px-1 flex items-center justify-between text-left gap-4 group cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-[#0082CA] focus-visible:ring-offset-2 rounded-sm"
                >
                  <div className="flex-1 pr-2">
                    {item.category && (
                      <span className="block text-[11px] font-mono uppercase tracking-wider text-[#0082CA] mb-1 font-semibold">
                        {item.category}
                      </span>
                    )}
                    <span className="text-[16px] sm:text-[17.5px] font-semibold text-[#20252B] group-hover:text-[#0082CA] transition-colors leading-snug">
                      {item.question}
                    </span>
                  </div>

                  {/* Brand blue deployment icon */}
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 border ${
                      isOpen
                        ? 'bg-[#0082CA] border-[#0082CA] text-white shadow-2xs rotate-180'
                        : 'bg-[#0082CA]/10 border-[#0082CA]/20 text-[#0082CA] group-hover:bg-[#0082CA] group-hover:border-[#0082CA] group-hover:text-white'
                    }`}
                    aria-hidden="true"
                  >
                    <svg 
                      className="w-4 h-4 transition-transform duration-200" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                      strokeWidth={2.2}
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
                className={`overflow-hidden transition-all duration-200 ${
                  isOpen ? 'pb-6 px-1 pt-1 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="max-w-3xl text-[14.5px] sm:text-[15.5px] text-[#59616C] leading-relaxed pl-0 sm:pl-1 border-l-2 border-[#0082CA]/30">
                  <div className="pl-3 sm:pl-4">
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
