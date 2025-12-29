const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/tvf-data.json');
const REPORT_FILE = path.join(__dirname, '../strength_rankings.md');

try {
    if (!fs.existsSync(DATA_FILE)) {
        console.log("Data file not found.");
        process.exit(1);
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data = JSON.parse(raw);

    const uniqueGroups = Array.from(new Set(data.teams.map(t => t.groupName))).sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || "0");
        const numB = parseInt(b.match(/\d+/)?.[0] || "0");
        return numA - numB;
    });

    let report = "# TVF 2. Lig Kadınlar - Güç Sıralaması Raporu\n\n";
    report += "Bu rapor, son çekilen verilere göre takımların güç sıralamasını gösterir.\n\n";

    uniqueGroups.forEach(groupName => {
        const groupTeams = data.teams.filter(t => t.groupName === groupName);

        const scoredTeams = groupTeams.map(t => {
            const ratio = t.setsLost === 0 ? (t.setsWon > 0 ? 5 : 0) : Math.min(5, t.setsWon / t.setsLost);
            const strength = t.points + (t.wins * 2) + (ratio * 5);
            return { ...t, strength, ratio };
        });

        scoredTeams.sort((a, b) => b.strength - a.strength);

        report += `## ${groupName}\n`;
        report += `| Sıra | Takım | Puan | G | Güç |\n`;
        report += `| :--- | :--- | :--- | :--- | :--- |\n`;

        scoredTeams.forEach((t, i) => {
            report += `| ${i + 1}. | ${t.name} | ${t.points} | ${t.wins} | ${t.strength.toFixed(2)} |\n`;
        });
        report += "\n";
    });

    fs.writeFileSync(REPORT_FILE, report);
    console.log(`Success! Report generated at: ${REPORT_FILE}`);

} catch (e) {
    console.error("Error:", e);
}
