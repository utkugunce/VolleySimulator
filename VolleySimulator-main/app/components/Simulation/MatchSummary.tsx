"use client";

import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
    Trophy, 
    TrendingUp, 
    Zap, 
    Shield, 
    Target,
    Flame,
    Clock,
    BarChart3,
    Sparkles
} from 'lucide-react';
import { MatchSimulation, SimulatedSet, SimulatedPoint, SimulationMoment } from '../../types';

interface MatchSummaryProps {
    simulation: MatchSimulation;
    className?: string;
}

interface MatchInsight {
    icon: React.ReactNode;
    title: string;
    description: string;
    type: 'highlight' | 'stat' | 'moment';
    importance: 'high' | 'medium' | 'low';
}

interface TeamStats {
    aces: number;
    blocks: number;
    attacks: number;
    errors: number;
    longestStreak: number;
    comebacks: number;
}

// ============================================
// ANALYSIS FUNCTIONS
// ============================================
function analyzeTeamStats(sets: SimulatedSet[], team: 'home' | 'away'): TeamStats {
    let aces = 0, blocks = 0, attacks = 0, errors = 0;
    let currentStreak = 0, longestStreak = 0;
    let comebacks = 0;

    sets.forEach(set => {
        let wasLosing = false;
        
        set.pointByPoint.forEach((point, idx) => {
            if (point.scorer === team) {
                if (point.type === 'ace') aces++;
                if (point.type === 'block') blocks++;
                if (point.type === 'attack') attacks++;
                
                currentStreak++;
                if (currentStreak > longestStreak) longestStreak = currentStreak;
                
                // Check for comeback (was losing by 3+, now tied or winning)
                if (wasLosing) {
                    const diff = team === 'home' 
                        ? point.homeScore - point.awayScore 
                        : point.awayScore - point.homeScore;
                    if (diff >= 0) {
                        comebacks++;
                        wasLosing = false;
                    }
                }
            } else {
                currentStreak = 0;
                if (point.type === 'error') errors++;
                
                // Track if team is losing by 3+
                const diff = team === 'home'
                    ? point.awayScore - point.homeScore
                    : point.homeScore - point.awayScore;
                if (diff >= 3) wasLosing = true;
            }
        });
    });

    return { aces, blocks, attacks, errors, longestStreak, comebacks };
}

