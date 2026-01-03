"use client";

import { useEffect, useState, useMemo } from "react";
import { TeamStats, Match } from "../../types";
import Link from "next/link";
import {
    generateQuarterGroups,
    generateSemiGroups,
    generateFinalGroups,
    applyOverridesToGroups,
    PlayoffGroup,
    calculateGroupStandings
} from "../../utils/playoffUtils";
import { calculateLiveStandings } from "../../utils/calculatorUtils";

import TeamAvatar from "../../components/TeamAvatar";

interface TwoLigPlayoffsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function TwoLigPlayoffsClient({ initialTeams, initialMatches }: TwoLigPlayoffsClientProps) {
    const [groupOverrides, setGroupOverrides] = useState<Record<string, string>>({});
    const [playoffOverrides, setPlayoffOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const savedPlayoff = localStorage.getItem('playoffScenarios');
        if (savedPlayoff) {
            try {
                setPlayoffOverrides(JSON.parse(savedPlayoff));
            } catch (e) { console.error(e); }
        }

        const savedGroup = localStorage.getItem('groupScenarios');
        if (savedGroup) {
            try {
                const parsed = JSON.parse(savedGroup);
                let flatOverrides: Record<string, string> = {};
                Object.values(parsed).forEach((groupObj: any) => {
                    flatOverrides = { ...flatOverrides, ...groupObj };
                });
                setGroupOverrides(flatOverrides);
            } catch (e) { console.error(e); }
        }

        setIsLoaded(true);
    }, []);

    const baseStandings = useMemo(() => {
        const calculatedTeams = calculateLiveStandings(initialTeams, initialMatches, groupOverrides);
        return calculateGroupStandings(calculatedTeams);
    }, [initialTeams, initialMatches, groupOverrides]);

    const quarterGroups = useMemo(() => {
        const qs = generateQuarterGroups(baseStandings, initialMatches);
        return applyOverridesToGroups(qs, playoffOverrides, 'quarter');
    }, [baseStandings, initialMatches, playoffOverrides]);

    const semiGroups = useMemo(() => {
        const ss = generateSemiGroups(quarterGroups);
        return applyOverridesToGroups(ss, playoffOverrides, 'semi');
    }, [quarterGroups, playoffOverrides]);

    const finalGroups = useMemo(() => {
        const fs = generateFinalGroups(semiGroups);
        return applyOverridesToGroups(fs, playoffOverrides, 'final');
    }, [semiGroups, playoffOverrides]);

    const remainingGroupMatchesCount = useMemo(() => {
        let remaining = initialMatches.filter((m: Match) => !m.isPlayed).length;
        remaining = Math.max(0, remaining - Object.keys(groupOverrides).length);
        return remaining;
    }, [initialMatches, groupOverrides]);

    const isGroupsComplete = remainingGroupMatchesCount === 0;

    const renderStageGroups = (stage: string, groups: PlayoffGroup[], title: string, color: string) => {
        return (
            <div className="space-y-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${color}`}></span>
                    {title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {groups.map(group => {
                        const groupPrefix = `${stage}-${group.groupName}-`;
                        const groupMatchesCount = Object.keys(playoffOverrides).filter(k => k.startsWith(groupPrefix)).length;
                        const totalMatches = 6;
                        const isComplete = groupMatchesCount >= totalMatches;

                        let displayName = group.groupName;
                        if (stage === 'semi') {
                            const map: Record<string, string> = { 'A': '1', 'B': '2', 'C': '3', 'D': '4' };
                            displayName = map[group.groupName] || group.groupName;
                        }

                        return (
                            <Link
                                key={group.groupName}
                                href={`/2lig/playoffs/${stage}/${group.groupName}`}
                                className="block bg-slate-900 border border-slate-800 rounded-lg overflow-hidden hover:border-slate-600 hover:shadow-lg transition-all"
                            >
                                <div className={`h-2 ${color}/50`}></div>
                                <div className="p-4">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="font-bold text-white text-lg">
                                            {stage === 'semi' ? `${displayName}. Grup` : `Grup ${displayName}`}
                                        </h3>
                                        {isComplete ? (
                                            <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">Tamamlandı</span>
                                        ) : (
                                            <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded">{totalMatches - groupMatchesCount} Maç Eksik</span>
                                        )}
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex items-center justify-between text-[10px] text-slate-500 px-2 pb-1 border-b border-slate-800/50">
                                            <span>#</span>
                                            <span className="flex-1 px-2">Takım</span>
                                            <span>P</span>
                                        </div>
                                        {group.teams.map((team, idx) => (
                                            <div key={team.name} className={`flex items-center justify-between text-xs py-1 px-2 rounded ${idx < 2 ? 'bg-emerald-500/5' : ''}`}>
                                                <div className="flex items-center gap-2 flex-1 min-w-0">
                                                    <span className={`w-3 text-center text-[10px] ${idx < 2 ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>{idx + 1}</span>
                                                    <TeamAvatar name={team.name} size="xs" />
                                                    <span className={`truncate ${idx < 2 ? 'text-slate-200 font-medium' : 'text-slate-400'}`}>{team.name}</span>
                                                </div>
                                                <span className={`font-bold ml-2 w-4 text-center ${idx < 2 ? 'text-white' : 'text-slate-500'}`}>
                                                    {team.scenarioPoints ?? 0}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col gap-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">Play-Off Senaryo Modu</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Turnuva simülasyonu ve eşleşme tahminleri</p>
                </div>

                {!isGroupsComplete && (
                    <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-4 rounded-lg flex items-center gap-3">
                        <span className="text-2xl">⚠️</span>
                        <div>
                            <p className="font-bold text-sm">Grup Maçları Henüz Tamamlanmadı</p>
                            <p className="text-xs opacity-70">
                                Play-Off senaryoları mevcut grup sıralamalarına göre hesaplanmaktadır.
                                Kesin sonuçlar için önce grup maçlarını tamamlayın.
                            </p>
                        </div>
                    </div>
                )}

                {(() => {
                    const promotedTeams: Array<{ name: string; rank: 1 | 2; group: string }> = [];
                    finalGroups.forEach(g => {
                        const count = Object.keys(playoffOverrides).filter(k => k.startsWith(`final-${g.groupName}-`)).length;
                        if (count >= 6) {
                            if (g.teams[0]) promotedTeams.push({ name: g.teams[0].name, rank: 1, group: g.groupName });
                            if (g.teams[1]) promotedTeams.push({ name: g.teams[1].name, rank: 2, group: g.groupName });
                        }
                    });

                    if (promotedTeams.length === 0) return null;

                    const champCount = promotedTeams.filter(t => t.rank === 1).length;
                    const runnerUpCount = promotedTeams.filter(t => t.rank === 2).length;
                    const totalPlayoffMatches = Object.keys(playoffOverrides).length;

                    return (
                        <div className="bg-gradient-to-r from-emerald-900/50 via-slate-900 to-emerald-900/30 border border-emerald-500/30 rounded-xl p-6 relative overflow-hidden">
                            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2 relative z-10">
                                <span className="text-3xl">🎉</span>
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                                    1. Lige Yükselen Takımlar
                                </span>
                            </h2>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
                                <div className="flex flex-col gap-3">
                                    {promotedTeams.map((team, idx) => (
                                        <div key={idx} className={`flex items-center gap-3 p-3 rounded-lg border backdrop-blur-sm transition-transform hover:scale-[1.02] ${team.rank === 1 ? 'bg-amber-500/10 border-amber-500/40' : 'bg-slate-700/30 border-slate-600/50'}`}>
                                            <div className={`w-10 h-10 flex items-center justify-center rounded-full text-lg font-bold shadow-lg ${team.rank === 1 ? 'bg-gradient-to-b from-amber-300 to-amber-600 text-white' : 'bg-gradient-to-b from-slate-300 to-slate-500 text-white'}`}>
                                                {team.rank === 1 ? '🥇' : '🥈'}
                                            </div>
                                            <TeamAvatar name={team.name} size="md" />
                                            <div className="flex-1">
                                                <div className="font-bold text-white text-lg leading-tight">{team.name}</div>
                                                <div className={`text-xs ${team.rank === 1 ? 'text-amber-400' : 'text-slate-400'}`}>
                                                    Final {team.group}. Grup {team.rank === 1 ? 'Şampiyonu' : 'İkincisi'}
                                                </div>
                                            </div>
                                            <div className={`text-2xl ${team.rank === 1 ? 'text-amber-400' : 'text-slate-500'}`}>
                                                {team.rank === 1 ? '👑' : '⭐'}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex flex-col items-center justify-center gap-4 bg-slate-800/30 rounded-xl p-6 border border-slate-700/50">
                                    <div className="text-8xl animate-bounce">🏆</div>
                                    <div className="text-center">
                                        <div className="text-lg font-bold text-white mb-1">Turnuva Özeti</div>
                                        <div className="text-sm text-slate-400">2. Lig Play-Off 2025-26</div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 w-full mt-2">
                                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                                            <div className="text-2xl font-bold text-amber-400">{champCount}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Şampiyon</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                                            <div className="text-2xl font-bold text-slate-300">{runnerUpCount}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">İkinci</div>
                                        </div>
                                        <div className="text-center p-3 bg-slate-900/50 rounded-lg">
                                            <div className="text-2xl font-bold text-emerald-400">{totalPlayoffMatches}</div>
                                            <div className="text-[10px] text-slate-500 uppercase tracking-wider">Toplam Maç</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })()}

                {isGroupsComplete ? (
                    (() => {
                        const quarterMatchCount = Object.keys(playoffOverrides).filter(k => k.startsWith('quarter-')).length;
                        const isQuarterComplete = quarterMatchCount >= 24;

                        const semiMatchCount = Object.keys(playoffOverrides).filter(k => k.startsWith('semi-')).length;
                        const isSemiComplete = semiMatchCount >= 24;

                        return (
                            <div className="space-y-12">
                                {renderStageGroups('quarter', quarterGroups, 'Çeyrek Final', 'bg-amber-500')}

                                <div className="relative">
                                    {!isQuarterComplete && (
                                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl py-8">
                                            <div className="text-4xl mb-2">🔒</div>
                                            <h3 className="text-lg font-bold text-white mb-1">Yarı Final Kilitli</h3>
                                            <p className="text-slate-400 text-xs text-center max-w-sm">
                                                Yarı Final gruplarını açmak için Çeyrek Final gruplarını tamamlayın.
                                            </p>
                                            <p className="text-amber-400 text-sm font-medium mt-2">
                                                {24 - quarterMatchCount} / 24 maç eksik
                                            </p>
                                        </div>
                                    )}
                                    <div className={!isQuarterComplete ? 'opacity-30 pointer-events-none select-none' : ''}>
                                        {renderStageGroups('semi', semiGroups, 'Yarı Final', 'bg-blue-500')}
                                    </div>
                                </div>

                                <div className="relative">
                                    {!isSemiComplete && (
                                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center rounded-xl py-8">
                                            <div className="text-4xl mb-2">🔒</div>
                                            <h3 className="text-lg font-bold text-white mb-1">Final Grubu Kilitli</h3>
                                            <p className="text-slate-400 text-xs text-center max-w-sm">
                                                Final grubunu açmak için Yarı Final gruplarını tamamlayın.
                                            </p>
                                            <p className="text-blue-400 text-sm font-medium mt-2">
                                                {24 - semiMatchCount} / 24 maç eksik
                                            </p>
                                        </div>
                                    )}
                                    <div className={!isSemiComplete ? 'opacity-30 pointer-events-none select-none' : ''}>
                                        {renderStageGroups('final', finalGroups, 'Final Grubu', 'bg-emerald-500')}
                                    </div>
                                </div>
                            </div>
                        );
                    })()
                ) : (
                    <div className="relative">
                        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-start pt-16 rounded-xl">
                            <div className="text-6xl mb-4">🔒</div>
                            <h3 className="text-xl font-bold text-white mb-2">Play-Off Kilitli</h3>
                            <p className="text-slate-400 text-sm text-center max-w-md mb-4">
                                Play-Off senaryolarını düzenleyebilmek için önce tüm grup maçlarını tahmin etmeniz gerekmektedir.
                            </p>
                            <p className="text-amber-400 font-medium">
                                {remainingGroupMatchesCount} maç eksik
                            </p>
                            <Link href="/2lig/tahminoyunu" className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors">
                                Tahminleri Tamamla →
                            </Link>
                        </div>
                        <div className="opacity-30 pointer-events-none select-none space-y-12">
                            {renderStageGroups('quarter', quarterGroups, 'Çeyrek Final', 'bg-amber-500')}
                            {renderStageGroups('semi', semiGroups, 'Yarı Final', 'bg-blue-500')}
                            {renderStageGroups('final', finalGroups, 'Final Grubu', 'bg-emerald-500')}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
