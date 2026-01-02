const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '..', 'data');
const logosDir = path.join(__dirname, '..', 'public', 'logos');

const files = [
    '1lig-data.json',
    '2lig-data.json',
    'cev-cl-data.json',
    'vsl-data.json'
];

let allTeams = new Set();

files.forEach(file => {
    try {
        const filePath = path.join(dataDir, file);
        if (!fs.existsSync(filePath)) return;

        const content = fs.readFileSync(filePath, 'utf8');
        const json = JSON.parse(content);

        let teams = [];
        if (json.teams) {
            teams = json.teams.map(t => t.name);
        } else if (Array.isArray(json)) {
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

// Check existing logos
let output = "# Eksik Logo Raporu\n\n";
output += "Sisteme logo eklemek için aşağıdaki dosya isimlerini kullanmalısınız.\n";
output += "Dosyalar `public/logos/` klasörüne yüklemişse kutucuk işaretli görünür.\n";
output += "Takım isimleri sistemdeki veri dosyalarından (JSON) tam olarak alınmıştır. Büyük/küçük harf duyarlılığı olabilir.\n\n";
output += `Toplam Takım Sayısı: ${sortedTeams.length}\n\n`;

sortedTeams.forEach(t => {
    const fileName = `${t}.png`;
    const filePath = path.join(logosDir, fileName);

    // Check for exact match
    let exists = fs.existsSync(filePath);

    // If exact match fails, try to find case-insensitive match to help the user rename
    let actualFileName = fileName;
    if (!exists) {
        try {
            const dirFiles = fs.readdirSync(logosDir);
            const found = dirFiles.find(f => f.toLowerCase() === fileName.toLowerCase());
            if (found) {
                exists = true;
                actualFileName = found; // The file exists but maybe different casing
                // Note: We might want to warn about casing if strict mode matters
            }
        } catch (e) { }
    }

    output += `- [${exists ? 'x' : ' '}] ${t}.png${exists && actualFileName !== fileName ? ` (Mevcut dosya: ${actualFileName})` : ''}\n`;
});

const outputPath = path.join(__dirname, '..', 'missing_logos_generated.md');
fs.writeFileSync(outputPath, output, 'utf8');
console.log(`Generated report at ${outputPath}`);
