const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// Read the Excel file
const workbook = XLSX.readFile(path.join(__dirname, '..', '1LIG.xlsx'));

const sheet = workbook.Sheets['1L'];
const data = XLSX.utils.sheet_to_json(sheet);

console.log('=== First 5 matches ===');
data.slice(0, 5).forEach((row, idx) => {
    console.log(`\n--- Match ${idx + 1} ---`);
    Object.keys(row).forEach(key => {
        console.log(`  ${key}: ${row[key]}`);
    });
});

console.log('\n\n=== Column Names ===');
if (data.length > 0) {
    console.log(Object.keys(data[0]));
}

console.log('\n\n=== Unique Teams (A TAKIMI) ===');
const teamsA = [...new Set(data.map(r => r['A TAKIMI']).filter(Boolean))];
console.log(teamsA);

console.log('\n\n=== Unique Teams (B TAKIMI) ===');
const teamsB = [...new Set(data.map(r => r['B TAKIMI']).filter(Boolean))];
console.log(teamsB);

console.log('\n\n=== All Unique Teams ===');
const allTeams = [...new Set([...teamsA, ...teamsB])];
console.log(allTeams);
console.log(`Total teams: ${allTeams.length}`);

console.log('\n\n=== Unique Etap/Grup values ===');
const etaps = [...new Set(data.map(r => r['ETAP']).filter(Boolean))];
console.log('Etaps:', etaps);

const grups = [...new Set(data.map(r => r['GRUP']).filter(Boolean))];
console.log('Grups:', grups);

console.log(`\nTotal matches: ${data.length}`);
