'use client';

import React from 'react';

interface EquoraLogoProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'xl';
}

const SIZE_MAP: Record<string, number> = {
  sm: 24,
  md: 36,
  lg: 48,
  xl: 64,
};

export const EquoraLogo: React.FC<EquoraLogoProps> = ({
  className = 'w-9 h-9',
  size,
}) => {
  const pixelSize = typeof size === 'number' ? size : (size ? SIZE_MAP[size] : 36);
  return (
    <img
      src="/dao/equoranewlogo.png"
      alt="EQUORA.FI Logo"
      width={pixelSize}
      height={pixelSize}
      className={`object-contain select-none pointer-events-none ${className}`}
      style={pixelSize ? { width: pixelSize, height: pixelSize } : undefined}
      loading="eager"
      decoding="async"
    />
  );
};

export const EquoraLogoFull: React.FC<EquoraLogoProps> = ({
  className = 'h-10 w-auto',
  size,
}) => {
  return (
    <img
      src="/dao/equoranewlogo.png"
      alt="EQUORA.FI"
      className={`object-contain select-none pointer-events-none ${className}`}
      style={size ? { height: size } : undefined}
      loading="eager"
      decoding="async"
    />
  );
};

