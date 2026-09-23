/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface LogoProps {
  variant?: 'horizontal' | 'vertical' | 'mark';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

/**
 * Official Logo Emblem for WE MOVE DÉMÉNAGEMENT
 * Features:
 * - Fluid "W" container in vibrant brand blue (#0082CA)
 * - 2 vertical red rounded capsules (#EE3E38)
 * - Tightly cropped viewBox (32 10 156 117) so there is zero extra whitespace,
 *   allowing text to sit flush and close to the symbol.
 */
export const LogoMark: React.FC<{
  className?: string;
  width?: number | string;
  height?: number | string;
}> = ({ className = '', width = '100%', height = '100%' }) => {
  return (
    <svg
      viewBox="32 10 156 117"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={{ width, height }}
      aria-hidden="true"
    >
      {/* Blue "W" fluid container */}
      <path
        d="M 32,28 C 32,13 56,13 56,28 L 56,76 C 56,92 64,102 77,102 C 90,102 98,92 98,76 L 98,28 C 98,13 122,13 122,28 L 122,76 C 122,92 130,102 143,102 C 156,102 164,92 164,76 L 164,28 C 164,13 188,13 188,28 L 188,76 C 188,114 162,127 143,127 C 126,127 116,113 110,103 C 104,113 94,127 77,127 C 58,127 32,114 32,76 Z"
        fill="#0082CA"
      />
      {/* Left Red Capsule */}
      <rect x="64" y="10" width="26" height="78" rx="13" fill="#EE3E38" />
      {/* Right Red Capsule */}
      <rect x="130" y="10" width="26" height="78" rx="13" fill="#EE3E38" />
    </svg>
  );
};

/**
 * Text block where "We Move" and "Déménagement" occupy the EXACT SAME WIDTH (largeur égale).
 * Uses SVG textLength="260" and calibrated font sizes to guarantee identical width.
 */
export const LogoText: React.FC<{
  width?: number | string;
  height?: number | string;
  className?: string;
  showSubtitle?: boolean;
}> = ({ width = '100%', height = '100%', className = '', showSubtitle = true }) => {
  if (!showSubtitle) {
    return (
      <svg
        viewBox="0 0 260 44"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`select-none overflow-visible ${className}`}
        style={{ width, height }}
        aria-label="We Move"
      >
        <text
          x="0"
          y="35"
          fill="#0082CA"
          fontFamily="'Roboto Slab', serif"
          fontWeight="900"
          fontSize="48"
          textLength="260"
          lengthAdjust="spacingAndGlyphs"
        >
          We Move
        </text>
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 260 74"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none overflow-visible ${className}`}
      style={{ width, height }}
      aria-label="We Move Déménagement"
    >
      {/* "We Move" in Brand Blue - Exactly 260px wide */}
      <text
        x="0"
        y="35"
        fill="#0082CA"
        fontFamily="'Roboto Slab', serif"
        fontWeight="900"
        fontSize="44"
        textLength="260"
        lengthAdjust="spacingAndGlyphs"
      >
        We Move
      </text>

      {/* "Déménagement" in Brand Red - Exactly 260px wide, equal width to "We Move" */}
      <text
        x="0"
        y="69"
        fill="#EE3E38"
        fontFamily="'Roboto Slab', serif"
        fontWeight="900"
        fontSize="26.2"
        textLength="260"
        lengthAdjust="spacingAndGlyphs"
      >
        Déménagement
      </text>
    </svg>
  );
};

export const Logo: React.FC<LogoProps> = ({
  variant = 'horizontal',
  className = '',
  size = 'md',
  showSubtitle = true,
}) => {
  // Refined, well-proportioned size presets with tight spacing to the symbol
  const sizeMap = {
    sm: {
      markH: 30,
      markW: 40,
      textH: 28,
      textW: 98,
      gap: 'gap-1.5',
      vertMarkW: 72,
      vertMarkH: 54,
      vertTextW: 130,
      vertTextH: 37,
      vertGap: 'gap-1.5',
    },
    md: {
      markH: 38,
      markW: 50.7,
      textH: 35,
      textW: 123,
      gap: 'gap-2',
      vertMarkW: 90,
      vertMarkH: 67.5,
      vertTextW: 155,
      vertTextH: 44,
      vertGap: 'gap-2',
    },
    lg: {
      markH: 46,
      markW: 61.3,
      textH: 42,
      textW: 147.5,
      gap: 'gap-2.5',
      vertMarkW: 110,
      vertMarkH: 82.5,
      vertTextW: 185,
      vertTextH: 52.7,
      vertGap: 'gap-2.5',
    },
    xl: {
      markH: 56,
      markW: 74.7,
      textH: 51,
      textW: 179,
      gap: 'gap-3',
      vertMarkW: 136,
      vertMarkH: 102,
      vertTextW: 220,
      vertTextH: 62.6,
      vertGap: 'gap-3',
    },
  };

  const current = sizeMap[size];

  // Mark icon only
  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 ${className}`}>
        <LogoMark width={current.markW} height={current.markH} />
      </div>
    );
  }

  // Vertical stacked variant (matches exact geometry of the original brand logo, with tighter spacing)
  if (variant === 'vertical') {
    return (
      <div className={`inline-flex flex-col items-center justify-center text-center ${current.vertGap} ${className}`}>
        <LogoMark width={current.vertMarkW} height={current.vertMarkH} />
        <div className="flex justify-center w-full">
          <LogoText
            width={current.vertTextW}
            height={current.vertTextH}
            showSubtitle={showSubtitle}
          />
        </div>
      </div>
    );
  }

  // Horizontal variant: Emblem + Equal-width text block sitting close and harmonious
  return (
    <div className={`inline-flex items-center ${current.gap} ${className}`}>
      <div className="shrink-0 flex items-center">
        <LogoMark width={current.markW} height={current.markH} />
      </div>
      <div className="flex items-center">
        <LogoText
          width={current.textW}
          height={current.textH}
          showSubtitle={showSubtitle}
        />
      </div>
    </div>
  );
};
