/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface TruckVisualizerProps {
  totalVolume: number;
  maxTruckCapacity: number;
  vehicleType: string;
  fillPercentage: number;
}

export const TruckVisualizer: React.FC<TruckVisualizerProps> = ({
  totalVolume,
  maxTruckCapacity,
  vehicleType,
  fillPercentage,
}) => {
  // Cap visual percentage between 0 and 100
  const clampedPercent = Math.min(100, Math.max(0, fillPercentage));

  return (
    <div className="w-full bg-[#1A1F26] text-white p-4 sm:p-5 rounded-2xl relative overflow-hidden border border-[#2D3540] shadow-sm">
      
      {/* Top Header Row inside visualizer */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#0082CA] animate-pulse" />
          <span className="text-[12px] font-mono uppercase tracking-wider text-slate-300 font-medium">
            Simulation de chargement
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-right">
          <span className="text-[11px] font-mono text-slate-400">Capacité :</span>
          <span className="text-[12px] font-mono font-semibold text-[#38BDF8]">
            {maxTruckCapacity} m³ max
          </span>
        </div>
      </div>

      {/* SVG Moving Truck Illustration with Dynamic Bay Fill */}
      <div className="relative w-full py-1">
        <svg
          viewBox="0 0 520 180"
          className="w-full h-auto drop-shadow-md select-none"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradient for truck load bay fill */}
            <linearGradient id="truckLoadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0082CA" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.95" />
            </linearGradient>

            {/* Pattern for boxes stacked in the truck */}
            <pattern id="cargoBoxPattern" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
              <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.2)" />
            </pattern>

            <clipPath id="cargoBayClip">
              {/* Internal cargo bay boundary */}
              <rect x="25" y="24" width="310" height="106" rx="4" />
            </clipPath>
          </defs>

          {/* ROAD BASE */}
          <line x1="10" y1="162" x2="510" y2="162" stroke="#334155" strokeWidth="2.5" strokeDasharray="8 6" />

          {/* TRUCK SHADOW */}
          <ellipse cx="245" cy="162" rx="225" ry="6" fill="#000000" fillOpacity="0.4" />

          {/* === CARGO CONTAINER HOLD (LEFT) === */}
          {/* External Container Body */}
          <rect
            x="20"
            y="20"
            width="320"
            height="114"
            rx="6"
            fill="#242B35"
            stroke="#475569"
            strokeWidth="2"
          />

          {/* Cargo Bay Inside Area (Empty Background) */}
          <rect x="25" y="24" width="310" height="106" rx="4" fill="#13171D" />

          {/* Volume Grid Scale Lines inside Hold */}
          <line x1="87" y1="24" x2="87" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="149" y1="24" x2="149" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="211" y1="24" x2="211" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="273" y1="24" x2="273" y2="130" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />

          {/* Scale labels (percentages) */}
          <text x="87" y="124" fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="middle">25%</text>
          <text x="149" y="124" fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="middle">50%</text>
          <text x="211" y="124" fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="middle">75%</text>
          <text x="273" y="124" fill="#64748B" fontSize="9" fontFamily="monospace" textAnchor="middle">90%</text>

          {/* DYNAMIC FILL LEVEL */}
          {clampedPercent > 0 && (
            <g clipPath="url(#cargoBayClip)">
              {/* Animated / styled color fill */}
              <rect
                x="25"
                y="24"
                width={(310 * clampedPercent) / 100}
                height="106"
                fill="url(#truckLoadGradient)"
                className="transition-all duration-300"
              />
              {/* Subtle box grid overlay */}
              <rect
                x="25"
                y="24"
                width={(310 * clampedPercent) / 100}
                height="106"
                fill="url(#cargoBoxPattern)"
                className="transition-all duration-300"
              />
              {/* Fill indicator marker line */}
              <line
                x1={25 + (310 * clampedPercent) / 100}
                y1="24"
                x2={25 + (310 * clampedPercent) / 100}
                y2="130"
                stroke="#FFFFFF"
                strokeWidth="2.5"
              />
            </g>
          )}

          {/* Container Brand Label on Roof */}
          <rect x="35" y="28" width="110" height="18" rx="3" fill="#1E293B" stroke="#334155" strokeWidth="1" />
          <text x="42" y="41" fill="#38BDF8" fontSize="10" fontWeight="bold" fontFamily="sans-serif">
            WE MOVE · LOGISTIQUE
          </text>

          {/* Container Side Ribs and Tie-down Bars */}
          <line x1="20" y1="20" x2="340" y2="20" stroke="#64748B" strokeWidth="2" />
          <line x1="20" y1="134" x2="340" y2="134" stroke="#64748B" strokeWidth="2" />

          {/* REAR HYDRAULIC TAILGATE (Left Edge) */}
          <rect x="12" y="32" width="7" height="96" rx="2" fill="#475569" stroke="#64748B" strokeWidth="1" />
          <line x1="8" y1="110" x2="15" y2="128" stroke="#F59E0B" strokeWidth="2.5" />

          {/* CHASSIS & BEAMS */}
          <rect x="40" y="132" width="370" height="12" rx="2" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />

          {/* FUEL TANK & UNDERBODY BOXES */}
          <rect x="145" y="136" width="46" height="16" rx="2" fill="#334155" stroke="#475569" strokeWidth="1" />
          <circle cx="156" cy="144" r="2.5" fill="#64748B" />

          {/* === TRUCK CABIN (RIGHT) === */}
          {/* Cabin Shell */}
          <path
            d="M340 50 L385 50 L425 82 L440 98 L440 134 L340 134 Z"
            fill="#0082CA"
            stroke="#38BDF8"
            strokeWidth="1.8"
          />

          {/* Cabin Windshield */}
          <path
            d="M382 54 L416 82 L382 82 Z"
            fill="#0F172A"
            stroke="#94A3B8"
            strokeWidth="1.2"
          />
          {/* Windshield Reflection */}
          <line x1="392" y1="60" x2="410" y2="80" stroke="#38BDF8" strokeWidth="1.5" strokeOpacity="0.7" />

          {/* Cabin Side Door & Window */}
          <rect x="348" y="58" width="28" height="24" rx="2" fill="#0F172A" stroke="#334155" strokeWidth="1" />
          <line x1="348" y1="92" x2="382" y2="92" stroke="#0284C7" strokeWidth="1" />
          <circle cx="376" cy="98" r="1.5" fill="#F8FAFC" /> {/* Door handle */}

          {/* Headlight */}
          <path d="M434 116 L440 116 L440 126 L434 126 Z" fill="#FDE047" stroke="#F59E0B" strokeWidth="1" />
          {/* Front Bumper / Grill */}
          <path d="M428 128 L446 128 L446 142 L428 142 Z" fill="#1E293B" stroke="#475569" strokeWidth="1.5" />
          <line x1="432" y1="133" x2="442" y2="133" stroke="#64748B" strokeWidth="1" />
          <line x1="432" y1="137" x2="442" y2="137" stroke="#64748B" strokeWidth="1" />

          {/* Rear-view Mirror */}
          <rect x="408" y="76" width="4" height="12" rx="1" fill="#334155" />
          <line x1="404" y1="80" x2="408" y2="80" stroke="#475569" strokeWidth="1.5" />

          {/* === WHEELS === */}
          {/* Rear Dual Wheels (2 wheels on the cargo side) */}
          <g>
            <circle cx="82" cy="146" r="19" fill="#0F172A" stroke="#475569" strokeWidth="3" />
            <circle cx="82" cy="146" r="11" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
            <circle cx="82" cy="146" r="4" fill="#94A3B8" />
            <circle cx="78" cy="143" r="1.2" fill="#E2E8F0" />
            <circle cx="86" cy="143" r="1.2" fill="#E2E8F0" />
            <circle cx="82" cy="150" r="1.2" fill="#E2E8F0" />
          </g>

          <g>
            <circle cx="126" cy="146" r="19" fill="#0F172A" stroke="#475569" strokeWidth="3" />
            <circle cx="126" cy="146" r="11" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
            <circle cx="126" cy="146" r="4" fill="#94A3B8" />
            <circle cx="122" cy="143" r="1.2" fill="#E2E8F0" />
            <circle cx="130" cy="143" r="1.2" fill="#E2E8F0" />
            <circle cx="126" cy="150" r="1.2" fill="#E2E8F0" />
          </g>

          {/* Front Cabin Wheel */}
          <g>
            <circle cx="392" cy="146" r="19" fill="#0F172A" stroke="#475569" strokeWidth="3" />
            <circle cx="392" cy="146" r="11" fill="#334155" stroke="#64748B" strokeWidth="1.5" />
            <circle cx="392" cy="146" r="4" fill="#94A3B8" />
            <circle cx="388" cy="143" r="1.2" fill="#E2E8F0" />
            <circle cx="396" cy="143" r="1.2" fill="#E2E8F0" />
            <circle cx="392" cy="150" r="1.2" fill="#E2E8F0" />
          </g>
        </svg>
      </div>

      {/* Footer Metrics Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#2D3540] text-xs">
        <div className="flex items-center gap-1.5 text-slate-300">
          <span className="font-semibold text-white">{vehicleType}</span>
          <span className="text-slate-500">·</span>
          <span className="text-slate-400">Taux de remplissage :</span>
          <span className="font-mono font-bold text-[#38BDF8]">{clampedPercent}%</span>
        </div>

        <div className="flex items-center gap-1 font-mono text-[11.5px]">
          <span className="text-slate-400">Volume sélectionné :</span>
          <span className="text-white font-bold">{totalVolume} m³</span>
          <span className="text-slate-500">/</span>
          <span className="text-slate-400">{maxTruckCapacity} m³</span>
        </div>
      </div>

    </div>
  );
};
