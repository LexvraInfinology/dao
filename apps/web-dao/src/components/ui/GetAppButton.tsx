'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Download, Smartphone, ExternalLink, ChevronDown, Check, Shield } from 'lucide-react';

interface GetAppButtonProps {
  className?: string;
  variant?: 'navbar' | 'compact' | 'badge';
  highlightIfNotInstalled?: boolean;
}

export const GetAppButton: React.FC<GetAppButtonProps> = ({
  className = '',
  variant = 'navbar',
  highlightIfNotInstalled = true,
}) => {
  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState<'android' | 'ios' | 'desktop'>('desktop');
  const [isInstalled, setIsInstalled] = useState<boolean | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Detect Device
    const ua = navigator.userAgent || '';
    if (/Android/i.test(ua)) {
      setDevice('android');
    } else if (/iPhone|iPad|iPod/i.test(ua)) {
      setDevice('ios');
    } else {
      setDevice('desktop');
    }

    // Check if TrobSafe is injected
    const checkTrob = () => {
      const anyWin = window as any;
      const detected = !!(
        anyWin.trobSafe ||
        anyWin.trobWeb?.defaultAddress?.base58 ||
        anyWin.tronLink?.tronWeb
      );
      setIsInstalled(detected);
    };

    checkTrob();
    const t = setTimeout(checkTrob, 500);
    return () => clearTimeout(t);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  // Primary action based on detected device
  const deviceLabel = device === 'android' ? 'Android APK' : device === 'ios' ? 'App Store' : 'Get App';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
          variant === 'compact'
            ? 'h-9 bg-white hover:bg-slate-50 border border-slate-200 text-[#071A4A] shadow-xs'
            : highlightIfNotInstalled && isInstalled === false
            ? 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-[#155EEF] shadow-xs ring-2 ring-blue-500/10'
            : 'bg-white hover:bg-slate-50 border border-slate-200 text-[#071A4A] shadow-xs'
        }`}
      >
        <span className="relative flex items-center justify-center w-5 h-5 rounded-md bg-blue-50 text-[#155EEF] overflow-hidden shrink-0">
          <img
            src="/icons/trobsafe.svg"
            alt="TrobSafe"
            className="w-4 h-4 object-contain transition-transform group-hover:scale-110"
            onError={(e) => {
              // Fallback to smartphone icon if image fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        </span>

        <span className="flex items-center gap-1.5 whitespace-nowrap">
          <span className="hidden xs:inline text-slate-500 font-normal">TrobSafe</span>
          <span>{deviceLabel}</span>
        </span>

        {highlightIfNotInstalled && isInstalled === false && (
          <span className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#155EEF] text-white tracking-wide">
            Install
          </span>
        )}

        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180 text-blue-600' : 'group-hover:text-slate-600'
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 sm:w-88 rounded-2xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_12px_36px_rgba(15,23,42,0.15)] z-50 p-3 animate-fadeIn">
          {/* Header */}
          <div className="p-2.5 pb-3 border-b border-slate-100 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-[#071A4A] p-2 flex items-center justify-center shrink-0 shadow-sm">
              <img src="/icons/trobsafe.svg" alt="TrobSafe" className="w-full h-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#071A4A] uppercase tracking-wide">TrobSafe Wallet</h4>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                  v1.0.22
                </span>
              </div>
              <p className="text-[11px] text-[#64748B] truncate">The official Trobium wallet for Android & iOS</p>
            </div>
          </div>

          {/* Quick Download Links */}
          <div className="py-2 space-y-1.5">
            {/* Android APK */}
            <a
              href="/downloads/trobsafe.apk"
              download="trobsafe.apk"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#3DDC84]/15 flex items-center justify-center p-1.5 shrink-0">
                  <img src="/icons/android.svg" alt="Android" className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#071A4A] group-hover:text-blue-600 flex items-center gap-1.5">
                    Download Android APK
                    {device === 'android' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-700 font-bold">
                        Your Device
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B]">Direct download · ~81 MB .apk</div>
                </div>
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-y-0.5 transition-all" />
            </a>

            {/* Google Play */}
            <a
              href="https://trobium.com/download"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center p-1.5 shrink-0">
                  <img src="/icons/google-play.svg" alt="Google Play" className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#071A4A] group-hover:text-blue-600 flex items-center gap-1.5">
                    Google Play Store
                  </div>
                  <div className="text-[11px] text-[#64748B]">Get on Google Play (Android)</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            </a>

            {/* Apple App Store */}
            <a
              href="https://apps.apple.com/app/trobsafe/id0000000000"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200/60 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center p-1.5 shrink-0">
                  <img src="/icons/apple.svg" alt="Apple" className="w-5 h-5 fill-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#071A4A] group-hover:text-blue-600 flex items-center gap-1.5">
                    Apple App Store
                    {device === 'ios' && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] bg-blue-100 text-blue-700 font-bold">
                        Your Device
                      </span>
                    )}
                  </div>
                  <div className="text-[11px] text-[#64748B]">Download for iPhone & iPad</div>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
            </a>

            {/* Chrome / Desktop Extension */}
            <Link
              href="/trobsafe/install"
              onClick={() => setOpen(false)}
              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-blue-50/70 border border-transparent hover:border-blue-100 transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center p-1.5 shrink-0">
                  <Download className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#071A4A] group-hover:text-blue-600">
                    Browser Extension (Chrome / Edge)
                  </div>
                  <div className="text-[11px] text-[#64748B]">Desktop Web3 extension guide & ZIP</div>
                </div>
              </div>
              <span className="text-[11px] font-bold text-blue-600">Guide →</span>
            </Link>
          </div>

          {/* Footer note */}
          <div className="pt-2.5 mt-1 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#64748B] px-1">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-emerald-500" />
              Non-custodial & secure
            </span>
            <Link
              href="/trobsafe/install"
              onClick={() => setOpen(false)}
              className="text-[#155EEF] font-bold hover:underline"
            >
              Installation Hub →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
