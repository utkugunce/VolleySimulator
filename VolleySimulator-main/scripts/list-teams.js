const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');

const files = [
    '1lig-data.json',
    '2lig-data.json',
    'cev-cl-data.json',
    'vsl-data.json'
];

let allTeams = new Set();

files.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
        const json = JSON.parse(content);

        let teams = [];
        if (json.teams) {
            teams = json.teams.map(t => t.name);
        } else if (Array.isArray(json)) {
            // Some files might be array root
            teams = json.map(t => t.name);
        }

        teams.forEach(t => {
            if (t) allTeams.add(t.trim());
        });

    } catch (e) {
        console.error(`Error reading ${file}:`, e.message);
    }
});

const sortedTeams = Array.from(allTeams).sort();

console.log("# Eksik Logolar Raporu");
console.log(`Toplam Takım Sayısı: ${sortedTeams.length}\n`);
console.log("Aşağıdaki isimlerde .png dosyalarını `public/logos/` klasörüne yüklemelisiniz:\n");

sortedTeams.forEach(t => {
    console.log(`- [ ] ${t}.png`);
});
