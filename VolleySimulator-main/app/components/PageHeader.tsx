"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface PageHeaderProps {
    title: string;
    subtitle: string;
    groups?: string[];
    selectedGroup?: string | null;
    onGroupChange?: (group: string | null) => void;
}

export default function PageHeader({
    title,
    subtitle,
    groups = [],
    selectedGroup,
    onGroupChange,
    showLeagueLinks = true,
    showQuickActions = true
}: PageHeaderProps & { showLeagueLinks?: boolean; showQuickActions?: boolean; }) {
    const pathname = usePathname();

    // Detect which league we're in based on the pathname
    const is1Lig = pathname.startsWith('/1lig');
    const is2Lig = pathname.startsWith('/2lig');
    const isVSL = pathname.startsWith('/vsl');
    const isCL = pathname.startsWith('/cev-cl');
    const isCEVCup = pathname.startsWith('/cev-cup');
    const leaguePrefix = is1Lig ? '/1lig' : is2Lig ? '/2lig' : isVSL ? '/vsl' : isCL ? '/cev-cl' : isCEVCup ? '/cev-cup' : '';

    const getLinkClass = (path: string, isSpecial: boolean = false) => {
        const isActive = pathname === path || pathname.startsWith(path + '/');

        if (isSpecial) {
            return `flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-lg ${isActive
                ? 'bg-gradient-to-r from-amber-500 to-orange-400 text-white shadow-amber-500/30 scale-105 ring-1 ring-amber-300/50'
                : 'bg-gradient-to-r from-amber-600 to-orange-500 hover:from-amber-500 hover:to-orange-400 text-white shadow-amber-500/10'
                }`;
        }

        return `flex-1 sm:flex-none px-3 py-1.5 rounded text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${isActive
            ? 'bg-slate-700 text-white border-slate-500 shadow-md ring-1 ring-slate-600'
            : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
            }`;
    };

    // Detect current page type to preserve when switching leagues
    const getCurrentPageType = () => {
        if (pathname.includes('/gunceldurum')) return '/gunceldurum';
        if (pathname.includes('/playoffs')) return '/playoffs';
        if (pathname.includes('/stats')) return '/stats';
        return '/tahminoyunu'; // default
    };
    const currentPageType = getCurrentPageType();

    const getLeagueLinkClass = (leaguePath: string) => {
        const isActive = pathname.startsWith(leaguePath);
        return `px-2 py-1 rounded text-[10px] font-bold transition-all flex items-center gap-1.5 ${isActive
            ? 'bg-white/10 text-white border border-white/20'
            : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-sm flex-shrink-0 gap-3">
            <div className="flex items-center gap-3">
                <div>
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">{title}</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">{subtitle}</p>
                </div>
                {/* Groups Selection (if any) */}
                {groups.length > 0 && onGroupChange && (
                    <div className="flex items-center gap-1">
                        <select
                            value={selectedGroup || ""}
                            onChange={(e) => onGroupChange(e.target.value || null)}
                            aria-label="Grup Seç"
                            className="appearance-none bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-xs font-bold rounded px-3 py-1.5 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all cursor-pointer"
                        >
                            {groups.map(g => (
                                <option key={g} value={g} className="bg-slate-900 text-white font-semibold">{g}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
}
