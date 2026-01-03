"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TeamCompareModalProps {
    isOpen: boolean;
    onClose: () => void;
    team1: TeamData | null;
    team2: TeamData | null;
}

interface TeamData {
    name: string;
    played: number;
    wins: number;
    points: number;
    setsWon: number;
    setsLost: number;
    elo?: number;
}

export default function TeamCompareModal({ isOpen, onClose, team1, team2 }: TeamCompareModalProps) {
    if (!team1 || !team2) return null;

    const stats: { label: string; key: keyof TeamData; icon: string; inverse?: boolean }[] = [
        { label: 'Oynanan', key: 'played', icon: '🎮' },
        { label: 'Galibiyet', key: 'wins', icon: '🏆' },
        { label: 'Puan', key: 'points', icon: '⭐' },
        { label: 'Set Kazanılan', key: 'setsWon', icon: '📊' },
        { label: 'Set Kaybedilen', key: 'setsLost', icon: '📉', inverse: true },
    ];

    const getWinner = (key: keyof TeamData, inverse = false) => {
        const v1 = team1[key] as number;
        const v2 = team2[key] as number;
        if (v1 === v2) return 0;
        if (inverse) return v1 < v2 ? 1 : 2;
        return v1 > v2 ? 1 : 2;
    };

    return (
        <Dialog open={isOpen} onOpenChange={() => onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle className="text-center">⚔️ Takım Karşılaştırması</DialogTitle>
                </DialogHeader>

                {/* Team Headers */}
                <div className="flex justify-between items-center mb-6">
                    <div className="text-center flex-1">
                        <div className="text-2xl mb-2">🔵</div>
                        <h3 className="font-bold text-foreground text-sm truncate px-2">{team1.name}</h3>
                    </div>
                    <div className="text-2xl text-muted-foreground">VS</div>
                    <div className="text-center flex-1">
                        <div className="text-2xl mb-2">🔴</div>
                        <h3 className="font-bold text-foreground text-sm truncate px-2">{team2.name}</h3>
                    </div>
                </div>

                {/* Stats Comparison */}
                <div className="space-y-3">
                    {stats.map(stat => {
                        const winner = getWinner(stat.key, stat.inverse);
                        const v1 = team1[stat.key] as number;
                        const v2 = team2[stat.key] as number;
                        const max = Math.max(v1, v2) || 1;

                        return (
                            <div key={stat.key} className="bg-muted rounded-lg p-3">
                                <div className="text-xs text-muted-foreground text-center mb-2">{stat.icon} {stat.label}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-sm font-bold w-8 text-right ${winner === 1 ? 'text-emerald-400' : 'text-foreground'}`}>
                                        {v1}
                                    </span>
                                    <div className="flex-1 flex gap-1 h-3">
                                        <div
                                            className={`h-full rounded-l transition-all ${winner === 1 ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
                                            style={{ width: `${(v1 / max) * 50}%` }}
                                        />
                                        <div
                                            className={`h-full rounded-r transition-all ${winner === 2 ? 'bg-emerald-500' : 'bg-muted-foreground/30'}`}
                                            style={{ width: `${(v2 / max) * 50}%` }}
                                        />
                                    </div>
                                    <span className={`text-sm font-bold w-8 ${winner === 2 ? 'text-emerald-400' : 'text-foreground'}`}>
                                        {v2}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Close Button */}
                <Button onClick={onClose} variant="secondary" className="w-full mt-4">
                    Kapat
                </Button>
            </DialogContent>
        </Dialog>
    );
}
