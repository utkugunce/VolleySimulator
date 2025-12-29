import React from 'react';
import { Match } from '../types';

interface ScenarioEditorProps {
    matches: Match[]; // Upcoming matches
    overrides: Record<string, string>; // matchId ("Home-Away") -> score ("3-0")
    onUpdate: (matchId: string, score: string | null) => void;
    targetTeam: string;
}

const SCORES = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];

const ScenarioEditor: React.FC<ScenarioEditorProps> = ({ matches, overrides, onUpdate, targetTeam }) => {
    return (
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-5 space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="font-bold text-slate-100 flex items-center gap-2">
                    <span>🎮</span> Senaryo Modu
                </h3>
                <span className="text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded">Gelecek 4 Maç</span>
            </div>

            <div className="space-y-3">
                {matches.slice(0, 4).map(match => {
                    const matchId = `${match.homeTeam}-${match.awayTeam}`;
                    const currentScore = overrides[matchId] || "";
                    const isHome = match.homeTeam === targetTeam;
                    const opponent = isHome ? match.awayTeam : match.homeTeam;

                    return (
                        <div key={matchId} className="bg-slate-950 p-3 rounded border border-slate-800/50">
                            <div className="flex justify-between items-center mb-2">
                                <div className="flex items-center gap-2 text-sm text-slate-300">
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isHome ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
                                        {isHome ? 'EV' : 'DEP'}
                                    </span>
                                    <span className="font-medium truncate">{opponent}</span>
                                </div>
                                {currentScore && (
                                    <button
                                        onClick={() => onUpdate(matchId, null)}
                                        className="text-[10px] text-slate-500 hover:text-white underline"
                                    >
                                        Temizle
                                    </button>
                                )}
                            </div>

                            <div className="flex gap-2">
                                {/* Win Options */}
                                <div className="flex-1 flex gap-1">
                                    {SCORES.slice(0, 3).map(score => { // 3-0, 3-1, 3-2
                                        const isSelected = currentScore === score;
                                        const [h, a] = score.split('-').map(Number);
                                        const targetWins = isHome ? h > a : a > h;
                                        const colorClass = targetWins ? 'hover:bg-emerald-900/50 hover:border-emerald-500/50' : 'hover:bg-rose-900/50 hover:border-rose-500/50';
                                        const activeClass = targetWins ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white';

                                        return (
                                            <button
                                                key={score}
                                                onClick={() => onUpdate(matchId, isSelected ? null : score)}
                                                className={`flex-1 text-[10px] py-1.5 rounded border transition-all text-center ${isSelected
                                                        ? activeClass
                                                        : 'bg-slate-900 border-slate-800 text-slate-400 ' + colorClass
                                                    }`}
                                            >
                                                {score}
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Lose Options */}
                                <div className="flex-1 flex gap-1">
                                    {SCORES.slice(3, 6).map(score => { // 2-3, 1-3, 0-3
                                        const isSelected = currentScore === score;
                                        const [h, a] = score.split('-').map(Number);
                                        const targetWins = isHome ? h > a : a > h;
                                        const colorClass = targetWins ? 'hover:bg-emerald-900/50 hover:border-emerald-500/50' : 'hover:bg-rose-900/50 hover:border-rose-500/50';
                                        const activeClass = targetWins ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-rose-600 border-rose-500 text-white';

                                        return (
                                            <button
                                                key={score}
                                                onClick={() => onUpdate(matchId, isSelected ? null : score)}
                                                className={`flex-1 text-[10px] py-1.5 rounded border transition-all text-center ${isSelected
                                                        ? activeClass
                                                        : 'bg-slate-900 border-slate-800 text-slate-400 ' + colorClass
                                                    }`}
                                            >
                                                {score}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            <p className="text-xs text-slate-500 italic">
                * Skorlara tıklayarak simülasyonu manipüle edebilirsiniz. Seçimi kaldırmak için tekrar tıklayın.
            </p>
        </div>
    );
};

export default ScenarioEditor;
