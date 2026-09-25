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
  return (
    <img
      src="/dao/EquoraIcon.png"
      alt="EQUORA.FI Logo"
      width={size || 36}
      height={size || 36}
      className={`object-contain select-none pointer-events-none ${className}`}
      style={size ? { width: size, height: size } : undefined}
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
      src="/dao/EquoraLogoFull.png"
      alt="EQUORA.FI"
      className={`object-contain select-none pointer-events-none ${className}`}
      style={size ? { height: size } : undefined}
      loading="eager"
      decoding="async"
    />
  );
};

