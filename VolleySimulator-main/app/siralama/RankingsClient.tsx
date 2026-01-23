"use client";

import { useEffect, useState, useMemo } from "react";
import { TeamStats, Match } from "@/app/types";
import RankingTables from "../components/RankingTables";
import { calculateLiveStandings } from "../utils/calculatorUtils";
import { useLanguage } from "../context/LanguageContext";

interface RankingsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function RankingsClient({ initialTeams, initialMatches }: RankingsClientProps) {
    const { t, language, setLanguage } = useLanguage();

    // Context & State
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Normalize data (Matching Calculator Logic)
    const normalizedTeams = useMemo(() => initialTeams.map((t: any) => ({
        ...t,
        name: t.name.toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US'),
        groupName: t.groupName.replace('Pool ', '') + (language === 'tr' ? ' GRUBU' : ' POOL')
    })), [initialTeams, language]);

    const normalizedMatches = useMemo(() => initialMatches.map((m: any) => ({
        ...m,
        matchDate: m.date || m.matchDate,
        homeTeam: m.homeTeam.toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US'),
        awayTeam: m.awayTeam.toLocaleUpperCase(language === 'tr' ? 'tr-TR' : 'en-US'),
        groupName: m.groupName.replace('Pool ', '') + (language === 'tr' ? ' GRUBU' : ' POOL')
    })), [initialMatches, language]);

    // Load predictions
    useEffect(() => {
        const saved = localStorage.getItem('cevclGroupScenarios');
        if (saved) {
            try { setOverrides(JSON.parse(saved)); } catch (e) { console.error(e); }
        }
        setIsLoaded(true);
    }, []);

    // Dynamic Global Rankings Calculation
    const calculatedRankings = useMemo(() => {
        const pools = ["A", "B", "C", "D", "E"].map(l => l + (language === 'tr' ? ' GRUBU' : ' POOL'));
        const firstPlace: TeamStats[] = [];
        const secondPlace: TeamStats[] = [];
        const thirdPlace: TeamStats[] = [];

        pools.forEach(poolName => {
            const pTeams = normalizedTeams.filter(t => t.groupName === poolName);
            const pMatches = normalizedMatches.filter(m => m.groupName === poolName);
            const standings = calculateLiveStandings(pTeams, pMatches, overrides);

            if (standings.length > 0) firstPlace.push({ ...standings[0], groupName: poolName });
            if (standings.length > 1) secondPlace.push({ ...standings[1], groupName: poolName });
            if (standings.length > 2) thirdPlace.push({ ...standings[2], groupName: poolName });
        });

        // Helper to format for RankingEntry
        const toEntry = (t: TeamStats, idx: number) => ({
            pos: idx + 1,
            team: t.name,
            pool: t.groupName || "",
            pld: t.played,
            w: t.wins,
            l: t.played - t.wins,
            pts: t.points,
            sw: t.setsWon,
            sl: t.setsLost,
            sr: t.setsLost === 0 ? (t.setsWon > 0 ? 1000 : 0) : t.setsWon / t.setsLost,
            spw: t.setPointsWon,
            spl: t.setPointsLost,
            spr: t.setPointsLost === 0 ? (t.setPointsWon > 0 ? 1000 : 0) : t.setPointsWon / t.setPointsLost
        });

        const comparator = (a: TeamStats, b: TeamStats) => {
            if (b.wins !== a.wins) return b.wins - a.wins;
            if (b.points !== a.points) return b.points - a.points;
            const setAvgB = (b.setsLost === 0) ? (b.setsWon > 0 ? Number.MAX_VALUE : 0) : (b.setsWon / b.setsLost);
            const setAvgA = (a.setsLost === 0) ? (a.setsWon > 0 ? Number.MAX_VALUE : 0) : (a.setsWon / a.setsLost);
            if (Math.abs(setAvgB - setAvgA) > 0.0001) return setAvgB - setAvgA;
            const pointAvgB = (b.setPointsLost === 0) ? (b.setPointsWon > 0 ? Number.MAX_VALUE : 0) : (b.setPointsWon / b.setPointsLost);
            const pointAvgA = (a.setPointsLost === 0) ? (a.setPointsWon > 0 ? Number.MAX_VALUE : 0) : (a.setPointsWon / a.setPointsLost);
            return pointAvgB - pointAvgA;
        };

        return {
            firstPlace: [...firstPlace].sort(comparator).map(toEntry),
            secondPlace: [...secondPlace].sort(comparator).map(toEntry),
            thirdPlace: [...thirdPlace].sort(comparator).map(toEntry)
        };
    }, [normalizedTeams, normalizedMatches, overrides, language]);

    if (!isLoaded) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-500">{t('loading')}</div>;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-1 sm:p-2 font-sans">
            <div className="w-full max-w-7xl mx-auto flex flex-col h-full gap-2">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-900/50 to-indigo-900/50 border border-slate-800 rounded-xl p-3">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div>
                                <h1 className="font-bold text-white text-lg tracking-tight">{t('header.title')}</h1>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex items-center gap-2">
                            <a
                                href="/"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                {t('nav.groups')}
                            </a>
                            <a
                                href="/siralama"
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg"
                            >
                                {t('nav.ranking')}
                            </a>
                            <a
                                href="/playoffs"
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                            >
                                {t('nav.playoffs')}
                            </a>

                            {/* Language Toggle */}
                            <div className="flex bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                                <button
                                    onClick={() => setLanguage('tr')}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'tr' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                >TR</button>
                                <button
                                    onClick={() => setLanguage('en')}
                                    className={`px-2 py-1 text-[10px] font-bold rounded-md transition-all ${language === 'en' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'}`}
                                >EN</button>
                            </div>
                            {/* Theme Toggle */}
                            <button
                                onClick={() => {
                                    const root = document.documentElement;
                                    const isLight = root.getAttribute('data-theme') === 'light';
                                    root.setAttribute('data-theme', isLight ? 'dark' : 'light');
                                }}
                                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-lg transition-all border border-slate-700"
                                title="Tema Değiştir"
                            >
                                🌙
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Box */}
                <div className="bg-blue-900/20 border border-blue-500/20 p-4 rounded-xl flex items-start gap-3">
                    <div className="text-xl">🏆</div>
                    <div>
                        <h3 className="text-sm font-bold text-white mb-1">Playoff Sıralama Kuralları</h3>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            {t('rules.po6')}
                            <br />
                            {t('rules.qf')}
                        </p>
                    </div>
                </div>

                {/* Tables */}
                <RankingTables rankings={calculatedRankings} />
            </div>
        </main>
    );
}
