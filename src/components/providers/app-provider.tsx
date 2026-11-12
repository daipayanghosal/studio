"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppLocale, DreamAura } from '@/types';
import { translations, Translations } from '@/lib/i18n';

interface AppContextType {
  locale: AppLocale;
  setLocale: (locale: AppLocale) => void;
  toggleLocale: () => void;
  t: Translations;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  toggleTheme: () => void;
  aura: DreamAura;
  setAura: (aura: DreamAura) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<AppLocale>('en');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [aura, setAuraState] = useState<DreamAura>('aurora');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const savedLocale = localStorage.getItem('chrono_locale') as AppLocale;
    if (savedLocale === 'en' || savedLocale === 'bn') {
      setLocaleState(savedLocale);
    }

    const savedTheme = localStorage.getItem('chrono_theme') as 'light' | 'dark';
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setThemeState(savedTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeState('dark');
    }

    const savedAura = localStorage.getItem('chrono_aura') as DreamAura;
    if (['aurora', 'nebula', 'sunset', 'mint'].includes(savedAura)) {
      setAuraState(savedAura);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    root.setAttribute('data-aura', aura);
    root.setAttribute('lang', locale);
  }, [theme, aura, locale, mounted]);

  const setLocale = (newLocale: AppLocale) => {
    setLocaleState(newLocale);
    localStorage.setItem('chrono_locale', newLocale);
  };

  const toggleLocale = () => {
    setLocale(locale === 'en' ? 'bn' : 'en');
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    setThemeState(newTheme);
    localStorage.setItem('chrono_theme', newTheme);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const setAura = (newAura: DreamAura) => {
    setAuraState(newAura);
    localStorage.setItem('chrono_aura', newAura);
  };

  const t = translations[locale];

  return (
    <AppContext.Provider
      value={{
        locale,
        setLocale,
        toggleLocale,
        t,
        theme,
        setTheme,
        toggleTheme,
        aura,
        setAura,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return ctx;
}
