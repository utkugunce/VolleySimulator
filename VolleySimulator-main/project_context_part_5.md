# Project Application Context - Part 5

## File: app\api\results\sync\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleClient } from '../../../utils/supabase-server';

// Scoring constants
const SCORE_EXACT_MATCH = 15;      // Exact score prediction
const SCORE_WINNER_CORRECT = 8;    // Right winner, wrong score
const BONUS_STREAK_3 = 5;
const BONUS_STREAK_5 = 10;
const BONUS_STREAK_10 = 25;

function getWinner(score: string): 'home' | 'away' | 'draw' {
    const [home, away] = score.split('-').map(Number);
    if (home > away) return 'home';
    if (away > home) return 'away';
    return 'draw';
}

function calculatePoints(predicted: string, actual: string): number {
    if (predicted === actual) return SCORE_EXACT_MATCH;
    if (getWinner(predicted) === getWinner(actual)) return SCORE_WINNER_CORRECT;
    return 0;
}

// POST - Sync match results and score predictions
export async function POST(request: NextRequest) {
    try {
        // This endpoint should be called by a cron job or admin
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // Simple auth check (you can enhance this)
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const supabase = createServiceRoleClient();
        const body = await request.json();

        // Expect: { results: [{ matchId, resultScore, league, groupName, homeTeam, awayTeam, matchDate }] }
        const results = body.results || [];

        if (results.length === 0) {
            return NextResponse.json({ error: 'No results provided' }, { status: 400 });
        }

        let savedResults = 0;
        let scoredPredictions = 0;
        const userPointsMap = new Map<string, { points: number, correct: number, partial: number }>();

        for (const result of results) {
            // 1. Save/update match result
            const { error: resultError } = await supabase
                .from('match_results')
                .upsert({
                    match_id: result.matchId,
                    league: result.league,
                    group_name: result.groupName,
                    home_team: result.homeTeam,
                    away_team: result.awayTeam,
                    match_date: result.matchDate,
                    result_score: result.resultScore,
                    is_verified: true
                }, { onConflict: 'match_id' });

            if (!resultError) savedResults++;

            // 2. Find unscored predictions for this match
            const { data: predictions } = await supabase
                .from('predictions')
                .select('*')
                .eq('match_id', result.matchId)
                .eq('is_scored', false);

            if (predictions && predictions.length > 0) {
                for (const pred of predictions) {
                    const points = calculatePoints(pred.predicted_score, result.resultScore);
                    const isExact = pred.predicted_score === result.resultScore;
                    const isPartial = points === SCORE_WINNER_CORRECT;

                    // Update prediction with points
                    await supabase
                        .from('predictions')
                        .update({
                            points_earned: points,
                            is_scored: true
                        })
                        .eq('id', pred.id);

                    scoredPredictions++;

                    // Accumulate user points
                    const userId = pred.user_id;
                    const existing = userPointsMap.get(userId) || { points: 0, correct: 0, partial: 0 };
                    userPointsMap.set(userId, {
                        points: existing.points + points,
                        correct: existing.correct + (isExact ? 1 : 0),
                        partial: existing.partial + (isPartial ? 1 : 0)
                    });
                }
            }
        }

        // 3. Update leaderboard for all affected users
        for (const [userId, stats] of userPointsMap) {
            const { data: current } = await supabase
                .from('leaderboard')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (current) {
                const newStreak = stats.correct > 0
                    ? current.current_streak + stats.correct
                    : 0;

                // Calculate streak bonus
                let streakBonus = 0;
                if (newStreak >= 10) streakBonus = BONUS_STREAK_10;
                else if (newStreak >= 5) streakBonus = BONUS_STREAK_5;
                else if (newStreak >= 3) streakBonus = BONUS_STREAK_3;

                await supabase
                    .from('leaderboard')
                    .update({
                        total_points: current.total_points + stats.points + streakBonus,
                        weekly_points: current.weekly_points + stats.points + streakBonus,
                        monthly_points: current.monthly_points + stats.points + streakBonus,
                        correct_predictions: current.correct_predictions + stats.correct,
                        partial_predictions: current.partial_predictions + stats.partial,
                        total_predictions: current.total_predictions + stats.correct + stats.partial,
                        current_streak: newStreak,
                        best_streak: Math.max(current.best_streak, newStreak)
                    })
                    .eq('user_id', userId);
            }
        }

        return NextResponse.json({
            success: true,
            savedResults,
            scoredPredictions,
            usersUpdated: userPointsMap.size
        });
    } catch (error) {
        console.error('Results sync error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

```

## File: app\api\scrape\route.ts
```
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

// Teams relegated from 2. Lig (to be excluded)
const RELEGATED_TEAMS = [
    'EDİRNE SPOR',
    'KUŞADASI YAKAMOZ SPOR',
    'DÜZİÇİ GENÇLİK',
    'SMART HOLDİNG A.Ş. ÇAYELİ',
    'KAHRAMANMARAŞ ELBİSTAN FEDA',
    'VAN B. ŞEHİR BLD.',
    // Alternate spellings
    'EDIRNE SPOR',
    'KUSADASI YAKAMOZ SPOR',
    'DUZICI GENCLIK',
    'VAN B.SEHIR BLD.',
    'VAN BÜYÜKŞEHIR BLD.',
];

export async function GET() {
    try {
        const dataPath = path.join(process.cwd(), 'data', '2lig-data.json');

        if (!fs.existsSync(dataPath)) {
            throw new Error("Cached data not found. Please run 'node scripts/scrape-tvf-live.js'");
        }

        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(fileContent);

        // Filter out relegated teams
        const isRelegated = (teamName: string) => {
            const normalized = teamName.toUpperCase().trim();
            return RELEGATED_TEAMS.some(rt =>
                normalized.includes(rt) || rt.includes(normalized)
            );
        };

        // Filter teams
        const filteredTeams = data.teams.filter((t: any) => !isRelegated(t.name));

        // Filter fixtures (remove matches where either team is relegated)
        const filteredFixture = data.fixture.filter((m: any) =>
            !isRelegated(m.homeTeam) && !isRelegated(m.awayTeam)
        );

        return NextResponse.json({
            ...data,
            teams: filteredTeams,
            fixture: filteredFixture
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

```

## File: app\api\user\profile\route.ts
```
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../utils/supabase-server';

// GET - Fetch user profile
export async function GET() {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get profile
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

        // Get leaderboard entry
        const { data: leaderboardEntry } = await supabase
            .from('leaderboard')
            .select('*')
            .eq('user_id', user.id)
            .single();

        // Get user's rank
        let rank = null;
        if (leaderboardEntry) {
            const { data: higherRanked } = await supabase
                .from('leaderboard')
                .select('user_id', { count: 'exact' })
                .gt('total_points', leaderboardEntry.total_points);

            rank = (higherRanked?.length || 0) + 1;
        }

        // Get recent predictions
        const { data: recentPredictions } = await supabase
            .from('predictions')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(10);

        return NextResponse.json({
            profile: profile || {
                id: user.id,
                display_name: user.user_metadata?.name || user.email?.split('@')[0],
                level: 1,
                xp: 0
            },
            stats: leaderboardEntry || {
                total_points: 0,
                correct_predictions: 0,
                total_predictions: 0,
                current_streak: 0,
                best_streak: 0
            },
            rank,
            recentPredictions: recentPredictions || []
        });
    } catch (error) {
        console.error('Profile GET error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
    try {
        const supabase = await createServerSupabaseClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const allowedFields = ['display_name', 'avatar_url', 'favorite_team'];

        const updates: Record<string, any> = {};
        for (const field of allowedFields) {
            if (body[field] !== undefined) {
                updates[field] = body[field];
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('user_profiles')
            .upsert({
                id: user.id,
                ...updates,
                updated_at: new Date().toISOString()
            })
            .select()
            .single();

        if (error) {
            console.error('Error updating profile:', error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Also update display_name in leaderboard
        if (updates.display_name) {
            await supabase
                .from('leaderboard')
                .update({ display_name: updates.display_name })
                .eq('user_id', user.id);
        }

        return NextResponse.json({ success: true, profile: data });
    } catch (error) {
        console.error('Profile PUT error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

```

## File: app\api\vsl\route.ts
```
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Revalidate every 5 minutes
export const revalidate = 300;

export async function GET() {
    try {
        // Read the VSL data from local JSON file
        const dataPath = path.join(process.cwd(), 'data', 'vsl-data.json');

        if (!fs.existsSync(dataPath)) {
            return NextResponse.json(
                { error: 'Data file not found. Please run conversion script.' },
                { status: 404 }
            );
        }

        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(jsonData);

        // Return with cache headers
        return NextResponse.json(data, {
            headers: {
                'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
            }
        });
    } catch (error) {
        console.error('Error reading VSL data:', error);
        return NextResponse.json(
            { error: 'Failed to load VSL data' },
            { status: 500 }
        );
    }
}

```

## File: app\auth\auth-code-error\page.tsx
```
"use client";

import Link from "next/link";

export default function AuthCodeErrorPage() {
    return (
        <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#0a0a1a] to-black -z-20"></div>
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 -z-10"></div>

            {/* Ambient Light */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-[128px] -z-10"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] -z-10"></div>

            <div className="w-full max-w-md mx-auto text-center space-y-6">
                {/* Error Icon */}
                <div className="text-6xl animate-bounce">😔</div>

                {/* Error Message */}
                <div className="bg-slate-900/60 backdrop-blur-xl border border-rose-500/30 rounded-3xl p-8 space-y-4">
                    <h1 className="text-2xl font-bold text-white">Giriş Başarısız</h1>
                    <p className="text-slate-400">
                        Google ile giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.
                    </p>

                    <div className="pt-4 space-y-3">
                        <Link
                            href="/login"
                            className="block w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all"
                        >
                            Tekrar Dene
                        </Link>

                        <Link
                            href="/"
                            className="block w-full py-3 bg-slate-800 border border-slate-700 text-white font-medium rounded-xl hover:bg-slate-700 transition-all"
                        >
                            Ana Sayfaya Dön
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <p className="text-xs text-slate-500">
                    Sorun devam ederse e-posta ile giriş yapmayı deneyebilirsiniz.
                </p>
            </div>
        </main>
    );
}

```

## File: app\auth\callback\route.ts
```
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
    const { searchParams, origin } = new URL(request.url)
    const code = searchParams.get('code')
    // if "next" is in param, use it as the redirect URL
    const next = searchParams.get('next') ?? '/ligler'

    if (code) {
        const cookieStore = await cookies()
        const supabase = createServerClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            {
                cookies: {
                    getAll() {
                        return cookieStore.getAll()
                    },
                    setAll(cookiesToSet) {
                        try {
                            cookiesToSet.forEach(({ name, value, options }) =>
                                cookieStore.set(name, value, options)
                            )
                        } catch {
                            // The `setAll` method was called from a Server Component.
                            // This can be ignored if you have middleware refreshing
                            // user sessions.
                        }
                    },
                },
            }
        )
        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (!error) {
            return NextResponse.redirect(`${origin}${next}`)
        }
    }

    // return the user to an error page with instructions
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}

```

## File: app\ayarlar\page.tsx
```
"use client";

import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useGameState } from "../utils/gameState";
import { useToast } from "../components/Toast";

const TutorialModal = dynamic(() => import("../components/TutorialModal"), {
    loading: () => null,
    ssr: false,
});

// Theme handling inline since we need to update document
function useLocalTheme() {
    const [theme, setThemeState] = useState<'dark' | 'light'>('dark');

    useEffect(() => {
        const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
        if (saved) {
            setThemeState(saved);
        }
    }, []);

    const setTheme = (newTheme: 'dark' | 'light') => {
        setThemeState(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.setAttribute('data-theme', newTheme);
    };

    return { theme, setTheme };
}

export default function AyarlarPage() {
    const { user } = useAuth();
    const { gameState, toggleSound } = useGameState();
    const { showToast } = useToast();
    const { theme, setTheme } = useLocalTheme();

    const [notifications, setNotifications] = useState(true);
    const [showTutorial, setShowTutorial] = useState(false);

    const handleResetData = () => {
        if (confirm("Tüm oyun verileriniz (XP, seviye, başarımlar, tahminler) silinecek. Bu işlem geri alınamaz. Emin misiniz?")) {
            // Clear all game-related localStorage
            localStorage.removeItem('volleySimGameState');
            localStorage.removeItem('1ligGroupScenarios');
            localStorage.removeItem('groupScenarios');
            localStorage.removeItem('playoffScenarios');
            showToast("Tüm veriler sıfırlandı. Sayfa yenileniyor...", "success");
            // Reload to reset React state
            setTimeout(() => window.location.reload(), 1000);
        }
    };

    const handleExportData = () => {
        try {
            const exportData = {
                gameState: gameState,
                lig1Scenarios: JSON.parse(localStorage.getItem('1ligGroupScenarios') || '{}'),
                lig2Scenarios: JSON.parse(localStorage.getItem('groupScenarios') || '{}'),
                exportDate: new Date().toISOString()
            };
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
            const a = document.createElement('a');
            a.href = dataStr;
            a.download = `volleysimulator-backup-${new Date().toLocaleDateString('tr-TR')}.json`;
            a.click();
            showToast("Veriler indirildi", "success");
        } catch (e) {
            showToast("Hata oluştu", "error");
        }
    };

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Header */}
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 px-4 py-6 border-b border-slate-800">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-2xl font-bold text-white">Ayarlar</h1>
                    <p className="text-slate-400 text-sm mt-1">Uygulama tercihlerini yönetin</p>
                </div>
            </div>

            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">

                {/* Sound Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Ses Ayarları</h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-white">Ses Efektleri</div>
                            <div className="text-xs text-slate-500">Tahmin ve başarım sesleri</div>
                        </div>
                        <button
                            onClick={toggleSound}
                            title="Ses Efektlerini Aç/Kapat"
                            className={`w-14 h-7 rounded-full transition-all relative ${gameState.soundEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                                }`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${gameState.soundEnabled ? 'translate-x-7' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Display Settings */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Görünüm</h2>

                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <div className="font-medium text-white">Tema</div>
                            <div className="text-xs text-slate-500">Uygulama renk teması</div>
                        </div>
                        <select
                            value={theme}
                            onChange={(e) => setTheme(e.target.value as 'dark' | 'light')}
                            title="Tema Seçin"
                            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white"
                        >
                            <option value="dark">Koyu</option>
                            <option value="light">Açık</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-white">Bildirimler</div>
                            <div className="text-xs text-slate-500">Uygulama içi bildirimler</div>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            title="Bildirimleri Aç/Kapat"
                            className={`w-14 h-7 rounded-full transition-all relative ${notifications ? 'bg-emerald-600' : 'bg-slate-700'
                                }`}
                        >
                            <div className={`w-6 h-6 bg-white rounded-full shadow-md absolute top-0.5 transition-transform ${notifications ? 'translate-x-7' : 'translate-x-0.5'
                                }`} />
                        </button>
                    </div>
                </div>

                {/* Data Management */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Veri Yönetimi</h2>

                    <div className="space-y-3">
                        <button
                            onClick={handleExportData}
                            className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <div className="text-left">
                                <div className="font-medium text-white">Verileri İndir</div>
                                <div className="text-xs text-slate-500">Tüm tahminler ve ilerleme</div>
                            </div>
                            <span className="text-emerald-400">↓</span>
                        </button>

                        <button
                            onClick={handleResetData}
                            className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-rose-900/50 rounded-lg transition-colors group"
                        >
                            <div className="text-left">
                                <div className="font-medium text-white group-hover:text-rose-400">Verileri Sıfırla</div>
                                <div className="text-xs text-slate-500 group-hover:text-rose-400/70">Tüm ilerlemeyi sil</div>
                            </div>
                            <span className="text-rose-400">✕</span>
                        </button>
                    </div>
                </div>

                {/* Help Section */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Yardım</h2>

                    <div className="space-y-3">
                        <button
                            onClick={() => setShowTutorial(true)}
                            className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-emerald-900/30 to-emerald-800/10 hover:from-emerald-800/40 hover:to-emerald-700/20 border border-emerald-600/30 hover:border-emerald-500/50 rounded-lg transition-all group"
                        >
                            <div className="text-left">
                                <div className="font-medium text-white group-hover:text-emerald-300">Uygulama Rehberi</div>
                                <div className="text-xs text-slate-500">Nasıl kullanılacağını öğrenin</div>
                            </div>
                            <span className="text-emerald-400">İ</span>
                        </button>

                        <button
                            onClick={() => {
                                localStorage.removeItem('tutorialCompleted');
                                setShowTutorial(true);
                            }}
                            className="w-full flex items-center justify-between p-3 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                        >
                            <div className="text-left">
                                <div className="font-medium text-white">Rehberi Sıfırla</div>
                                <div className="text-xs text-slate-500">Rehberi baştan göster</div>
                            </div>
                            <span className="text-cyan-400">↻</span>
                        </button>
                    </div>
                </div>

                {/* Account Info */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Hesap</h2>

                    {user ? (
                        <div className="space-y-3">
                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                <span className="text-slate-400 text-sm">E-posta</span>
                                <span className="text-white text-sm">{user.email}</span>
                            </div>
                            <div className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                                <span className="text-slate-400 text-sm">Hesap Türü</span>
                                <span className="text-emerald-400 text-sm">Kayıtlı Kullanıcı</span>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center p-4">
                            <p className="text-slate-400 text-sm mb-3">Giriş yaparak verilerinizi kaydedin</p>
                            <a
                                href="/login"
                                className="inline-block px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition-colors"
                            >
                                Giriş Yap
                            </a>
                        </div>
                    )}
                </div>

                {/* App Info */}
                <div className="text-center py-4">
                    <div className="text-slate-500 text-xs">VolleySimulator v1.0.0</div>
                    <div className="text-slate-600 text-xs mt-1">© 2025 Tüm hakları saklıdır</div>
                </div>
            </div>

            {/* Tutorial Modal */}
            <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} />
        </div>
    );
}

```

## File: app\cev-challenge\page.tsx
```
import { redirect } from "next/navigation";

export default function CEVChallengePage() {
    redirect("/cev-challenge/gunceldurum");
}

```

## File: app\cev-challenge\anasayfa\page.tsx
```
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

interface CEVChallengeData {
    league: string;
    season: string;
    currentStage: string;
    teams: Team[];
    fixture: Match[];
}

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "Kuzeyboru", "THY ISTANBUL", "Bursa Nilufer Bld."]; // Expanded list just in case
const ROUND_LABELS: Record<string, string> = {
    "Qualification Rounds": "Eleme Turları",
    "Main Round": "Ana Tablo",
    "16th Finals": "Son 32",
    "8th Finals": "Son 16",
    "Play Off": "Play-Off",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final"
};

export default function CEVChallengeAnasayfa() {
    const [data, setData] = useState<CEVChallengeData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch("/api/cev-challenge")
            .then(res => res.json())
            .then(data => setData(data))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full"></div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen flex items-center justify-center text-red-500 bg-slate-950">
                Veri yüklenemedi
            </div>
        );
    }

    const playedMatches = data.fixture.filter(m => m.isPlayed);
    const upcomingMatches = data.fixture.filter(m => !m.isPlayed).slice(0, 8); // Show next 8 matches

    // Turkish teams highlight logic
    const getTurkishTeamStats = (teamName: string) => {
        const matches = data.fixture.filter(m => m.homeTeam.includes(teamName) || m.awayTeam.includes(teamName));
        const played = matches.filter(m => m.isPlayed);
        let wins = 0;
        played.forEach(m => {
            if (m.homeTeam.includes(teamName) && (m.homeScore || 0) > (m.awayScore || 0)) wins++;
            if (m.awayTeam.includes(teamName) && (m.awayScore || 0) > (m.homeScore || 0)) wins++;
        });
        return { played: played.length, wins };
    };

    // Filter actual Turkish teams present in the data
    const activeTurkishTeams = TURKISH_TEAMS.filter(t =>
        data.teams.some(dt => dt.name.includes(t))
    );

    return (
        <div className="min-h-screen bg-slate-950">
            {/* Hero Header */}
            <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-800 px-4 py-4 relative overflow-hidden">
                <div className="relative max-w-4xl mx-auto">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-xl font-bold text-white mb-1">CEV Challenge Cup</h1>
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
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                    <div className="text-xs text-emerald-400/70 uppercase tracking-wider mb-1">Mevcut Aşama</div>
                    <div className="text-2xl font-bold text-emerald-400">
                        {ROUND_LABELS[data.currentStage] || data.currentStage}
                    </div>
                </div>

                {/* Turkish Teams Overview - Only show if any found */}
                {activeTurkishTeams.length > 0 && (
                    <div className="bg-slate-900 border border-red-500/30 rounded-2xl overflow-hidden">
                        <div className="bg-red-900/20 px-4 py-3 border-b border-red-500/20">
                            <h3 className="font-bold text-white flex items-center gap-2">
                                <span>🇹🇷</span> Türk Takımları
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-800/50">
                            {activeTurkishTeams.map(teamName => {
                                const fullTeamName = data.teams.find(t => t.name.includes(teamName))?.name || teamName;
                                const stats = getTurkishTeamStats(teamName);
                                const nextMatch = data.fixture.find(m =>
                                    !m.isPlayed && (m.homeTeam.includes(teamName) || m.awayTeam.includes(teamName))
                                );
                                const opponent = nextMatch ?
                                    (nextMatch.homeTeam.includes(teamName) ? nextMatch.awayTeam : nextMatch.homeTeam) : null;

                                return (
                                    <div key={teamName} className="px-4 py-3 flex items-center gap-3">
                                        <TeamAvatar name={fullTeamName} size="sm" />
                                        <div className="flex-1">
                                            <div className="font-medium text-sm text-white">{fullTeamName}</div>
                                            <div className="text-xs text-slate-500">
                                                {stats.wins}G / {stats.played}M
                                                {opponent && (
                                                    <span className="text-emerald-400 ml-2">
                                                        → vs {opponent}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs text-emerald-400 font-bold">
                                                {ROUND_LABELS[data.currentStage]}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Recent Results */}
                <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                    <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-800 flex justify-between items-center">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <span className="text-emerald-400">✓</span> Son Sonuçlar
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50 max-h-64 overflow-y-auto">
                        {playedMatches.slice(-6).reverse().map((match, i) => {
                            const hasTurkish = activeTurkishTeams.some(t => match.homeTeam.includes(t) || match.awayTeam.includes(t));
                            return (
                                <div key={match.id} className={`px-4 py-3 ${hasTurkish ? "bg-red-900/10" : ""}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 text-right text-sm text-slate-300 truncate flex items-center justify-end gap-1">
                                            {match.homeTeam}
                                            {activeTurkishTeams.some(t => match.homeTeam.includes(t)) && <span>🇹🇷</span>}
                                        </div>
                                        <div className="px-2 py-0.5 rounded text-xs font-mono bg-emerald-500/20 text-emerald-400">
                                            {match.homeScore} - {match.awayScore}
                                        </div>
                                        <div className="flex-1 text-sm text-slate-300 truncate flex items-center gap-1">
                                            {activeTurkishTeams.some(t => match.awayTeam.includes(t)) && <span>🇹🇷</span>}
                                            {match.awayTeam}
                                        </div>
                                    </div>
                                    <div className="text-center text-[10px] text-slate-500">
                                        {ROUND_LABELS[match.round] || match.round}
                                        {match.setScores && <span className="ml-2">({match.setScores})</span>}
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
                            <span className="text-emerald-400">📅</span> Gelecek Maçlar
                        </h3>
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {upcomingMatches.length === 0 ? (
                            <div className="p-4 text-center text-slate-500 text-xs">Planlanmış maç bulunamadı.</div>
                        ) : upcomingMatches.map((match, i) => {
                            const hasTurkish = activeTurkishTeams.some(t => match.homeTeam.includes(t) || match.awayTeam.includes(t));
                            return (
                                <div key={match.id} className={`px-4 py-3 ${hasTurkish ? "bg-red-900/10" : ""}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <div className="flex-1 text-right text-sm text-slate-300 truncate flex items-center justify-end gap-1">
                                            {match.homeTeam}
                                            {activeTurkishTeams.some(t => match.homeTeam.includes(t)) && <span>🇹🇷</span>}
                                        </div>
                                        <div className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-500">
                                            vs
                                        </div>
                                        <div className="flex-1 text-sm text-slate-300 truncate flex items-center gap-1">
                                            {activeTurkishTeams.some(t => match.awayTeam.includes(t)) && <span>🇹🇷</span>}
                                            {match.awayTeam}
                                        </div>
                                    </div>
                                    <div className="text-center text-[10px] text-slate-500">
                                        {ROUND_LABELS[match.round] || match.round} • {match.date || 'TBD'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-3">
                    <Link
                        href="/cev-challenge/gunceldurum"
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:bg-slate-800 transition-colors group"
                    >
                        <div className="text-2xl mb-2">📊</div>
                        <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">Güncel Durum</div>
                        <div className="text-xs text-slate-500">Tüm eşleşmeleri gör</div>
                    </Link>
                    <Link
                        href="/cev-challenge/stats"
                        className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:bg-slate-800 transition-colors group"
                    >
                        <div className="text-2xl mb-2">📈</div>
                        <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">İstatistikler</div>
                        <div className="text-xs text-slate-500">Takım performansları</div>
                    </Link>
                </div>
            </div>
        </div>
    );
}

```

## File: app\cev-challenge\gunceldurum\CEVChallengeGuncelDurumClient.tsx
```
"use client";

import { useState, useMemo } from "react";

import TeamAvatar from "@/app/components/TeamAvatar";
import LeagueActionBar from "../../components/LeagueTemplate/LeagueActionBar";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

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

interface CEVChallengeData {
    league: string;
    season: string;
    currentStage: string;
    teams: Team[];
    fixture: Match[];
}

interface CEVChallengeGuncelDurumClientProps {
    initialData: CEVChallengeData;
}

const ROUNDS = ["Qualification Rounds", "Main Round", "4th Finals", "Semi Finals", "Finals"];
const ROUND_LABELS: Record<string, string> = {
    "Qualification Rounds": "Eleme Turları",
    "Main Round": "Ana Tablo",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final"
};

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "Kuzeyboru"]; // Updating based on assumption, can be refined

export default function CEVChallengeGuncelDurumClient({ initialData }: CEVChallengeGuncelDurumClientProps) {
    // Default to first available round if currentStage mapping fails
    const [activeRound, setActiveRound] = useState<string>(
        ROUND_LABELS[initialData.currentStage] ? initialData.currentStage : (initialData.fixture.length > 0 ? initialData.fixture[0].round : "Main Round")
    );

    const availableRounds = useMemo(() => {
        const roundsInData = new Set(initialData.fixture.map(m => m.round));
        return ROUNDS.filter(r => roundsInData.has(r)).concat(Array.from(roundsInData).filter(r => !ROUNDS.includes(r)));
    }, [initialData.fixture]);

    const roundMatches = useMemo(() => {
        return initialData.fixture.filter(m => m.round === activeRound);
    }, [initialData.fixture, activeRound]);

    // Group matches by matchup
    const matchups = useMemo(() => {
        const grouped: Record<string, Match[]> = {};
        roundMatches.forEach(match => {
            const key = [match.homeTeam, match.awayTeam].sort().join(" vs ");
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(match);
        });
        return Object.values(grouped).map(matches => matches.sort((a, b) => (a.leg || 1) - (b.leg || 1)));
    }, [roundMatches]);

    const playedCount = roundMatches.filter(m => m.isPlayed).length;
    const totalCount = roundMatches.length;
    const completionRate = totalCount > 0 ? Math.round((playedCount / totalCount) * 100) : 0;

    const isTurkishTeam = (team: string) => TURKISH_TEAMS.some(t => team.includes(t)) || team.includes("ISTANBUL") || team.includes("ANKARA");

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-0 sm:p-2 font-sans overflow-hidden">
            <div className="max-w-7xl mx-auto space-y-1 h-full flex flex-col">
                <div className="space-y-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-4 duration-300">
                    {/* Action Bar using LeagueTemplate */}
                    <LeagueActionBar
                        config={LEAGUE_CONFIGS['cev-challenge']}
                        title={`${LEAGUE_CONFIGS['cev-challenge'].name} - ${ROUND_LABELS[activeRound]}`}
                        subtitle="CEV Challenge Cup • Güncel Durum"
                        selectorLabel="Tur"
                        selectorValue={activeRound}
                        selectorOptions={availableRounds.map(r => ({ label: ROUND_LABELS[r], value: r }))}
                        onSelectorChange={setActiveRound}
                        progress={completionRate}
                        progressLabel={`%${completionRate}`}
                    >
                        {/* Live Badge */}
                        <div className="px-3 h-8 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase hidden sm:inline">Otomatik Güncelleme</span>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase sm:hidden">CANLI</span>
                        </div>
                        <div className="bg-slate-950/50 px-3 py-1.5 rounded-lg border border-slate-800 text-center flex flex-col justify-center">
                            <div className="text-[9px] font-bold text-slate-500 uppercase leading-none mb-0.5">Format</div>
                            <div className="text-xs font-bold text-white leading-none">Eleme (İç-Dış)</div>
                        </div>
                        <div className="px-3 py-1.5 bg-emerald-950/50 rounded-lg border border-emerald-800/50 flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-[10px] font-bold text-emerald-400 uppercase">{matchups.length} Eşleşme</span>
                        </div>
                    </LeagueActionBar>

                    {/* Matchups Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {matchups.map((matchup, idx) => {
                            const team1 = matchup[0]?.homeTeam;
                            const team2 = matchup[0]?.awayTeam;

                            // Calculate aggregate score
                            let team1Total = 0;
                            let team2Total = 0;
                            let allPlayed = true;

                            matchup.forEach(m => {
                                if (m.isPlayed && m.homeScore !== null && m.awayScore !== null) {
                                    if (m.homeTeam === team1) {
                                        team1Total += m.homeScore;
                                        team2Total += m.awayScore;
                                    } else {
                                        team1Total += m.awayScore;
                                        team2Total += m.homeScore;
                                    }
                                } else {
                                    allPlayed = false;
                                }
                            });

                            const hasTurkish = isTurkishTeam(team1) || isTurkishTeam(team2);

                            return (
                                <div
                                    key={idx}
                                    className={`bg-slate-950/60 rounded-xl border p-3 space-y-2 ${hasTurkish ? 'border-emerald-700/50 ring-1 ring-emerald-500/20' : 'border-slate-800/50'
                                        }`}
                                >
                                    {/* Matchup Header */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                            <TeamAvatar name={team1} size="sm" />
                                            <div className="overflow-hidden">
                                                <span className="text-sm font-bold text-slate-200 truncate block">
                                                    {team1}
                                                    {isTurkishTeam(team1) && <span className="ml-1">🇹🇷</span>}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="px-3 flex flex-col items-center shrink-0">
                                            {allPlayed ? (
                                                <div className="flex items-center gap-1">
                                                    <span className={`text-lg font-black ${team1Total > team2Total ? 'text-green-400' : 'text-slate-400'}`}>
                                                        {team1Total}
                                                    </span>
                                                    <span className="text-slate-600">-</span>
                                                    <span className={`text-lg font-black ${team2Total > team1Total ? 'text-green-400' : 'text-slate-400'}`}>
                                                        {team2Total}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-xs font-bold text-slate-600 bg-slate-900 px-2 py-1 rounded">VS</span>
                                            )}
                                            <span className="text-[9px] text-slate-500 uppercase">Toplam</span>
                                        </div>
                                        <div className="flex items-center gap-2 flex-1 justify-end overflow-hidden">
                                            <div className="overflow-hidden text-right">
                                                <span className="text-sm font-bold text-slate-200 truncate block">
                                                    {isTurkishTeam(team2) && <span className="mr-1">🇹🇷</span>}
                                                    {team2}
                                                </span>
                                            </div>
                                            <TeamAvatar name={team2} size="sm" />
                                        </div>
                                    </div>

                                    {/* Individual Legs */}
                                    <div className="space-y-1.5 pt-1 border-t border-slate-800/50">
                                        {matchup.map((match, mIdx) => (
                                            <div key={match.id} className="flex items-center justify-between text-xs bg-slate-900/50 rounded-lg px-2 py-1.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">
                                                        {match.leg === 1 ? "1. Maç" : "2. Maç"}
                                                    </span>
                                                    <span className="text-[10px] text-slate-500">
                                                        {match.date?.split('-').reverse().join('.')}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <span className="text-slate-400 text-[10px] truncate max-w-[60px]">{match.homeTeam.split(' ')[0]}</span>
                                                    {match.isPlayed ? (
                                                        <span className="font-bold text-white px-2">
                                                            {match.homeScore} - {match.awayScore}
                                                        </span>
                                                    ) : (
                                                        <span className="text-slate-600 px-2">-</span>
                                                    )}
                                                    <span className="text-slate-400 text-[10px] truncate max-w-[60px]">{match.awayTeam.split(' ')[0]}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {matchups.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                            <span className="text-4xl mb-2">🏐</span>
                            <p className="text-sm">Bu tur için henüz maç planlanmadı.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}

```

## File: app\cev-challenge\gunceldurum\page.tsx
```
import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVChallengeGuncelDurumClient from './CEVChallengeGuncelDurumClient';

export const metadata: Metadata = {
    title: "CEV Challenge Cup Güncel Durum",
    description: "CEV Challenge Cup puan durumu, tur sıralamaları ve maç sonuçları. Avrupa kupası güncel tablo.",
    openGraph: {
        title: "CEV Challenge Cup Güncel Durum | VolleySimulator",
        description: "Challenge Cup tur sıralamaları ve maç sonuçları.",
    },
};

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

interface CEVChallengeData {
    league: string;
    season: string;
    currentStage: string;
    teams: Team[];
    fixture: Match[];
}

export default async function CEVChallengeGuncelDurumPage() {
    // We fetch from the API endpoint locally or read the JSON directly and transform it.
    // Since we created a route that transforms it, we can reuse that transformation logic here 
    // OR just call the API URL if full URL is known.
    // Better: Read JSON and Transform here to avoid self-fetch issues during build/runtime.

    // Copying transformation logic from API route for Server Component efficiency
    const filePath = path.join(process.cwd(), 'data', 'cev-challenge-cup-data.json');
    let data: CEVChallengeData | null = null;

    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const sourceData = JSON.parse(fileContent);

            const fixture: Match[] = [];
            const teamsMap = new Map();
            let matchCounter = 1;

            const parseScore = (scoreStr: string | null) => {
                if (!scoreStr || !scoreStr.includes('-')) return { home: null, away: null };
                const parts = scoreStr.split('-').map(p => parseInt(p.trim()));
                return { home: isNaN(parts[0]) ? null : parts[0], away: isNaN(parts[1]) ? null : parts[1] };
            };

            if (sourceData.phases) {
                sourceData.phases.forEach((phase: any) => {
                    const roundName = phase.name;
                    phase.matches.forEach((m: any) => {
                        const { home, away } = parseScore(m.score);
                        if (!teamsMap.has(m.homeTeam)) teamsMap.set(m.homeTeam, { name: m.homeTeam, country: '' });
                        if (!teamsMap.has(m.awayTeam)) teamsMap.set(m.awayTeam, { name: m.awayTeam, country: '' });

                        fixture.push({
                            id: matchCounter++,
                            round: roundName,
                            leg: 1,
                            date: m.date || 'TBD',
                            homeTeam: m.homeTeam,
                            awayTeam: m.awayTeam,
                            homeScore: home,
                            awayScore: away,
                            setScores: m.sets,
                            isPlayed: m.isPlayed
                        });
                    });
                });
            }

            data = {
                league: "CEV Challenge Cup",
                season: "2025-2026",
                currentStage: "Main Round",
                teams: Array.from(teamsMap.values()),
                fixture: fixture
            };
        }
    } catch (error) {
        console.error('Error reading CEV Challenge data:', error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-emerald-500">Veri Yüklenemedi</h1>
                    <p className="text-slate-400 mt-2">CEV Challenge Cup verileri yüklenirken bir hata oluştu.</p>
                </div>
            </main>
        );
    }

    return (
        <CEVChallengeGuncelDurumClient
            initialData={data}
        />
    );
}

```

## File: app\cev-challenge\playoffs\CEVChallengePlayoffsClient.tsx
```
"use client";

import { useEffect, useState, useMemo } from "react";
import TeamAvatar from "../../components/TeamAvatar";
import Link from "next/link";
import { SCORES } from "../../utils/calculatorUtils";

interface Match {
    id: number;
    round: string;
    leg?: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    isPlayed: boolean;
    setScores?: string;
}

interface CEVChallengeData {
    league: string;
    season: string;
    currentStage: string;
    teams: any[];
    fixture: Match[];
}

const ROUND_LABELS: Record<string, string> = {
    "Qualification Rounds": "Eleme Turları",
    "Main Round": "Son 32 Turu",
    "16th Finals": "Son 32 Turu",
    "8th Finals": "Son 16 Turu",
    "Play Off": "Play-Off Turu",
    "4th Finals": "Çeyrek Final",
    "Semi Finals": "Yarı Final",
    "Finals": "Final",
    "Final Phase": "Final Aşaması"
};

const TURKISH_TEAMS = ["Galatasaray Daikin ISTANBUL", "Kuzeyboru AKSARAY", "THY ISTANBUL", "Galatasaray", "Kuzeyboru", "THY"];

export default function CEVChallengePlayoffsClient({ initialData }: { initialData: CEVChallengeData }) {
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [isLoaded, setIsLoaded] = useState(false);

    // Load saved predictions
    useEffect(() => {
        const saved = localStorage.getItem('cevChallengePredictions');
        if (saved) {
            try {
                setOverrides(JSON.parse(saved));
            } catch (e) { console.error(e); }
        }
        setIsLoaded(true);
    }, []);

    // Save predictions
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem('cevChallengePredictions', JSON.stringify(overrides));
        }
    }, [overrides, isLoaded]);

    const handleScoreChange = (matchId: number, score: string) => {
        setOverrides(prev => {
            const next = { ...prev };
            if (score) next[`match-${matchId}`] = score;
            else delete next[`match-${matchId}`];
            return next;
        });
    };

    const handlePredictAll = () => {
        const newOverrides = { ...overrides };
        const possibleScores = ['3-0', '3-1', '3-2', '2-3', '1-3', '0-3'];
        let changed = false;

        initialData.fixture.forEach(m => {
            if (!m.isPlayed && !newOverrides[`match-${m.id}`]) {
                const randomScore = possibleScores[Math.floor(Math.random() * possibleScores.length)];
                newOverrides[`match-${m.id}`] = randomScore;
                changed = true;
            }
        });

        if (changed) setOverrides(newOverrides);
    };

    // Group matches by matchup (leg 1 + leg 2)
    const getMatchups = (round: string) => {
        const roundMatches = initialData.fixture.filter(m => m.round === round);
        const grouped: Record<string, Match[]> = {};

        roundMatches.forEach(match => {
            const key = [match.homeTeam, match.awayTeam].sort().join(" vs ");
            if (!grouped[key]) grouped[key] = [];
            grouped[key].push(match);
        });

        return Object.values(grouped).map(matches => {
            const sorted = matches.sort((a, b) => (a.leg || 1) - (b.leg || 1));
            const leg1 = sorted[0];
            const leg2 = sorted[1];

            // Determine team1 and team2 based on leg 1 (Team 1 = Home of Leg 1 usually)
            const team1 = leg1.homeTeam;
            const team2 = leg1.awayTeam;

            // Calculate aggregate
            let team1Points = 0;
            let team2Points = 0;
            let allPlayedOrPredicted = true;

            const processMatch = (m: Match) => {
                const isPlayed = m.isPlayed && m.homeScore !== null && m.awayScore !== null;
                const pred = overrides[`match-${m.id}`];
                let hScore = 0, aScore = 0;

                if (isPlayed) {
                    hScore = m.homeScore!;
                    aScore = m.awayScore!;
                } else if (pred) {
                    [hScore, aScore] = pred.split('-').map(Number);
                } else {
                    allPlayedOrPredicted = false;
                    return;
                }

                // Points Calculation logic (3-0/3-1 = 3pts, 3-2 = 2pts)
                let hPts = 0, aPts = 0;
                if (hScore === 3) {
                    if (aScore <= 1) { hPts = 3; aPts = 0; }
                    else { hPts = 2; aPts = 1; }
                } else {
                    if (hScore <= 1) { hPts = 0; aPts = 3; }
                    else { hPts = 1; aPts = 2; }
                }

                if (m.homeTeam === team1) {
                    team1Points += hPts;
                    team2Points += aPts;
                } else {
                    team1Points += aPts;
                    team2Points += hPts;
                }
            };

            if (leg1) processMatch(leg1);
            if (leg2) processMatch(leg2);

            let winner = null;
            let goldenSetNeeded = false;

            if (allPlayedOrPredicted) {
                if (team1Points > team2Points) winner = team1;
                else if (team2Points > team1Points) winner = team2;
                else goldenSetNeeded = true;
            }

            // Golden Set Override
            const goldenKey = `golden-${leg1.id}`;
            const goldenPred = overrides[goldenKey];

            if (goldenSetNeeded) {
                if (goldenPred === 'team1') winner = team1;
                else if (goldenPred === 'team2') winner = team2;
            }

            return { matches: sorted, team1, team2, team1Points, team2Points, allPlayedOrPredicted, winner, goldenSetNeeded, goldenKey, goldenPred };
        });
    };

    const rounds = ["Qualification Rounds", "Main Round", "4th Finals", "Semi Finals", "Finals", "Final Phase"];
    const availableRounds = rounds.filter(r => initialData.fixture.some(m => m.round === r));

    // Render a single inputs row
    const renderScoreInput = (match: Match) => {
        const isPlayed = match.isPlayed && match.homeScore !== null;
        const pred = overrides[`match-${match.id}`];

        if (isPlayed) {
            return (
                <span className="font-mono font-bold text-slate-300 bg-slate-900 px-2 py-1 rounded border border-slate-700">
                    {match.homeScore}-{match.awayScore}
                </span>
            );
        }

        return (
            <select
                value={pred || ''}
                onChange={(e) => handleScoreChange(match.id, e.target.value)}
                className={`bg-slate-900 border text-xs rounded px-1 py-1 font-mono w-16 text-center appearance-none cursor-pointer hover:bg-slate-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all ${pred ? 'border-blue-500 text-white' : 'border-slate-700 text-slate-500'}`}
            >
                <option value="">v</option>
                {SCORES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
        );
    };

    const renderBracketCard = (round: string) => {
        const matchups = getMatchups(round);
        if (matchups.length === 0) return null;

        return (
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-4 duration-500" key={round}>
                <h3 className="text-lg font-bold text-amber-400 mb-4 flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                    {ROUND_LABELS[round] || round}
                    <span className="text-xs text-slate-500 ml-auto bg-slate-900 px-2 py-1 rounded border border-slate-800">{matchups.length} Eşleşme</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {matchups.map((matchup, idx) => {
                        // Check for Turkish teams using includes for fuzzy matching
                        const hasTurkish = TURKISH_TEAMS.some(t => matchup.team1.includes(t) || matchup.team2.includes(t)) ||
                            TURKISH_TEAMS.some(t => matchup.team1.toUpperCase().includes("GALATASARAY") || matchup.team1.toUpperCase().includes("KUZEYBORU") || matchup.team1.toUpperCase().includes("THY"));

                        const leg1 = matchup.matches[0];
                        const leg2 = matchup.matches[1];

                        return (
                            <div
                                key={idx}
                                className={`relative bg-slate-950/80 rounded-xl border overflow-hidden group ${hasTurkish ? 'border-amber-600/40' : 'border-slate-800'}`}
                            >
                                {/* Status Header / Golden Set Indicator */}
                                {(matchup.winner || matchup.goldenSetNeeded) && (
                                    <div className={`text-[10px] uppercase font-bold text-center py-1 ${matchup.winner ? 'bg-emerald-900/20 text-emerald-400 border-b border-emerald-500/20' : 'bg-amber-900/20 text-amber-400 border-b border-amber-500/20'
                                        }`}>
                                        {matchup.winner ? `Tur Atladı: ${matchup.winner}` : 'ALTIN SET GEREKLİ'}
                                    </div>
                                )}

                                {/* Match Content */}
                                <div className="p-3 space-y-3">
                                    {/* Team 1 Row */}
                                    <div className={`flex items-center justify-between gap-3 p-2 rounded-lg transition-colors ${matchup.winner === matchup.team1 ? 'bg-emerald-900/20 border border-emerald-500/20' : 'bg-slate-900/40 border border-transparent'}`}>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <TeamAvatar name={matchup.team1} size="sm" />
                                            <div className="flex flex-col min-w-0">
                                                <span className={`text-xs font-bold truncate ${matchup.winner === matchup.team1 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                    {matchup.team1}
                                                </span>
                                                {hasTurkish && (matchup.team1.includes("Galatasaray") || matchup.team1.includes("Kuzeyboru") || matchup.team1.includes("THY")) && <span className="text-[9px] text-amber-500 font-bold tracking-wider">TEMSİLCİMİZ</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Middle Section: Scores */}
                                    <div className="flex flex-col gap-2 bg-slate-900/30 rounded p-2 border border-slate-800/50">
                                        {/* Leg 1 */}
                                        <div className="flex items-center justify-center gap-3 text-xs">
                                            <span className="text-slate-500 w-8 text-right">Maç 1</span>
                                            {renderScoreInput(leg1)}
                                            <span className="text-slate-600 text-[10px] w-24 text-center truncate opacity-50">{leg1.date}</span>
                                        </div>

                                        {/* Leg 2 */}
                                        {leg2 && (
                                            <div className="flex items-center justify-center gap-3 text-xs">
                                                <span className="text-slate-500 w-8 text-right">Maç 2</span>
                                                {renderScoreInput(leg2)}
                                                <span className="text-slate-600 text-[10px] w-24 text-center truncate opacity-50">{leg2.date}</span>
                                            </div>
                                        )}

                                        {/* Golden Set Selection */}
                                        {matchup.goldenSetNeeded && (
                                            <div className="flex items-center justify-center gap-2 mt-1 animate-pulse">
                                                <span className="text-amber-500 font-bold text-[10px]">ALTIN SET:</span>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setOverrides(prev => ({ ...prev, [matchup.goldenKey]: 'team1' }))}
                                                        className={`px-2 py-0.5 text-[9px] rounded border ${matchup.goldenPred === 'team1' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-800 text-slate-400 border-slate-600'}`}
                                                    >
                                                        {matchup.team1.substring(0, 3)}
                                                    </button>
                                                    <button
                                                        onClick={() => setOverrides(prev => ({ ...prev, [matchup.goldenKey]: 'team2' }))}
                                                        className={`px-2 py-0.5 text-[9px] rounded border ${matchup.goldenPred === 'team2' ? 'bg-amber-500 text-slate-900 border-amber-500' : 'bg-slate-800 text-slate-400 border-slate-600'}`}
                                                    >
                                                        {matchup.team2.substring(0, 3)}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Team 2 Row */}
                                    <div className={`flex items-center justify-between gap-3 p-2 rounded-lg transition-colors ${matchup.winner === matchup.team2 ? 'bg-emerald-900/20 border border-emerald-500/20' : 'bg-slate-900/40 border border-transparent'}`}>
                                        <div className="flex items-center gap-3 flex-1 min-w-0 flex-row-reverse text-right">
                                            <TeamAvatar name={matchup.team2} size="sm" />
                                            <div className="flex flex-col min-w-0 items-end">
                                                <span className={`text-xs font-bold truncate ${matchup.winner === matchup.team2 ? 'text-emerald-400' : 'text-slate-200'}`}>
                                                    {matchup.team2}
                                                </span>
                                                {hasTurkish && (matchup.team2.includes("Galatasaray") || matchup.team2.includes("Kuzeyboru") || matchup.team2.includes("THY")) && <span className="text-[9px] text-amber-500 font-bold tracking-wider">TEMSİLCİMİZ</span>}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const totalMatches = initialData.fixture.length;
    const completedMatches = initialData.fixture.filter(m => m.isPlayed || overrides[`match-${m.id}`]).length;
    const progress = Math.round((completedMatches / totalMatches) * 100) || 0;

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">{initialData.league || 'CEV Challenge Cup'}</h1>
                        <p className="text-[10px] text-slate-400 hidden sm:block">Eleme Tablosu {initialData.season}</p>
                    </div>

                    <button
                        onClick={handlePredictAll}
                        className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-lg shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 text-xs"
                    >
                        <span>🎲</span>
                        <span>Tümünü Tahmin Et</span>
                    </button>
                </div>

                {/* Info Banner */}
                {progress < 100 && (
                    <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                            <span className="text-xs font-bold text-slate-300">İlerleme Durumu</span>
                            <div className="w-32 sm:w-64 h-2 bg-slate-800 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-lg font-black text-white">{completedMatches}/{totalMatches}</div>
                            <div className="text-[10px] text-slate-500 uppercase font-bold">Maç Tahmin Edildi</div>
                        </div>
                    </div>
                )}

                {/* Bracket by Rounds */}
                <div className="space-y-8">
                    {availableRounds.map(round => renderBracketCard(round))}
                </div>

                {/* Tournament Flow / Legend */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 mt-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-center">
                        <div className="p-2 border border-slate-800 rounded flex flex-col items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-slate-400">Tur Atlayan</span>
                        </div>
                        <div className="p-2 border border-slate-800 rounded flex flex-col items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                            <span className="text-slate-400">Altın Set/Temsilcimiz</span>
                        </div>
                        <div className="p-2 border border-slate-800 rounded flex flex-col items-center gap-1">
                            <span className="border border-blue-500 text-blue-500 px-1 rounded text-[10px]">3-0</span>
                            <span className="text-slate-400">Tahmin Edilen Skor</span>
                        </div>
                        <div className="p-2 border border-slate-800 rounded flex flex-col items-center gap-1">
                            <span className="bg-slate-900 text-slate-300 border border-slate-700 px-1 rounded text-[10px]">3-0</span>
                            <span className="text-slate-400">Resmi Sonuç</span>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\cev-challenge\playoffs\page.tsx
```
import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVChallengePlayoffsClient from './CEVChallengePlayoffsClient';

export const metadata: Metadata = {
    title: "CEV Challenge Cup Playoff Simülasyonu",
    description: "CEV Challenge Cup playoff simülasyonu. Eleme turlarını simüle edin.",
    openGraph: {
        title: "CEV Challenge Cup Playoff | VolleySimulator",
        description: "Challenge Cup playoff eşleşmelerini simüle edin.",
    },
};

export default async function CEVChallengePlayoffsPage() {
    const filePath = path.join(process.cwd(), 'data', 'cev-challenge-cup-data.json');
    let data = null;

    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const sourceData = JSON.parse(fileContent);

            const fixture: any[] = [];
            const teamsMap = new Map();
            let matchCounter = 1;

            const parseScore = (scoreStr: string | null) => {
                if (!scoreStr || !scoreStr.includes('-')) return { home: null, away: null };
                const parts = scoreStr.split('-').map(p => parseInt(p.trim()));
                return { home: isNaN(parts[0]) ? null : parts[0], away: isNaN(parts[1]) ? null : parts[1] };
            };

            if (sourceData.phases) {
                // Track leg numbers for matchups
                const matchupLegs = new Map<string, number>();

                sourceData.phases.forEach((phase: any) => {
                    const roundName = phase.name;
                    phase.matches.forEach((m: any) => {
                        const { home, away } = parseScore(m.score);
                        if (!teamsMap.has(m.homeTeam)) teamsMap.set(m.homeTeam, { name: m.homeTeam, country: '' });
                        if (!teamsMap.has(m.awayTeam)) teamsMap.set(m.awayTeam, { name: m.awayTeam, country: '' });

                        // Determine leg
                        const matchupKey = [m.homeTeam, m.awayTeam].sort().join(' vs ');
                        const currentLeg = (matchupLegs.get(matchupKey) || 0) + 1;
                        matchupLegs.set(matchupKey, currentLeg);

                        fixture.push({
                            id: matchCounter++,
                            round: roundName,
                            leg: currentLeg,
                            date: m.date || 'TBD',
                            homeTeam: m.homeTeam,
                            awayTeam: m.awayTeam,
                            homeScore: home,
                            awayScore: away,
                            setScores: m.sets,
                            isPlayed: m.isPlayed
                        });
                    });
                });
            }

            data = {
                league: "CEV Challenge Cup",
                season: "2025-2026",
                currentStage: "Main Round",
                teams: Array.from(teamsMap.values()),
                fixture: fixture
            };
        }
    } catch (error) {
        console.error('Error reading CEV Challenge data:', error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-emerald-500">Veri Yüklenemedi</h1>
                    <p className="text-slate-400 mt-2">CEV Challenge Cup verileri yüklenirken bir hata oluştu.</p>
                </div>
            </main>
        );
    }

    return (
        <CEVChallengePlayoffsClient initialData={data} />
    );
}

```

## File: app\cev-challenge\stats\CEVChallengeStatsClient.tsx
```
"use client";

import { useMemo } from "react";

import TeamAvatar from "@/app/components/TeamAvatar";

interface Team {
    name: string;
    country: string;
}

interface Match {
    id: number;
    round: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    isPlayed: boolean;
}

interface CEVChallengeStatsClientProps {
    teams: Team[];
    fixture: Match[];
}

interface TeamStats {
    name: string;
    country: string;
    played: number;
    wins: number;
    losses: number;
    setsWon: number;
    setsLost: number;
    winRate: number;
}

export default function CEVChallengeStatsClient({ teams, fixture }: CEVChallengeStatsClientProps) {
    const teamsWithStats = useMemo(() => {
        const statsMap = new Map<string, TeamStats>();

        // Initialize all teams
        teams.forEach(team => {
            statsMap.set(team.name, {
                name: team.name,
                country: team.country,
                played: 0,
                wins: 0,
                losses: 0,
                setsWon: 0,
                setsLost: 0,
                winRate: 0
            });
        });

        // Calculate stats from matches
        fixture.filter(m => m.isPlayed).forEach(match => {
            const homeStats = statsMap.get(match.homeTeam);
            const awayStats = statsMap.get(match.awayTeam);

            if (homeStats && match.homeScore !== null && match.awayScore !== null) {
                homeStats.played++;
                homeStats.setsWon += match.homeScore;
                homeStats.setsLost += match.awayScore;
                if (match.homeScore > match.awayScore) {
                    homeStats.wins++;
                } else {
                    homeStats.losses++;
                }
            }

            if (awayStats && match.homeScore !== null && match.awayScore !== null) {
                awayStats.played++;
                awayStats.setsWon += match.awayScore;
                awayStats.setsLost += match.homeScore;
                if (match.awayScore > match.homeScore) {
                    awayStats.wins++;
                } else {
                    awayStats.losses++;
                }
            }
        });

        // Calculate win rates
        statsMap.forEach(stats => {
            stats.winRate = stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;
        });

        return Array.from(statsMap.values()).filter(t => t.played > 0);
    }, [teams, fixture]);

    const totalMatches = useMemo(() => fixture.filter(m => m.isPlayed).length, [fixture]);
    const totalSets = useMemo(() => teamsWithStats.reduce((sum, t) => sum + t.setsWon, 0), [teamsWithStats]);

    const mostWins = useMemo(() => [...teamsWithStats].sort((a, b) => b.wins - a.wins).slice(0, 5), [teamsWithStats]);
    const mostSets = useMemo(() => [...teamsWithStats].sort((a, b) => b.setsWon - a.setsWon).slice(0, 5), [teamsWithStats]);
    const bestWinRate = useMemo(() => [...teamsWithStats].filter(t => t.played >= 2).sort((a, b) => b.winRate - a.winRate).slice(0, 5), [teamsWithStats]);
    const leastLosses = useMemo(() => [...teamsWithStats].sort((a, b) => a.losses - b.losses || b.wins - a.wins).slice(0, 5), [teamsWithStats]);

    const BarChart = ({ value, max, color }: { value: number; max: number; color: string }) => (
        <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden flex-1">
            <div
                className={`h-full ${color} transition-all duration-500`}
                // eslint-disable-next-line
                style={{ width: `${Math.min((value / (max || 1)) * 100, 100)}%` }}
            />
        </div>
    );

    const StatCard = ({ title, icon, teamStats, statKey, color, gradient, suffix = "" }: {
        title: string; icon: string;
        teamStats: TeamStats[];
        statKey: 'losses' | 'wins' | 'setsWon' | 'setsLost' | 'winRate';
        color: string;
        gradient: string;
        suffix?: string;
    }) => {
        const maxValue = Math.max(...teamStats.map(t => Number(t[statKey])), 1);

        return (
            <div className="bg-slate-950/50 backdrop-blur-md rounded-xl border border-slate-800/60 overflow-hidden hover:border-slate-700/80 transition-all duration-300 group shadow-md hover:shadow-lg">
                <div className={`${gradient} px-2.5 py-2 border-b border-white/10 relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between relative z-10">
                        <h3 className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                            <span className="text-sm">{icon}</span> {title}
                        </h3>
                        <span className="text-[9px] font-bold text-white/70 bg-black/20 px-1.5 py-0.5 rounded-full border border-white/10">TOP 5</span>
                    </div>
                </div>

                <div className="p-1.5 space-y-1">
                    {teamStats.map((t, idx) => (
                        <div
                            key={t.name}
                            className={`flex items-center gap-2 p-1.5 rounded-lg transition-all ${idx === 0 ? 'bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20' : 'hover:bg-slate-800/50'
                                }`}
                        >
                            <div className={`w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shadow-sm ${idx === 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white' :
                                idx === 1 ? 'bg-slate-300 text-slate-800' :
                                    idx === 2 ? 'bg-emerald-700 text-white' :
                                        'bg-slate-800 text-slate-500'
                                }`}>
                                {idx + 1}
                            </div>
                            <TeamAvatar name={t.name} size="xs" />

                            <div className="flex-1 min-w-0">
                                <span className={`text-[11px] font-medium truncate block ${idx === 0 ? 'text-emerald-300' : 'text-white'}`} title={t.name}>
                                    {t.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-1.5 w-16">
                                <BarChart value={Number(t[statKey])} max={maxValue} color={color} />
                                <span className={`text-[11px] font-bold min-w-[24px] text-right ${idx === 0 ? 'text-emerald-400' : 'text-slate-300'}`}>
                                    {t[statKey]}{suffix}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-2 sm:p-4 font-sans">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                <div className="flex flex-col gap-1 px-1">
                    <h1 className="font-bold text-white text-lg tracking-tight leading-none hidden sm:block">CEV Challenge Cup İstatistikleri</h1>
                    <p className="text-[10px] text-slate-400 hidden sm:block">Kadınlar • 2025-2026</p>
                </div>

                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-emerald-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-emerald-400">{totalMatches}</div>
                        <div className="text-[10px] sm:text-xs text-emerald-400/70 uppercase tracking-wider mt-1">Oynanan Maç</div>
                    </div>
                    <div className="bg-gradient-to-br from-teal-600/20 to-teal-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-teal-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-teal-400">{totalSets}</div>
                        <div className="text-[10px] sm:text-xs text-teal-400/70 uppercase tracking-wider mt-1">Toplam Set</div>
                    </div>
                    <div className="bg-gradient-to-br from-indigo-600/20 to-indigo-900/10 rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-indigo-600/30 text-center">
                        <div className="text-2xl sm:text-4xl font-bold text-indigo-400">{teamsWithStats.length}</div>
                        <div className="text-[10px] sm:text-xs text-indigo-400/70 uppercase tracking-wider mt-1">Aktif Takım</div>
                    </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 pb-8">
                    <StatCard
                        title="En Çok Galibiyet"
                        icon="🏆"
                        teamStats={mostWins}
                        statKey="wins"
                        color="bg-emerald-500"
                        gradient="bg-gradient-to-r from-emerald-600 to-teal-600"
                        suffix="G"
                    />
                    <StatCard
                        title="En Yüksek Galibiyet %"
                        icon="📈"
                        teamStats={bestWinRate}
                        statKey="winRate"
                        color="bg-teal-500"
                        gradient="bg-gradient-to-r from-teal-600 to-cyan-600"
                        suffix="%"
                    />
                    <StatCard
                        title="En Çok Set Alan"
                        icon="🏐"
                        teamStats={mostSets}
                        statKey="setsWon"
                        color="bg-indigo-500"
                        gradient="bg-gradient-to-r from-indigo-600 to-purple-600"
                    />
                    <StatCard
                        title="En Az Mağlubiyet"
                        icon="🛡️"
                        teamStats={leastLosses}
                        statKey="losses"
                        color="bg-orange-500"
                        gradient="bg-gradient-to-r from-orange-600 to-red-600"
                        suffix="M"
                    />
                </div>
            </div>
        </main>
    );
}

```

## File: app\cev-challenge\stats\page.tsx
```
import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVChallengeStatsClient from './CEVChallengeStatsClient';

export const metadata: Metadata = {
    title: "CEV Challenge Cup İstatistikler",
    description: "CEV Challenge Cup takım istatistikleri ve performans analizleri.",
    openGraph: {
        title: "CEV Challenge Cup İstatistikler | VolleySimulator",
        description: "Challenge Cup takım istatistikleri.",
    },
};

export default async function CEVChallengeStatsPage() {
    const filePath = path.join(process.cwd(), 'data', 'cev-challenge-cup-data.json');
    let teams: any[] = [];
    let fixture: any[] = [];

    try {
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf8');
            const sourceData = JSON.parse(fileContent);

            const teamsMap = new Map();
            let matchCounter = 1;

            const parseScore = (scoreStr: string | null) => {
                if (!scoreStr || !scoreStr.includes('-')) return { home: null, away: null };
                const parts = scoreStr.split('-').map(p => parseInt(p.trim()));
                return { home: isNaN(parts[0]) ? null : parts[0], away: isNaN(parts[1]) ? null : parts[1] };
            };

            if (sourceData.phases) {
                sourceData.phases.forEach((phase: any) => {
                    const roundName = phase.name;
                    phase.matches.forEach((m: any) => {
                        const { home, away } = parseScore(m.score);
                        if (!teamsMap.has(m.homeTeam)) teamsMap.set(m.homeTeam, { name: m.homeTeam, country: '' });
                        if (!teamsMap.has(m.awayTeam)) teamsMap.set(m.awayTeam, { name: m.awayTeam, country: '' });

                        fixture.push({
                            id: matchCounter++,
                            round: roundName,
                            homeTeam: m.homeTeam,
                            awayTeam: m.awayTeam,
                            homeScore: home,
                            awayScore: away,
                            isPlayed: m.isPlayed
                        });
                    });
                });
            }
            teams = Array.from(teamsMap.values());
        }
    } catch (error) {
        console.error('Error reading CEV Challenge data:', error);
    }

    return (
        <CEVChallengeStatsClient teams={teams} fixture={fixture} />
    );
}

```

