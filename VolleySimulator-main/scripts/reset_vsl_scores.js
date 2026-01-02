
const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'data', 'vsl-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Matches for weeks 20-26 start from ID 134 (based on previous generation log)
// Or better, filter by week number >= 20
let resetCount = 0;

data.fixture.forEach(match => {
    if (match.week >= 20) {
        match.homeScore = null;
        match.awayScore = null;
        match.isPlayed = false;
        resetCount++;
    }
});

console.log(`Reset scores for ${resetCount} matches (Weeks 20-26).`);

// Save
data.lastUpdated = new Date().toISOString();
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Saved vsl-data.json');
