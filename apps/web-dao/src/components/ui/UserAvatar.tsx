'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  getStoredAvatarSeed,
  randomizeAvatarSeed,
  getAccountAvatarUrl,
  generateLocalSvgAvatar,
} from '@/utils/avatar';
import { Dices } from 'lucide-react';

export interface UserAvatarProps {
  address?: string | null;
  userId?: number | string | null;
  customSeed?: string | null;
  size?: number;
  className?: string;
  showStatus?: boolean;
  isActive?: boolean;
  allowRandomize?: boolean;
  onRandomized?: (seed: string) => void;
  roundedClassName?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  address,
  userId,
  customSeed,
  size = 48,
  className = '',
  showStatus = false,
  isActive = false,
  allowRandomize = false,
  onRandomized,
  roundedClassName = 'rounded-2xl',
}) => {
  const accountKey = customSeed || address || (userId ? `user_${userId}` : 'guest');
  const [seed, setSeed] = useState<string>(() => {
    // Initial deterministic seed before client hydration
    return customSeed || (address ? address.toLowerCase() : (userId ? `user_${userId}` : 'genesis_member'));
  });
  const [imgSrc, setImgSrc] = useState<string>('');
  const [hasError, setHasError] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  // Sync with localStorage on mount and listen to global avatar changes
  useEffect(() => {
    const currentSeed = getStoredAvatarSeed(accountKey);
    setSeed(currentSeed);
    setImgSrc(getAccountAvatarUrl(currentSeed));
    setHasError(false);

    const handleAvatarChange = (e: Event) => {
      const customEvt = e as CustomEvent<{ accountKey: string; seed: string }>;
      if (customEvt.detail?.accountKey === (accountKey || 'guest').trim().toLowerCase()) {
        setSeed(customEvt.detail.seed);
        setImgSrc(getAccountAvatarUrl(customEvt.detail.seed));
        setHasError(false);
      }
    };

    window.addEventListener('equora:avatar_changed', handleAvatarChange);
    return () => {
      window.removeEventListener('equora:avatar_changed', handleAvatarChange);
    };
  }, [accountKey]);

  const handleShuffle = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsRotating(true);
      setTimeout(() => setIsRotating(false), 500);

      const newSeed = randomizeAvatarSeed(accountKey);
      setSeed(newSeed);
      setImgSrc(getAccountAvatarUrl(newSeed));
      setHasError(false);
      onRandomized?.(newSeed);
    },
    [accountKey, onRandomized]
  );

  const handleImageError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(generateLocalSvgAvatar(seed));
    }
  };

  const currentSrc = imgSrc || generateLocalSvgAvatar(seed);

  return (
    <div
      className={`relative inline-flex items-center justify-center shrink-0 select-none group ${className}`}
      style={{ width: size, height: size }}
    >
      <div
        className={`w-full h-full ${roundedClassName} overflow-hidden shadow-xs border border-[#BFDBFE]/60 bg-gradient-to-br from-[#EBF3FA] to-[#D5E6F5] relative flex items-center justify-center`}
      >
        <img
          src={currentSrc}
          alt="Account Avatar"
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Online / Active status pulse badge */}
      {showStatus && (
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
          {isActive && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75" />
          )}
          <span
            className={`relative inline-flex rounded-full h-3.5 w-3.5 border-2 border-white shadow-xs ${
              isActive ? 'bg-[#10B981]' : 'bg-slate-400'
            }`}
          />
        </span>
      )}

      {/* Quick Shuffle / Randomize avatar button */}
      {allowRandomize && (
        <button
          onClick={handleShuffle}
          className={`absolute -top-1.5 -right-1.5 p-1 rounded-full bg-white/95 text-[#3C78B1] hover:text-[#14304A] hover:bg-white border border-[#BFDBFE] shadow-sm transition-all duration-200 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 ${
            isRotating ? 'rotate-180 scale-110' : ''
          }`}
          title="Randomize Profile Avatar"
          aria-label="Randomize Profile Avatar"
        >
          <Dices className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
