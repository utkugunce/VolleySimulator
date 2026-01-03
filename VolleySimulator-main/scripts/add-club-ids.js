/**
 * Add Club IDs to Team Registry
 * Groups teams from the same club across different leagues
 */

const fs = require('fs');
const path = require('path');

// Club mappings - keywords to identify clubs
const CLUB_MAPPINGS = {
    'CLUB_FENERBAHCE': ['FENERBAHÇE', 'FENERBAHCE'],
    'CLUB_GALATASARAY': ['GALATASARAY'],
    'CLUB_BESIKTAS': ['BEŞİKTAŞ', 'BESIKTAS'],
    'CLUB_ECZACIBASI': ['ECZACIBAŞI', 'ECZACIBASI'],
    'CLUB_VAKIFBANK': ['VAKIFBANK', 'VAKIF BANK'],
    'CLUB_THY': ['TÜRK HAVA YOLLARI', 'THY ISTANBUL', 'THY '],
    'CLUB_ZEREN': ['ZEREN SPOR', 'ZEREN'],
    'CLUB_ILBANK': ['İLBANK', 'ILBANK'],
    'CLUB_AYDIN_BSB': ['AYDIN BÜYÜKŞEHİR'],
    'CLUB_BAHCELIEVLER': ['BAHÇELİEVLER'],
    'CLUB_GOZTEPE': ['GÖZTEPE'],
    'CLUB_DENIZLI_BSB': ['DENİZLİ B.ŞEHİR', 'DENİZLİ BŞEHİR'],
    'CLUB_KARSIYAKA': ['KARŞIYAKA'],
    'CLUB_MERINOS': ['MERİNOS'],
    'CLUB_PTT': ['PTT'],
    'CLUB_YESILYURT': ['YEŞİLYURT'],
    'CLUB_NILUFER': ['NİLÜFER'],
    'CLUB_KUZEYBORU': ['KUZEYBORU'],
    'CLUB_ARAS_KARGO': ['ARAS KARGO'],
    'CLUB_BURSA_BSB': ['BURSA BÜYÜKŞEHİR', 'BURSA B.ŞEHİR'],
    'CLUB_IZMIR_BSB': ['İZMİR BÜYÜKŞEHİR'],
    'CLUB_ISTANBULBBSK': ['İBB SPOR', 'İSTANBUL BB'],
};

// Find club ID for a team name
function findClubId(teamName) {
    const upperName = teamName.toUpperCase();

    for (const [clubId, keywords] of Object.entries(CLUB_MAPPINGS)) {
        for (const keyword of keywords) {
            if (upperName.includes(keyword.toUpperCase())) {
                return clubId;
            }
        }
    }

    return null; // No club association
}

// Load team registry
const dataDir = path.join(__dirname, '..', 'data');
const registryPath = path.join(dataDir, 'team-registry.json');
const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'));

// Add clubId to each team
let clubAssignments = 0;
const clubStats = {};

registry.teams = registry.teams.map(team => {
    const clubId = findClubId(team.name);

    if (clubId) {
        clubAssignments++;
        if (!clubStats[clubId]) clubStats[clubId] = [];
        clubStats[clubId].push({ name: team.name, league: team.league });
    }

    return {
        ...team,
        clubId: clubId
    };
});

// Update metadata
registry.generatedAt = new Date().toISOString();
registry.version = '1.1.0';
registry.clubsCount = Object.keys(clubStats).length;

// Save updated registry
fs.writeFileSync(registryPath, JSON.stringify(registry, null, 2), 'utf8');

console.log('\n✅ Club IDs Added to Team Registry!');
console.log(`📊 Total Teams with Club ID: ${clubAssignments}`);
console.log(`🏢 Total Clubs: ${Object.keys(clubStats).length}`);

console.log('\n📋 Clubs with Multiple Teams:\n');

// Show clubs with more than 1 team
Object.entries(clubStats)
    .filter(([_, teams]) => teams.length > 1)
    .sort((a, b) => b[1].length - a[1].length)
    .forEach(([clubId, teams]) => {
        console.log(`🏆 ${clubId} (${teams.length} takım):`);
        teams.forEach(t => console.log(`   - ${t.league}: ${t.name}`));
        console.log('');
    });

// Update TypeScript file too
const typesPath = path.join(__dirname, '..', 'app', 'utils', 'teamIds.ts');
let typesContent = fs.readFileSync(typesPath, 'utf8');

// Add club types
const clubTypes = `
export type ClubId = 
${Object.keys(CLUB_MAPPINGS).map(c => `  | '${c}'`).join('\n')}
  | null;

export const CLUBS: Record<string, { clubId: ClubId; teams: TeamId[] }> = {
${Object.entries(clubStats).map(([clubId, teams]) => {
    const teamIds = registry.teams.filter(t => t.clubId === clubId).map(t => t.id);
    return `  '${clubId}': { clubId: '${clubId}', teams: [${teamIds.join(', ')}] }`;
}).join(',\n')}
};
`;

// Append to types file
if (!typesContent.includes('ClubId')) {
    typesContent += clubTypes;
    fs.writeFileSync(typesPath, typesContent, 'utf8');
    console.log('📝 TypeScript types updated with ClubId');
}
