
const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'data', 'vsl-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Reset all teams stats
const teamsMap = {};
data.teams.forEach(t => {
    teamsMap[t.name] = {
        name: t.name,
        groupName: t.groupName,
        played: 0,
        wins: 0,
        points: 0,
        setsWon: 0,
        setsLost: 0
    };
});

// Calculate stats from ALL played matches
data.fixture.forEach(m => {
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
                // 3-0 or 3-1: 3 points, 3-2: 2 points
                if (m.homeScore === 3) {
                    h.points += (m.awayScore < 2 ? 3 : 2);
                    a.points += (m.awayScore === 2 ? 1 : 0);
                } else {
                    // Should not happen if home wins (must be 3 sets)
                }
            } else {
                a.wins++;
                // 3-0 or 3-1: 3 points, 3-2: 2 points
                if (m.awayScore === 3) {
                    a.points += (m.homeScore < 2 ? 3 : 2);
                    h.points += (m.homeScore === 2 ? 1 : 0);
                }
            }
        }
    }
});

// Update data.teams
data.teams = Object.values(teamsMap);
data.lastUpdated = new Date().toISOString();

fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log('Updated team stats based on ' + data.fixture.filter(m => m.isPlayed).length + ' played matches.');
console.log('Final Standings Top 5:');
data.teams
    .sort((a, b) => b.wins - a.wins || b.points - a.points)
    .slice(0, 5)
    .forEach((t, i) => console.log(`${i + 1}. ${t.name}: ${t.wins}W ${t.points}P`));
