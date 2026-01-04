"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { TeamStats, Match, ScenarioOverride, ScenarioExport } from "../../../types";
import Link from "next/link";
import { TeamAvatar, ProgressRing, Confetti, useToast } from "../../../components";
import StandingsTable from "../../../components/Calculator/StandingsTable";
import { calculateLiveStandings } from "../../../utils/calculatorUtils";
import { compareStandings, TeamDiff, generateScenarioShareUrl } from "../../../utils/scenarioUtils";
import { useMemo } from "react";
import { Share2 } from "lucide-react";

const SCORES = ["3-0", "3-1", "3-2", "2-3", "1-3", "0-3"];

export default function GroupPage() {
    const params = useParams();
    const groupId = decodeURIComponent(params.groupId as string);
    const { showToast } = useToast();

    const [loading, setLoading] = useState(true);
    const [teams, setTeams] = useState<TeamStats[]>([]);
    const [fixture, setFixture] = useState<Match[]>([]);
    const [overrides, setOverrides] = useState<Record<string, string>>({});
    const [calculating, setCalculating] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [selectedTeam, setSelectedTeam] = useState<string>("");
    const [activeTab, setActiveTab] = useState<'probability' | 'matches'>('probability');
    const [predictingAll, setPredictingAll] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [allGroups, setAllGroups] = useState<string[]>([]);
    const [showValidation, setShowValidation] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);
    const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

    const [showDashboard, setShowDashboard] = useState(false);
    const [groupMatchCounts, setGroupMatchCounts] = useState<Record<string, number>>({});

    const [isComparisonMode, setIsComparisonMode] = useState(false);
    const [comparisonStandings, setComparisonStandings] = useState<TeamStats[] | null>(null);

    useEffect(() => {
        fetchData();
    }, [groupId]);

    // Load saved overrides from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('groupScenarios');
        if (saved) {
            try {
                const allScenarios = JSON.parse(saved);
                if (allScenarios[groupId]) {
                    setOverrides(allScenarios[groupId]);
                }
            } catch (e) {
                console.error('Failed to load saved scenarios', e);
            }
        }
        setIsLoaded(true);
    }, [groupId]);

    // Load scenario from URL query parameter
    const searchParams = useSearchParams();
    useEffect(() => {
        const scenarioParam = searchParams.get('scenario');
        if (scenarioParam) {
            try {
                const decoded = JSON.parse(atob(scenarioParam));
                setOverrides(decoded);
                showToast("Paylaşılan senaryo yüklendi!", "success");
            } catch (e) {
                console.error('Failed to decode scenario from URL', e);
            }
        }
    }, [searchParams]);

    // Save overrides to localStorage when they change
    useEffect(() => {
        if (!isLoaded) return; // Wait for initial load
        setSaveStatus('saving');

        const saved = localStorage.getItem('groupScenarios');
        const allScenarios = saved ? JSON.parse(saved) : {};
        allScenarios[groupId] = overrides;
        localStorage.setItem('groupScenarios', JSON.stringify(allScenarios));

        const timer = setTimeout(() => {
            setSaveStatus('saved');
        }, 500);

        return () => clearTimeout(timer);
    }, [overrides, groupId, isLoaded]);

    const handleExportScenario = () => {
        const exportData: ScenarioExport = {
            version: '1.0',
            league: '2lig',
            timestamp: new Date().toISOString(),
            groupId: groupId,
            overrides: overrides,
            metadata: {
                completedMatches: fixture.filter(m => m.isPlayed).length,
                totalMatches: fixture.length
            }
        };
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportData, null, 2));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", `scenario-${groupId}-${new Date().toLocaleDateString('tr-TR').replace(/\./g, '-')}.json`);
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        showToast("Senaryo dosyası indirildi", "success");
    };

    const handleShareScenario = async () => {
        try {
            const exportData: ScenarioExport = {
                version: '1.0',
                league: '2lig',
                timestamp: new Date().toISOString(),
                groupId: groupId,
                overrides: overrides,
                metadata: {
                    completedMatches: fixture.filter(m => m.isPlayed).length,
                    totalMatches: fixture.length
                }
            };
            const url = generateScenarioShareUrl(exportData);
            await navigator.clipboard.writeText(url);
            showToast("Senaryo paylaşım linki kopyalandı!", "success");
        } catch (e) {
            showToast("Link kopyalanamadı", "error");
        }
    };

    const handleImportScenario = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);

                // Handle both old format (direct overrides) and new format (ScenarioExport)
                let newOverrides = {};
                if (json.version && json.overrides) {
                    newOverrides = json.overrides;
                    if (json.groupId && json.groupId !== groupId) {
                        showToast(`Dikkat: Bu senaryo ${json.groupId} için hazırlanmış`, "info");
                    }
                } else {
                    newOverrides = json; // Legacy support
                }

                setOverrides(newOverrides);
                showToast("Senaryo başarıyla yüklendi", "success");
                setShowConfetti(true);
            } catch (error) {
                console.error("Import error:", error);
                showToast("Dosya okunamadı veya hatalı", "error");
            }
        };
        reader.readAsText(file);
        // Reset input
        event.target.value = '';
    };

    // Auto-calculate when team is selected
    useEffect(() => {
        if (selectedTeam && teams.length > 0 && !loading) {
            handleCalculate();
        }
    }, [selectedTeam]);

    async function fetchData() {
        try {
            setLoading(true);
            const res = await fetch("/api/scrape");
            if (!res.ok) throw new Error("Veri çekilemedi");
            const data = await res.json();

            // Get all unique groups for navigation
            const uniqueGroups = [...new Set(data.teams.map((t: TeamStats) => t.groupName))].sort((a, b) => {
                const numA = parseInt((a as string).match(/\d+/)?.[0] || "0");
                const numB = parseInt((b as string).match(/\d+/)?.[0] || "0");
                return numA - numB;
            }) as string[];
            setAllGroups(uniqueGroups);

            // Calculate matches per group
            const counts: Record<string, number> = {};
            uniqueGroups.forEach(g => {
                counts[g] = data.fixture.filter((m: Match) => m.groupName === g).length;
            });
            setGroupMatchCounts(counts);

            const groupTeams = data.teams.filter((t: TeamStats) => t.groupName === groupId);
            const groupFixture = data.fixture.filter((m: Match) => m.groupName === groupId);

            setTeams(groupTeams);
            setFixture(groupFixture);

            if (groupFixture.length > 0) {
                setSelectedTeam(groupFixture[0].homeTeam);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    // Calculate standings from fixture (played matches only)
    // Logic moved to utils/calculatorUtils
    // const sortedTeams = calculateStandingsFromFixture(fixture); 
    // Replaced by memoized calculation below

    // Current standings from played matches (no overrides)
    const sortedTeams = useMemo(() => {
        if (teams.length === 0) return [];
        return calculateLiveStandings(teams, fixture, {});
    }, [teams, fixture]);

    const upcomingMatches = useMemo(() => fixture.filter(m => !m.isPlayed), [fixture]);

    // Scenario standings (with overrides)
    const scenarioStandings = useMemo(() => {
        if (teams.length === 0) return [];
        return calculateLiveStandings(teams, fixture, overrides);
    }, [teams, fixture, overrides]);

    const handleCompareScenario = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const json = JSON.parse(event.target?.result as string);
                let importedOverrides = {};
                if (json.version && json.overrides) {
                    importedOverrides = json.overrides;
                } else {
                    importedOverrides = json; // Legacy
                }

                const calculated = calculateLiveStandings(teams, fixture, importedOverrides as Record<string, string>);
                setComparisonStandings(calculated);
                setIsComparisonMode(true);
                showToast("Karşılaştırma modu aktif", "success");
            } catch (err) {
                showToast("Dosya okunamadı", "error");
            }
        };
        reader.readAsText(file);
    };

    const activeStandings = isComparisonMode && comparisonStandings ? comparisonStandings : scenarioStandings;

    const comparisonDiffs = useMemo(() => {
        if (!isComparisonMode || !comparisonStandings) return undefined;
        // Compare: Base = scenarioStandings, Target = comparisonStandings
        return compareStandings(scenarioStandings, comparisonStandings);
    }, [isComparisonMode, scenarioStandings, comparisonStandings]);

    function handleScoreSelect(matchId: string, score: string | null) {
        setOverrides(prev => {
            const next = { ...prev };
            if (score === null) delete next[matchId];
            else next[matchId] = score;
            return next;
        });
    }

    async function handleCalculate() {
        if (!selectedTeam) return;
        setCalculating(true);
        try {
            const scenarioOverrides: ScenarioOverride[] = [];
            upcomingMatches.forEach(m => {
                const id = `${m.homeTeam}|||${m.awayTeam}`;
                if (overrides[id]) {
                    scenarioOverrides.push({ homeTeam: m.homeTeam, awayTeam: m.awayTeam, score: overrides[id] });
                }
            });

            const res = await fetch("/api/calculate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ teams: sortedTeams, fixture, targetTeam: selectedTeam, overrides: scenarioOverrides }),
            });
            setResult(await res.json());
        } catch (err) {
            console.error(err);
        } finally {
            setCalculating(false);
        }
    }

    const filledCount = upcomingMatches.filter(m => overrides[`${m.homeTeam}|||${m.awayTeam}`]).length;

    // Group matches by date for the matches tab
    const groupMatchesByDate = (matches: Match[]) => {
        const byDate: Record<string, Match[]> = {};
        matches.forEach(m => {
            const date = m.matchDate || 'Tarih Belirsiz';
            if (!byDate[date]) byDate[date] = [];
            byDate[date].push(m);
        });
        return Object.entries(byDate).sort(([a], [b]) => a.localeCompare(b));
    };

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-center pb-4 border-b border-slate-800 gap-4">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-4">
                            <span>🏐 {groupId}</span>
                            {/* Auto-Save Indicator */}
                            {saveStatus === 'saving' && (
                                <span className="text-xs font-normal text-slate-400 animate-pulse flex items-center gap-1.5 bg-slate-800/50 px-2 py-1 rounded-full border border-slate-700/50">
                                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full"></span>
                                    Kaydediliyor...
                                </span>
                            )}
                            {saveStatus === 'saved' && (
                                <span className="text-xs font-normal text-emerald-400 flex items-center gap-1.5 bg-emerald-950/30 px-2 py-1 rounded-full border border-emerald-500/20 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <span className="text-xs">✓</span>
                                    Kaydedildi
                                </span>
                            )}
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">{teams.length} takım • {upcomingMatches.length} kalan maç</p>
                    </div>
                    <div className="flex gap-2">
                        {/* Dashboard Trigger */}
                        <button
                            onClick={() => setShowDashboard(true)}
                            className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-lg text-sm flex items-center gap-2 transition-all"
                        >
                            <span>🌎</span> Genel Durum
                        </button>
                        <button onClick={() => setOverrides({})} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm">Sıfırla</button>
                        <Link href="/groups" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm">← Gruplar</Link>
                    </div>
                </header>

                {/* Dashboard Modal */}
                {showDashboard && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200" onClick={() => setShowDashboard(false)}>
                        <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl p-6" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                                    🌍 Lig Durumu
                                    <span className="text-sm font-normal text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full">Tüm Gruplar</span>
                                </h2>
                                <button
                                    onClick={() => setShowDashboard(false)}
                                    className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {allGroups.map(gId => {
                                    // Get overrides for this group from localStorage
                                    const saved = localStorage.getItem('groupScenarios');
                                    const allScenarios = saved ? JSON.parse(saved) : {};
                                    const groupOverrides = allScenarios[gId] || {};
                                    const filled = Object.keys(groupOverrides).length;
                                    const total = groupMatchCounts[gId] || 1; // Avoid div by zero
                                    const percent = Math.min(100, Math.round((filled / total) * 100));
                                    const isComplete = filled >= total;
                                    const isCurrent = gId === groupId;

                                    return (
                                        <Link
                                            key={gId}
                                            href={`/group/${gId}`}
                                            onClick={() => setShowDashboard(false)}
                                            className={`relative group bg-slate-950 rounded-lg border p-4 transition-all hover:-translate-y-1 hover:shadow-xl ${isCurrent ? 'border-indigo-500/50 shadow-[0_0_15px_-5px_rgba(99,102,241,0.3)]' : 'border-slate-800 hover:border-slate-600'}`}
                                        >
                                            <div className="flex justify-between items-start mb-3 relative z-10">
                                                <div>
                                                    <h3 className={`font-bold text-lg ${isCurrent ? 'text-indigo-400' : 'text-white'}`}>
                                                        {gId}
                                                    </h3>
                                                    <p className="text-xs text-slate-400 mt-1">
                                                        {filled}/{total} Takmin
                                                    </p>
                                                </div>
                                                {isComplete ? (
                                                    <div className="bg-emerald-500/10 text-emerald-400 text-xs px-2 py-1 rounded border border-emerald-500/20 font-medium">
                                                        Tamamlandı
                                                    </div>
                                                ) : (
                                                    <div className="bg-amber-500/10 text-amber-400 text-xs px-2 py-1 rounded border border-amber-500/20 font-medium">
                                                        {total - filled} Eksik
                                                    </div>
                                                )}
                                            </div>

                                            {/* Liquid Progress Bar */}
                                            <div className="h-2 bg-slate-800 rounded-full overflow-hidden relative">
                                                <div
                                                    className={`h-full rounded-full transition-all duration-1000 ease-out relative overflow-hidden ${isComplete ? 'bg-emerald-500' : 'bg-indigo-500'}`}
                                                    style={{ width: `${percent}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite] translate-x-[-100%]" style={{ backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)' }}></div>
                                                </div>
                                            </div>

                                            {isCurrent && (
                                                <div className="absolute top-2 right-2 text-[10px] text-indigo-500 font-mono opacity-50">
                                                    AKTİF
                                                </div>
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                )}

                {/* Group Navigation */}
                {allGroups.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900/50 rounded-lg border border-slate-800/50">
                        {allGroups.map(g => {
                            const num = g.match(/\d+/)?.[0] || g;
                            const isActive = g === groupId;
                            return (
                                <Link
                                    key={g}
                                    href={`/group/${encodeURIComponent(g)}`}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
                                        }`}
                                >
                                    {num}. Grup
                                </Link>
                            );
                        })}
                    </div>
                )}

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-800 pb-2">
                    <button
                        onClick={() => setActiveTab('probability')}
                        className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-200 ${activeTab === 'probability' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        🎲 Olasılık Hesaplama
                    </button>
                    <button
                        onClick={() => setActiveTab('matches')}
                        className={`px-4 py-2 rounded-t-lg font-medium text-sm transition-all duration-200 flex items-center gap-2 ${activeTab === 'matches' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        🎮 Tüm Maçlar
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${filledCount === upcomingMatches.length ? 'bg-emerald-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                            {filledCount}/{upcomingMatches.length}
                        </span>
                    </button>
                </div>

                {/* Confetti celebration */}
                <Confetti trigger={showConfetti} onComplete={() => setShowConfetti(false)} />

                {loading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white mx-auto mb-4 opacity-50"></div>
                        <p className="text-slate-500">Yükleniyor...</p>
                    </div>
                ) : (
                    <>
                        {/* Tab 1: Probability */}
                        {activeTab === 'probability' && (
                            <div className="grid lg:grid-cols-3 gap-6">
                                {/* Standings - Uses scenario standings when overrides exist */}
                                <div className="space-y-4">
                                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                        📊 Puan Durumu
                                        {Object.keys(overrides).length > 0 && (
                                            <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">(Senaryo)</span>
                                        )}
                                    </h2>
                                    <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                                        <table className="w-full text-xs">
                                            <thead className="bg-slate-800">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-slate-400">#</th>
                                                    <th className="px-3 py-2 text-left text-slate-400">Takım</th>
                                                    <th className="px-3 py-2 text-center text-slate-400">O</th>
                                                    <th className="px-3 py-2 text-center text-slate-400">G</th>
                                                    <th className="px-3 py-2 text-center text-slate-400">P</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {(() => {
                                                    const standings = Object.keys(overrides).length > 0 ? scenarioStandings : sortedTeams;
                                                    // FIX: Use activeStandings and comparison logic here instead of duplicate local logic
                                                    // However, this Probability Tab table is SEPARATE from the StandingsTable comp?
                                                    // Ah, NO. The file uses StandingsTable ONLY in one place?
                                                    // Only lines 773-815 seems to use a manual table implementation.
                                                    // lines 420-472 is ALSO a manual table implementation for 'Probability' tab list.
                                                    // This file is messy with table duplication.
                                                    // Let's create a StandingsTable usage here to replace this manual table if possible, or just hack it.
                                                    // The manual table in Probability Tab is for *Selection*.
                                                    // The sticky table (773) is for *Reference*.
                                                    // Let's assume the user wants the Comparison view in the STICKY table (Line 773).
                                                    return standings.map((team, idx) => {
                                                        const isPlayoff = idx < 2;
                                                        const isRelegation = idx >= standings.length - 2;
                                                        return (
                                                            <tr
                                                                key={team.name}
                                                                onClick={() => setSelectedTeam(team.name)}
                                                                className={`border-t border-slate-800 cursor-pointer transition-all duration-300 hover:bg-slate-800/50 ${team.name === selectedTeam
                                                                    ? 'bg-blue-900/30 border-l-4 border-l-blue-500'
                                                                    : isPlayoff
                                                                        ? 'bg-emerald-950/40 border-l-4 border-l-emerald-500'
                                                                        : isRelegation
                                                                            ? 'bg-rose-950/40 border-l-4 border-l-rose-500'
                                                                            : ''
                                                                    }`}
                                                            >
                                                                <td className="px-3 py-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className={`font-bold ${isPlayoff ? 'text-emerald-400' : isRelegation ? 'text-rose-400' : 'text-slate-400'}`}>
                                                                            {idx + 1}
                                                                        </span>
                                                                        {isPlayoff && <span className="text-[8px]">🏆</span>}
                                                                        {isRelegation && <span className="text-[8px]">⬇️</span>}
                                                                    </div>
                                                                </td>
                                                                <td className={`px-3 py-2 ${team.name === selectedTeam ? 'text-blue-400 font-medium' : isPlayoff ? 'text-emerald-300' : isRelegation ? 'text-rose-300' : 'text-white'}`}>
                                                                    <div className="flex items-center gap-2">
                                                                        <TeamAvatar name={team.name} size="sm" position={idx < 3 ? idx + 1 : undefined} />
                                                                        <span className="truncate max-w-[100px]">{team.name}</span>
                                                                    </div>
                                                                </td>
                                                                <td className="px-3 py-2 text-center text-slate-400">{team.played}</td>
                                                                <td className="px-3 py-2 text-center text-slate-400">{team.wins}</td>
                                                                <td className="px-3 py-2 text-center font-bold text-white">{team.points}</td>
                                                            </tr>
                                                        )
                                                    });
                                                })()}
                                            </tbody>
                                        </table>
                                        <div className="text-[10px] text-slate-500 text-center py-2 border-t border-slate-800">
                                            👆 Takıma tıklayarak analiz görüntüleyin
                                        </div>
                                    </div>

                                    {/* Calculating indicator */}
                                    {calculating && (
                                        <div className="bg-blue-950/30 rounded-lg border border-blue-800 p-4 flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent"></div>
                                            <span className="text-sm text-blue-400">Hesaplanıyor...</span>
                                        </div>
                                    )}
                                </div>

                                {/* AI Analysis & Stats */}
                                <div className="lg:col-span-2 space-y-4">
                                    {result ? (
                                        <>
                                            {/* Team Header */}
                                            <div className="flex items-center gap-2">
                                                <h2 className="text-xl font-bold text-white">📊 {selectedTeam}</h2>
                                            </div>

                                            {/* Probability Stats - TOP */}
                                            <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                                                <div className="grid grid-cols-3 gap-3 text-center">
                                                    <div className="bg-amber-950/30 p-4 rounded-lg">
                                                        <div className="text-3xl font-bold text-amber-400">{result.championshipProbability?.toFixed(1)}%</div>
                                                        <div className="text-sm text-slate-400 mt-1">Şampiyonluk</div>
                                                    </div>
                                                    <div className="bg-emerald-950/30 p-4 rounded-lg">
                                                        <div className="text-3xl font-bold text-emerald-400">{result.playoffProbability?.toFixed(1)}%</div>
                                                        <div className="text-sm text-slate-400 mt-1">Play-Off</div>
                                                    </div>
                                                    <div className="bg-rose-950/30 p-4 rounded-lg">
                                                        <div className="text-3xl font-bold text-rose-400">{result.relegationProbability?.toFixed(1)}%</div>
                                                        <div className="text-sm text-slate-400 mt-1">Düşme</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Rank Range - PROMINENT */}
                                            <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                                                <h3 className="text-sm font-medium text-slate-400 mb-3">📍 Tahmini Sezon Sonu Sıralaması</h3>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="bg-emerald-950/20 p-4 rounded-lg text-center border border-emerald-900/50">
                                                        <div className="text-xs text-emerald-400 mb-1">En İyi İhtimal</div>
                                                        <div className="text-4xl font-bold text-emerald-400">{result.bestRank}.</div>
                                                        <div className="text-xs text-slate-500 mt-1">sıra</div>
                                                    </div>
                                                    <div className="bg-rose-950/20 p-4 rounded-lg text-center border border-rose-900/50">
                                                        <div className="text-xs text-rose-400 mb-1">En Kötü İhtimal</div>
                                                        <div className="text-4xl font-bold text-rose-400">{result.worstRank}.</div>
                                                        <div className="text-xs text-slate-500 mt-1">sıra</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* AI Analysis - BOTTOM */}
                                            <div className="bg-slate-900 rounded-lg border border-slate-800 p-4">
                                                <h3 className="text-sm font-medium text-slate-400 mb-3">🤖 AI Analizi</h3>
                                                <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed">{result.aiAnalysis}</p>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 text-center text-slate-500">
                                            <p className="text-lg mb-2">👈</p>
                                            <p>Puan durumundan bir takıma tıklayın</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 2: All Matches */}
                        {activeTab === 'matches' && (
                            <div className="grid lg:grid-cols-2 gap-6">
                                {/* Upcoming Matches */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center gap-2">
                                        <h2 className="text-lg font-semibold text-white">🎮 Gelecek Maçlar</h2>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        setPredictingAll(true);
                                                        const response = await fetch('/api/predict-all', {
                                                            method: 'POST',
                                                            headers: { 'Content-Type': 'application/json' },
                                                            body: JSON.stringify({
                                                                teams: sortedTeams,
                                                                upcomingMatches: upcomingMatches,
                                                                allMatches: fixture // [NEW] Send full history for Elo calc
                                                            })
                                                        });

                                                        if (!response.ok) {
                                                            throw new Error("Tahminler alınamadı");
                                                        }

                                                        const predictions = await response.json();
                                                        setOverrides(prev => ({
                                                            ...prev,
                                                            ...predictions
                                                        }));
                                                        // Show success feedback
                                                        setShowConfetti(true);
                                                        showToast(`${Object.keys(predictions).length} maç tahmin edildi!`, 'success');
                                                    } catch (error) {
                                                        console.error("AI Prediction error:", error);
                                                        showToast("Tahminler yapılırken bir hata oluştu.", 'error');
                                                    } finally {
                                                        setPredictingAll(false);
                                                    }
                                                }}
                                                disabled={predictingAll || upcomingMatches.length === 0}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-md text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {predictingAll ? (
                                                    <>
                                                        <div className="w-3 h-3 border-2 border-indigo-400/30 border-t-indigo-400 rounded-full animate-spin"></div>
                                                        <span>Tahmin Ediliyor...</span>
                                                    </>
                                                ) : (
                                                    <><span>🔮</span> <span>Tümünü Tahmin Et</span></>
                                                )}
                                            </button>

                                            <div className="flex bg-slate-800 rounded-md p-0.5 border border-slate-700">
                                                <button
                                                    onClick={handleExportScenario}
                                                    title="Senaryoyu İndir"
                                                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                                                >
                                                    <span className="text-lg">📥</span>
                                                </button>
                                                <label
                                                    title="Senaryo Yükle"
                                                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-indigo-400 transition-colors cursor-pointer"
                                                >
                                                    <span className="text-lg">📤</span>
                                                    <input
                                                        type="file"
                                                        accept=".json"
                                                        className="hidden"
                                                        onChange={handleImportScenario}
                                                    />
                                                </label>
                                                <div className="w-px bg-slate-700 mx-1"></div>
                                                <label
                                                    title={isComparisonMode ? "Karşılaştırmayı Kapat" : "Senaryo Karşılaştır"}
                                                    className={`p-1.5 hover:bg-slate-700 rounded transition-colors cursor-pointer font-bold ${isComparisonMode ? 'text-amber-400 bg-amber-950/30' : 'text-slate-400 hover:text-amber-400'}`}
                                                >
                                                    <span className="text-lg">⚖️</span>
                                                    <input
                                                        type="file"
                                                        accept=".json"
                                                        className="hidden"
                                                        onChange={handleCompareScenario}
                                                        onClick={(e) => {
                                                            if (isComparisonMode) {
                                                                e.preventDefault();
                                                                setIsComparisonMode(false);
                                                                setComparisonStandings(null);
                                                            }
                                                        }}
                                                    />
                                                </label>
                                                <div className="w-px bg-slate-700 mx-1"></div>
                                                <button
                                                    onClick={handleShareScenario}
                                                    title="Senaryo Paylaş"
                                                    className="p-1.5 hover:bg-slate-700 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                                                >
                                                    <span className="text-lg">🔗</span>
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (filledCount < upcomingMatches.length) {
                                                        setShowValidation(true);
                                                        showToast("Lütfen eksik maçları tamamlayın", "error");
                                                    } else {
                                                        setShowValidation(false);
                                                        // It's already saved to localStorage, just show sync feedback
                                                        showToast("Senaryo başarıyla kaydedildi!", "success");
                                                        setShowConfetti(true);
                                                    }
                                                }}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md text-sm font-medium transition-all"
                                            >
                                                <span>💾</span> <span>Kaydet</span>
                                            </button>
                                            {filledCount > 0 && (
                                                <button onClick={() => {
                                                    setOverrides({});
                                                    setShowValidation(false);
                                                }} className="text-xs text-rose-400 hover:text-rose-300 underline">Temizle</button>
                                            )}
                                        </div>
                                    </div>
                                    {/* Missing matches warning - Only show when validation failed */}
                                    {showValidation && filledCount < upcomingMatches.length && (
                                        <div className="mb-4 bg-amber-950/30 border-l-4 border-l-amber-500 p-3 rounded-r-lg flex items-center justify-between animate-shake">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xl">⚠️</span>
                                                <div>
                                                    <p className="text-sm font-medium text-amber-500">Senaryo Tamamlanmadı</p>
                                                    <p className="text-xs text-amber-400/80">Analizin doğru olması için kalan <strong>{upcomingMatches.length - filledCount}</strong> maçı da tahmin etmelisiniz.</p>
                                                </div>
                                            </div>
                                            <div className="text-[10px] text-amber-500/50 italic animate-pulse">
                                                Aşağıdaki işaretli maçları doldurun 👇
                                            </div>
                                        </div>
                                    )}
                                    {upcomingMatches.length === 0 ? (
                                        <div className="bg-slate-900 rounded-lg border border-slate-800 p-8 text-center text-slate-500">Tüm maçlar oynandı.</div>
                                    ) : (
                                        <div className="space-y-3">
                                            {groupMatchesByDate(upcomingMatches).map(([date, matches]) => (
                                                <div key={date} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
                                                    <div className="bg-slate-800 px-4 py-2 flex justify-between items-center">
                                                        <span className="font-medium text-white text-sm">
                                                            📅 {date === 'Tarih Belirsiz' ? date : new Date(date).toLocaleDateString('tr-TR', { weekday: 'short', day: 'numeric', month: 'short' })}
                                                        </span>
                                                        <span className="text-xs text-slate-400">{matches.length} maç</span>
                                                    </div>
                                                    <div className="p-3 space-y-2">
                                                        {matches.map(match => {
                                                            const matchId = `${match.homeTeam}|||${match.awayTeam}`;
                                                            const currentScore = overrides[matchId];
                                                            const isMissing = showValidation && filledCount > 0 && !currentScore;

                                                            // Calculate Match Impact
                                                            const homeIdx = scenarioStandings.findIndex(t => t.name === match.homeTeam);
                                                            const awayIdx = scenarioStandings.findIndex(t => t.name === match.awayTeam);
                                                            const homeRank = homeIdx + 1;
                                                            const awayRank = awayIdx + 1;

                                                            let impact: 'none' | 'medium' | 'high' = 'none';
                                                            let impactLabel = '';

                                                            // Logic:
                                                            // 1. Top Clash: Both Top 4
                                                            if (homeRank <= 4 && awayRank <= 4) { impact = 'high'; impactLabel = '🔥 Zirve Maçı'; }
                                                            // 2. Playoff Decider: Rank 2 vs 3
                                                            else if ((homeRank === 2 && awayRank === 3) || (homeRank === 3 && awayRank === 2)) { impact = 'high'; impactLabel = '🔥 Play-off Finali'; }
                                                            // 3. Relegation 6-Pointer: Both Bottom 3
                                                            else if (homeRank >= scenarioStandings.length - 2 && awayRank >= scenarioStandings.length - 2) { impact = 'high'; impactLabel = '🔥 Düşme Hattı'; }
                                                            // 4. Bubble Battle: Top 6 and close ranks
                                                            else if (homeRank <= 6 && awayRank <= 6 && Math.abs(homeRank - awayRank) <= 2) { impact = 'medium'; impactLabel = '⚡ Kritik'; }

                                                            return (
                                                                <div key={matchId} className={`bg-slate-950 p-2 rounded border transition-all duration-300 relative ${impact === 'high' ? 'border-amber-500/40 shadow-[0_0_10px_-5px_rgba(245,158,11,0.2)]' :
                                                                    isMissing
                                                                        ? 'border-amber-500/50 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)] animate-pulse-slow'
                                                                        : 'border-slate-800/50'
                                                                    }`}>

                                                                    {/* Impact Badge */}
                                                                    {impact !== 'none' && (
                                                                        <div className={`absolute -top-2 left-1/2 -translate-x-1/2 text-[9px] font-bold px-1.5 py-0.5 rounded-full border shadow-sm z-10 ${impact === 'high'
                                                                            ? 'bg-amber-950 text-amber-500 border-amber-500/50'
                                                                            : 'bg-blue-950 text-blue-400 border-blue-500/50'
                                                                            }`}>
                                                                            {impactLabel}
                                                                        </div>
                                                                    )}

                                                                    <div className="flex items-center justify-between gap-2 mb-2 mt-1">
                                                                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                                                                            <span className="text-[10px] w-4 text-center text-slate-500 font-mono">#{homeRank}</span>
                                                                            <span className={`text-xs truncate md:text-sm ${homeRank <= 2 ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>{match.homeTeam}</span>
                                                                        </div>

                                                                        <span className="text-[10px] text-slate-500 whitespace-nowrap">{match.matchTime || 'vs'}</span>

                                                                        <div className="flex items-center gap-1.5 flex-1 min-w-0 justify-end">
                                                                            <span className={`text-xs truncate md:text-sm text-right ${awayRank <= 2 ? 'text-emerald-400 font-medium' : 'text-slate-300'}`}>{match.awayTeam}</span>
                                                                            <span className="text-[10px] w-4 text-center text-slate-500 font-mono">#{awayRank}</span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="flex gap-1">
                                                                        {SCORES.map(score => {
                                                                            const isSelected = currentScore === score;
                                                                            const [h, a] = score.split('-').map(Number);
                                                                            const isHomeWin = h > a;
                                                                            return (
                                                                                <button
                                                                                    key={score}
                                                                                    onClick={() => handleScoreSelect(matchId, isSelected ? null : score)}
                                                                                    className={`flex-1 text-[10px] sm:text-xs py-2 sm:py-1.5 rounded border transition-all duration-200 active:scale-95 touch-target-sm ${isSelected
                                                                                        ? isHomeWin
                                                                                            ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-500/30 animate-bounce-once'
                                                                                            : 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-500/30 animate-bounce-once'
                                                                                        : 'bg-slate-800 border-slate-700 text-slate-400 hover:bg-slate-700 hover:border-slate-600 hover:text-white'
                                                                                        }`}
                                                                                >
                                                                                    {score}
                                                                                </button>
                                                                            );
                                                                        })}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Dynamic Standings - Updates with scenario - STICKY */}
                                <div className="lg:sticky lg:top-4 space-y-4 self-start">
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                            📊 Puan Durumu
                                            {Object.keys(overrides).length > 0 && (
                                                <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded animate-pulse">
                                                    Senaryo
                                                </span>
                                            )}
                                        </h2>
                                    </div>
                                    <div className="h-[600px] bg-slate-900 rounded-lg border border-slate-800 overflow-hidden shadow-xl">
                                        <StandingsTable
                                            teams={activeStandings}
                                            compact={true}
                                            comparisonDiffs={comparisonDiffs}
                                        />
                                    </div>
                                </div>
                            </div >
                        )
                        }
                    </>
                )}
            </div >
        </main >
    );
}
