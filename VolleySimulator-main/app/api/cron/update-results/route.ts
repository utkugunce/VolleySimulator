import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Cron job endpoint - runs daily at 08:00 Turkey time
// Updates match results from TVF website

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Allow up to 60 seconds for scraping

interface MatchResult {
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    matchDate: string;
    groupName: string;
}

// 1. Lig TVF URL - Women's 1st League
const TVF_1LIG_URL = "https://fikstur.tvf.org.tr/PTW/MjAyNS0yMDI2/Sw%3D%3D/MUxL/S2FkxLFubGFyIDEuIExpZw%3D%3D";

// 2. Lig TVF URL - Women's 2nd League  
const TVF_2LIG_URL = "https://fikstur.tvf.org.tr/PTW/MjAyNS0yMDI2/Sw%3d%3d/MkxL/S2FkxLFubGFyIDIuIExpZw%3d%3d";

// VSL TVF URL - Vodafone Sultanlar Ligi
const TVF_VSL_URL = "https://fikstur.tvf.org.tr/FSW/MjAyNS0yMDI2/Sw%3d%3d/U1VMVEFOTEFS/Vm9kYWZvbmUgU3VsdGFubGFyIExpZ2k%3d";

async function fetchTVFResults(url: string): Promise<MatchResult[]> {
    try {
        // TVF uses server-side rendered pages, we can try to fetch HTML
        // Note: If this doesn't work due to JavaScript rendering, we'll need
        // to fall back to GitHub Actions with Puppeteer

        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
            },
            next: { revalidate: 0 }
        });

        if (!response.ok) {
            console.log(`TVF fetch failed with status: ${response.status}`);
            return [];
        }

        const html = await response.text();

        // Parse HTML to extract match results
        // This is a simplified parser - TVF's actual HTML structure may differ
        const results: MatchResult[] = [];

        // Look for match result patterns in HTML
        // Format varies by TVF page structure
        const matchPattern = /gevsahibi.*?>(.*?)<.*?gmisafir.*?>(.*?)<.*?gseta.*?>([\d])<.*?gsetb.*?>([\d])</gi;
        let match;

        while ((match = matchPattern.exec(html)) !== null) {
            const homeTeam = match[1].trim();
            const awayTeam = match[2].trim();
            const homeScore = parseInt(match[3]);
            const awayScore = parseInt(match[4]);

            if (homeTeam && awayTeam && !isNaN(homeScore) && !isNaN(awayScore)) {
                results.push({
                    homeTeam,
                    awayTeam,
                    homeScore,
                    awayScore,
                    matchDate: new Date().toISOString().split('T')[0],
                    groupName: ''
                });
            }
        }

        return results;
    } catch (error) {
        console.error('Error fetching TVF results:', error);
        return [];
    }
}

function updateDataFile(filePath: string, newResults: MatchResult[]): number {
    try {
        if (!fs.existsSync(filePath)) {
            console.log(`Data file not found: ${filePath}`);
            return 0;
        }

        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const data = JSON.parse(fileContent);

        let updatedCount = 0;

        if (data.fixture && Array.isArray(data.fixture)) {
            for (const match of data.fixture) {
                // Find matching result
                const result = newResults.find(r =>
                    r.homeTeam === match.homeTeam &&
                    r.awayTeam === match.awayTeam
                );

                if (result && !match.isPlayed) {
                    match.isPlayed = true;
                    match.homeScore = result.homeScore;
                    match.awayScore = result.awayScore;
                    match.resultScore = `${result.homeScore}-${result.awayScore}`;
                    updatedCount++;
                }
            }

            // Recalculate team standings
            if (updatedCount > 0) {
                recalculateStandings(data);
            }

            // Update timestamp
            data.lastUpdated = new Date().toISOString();

            // Write back to file
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
        }

        return updatedCount;
    } catch (error) {
        console.error(`Error updating data file ${filePath}:`, error);
        return 0;
    }
}

