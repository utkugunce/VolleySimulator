import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { createServiceRoleClient } from '../../utils/supabase-server';

// Cron job endpoint - fetches all league results from TVF Calendar (Takvim)
// Updates VSL, 1. Lig, and 2. Lig in one pass

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds

const TVF_TAKVIM_URL = "https://fikstur.tvf.org.tr/Takvim";

interface MatchResult {
    league: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    resultScore: string;
}

async function fetchAllLeagueResults(): Promise<MatchResult[]> {
    try {
        const response = await fetch(TVF_TAKVIM_URL, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            console.error(`TVF Calendar fetch failed: ${response.status}`);
            return [];
        }

        const html = await response.text();
        const $ = cheerio.load(html);
        const results: MatchResult[] = [];

        // On the Takvim page, matches are grouped under league headers
        // We find all league containers or iterate through rows
        // Headers usually have class .tvf-fixture-league-header (found by subagent)

        $('.tvf-fixture-league-header').each((_, header) => {
            const leagueName = $(header).text().trim();

            // Find the table/container immediately following this header
            // TVF structure usually has rows following the header in the same parent or next sibling
            const $container = $(header).next('table, .tvf-fixture-league-matches, div');

            $container.find('tr').each((_, row) => {
                const $row = $(row);

                const homeTeam = $row.find('span[id*="_gevsahibi"]').text().trim();
                const awayTeam = $row.find('span[id*="_gmisafir"], span[id*="_gdeplasman"]').text().trim();
                const homeScoreStr = $row.find('span[id*="_gseta"]').text().trim();
                const awayScoreStr = $row.find('span[id*="_gsetb"], span[id*="_gsetd"]').text().trim();

                const homeScore = parseInt(homeScoreStr);
                const awayScore = parseInt(awayScoreStr);

                if (homeTeam && awayTeam && !isNaN(homeScore) && !isNaN(awayScore)) {
                    results.push({
                        league: leagueName,
                        homeTeam,
                        awayTeam,
                        homeScore,
                        awayScore,
                        resultScore: `${homeScore}-${awayScore}`
                    });
                }
            });
        });

        // Fallback: If no headers found, try scraping all rows and inferring league (less reliable)
        if (results.length === 0) {
            console.log('No league headers found, attempting broad row scrape...');
            $('tr').each((_, row) => {
                const $row = $(row);
                const homeTeam = $row.find('span[id*="_gevsahibi"]').text().trim();
                const awayTeam = $row.find('span[id*="_gmisafir"], span[id*="_gdeplasman"]').text().trim();
                const homeScoreStr = $row.find('span[id*="_gseta"]').text().trim();
                const awayScoreStr = $row.find('span[id*="_gsetb"], span[id*="_gsetd"]').text().trim();

                if (homeTeam && awayTeam && homeScoreStr !== '' && awayScoreStr !== '') {
                    // Find nearest preceding league header if possible
                    let leagueName = "Unknown League";
                    const prevHeader = $row.closest('table').prevAll('.tvf-fixture-league-header').first();
                    if (prevHeader.length) leagueName = prevHeader.text().trim();

                    results.push({
                        league: leagueName,
                        homeTeam,
                        awayTeam,
                        homeScore: parseInt(homeScoreStr),
                        awayScore: parseInt(awayScoreStr),
                        resultScore: `${homeScoreStr}-${awayScoreStr}`
                    });
                }
            });
        }

        return results;
    } catch (error) {
        console.error('Error in fetchAllLeagueResults:', error);
        return [];
    }
}

async function syncToDatabaseAndLocal(results: MatchResult[]) {
    const supabase = createServiceRoleClient();
    let synced = 0;
    const localUpdates: Record<string, number> = { vsl: 0, '1lig': 0, '2lig': 0 };

    // Group results by our internal league keys
    const leagueMapping: Record<string, string> = {
        'vsl': 'Sultanlar Ligi',
        '1lig': '1. Lig',
        '2lig': '2. Lig'
    };

    const reverseMapping: Record<string, string> = {
        'Vodafone Sultanlar Ligi': 'vsl',
        'KADINLAR 1. LİG': '1lig',
        'KADINLAR 2. LİG': '2lig',
        'Sultanlar Ligi': 'vsl' // Catch-all variations
    };

    // Helper to find our internal league key from TVF name
    const findInternalKey = (tvfLeague: string) => {
        const upper = tvfLeague.toUpperCase();
        if (upper.includes('SULTANLAR')) return 'vsl';
        if (upper.includes('1. LİG') || upper.includes('1.LİG')) return '1lig';
        if (upper.includes('2. LİG') || upper.includes('2.LİG')) return '2lig';
        return null;
    };

    const dataFiles: Record<string, string> = {
        'vsl': 'vsl-data.json',
        '1lig': '1lig-data.json',
        '2lig': 'tvf-data.json'
    };

    for (const res of results) {
        const internalKey = findInternalKey(res.league);
        if (!internalKey) continue;

        // 1. Database Sync (Persistent)
        const dbLeagueName = leagueMapping[internalKey];
        try {
            const { error } = await supabase
                .from('match_results')
                .upsert({
                    league: dbLeagueName,
                    home_team: res.homeTeam,
                    away_team: res.awayTeam,
                    result_score: res.resultScore,
                    is_verified: true,
                    updated_at: new Date().toISOString()
                }, {
                    onConflict: 'league,home_team,away_team'
                });

            if (!error) synced++;
        } catch (e) {
            console.error(`DB Sync Error for ${res.homeTeam}:`, e);
        }

        // 2. Local File Update (Dev Mode)
        try {
            const fileName = dataFiles[internalKey];
            const filePath = path.join(process.cwd(), 'data', fileName);
            if (fs.existsSync(filePath)) {
                const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                let fileModified = false;

                const fixture = data.fixture || data.matches;
                if (fixture && Array.isArray(fixture)) {
                    for (const match of fixture) {
                        if (match.homeTeam.toUpperCase() === res.homeTeam.toUpperCase() &&
                            match.awayTeam.toUpperCase() === res.awayTeam.toUpperCase() &&
                            !match.isPlayed) {
                            match.isPlayed = true;
                            match.homeScore = res.homeScore;
                            match.awayScore = res.awayScore;
                            match.resultScore = res.resultScore;
                            fileModified = true;
                            localUpdates[internalKey]++;
                        }
                    }
                }

                if (fileModified) {
                    data.lastUpdated = new Date().toISOString();
                    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                }
            }
        } catch (e) {
            // Ignore write errors in Vercel environment
        }
    }

    return { synced, localUpdates };
}

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;
        const vercelCron = request.headers.get('x-vercel-cron');

        if (cronSecret && authHeader !== `Bearer ${cronSecret}` && !vercelCron) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        console.log('Starting results sync via TVF Takvim...');
        const startTime = Date.now();

        const allResults = await fetchAllLeagueResults();
        console.log(`Fetched ${allResults.length} total matches from Takvim`);

        const syncStats = await syncToDatabaseAndLocal(allResults);

        const duration = Date.now() - startTime;

        return NextResponse.json({
            success: true,
            duration: `${duration}ms`,
            timestamp: new Date().toISOString(),
            fetchedCount: allResults.length,
            syncedCount: syncStats.synced,
            localUpdates: syncStats.localUpdates,
            sampleLeagues: [...new Set(allResults.map(r => r.league))]
        });

    } catch (error: any) {
        console.error('Unified Cron job error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    return GET(request);
}
