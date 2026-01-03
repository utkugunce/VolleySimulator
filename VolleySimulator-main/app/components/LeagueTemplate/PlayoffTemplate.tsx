"use client";

import { useMemo } from "react";
import { TeamStats, Match } from "../../types";
import { LeagueConfig } from "./types";
import LeagueActionBar from "./LeagueActionBar";

interface PlayoffTemplateProps {
    config: LeagueConfig;
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function PlayoffTemplate({ config, initialTeams, initialMatches }: PlayoffTemplateProps) {
    // Determine matches to show (e.g. only playoff rounds if specified)
    const currentMatches = useMemo(() => {
        // Filter for playoff matches if needed, currently assumes all passed matches are relevant
        return initialMatches;
    }, [initialMatches]);

    const progress = useMemo(() => {
        const played = currentMatches.filter(m => m.isPlayed).length;
        const total = currentMatches.length;
        return total > 0 ? Math.round((played / total) * 100) : 0;
    }, [currentMatches]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans pb-20 sm:pb-4">
            <div className="max-w-[1600px] mx-auto flex flex-col h-[calc(100vh-2rem)] gap-4">

                <LeagueActionBar
                    config={config}
                    title={config.name}
                    subtitle="Play-Off Aşaması"
                    progress={progress}
                    progressLabel={`%${progress}`}
                />

                <div className="flex-1 min-h-0 bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden relative flex items-center justify-center">
                    <div className="text-center text-slate-500">
                        <p className="text-lg font-bold">Play-Off Bracket</p>
                        <p className="text-sm">{currentMatches.length} maç • {initialTeams.length} takım</p>
                    </div>
                </div>
            </div>
        </main>
    );
}
