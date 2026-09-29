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
      className={`group relative flex items-center gap-1.5 transition-all duration-200 cursor-pointer ${
        variant === 'compact'
          ? 'h-7.5 px-2 rounded-lg text-[11px] font-medium bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/80 shadow-xs'
          : 'h-8 px-2.5 rounded-lg text-[11.5px] font-medium bg-slate-100/90 hover:bg-slate-200/90 text-slate-600 hover:text-slate-900 border border-slate-200/70 transition-colors'
      } ${className}`}
    >
      <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-amber-100 text-amber-600 shrink-0">
        <Zap className="w-2.5 h-2.5 fill-amber-500 text-amber-500 group-hover:scale-110 transition-transform" />
      </span>
      <span className={`tracking-tight ${variant === 'compact' ? 'hidden sm:inline' : ''}`}>
        <span>Dev DAO</span>
      </span>
      <span className={`px-1 py-0.2 rounded text-[8.5px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700 ml-0.5 ${variant === 'compact' ? 'hidden sm:inline-block' : ''}`}>
        Bypass
      </span>
    </button>
  );
};
