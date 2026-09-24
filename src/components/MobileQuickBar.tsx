/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Link } from '../router';

export const MobileQuickBar: React.FC = () => {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#E2E8F0] shadow-2xl p-2.5 px-4 flex items-center justify-between gap-2 transition-all">
      {/* Phone Link */}
      <a
        href="tel:0173743690"
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] active:scale-95 transition-all text-center"
      >
        <svg className="w-4 h-4 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
        <span className="text-[11px] font-semibold mt-0.5">Appeler</span>
      </a>

      {/* Volume Estimator Link */}
      <Link
        href="/volume/"
        className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 rounded-xl bg-[#EBF5FB] border border-[#0082CA]/20 text-[#0082CA] active:scale-95 transition-all text-center"
      >
        <svg className="w-4 h-4 text-[#0082CA]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
        <span className="text-[11px] font-semibold mt-0.5">Calcul m³</span>
      </Link>

      {/* Primary Quote CTA */}
      <Link
        href="/devis/"
        className="flex-[1.4] flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#0082CA] to-[#00537A] text-white text-[13px] font-bold shadow-md shadow-[#0082CA]/30 active:scale-95 transition-all text-center"
      >
        <span>Devis gratuit</span>
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
};
