const XLSX = require('xlsx');
const path = require('path');

// Read the Excel file
const workbook = XLSX.readFile(path.join(__dirname, '..', 'VSL.xlsx'));

// Assume the sheet name might be 'VSL' or first sheet
const sheetName = workbook.SheetNames[0];
console.log(`Sheet Name: ${sheetName}`);
const sheet = workbook.Sheets[sheetName];
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
// Adjust column name if needed based on output
const teamsA = [...new Set(data.map(r => r['A TAKIMI'] || r['Home'] || r['HOME']).filter(Boolean))];
console.log(teamsA);
