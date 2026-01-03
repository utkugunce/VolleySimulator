'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'tr' | 'en';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'tr';
  
  const savedLocale = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_LOCALE='))
    ?.split('=')[1];
  
  if (savedLocale === 'tr' || savedLocale === 'en') {
    return savedLocale;
  }
  return 'tr';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Set cookie for 1 year
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    // Reload to apply new locale
    window.location.reload();
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}
