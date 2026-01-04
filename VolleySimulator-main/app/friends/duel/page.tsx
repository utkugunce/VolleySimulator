"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Swords, 
    Trophy, 
    Users, 
    Clock, 
    Coins,
    ArrowRight,
    Check,
    X,
    Loader2,
    AlertCircle,
    ChevronLeft
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { useWallet } from '../../hooks/useWallet';

// ============================================
// TYPES
// ============================================
interface Friend {
    id: string;
    displayName: string;
    avatarUrl?: string;
    level: number;
    isOnline: boolean;
}

interface UpcomingMatch {
    id: string;
    homeTeam: string;
    awayTeam: string;
    date: string;
    league: string;
}

interface Duel {
    id: string;
    matchId: string;
    match: UpcomingMatch;
    challengerId: string;
    challengerName: string;
    opponentId: string;
    opponentName: string;
    stake: number;
    challengerPrediction?: string;
    opponentPrediction?: string;
    status: 'pending' | 'accepted' | 'completed' | 'declined';
    winnerId?: string;
    createdAt: string;
}

// ============================================
// MOCK DATA (Replace with real API calls)
// ============================================
const MOCK_FRIENDS: Friend[] = [
    { id: '1', displayName: 'Ahmet Y.', level: 12, isOnline: true },
    { id: '2', displayName: 'Mehmet K.', level: 8, isOnline: true },
    { id: '3', displayName: 'Ayşe S.', level: 15, isOnline: false },
    { id: '4', displayName: 'Fatma B.', level: 6, isOnline: false },
];

const MOCK_MATCHES: UpcomingMatch[] = [
    { 
        id: 'm1', 
        homeTeam: 'ECZACIBAŞI DYNAVİT', 
        awayTeam: 'VAKIFBANK', 
        date: '2026-01-10T18:00:00', 
        league: 'Sultanlar Ligi' 
    },
    { 
        id: 'm2', 
        homeTeam: 'FENERBAHÇE MEDICANA', 
        awayTeam: 'GALATASARAY DAIKIN', 
        date: '2026-01-11T15:00:00', 
        league: 'Sultanlar Ligi' 
    },
    { 
        id: 'm3', 
        homeTeam: 'THY', 
        awayTeam: 'NİLÜFER BELEDİYESPOR', 
        date: '2026-01-12T17:00:00', 
        league: 'Sultanlar Ligi' 
    },
];

const DUEL_STORAGE_KEY = 'volleySim_duels';
const STAKE_OPTIONS = [25, 50, 100, 200];
const SCORE_OPTIONS = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];

