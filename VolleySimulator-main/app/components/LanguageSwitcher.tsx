'use client';

import { useLocale } from '@/app/context/LocaleContext';

export function LanguageSwitcher() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-1">
      <button
        onClick={() => setLocale('tr')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          locale === 'tr'
            ? 'bg-emerald-600 text-white'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'
        }`}
        aria-label="Türkçe"
      >
        🇹🇷 TR
      </button>
      <button
        onClick={() => setLocale('en')}
        className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
          locale === 'en'
            ? 'bg-emerald-600 text-white'
            : 'text-slate-400 hover:text-white hover:bg-slate-700'
        }`}
        aria-label="English"
      >
        🇬🇧 EN
      </button>
    </div>
  );
}
