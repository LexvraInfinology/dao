'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Zap, Terminal } from 'lucide-react';

interface DevModeButtonProps {
  className?: string;
  variant?: 'navbar' | 'compact' | 'drawer';
}

export const DevModeButton: React.FC<DevModeButtonProps> = ({
  className = '',
  variant = 'navbar',
}) => {
  const router = useRouter();

  const handleEnterDevMode = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      sessionStorage.setItem('equora_dao_preview', 'true');
      localStorage.setItem('equora_dev_mode', 'true');
      document.cookie = 'equora_dev_mode=true; path=/; max-age=86400';
    } catch (err) {
      console.warn('Storage access warning in dev mode:', err);
    }
    // Directly navigate to /dao in dev mode bypass
    window.location.href = '/dao?dev=1';
  };

  if (variant === 'drawer') {
    return (
      <button
        onClick={handleEnterDevMode}
        type="button"
        className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border border-amber-300 transition-all cursor-pointer ${className}`}
      >
        <Zap className="w-3.5 h-3.5 text-amber-600 fill-amber-600" />
        <span>⚡ Dev Mode: Direct Access to DAO</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleEnterDevMode}
      type="button"
      title="Direct access to /dao without connecting wallet (Dev Preview Mode)"
      className={`group relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
        variant === 'compact'
          ? 'h-9 bg-amber-50 hover:bg-amber-100/80 text-amber-800 border border-amber-200/80 shadow-xs'
          : 'bg-gradient-to-r from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 text-amber-800 border border-amber-200/90 shadow-xs hover:border-amber-300'
      } ${className}`}
    >
      <span className="flex items-center justify-center w-4 h-4 rounded-full bg-amber-200/70 text-amber-800 shrink-0">
        <Zap className="w-2.5 h-2.5 fill-amber-700 text-amber-700 group-hover:scale-110 transition-transform" />
      </span>
      <span className="tracking-tight">
        <span className="hidden xl:inline text-amber-700/80 font-medium">Dev: </span>
        <span>Enter DAO</span>
      </span>
      <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider bg-amber-200/60 text-amber-900 ml-0.5">
        Bypass
      </span>
    </button>
  );
};
