
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const LEAGUES = {
    VSL: {
        url: 'https://fikstur.tvf.org.tr/FSW/MjAyNS0yMDI2/Sw%3d%3d/U1VMVEFOTEFS/Vm9kYWZvbmUgU3VsdGFubGFyIExpZ2k%3d',
        file: 'data/vsl-data.json'
    },
    ONE_LIG: {
        url: 'https://fikstur.tvf.org.tr/FSW/MjAyNS0yMDI2/Sw%3d%3d/MUxL/QXJhYmljYSBDb2ZmZWUgSG91c2UgS2FkxLFubGFyIFZvbGV5Ym9sIDEuTGlnaQ%3d%3d',
        file: 'data/1lig-data.json',
        groups: 2
    },
    TWO_LIG: {
        url: 'https://fikstur.tvf.org.tr/FSW/MjAyNS0yMDI2/Sw%3d%3d/MkxL/S2FkxLFubGFyIDIuIExpZw%3d%3d',
        file: 'data/2lig-data.json',
        groups: 16
    }
};

const TARGET_DATE = new Date('2026-01-05T21:55:00');

function normalize(name: string) {
    return name
        .replace(/İ/g, 'I')
        .replace(/ı/g, 'I')
        .toUpperCase()
        .replace(/\s+/g, '')
        .replace(/[^A-Z0-9]/g, '')
        .trim();
}

// Result determination
function getPoints(hSets: number, aSets: number) {
    if (hSets === 3) {
        if (aSets < 2) return { h: 3, a: 0, hWin: true };
        return { h: 2, a: 1, hWin: true };
    } else {
        if (hSets < 2) return { h: 0, a: 3, hWin: false };
        return { h: 1, a: 2, hWin: false };
    }
}

async function scrapeTable(page: any) {
    return page.evaluate(() => {
        const table = document.querySelector('.sp-table-wrapper table');
        if (!table) return [];
        const rows = Array.from(table.querySelectorAll('tr.grRowStyle, tr.grAlternatingRowStyle'));
        return rows.map(row => {
            const tds = Array.from(row.querySelectorAll('td')).map(td => td.innerText.trim());
            // Based on subagent findings:
            // 0: Date, 1: Time, 4: Home, 5: HScore, 6: AScore, 7: Away
            if (tds.length < 8) return null;
            return {
                date: tds[0],
                time: tds[1],
                home: tds[4],
                away: tds[7],
                homeScore: tds[5],
                awayScore: tds[6]
            };
        }).filter(m => m !== null);
    });
}

