/**
 * VSL (Vodafone Sultanlar Ligi) Scraper
 * Fetches match results from Volleystation
 * Source: https://sultanlar.volleystation.com/tr/schedule/
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const VSL_URL = 'https://sultanlar.volleystation.com/tr/schedule/';

async function scrapeVSL() {
    console.log('Starting VSL scrape from Volleystation...');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

        console.log('Navigating to Volleystation...');
        await page.goto(VSL_URL, { waitUntil: 'networkidle2', timeout: 30000 });
        await page.waitForSelector('a[href*="/tr/matches/"]', { timeout: 10000 });

        // Extract match data
        const matchData = await page.evaluate(() => {
            const results = [];
            const matchLinks = document.querySelectorAll('a[href*="/tr/matches/"]');

            matchLinks.forEach(link => {
                try {
                    // Get team names
                    const teamElements = link.querySelectorAll('.name');
                    if (teamElements.length < 2) return;

                    const homeTeam = teamElements[0]?.innerText?.trim();
                    const awayTeam = teamElements[1]?.innerText?.trim();

                    // Get scores
                    const scoreElements = link.querySelectorAll('.match-score .set-score');
                    let homeScore = null;
                    let awayScore = null;

                    if (scoreElements.length >= 2) {
                        homeScore = parseInt(scoreElements[0]?.innerText?.trim()) || null;
                        awayScore = parseInt(scoreElements[1]?.innerText?.trim()) || null;
                    }

                    // Get date from parent container
                    let matchDate = null;
                    let dateElement = link.closest('.day-group')?.querySelector('.day-label');
                    if (dateElement) {
                        const dateText = dateElement.innerText.trim();
                        // Parse Turkish date format: "3 Ocak 2026, Cumartesi"
                        const months = {
                            'Ocak': '01', 'Şubat': '02', 'Mart': '03', 'Nisan': '04',
                            'Mayıs': '05', 'Haziran': '06', 'Temmuz': '07', 'Ağustos': '08',
                            'Eylül': '09', 'Ekim': '10', 'Kasım': '11', 'Aralık': '12'
                        };
                        const match = dateText.match(/(\d{1,2})\s+(\w+)\s+(\d{4})/);
                        if (match) {
                            const day = match[1].padStart(2, '0');
                            const month = months[match[2]] || '01';
                            const year = match[3];
                            matchDate = `${year}-${month}-${day}`;
                        }
                    }

                    // Get round info
                    const roundBox = link.querySelector('.round-box');
                    const roundText = roundBox?.innerText?.trim() || '';
                    const weekMatch = roundText.match(/Round\s*(\d+)/i);
                    const week = weekMatch ? parseInt(weekMatch[1]) : null;

                    // Get location
                    const locationBox = link.querySelector('.location-box');
                    const venue = locationBox?.innerText?.trim() || '';

                    if (homeTeam && awayTeam) {
                        results.push({
                            homeTeam,
                            awayTeam,
                            homeScore,
                            awayScore,
                            matchDate,
                            week,
                            venue,
                            isPlayed: homeScore !== null && awayScore !== null
                        });
                    }
                } catch (e) {
                    console.error('Error parsing match:', e);
                }
            });

            return results;
        });

        console.log(`Found ${matchData.length} matches`);

        // Update vsl-data.json
        const dataPath = path.join(process.cwd(), 'data', 'vsl-data.json');
        const vslData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

        let updatedCount = 0;

        matchData.forEach(scraped => {
            if (!scraped.isPlayed) return;

            // Find matching fixture
            const fixture = vslData.fixture.find(f =>
                f.homeTeam === scraped.homeTeam &&
                f.awayTeam === scraped.awayTeam &&
                !f.isPlayed
            );

            if (fixture) {
                fixture.homeScore = scraped.homeScore;
                fixture.awayScore = scraped.awayScore;
                fixture.isPlayed = true;
                updatedCount++;
                console.log(`Updated: ${scraped.homeTeam} ${scraped.homeScore}-${scraped.awayScore} ${scraped.awayTeam}`);
            }
        });

        // Recalculate standings
        const teamsMap = {};
        vslData.teams.forEach(t => {
            teamsMap[t.name] = { ...t, played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0 };
        });

        vslData.fixture.forEach(m => {
            if (m.isPlayed && m.homeScore !== null && m.awayScore !== null) {
                const h = teamsMap[m.homeTeam];
                const a = teamsMap[m.awayTeam];

                if (h && a) {
                    h.played++;
                    a.played++;
                    h.setsWon += m.homeScore;
                    h.setsLost += m.awayScore;
                    a.setsWon += m.awayScore;
                    a.setsLost += m.homeScore;

                    if (m.homeScore > m.awayScore) {
                        h.wins++;
                        h.points += (m.awayScore < 2 ? 3 : 2);
                        a.points += (m.awayScore === 2 ? 1 : 0);
                    } else {
                        a.wins++;
                        a.points += (m.homeScore < 2 ? 3 : 2);
                        h.points += (m.homeScore === 2 ? 1 : 0);
                    }
                }
            }
        });

        vslData.teams = Object.values(teamsMap);
        vslData.lastUpdated = new Date().toISOString();

        fs.writeFileSync(dataPath, JSON.stringify(vslData, null, 2));
        console.log(`Updated ${updatedCount} matches in vsl-data.json`);

        return { success: true, updated: updatedCount };

    } finally {
        await browser.close();
    }
}

scrapeVSL().catch(console.error);
