'use client';

import React, { useState } from 'react';

interface FlipCardProps {
  front: React.ReactNode;
  back: React.ReactNode;
  className?: string;
  trigger?: 'click' | 'hover';
}

export const FlipCard: React.FC<FlipCardProps> = ({
  front,
  back,
  className = '',
  trigger = 'click',
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleToggle = () => {
    if (trigger === 'click') {
      setIsFlipped(!isFlipped);
    }
  };

  return (
    <div
      className={`perspective-1000 group w-full cursor-pointer select-none ${className}`}
      onClick={handleToggle}
      onMouseEnter={() => trigger === 'hover' && setIsFlipped(true)}
      onMouseLeave={() => trigger === 'hover' && setIsFlipped(false)}
    >
      <div
        className={`relative w-full h-full duration-700 transform-style-3d transition-transform ease-out ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front Side */}
        <div className="w-full h-full backface-hidden">{front}</div>

        {/* Back Side */}
        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
          {back}
        </div>
      </div>
    </div>
  );
};