function recalculateStandings(data: any): void {
    if (!data.teams || !data.fixture) return;

    // Reset all team stats
    for (const team of data.teams) {
        team.played = 0;
        team.wins = 0;
        team.points = 0;
        team.setsWon = 0;
        team.setsLost = 0;
    }

    // Recalculate from all played matches
    for (const match of data.fixture) {
        if (!match.isPlayed) continue;

        const homeTeam = data.teams.find((t: any) => t.name === match.homeTeam);
        const awayTeam = data.teams.find((t: any) => t.name === match.awayTeam);

        if (!homeTeam || !awayTeam) continue;

        const homeScore = match.homeScore ?? 0;
        const awayScore = match.awayScore ?? 0;

        // Update games played
        homeTeam.played++;
        awayTeam.played++;

        // Update sets
        homeTeam.setsWon += homeScore;
        homeTeam.setsLost += awayScore;
        awayTeam.setsWon += awayScore;
        awayTeam.setsLost += homeScore;

        // Calculate points (3-0 or 3-1 = 3pts winner, 0 loser; 3-2 = 2pts winner, 1pt loser)
        if (homeScore > awayScore) {
            homeTeam.wins++;
            if (awayScore < 2) {
                homeTeam.points += 3;
            } else {
                homeTeam.points += 2;
                awayTeam.points += 1;
            }
        } else {
            awayTeam.wins++;
            if (homeScore < 2) {
                awayTeam.points += 3;
            } else {
                awayTeam.points += 2;
                homeTeam.points += 1;
            }
        }
    }
}

export async function GET(request: NextRequest) {
    try {
        // Verify cron secret for security
        const authHeader = request.headers.get('authorization');
        const cronSecret = process.env.CRON_SECRET;

        // In production, always check the secret
        // Vercel automatically adds the secret for cron jobs
        if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
            // Also check for Vercel's internal cron header
            const vercelCron = request.headers.get('x-vercel-cron');
            if (!vercelCron) {
                return NextResponse.json(
                    { error: 'Unauthorized' },
                    { status: 401 }
                );
            }
        }

        console.log('Starting daily match results update...');
        const startTime = Date.now();

        const dataDir = path.join(process.cwd(), 'data');

        // Fetch results from TVF
        console.log('Fetching VSL results...');
        const resultsVSL = await fetchTVFResults(TVF_VSL_URL);

        console.log('Fetching 1. Lig results...');
        const results1Lig = await fetchTVFResults(TVF_1LIG_URL);

        console.log('Fetching 2. Lig results...');
        const results2Lig = await fetchTVFResults(TVF_2LIG_URL);

        // Update data files
        let updatedVSL = 0;
        let updated1Lig = 0;
        let updated2Lig = 0;

        if (resultsVSL.length > 0) {
            const fileVSL = path.join(dataDir, 'vsl-data.json');
            updatedVSL = updateDataFile(fileVSL, resultsVSL);
            console.log(`Updated ${updatedVSL} matches in VSL`);
        }

        if (results1Lig.length > 0) {
            const file1Lig = path.join(dataDir, '1lig-data.json');
            updated1Lig = updateDataFile(file1Lig, results1Lig);
            console.log(`Updated ${updated1Lig} matches in 1. Lig`);
        }

        if (results2Lig.length > 0) {
            const file2Lig = path.join(dataDir, 'tvf-data.json');
            updated2Lig = updateDataFile(file2Lig, results2Lig);
            console.log(`Updated ${updated2Lig} matches in 2. Lig`);
        }

        const duration = Date.now() - startTime;

        const response = {
            success: true,
            message: 'Daily update completed',
            timestamp: new Date().toISOString(),
            duration: `${duration}ms`,
            results: {
                'vsl': {
                    fetched: resultsVSL.length,
                    updated: updatedVSL
                },
                '1lig': {
                    fetched: results1Lig.length,
                    updated: updated1Lig
                },
                '2lig': {
                    fetched: results2Lig.length,
                    updated: updated2Lig
                }
            }
        };

        console.log('Update completed:', response);

        return NextResponse.json(response);

    } catch (error: any) {
        console.error('Cron job error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Unknown error',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}

// Also allow POST for manual triggers
export async function POST(request: NextRequest) {
    return GET(request);
}