async function processLeague(browser: any, key: string, config: any) {
    console.log(`Processing ${key}...`);
    const page = await browser.newPage();
    // Block images/styles for speed
    await page.setRequestInterception(true);
    page.on('request', (req: any) => {
        if (['image', 'stylesheet', 'font'].includes(req.resourceType())) req.abort();
        else req.continue();
    });

    try {
        await page.goto(config.url, { waitUntil: 'domcontentloaded' });

        let scrapedMatches: any[] = [];

        if (config.groups) {
            for (let i = 0; i < config.groups; i++) {
                console.log(`  Scanning Group ${i + 1}...`);
                const btnId = `#icerik_RptGrp_GrpBtn_${i}`;

                // Click if not first group or ensure group is active
                if (i > 0 || config.groups > 0) {
                    // Try to find button
                    const btn = await page.$(btnId);
                    if (btn) {
                        try {
                            await Promise.all([
                                page.click(btnId),
                                page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 5000 }).catch(() => { }) // Wait for reload/ajax
                            ]);
                            // Wait a bit more for table update just in case
                            await new Promise(r => setTimeout(r, 1000));
                        } catch (e) { console.log(`Error clicking group ${i}:`, e); }
                    }
                }

                const groupMatches = await scrapeTable(page);
                scrapedMatches = [...scrapedMatches, ...groupMatches];
            }
        } else {
            scrapedMatches = await scrapeTable(page);
        }

        console.log(`  Scraped ${scrapedMatches.length} matches.`);

        // Sync with local file
        const filePath = path.resolve(process.cwd(), config.file);
        if (fs.existsSync(filePath)) {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let updates = 0;

            // Re-calc standings map
            // First reset standings to re-calculate based on fixture? 
            // Better to incrementally update ONLY if we are syncing unplayed games. 
            // But if previous games were wrong, we might duplicate.
            // Safe bet: find match in fixture, update it. Then RE-CALCULATE STANDINGS from scratch based on fixture.

            const fixtureMap = new Map();
            data.fixture.forEach((m: any) => {
                const id = normalize(m.homeTeam) + '-' + normalize(m.awayTeam);
                fixtureMap.set(id, m);
            });

            scrapedMatches.forEach((sm: any) => {
                const id = normalize(sm.home) + '-' + normalize(sm.away);
                const localMatch = fixtureMap.get(id);

                if (localMatch) {
                    const matchDate = new Date(sm.date.split('.').reverse().join('-') + 'T' + sm.time);

                    // Check if match is valid and happened
                    if (sm.homeScore && sm.awayScore && !isNaN(parseInt(sm.homeScore)) && !matchDate.isNaN) {
                        // Update score if different or not played
                        if (!localMatch.isPlayed || localMatch.homeScore !== parseInt(sm.homeScore) || localMatch.awayScore !== parseInt(sm.awayScore)) {
                            localMatch.isPlayed = true;
                            localMatch.homeScore = parseInt(sm.homeScore);
                            localMatch.awayScore = parseInt(sm.awayScore);
                            localMatch.resultScore = `${sm.homeScore}-${sm.awayScore}`;
                            updates++;
                        }
                    }
                }
            });

            if (updates > 0) {
                console.log(`  Updated ${updates} matches in JSON.`);

                // Recalculate Standings from scratch based on updated fixture
                const newTeamsMap = new Map();
                data.teams.forEach((t: any) => {
                    newTeamsMap.set(normalize(t.name), {
                        ...t,
                        played: 0, wins: 0, points: 0, setsWon: 0, setsLost: 0
                    });
                });

                data.fixture.forEach((m: any) => {
                    if (m.isPlayed) {
                        const ht = newTeamsMap.get(normalize(m.homeTeam));
                        const at = newTeamsMap.get(normalize(m.awayTeam));
                        if (ht && at) {
                            const outcome = getPoints(m.homeScore, m.awayScore);
                            ht.played++; at.played++;
                            ht.setsWon += m.homeScore; ht.setsLost += m.awayScore;
                            at.setsWon += m.awayScore; at.setsLost += m.homeScore;
                            ht.points += outcome.h; at.points += outcome.a;
                            if (outcome.hWin) ht.wins++; else at.wins++;
                        }
                    }
                });

                // Sort Standings (Wins, Points, Ratio)
                data.teams = Array.from(newTeamsMap.values()).sort((a: any, b: any) => {
                    if (b.wins !== a.wins) return b.wins - a.wins;
                    if (b.points !== a.points) return b.points - a.points;
                    const ratioA = a.setsWon / (a.setsLost || 1);
                    const ratioB = b.setsWon / (b.setsLost || 1);
                    return ratioB - ratioA;
                });

                fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
                console.log(`  Saved updated ${config.file}`);
            } else {
                console.log(`  No updates needed for ${config.file}`);
            }
        }

    } catch (e) {
        console.error(`Error in ${key}:`, e);
    } finally {
        await page.close();
    }
}

async function main() {
    const browser = await puppeteer.launch({ headless: true });
    try {
        await processLeague(browser, 'VSL', LEAGUES.VSL);
        await processLeague(browser, 'ONE_LIG', LEAGUES.ONE_LIG);
        await processLeague(browser, 'TWO_LIG', LEAGUES.TWO_LIG);
    } catch (e) {
        console.error(e);
    } finally {
        await browser.close();
    }
}

main();
