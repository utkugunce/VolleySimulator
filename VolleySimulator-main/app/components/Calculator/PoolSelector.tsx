import { useLanguage } from "@/app/context/LanguageContext";

interface PoolSelectorProps {
    pools: string[];
    selectedPool: string;
    onSelectPool: (pool: string) => void;
}

export default function PoolSelector({ pools, selectedPool, onSelectPool }: PoolSelectorProps) {
    const { t } = useLanguage();

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
            {pools.map(pool => {
                const isSelected = selectedPool === pool;
                return (
                    <button
                        key={pool}
                        onClick={() => onSelectPool(pool)}
                        className={`relative px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300 overflow-hidden group ${isSelected
                                ? "text-white shadow-lg shadow-blue-500/25 ring-2 ring-blue-500/20 translate-y-[-1px]"
                                : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                            }`}
                    >
                        <span className={`absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 transition-opacity duration-300 ${isSelected ? 'opacity-100' : 'opacity-0'}`}></span>
                        <span className="relative z-10">{pool}</span>
                    </button>
                );
            })}
        </div>
    );
}