function generateInsights(simulation: MatchSimulation): MatchInsight[] {
    const insights: MatchInsight[] = [];
    const homeStats = analyzeTeamStats(simulation.simulatedSets, 'home');
    const awayStats = analyzeTeamStats(simulation.simulatedSets, 'away');
    
    const isHomeWinner = simulation.winner === simulation.homeTeam;
    const winnerStats = isHomeWinner ? homeStats : awayStats;
    const loserStats = isHomeWinner ? awayStats : homeStats;
    const winner = simulation.winner;
    const loser = isHomeWinner ? simulation.awayTeam : simulation.homeTeam;

    // Match result insight
    const scoreParts = simulation.finalScore.split('-').map(Number);
    const setDiff = Math.abs(scoreParts[0] - scoreParts[1]);
    
    if (simulation.finalScore === '3-0') {
        insights.push({
            icon: <Trophy className="w-5 h-5 text-amber-500" />,
            title: 'Dominant Galibiyet',
            description: `${winner} rakibine set vermeden maçı aldı. Ezici bir üstünlük!`,
            type: 'highlight',
            importance: 'high'
        });
    } else if (simulation.finalScore === '3-2' || simulation.finalScore === '2-3') {
        insights.push({
            icon: <Flame className="w-5 h-5 text-red-500" />,
            title: 'Nefes Kesen Final',
            description: `5 set süren maratonda ${winner} zafere ulaştı. Her an her şey olabilirdi!`,
            type: 'highlight',
            importance: 'high'
        });
    }

    // Ace analysis
    if (winnerStats.aces >= 5) {
        insights.push({
            icon: <Target className="w-5 h-5 text-blue-500" />,
            title: 'Servis Dominasyonu',
            description: `${winner} ${winnerStats.aces} as servis attı. Servis oyunu maçın kaderini belirledi.`,
            type: 'stat',
            importance: 'medium'
        });
    }

    // Block analysis
    if (winnerStats.blocks >= 8) {
        insights.push({
            icon: <Shield className="w-5 h-5 text-purple-500" />,
            title: 'Blok Duvarı',
            description: `${winner} ${winnerStats.blocks} blok sayısıyla filede üstünlük kurdu.`,
            type: 'stat',
            importance: 'medium'
        });
    }

    // Streak analysis
    if (winnerStats.longestStreak >= 5) {
        insights.push({
            icon: <Zap className="w-5 h-5 text-yellow-500" />,
            title: 'Kritik Seri',
            description: `${winner} maç boyunca ${winnerStats.longestStreak} sayılık seri yakaladı. Bu anlar maçı çevirdi!`,
            type: 'moment',
            importance: 'high'
        });
    }

    // Comeback analysis
    if (winnerStats.comebacks > 0) {
        insights.push({
            icon: <TrendingUp className="w-5 h-5 text-green-500" />,
            title: 'Büyük Dönüş',
            description: `${winner} ${winnerStats.comebacks} kez geri dönüş yaparak inanılmaz bir ruh gücü gösterdi.`,
            type: 'moment',
            importance: 'high'
        });
    }

    // Error analysis
    if (loserStats.errors > winnerStats.errors + 3) {
        insights.push({
            icon: <BarChart3 className="w-5 h-5 text-red-400" />,
            title: 'Kritik Hatalar',
            description: `${loser} çok fazla hata yaptı. Kazanmak için kendi hatalarını minimize etmeliydi.`,
            type: 'stat',
            importance: 'medium'
        });
    }

    // Key moments from simulation
    const matchPointMoment = simulation.keyMoments.find(m => m.type === 'match_point');
    if (matchPointMoment) {
        insights.push({
            icon: <Sparkles className="w-5 h-5 text-amber-400" />,
            title: 'Maç Sayısı',
            description: matchPointMoment.description,
            type: 'moment',
            importance: 'high'
        });
    }

    // Close set analysis
    const closeSets = simulation.simulatedSets.filter(set => 
        Math.abs(set.homePoints - set.awayPoints) <= 2
    );
    if (closeSets.length >= 2) {
        insights.push({
            icon: <Clock className="w-5 h-5 text-cyan-500" />,
            title: 'Uzatmalar Maçı',
            description: `${closeSets.length} set deuce'a gitti. Her puan altın değerindeydi!`,
            type: 'stat',
            importance: 'medium'
        });
    }

    return insights.slice(0, 6); // Max 6 insights
}

function generateMatchStory(simulation: MatchSimulation): string {
    const isHomeWinner = simulation.winner === simulation.homeTeam;
    const winner = simulation.winner;
    const loser = isHomeWinner ? simulation.awayTeam : simulation.homeTeam;
    const homeStats = analyzeTeamStats(simulation.simulatedSets, 'home');
    const awayStats = analyzeTeamStats(simulation.simulatedSets, 'away');
    
    let story = '';
    
    // Opening
    if (simulation.finalScore === '3-0') {
        story = `${winner}, ${loser} karşısında üstün bir performans sergileyerek 3-0'lık kesin bir zafer elde etti. `;
    } else if (simulation.finalScore === '3-1') {
        story = `${winner}, zorlu başlayan maçı kontrol altına alarak ${loser}'ı 3-1 mağlup etti. `;
    } else {
        story = `Nefes kesen bir mücadelenin ardından ${winner}, ${loser}'ı 3-2 yenerek zafere ulaştı. `;
    }
    
    // Key stats
    const winnerStats = isHomeWinner ? homeStats : awayStats;
    if (winnerStats.aces >= 3) {
        story += `${winner}'ın ${winnerStats.aces} as servisi maçın kaderinde belirleyici oldu. `;
    }
    if (winnerStats.blocks >= 5) {
        story += `Filede ${winnerStats.blocks} blok yapan ${winner}, defansif üstünlüğünü skora yansıttı. `;
    }
    if (winnerStats.longestStreak >= 4) {
        story += `Kritik anlarda ${winnerStats.longestStreak} sayılık seri yakalayan ${winner}, maçı koparma noktasına getirdi. `;
    }
    
    // Closing
    const closeSets = simulation.simulatedSets.filter(set => 
        Math.abs(set.homePoints - set.awayPoints) <= 2
    );
    if (closeSets.length >= 2) {
        story += `Deuce'a giden ${closeSets.length} setle maç son ana kadar heyecanını korudu.`;
    } else {
        story += `${winner} bu galibiyetle önemli bir moral kazandı.`;
    }
    
    return story;
}

