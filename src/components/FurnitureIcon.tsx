/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface FurnitureIconProps {
  name: string;
  className?: string;
}

export const FurnitureIcon: React.FC<FurnitureIconProps> = ({ name, className = 'w-6 h-6' }) => {
  switch (name) {
    case 'category-all':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );

    case 'category-mobilier':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11V8a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v3" />
          <path d="M3 11h18v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5z" />
          <path d="M5 18v3" />
          <path d="M19 18v3" />
          <line x1="12" y1="5" x2="12" y2="11" />
        </svg>
      );

    case 'category-carton':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );

    case 'category-electromenager':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="2" />
          <line x1="4" y1="9" x2="20" y2="9" />
          <circle cx="12" cy="15" r="3" />
          <line x1="8" y1="5.5" x2="10" y2="5.5" />
          <line x1="14" y1="5.5" x2="16" y2="5.5" />
        </svg>
      );

    case 'category-divers':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );

    case 'sofa-large':
    case 'sofa-corner':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          {/* Main backrest */}
          <path d="M3 8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
          {/* Méridienne corner arm & backrest */}
          <path d="M3 8v8a2 2 0 0 0 2 2h3" />
          {/* Main seating block */}
          <path d="M8 18h11a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2H8v8z" />
          {/* Seating divider */}
          <line x1="8" y1="10" x2="8" y2="18" />
          <line x1="14" y1="10" x2="14" y2="18" />
          {/* Legs */}
          <line x1="4" y1="18" x2="4" y2="21" />
          <line x1="9" y1="18" x2="9" y2="21" />
          <line x1="20" y1="18" x2="20" y2="21" />
        </svg>
      );

    case 'sofa-small':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 13v-2a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v2" />
          <rect x="3" y="12" width="18" height="5" rx="1.5" />
          <path d="M5 17v3" />
          <path d="M19 17v3" />
          <line x1="12" y1="8" x2="12" y2="13" />
        </svg>
      );

    case 'armchair':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 13V8a3 3 0 0 1 3-3h6a3 3 0 0 1 3 3v5" />
          <rect x="4" y="12" width="16" height="5" rx="1.5" />
          <path d="M6 17v4" />
          <path d="M18 17v4" />
          <path d="M3 11h2v3H3z" />
          <path d="M19 11h2v3h-2z" />
        </svg>
      );

    case 'pouf':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="11" rx="8" ry="4" />
          <path d="M4 11v4c0 2.2 3.6 4 8 4s8-1.8 8-4v-4" />
          <path d="M7 19v2" />
          <path d="M17 19v2" />
        </svg>
      );

    case 'tv':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="4" width="20" height="13" rx="2" />
          <line x1="8" y1="21" x2="16" y2="21" />
          <line x1="12" y1="17" x2="12" y2="21" />
          <circle cx="12" cy="10" r="1.5" />
        </svg>
      );

    case 'coffee-table':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="10" width="18" height="3" rx="1" />
          <line x1="5" y1="13" x2="4" y2="20" />
          <line x1="19" y1="13" x2="20" y2="20" />
          <line x1="6" y1="17" x2="18" y2="17" />
        </svg>
      );

    case 'bookshelf':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="18" rx="1.5" />
          <line x1="4" y1="8" x2="20" y2="8" />
          <line x1="4" y1="14" x2="20" y2="14" />
          <line x1="8" y1="3" x2="8" y2="8" />
          <line x1="13" y1="8" x2="13" y2="14" />
          <line x1="10" y1="14" x2="10" y2="21" />
          <line x1="16" y1="14" x2="16" y2="21" />
        </svg>
      );

    case 'lamp':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M8 10h8l-2-7H10l-2 7z" />
          <line x1="12" y1="10" x2="12" y2="20" />
          <line x1="8" y1="20" x2="16" y2="20" />
        </svg>
      );

    case 'dining-table':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="3" rx="1" />
          <line x1="4" y1="10" x2="3" y2="20" />
          <line x1="20" y1="10" x2="21" y2="20" />
          <line x1="8" y1="10" x2="8" y2="18" />
          <line x1="16" y1="10" x2="16" y2="18" />
        </svg>
      );

    case 'chairs':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 3v9h6V3" />
          <rect x="5" y="11" width="8" height="3" rx="0.5" />
          <path d="M6 14v7" />
          <path d="M12 14v7" />
          <path d="M14 6v6h5V6" />
          <path d="M18 14v7" />
        </svg>
      );

    case 'sideboard':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="8" width="20" height="9" rx="1.5" />
          <line x1="8" y1="8" x2="8" y2="17" />
          <line x1="16" y1="8" x2="16" y2="17" />
          <circle cx="5.5" cy="12.5" r="0.8" fill="currentColor" />
          <circle cx="11.5" cy="12.5" r="0.8" fill="currentColor" />
          <circle cx="18.5" cy="12.5" r="0.8" fill="currentColor" />
          <line x1="4" y1="17" x2="4" y2="20" />
          <line x1="20" y1="17" x2="20" y2="20" />
        </svg>
      );

    case 'cabinet':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="3" width="16" height="16" rx="1.5" />
          <line x1="12" y1="3" x2="12" y2="19" />
          <line x1="4" y1="11" x2="20" y2="11" />
          <line x1="6" y1="19" x2="6" y2="21" />
          <line x1="18" y1="19" x2="18" y2="21" />
          <circle cx="10" cy="7" r="0.6" fill="currentColor" />
          <circle cx="14" cy="7" r="0.6" fill="currentColor" />
          <circle cx="10" cy="15" r="0.6" fill="currentColor" />
          <circle cx="14" cy="15" r="0.6" fill="currentColor" />
        </svg>
      );

    case 'stool':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <ellipse cx="12" cy="6" rx="6" ry="2" />
          <line x1="7" y1="7" x2="6" y2="20" />
          <line x1="17" y1="7" x2="18" y2="20" />
          <line x1="8" y1="14" x2="16" y2="14" />
        </svg>
      );

    case 'shoe-rack':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="6" width="18" height="14" rx="1.5" />
          <line x1="3" y1="11" x2="21" y2="11" />
          <line x1="3" y1="16" x2="21" y2="16" />
          <circle cx="6" cy="8.5" r="0.7" fill="currentColor" />
          <circle cx="6" cy="13.5" r="0.7" fill="currentColor" />
          <circle cx="6" cy="18.5" r="0.7" fill="currentColor" />
        </svg>
      );

    case 'bed-double':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 18v-8a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v8" />
          <path d="M2 14h20" />
          <path d="M5 8v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8" />
          <path d="M13 8v2a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V8" />
          <line x1="2" y1="18" x2="2" y2="21" />
          <line x1="22" y1="18" x2="22" y2="21" />
        </svg>
      );

    case 'bed-single':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 18v-7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v7" />
          <path d="M3 14h18" />
          <path d="M8 9v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V9" />
          <line x1="3" y1="18" x2="3" y2="21" />
          <line x1="21" y1="18" x2="21" y2="21" />
        </svg>
      );

    case 'bunk-bed':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="3" x2="3" y2="21" />
          <line x1="21" y1="3" x2="21" y2="21" />
          <rect x="3" y="6" width="18" height="4" rx="0.5" />
          <rect x="3" y="15" width="18" height="4" rx="0.5" />
          <line x1="17" y1="6" x2="17" y2="19" strokeDasharray="2 2" />
        </svg>
      );

    case 'crib':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="6" width="16" height="12" rx="1.5" />
          <line x1="8" y1="6" x2="8" y2="18" />
          <line x1="12" y1="6" x2="12" y2="18" />
          <line x1="16" y1="6" x2="16" y2="18" />
          <line x1="4" y1="18" x2="4" y2="21" />
          <line x1="20" y1="18" x2="20" y2="21" />
          <path d="M2 21c4-1 8-1 10 0s6 1 10 0" />
        </svg>
      );

    case 'baby-table':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="5" width="16" height="13" rx="1.5" />
          <line x1="4" y1="10" x2="20" y2="10" />
          <line x1="6" y1="18" x2="6" y2="21" />
          <line x1="18" y1="18" x2="18" y2="21" />
          <circle cx="12" cy="14" r="1" fill="currentColor" />
          <path d="M8 3h8" />
        </svg>
      );

    case 'wardrobe':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="18" rx="1.5" />
          <line x1="12" y1="2" x2="12" y2="20" />
          <circle cx="10" cy="11" r="0.8" fill="currentColor" />
          <circle cx="14" cy="11" r="0.8" fill="currentColor" />
          <line x1="6" y1="20" x2="6" y2="22" />
          <line x1="18" y1="20" x2="18" y2="22" />
        </svg>
      );

    case 'dresser':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="15" rx="1.5" />
          <line x1="4" y1="9" x2="20" y2="9" />
          <line x1="4" y1="14" x2="20" y2="14" />
          <circle cx="12" cy="6.5" r="0.8" fill="currentColor" />
          <circle cx="12" cy="11.5" r="0.8" fill="currentColor" />
          <circle cx="12" cy="16.5" r="0.8" fill="currentColor" />
          <line x1="6" y1="19" x2="6" y2="21" />
          <line x1="18" y1="19" x2="18" y2="21" />
        </svg>
      );

    case 'nightstand':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="8" width="14" height="9" rx="1.5" />
          <line x1="5" y1="12" x2="19" y2="12" />
          <circle cx="12" cy="10" r="0.6" fill="currentColor" />
          <line x1="7" y1="17" x2="6" y2="21" />
          <line x1="17" y1="17" x2="18" y2="21" />
        </svg>
      );

    case 'fridge':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="2" width="14" height="19" rx="2" />
          <line x1="5" y1="9" x2="19" y2="9" />
          <line x1="8" y1="5" x2="8" y2="7" />
          <line x1="8" y1="12" x2="8" y2="15" />
        </svg>
      );

    case 'fridge-american':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="2" width="18" height="19" rx="2" />
          <line x1="12" y1="2" x2="12" y2="21" />
          <line x1="10" y1="7" x2="10" y2="11" />
          <line x1="14" y1="7" x2="14" y2="11" />
          <rect x="5" y="13" width="4" height="4" rx="0.5" />
        </svg>
      );

    case 'freezer':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="7" width="18" height="13" rx="1.5" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="10" y1="12" x2="14" y2="12" />
          <circle cx="18" cy="15" r="1" fill="currentColor" />
        </svg>
      );

    case 'wine-cellar':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <rect x="8" y="6" width="8" height="12" rx="1" strokeDasharray="1 1" />
          <circle cx="10" cy="9" r="1" fill="currentColor" />
          <circle cx="14" cy="9" r="1" fill="currentColor" />
          <circle cx="10" cy="13" r="1" fill="currentColor" />
          <circle cx="14" cy="13" r="1" fill="currentColor" />
        </svg>
      );

    case 'washing-machine':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="19" rx="2" />
          <circle cx="12" cy="12" r="4.5" />
          <circle cx="12" cy="12" r="2.5" strokeDasharray="2 2" />
          <circle cx="7" cy="5.5" r="0.8" fill="currentColor" />
          <line x1="14" y1="5.5" x2="17" y2="5.5" />
        </svg>
      );

    case 'dishwasher':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="19" rx="2" />
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="8" y1="4.5" x2="16" y2="4.5" />
          <circle cx="7" cy="13" r="1.5" />
          <circle cx="17" cy="13" r="1.5" />
          <line x1="6" y1="16" x2="18" y2="16" />
        </svg>
      );

    case 'oven':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="19" rx="2" />
          <circle cx="7" cy="5" r="0.8" fill="currentColor" />
          <circle cx="11" cy="5" r="0.8" fill="currentColor" />
          <circle cx="15" cy="5" r="0.8" fill="currentColor" />
          <rect x="7" y="9" width="10" height="9" rx="1" />
          <line x1="9" y1="12" x2="15" y2="12" />
        </svg>
      );

    case 'desk':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="3" rx="0.8" />
          <line x1="4" y1="9" x2="4" y2="20" />
          <rect x="14" y="9" width="6" height="11" rx="0.5" />
          <line x1="14" y1="14" x2="20" y2="14" />
          <circle cx="17" cy="11.5" r="0.6" fill="currentColor" />
          <circle cx="17" cy="17" r="0.6" fill="currentColor" />
        </svg>
      );

    case 'office-chair':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="3" width="12" height="7" rx="2" />
          <rect x="5" y="11" width="14" height="3" rx="1" />
          <line x1="12" y1="14" x2="12" y2="18" />
          <path d="M8 21l4-3 4 3" />
          <path d="M4 8v3h2" />
          <path d="M20 8v3h-2" />
        </svg>
      );

    case 'file-cabinet':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="17" rx="1.5" />
          <line x1="5" y1="9" x2="19" y2="9" />
          <line x1="5" y1="14" x2="19" y2="14" />
          <rect x="9" y="5.5" width="6" height="1.5" rx="0.5" />
          <rect x="9" y="11" width="6" height="1.5" rx="0.5" />
          <rect x="9" y="16" width="6" height="1.5" rx="0.5" />
        </svg>
      );

    case 'computer':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="13" height="9" rx="1" />
          <line x1="7" y1="15" x2="12" y2="15" />
          <line x1="9.5" y1="12" x2="9.5" y2="15" />
          <rect x="18" y="4" width="4" height="14" rx="0.8" />
          <line x1="2" y1="19" x2="15" y2="19" />
        </svg>
      );

    case 'boxes':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );

    case 'boxes-heavy':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="15" rx="2" />
          <line x1="3" y1="10" x2="21" y2="10" />
          <line x1="9" y1="5" x2="9" y2="20" />
          <line x1="15" y1="5" x2="15" y2="20" />
        </svg>
      );

    case 'dish-box':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="8" cy="9" r="2" />
          <circle cx="16" cy="9" r="2" />
          <circle cx="8" cy="15" r="2" />
          <circle cx="16" cy="15" r="2" />
          <line x1="12" y1="4" x2="12" y2="20" strokeDasharray="2 2" />
        </svg>
      );

    case 'wardrobe-box':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="2" width="16" height="20" rx="1.5" />
          <line x1="4" y1="6" x2="20" y2="6" />
          <path d="M12 9v1" />
          <path d="M9 13l3-2 3 2v4H9z" />
        </svg>
      );

    case 'luggage':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="6" y="6" width="12" height="14" rx="2" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
          <line x1="6" y1="12" x2="18" y2="12" />
          <line x1="6" y1="16" x2="18" y2="16" />
          <circle cx="8" cy="21" r="1" fill="currentColor" />
          <circle cx="16" cy="21" r="1" fill="currentColor" />
        </svg>
      );

    case 'bike':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="5.5" cy="17.5" r="3.5" />
          <circle cx="18.5" cy="17.5" r="3.5" />
          <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5L8.5 12l3-5 3.5 3h3" />
          <path d="M5.5 17.5l4.5-5.5" />
        </svg>
      );

    case 'outdoor':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2v10" />
          <path d="M3 12a9 9 0 0 1 18 0H3z" />
          <line x1="12" y1="12" x2="12" y2="21" />
          <line x1="8" y1="21" x2="16" y2="21" />
        </svg>
      );

    case 'bbq':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 11a8 8 0 0 0 16 0H4z" />
          <line x1="7" y1="11" x2="5" y2="20" />
          <line x1="17" y1="11" x2="19" y2="20" />
          <line x1="8" y1="17" x2="16" y2="17" />
          <path d="M8 8c0-2 2-3 2-5" />
          <path d="M12 8c0-2 2-3 2-5" />
          <path d="M16 8c0-2 2-3 2-5" />
        </svg>
      );

    case 'gym':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 5v14" />
          <path d="M18 5v14" />
          <rect x="3" y="8" width="3" height="8" rx="1" />
          <rect x="18" y="8" width="3" height="8" rx="1" />
          <line x1="6" y1="12" x2="18" y2="12" />
        </svg>
      );

    case 'piano':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="5" width="18" height="14" rx="2" />
          <path d="M3 13h18" />
          <line x1="7" y1="13" x2="7" y2="17" />
          <line x1="11" y1="13" x2="11" y2="17" />
          <line x1="15" y1="13" x2="15" y2="17" />
          <line x1="19" y1="13" x2="19" y2="17" />
          <line x1="6" y1="19" x2="5" y2="22" />
          <line x1="18" y1="19" x2="19" y2="22" />
        </svg>
      );

    case 'frame':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      );

    case 'plant':
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M7 14h10l-1.5 7h-7L7 14z" />
          <path d="M12 14V3" />
          <path d="M12 8c-3-1-4-4-4-5 3 0 4 3 4 5z" />
          <path d="M12 6c3-1 4-4 4-5-3 0-4 3-4 5z" />
        </svg>
      );

    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <line x1="12" y1="8" x2="12" y2="16" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
  }
};
