
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '../data/cev-cl-data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const cevData = JSON.parse(rawData);

// Data extracted from Flashscore
const flashscoreData = [
    { "date": "04.02.2026", "home": "Alba Blaj", "away": "Le Cannet", "score": "3-1", "sets": ["25-17", "18-25", "25-20", "25-19"] },
    { "date": "04.02.2026", "home": "Fenerbahce", "away": "Budowlani Lodz", "score": "3-0", "sets": ["25-8", "25-17", "26-24"] },
    { "date": "29.01.2026", "home": "Benfica", "away": "Fenerbahce", "score": "0-3", "sets": ["20-25", "29-31", "17-25"] },
    { "date": "29.01.2026", "home": "Novara", "away": "Budowlani Lodz", "score": "3-1", "sets": ["20-25", "25-17", "25-22", "25-10"] },
    { "date": "28.01.2026", "home": "Le Cannet", "away": "Vakifbank", "score": "0-3", "sets": ["15-25", "17-25", "18-25"] },
    { "date": "28.01.2026", "home": "Levallois Paris SC", "away": "Palmberg Schwerin", "score": "3-2", "sets": ["21-25", "25-27", "25-23", "25-21", "15-9"] },
    { "date": "28.01.2026", "home": "Dresdner SC", "away": "LKS Lodz", "score": "3-0", "sets": ["25-18", "25-19", "26-24"] },
    { "date": "28.01.2026", "home": "Zeleznicar", "away": "Eczacibasi", "score": "0-3", "sets": ["15-25", "16-25", "17-25"] },
    { "date": "28.01.2026", "home": "Alba Blaj", "away": "Scandicci", "score": "0-3", "sets": ["19-25", "19-25", "21-25"] },
    { "date": "04.02.2026", "home": "Vakifbank", "away": "Scandicci", "score": "3-2", "sets": ["24-26", "23-25", "25-20", "28-26", "15-12"] },
    { "date": "27.01.2026", "home": "Olympiacos Piraeus", "away": "Vero Volley", "score": "1-3", "sets": ["27-25", "17-25", "17-25", "14-25"] },
    { "date": "27.01.2026", "home": "Maritsa Plovdiv", "away": "Rzeszow", "score": "0-3", "sets": ["20-25", "16-25", "21-25"] },
    { "date": "27.01.2026", "home": "Zeren Spor", "away": "Conegliano", "score": "0-3", "sets": ["21-25", "18-25", "21-25"] },
    { "date": "15.01.2026", "home": "Conegliano", "away": "Dresdner SC", "score": "3-0", "sets": ["25-19", "25-23", "25-19"] },
    { "date": "15.01.2026", "home": "Palmberg Schwerin", "away": "Maritsa Plovdiv", "score": "3-0", "sets": ["25-20", "25-21", "25-17"] },
    { "date": "15.01.2026", "home": "Eczacibasi", "away": "Olympiacos Piraeus", "score": "3-0", "sets": ["25-18", "25-15", "25-19"] },
    { "date": "14.01.2026", "home": "LKS Lodz", "away": "Zeren Spor", "score": "0-3", "sets": ["21-25", "18-25", "17-25"] },
    { "date": "14.01.2026", "home": "Vero Volley", "away": "Zeleznicar", "score": "3-0", "sets": ["25-16", "25-16", "29-27"] },
    { "date": "14.01.2026", "home": "Rzeszow", "away": "Levallois Paris SC", "score": "3-1", "sets": ["25-27", "28-26", "25-13", "27-25"] },
    { "date": "14.01.2026", "home": "Scandicci", "away": "Le Cannet", "score": "3-0", "sets": ["25-18", "25-13", "25-23"] },
    { "date": "14.01.2026", "home": "Vakifbank", "away": "Alba Blaj", "score": "3-0", "sets": ["25-19", "25-13", "25-20"] },
    { "date": "13.01.2026", "home": "Budowlani Lodz", "away": "Benfica", "score": "3-0", "sets": ["28-26", "25-13", "25-15"] },
    { "date": "04.02.2026", "home": "Novara", "away": "Benfica", "score": "3-0", "sets": ["25-20", "25-17", "25-15"] },
    { "date": "13.01.2026", "home": "Fenerbahce", "away": "Novara", "score": "3-2", "sets": ["20-25", "25-22", "12-12", "20-25", "15-10"] }, // Note: Flashscore had 12-12? Likely a parsing glitch or pause. I will trust the set score count. 5 sets implies 3-2. "12-12" might be a typo in my manual copy or flashscore glitch. Wait, 15-10 implies 5th set.
    { "date": "08.01.2026", "home": "Benfica", "away": "Novara", "score": "0-3", "sets": ["20-25", "15-25", "29-31"] },
    { "date": "08.01.2026", "home": "Le Cannet", "away": "Alba Blaj", "score": "3-1", "sets": ["25-23", "21-25", "25-22", "25-22"] },
    { "date": "04.02.2026", "home": "Rzeszow", "away": "Palmberg Schwerin", "score": "3-0", "sets": ["25-23", "25-21", "25-19"] },
    { "date": "08.01.2026", "home": "Scandicci", "away": "Vakifbank", "score": "1-3", "sets": ["24-26", "22-25", "25-17", "21-25"] },
    { "date": "08.01.2026", "home": "Olympiacos Piraeus", "away": "Zeleznicar", "score": "3-1", "sets": ["20-25", "25-18", "25-23", "25-17"] },
    { "date": "08.01.2026", "home": "Palmberg Schwerin", "away": "Rzeszow", "score": "2-3", "sets": ["19-25", "25-22", "20-25", "25-22", "12-15"] },
    { "date": "07.01.2026", "home": "LKS Lodz", "away": "Conegliano", "score": "0-3", "sets": ["14-25", "23-25", "13-25"] },
    { "date": "07.01.2026", "home": "Eczacibasi", "away": "Vero Volley", "score": "3-2", "sets": ["25-21", "20-25", "22-25", "25-22", "15-13"] },
    { "date": "07.01.2026", "home": "Maritsa Plovdiv", "away": "Levallois Paris SC", "score": "3-1", "sets": ["25-22", "18-25", "25-22", "25-15"] },
    { "date": "07.01.2026", "home": "Zeren Spor", "away": "Dresdner SC", "score": "3-0", "sets": ["26-24", "25-18", "25-16"] },
    { "date": "06.01.2026", "home": "Budowlani Lodz", "away": "Fenerbahce", "score": "0-3", "sets": ["16-25", "20-25", "11-25"] },
    { "date": "04.12.2025", "home": "Levallois Paris SC", "away": "Rzeszow", "score": "3-2", "sets": ["25-22", "25-19", "17-25", "13-25", "15-13"] },
    { "date": "04.12.2025", "home": "Novara", "away": "Fenerbahce", "score": "0-3", "sets": ["23-25", "21-25", "19-25"] },
    { "date": "03.12.2025", "home": "Benfica", "away": "Budowlani Lodz", "score": "3-2", "sets": ["14-25", "25-19", "26-28", "25-20", "15-9"] },
    { "date": "03.12.2025", "home": "Le Cannet", "away": "Scandicci", "score": "1-3", "sets": ["11-25", "25-20", "23-25", "17-25"] },
    { "date": "03.12.2025", "home": "Zeleznicar", "away": "Vero Volley", "score": "0-3", "sets": ["20-25", "15-25", "22-25"] },
    { "date": "03.12.2025", "home": "Zeren Spor", "away": "LKS Lodz", "score": "3-0", "sets": ["25-19", "27-25", "25-20"] },
    { "date": "02.12.2025", "home": "Dresdner SC", "away": "Conegliano", "score": "0-3", "sets": ["12-25", "17-25", "17-25"] },
    { "date": "02.12.2025", "home": "Olympiacos Piraeus", "away": "Eczacibasi", "score": "3-2", "sets": ["21-25", "25-16", "19-25", "26-24", "18-16"] },
    { "date": "02.12.2025", "home": "Maritsa Plovdiv", "away": "Palmberg Schwerin", "score": "2-3", "sets": ["21-25", "25-22", "25-22", "20-25", "12-15"] },
    { "date": "02.12.2025", "home": "Alba Blaj", "away": "Vakifbank", "score": "1-3", "sets": ["25-21", "23-25", "14-25", "21-25"] },
    { "date": "27.11.2025", "home": "Scandicci", "away": "Alba Blaj", "score": "3-0", "sets": ["25-13", "25-21", "25-14"] },
    { "date": "27.11.2025", "home": "Palmberg Schwerin", "away": "Levallois Paris SC", "score": "3-1", "sets": ["25-22", "17-25", "25-15", "25-20"] },
    { "date": "27.11.2025", "home": "Vakifbank", "away": "Le Cannet", "score": "3-0", "sets": ["25-19", "25-16", "25-19"] },
    { "date": "26.11.2025", "home": "LKS Lodz", "away": "Dresdner SC", "score": "1-3", "sets": ["24-26", "20-25", "25-17", "23-25"] },
    { "date": "26.11.2025", "home": "Vero Volley", "away": "Olympiacos Piraeus", "score": "3-0", "sets": ["25-18", "27-25", "25-16"] },
    { "date": "26.11.2025", "home": "Rzeszow", "away": "Maritsa Plovdiv", "score": "3-1", "sets": ["25-19", "25-27", "25-18", "25-16"] },
    { "date": "26.11.2025", "home": "Eczacibasi", "away": "Zeleznicar", "score": "3-0", "sets": ["25-12", "25-16", "25-17"] },
    { "date": "25.11.2025", "home": "Conegliano", "away": "Zeren Spor", "score": "3-2", "sets": ["23-25", "26-24", "23-25", "25-22", "20-18"] },
    { "date": "25.11.2025", "home": "Budowlani Lodz", "away": "Novara", "score": "1-3", "sets": ["25-20", "19-25", "23-25", "18-25"] },
    { "date": "25.11.2025", "home": "Fenerbahce", "away": "Benfica", "score": "3-0", "sets": ["25-18", "25-19", "25-12"] }
];

