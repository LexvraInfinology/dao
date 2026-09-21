"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "../../services/i18n/I18nContext";
import { Language } from "../../services/i18n/translations";

const LANGUAGES: { code: Language; label: string; flag: string }[] = [
  { code: "en", label: "English (CA)", flag: "🇨🇦" },
  { code: "fr", label: "Français", flag: "⚜️" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export function LanguageSwitcher() {
  const { language, setLanguage } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const current = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 rounded-lg bg-surface-container-high/60 hover:bg-surface-container-high border border-outline-variant/30 text-on-surface text-xs font-semibold tracking-wide transition-all shadow-sm"
        title="Change Language"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline uppercase">{current.code}</span>
        <span className="material-symbols-outlined text-[13px] sm:text-[14px] text-outline">expand_more</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 rounded-xl bg-surface-container-highest/95 backdrop-blur-2xl border border-outline-variant/40 shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                setLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`w-full flex items-center justify-between px-4 py-2 text-xs font-medium transition-colors ${
                language === lang.code
                  ? "bg-primary/20 text-primary font-bold"
                  : "text-on-surface hover:bg-surface-variant/50"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{lang.flag}</span>
                <span>{lang.label}</span>
              </div>
              {language === lang.code && (
                <span className="material-symbols-outlined text-[14px] text-primary">check</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
