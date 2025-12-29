"use client";

import { useState, useEffect } from "react";
import { useGameState } from "../utils/gameState";

interface TeamLoyaltySelectorProps {
    teams: { name: string }[];
    onSelect?: (team: string | null) => void;
}

export default function TeamLoyaltySelector({ teams, onSelect }: TeamLoyaltySelectorProps) {
    const { gameState, setFavoriteTeam } = useGameState();
    const [isOpen, setIsOpen] = useState(false);

    const handleSelect = (teamName: string | null) => {
        setFavoriteTeam(teamName);
        setIsOpen(false);
        onSelect?.(teamName);
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${gameState.favoriteTeam
                        ? 'bg-gradient-to-r from-rose-600 to-pink-600 text-white border-rose-500 shadow-lg shadow-rose-500/20'
                        : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white hover:bg-slate-700'
                    }`}
            >
                <span>❤️</span>
                <span className="hidden sm:inline">
                    {gameState.favoriteTeam || "Takım Seç"}
                </span>
                {gameState.favoriteTeam && (
                    <span className="bg-amber-500 text-[9px] px-1 rounded">+20% XP</span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full mt-1 right-0 z-50 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-[300px] overflow-y-auto min-w-[200px]">
                    <div className="p-2 border-b border-slate-700">
                        <div className="text-xs text-slate-400 font-bold uppercase">Favori Takım</div>
                        <div className="text-[10px] text-amber-500 mt-0.5">Maçlarına +20% XP bonus!</div>
                    </div>

                    {gameState.favoriteTeam && (
                        <button
                            onClick={() => handleSelect(null)}
                            className="w-full px-3 py-2 text-left text-xs text-rose-400 hover:bg-rose-900/30 border-b border-slate-700/50"
                        >
                            ✕ Seçimi Kaldır
                        </button>
                    )}

                    <div className="py-1">
                        {teams.map(team => (
                            <button
                                key={team.name}
                                onClick={() => handleSelect(team.name)}
                                className={`w-full px-3 py-2 text-left text-xs transition-all flex items-center gap-2 ${gameState.favoriteTeam === team.name
                                        ? 'bg-rose-600/20 text-rose-400'
                                        : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                {gameState.favoriteTeam === team.name && <span>❤️</span>}
                                <span className="truncate">{team.name}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
