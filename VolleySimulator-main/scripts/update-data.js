const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const TVF_URL = "https://fikstur.tvf.org.tr/PTW/MjAyNS0yMDI2/Sw%3d%3d/MkxL/S2FkxLFubGFyIDIuIExpZw%3d%3d";
const DATA_DIR = path.join(__dirname, '../data');
const DATA_FILE = path.join(DATA_DIR, 'tvf-data.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);

const SELECTORS = {
    standingsRows: [
        '#icerik_PuanTablosu_gvliste3S tr',
        '.puan-tablosu tbody tr',
        '[data-standings] tr',
        'table[id*="PuanTablosu"] tr'
    ],
    fixtureRows: [
        '#icerik_FiksturSonuclu_gvmusabakaliste tr',
        'table[id*="Fikstur"] tr',
        '.fikstur-tablosu tbody tr'
    ]
};

async function getElementBySelectors(page, selectors) {
    for (const selector of selectors) {
        const el = await page.$(selector);
        if (el) return selector;
    }
    return null;
}

async function scrapeGroup(page, groupIndex) {
    // Retry logic wrapper for the whole group scrape if needed, but per-element is better inside evaluate

    return await page.evaluate((groupIndex, SELECTORS) => {
        const teams = [];
        const fixture = [];
        const groupName = (groupIndex + 1) + ". GRUP";

        // Helper to find elements with multiple selectors
        const queryAll = (selectors) => {
            for (const s of selectors) {
                const els = document.querySelectorAll(s);
                if (els.length > 0) return Array.from(els);
            }
            return [];
        };

        // 1. Standings
        const standingsRows = queryAll(SELECTORS.standingsRows);
        standingsRows.forEach((row, i) => {
            if (i === 0) return; // Skip header

            const nameEl = row.querySelector('[id*="_gtakimadi_"]');
            if (nameEl) {
                const name = nameEl.innerText.trim();
                const played = parseInt(row.querySelector('[id*="_gO_"]')?.innerText) || 0;
                const wins = parseInt(row.querySelector('[id*="_gG_"]')?.innerText) || 0;
                const points = parseInt(row.querySelector('[id*="_gP_"]')?.innerText) || 0;
                const setsWon = parseInt(row.querySelector('[id*="_gA_"]')?.innerText) || 0;
                const setsLost = parseInt(row.querySelector('[id*="_gV_"]')?.innerText) || 0;

                teams.push({
                    name,
                    groupName,
                    played,
                    wins,
                    points,
                    setsWon,
                    setsLost,
                    setRatio: setsLost === 0 ? (setsWon > 0 ? Infinity : 0) : setsWon / setsLost
                });
            }
        });

        // 2. Fixture
        const fixtureRows = queryAll(SELECTORS.fixtureRows);

        fixtureRows.forEach(row => {
            const homeEl = row.querySelector('[id*="_gevsahibi_"]');
            const awayEl = row.querySelector('[id*="_gmisafir_"]');

            if (homeEl && awayEl) {
                const homeTeam = homeEl.innerText.trim();
                const awayTeam = awayEl.innerText.trim();

                let homeScoreText = row.querySelector('[id*="_gseta_"]')?.innerText?.trim();
                let awayScoreText = row.querySelector('[id*="_gsetb_"]')?.innerText?.trim();


                // Alternative: Look for score in a cell with specific patterns
                if (!homeScoreText || !awayScoreText) {
                    // Try finding cells with just numbers (0-3)
                    const allCells = Array.from(row.querySelectorAll('td'));
                    const scoreCells = allCells.filter(td => /^[0-3]$/.test(td.innerText.trim()));
                    if (scoreCells.length >= 2) {
                        homeScoreText = scoreCells[0]?.innerText?.trim();
                        awayScoreText = scoreCells[1]?.innerText?.trim();
                    }
                }

                // Alternative: Look for span/label with gSonuc pattern
                if (!homeScoreText || homeScoreText === '') {
                    homeScoreText = row.querySelector('[id*="_gSonucA_"]')?.innerText?.trim()
                        || row.querySelector('[id*="_lSeta_"]')?.innerText?.trim()
                        || row.querySelector('[id*="_setSkor1_"]')?.innerText?.trim();
                }
                if (!awayScoreText || awayScoreText === '') {
                    awayScoreText = row.querySelector('[id*="_gSonucB_"]')?.innerText?.trim()
                        || row.querySelector('[id*="_lSetb_"]')?.innerText?.trim()
                        || row.querySelector('[id*="_setSkor2_"]')?.innerText?.trim();
                }

                const homeScore = parseInt(homeScoreText);
                const awayScore = parseInt(awayScoreText);
                const isPlayed = !isNaN(homeScore) && !isNaN(awayScore) && (homeScore > 0 || awayScore > 0);

                let matchDate = null;
                const dateEl = row.querySelector('[id*="_gtarih_"]')
                    || row.querySelector('[id*="_gTarih_"]')
                    || row.querySelector('[id*="_lTarih_"]');
                if (dateEl) {
                    matchDate = dateEl.innerText?.trim() || null;
                }
                if (!matchDate) {
                    const allCells = Array.from(row.querySelectorAll('td'));
                    for (const cell of allCells) {
                        const text = cell.innerText?.trim();
                        if (text && /^\d{2}[\.\/]\d{2}[\.\/]\d{4}$/.test(text)) {
                            matchDate = text;
                            break;
                        }
                    }
                }

                if (homeTeam && awayTeam) {
                    fixture.push({
                        homeTeam,
                        awayTeam,
                        groupName,
                        isPlayed,
                        resultScore: isPlayed ? `${homeScore}-${awayScore}` : undefined,
                        matchDate
                    });
                }
            }
        });

        return { teams, fixture };
    }, groupIndex, SELECTORS);
}

async function main() {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set viewport large enough to see everything
    await page.setViewport({ width: 1280, height: 800 });

    try {
        console.log('Opening TVF Page...');
        await page.goto(TVF_URL, { waitUntil: 'networkidle0', timeout: 60000 });

        const allTeams = [];
        const allFixtures = [];

        // Loop through 16 groups (indices 0 to 15)
        for (let i = 0; i < 16; i++) {
            console.log(`Processing Group ${i + 1}/16...`);

            // The button ID pattern
            const buttonSelector = `#icerik_RptGrp_GrpBtn_${i}`;

            // Special handling: The first group is loaded by default, but we should click the button to be sure 
            // OR just scrape if it's already active.
            // However, clicking guarantees we are on the right tab if logic changes.
            // IMPORTANT: After clicking, we must wait for the postback.

            // Check if button exists
            const btn = await page.$(buttonSelector);
            if (!btn) {
                console.log(`Button for group ${i + 1} not found, skipping or likely end of list.`);
                continue;
            }

            await Promise.all([
                page.click(buttonSelector),
                page.waitForNavigation({ waitUntil: 'networkidle0' }).catch(e => console.log('Navigation wait timeout or page updated via AJAX (handled below)'))
            ]);

            // ASP.NET postbacks often don't trigger full navigation but partial updates.
            // We wait for the specific table to be visible/stable.
            await new Promise(r => setTimeout(r, 2000)); // Safety wait for DOM update

            const groupData = await scrapeGroup(page, i);
            allTeams.push(...groupData.teams);
            allFixtures.push(...groupData.fixture);

            console.log(`  -> Found ${groupData.teams.length} teams.`);
        }

        const data = {
            updatedAt: new Date().toISOString(),
            teams: allTeams,
            fixture: allFixtures
        };

        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
        console.log(`\nSuccess! Saved to ${DATA_FILE}`);
        console.log(`Total Teams: ${allTeams.length}, Total Matches: ${allFixtures.length}`);

    } catch (error) {
        console.error('Fatal Error:', error);
    } finally {
        await browser.close();
    }
}

main();
