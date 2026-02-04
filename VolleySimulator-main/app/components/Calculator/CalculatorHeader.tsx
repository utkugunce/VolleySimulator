import Link from "next/link";
import { useLanguage } from "@/app/context/LanguageContext";

interface CalculatorHeaderProps {
    onReset: () => void;
}

export default function CalculatorHeader({ onReset }: CalculatorHeaderProps) {
    const { t, language, setLanguage } = useLanguage();

    return (
        <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm transition-colors duration-300">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <h1 className="font-bold text-slate-900 dark:text-white text-xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        {t('header.title')}
                    </h1>
                </div>

                <div className="flex items-center gap-2 flex-wrap justify-center">
                    <Link
                        href="/"
                        className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20 hover:bg-blue-700 transition-all hover:-translate-y-0.5"
                    >
                        {t('nav.groups')}
                    </Link>
                    <Link
                        href="/siralama"
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg transition-all hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5"
                    >
                        {t('nav.ranking')}
                    </Link>
                    <Link
                        href="/playoffs"
                        className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold rounded-lg transition-all hover:text-blue-600 dark:hover:text-blue-400 hover:-translate-y-0.5"
                    >
                        {t('nav.playoffs')}
                    </Link>

                    <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-1"></div>

                    <button
                        onClick={onReset}
                        className="px-3 py-1.5 bg-rose-50 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-slate-700 text-rose-500 hover:text-rose-600 border border-rose-200 dark:border-rose-900/30 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5"
                        title={t('group.resetSim')}
                    >
                        <span>🔄</span>
                        <span className="hidden sm:inline">{t('group.resetSim')}</span>
                    </button>

                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => setLanguage('tr')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${language === 'tr' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >TR</button>
                        <button
                            onClick={() => setLanguage('en')}
                            className={`px-2 py-0.5 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'}`}
                        >EN</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
