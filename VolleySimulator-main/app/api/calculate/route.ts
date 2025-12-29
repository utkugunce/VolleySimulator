import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateElo } from '../../utils/eloCalculator';
import { normalizeTeamName, sortStandings } from '../../utils/calculatorUtils';
import { TeamStats, Match, MatchOutcome } from '../../types';

// Helper to simulate a single match outcome based on Elo
function simulateMatch(homeElo: number, awayElo: number): MatchOutcome {
    const expectedHome = 1 / (1 + Math.pow(10, (awayElo - homeElo) / 400));
    const random = Math.random();
    const homeWin = random < expectedHome;

    // Simplified score distribution
    // If very clear winner (prob > 0.8), likely 3-0 or 3-1
    // If close (prob ~ 0.5), likely 3-2

    let hSets = 0, aSets = 0;

    if (homeWin) {
        hSets = 3;
        // Prob of 3-0 vs 3-1 vs 3-2
        const dominance = expectedHome; // 0.5 to 1.0
        const r2 = Math.random();
        if (dominance > 0.8) aSets = r2 < 0.7 ? 0 : 1;
        else if (dominance > 0.6) aSets = r2 < 0.5 ? 1 : 2;
        else aSets = 2; // Close match
    } else {
        aSets = 3;
        const dominance = 1 - expectedHome; // 0.5 to 1.0
        const r2 = Math.random();
        if (dominance > 0.8) hSets = r2 < 0.7 ? 0 : 1;
        else if (dominance > 0.6) hSets = r2 < 0.5 ? 1 : 2;
        else hSets = 2;
    }

    let hPoints = 0, aPoints = 0;
    if (hSets === 3) {
        if (aSets <= 1) hPoints = 3;
        else { hPoints = 2; aPoints = 1; }
    } else {
        if (hSets <= 1) aPoints = 3;
        else { aPoints = 2; hPoints = 1; }
    }

    return { homeSets: hSets, awaySets: aSets, homePoints: hPoints, awayPoints: aPoints, homeWin };
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { teams, fixture, targetTeam, overrides } = body;

        if (!teams || !targetTeam) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Calculate Base Elo from History
        const eloMap = calculateElo(teams, fixture);

        // 2. Identify Unplayed Matches (excluding overrides if they are treated as played upstream)
        // The fixture passed usually contains ALL matches. We filter for unplayed.
        // Overrides passed are ALREADY applied to 'teams' (live standings) in the frontend?
        // Actually, the frontend passed 'sortedTeams' which includes applied overrides. 
        // AND it passed 'overrides' array.
        // We should simulate matches that are NOT in overrides and NOT played.

        const overrideIds = new Set(overrides.map((o: any) => `${o.homeTeam}|||${o.awayTeam}`));

        const matchesToSimulate = (fixture as Match[]).filter(m =>
            !m.isPlayed &&
            !overrideIds.has(`${m.homeTeam}|||${m.awayTeam}`)
        );

        // If no matches left, just return current rank
        if (matchesToSimulate.length === 0) {
            const index = teams.findIndex((t: TeamStats) => t.name === targetTeam);
            return NextResponse.json({
                bestRank: index + 1,
                worstRank: index + 1,
                championshipProbability: index === 0 ? 100 : 0,
                playoffProbability: index < 4 ? 100 : 0,
                relegationProbability: index >= teams.length - 2 ? 100 : 0,
                aiAnalysis: "Tüm maçlar tamamlandı veya tahmin edildi."
            });
        }

        // 3. Run Monte Carlo Simulation
        const SIMULATIONS = 1000;
        const ranks: number[] = [];

        // Deep clone for base state
        // Optimize: Convert teams to simpler struct for speed
        const baseTeams = teams.map((t: TeamStats) => ({ ...t, normalizedName: normalizeTeamName(t.name) }));

        for (let i = 0; i < SIMULATIONS; i++) {
            // Copy state
            const simTeams = baseTeams.map((t: any) => ({ ...t }));
            const simMap = new Map();
            simTeams.forEach((t: any) => simMap.set(t.normalizedName, t));

            for (const m of matchesToSimulate) {
                const hName = normalizeTeamName(m.homeTeam);
                const aName = normalizeTeamName(m.awayTeam);
                const hElo = eloMap.get(m.homeTeam) || 1200;
                const aElo = eloMap.get(m.awayTeam) || 1200;

                const outcome = simulateMatch(hElo, aElo);

                const h = simMap.get(hName);
                const a = simMap.get(aName);

                if (h && a) {
                    h.played++;
                    h.wins += outcome.homeWin ? 1 : 0;
                    h.points += outcome.homePoints;
                    h.setsWon += outcome.homeSets;
                    h.setsLost += outcome.awaySets;

                    a.played++;
                    a.wins += outcome.homeWin ? 0 : 1;
                    a.points += outcome.awayPoints;
                    a.setsWon += outcome.awaySets;
                    a.setsLost += outcome.homeSets;
                }
            }

            // Sort
            const sorted = sortStandings(simTeams);
            const rank = sorted.findIndex(t => t.name === targetTeam) + 1;
            ranks.push(rank);
        }

        // 4. Statistics
        const bestRank = Math.min(...ranks);
        const worstRank = Math.max(...ranks);
        const champCount = ranks.filter(r => r === 1).length;
        const playoffCount = ranks.filter(r => r <= 4).length; // Top 4
        // Relegation: Last 2 (assuming 16 teams? Or group specific logic?)
        // Group size varies (e.g. 9 teams). Relegation is usually last 2.
        const delegationThreshold = teams.length - 1; // 8th and 9th if 9 teams
        const relCount = ranks.filter(r => r >= delegationThreshold).length;

        // 5. AI Analysis
        let aiAnalysis = "Analiz oluşturulamadı.";
        if (process.env.GEMINI_API_KEY) {
            try {
                const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
                const model = genAI.getGenerativeModel({ model: "gemini-pro" });

                const context = `
Takım: ${targetTeam}
Mevcut Puan: ${teams.find((t: any) => t.name === targetTeam)?.points}
Kalan Maç Sayısı: ${matchesToSimulate.length}
Simülasyon Sonuçları (1000 tekrar):
- En İyi Sıra: ${bestRank}
- En Kötü Sıra: ${worstRank}
- Şampiyonluk İhtimali: %${(champCount / SIMULATIONS * 100).toFixed(1)}
- Play-off İhtimali: %${(playoffCount / SIMULATIONS * 100).toFixed(1)}
- Düşme İhtimali: %${(relCount / SIMULATIONS * 100).toFixed(1)}

Bu takım için kısa, esprili ve motive edici bir analiz yaz. Voleybol terimleri kullan.
`;
                const result = await model.generateContent(context);
                aiAnalysis = result.response.text();
            } catch (e) {
                console.error("AI Error:", e);
                aiAnalysis = "AI servisine şu an ulaşılamıyor, ancak istatistikler güncel.";
            }
        }

        return NextResponse.json({
            bestRank,
            worstRank,
            championshipProbability: (champCount / SIMULATIONS) * 100,
            playoffProbability: (playoffCount / SIMULATIONS) * 100,
            relegationProbability: (relCount / SIMULATIONS) * 100,
            aiAnalysis
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