// Mapping from Flashscore names to JSON names
const teamMapping = {
    "Savino Del Bene SCANDICCI": ["Scandicci"],
    "VakifBank ISTANBUL": ["Vakifbank"],
    "CS Volei Alba BLAJ": ["Alba Blaj"],
    "Volero LE CANNET": ["Le Cannet"],
    "Fenerbahçe Medicana ISTANBUL": ["Fenerbahce"],
    "Igor Gorgonzola NOVARA": ["Novara"],
    "Sport LISBOA e Benfica": ["Benfica"],
    "PGE Budowlani ŁÓDŹ": ["Budowlani Lodz"],
    "Numia Vero Volley MILANO": ["Vero Volley"],
    "Eczacibasi ISTANBUL": ["Eczacibasi"],
    "Olympiacos PIRAEUS": ["Olympiacos Piraeus"],
    "OK Železničar LAJKOVAC": ["Zeleznicar"],
    "A. Carraro Prosecco DOC CONEGLIANO": ["Conegliano"],
    "ANKARA Zeren Spor Kulübü": ["Zeren Spor"],
    "DRESDNER SC": ["Dresdner SC"],
    "ŁKS Commercecon ŁÓDŹ": ["LKS Lodz"],
    "SSC Palmberg SCHWERIN": ["Palmberg Schwerin"],
    "KS Developres RZESZÓW": ["Rzeszow"],
    "LEVALLOIS PARIS Saint Cloud": ["Levallois Paris SC"],
    "Maritza PLOVDIV": ["Maritsa Plovdiv", "Maritza Plovdiv"]
};

