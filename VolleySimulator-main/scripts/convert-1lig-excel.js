const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile(path.join(__dirname, '..', '1LIG.xlsx'));

const sheet = workbook.Sheets['1L'];
const data = XLSX.utils.sheet_to_json(sheet);

// Group teams by their group
const teamsByGroup = { 'A': new Set(), 'B': new Set() };

data.forEach(row => {
    const group = row['GRUP'];
    const teamA = row['A TAKIMI'];
    const teamB = row['B TAKIMI'];

    if (group && teamA) teamsByGroup[group]?.add(teamA);
    if (group && teamB) teamsByGroup[group]?.add(teamB);
});

console.log('=== Group A Teams ===');
console.log([...teamsByGroup['A']]);
console.log(`Total: ${teamsByGroup['A'].size} teams`);

console.log('\n=== Group B Teams ===');
console.log([...teamsByGroup['B']]);
console.log(`Total: ${teamsByGroup['B'].size} teams`);

// Convert Excel date to JS date
function excelDateToJS(serial) {
    if (!serial) return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    return new Date(utc_value * 1000);
}

// Build teams data structure
const teamsData = [];
[...teamsByGroup['A']].forEach(name => {
    teamsData.push({
        name,
        groupName: 'A. Grup',
        played: 0,
        wins: 0,
        points: 0,
        setsWon: 0,
        setsLost: 0
    });
});
[...teamsByGroup['B']].forEach(name => {
    teamsData.push({
        name,
        groupName: 'B. Grup',
        played: 0,
        wins: 0,
        points: 0,
        setsWon: 0,
        setsLost: 0
    });
});

// Build fixture data
const fixture = data.map((row, idx) => {
    const date = excelDateToJS(row['TARİH']);
    const score = row['SONUÇ'] || null;
    const isPlayed = score !== null;

    let homeScore = null;
    let awayScore = null;
    if (score) {
        const parts = score.split('-');
        homeScore = parseInt(parts[0]);
        awayScore = parseInt(parts[1]);
    }

    // Calculate points for played matches
    if (isPlayed) {
        const homeTeamData = teamsData.find(t => t.name === row['A TAKIMI']);
        const awayTeamData = teamsData.find(t => t.name === row['B TAKIMI']);

        if (homeTeamData && awayTeamData) {
            homeTeamData.played++;
            awayTeamData.played++;
            homeTeamData.setsWon += homeScore;
            homeTeamData.setsLost += awayScore;
            awayTeamData.setsWon += awayScore;
            awayTeamData.setsLost += homeScore;

            if (homeScore > awayScore) {
                // Home wins
                homeTeamData.wins++;
                homeTeamData.points += (homeScore === 3 && awayScore < 2) ? 3 : 2;
                awayTeamData.points += (awayScore === 2) ? 1 : 0;
            } else {
                // Away wins
                awayTeamData.wins++;
                awayTeamData.points += (awayScore === 3 && homeScore < 2) ? 3 : 2;
                homeTeamData.points += (homeScore === 2) ? 1 : 0;
            }
        }
    }

    return {
        id: idx + 1,
        matchNo: row['NO'] || `1LIG-${idx + 1}`,
        date: date ? date.toISOString().split('T')[0] : null,
        week: row['HAFTA'],
        groupName: row['GRUP'] === 'A' ? 'A. Grup' : 'B. Grup',
        homeTeam: row['A TAKIMI'],
        awayTeam: row['B TAKIMI'],
        homeScore,
        awayScore,
        isPlayed,
        venue: row['SALON (ŞEHİR*)'] || null,
        city: row['İL (ÜLKE*)'] || null
    };
});

// Output final data
const outputData = {
    league: '1. Lig Kadınlar',
    season: '2024-2025',
    teams: teamsData,
    fixture,
    lastUpdated: new Date().toISOString()
};

// Write JSON file
const outputPath = path.join(__dirname, '..', 'data', '1lig-data.json');
fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2), 'utf-8');

console.log('\n\n=== OUTPUT ===');
console.log(`Total teams: ${teamsData.length}`);
console.log(`Total matches: ${fixture.length}`);
console.log(`Played matches: ${fixture.filter(m => m.isPlayed).length}`);
console.log(`Unplayed matches: ${fixture.filter(m => !m.isPlayed).length}`);
console.log(`\nData written to: ${outputPath}`);
