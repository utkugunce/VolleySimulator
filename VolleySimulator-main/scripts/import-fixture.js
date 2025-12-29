const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const EXCEL_FILE = path.join(__dirname, '../2025-2026_genel_fikstur.xlsx');
const DATA_FILE = path.join(__dirname, '../data/tvf-data.json');

function excelDateToISO(serial) {
    // Excel date serial number to ISO date string
    if (!serial || isNaN(serial)) return null;
    try {
        const utc_days = Math.floor(serial - 25569);
        const utc_value = utc_days * 86400;
        const date = new Date(utc_value * 1000);
        if (isNaN(date.getTime())) return null;
        return date.toISOString().split('T')[0];
    } catch {
        return null;
    }
}

function excelTimeToHHMM(decimal) {
    // Excel time decimal to HH:MM
    const totalMinutes = Math.round(decimal * 24 * 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

async function main() {
    console.log('Reading Excel file...');
    const workbook = XLSX.readFile(EXCEL_FILE);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });

    // Read existing data
    let existingData = { updatedAt: new Date().toISOString(), teams: [], fixture: [] };
    if (fs.existsSync(DATA_FILE)) {
        existingData = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    }

    // Parse Excel rows (skip header)
    const newFixture = [];
    const headers = data[0];

    // Column indices (from header row)
    const colIdx = {
        date: 0,      // TARİH
        time: 4,      // SAAT
        homeTeam: 5,  // A TAKIMI
        awayTeam: 6,  // B TAKIMI
        score: 7,     // SONUÇ
        league: 9,    // LİG (2 = 2. Lig)
        gender: 10,   // E-K
        group: 12,    // GRUP
    };

    console.log(`Processing ${data.length - 1} rows...`);

    for (let i = 1; i < data.length; i++) {
        const row = data[i];

        // Filter for 2. Lig Kadınlar
        const league = row[colIdx.league];
        const gender = row[colIdx.gender];
        if (league !== 2 || gender !== 'K') continue;

        const homeTeam = row[colIdx.homeTeam]?.toString().trim();
        const awayTeam = row[colIdx.awayTeam]?.toString().trim();
        const groupNum = row[colIdx.group];
        const score = row[colIdx.score]?.toString().trim();
        const dateSerial = row[colIdx.date];
        const timeDecimal = row[colIdx.time];

        if (!homeTeam || !awayTeam) continue;

        const matchDate = dateSerial ? excelDateToISO(dateSerial) : null;
        const matchTime = timeDecimal ? excelTimeToHHMM(timeDecimal) : null;
        const isPlayed = score && score !== '' && score !== '-' && score.includes('-');

        // Parse score
        let resultScore = null;
        if (isPlayed) {
            const parts = score.split('-');
            if (parts.length === 2) {
                resultScore = `${parts[0].trim()}-${parts[1].trim()}`;
            }
        }

        newFixture.push({
            homeTeam,
            awayTeam,
            groupName: `${groupNum}. GRUP`,
            isPlayed: !!isPlayed,
            resultScore: resultScore || undefined,
            matchDate,
            matchTime
        });
    }

    console.log(`Found ${newFixture.length} matches for 2. Lig Kadınlar`);

    // Update fixture while keeping teams
    existingData.fixture = newFixture;
    existingData.updatedAt = new Date().toISOString();

    fs.writeFileSync(DATA_FILE, JSON.stringify(existingData, null, 2));
    console.log(`Updated ${DATA_FILE}`);

    // Stats
    const played = newFixture.filter(m => m.isPlayed).length;
    const upcoming = newFixture.filter(m => !m.isPlayed).length;
    console.log(`Played: ${played}, Upcoming: ${upcoming}`);
}

main().catch(console.error);
