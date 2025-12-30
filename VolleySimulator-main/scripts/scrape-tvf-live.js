const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const LEAGUES = [
    {
        name: '1lig',
        url: 'https://fikstur.tvf.org.tr/FSW/MjAyNS0yMDI2/Sw%3d%3d/MUxL/QXJhYmljYSBDb2ZmZWUgSG91c2UgS2FkxLFubGFyIFZvbGV5Ym9sIDEuTGlnaQ%3d%3d',
        groups: ['A. Grup', 'B. Grup'], // Indices 0, 1
        outputFile: '1lig-data.json'
    },
    {
        name: '2lig',
        url: 'https://fikstur.tvf.org.tr/FSW/MjAyNS0yMDI2/Sw%3d%3d/MkxL/S2FkxLFubGFyIDIuIExpZw%3d%3d',
        // Groups 1-16 correspond to button indices 0-15
        groups: Array.from({ length: 16 }, (_, i) => `${i + 1}. GRUP`),
        outputFile: '2lig-data.json'
    }
];

async function scrapeLeague(browser, leagueConfig) {
    console.log(`Starting scrape for ${leagueConfig.name}...`);
    const page = await browser.newPage();

    // Set viewport explicitly
    await page.setViewport({ width: 1280, height: 800 });

    try {
        await page.goto(leagueConfig.url, { waitUntil: 'networkidle2', timeout: 60000 });

        const allMatches = [];
        const allTeams = new Set(); // To collect unique team names for "teams" array

        // Iterate through groups
        for (let i = 0; i < leagueConfig.groups.length; i++) {
            const groupName = leagueConfig.groups[i];
            console.log(`Processing ${groupName} (Index ${i})...`);

            // Find the button for the group
            const buttonSelector = `input[id*="_GrpBtn_${i}"]`;

            // If it's not the first group, we need to click. 
            // Even for the first group, clicking ensures we are in the right state, 
            // but usually page loads with first group (Index 0).
            // However, the buttons might cause a postback.

            // Wait for button
            try {
                await page.waitForSelector(buttonSelector, { timeout: 5000 });
            } catch (e) {
                console.log(`Button for index ${i} not found, skipping group.`);
                continue;
            }

            // Click and wait for update
            // We need to detect when the table updates. We can look for a loading indicator or just wait.
            // TVF uses UpdatePanel.

            const tableSelector = '.sp-league-table';

            // Store current table content to check for change later? 
            // Or easier: strictly wait networkidle or a fixed delay.
            if (i > 0 || (i === 0 && leagueConfig.name === '2lig')) { // Usually index 0 receives focus on load, but explicit click is safer
                await Promise.all([
                    page.click(buttonSelector),
                    // There isn't a navigation, just an AJAX update.
                    // waiting for a short period is often robust enough for these ASP.NET panels if we don't have a specific element to appear
                    new Promise(r => setTimeout(r, 3000))
                ]);
            } else {
                // For the very first group on page load, we might not need to click, but let's wait a bit to be sure
                await new Promise(r => setTimeout(r, 1000));
            }

            // Scrape table
            const matches = await page.evaluate((grpName) => {
                const rows = Array.from(document.querySelectorAll('.sp-league-table tr'));
                let currentWeek = 0;
                const groupMatches = [];

                rows.forEach(row => {
                    const text = row.innerText.trim();
                    if (text.startsWith('HAFTA :')) {
                        // "HAFTA : 1" -> extract 1
                        const parts = text.split(':');
                        if (parts.length > 1) {
                            currentWeek = parseInt(parts[1].trim());
                        }
                    } else if (row.classList.contains('grRowStyle') || row.classList.contains('altRowStyle')) {
                        // Determine IDs safely
                        const getVal = (selector) => {
                            const el = row.querySelector(selector);
                            return el ? el.innerText.trim() : '';
                        };

                        const date = getVal('span[id*="_gtarih_"]'); // DD.MM.YYYY
                        const time = getVal('span[id*="_gsaat_"]');
                        const home = getVal('span[id*="_gevsahibi_"]');
                        const away = getVal('span[id*="_gmisafir_"]');
                        const scoreHome = getVal('span[id*="_gseta_"]');
                        const scoreAway = getVal('span[id*="_gsetb_"]');
                        const sets = getVal('span[id*="_gsetsonuclari_"]'); // (25-20) (25-18)...
                        const venue = getVal('span[id*="_gyer_"]');

                        // Parse Date DD.MM.YYYY -> YYYY-MM-DD
                        let isoDate = '';
                        if (date && date.includes('.')) {
                            const [d, m, y] = date.split('.');
                            isoDate = `${y}-${m}-${d}`;
                        } else {
                            // Try to handle or leave empty
                            isoDate = date;
                        }

                        // Determine if played
                        const isPlayed = scoreHome !== '' && scoreAway !== '';
                        const resultScore = isPlayed ? `${scoreHome}-${scoreAway}` : undefined;

                        groupMatches.push({
                            id: Math.floor(Math.random() * 1000000), // Temp ID
                            matchNo: `${grpName}-W${currentWeek}-${home}-${away}`.replace(/\s+/g, ''),
                            date: isoDate, // Keeping original JSON field name "date" for compatibility
                            matchTime: time,
                            week: currentWeek,
                            groupName: grpName,
                            homeTeam: home,
                            awayTeam: away,
                            homeScore: isPlayed ? parseInt(scoreHome) : undefined,
                            awayScore: isPlayed ? parseInt(scoreAway) : undefined,
                            isPlayed: isPlayed,
                            resultScore: resultScore,
                            setResults: sets,
                            venue: venue
                        });
                    }
                });
                return groupMatches;
            }, groupName);

            console.log(`  Found ${matches.length} matches in ${groupName}.`);
            allMatches.push(...matches);

            // Collect teams
            matches.forEach(m => {
                allTeams.add(JSON.stringify({ name: m.homeTeam, groupName: m.groupName }));
                allTeams.add(JSON.stringify({ name: m.awayTeam, groupName: m.groupName }));
            });
        }

        // Calculate Standings from Fixture
        const teamsMap = new Map();

        // Initialize teams map
        Array.from(allTeams).forEach(tStr => {
            const t = JSON.parse(tStr);
            teamsMap.set(t.name, {
                name: t.name,
                groupName: t.groupName,
                played: 0,
                wins: 0,
                points: 0,
                setsWon: 0,
                setsLost: 0
            });
        });

        // Process matches
        allMatches.forEach(match => {
            if (match.isPlayed && match.homeScore !== undefined && match.awayScore !== undefined) {
                const home = teamsMap.get(match.homeTeam);
                const away = teamsMap.get(match.awayTeam);

                if (home && away) {
                    home.played++;
                    away.played++;

                    home.setsWon += match.homeScore;
                    home.setsLost += match.awayScore;
                    away.setsWon += match.awayScore;
                    away.setsLost += match.homeScore;

                    if (match.homeScore > match.awayScore) {
                        home.wins++;
                        // Points calculation
                        if (match.homeScore === 3 && (match.awayScore === 0 || match.awayScore === 1)) {
                            home.points += 3;
                        } else if (match.homeScore === 3 && match.awayScore === 2) {
                            home.points += 2;
                            away.points += 1;
                        }
                    } else {
                        away.wins++;
                        if (match.awayScore === 3 && (match.homeScore === 0 || match.homeScore === 1)) {
                            away.points += 3;
                        } else if (match.awayScore === 3 && match.homeScore === 2) {
                            away.points += 2;
                            home.points += 1;
                        }
                    }
                }
            }
        });

        const teamsArray = Array.from(teamsMap.values());

        const output = {
            league: leagueConfig.name === '1lig' ? '1. Lig Kadınlar' : '2. Lig Kadınlar',
            season: '2025-2026',
            teams: teamsArray, // Note: These are empty stats!
            fixture: allMatches
        };

        const outputPath = path.join(__dirname, '..', 'data', leagueConfig.outputFile);
        fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
        console.log(`Saved data to ${leagueConfig.outputFile}`);

    } catch (err) {
        console.error(`Error scraping ${leagueConfig.name}:`, err);
    } finally {
        await page.close();
    }
}

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        for (const league of LEAGUES) {
            await scrapeLeague(browser, league);
        }
    } finally {
        await browser.close();
    }
})();
