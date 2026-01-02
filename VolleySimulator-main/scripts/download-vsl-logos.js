const fs = require('fs');
const path = require('path');
const https = require('https');

// Scraped Data from VolleyStation
const scrapedTeams = [
    { "name": "ARAS KARGO", "logoUrl": "https://assets.volleystation.com/website/teams/2149187/badge.png" },
    { "name": "AYDIN BÜYÜKŞEHİR BELEDİYESPOR", "logoUrl": "https://assets.volleystation.com/website/teams/2149186/badge.png" },
    { "name": "BAHÇELİEVLER BLD.", "logoUrl": "https://assets.volleystation.com/website/teams/2122146/badge.png" },
    { "name": "BEŞİKTAŞ", "logoUrl": "https://assets.volleystation.com/website/teams/2122464/badge.png" },
    { "name": "ECZACIBAŞI DYNAVİT", "logoUrl": "https://assets.volleystation.com/website/teams/2122135/badge.png" },
    { "name": "FENERBAHÇE MEDICANA", "logoUrl": "https://assets.volleystation.com/website/teams/2149191/badge.png" },
    { "name": "GALATASARAY DAIKIN", "logoUrl": "https://assets.volleystation.com/website/teams/2122456/badge.png" },
    { "name": "GÖZTEPE", "logoUrl": "https://assets.volleystation.com/website/teams/2122169/badge.png" },
    { "name": "İLBANK", "logoUrl": "https://assets.volleystation.com/website/teams/2149197/badge.png" },
    { "name": "KUZEYBORU", "logoUrl": "https://assets.volleystation.com/website/teams/2122132/badge.png" },
    { "name": "NİLÜFER BELEDİYESPOR EKER", "logoUrl": "https://assets.volleystation.com/website/teams/2122312/badge.png" },
    { "name": "TÜRK HAVA YOLLARI", "logoUrl": "https://assets.volleystation.com/website/teams/2122133/badge.png" },
    { "name": "VAKIFBANK", "logoUrl": "https://assets.volleystation.com/website/teams/2122134/badge.png" },
    { "name": "ZEREN SPOR", "logoUrl": "https://assets.volleystation.com/website/teams/2122455/badge.png" }
];

// Mapping Scraped Name -> System Name (as seen in missing_logos.md / vsl-data.json)
const nameMapping = {
    "ARAS KARGO": "ARAS KARGO",
    "AYDIN BÜYÜKŞEHİR BELEDİYESPOR": "AYDIN B.ŞEHİR BLD.",
    "BAHÇELİEVLER BLD.": "BAHÇELİEVLER BELEDİYE",
    "BEŞİKTAŞ": "BEŞİKTAŞ",
    "ECZACIBAŞI DYNAVİT": "ECZACIBAŞI DYNAVIT",
    "FENERBAHÇE MEDICANA": "FENERBAHÇE MEDICANA",
    "GALATASARAY DAIKIN": "GALATASARAY DAIKIN",
    "GÖZTEPE": "GÖZTEPE",
    "İLBANK": "İL BANK", // Check if it is "İL BANK" or "İLBANK" in system. Based on previous logs "İL BANK" seems standard? Checking missing_logos.md... it says "İL BANK.png"
    "KUZEYBORU": "KUZEYBORU",
    "NİLÜFER BELEDİYESPOR EKER": "NİLÜFER BELEDİYE",
    "TÜRK HAVA YOLLARI": "THY",
    "VAKIFBANK": "VAKIFBANK",
    "ZEREN SPOR": "ZEREN SPOR"
};

const logosDir = path.join(__dirname, '..', 'public', 'logos');
if (!fs.existsSync(logosDir)) {
    fs.mkdirSync(logosDir, { recursive: true });
}

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));
            }
        });
    });
};

async function main() {
    console.log("Downloading logos...");
    for (const team of scrapedTeams) {
        const systemName = nameMapping[team.name];
        if (!systemName) {
            console.error(`❌ No mapping found for ${team.name}`);
            continue;
        }

        const fileName = `${systemName}.png`;
        const filePath = path.join(logosDir, fileName);

        try {
            await downloadImage(team.logoUrl, filePath);
            console.log(`✅ Downloaded: ${fileName}`);
        } catch (error) {
            console.error(`❌ Error downloading ${fileName}:`, error.message);
        }
    }
}

main();