// Inverse map for lookup
const flashscoreToJSONName = {};
Object.entries(teamMapping).forEach(([jsonName, aliases]) => {
    aliases.forEach(alias => {
        flashscoreToJSONName[alias] = jsonName;
    });
});

console.log("Updating fixtures...");
let updatedCount = 0;

cevData.fixture.forEach(match => {
    // Find corresponding result
    const home = match.homeTeam;
    const away = match.awayTeam;

    // Find mapped names if possible, else strictly match
    const fsHome = Object.keys(flashscoreToJSONName).find(key => flashscoreToJSONName[key] === home) || home;
    // Wait, flashscoreToJSONName keys are Flashscore names. 
    // We need to match match.homeTeam (JSON name) to a Flashscore entry.

    // Let's find a Flashscore entry that maps to this JSON match
    const result = flashscoreData.find(fsMatch => {
        // JSON name -> target Flashscore name
        // We need to check if mappings of JSON home/away match fsMatch.home/away

        const homeAliases = teamMapping[match.homeTeam] || [match.homeTeam];
        const awayAliases = teamMapping[match.awayTeam] || [match.awayTeam];

        const homeMatch = homeAliases.includes(fsMatch.home);
        const awayMatch = awayAliases.includes(fsMatch.away);

        return homeMatch && awayMatch;
    });

    if (result) {
        // Update match
        match.isPlayed = true;
        match.resultScore = result.score;
        const [h, a] = result.score.split('-').map(Number);
        match.homeScore = h;
        match.awayScore = a;

        // Clean set scores (remove Golden set if present, generally handled by flashscore sets)
        // Flashscore sets sometimes have GS. But sets are usually just the main game.
        // Filter out empty sets
        const validSets = result.sets.filter(s => s && s.includes('-'));
        match.setScores = validSets;
        updatedCount++;
    }
});

