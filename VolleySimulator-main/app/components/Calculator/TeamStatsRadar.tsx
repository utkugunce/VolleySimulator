"use client";

import React from 'react';
import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    ResponsiveContainer,
    PolarRadiusAxis,
} from 'recharts';
import { getTeamTheme } from '../../utils/team-themes';

interface TeamStats {
    attack: number;
    block: number;
    serve: number;
    dig: number;
    reception: number;
    consistency: number;
}

const MOCK_TEAM_STATS: Record<string, TeamStats> = {
    "VakıfBank": { attack: 95, block: 92, serve: 88, dig: 85, reception: 82, consistency: 90 },
    "Eczacıbaşı Dynavit": { attack: 98, block: 88, serve: 92, dig: 82, reception: 85, consistency: 92 },
    "Fenerbahçe Medicana": { attack: 94, block: 90, serve: 95, dig: 88, reception: 90, consistency: 94 },
    "Türk Hava Yolları": { attack: 85, block: 82, serve: 80, dig: 78, reception: 75, consistency: 82 },
    "Galatasaray Daikin": { attack: 88, block: 85, serve: 82, dig: 80, reception: 82, consistency: 85 },
    "Kuzeyboru": { attack: 82, block: 80, serve: 75, dig: 85, reception: 80, consistency: 78 },
};

const DEFAULT_STATS: TeamStats = {
    attack: 70, block: 70, serve: 70, dig: 70, reception: 70, consistency: 70
};

interface TeamStatsRadarProps {
    homeTeam: string;
    awayTeam: string;
}

export function TeamStatsRadar({ homeTeam, awayTeam }: TeamStatsRadarProps) {
    const homeStats = MOCK_TEAM_STATS[homeTeam] || DEFAULT_STATS;
    const awayStats = MOCK_TEAM_STATS[awayTeam] || DEFAULT_STATS;
    const homeTheme = getTeamTheme(homeTeam);
    const awayTheme = getTeamTheme(awayTeam);

    const data = [
        { subject: 'Hücum', A: homeStats.attack, B: awayStats.attack, fullMark: 100 },
        { subject: 'Blok', A: homeStats.block, B: awayStats.block, fullMark: 100 },
        { subject: 'Servis', A: homeStats.serve, B: awayStats.serve, fullMark: 100 },
        { subject: 'Defans', A: homeStats.dig, B: awayStats.dig, fullMark: 100 },
        { subject: 'Manşet', A: homeStats.reception, B: awayStats.reception, fullMark: 100 },
        { subject: 'İstikrar', A: homeStats.consistency, B: awayStats.consistency, fullMark: 100 },
    ];

    return (
        <div className="w-full h-[300px] flex flex-col items-center justify-center">
            {/* Legend */}
            <div className="flex justify-center gap-6 mb-4 text-[10px] font-black uppercase tracking-widest">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ '--team-color': homeTheme.primary, backgroundColor: 'var(--team-color)' } as any} />
                    <span className="text-text-primary">{homeTeam}</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ '--team-color': awayTheme.primary, backgroundColor: 'var(--team-color)' } as any} />
                    <span className="text-text-primary">{awayTeam}</span>
                </div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="#334155" />
                    <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }}
                    />
                    <Radar
                        name={homeTeam}
                        dataKey="A"
                        stroke={homeTheme.primary}
                        fill={homeTheme.primary}
                        fillOpacity={0.4}
                    />
                    <Radar
                        name={awayTeam}
                        dataKey="B"
                        stroke={awayTheme.primary}
                        fill={awayTheme.primary}
                        fillOpacity={0.4}
                    />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
