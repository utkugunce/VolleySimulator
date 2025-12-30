const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile(path.join(__dirname, '..', 'VSL.xlsx'));

// Use the first sheet or find specific one if needed
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json(sheet);

console.log(`Processing sheet: ${sheetName}`);

// Convert Excel date to JS date
function excelDateToJS(serial) {
    if (!serial) return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
}

// 1. Extract Unique Teams
// Check both Home and Away columns to be sure
const teamsSet = new Set();
data.forEach(row => {
    const home = row['A TAKIMI'] || row['Home'];
    const away = row['B TAKIMI'] || row['Away'];
    if (home) teamsSet.add(home.trim());
    if (away) teamsSet.add(away.trim());
});

const teamsList = [...teamsSet].sort();

// 2. Initialize Teams Data
const teamsData = teamsList.map(name => ({
    name,
    groupName: 'Vodafone Sultanlar Ligi', // Single group
    played: 0,
    wins: 0,
    points: 0,
    setsWon: 0,
    setsLost: 0
}));

// 3. Process Fixtures and Calculate Standings
const fixture = data.filter(r => (r['A TAKIMI'] || r['Home']) && (r['B TAKIMI'] || r['Away'])).map((row, idx) => {

    // Normalize keys
    const rawHome = row['A TAKIMI'] || row['Home'];
    const rawAway = row['B TAKIMI'] || row['Away'];
    const homeTeamName = rawHome ? rawHome.trim() : null;
    const awayTeamName = rawAway ? rawAway.trim() : null;

    const date = excelDateToJS(row['TARİH'] || row['Date']);
    const score = row['SONUÇ'] || row['Score'] || null;

    // Determine if played
    // Some formats might be "3-1", others might be empty or "-"
    let homeScore = null;
    let awayScore = null;
    let isPlayed = false;

    if (score && typeof score === 'string' && (score.includes('-') || score.includes(':'))) {
        const parts = score.split(/[-:]/);
        const h = parseInt(parts[0]);
        const a = parseInt(parts[1]);
        if (!isNaN(h) && !isNaN(a)) {
            homeScore = h;
            awayScore = a;
            isPlayed = true;
        }
    }

    // --- Update Standings ---
    if (isPlayed && homeTeamName && awayTeamName) {
        const homeTeamData = teamsData.find(t => t.name === homeTeamName);
        const awayTeamData = teamsData.find(t => t.name === awayTeamName);

        if (homeTeamData && awayTeamData) {
            homeTeamData.played++;
            awayTeamData.played++;

            homeTeamData.setsWon += homeScore;
            homeTeamData.setsLost += awayScore;

            awayTeamData.setsWon += awayScore;
            awayTeamData.setsLost += homeScore;

            if (homeScore > awayScore) {
                // Home Win
                homeTeamData.wins++;
                // 3-0 or 3-1 -> 3 points
                // 3-2 -> 2 points
                if (awayScore < 2) {
                    homeTeamData.points += 3;
                } else {
                    homeTeamData.points += 2;
                    awayTeamData.points += 1;
                }
            } else {
                // Away Win
                awayTeamData.wins++;
                // 0-3 or 1-3 -> 3 points
                // 2-3 -> 2 points
                if (homeScore < 2) {
                    awayTeamData.points += 3;
                } else {
                    awayTeamData.points += 2;
                    homeTeamData.points += 1;
                }
            }
        } else {
            console.warn(`Warning: Team not found in stats list: ${homeTeamName} or ${awayTeamName}`);
        }
    }

    return {
        id: idx + 1,
        matchNo: row['NO'] || `VSL-${idx + 1}`,
        date: date ? date.toISOString().split('T')[0] : null,
        matchTime: row['SAAT'] ? (typeof row['SAAT'] === 'number' ? new Date(row['SAAT'] * 24 * 60 * 60 * 1000).toISOString().substr(11, 5) : row['SAAT']) : null, // Handle excel time fraction
        week: row['HAFTA'] || row['Week'],
        groupName: 'Vodafone Sultanlar Ligi',
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        homeScore,
        awayScore,
        isPlayed,
        venue: row['SALON (ŞEHİR*)'] || null,
        city: row['İL (ÜLKE*)'] || null
    };
});

// 4. Output Data
const outputData = {
    league: 'Vodafone Sultanlar Ligi',
    season: '2024-2025',
    teams: teamsData,
    fixture,
    lastUpdated: new Date().toISOString()
};

// Write JSON file
const outputPath = path.join(__dirname, '..', 'data', 'vsl-data.json');
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

console.log('\n\n=== OUTPUT ===');
console.log(`Total teams: ${teamsData.length}`);
console.log(`Total matches: ${fixture.length}`);
console.log(`Played matches: ${fixture.filter(m => m.isPlayed).length}`);
console.log(`Unplayed matches: ${fixture.filter(m => !m.isPlayed).length}`);
console.log(`\nData written to: ${outputPath}`);
