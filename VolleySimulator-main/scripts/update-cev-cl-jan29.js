const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/cev-cl-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Match Updates
// Igor Gorgonzola Novara vs PGE Budowlani Łódź
// Result: 3-1 (25-22, 21-25, 25-18, 25-20)

// Sport Lisboa e Benfica vs Fenerbahçe Medicana Istanbul
// Result: 0-3 (20-25, 29-31, 17-25)

const matchUpdates = [
    {
        homeTeam: "Igor Gorgonzola Novara",
        awayTeam: "PGE Budowlani Łódź",
        matchDate: "29.01.2026",
        homeScore: 3,
        awayScore: 1,
        setScores: [
            [25, 22],
            [21, 25],
            [25, 18],
            [25, 20]
        ]
    },
    {
        homeTeam: "Sport Lisboa e Benfica",
        awayTeam: "Fenerbahçe Medicana Istanbul",
        matchDate: "29.01.2026",
        homeScore: 0,
        awayScore: 3,
        setScores: [
            [20, 25],
            [29, 31],
            [17, 25]
        ]
    }
];

function updateTeamStats(team, wonSet, lostSet, wonPoints, lostPoints) {
    team.played += 1;
    if (wonSet === 3 && (lostSet === 0 || lostSet === 1)) {
        team.wins += 1;
        team.points += 3;
    } else if (wonSet === 3 && lostSet === 2) {
        team.wins += 1;
        team.points += 2;
    } else if (wonSet === 2 && lostSet === 3) {
        team.points += 1;
    }

    team.setsWon += wonSet;
    team.setsLost += lostSet;
    team.setPointsWon += wonPoints;
    team.setPointsLost += lostPoints;
}

matchUpdates.forEach(update => {
    // 1. Find and update match in fixture
    const match = data.fixture.find(m =>
        m.homeTeam === update.homeTeam &&
        m.awayTeam === update.awayTeam &&
        m.matchDate === update.matchDate
    );

    if (match) {
        if (match.isPlayed) {
            console.log(`Match already played: ${update.homeTeam} vs ${update.awayTeam}`);
            return;
        }

        match.isPlayed = true;
        match.homeScore = update.homeScore;
        match.awayScore = update.awayScore;
        match.resultScore = `${update.homeScore}-${update.awayScore}`;

        console.log(`Updated match: ${update.homeTeam} vs ${update.awayTeam} -> ${match.resultScore}`);

        // 2. Calculate set points
        let homeSetPoints = 0;
        let awaySetPoints = 0;
        update.setScores.forEach(set => {
            homeSetPoints += set[0];
            awaySetPoints += set[1];
        });

        // 3. Update Team Stats
        const homeTeamStats = data.teams.find(t => t.name === update.homeTeam);
        const awayTeamStats = data.teams.find(t => t.name === update.awayTeam);

        if (homeTeamStats && awayTeamStats) {
            updateTeamStats(homeTeamStats, update.homeScore, update.awayScore, homeSetPoints, awaySetPoints);
            updateTeamStats(awayTeamStats, update.awayScore, update.homeScore, awaySetPoints, homeSetPoints);
            console.log(`Updated stats for ${update.homeTeam} and ${update.awayTeam}`);
        } else {
            console.error(`Teams not found for stats update: ${update.homeTeam}, ${update.awayTeam}`);
        }

    } else {
        console.error(`Match not found: ${update.homeTeam} vs ${update.awayTeam} on ${update.matchDate}`);
    }
});

// Write updated data
fs.writeFileSync(dataPath, JSON.stringify(data, null, 4), 'utf8');
console.log('Update complete.');