// ============================================
// COMPONENT
// ============================================
export default function DuelPage() {
    const { user } = useAuth();
    const { wallet, spendCoins, addCoins } = useWallet();
    
    const [step, setStep] = useState<'list' | 'select-friend' | 'select-match' | 'create'>('list');
    const [selectedFriend, setSelectedFriend] = useState<Friend | null>(null);
    const [selectedMatch, setSelectedMatch] = useState<UpcomingMatch | null>(null);
    const [selectedStake, setSelectedStake] = useState(50);
    const [myPrediction, setMyPrediction] = useState<string | null>(null);
    const [duels, setDuels] = useState<Duel[]>([]);
    const [loading, setLoading] = useState(false);

    // Load duels from localStorage
    useEffect(() => {
        const stored = localStorage.getItem(DUEL_STORAGE_KEY);
        if (stored) {
            setDuels(JSON.parse(stored));
        }
    }, []);

    // Save duels to localStorage
    const saveDuels = (newDuels: Duel[]) => {
        setDuels(newDuels);
        localStorage.setItem(DUEL_STORAGE_KEY, JSON.stringify(newDuels));
    };

    const handleCreateDuel = () => {
        if (!selectedFriend || !selectedMatch || !myPrediction) return;
        if (wallet.coins < selectedStake) return;

        // Deduct stake
        spendCoins(selectedStake, `Düello başlatıldı: ${selectedFriend.displayName}`, {
            duelId: `duel-${Date.now()}`
        });

        const newDuel: Duel = {
            id: `duel-${Date.now()}`,
            matchId: selectedMatch.id,
            match: selectedMatch,
            challengerId: user?.id || 'local-user',
            challengerName: user?.email?.split('@')[0] || 'Sen',
            opponentId: selectedFriend.id,
            opponentName: selectedFriend.displayName,
            stake: selectedStake,
            challengerPrediction: myPrediction,
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        saveDuels([newDuel, ...duels]);
        
        // Reset and go back to list
        setStep('list');
        setSelectedFriend(null);
        setSelectedMatch(null);
        setMyPrediction(null);
    };

    const handleAcceptDuel = (duel: Duel, prediction: string) => {
        if (wallet.coins < duel.stake) return;

        spendCoins(duel.stake, `Düello kabul edildi: ${duel.challengerName}`, {
            duelId: duel.id
        });

        const updatedDuels = duels.map(d => {
            if (d.id === duel.id) {
                return { ...d, opponentPrediction: prediction, status: 'accepted' as const };
            }
            return d;
        });

        saveDuels(updatedDuels);
    };

    const handleDeclineDuel = (duelId: string) => {
        const duel = duels.find(d => d.id === duelId);
        if (duel) {
            // Refund challenger
            addCoins(duel.stake, `Düello reddedildi - iade`, { duelId });
        }
        
        const updatedDuels = duels.filter(d => d.id !== duelId);
        saveDuels(updatedDuels);
    };

    const pendingDuels = duels.filter(d => d.status === 'pending');
    const activeDuels = duels.filter(d => d.status === 'accepted');
    const completedDuels = duels.filter(d => d.status === 'completed');

    return (
        <main className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-orange-600 px-4 py-6">
                <div className="max-w-2xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {step !== 'list' && (
                                <button
                                    onClick={() => setStep('list')}
                                    className="p-2 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
                                >
                                    <ChevronLeft className="w-5 h-5 text-white" />
                                </button>
                            )}
                            <div>
                                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                                    <Swords className="w-6 h-6" />
                                    Düello
                                </h1>
                                <p className="text-white/70 text-sm">
                                    Arkadaşlarına meydan oku!
                                </p>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2">
                            <Coins className="w-5 h-5 text-amber-300" />
                            <span className="text-xl font-bold text-white">{wallet.coins}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6">
                <AnimatePresence mode="wait">
                    {/* STEP: List Duels */}
                    {step === 'list' && (
                        <motion.div
                            key="list"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >
                            {/* New Duel Button */}
                            <button
                                onClick={() => setStep('select-friend')}
                                className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg hover:opacity-90 transition-opacity"
                            >
                                <Swords className="w-5 h-5" />
                                Yeni Düello Başlat
                            </button>

                            {/* Pending Duels (Incoming Challenges) */}
                            {pendingDuels.length > 0 && (
                                <section>
                                    <h2 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-amber-500" />
                                        Bekleyen Meydan Okumalar
                                    </h2>
                                    <div className="space-y-3">
                                        {pendingDuels.map(duel => (
                                            <DuelCard 
                                                key={duel.id} 
                                                duel={duel} 
                                                onAccept={(prediction) => handleAcceptDuel(duel, prediction)}
                                                onDecline={() => handleDeclineDuel(duel.id)}
                                                canAfford={wallet.coins >= duel.stake}
                                            />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Active Duels */}
                            {activeDuels.length > 0 && (
                                <section>
                                    <h2 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                                        <Swords className="w-4 h-4 text-primary" />
                                        Aktif Düellolar
                                    </h2>
                                    <div className="space-y-3">
                                        {activeDuels.map(duel => (
                                            <ActiveDuelCard key={duel.id} duel={duel} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {/* Completed Duels */}
                            {completedDuels.length > 0 && (
                                <section>
                                    <h2 className="font-bold text-text-primary mb-3 flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        Tamamlanan Düellolar
                                    </h2>
                                    <div className="space-y-3">
                                        {completedDuels.slice(0, 5).map(duel => (
                                            <CompletedDuelCard key={duel.id} duel={duel} userId={user?.id || 'local-user'} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {duels.length === 0 && (
                                <div className="text-center py-12">
                                    <Swords className="w-16 h-16 text-text-muted mx-auto mb-4" />
                                    <h3 className="font-bold text-text-primary mb-2">Henüz düellon yok</h3>
                                    <p className="text-text-muted text-sm">
                                        Arkadaşlarına meydan oku ve coin kazan!
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {/* STEP: Select Friend */}
                    {step === 'select-friend' && (
                        <motion.div
                            key="select-friend"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="font-bold text-text-primary">Rakibini Seç</h2>
                            <div className="space-y-2">
                                {MOCK_FRIENDS.map(friend => (
                                    <button
                                        key={friend.id}
                                        onClick={() => {
                                            setSelectedFriend(friend);
                                            setStep('select-match');
                                        }}
                                        className="w-full flex items-center justify-between p-4 bg-surface-primary border border-border-subtle rounded-xl hover:border-primary/50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="relative">
                                                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                                                    {friend.displayName.charAt(0)}
                                                </div>
                                                {friend.isOnline && (
                                                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 border-2 border-surface-primary rounded-full" />
                                                )}
                                            </div>
                                            <div className="text-left">
                                                <div className="font-medium text-text-primary">{friend.displayName}</div>
                                                <div className="text-xs text-text-muted">Seviye {friend.level}</div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-text-muted" />
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP: Select Match */}
                    {step === 'select-match' && (
                        <motion.div
                            key="select-match"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-4"
                        >
                            <h2 className="font-bold text-text-primary">Maç Seç</h2>
                            <div className="space-y-2">
                                {MOCK_MATCHES.map(match => (
                                    <button
                                        key={match.id}
                                        onClick={() => {
                                            setSelectedMatch(match);
                                            setStep('create');
                                        }}
                                        className="w-full p-4 bg-surface-primary border border-border-subtle rounded-xl hover:border-primary/50 transition-colors text-left"
                                    >
                                        <div className="text-xs text-text-muted mb-2">{match.league}</div>
                                        <div className="font-medium text-text-primary mb-1">
                                            {match.homeTeam} vs {match.awayTeam}
                                        </div>
                                        <div className="text-sm text-text-muted flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {new Date(match.date).toLocaleDateString('tr-TR', {
                                                weekday: 'long',
                                                day: 'numeric',
                                                month: 'long',
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* STEP: Create Duel */}
                    {step === 'create' && selectedFriend && selectedMatch && (
                        <motion.div
                            key="create"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="space-y-6"
                        >
                            {/* Summary */}
                            <div className="bg-surface-primary border border-border-subtle rounded-xl p-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold mx-auto mb-1">
                                            {user?.email?.charAt(0).toUpperCase() || 'S'}
                                        </div>
                                        <div className="text-xs text-text-primary">Sen</div>
                                    </div>
                                    <Swords className="w-8 h-8 text-red-500" />
                                    <div className="text-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center text-white font-bold mx-auto mb-1">
                                            {selectedFriend.displayName.charAt(0)}
                                        </div>
                                        <div className="text-xs text-text-primary">{selectedFriend.displayName}</div>
                                    </div>
                                </div>
                                <div className="text-center text-sm text-text-muted">
                                    {selectedMatch.homeTeam} vs {selectedMatch.awayTeam}
                                </div>
                            </div>

                            {/* Stake Selection */}
                            <div>
                                <h3 className="font-medium text-text-primary mb-3">Bahis Miktarı</h3>
                                <div className="grid grid-cols-4 gap-2">
                                    {STAKE_OPTIONS.map(stake => (
                                        <button
                                            key={stake}
                                            onClick={() => setSelectedStake(stake)}
                                            disabled={wallet.coins < stake}
                                            className={`py-3 rounded-xl font-bold transition-all ${
                                                selectedStake === stake
                                                    ? 'bg-primary text-white'
                                                    : wallet.coins >= stake
                                                        ? 'bg-surface-secondary text-text-primary hover:bg-primary/20'
                                                        : 'bg-surface-secondary text-text-muted opacity-50 cursor-not-allowed'
                                            }`}
                                        >
                                            {stake} 🪙
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Prediction Selection */}
                            <div>
                                <h3 className="font-medium text-text-primary mb-3">Tahminin</h3>
                                <div className="grid grid-cols-3 gap-2">
                                    {SCORE_OPTIONS.map(score => {
                                        const isHomeWin = score.startsWith('3');
                                        return (
                                            <button
                                                key={score}
                                                onClick={() => setMyPrediction(score)}
                                                className={`py-3 rounded-xl font-medium transition-all ${
                                                    myPrediction === score
                                                        ? isHomeWin
                                                            ? 'bg-blue-600 text-white'
                                                            : 'bg-orange-600 text-white'
                                                        : 'bg-surface-secondary text-text-primary hover:opacity-80'
                                                }`}
                                            >
                                                {score}
                                            </button>
                                        );
                                    })}
                                </div>
                                <div className="flex justify-between text-xs text-text-muted mt-2">
                                    <span>← {selectedMatch.homeTeam}</span>
                                    <span>{selectedMatch.awayTeam} →</span>
                                </div>
                            </div>

                            {/* Create Button */}
                            <button
                                onClick={handleCreateDuel}
                                disabled={!myPrediction || wallet.coins < selectedStake}
                                className="w-full py-4 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                            >
                                Meydan Oku! ({selectedStake} 🪙)
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}

// ============================================
// SUB-COMPONENTS
// ============================================
function DuelCard({ 
    duel, 
    onAccept, 
    onDecline,
    canAfford 
}: { 
    duel: Duel; 
    onAccept: (prediction: string) => void;
    onDecline: () => void;
    canAfford: boolean;
}) {
    const [showPredictions, setShowPredictions] = useState(false);

    return (
        <div className="bg-surface-primary border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white text-sm font-bold">
                        {duel.challengerName.charAt(0)}
                    </div>
                    <span className="font-medium text-text-primary">{duel.challengerName}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                    <Coins className="w-4 h-4" />
                    <span className="font-bold">{duel.stake}</span>
                </div>
            </div>
            
            <div className="text-sm text-text-muted mb-3">
                {duel.match.homeTeam} vs {duel.match.awayTeam}
            </div>

            {!showPredictions ? (
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowPredictions(true)}
                        disabled={!canAfford}
                        className="flex-1 py-2 bg-primary text-white rounded-lg font-medium disabled:opacity-50"
                    >
                        {canAfford ? 'Kabul Et' : 'Yetersiz Coin'}
                    </button>
                    <button
                        onClick={onDecline}
                        className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-3 gap-2">
                    {SCORE_OPTIONS.map(score => (
                        <button
                            key={score}
                            onClick={() => onAccept(score)}
                            className="py-2 bg-surface-secondary text-text-primary rounded-lg text-sm font-medium hover:bg-primary hover:text-white transition-colors"
                        >
                            {score}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

function ActiveDuelCard({ duel }: { duel: Duel }) {
    return (
        <div className="bg-surface-primary border border-primary/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <Swords className="w-4 h-4 text-primary" />
                    <span className="text-sm text-text-muted">vs {duel.opponentName}</span>
                </div>
                <div className="flex items-center gap-1 text-amber-500">
                    <Coins className="w-4 h-4" />
                    <span className="font-bold">{duel.stake * 2}</span>
                </div>
            </div>
            <div className="text-sm font-medium text-text-primary mb-2">
                {duel.match.homeTeam} vs {duel.match.awayTeam}
            </div>
            <div className="flex items-center justify-between text-xs">
                <span className="text-text-muted">Senin: <span className="text-primary font-medium">{duel.challengerPrediction}</span></span>
                <span className="text-text-muted">Rakip: <span className="text-accent font-medium">{duel.opponentPrediction}</span></span>
            </div>
        </div>
    );
}

function CompletedDuelCard({ duel, userId }: { duel: Duel; userId: string }) {
    const isWinner = duel.winnerId === userId;
    
    return (
        <div className={`bg-surface-primary border rounded-xl p-4 ${
            isWinner ? 'border-green-500/30' : 'border-red-500/30'
        }`}>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {isWinner ? (
                        <Trophy className="w-5 h-5 text-amber-500" />
                    ) : (
                        <X className="w-5 h-5 text-red-400" />
                    )}
                    <span className="text-sm text-text-muted">vs {duel.opponentName}</span>
                </div>
                <div className={`flex items-center gap-1 ${isWinner ? 'text-green-500' : 'text-red-400'}`}>
                    <span className="font-bold">{isWinner ? '+' : '-'}{duel.stake}</span>
                    <Coins className="w-4 h-4" />
                </div>
            </div>
        </div>
    );
}
