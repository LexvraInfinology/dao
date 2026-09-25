'use client';

import React from 'react';

interface EquoraLogoProps {
  className?: string;
  size?: number;
}

export const EquoraLogo: React.FC<EquoraLogoProps> = ({
  className = 'w-9 h-9',
  size,
}) => {
  const inlineStyle = size ? { width: size, height: size } : undefined;

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={inlineStyle}
      aria-label="EQUORA Logo"
    >
      <defs>
        {/* Soft Ambient Radial Crystal Glow */}
        <radialGradient id="eqAmbientGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.45" />
          <stop offset="60%" stopColor="#155EEF" stopOpacity="0.2" />
          <stop offset="100%" stopColor="#155EEF" stopOpacity="0" />
        </radialGradient>

        {/* Top Facet Gradients */}
        <linearGradient id="eqFacetTL" x1="18" y1="20" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#7DD3FC" />
          <stop offset="100%" stopColor="#155EEF" />
        </linearGradient>

        <linearGradient id="eqFacetTR" x1="82" y1="20" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* Bottom Facet Gradients */}
        <linearGradient id="eqFacetBL" x1="18" y1="80" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#0B1A42" />
        </linearGradient>

        <linearGradient id="eqFacetBR" x1="82" y1="80" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0D255E" />
        </linearGradient>

        {/* Central Core Diamond Highlight */}
        <linearGradient id="eqCoreHighlight" x1="50" y1="26" x2="50" y2="74" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#E0F2FE" stopOpacity="0.9" />
          <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#0284C7" stopOpacity="0.3" />
        </linearGradient>

        {/* Subtle Drop Glow Filter */}
        <filter id="eqJewelGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ambient Glow behind crystal */}
      <circle cx="50" cy="50" r="38" fill="url(#eqAmbientGlow)" />

      {/* Main 3D Octahedral Crystal Facets */}
      <g filter="url(#eqJewelGlow)">
        {/* Top Left Apex Facet */}
        <polygon points="50,11 22,50 50,50" fill="url(#eqFacetTL)" />

        {/* Top Right Apex Facet */}
        <polygon points="50,11 78,50 50,50" fill="url(#eqFacetTR)" />

        {/* Bottom Left Apex Facet */}
        <polygon points="50,89 22,50 50,50" fill="url(#eqFacetBL)" />

        {/* Bottom Right Apex Facet */}
        <polygon points="50,89 78,50 50,50" fill="url(#eqFacetBR)" />

        {/* Central Internal Diamond Facet for 3D depth */}
        <polygon points="50,28 35,50 50,72 65,50" fill="url(#eqCoreHighlight)" />

        {/* Crisp illuminated inner seam lines */}
        <line x1="22" y1="50" x2="78" y2="50" stroke="#BAE6FD" strokeWidth="1.8" strokeLinecap="round" strokeOpacity="0.95" />
        <line x1="50" y1="11" x2="50" y2="89" stroke="#E0F2FE" strokeWidth="1.6" strokeLinecap="round" strokeOpacity="0.9" />

        {/* Diamond Apex Sparkle */}
        <circle cx="50" cy="11" r="1.5" fill="#FFFFFF" />
        <circle cx="50" cy="50" r="1.8" fill="#FFFFFF" />
      </g>
    </svg>
  );
};
