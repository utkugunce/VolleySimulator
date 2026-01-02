
const fs = require('fs');
const path = require('path');

const dataPath = path.join(process.cwd(), 'data', 'vsl-data.json');
const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

// Weeks 14-26 are Second Half -> Not played yet
let resetCount = 0;

data.fixture.forEach(match => {
    if (match.week >= 14) {
        match.homeScore = null;
        match.awayScore = null;
        match.isPlayed = false;
        resetCount++;
    }
});

console.log(`Reset scores for ${resetCount} matches (Weeks 14-26 / Second Half).`);

// Save
data.lastUpdated = new Date().toISOString();
fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
console.log('Saved vsl-data.json');
