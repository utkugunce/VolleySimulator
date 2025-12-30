"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PageHeader from "../components/PageHeader";

interface Team {
    name: string;
    groupName: string;
    played: number;
    wins: number;
    points: number;
    setsWon: number;
    setsLost: number;
}

interface Match {
    homeTeam: string;
    awayTeam: string;
    isPlayed: boolean;
}

const sortStandings = (teams: Team[]): Team[] => {
    return [...teams].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        const aAvg = a.setsLost > 0 ? a.setsWon / a.setsLost : a.setsWon;
        const bAvg = b.setsLost > 0 ? b.setsWon / b.setsLost : b.setsWon;
        if (bAvg !== aAvg) return bAvg - aAvg;
        return b.setsWon - a.setsWon;
    });
};

export default function LiglerPage() {
    const [vslTeams, setVslTeams] = useState<Team[]>([]);
    const [vslMatches, setVslMatches] = useState<Match[]>([]);
    const [lig1Teams, setLig1Teams] = useState<Team[]>([]);
    const [lig1Matches, setLig1Matches] = useState<Match[]>([]);
    const [lig2Teams, setLig2Teams] = useState<Team[]>([]);
    const [lig2Matches, setLig2Matches] = useState<Match[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            try {
                const [resVsl, res1, res2] = await Promise.all([
                    fetch("/api/vsl"),
                    fetch("/api/1lig"),
                    fetch("/api/calculate")
                ]);

                if (resVsl.ok) {
                    const data = await resVsl.json();
                    setVslTeams(data.teams || []);
                    setVslMatches(data.fixture || []);
                }

                if (res1.ok) {
                    const data = await res1.json();
                    setLig1Teams(data.teams || []);
                    setLig1Matches(data.fixture || []);
                }

                if (res2.ok) {
                    const data = await res2.json();
                    setLig2Teams(data.teams || []);
                    setLig2Matches(data.fixture || []);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        }
        fetchData();
    }, []);

    const vslTopTeams = sortStandings(vslTeams).slice(0, 3);
    const vslPlayedCount = vslMatches.filter(m => m.isPlayed).length;

    const lig1Groups = [...new Set(lig1Teams.map(t => t.groupName))].sort();
    const lig1TopTeams = sortStandings(lig1Teams.filter(t => t.groupName === lig1Groups[0])).slice(0, 3);
    const lig1PlayedCount = lig1Matches.filter(m => m.isPlayed).length;

    const lig2Groups = [...new Set(lig2Teams.map(t => t.groupName))].sort();
    const lig2TopTeams = sortStandings(lig2Teams.filter(t => t.groupName === lig2Groups[0])).slice(0, 3);
    const lig2PlayedCount = lig2Matches.filter(m => m.isPlayed).length;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                <PageHeader
                    title="Ligler"
                    subtitle="Türkiye Kadınlar Voleybol Ligleri • 2025-2026 Sezonu"
                />

                <div className="grid gap-6">
                    {/* Vodafone Sultanlar Ligi */}
                    <div className="bg-slate-900 border border-red-500/30 rounded-2xl overflow-hidden hover:border-red-400/50 transition-all">
                        <div className="bg-gradient-to-r from-red-600 to-rose-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">🏆</span>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Vodafone Sultanlar Ligi</h2>
                                    <p className="text-red-200/70 text-sm">Türkiye'nin en üst düzey kadınlar ligi</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">{vslPlayedCount}</div>
                                <div className="text-xs text-white/60">Oynanan</div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase">Lider Takımlar</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {vslTopTeams.map((team, i) => (
                                    <div key={team.name} className="bg-slate-800/50 rounded-lg p-2 text-center">
                                        <div className={`text-xs font-bold mb-1 ${i === 0 ? 'text-red-400' : 'text-slate-500'}`}>#{i + 1}</div>
                                        <div className="text-sm text-white truncate">{team.name}</div>
                                        <div className="text-xs text-slate-400">{team.points}P</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Link href="/vsl/tahminoyunu" className="flex-1 bg-red-600 hover:bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-center text-sm transition-colors">
                                    🎯 Tahmin Oyunu
                                </Link>
                                <Link href="/vsl/gunceldurum" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-center text-sm transition-colors">
                                    📋 Puan Durumu
                                </Link>
                                <Link href="/vsl/stats" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-center text-sm transition-colors">
                                    📈 İstatistikler
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Arabica Coffee House 1. Lig */}
                    <div className="bg-slate-900 border border-amber-500/30 rounded-2xl overflow-hidden hover:border-amber-400/50 transition-all">
                        <div className="bg-gradient-to-r from-amber-600 to-orange-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">🥇</span>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Arabica Coffee House 1. Lig</h2>
                                    <p className="text-amber-200/70 text-sm">2 Gruplu Lig Sistemi</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">{lig1PlayedCount}</div>
                                <div className="text-xs text-white/60">Oynanan</div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase">Lider Takımlar ({lig1Groups[0]})</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {lig1TopTeams.map((team, i) => (
                                    <div key={team.name} className="bg-slate-800/50 rounded-lg p-2 text-center">
                                        <div className={`text-xs font-bold mb-1 ${i === 0 ? 'text-amber-400' : 'text-slate-500'}`}>#{i + 1}</div>
                                        <div className="text-sm text-white truncate">{team.name}</div>
                                        <div className="text-xs text-slate-400">{team.points}P</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Link href="/1lig/tahminoyunu" className="flex-1 bg-amber-600 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-lg text-center text-sm transition-colors">
                                    🎯 Tahmin Oyunu
                                </Link>
                                <Link href="/1lig/gunceldurum" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-center text-sm transition-colors">
                                    📋 Puan Durumu
                                </Link>
                                <Link href="/1lig/stats" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-center text-sm transition-colors">
                                    📈 İstatistikler
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Kadınlar 2. Lig */}
                    <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl overflow-hidden hover:border-emerald-400/50 transition-all">
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-4 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl">🥈</span>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Kadınlar 2. Lig</h2>
                                    <p className="text-emerald-200/70 text-sm">5 Gruplu Lig Sistemi</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-2xl font-bold text-white">{lig2PlayedCount}</div>
                                <div className="text-xs text-white/60">Oynanan</div>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="text-xs font-bold text-slate-500 uppercase">Lider Takımlar ({lig2Groups[0]})</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2 mb-4">
                                {lig2TopTeams.map((team, i) => (
                                    <div key={team.name} className="bg-slate-800/50 rounded-lg p-2 text-center">
                                        <div className={`text-xs font-bold mb-1 ${i === 0 ? 'text-emerald-400' : 'text-slate-500'}`}>#{i + 1}</div>
                                        <div className="text-sm text-white truncate">{team.name}</div>
                                        <div className="text-xs text-slate-400">{team.points}P</div>
                                    </div>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Link href="/2lig/tahminoyunu" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg text-center text-sm transition-colors">
                                    🎯 Tahmin Oyunu
                                </Link>
                                <Link href="/2lig/gunceldurum" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-center text-sm transition-colors">
                                    📋 Puan Durumu
                                </Link>
                                <Link href="/2lig/stats" className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg text-center text-sm transition-colors">
                                    📈 İstatistikler
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