// ============================================
// COMPONENT
// ============================================
export function MatchSummary({ simulation, className = '' }: MatchSummaryProps) {
    const insights = useMemo(() => generateInsights(simulation), [simulation]);
    const story = useMemo(() => generateMatchStory(simulation), [simulation]);
    
    const setScores = simulation.simulatedSets.map(set => ({
        home: set.homePoints,
        away: set.awayPoints,
        winner: set.winner
    }));

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-surface-primary border border-border-subtle rounded-2xl overflow-hidden ${className}`}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-white">Maç Raporu</h3>
                        <p className="text-white/70 text-sm">AI Destekli Analiz</p>
                    </div>
                </div>
            </div>

            <div className="p-6 space-y-6">
                {/* Match Result Summary */}
                <div className="flex items-center justify-between">
                    <div className="text-center flex-1">
                        <div className={`text-lg font-bold ${
                            simulation.winner === simulation.homeTeam ? 'text-primary' : 'text-text-muted'
                        }`}>
                            {simulation.homeTeam}
                        </div>
                    </div>
                    <div className="px-4 py-2 bg-surface-secondary rounded-xl">
                        <div className="text-2xl font-black text-text-primary">{simulation.finalScore}</div>
                    </div>
                    <div className="text-center flex-1">
                        <div className={`text-lg font-bold ${
                            simulation.winner === simulation.awayTeam ? 'text-primary' : 'text-text-muted'
                        }`}>
                            {simulation.awayTeam}
                        </div>
                    </div>
                </div>

                {/* Set Scores */}
                <div className="flex justify-center gap-3">
                    {setScores.map((set, idx) => (
                        <div key={idx} className="text-center">
                            <div className="text-xs text-text-muted mb-1">{idx + 1}. Set</div>
                            <div className={`px-3 py-1.5 rounded-lg text-sm font-bold ${
                                set.winner === 'home' 
                                    ? 'bg-blue-500/20 text-blue-400' 
                                    : 'bg-orange-500/20 text-orange-400'
                            }`}>
                                {set.home}-{set.away}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Match Story */}
                <div className="bg-surface-secondary rounded-xl p-4">
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-text-secondary leading-relaxed">{story}</p>
                    </div>
                </div>

                {/* Insights Grid */}
                <div className="space-y-3">
                    <h4 className="font-medium text-text-primary flex items-center gap-2">
                        <Zap className="w-4 h-4 text-accent" />
                        Öne Çıkan Anlar
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {insights.map((insight, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className={`p-3 rounded-xl border ${
                                    insight.importance === 'high'
                                        ? 'bg-primary/5 border-primary/20'
                                        : 'bg-surface-secondary border-border-subtle'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">{insight.icon}</div>
                                    <div>
                                        <div className="font-medium text-text-primary text-sm">
                                            {insight.title}
                                        </div>
                                        <div className="text-xs text-text-muted mt-0.5">
                                            {insight.description}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Key Moments Timeline */}
                {simulation.keyMoments.length > 0 && (
                    <div className="space-y-3">
                        <h4 className="font-medium text-text-primary flex items-center gap-2">
                            <Clock className="w-4 h-4 text-text-muted" />
                            Maç Akışı
                        </h4>
                        <div className="space-y-2">
                            {simulation.keyMoments.slice(0, 5).map((moment, idx) => (
                                <div 
                                    key={idx}
                                    className="flex items-center gap-3 text-sm"
                                >
                                    <div className="w-12 text-text-muted text-xs">
                                        {Math.floor(moment.time / 60)}:{(moment.time % 60).toString().padStart(2, '0')}
                                    </div>
                                    <div className={`w-2 h-2 rounded-full ${
                                        moment.type === 'match_point' ? 'bg-amber-500' :
                                        moment.type === 'set_point' ? 'bg-primary' :
                                        moment.type === 'comeback' ? 'bg-green-500' :
                                        'bg-slate-500'
                                    }`} />
                                    <div className="text-text-secondary">{moment.description}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
}

export default MatchSummary;
