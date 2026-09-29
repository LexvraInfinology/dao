'use client';

import React, { useState, useEffect } from 'react';
import { useWallet } from '@/context/WalletContext';
import { useAuthContext } from '@/context/AuthContext';
import { useDaoMember } from '@/hooks/useApi';

export const WHATSAPP_DAO_GROUP_URL = 'https://chat.whatsapp.com/GR19373Pgq7LezBKtXC0ng';

interface DaoWhatsAppCircleProps {
  /** If provided, renders an inline round circle (e.g. for header). Otherwise renders the responsive floating widget. */
  variant?: 'floating' | 'header' | 'badge';
  className?: string;
}

export const DaoWhatsAppCircle: React.FC<DaoWhatsAppCircleProps> = ({
  variant = 'floating',
  className = '',
}) => {
  const wallet = useWallet();
  const auth = useAuthContext();
  const activeAddress = wallet.base58Address || wallet.hexAddress || auth.user?.address || '';

  const [mounted, setMounted] = useState<boolean>(false);
  const [storedAddr, setStoredAddr] = useState<string>('');
  const [isDev, setIsDev] = useState<boolean>(false);
  const [showTooltip, setShowTooltip] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
    try {
      const dev =
        sessionStorage.getItem('equora_dao_preview') === 'true' ||
        localStorage.getItem('equora_dev_mode') === 'true' ||
        window.location.search.includes('dev=');
      setIsDev(dev);

      const stored = localStorage.getItem('trobsafe_address') || localStorage.getItem('equora_auth_address');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setStoredAddr(parsed?.base58 || parsed?.hex || stored);
        } catch {
          setStoredAddr(stored);
        }
      }
    } catch {
      /* ignore */
    }
  }, []);

  const resolvedAddress = activeAddress || storedAddr;
  const { data: memberData } = useDaoMember(resolvedAddress);

  if (!mounted) {
    return null;
  }

  // Only available for dashboard members who REALLY have an active verified seat in the DAO
  const isRealSeatMember = Boolean(
    (memberData?.isMember && (memberData.position ?? 0) > 0) ||
    ((auth.user?.daoPosition ?? 0) > 0)
  );

  if (!isRealSeatMember) {
    return null;
  }

  // 1. Header round circle variant
  if (variant === 'header') {
    return (
      <a
        href={WHATSAPP_DAO_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Equora_Fi DAO Council WhatsApp Group"
        title="Equora_Fi DAO WhatsApp Group (Seat Members Only)"
        className={`relative w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-[0_2px_10px_rgba(37,211,102,0.35)] hover:shadow-[0_4px_16px_rgba(37,211,102,0.5)] transition-all duration-200 hover:scale-105 active:scale-95 shrink-0 group ${className}`}
      >
        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white animate-pulse" />
        <svg className="w-4 h-4 sm:w-4.5 sm:h-4.5 fill-current" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>
      </a>
    );
  }

  // 2. Badge variant (e.g. for sidebar or dropdown)
  if (variant === 'badge') {
    return (
      <a
        href={WHATSAPP_DAO_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-2.5 p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#0F5132] border border-emerald-500/30 transition-all duration-200 group ${className}`}
      >
        <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shrink-0 shadow-xs group-hover:scale-105 transition-transform">
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-bold font-jakarta text-[#071A4A] truncate">
            DAO WhatsApp Group
          </div>
          <div className="text-[10px] text-emerald-700 font-medium">
            Council Members Only
          </div>
        </div>
      </a>
    );
  }

  // 3. Floating action circle (responsive on all screen sizes)
  return (
    <div
      className={`fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 select-none flex items-center gap-3 ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip Pill (Desktop & Expanded) */}
      <div
        className={`hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 text-white text-xs font-semibold backdrop-blur-md border border-slate-700/60 shadow-lg transition-all duration-200 pointer-events-none ${
          showTooltip ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-[#25D366] animate-pulse" />
        <span>Equora_Fi DAO WhatsApp Group</span>
      </div>

      {/* Round Circle Button */}
      <a
        href={WHATSAPP_DAO_GROUP_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Equora_Fi DAO Council WhatsApp Group"
        className="relative group w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#25D366] hover:bg-[#1EBE5D] text-white flex items-center justify-center shadow-[0_6px_25px_rgba(37,211,102,0.45)] hover:shadow-[0_8px_32px_rgba(37,211,102,0.65)] transition-all duration-300 hover:scale-110 active:scale-95 cursor-pointer ring-4 ring-white/80"
      >
        {/* Soft Ambient Pulse Ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-30 animate-ping pointer-events-none" />

        {/* WhatsApp Icon */}
        <svg className="w-6 h-6 sm:w-7 sm:h-7 fill-current relative z-10 transition-transform group-hover:rotate-6" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
        </svg>

        {/* Council verified status badge dot */}
        <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[8px] font-bold text-white shadow-xs">
          ✓
        </span>
      </a>
    </div>
  );
};
