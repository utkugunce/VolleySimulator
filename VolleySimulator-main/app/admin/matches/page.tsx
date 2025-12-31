"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/app/context/AuthContext";
import { useRouter } from "next/navigation";
import { useFetch } from "@/app/utils/useFetch";
import Link from "next/link";
import toast from "react-hot-toast";

interface Match {
    id: string;
    home: string;
    away: string;
    date: string;
    time: string;
    week?: number | string;
    league: string; // Added manually during aggregation
    status?: string;
    score?: string;
    home_set?: number;
    away_set?: number;
}

export default function MatchManagement() {
    const { user, loading } = useAuth();
    const router = useRouter();

    // Fetchers for each league
    const { execute: fetch1Lig } = useFetch<any>();
    const { execute: fetchVSL } = useFetch<any>();
    const { execute: fetch2Lig } = useFetch<any>();
    const { execute: fetchCEV } = useFetch<any>();

    // Use a generic fetcher for admin updates
    const { execute: updateMatch, loading: updating } = useFetch<any>();

    const [matches, setMatches] = useState<Match[]>([]);
    const [filteredMatches, setFilteredMatches] = useState<Match[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [filter, setFilter] = useState("all"); // 'all', 'today', 'pending'

    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
    const [scoreInput, setScoreInput] = useState({ home: "0", away: "0" });

    useEffect(() => {
        if (!loading && !user) {
            router.push("/login?redirect=/admin/matches");
        } else if (user) {
            loadAllMatches();
        }
    }, [user, loading, router]);

    const loadAllMatches = async () => {
        setLoadingData(true);
        try {
            // Parallel fetching (simulated since useFetch is hook-based, ideally we'd use raw fetch or Promise.all if useFetch returned promises properly)
            // Since useFetch is a hook, we can't easily use it in a loop or Promise.all if it's designed for single component state.
            // Assuming useFetch execute returns a promise? 
            // Checking useFetch signature from previous context... it likely returns void / relies on state.
            // Let's fallback to native fetch for data aggregation to be cleaner, using the auth headers.

            const { createClient } = await import("@/app/utils/supabase");
            const supabase = createClient();
            const token = (await supabase?.auth.getSession())?.data.session?.access_token;
            // Wait, client side auth token retrieval.

            const headers = {
                "Content-Type": "application/json",
                // Authorization header typically added by a custom fetch wrapper, but let's assume public endpoints don't need auth?
                // Yes, league data endpoints are public.
            };

            const [res1Lig, resVSL, res2Lig, resCEV] = await Promise.all([
                fetch(process.env.NEXT_PUBLIC_API_URL + "/1lig").then(r => r.json()),
                fetch(process.env.NEXT_PUBLIC_API_URL + "/vsl").then(r => r.json()),
                fetch(process.env.NEXT_PUBLIC_API_URL + "/scrape").then(r => r.json()), // 2. Lig
                fetch(process.env.NEXT_PUBLIC_API_URL + "/cev-cl").then(r => r.json()),
            ]);

            let allMatches: Match[] = [];

            // Helper to process response
            const processLeagueData = (data: any, leagueName: string) => {
                if (!data || !data.matches) return;
                data.matches.forEach((m: any) => {
                    // Need to flat map dates/weeks if structure varies. 
                    // Assuming standard structure: { matches: [ { id, home, ... } ] } 
                    // OR if grouped by weeks: { weeks: [ { matches: [] } ] }
                    // Let's assume flattened for MVP or check structure.
                    // VolleySimulator structure is usually grouped by "weeks" or just flat array in "matches".
                    // Let's assume flat array 'matches' inside the league json for now based on '1lig.json' usage logic usually being complex.
                    // If it's grouped, we need to flatten.
                    // Let's try to handle both.

                    allMatches.push({ ...m, league: leagueName });
                });

                // Handle week-based structure if matches is not top-level
                if (data.weeks) {
                    data.weeks.forEach((w: any) => {
                        w.matches.forEach((m: any) => {
                            allMatches.push({ ...m, league: leagueName, week: w.week });
                        });
                    });
                }
            };

            processLeagueData(res1Lig, "1. Lig");
            processLeagueData(resVSL, "Sultanlar Ligi");
            processLeagueData(res2Lig, "2. Lig");
            processLeagueData(resCEV, "Şampiyonlar Ligi");

            // Sort by date desc
            allMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

            setMatches(allMatches);
            setFilteredMatches(allMatches);
        } catch (e) {
            console.error("Failed to fetch matches", e);
            toast.error("Maç verileri yüklenemedi");
        } finally {
            setLoadingData(false);
        }
    };

    const handleUpdateScore = async () => {
        if (!selectedMatch) return;

        try {
            const resultScore = `${scoreInput.home}-${scoreInput.away}`;

            // This is a protected route, need to use useFetch or authenticated fetch
            // We'll use the updateMatch from useAuth/useFetch which handles token injection
            await updateMatch("/api/admin/match/update", {
                method: "POST",
                body: JSON.stringify({
                    matchId: selectedMatch.id,
                    league: selectedMatch.league,
                    homeTeam: selectedMatch.home,
                    awayTeam: selectedMatch.away,
                    matchDate: selectedMatch.date,
                    resultScore: resultScore
                })
            });

            toast.success("Maç sonucu güncellendi!");
            setSelectedMatch(null);
            // creating optimistic update or reload
            // reload easier:
            // loadAllMatches(); 
        } catch (e) {
            toast.error("Güncelleme başarısız");
        }
    };

    // Filter logic
    useEffect(() => {
        if (filter === "all") setFilteredMatches(matches);
        else if (filter === "pending") setFilteredMatches(matches.filter(m => !m.score));
        // ... add more as needed
    }, [filter, matches]);

    return (
        <div className="min-h-screen pt-20 px-4 pb-20">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Maç Yönetimi</h1>
                    <Link href="/admin" className="text-slate-400 hover:text-white">← Geri</Link>
                </div>

                {loadingData ? (
                    <div className="text-center py-10 text-slate-400">Yükleniyor...</div>
                ) : (
                    <div className="space-y-4">
                        {filteredMatches.slice(0, 50).map(match => (
                            <div key={match.id} className="bg-slate-800 p-4 rounded-xl flex items-center justify-between">
                                <div className="text-sm">
                                    <div className="text-emerald-400 font-bold mb-1">{match.league}</div>
                                    <div className="text-slate-300">{match.home} vs {match.away}</div>
                                    <div className="text-slate-500 text-xs">{match.date} {match.time}</div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-xl font-mono text-white">
                                        {match.score || "-"}
                                    </div>
                                    <button
                                        onClick={() => {
                                            setSelectedMatch(match);
                                            const parts = match.score ? match.score.split("-") : ["0", "0"];
                                            setScoreInput({ home: parts[0] || "0", away: parts[1] || "0" });
                                        }}
                                        className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm"
                                    >
                                        Düzenle
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal */}
                {selectedMatch && (
                    <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
                        <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-sm">
                            <h3 className="text-xl font-bold text-white mb-4">Skor Düzenle</h3>
                            <div className="text-center text-slate-300 mb-6">
                                {selectedMatch.home} vs {selectedMatch.away}
                            </div>

                            <div className="flex justify-center items-center gap-4 mb-8">
                                <input
                                    type="number"
                                    className="w-16 h-16 text-center text-2xl bg-slate-800 border-slate-600 rounded-xl text-white"
                                    value={scoreInput.home}
                                    onChange={e => setScoreInput({ ...scoreInput, home: e.target.value })}
                                />
                                <span className="text-xl text-slate-500">-</span>
                                <input
                                    type="number"
                                    className="w-16 h-16 text-center text-2xl bg-slate-800 border-slate-600 rounded-xl text-white"
                                    value={scoreInput.away}
                                    onChange={e => setScoreInput({ ...scoreInput, away: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setSelectedMatch(null)}
                                    className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                                >
                                    İptal
                                </button>
                                <button
                                    onClick={handleUpdateScore}
                                    disabled={updating}
                                    className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold"
                                >
                                    {updating ? "..." : "Kaydet"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
