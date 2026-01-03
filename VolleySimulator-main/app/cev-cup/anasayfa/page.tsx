"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import TeamAvatar from "@/app/components/TeamAvatar";

interface Match {
    id: number;
    round: string;
    leg?: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    setScores?: string;
    isPlayed: boolean;
}

interface Team {
    name: string;
    country: string;
}

interface CEVCupData {
    league: string;
    season: string;
    currentStage: string;
    teams: Team[];
    fixture: Match[];
}

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "THY ISTANBUL"];
const ROUND_LABELS: Record<string, string> = {
    "16th Finals": "Son 32",
    "8th Finals": "Son 16",
    "Play Off": "Play-Off",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final"
};

export default function CEVCupAnasayfa() {
    const [data, setData] = useState<CEVCupData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/cev-cup")
            .then(res => res.json())
            .then(data => setData(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500">
                Veri yüklenemedi
            </div>
        );
    }

    const playedMatches = data.fixture.filter(m => m.isPlayed);
    const upcomingMatches = data.fixture.filter(m => !m.isPlayed).slice(0, 8);
    const turkishTeamMatches = data.fixture.filter(m =>
        TURKISH_TEAMS.includes(m.homeTeam) || TURKISH_TEAMS.includes(m.awayTeam)
    );

    // Get Turkish teams progress
    const getTurkishTeamStats = (teamName: string) => {
        const matches = data.fixture.filter(m => m.homeTeam === teamName || m.awayTeam === teamName);
        const played = matches.filter(m => m.isPlayed);
        let wins = 0;
        played.forEach(m => {
            if (m.homeTeam === teamName && (m.homeScore || 0) > (m.awayScore || 0)) wins++;
            if (m.awayTeam === teamName && (m.awayScore || 0) > (m.homeScore || 0)) wins++;
        });
        return { played: played.length, wins };
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-amber-800 px-4 py-4 relative overflow-hidden">
                <div className="relative max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-white mb-1">CEV Cup</h1>
                            <p className="text-white/70 text-sm">Kadınlar • 2025-2026</p>
                        </div>
                        <div className="text-right">
                            <div className="text-3xl font-bold text-white">{playedMatches.length}</div>
                            <div className="text-xs text-white/60">Oynanan Maç</div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 mt-4 space-y-4 pb-6">
                {/* Current Stage Badge */}
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                    <div className="text-xs text-amber-400/70 uppercase tracking-wider mb-1">Mevcut Aşama</div>
                    <div className="text-2xl font-bold text-amber-400">
                        {ROUND_LABELS[data.currentStage] || data.currentStage}
                    </div>
                </div>

                {/* Turkish Teams Overview */}
                <div className="bg-slate-900 border border-red-500/30 rounded-2xl overflow-hidden">
                    <div className="bg-red-900/20 px-4 py-3 border-b border-red-500/20">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span>🇹🇷</span> Türk Takımları
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {TURKISH_TEAMS.map(teamName => {
                            const stats = getTurkishTeamStats(teamName);
                            const nextMatch = data.fixture.find(m =>
                                !m.isPlayed && (m.homeTeam === teamName || m.awayTeam === teamName)
                            );
                            const opponent = nextMatch ?
                                (nextMatch.homeTeam === teamName ? nextMatch.awayTeam : nextMatch.homeTeam) : null;

                            return (
                                <div key={teamName} className="px-4 py-3 flex items-center gap-3">
                                    <TeamAvatar name={teamName} size="sm" />
                                    <div className="flex-1">
                                        <div className="font-medium text-sm text-white">{teamName}</div>
                                        <div className="text-xs text-slate-500">
                                            {stats.wins}G / {stats.played}M
                                            {opponent && (
                                                <span className="text-amber-400 ml-2">
                                                    → vs {opponent}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs text-amber-400 font-bold">
                                            {ROUND_LABELS[data.currentStage]}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Recent Results */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> Son Sonuçlar
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50 max-h-64 overflow-y-auto">
                        {playedMatches.slice(-6).reverse().map((match, i) => {
                            const hasTurkish = TURKISH_TEAMS.includes(match.homeTeam) || TURKISH_TEAMS.includes(match.awayTeam);
                            return (
                                <div key={match.id} className={`px-4 py-3 ${hasTurkish ? "bg-red-900/10" : ""}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 text-right text-sm text-slate-300 truncate flex items-center justify-end gap-1">
                                            {match.homeTeam}
                                            {TURKISH_TEAMS.includes(match.homeTeam) && <span>🇹🇷</span>}
                                        </div>
                                        <div className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/20 text-emerald-400">
                                            {match.homeScore} - {match.awayScore}
                                        </div>
                                        <div className="flex-1 text-sm text-slate-300 truncate flex items-center gap-1">
                                            {TURKISH_TEAMS.includes(match.awayTeam) && <span>🇹🇷</span>}
                                            {match.awayTeam}
                                        </div>
                                    </div>
                                    <div className="text-center text-[10px] text-slate-500">
                                        {ROUND_LABELS[match.round] || match.round} • {match.leg === 1 ? "1. Maç" : "2. Maç"}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Upcoming Matches */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="text-amber-400">📅</span> Gelecek Maçlar
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {upcomingMatches.map((match, i) => {
                            const hasTurkish = TURKISH_TEAMS.includes(match.homeTeam) || TURKISH_TEAMS.includes(match.awayTeam);
                            return (
                                <div key={match.id} className={`px-4 py-3 ${hasTurkish ? "bg-red-900/10" : ""}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 text-right text-sm text-slate-300 truncate flex items-center justify-end gap-1">
                                            {match.homeTeam}
                                            {TURKISH_TEAMS.includes(match.homeTeam) && <span>🇹🇷</span>}
                                        </div>
                                        <div className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-500">
                                            vs
                                        </div>
                                        <div className="flex-1 text-sm text-slate-300 truncate flex items-center gap-1">
                                            {TURKISH_TEAMS.includes(match.awayTeam) && <span>🇹🇷</span>}
                                            {match.awayTeam}
                                        </div>
                                    </div>
                                    <div className="text-center text-[10px] text-slate-500">
                                        {ROUND_LABELS[match.round] || match.round} • {match.date?.split('-').reverse().join('.')}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/cev-cup/gunceldurum"
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:bg-slate-800 transition-colors group"
                    >
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">Güncel Durum</div>
                        <div className="text-xs text-slate-500">Tüm eşleşmeleri gör</div>
                    </Link>
                    <Link
                        href="/cev-cup/stats"
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:bg-slate-800 transition-colors group"
                    >
                        <div className="text-2xl mb-2">📈</div>
                        <div className="font-bold text-white text-sm group-hover:text-amber-400 transition-colors">İstatistikler</div>
                        <div className="text-xs text-slate-500">Takım performansları</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
