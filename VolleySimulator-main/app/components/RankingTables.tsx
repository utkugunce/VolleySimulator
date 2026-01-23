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
    const { t } = useLanguage();
    const [activeTab, setActiveTab] = useState<"first" | "second" | "third">("first");

    const tabs = [
        { id: "first" as const, label: t('ranking.1st'), emoji: "🥇", data: rankings.firstPlace },
        { id: "second" as const, label: t('ranking.2nd'), emoji: "🥈", data: rankings.secondPlace },
        { id: "third" as const, label: t('ranking.3rd'), emoji: "🥉", data: rankings.thirdPlace },
    ];

    const activeData = tabs.find(t => t.id === activeTab)?.data || [];

    return (
        <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 rounded-xl border border-slate-700/50 overflow-hidden">
            {/* Tab Headers */}
            <div className="flex border-b border-slate-700/50">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex-1 py-3 px-4 text-sm font-medium transition-all duration-200 ${activeTab === tab.id
                            ? "bg-blue-600/20 text-blue-400 border-b-2 border-blue-500"
                            : "text-slate-400 hover:text-white hover:bg-slate-700/30"
                            }`}
                    >
                        <span className="mr-2">{tab.emoji}</span>
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="bg-slate-800/50 text-slate-400 text-xs uppercase">
                            <th className="py-2 px-2 text-center w-8">#</th>
                            <th className="py-2 px-3 text-left">{t('table.team')}</th>
                            <th className="py-2 px-2 text-center" title="Grup">{t('group')}</th>
                            <th className="py-2 px-2 text-center" title={t('table.played')}>{t('table.played')}</th>
                            <th className="py-2 px-2 text-center" title={t('table.won')}>{t('table.won')}</th>
                            <th className="py-2 px-2 text-center" title={t('table.lost')}>{t('table.lost')}</th>
                            <th className="py-2 px-2 text-center font-bold" title={t('table.points')}>{t('table.points')}</th>
                            <th className="py-2 px-2 text-center" title="Set Oranı">{t('ranking.setRatio')}</th>
                            <th className="py-2 px-2 text-center hidden md:table-cell" title="Sayı Oranı">{t('ranking.pointRatio')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {activeData.map((entry, index) => (
                            <tr
                                key={entry.team}
                                className={`border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors ${index === 0 ? "bg-green-900/10" : ""
                                    }`}
                            >
                                <td className="py-2 px-2 text-center">
                                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${index === 0 ? "bg-green-600 text-white" :
                                        index === 1 ? "bg-blue-600 text-white" :
                                            "bg-slate-700 text-slate-300"
                                        }`}>
                                        {entry.pos}
                                    </span>
                                </td>
                                <td className="py-2 px-3 font-medium text-white truncate max-w-[150px] md:max-w-none">
                                    {entry.team}
                                </td>
                                <td className="py-2 px-2 text-center">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-700 text-xs font-medium">
                                        {entry.pool.replace("Pool ", "").replace(" GRUBU", "")}
                                    </span>
                                </td>
                                <td className="py-2 px-2 text-center text-slate-400">{entry.pld}</td>
                                <td className="py-2 px-2 text-center text-green-400">{entry.w}</td>
                                <td className="py-2 px-2 text-center text-red-400">{entry.l}</td>
                                <td className="py-2 px-2 text-center font-bold text-yellow-400">{entry.pts}</td>
                                <td className="py-2 px-2 text-center text-slate-300">
                                    {entry.sr.toFixed(2)}
                                </td>
                                <td className="py-2 px-2 text-center text-slate-400 hidden md:table-cell">
                                    {entry.spr.toFixed(3)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Legend */}
            <div className="px-4 py-2 bg-slate-800/30 text-xs text-slate-500 flex flex-wrap gap-3">
                <span title="Oynanan Maç">{t('table.played')}: {t('table.playedDesc') || 'Maç'}</span>
                <span title="Galibiyet">{t('table.won')}: {t('table.wonDesc') || 'Galibiyet'}</span>
                <span title="Mağlubiyet">{t('table.lost')}: {t('table.lostDesc') || 'Mağlubiyet'}</span>
                <span title="Puan">{t('table.points')}: {t('table.pointsDesc') || 'Puan'}</span>
                <span title="Set Oranı">{t('ranking.setRatio')}: Set Rate</span>
                <span className="hidden md:inline" title="Sayı Oranı">{t('ranking.pointRatio')}: Set Point Rate</span>
            </div>
        </div>
    );
}
