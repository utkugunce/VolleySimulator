
const fs = require('fs');
const path = require('path');

// Load VSL data
const dataPath = path.join(process.cwd(), 'data', 'vsl-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Calculate team strengths based on played matches
const teamStats = {};

// Initialize stats
data.teams.forEach(team => {
    teamStats[team.name] = {
        name: team.name,
        wins: team.wins || 0,
        played: team.played || 0,
        points: team.points || 0,
        setsWon: team.setsWon || 0,
        setsLost: team.setsLost || 0,
        power: 0 // Will be calculated
    };
});

// Helper to calculate power
function calculatePower(stats) {
    if (stats.played === 0) return 50; // Default power
    const winRate = stats.wins / stats.played;
    const setRate = stats.setsWon / (stats.setsWon + stats.setsLost || 1);
    const avPoints = stats.points / stats.played;

    // Weighted power score (0-100)
    // Win rate: 40%, Set rate: 30%, Points per match: 30%
    return (winRate * 40) + (setRate * 30) + ((avPoints / 3) * 30);
}

// Update stats from existing played matches in fixture (to be sure)
data.fixture.filter(m => m.isPlayed).forEach(m => {
    // This is just to confirm, but we trust the teams array mostly
    // We'll rely on the 'teams' array for initial strength as it aggregates data
});

Object.values(teamStats).forEach(team => {
    team.power = calculatePower(team);
    console.log(`${team.name}: Power ${team.power.toFixed(1)}`);
});

// Simulation logic
function simulateMatch(homeTeam, awayTeam, homePower, awayPower) {
    // Home advantage (+5 power)
    const effectiveHomePower = homePower + 5;
    const totalPower = effectiveHomePower + awayPower;

    const homeWinProb = effectiveHomePower / totalPower;
    const rand = Math.random();

    let winner = rand < homeWinProb ? 'home' : 'away';
    let loser = winner === 'home' ? 'away' : 'home';

    // Determine score
    // Stronger winner = more likely 3-0 or 3-1
    // Close match = more likely 3-2

    const powerDiff = Math.abs(effectiveHomePower - awayPower);
    let setsLoser = 0;

    if (powerDiff > 30) {
        setsLoser = Math.random() < 0.8 ? 0 : 1; // Blowout likely
    } else if (powerDiff > 15) {
        setsLoser = Math.random() < 0.6 ? 0 : Math.random() < 0.8 ? 1 : 2;
    } else {
        setsLoser = Math.random() < 0.4 ? 2 : 1; // Close match likely
    }

    // Ensure logical scores (3-0, 3-1, 3-2)
    // If random picked winner but stats suggest otherwise, we heavily weigh stats but keep randomness

    const homeSets = winner === 'home' ? 3 : setsLoser;
    const awaySets = winner === 'away' ? 3 : setsLoser;

    return { homeSets, awaySets };
}

// Simulate remaining matches
let simulatedCount = 0;
data.fixture.forEach(match => {
    if (!match.isPlayed && match.homeScore === null) {
        const homeStats = teamStats[match.homeTeam];
        const awayStats = teamStats[match.awayTeam];

        if (homeStats && awayStats) {
            // Simulate
            const result = simulateMatch(
                match.homeTeam,
                match.awayTeam,
                homeStats.power,
                awayStats.power
            );

            match.homeScore = result.homeSets;
            match.awayScore = result.awaySets;
            match.isPlayed = true; // Mark as played/predicted

            simulatedCount++;

            // Update stats for subsequent predictions (dynamic difficulty!)
            // Simple update:
            const homePoints = result.homeSets === 3 ? (result.awaySets < 2 ? 3 : 2) : (result.homeSets === 2 ? 1 : 0);
            const awayPoints = result.awaySets === 3 ? (result.homeSets < 2 ? 3 : 2) : (result.awaySets === 2 ? 1 : 0);

            homeStats.played++;
            homeStats.wins += result.homeSets === 3 ? 1 : 0;
            homeStats.points += homePoints;
            homeStats.setsWon += result.homeSets;
            homeStats.setsLost += result.awaySets;

            awayStats.played++;
            awayStats.wins += result.awaySets === 3 ? 1 : 0;
            awayStats.points += awayPoints;
            awayStats.setsWon += result.awaySets;
            awayStats.setsLost += result.homeSets;

            // Recalculate power slightly
            homeStats.power = calculatePower(homeStats);
            awayStats.power = calculatePower(awayStats);
        }
    }
});

// Save updated data
data.lastUpdated = new Date().toISOString();
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

console.log(`Simulated ${simulatedCount} matches.`);
console.log('Done.');
