import { useState, useRef, useEffect } from "react";
import { useLanguage } from "@/app/context/LanguageContext";

interface AutoFillControlsProps {
    onAutoFill: (mode: 'favorites' | 'random') => void;
}

export default function AutoFillControls({ onAutoFill }: AutoFillControlsProps) {
    const { t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Click outside handler
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (mode: 'favorites' | 'random') => {
        onAutoFill(mode);
        setIsOpen(false);
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`px-4 py-2 bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95 ${isOpen ? 'ring-2 ring-emerald-500/40' : ''}`}
            >
                <span>⚡</span>
                <span className="hidden sm:inline">{t('status.autoFill')}</span>
                <span className={`text-[9px] transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>▼</span>
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl shadow-slate-900/10 overflow-hidden z-20 animate-in fade-in zoom-in-95 duration-200 origin-top-right">
                    <button
                        onClick={() => handleSelect('favorites')}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 group"
                    >
                        <span className="text-xl bg-slate-100 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">🏆</span>
                        <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{t('status.autoFillFavorites')}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('status.autoFillFavoritesDesc')}</div>
                        </div>
                    </button>
                    <button
                        onClick={() => handleSelect('random')}
                        className="w-full text-left px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-3 group"
                    >
                        <span className="text-xl bg-slate-100 dark:bg-slate-800 p-2 rounded-lg group-hover:bg-white dark:group-hover:bg-slate-700 transition-colors">🎲</span>
                        <div>
                            <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">{t('status.autoFillRandom')}</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400">{t('status.autoFillRandomDesc')}</div>
                        </div>
                    </button>
                </div>
            )}
        </div>
    );
}