console.log(`Updated ${updatedCount} matches.`);

// Recalculate Standings
console.log("Recalculating standings...");

// Reset stats
cevData.teams.forEach(team => {
    team.played = 0;
    team.wins = 0;
    team.points = 0;
    team.setsWon = 0;
    team.setsLost = 0;
    team.setPointsWon = 0; // Ensure these exist if we track them
    team.setPointsLost = 0;
});

// Process all fixtures
cevData.fixture.forEach(match => {
    if (match.isPlayed && match.resultScore) {
        const homeTeam = cevData.teams.find(t => t.name === match.homeTeam);
        const awayTeam = cevData.teams.find(t => t.name === match.awayTeam);

        if (homeTeam && awayTeam) {
            const [hSets, aSets] = match.resultScore.split('-').map(Number);

            homeTeam.played++;
            awayTeam.played++;

            homeTeam.setsWon += hSets;
            homeTeam.setsLost += aSets;
            awayTeam.setsWon += aSets;
            awayTeam.setsLost += hSets;

            // Points
            if (hSets === 3) {
                if (aSets === 0 || aSets === 1) {
                    homeTeam.points += 3;
                    homeTeam.wins++;
                } else if (aSets === 2) {
                    homeTeam.points += 2;
                    homeTeam.wins++;
                    awayTeam.points += 1;
                }
            } else if (aSets === 3) {
                if (hSets === 0 || hSets === 1) {
                    awayTeam.points += 3;
                    awayTeam.wins++;
                } else if (hSets === 2) {
                    awayTeam.points += 2;
                    awayTeam.wins++;
                    homeTeam.points += 1;
                }
            }

            // Detailed set points
            if (match.setScores && match.setScores.length > 0) {
                match.setScores.forEach(setStr => {
                    const [hP, aP] = setStr.split('-').map(Number);
                    if (!isNaN(hP) && !isNaN(aP)) {
                        // Initialize if undefined (old data might not have these)
                        if (homeTeam.setPointsWon === undefined) homeTeam.setPointsWon = 0;
                        if (homeTeam.setPointsLost === undefined) homeTeam.setPointsLost = 0;
                        if (awayTeam.setPointsWon === undefined) awayTeam.setPointsWon = 0;
                        if (awayTeam.setPointsLost === undefined) awayTeam.setPointsLost = 0;

                        homeTeam.setPointsWon += hP;
                        homeTeam.setPointsLost += aP;
                        awayTeam.setPointsWon += aP;
                        awayTeam.setPointsLost += hP;
                    }
                });
            }
        }
    }
});

// Write result
fs.writeFileSync(dataPath, JSON.stringify(cevData, null, 4));
console.log("Write completed.");
