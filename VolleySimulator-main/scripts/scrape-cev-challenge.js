const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const URL = 'https://www.cev.eu/club/volleyball-challenge-cup/2026/women/';
const OUTPUT_FILE = 'cev-challenge-cup-data.json';

async function scrapeCEVChallenge() {
    console.log('Starting CEV Challenge Cup Scraper...');
    const browser = await puppeteer.launch({
        headless: true, // Set to false for debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();

    // Bridge console logs from browser to node
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));

    // Helper to scrape matches visible on the current view
    const scrapeVisibleMatches = async (phaseName) => {
        return page.evaluate((phase) => {
            const matches = [];
            // CEV consistently uses these classes for match lists
            const matchElements = document.querySelectorAll('.c-match-summary');

            matchElements.forEach(el => {
                const teams = el.querySelectorAll('.c-match-summary__teamSummary');
                if (teams.length < 2) return;

                // Clean team names (remove newlines and country codes)
                const cleanName = (name) => name.split('\n')[0].trim();
                const homeTeam = cleanName(teams[0].innerText);
                const awayTeam = cleanName(teams[1].innerText);

                if (matches.length === 0) {
                    // console.log('DEBUG: First match HTML:', el.innerHTML);
                }

                const scoreEl = el.querySelector('.c-match-summary__score');
                const scoreText = scoreEl ? scoreEl.innerText.trim() : '';

                // Score parsing: Prioritize regex on main text as structure varies
                // Format: "3 - 0 (25-19, ...)"
                let homeScore = 0;
                let awayScore = 0;
                let isPlayed = false;

                // Regex for Match Score (single digit sets usually)
                // We look for "N - M" where N, M are typically 0-3 (sometimes up to 5 if rules differ)
                const scoreRegex = /(\d)\s*-\s*(\d)/;
                let match = scoreText ? scoreText.match(scoreRegex) : null;

                // Fallback to full text if specific element empty
                if (!match) {
                    match = el.innerText.match(scoreRegex);
                }

                if (match) {
                    const h = parseInt(match[1]);
                    const a = parseInt(match[2]);
                    // Basic validation: Sets won in volleyball are usually 0, 1, 2, 3
                    // (Golden set might display differently, but match score is sets)
                    if (h <= 5 && a <= 5) {
                        homeScore = h;
                        awayScore = a;
                        isPlayed = true;
                    }
                }

                // Extract sets
                const setsEl = el.querySelector('.c-match-summary__sets');
                const sets = setsEl ? setsEl.innerText.trim() : '';

                // Extract Date/Time/Info
                const infoEl = el.querySelector('.c-match-summary__info');
                const infoText = infoEl ? infoEl.innerText.trim() : '';
                // Info text format varies: "12/10/2025 19:00 - Match CHCW 31"

                // Extract Match ID if present (e.g. CHCW 01)
                const matchIdCoords = infoText.match(/CHCW\s+(\d+)/);
                const matchId = matchIdCoords ? `CHCW ${matchIdCoords[1]}` : null;

                // Simple date parsing attempt (DD/MM/YYYY)
                const dateMatch = infoText.match(/(\d{2})\/(\d{2})\/(\d{4})/);
                let date = null;
                if (dateMatch) {
                    date = `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`;
                }

                // Golden Set detection
                // Sometimes it's a separate match entry or a note. 
                // For now we look for "Golden Set" text in the element
                const isGoldenSet = el.innerText.includes('Golden Set');

                matches.push({
                    phase: phase,
                    matchId,
                    date,
                    homeTeam,
                    awayTeam,
                    score: isPlayed ? `${homeScore}-${awayScore}` : null,
                    sets,
                    isPlayed,
                    isGoldenSet
                });
            });
            return matches;
        }, phaseName);
    };

    try {
        await page.goto(URL, { waitUntil: 'networkidle2', timeout: 60000 });

        // Accept Cookies if popup appears
        try {
            // Common selectors for cookie banners
            const cookieBtn = await page.$('#onetrust-accept-btn-handler');
            if (cookieBtn) await cookieBtn.click();
        } catch (e) { /* ignore */ }

        const allData = {
            lastUpdated: new Date().toISOString(),
            phases: []
        };

        // 1. Qualification Rounds
        console.log('Scraping Qualification Rounds...');
        // Usually the default tab or first one
        // Wait for matches to load
        await page.waitForSelector('.c-match-summary', { timeout: 10000 });
        const qualMatches = await scrapeVisibleMatches('Qualification Rounds');
        allData.phases.push({ name: 'Qualification Rounds', matches: qualMatches });

        // 2. Main Round
        console.log('Switching to Main Round...');
        // Need to click the tab. Text might be "Main Round"
        // Tabs often have IDs like #main-round or similar logic. 
        // Based on analysis: ID might be involved. Let's try text-based click for robustness
        const mainRoundClicked = await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('a, li, button'));
            const tab = tabs.find(t => t.innerText && t.innerText.trim().toUpperCase() === 'MAIN ROUND');
            if (tab) {
                tab.click();
                return true;
            }
            return false;
        });

        if (mainRoundClicked) {
            await new Promise(r => setTimeout(r, 2000)); // Wait for render
            const mainMatches = await scrapeVisibleMatches('Main Round');
            allData.phases.push({ name: 'Main Round', matches: mainMatches });
        } else {
            console.warn('Could not find Main Round tab');
        }

        // 3. Final Phase
        console.log('Switching to Final Phase...');
        const finalPhaseClicked = await page.evaluate(() => {
            const tabs = Array.from(document.querySelectorAll('a, li, button'));
            const tab = tabs.find(t => t.innerText && t.innerText.trim().toUpperCase() === 'FINAL PHASE');
            if (tab) {
                tab.click();
                return true;
            }
            return false;
        });

        if (finalPhaseClicked) {
            await new Promise(r => setTimeout(r, 2000));
            const finalMatches = await scrapeVisibleMatches('Final Phase');
            allData.phases.push({ name: 'Final Phase', matches: finalMatches });
        } else {
            console.warn('Could not find Final Phase tab');
        }

        // Save
        const dataDir = path.join(__dirname, '..', 'data');
        if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

        fs.writeFileSync(path.join(dataDir, OUTPUT_FILE), JSON.stringify(allData, null, 2));
        console.log(`Saved ${allData.phases.reduce((acc, p) => acc + p.matches.length, 0)} matches to ${OUTPUT_FILE}`);

    } catch (error) {
        console.error('Error scraping CEV:', error);
    } finally {
        await browser.close();
    }
}

scrapeCEVChallenge();
