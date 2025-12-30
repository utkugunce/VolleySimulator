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
    onGroupChange
}: PageHeaderProps) {
    const pathname = usePathname();

    // Detect which league we're in based on the pathname
    const is1Lig = pathname.startsWith('/1lig');
    const is2Lig = pathname.startsWith('/2lig');
    const leaguePrefix = is1Lig ? '/1lig' : is2Lig ? '/2lig' : '';

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

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between bg-slate-900 border border-slate-800 rounded-lg p-3 shadow-sm flex-shrink-0 gap-3">
            <div className="flex items-center gap-2">
                <span className="text-2xl">🏐</span>
                <div>
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">{title}</h1>
                    <p className="text-[10px] text-slate-500 hidden sm:block">{subtitle}</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-center">

                <Link href={leaguePrefix ? `${leaguePrefix}/tahminoyunu` : '/'} className={getLinkClass(leaguePrefix ? `${leaguePrefix}/tahminoyunu` : '/')}>
                    <span>🏠</span>
                    <span className="hidden sm:inline">Tahmin Oyunu</span>
                </Link>

                <Link href={`${leaguePrefix}/groups`} className={getLinkClass(`${leaguePrefix}/groups`)}>
                    <span className="hidden sm:inline">Güncel Durum</span>
                </Link>

                {/* Stats link for both leagues */}
                {(is1Lig || is2Lig) && (
                    <Link href={`${leaguePrefix}/stats`} className={getLinkClass(`${leaguePrefix}/stats`)}>
                        <span>📊</span>
                        <span className="hidden sm:inline">İstatistikler</span>
                    </Link>
                )}

                {/* Playoffs link for both leagues */}
                {(is1Lig || is2Lig) && (
                    <Link href={`${leaguePrefix}/playoffs`} className={getLinkClass(`${leaguePrefix}/playoffs`, true)}>
                        <span>🏆</span>
                        <span className="hidden sm:inline">Play-Off</span>
                    </Link>
                )}

                {groups.length > 0 && onGroupChange && (
                    <>
                        <div className="h-6 w-px bg-slate-800 hidden sm:block"></div>

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
                    </>
                )}
            </div>
        </div>
    );
}
