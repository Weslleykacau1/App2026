
"use client";

import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from "react";
import { translations, TranslationKey } from "@/lib/i18n";
import { setItem, getItem } from "@/lib/storage";

type Language = "pt" | "en";

interface LanguageContextType {
  language: Language;
  changeLanguage: (lang: Language) => void;
  t: (key: TranslationKey, vars?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'app_language';

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pt');

  useEffect(() => {
    const savedLanguage = getItem<Language>(LANGUAGE_STORAGE_KEY);
    if (savedLanguage && (savedLanguage === 'pt' || savedLanguage === 'en')) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    setItem(LANGUAGE_STORAGE_KEY, lang);
  };

  const t = useCallback((key: TranslationKey, vars: Record<string, string> = {}): string => {
      const keys = key.split('.');
      let result: any = translations[language];

      for (const k of keys) {
          result = result?.[k];
          if (result === undefined) {
              return key; // Return the key if translation is not found
          }
      }

      if (typeof result !== 'string') {
        return key;
      }
      
      // Replace variables
      return Object.entries(vars).reduce((acc, [varKey, varValue]) => {
        return acc.replace(`{{${varKey}}}`, varValue);
      }, result);

  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
