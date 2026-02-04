"use client";

import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

interface RankingEntry {
    pos: number;
    team: string;
    pool: string;
    pld: number;
    w: number;
    l: number;
    pts: number;
    sw: number;
    sl: number;
    sr: number;
    spw: number;
    spl: number;
    spr: number;
}

interface RankingsData {
    firstPlace: RankingEntry[];
    secondPlace: RankingEntry[];
    thirdPlace: RankingEntry[];
}

interface RankingTablesProps {
    rankings: RankingsData;
}

export default function RankingTables({ rankings }: RankingTablesProps) {
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<"first" | "second" | "third">("first");

    const tabs = [
        { id: "first" as const, label: t('ranking.1st'), emoji: "🥇", data: rankings.firstPlace },
        { id: "second" as const, label: t('ranking.2nd'), emoji: "🥈", data: rankings.secondPlace },
        { id: "third" as const, label: t('ranking.3rd'), emoji: "🥉", data: rankings.thirdPlace },
    ];

    const activeData = tabs.find(t => t.id === activeTab)?.data || [];

    // Larger padding for better visibility
    const thClass = "py-3 px-2 text-center whitespace-nowrap";
    const tdClass = "py-3 px-2 text-center whitespace-nowrap";

    return (
        <div className="bg-white dark:bg-gradient-to-br dark:from-slate-800/95 dark:to-slate-900/95 rounded-xl border border-slate-200 dark:border-slate-700/50 overflow-hidden shadow-lg dark:shadow-none transition-colors duration-300">
            {/* Tab Headers */}
            <div className="flex border-b border-slate-200 dark:border-slate-700/50 overflow-x-auto">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-4 px-4 text-sm font-bold transition-all duration-200 whitespace-nowrap ${activeTab === tab.id
                            ? "bg-blue-600/10 dark:bg-blue-600/20 text-blue-600 dark:text-blue-300 border-b-2 border-blue-500"
                            : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700/30"
                            }`}
                    >
                        <span className="mr-2 text-lg">{tab.emoji}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 text-xs uppercase font-bold tracking-wider border-b border-slate-200 dark:border-slate-700">
                            <th className={`${thClass} w-10 text-slate-500`}>#</th>
                            <th className={`py-3 px-3 text-left w-full pl-4`}>{t('table.team')}</th>
                            <th className={thClass} title={t('group')}>{t('group')}</th>
                            <th className={thClass} title={t('table.played')}>{t('table.played')}</th>
                            <th className={`${thClass} text-emerald-500`} title={t('table.won')}>{t('table.won')}</th>
                            <th className={`${thClass} text-rose-500`} title={t('table.lost')}>{t('table.lost')}</th>
                            <th className={thClass} title={t('table.points')}>{t('table.points')}</th>
                            <th className={thClass} title={t('table.setsWon')}>{t('table.setsWon')}</th>
                            <th className={thClass} title={t('table.setsLost')}>{t('table.setsLost')}</th>
                            <th className={thClass} title="Set Ratio">{t('ranking.setRatio')}</th>
                            <th className={thClass} title={t('table.pointsWon')}>{t('table.pointsWon')}</th>
                            <th className={thClass} title={t('table.pointsLost')}>{t('table.pointsLost')}</th>
                            <th className={`${thClass} hidden md:table-cell`} title="Set Point Ratio">{t('ranking.pointRatio')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 dark:divide-slate-700/30">
                        {activeData.map((entry, index) => (
                            <tr
                                key={entry.team}
                                className={`group hover:bg-slate-100 dark:hover:bg-slate-700/40 transition-colors ${index < 3 ? "bg-indigo-50/30 dark:bg-slate-800/30" : "even:bg-slate-50 dark:even:bg-slate-900/40"}`}
                            >
                                <td className={tdClass}>
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" :
                                        index === 1 ? "bg-slate-400 text-white" :
                                            index === 2 ? "bg-orange-700 text-white" :
                                                "bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                                        }`}>
                                        {entry.pos}
                                    </span>
                                </td>
                                <td className="py-3 px-3 pl-4 font-bold text-slate-700 dark:text-slate-200 truncate max-w-[140px] sm:max-w-xs text-left">
                                    {entry.team}
                                </td>
                                <td className={tdClass}>
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-mono font-bold border border-slate-200 dark:border-slate-700">
                                        {entry.pool.replace("Pool ", "").replace(" GRUBU", "").replace(" POOL", "")}
                                    </span>
                                </td>
                                <td className={`${tdClass} text-slate-500 dark:text-slate-400`}>{entry.pld}</td>
                                <td className={`${tdClass} text-emerald-600 dark:text-emerald-400 font-bold`}>{entry.w}</td>
                                <td className={`${tdClass} text-rose-600 dark:text-rose-400 font-bold`}>{entry.l}</td>
                                <td className={`${tdClass} text-amber-700 dark:text-amber-400 font-bold text-base`}>{entry.pts}</td>
                                <td className={`${tdClass} text-slate-600 dark:text-slate-400 text-xs`}>{entry.sw}</td>
                                <td className={`${tdClass} text-slate-600 dark:text-slate-400 text-xs`}>{entry.sl}</td>
                                <td className={`${tdClass} text-slate-500 dark:text-slate-400 font-mono text-xs`}>
                                    {entry.sr.toFixed(2)}
                                </td>
                                <td className={`${tdClass} text-sky-600 dark:text-sky-400 font-mono text-xs`}>
                                    {entry.spw}
                                </td>
                                <td className={`${tdClass} text-rose-600 dark:text-rose-400 font-mono text-xs`}>
                                    {entry.spl}
                                </td>
                                <td className={`${tdClass} text-slate-500 font-mono text-xs hidden md:table-cell`}>
                                    {entry.spr.toFixed(3)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="px-4 py-3 bg-slate-50 dark:bg-slate-900/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 justify-center sm:justify-start">
                <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 dark:text-emerald-300 font-medium bg-emerald-500/10 px-2 py-1 rounded border border-emerald-500/20">
                    <span className="font-bold">{t('table.won')}:</span> {language === 'tr' ? 'Galibiyet' : 'Won'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-amber-700 dark:text-amber-300 font-medium bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">
                    <span className="font-bold">{t('table.points')}:</span> {language === 'tr' ? 'Puan' : 'Points'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-600 dark:text-slate-400 font-medium bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded border border-slate-300 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-300">{t('ranking.setRatio')}:</span> {language === 'tr' ? 'Set Oranı' : 'Set Ratio'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-sky-700 dark:text-sky-300 font-medium bg-sky-500/10 px-2 py-1 rounded border border-sky-500/20">
                    <span className="font-bold">{t('table.pointsWon')}:</span> {language === 'tr' ? 'Alınan Sayı' : 'Points Won'}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-rose-700 dark:text-rose-300 font-medium bg-rose-500/10 px-2 py-1 rounded border border-rose-500/20">
                    <span className="font-bold">{t('table.pointsLost')}:</span> {language === 'tr' ? 'Verilen Sayı' : 'Points Lost'}
                </div>
                <div className="hidden md:flex items-center gap-1.5 text-[10px] text-slate-500 font-medium bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded border border-slate-300 dark:border-slate-700">
                    <span className="font-bold text-slate-700 dark:text-slate-400">{t('ranking.pointRatio')}:</span> {language === 'tr' ? 'Sayı Oranı' : 'Point Ratio'}
                </div>
            </div>
        </div>
    );
}
