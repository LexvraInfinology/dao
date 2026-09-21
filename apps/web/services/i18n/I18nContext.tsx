"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Language, translations } from "./translations";

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  language: "en",
  setLanguage: () => {},
  t: (key, fallback) => fallback || key,
});

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("en");

  useEffect(() => {
    const saved = localStorage.getItem("equora-language") as Language | null;
    if (saved && (saved === "en" || saved === "es" || saved === "fr" || saved === "zh")) {
      setLanguageState(saved);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("equora-language", lang);
  };

  const t = (key: string, fallback?: string): string => {
    const dict = translations[language] || translations.en;
    return dict[key] || translations.en[key] || fallback || key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
