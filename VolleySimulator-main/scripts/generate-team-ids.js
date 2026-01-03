/**
 * Generate Unique Team IDs Script
 * Creates a centralized team registry with unique IDs for all teams
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Counter for numeric IDs
let teamIdCounter = 1000;

// Helper function to generate unique numeric ID
function generateTeamId(teamName, league) {
    return teamIdCounter++;
}

// Helper function to create slug from team name - includes league for uniqueness
function createSlug(teamName, league) {
    const baseSlug = teamName
        .toLowerCase()
        .replace(/ç/g, 'c')
        .replace(/ğ/g, 'g')
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ş/g, 's')
        .replace(/ü/g, 'u')
        .replace(/İ/g, 'i')
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '')
        .substring(0, 40);
    
    // Add league suffix to make slug unique
    const leagueSuffix = league.toLowerCase().replace(/_/g, '-');
    return `${baseSlug}-${leagueSuffix}`;
}

// Load data files
const dataDir = path.join(__dirname, '..', 'data');

const vslData = JSON.parse(fs.readFileSync(path.join(dataDir, 'vsl-data.json'), 'utf8'));
const lig1Data = JSON.parse(fs.readFileSync(path.join(dataDir, '1lig-data.json'), 'utf8'));
const lig2Data = JSON.parse(fs.readFileSync(path.join(dataDir, '2lig-data.json'), 'utf8'));
const cevClData = JSON.parse(fs.readFileSync(path.join(dataDir, 'cev-cl-data.json'), 'utf8'));
const cevCupData = JSON.parse(fs.readFileSync(path.join(dataDir, 'cev-cup-data.json'), 'utf8'));
const cevChallengeData = JSON.parse(fs.readFileSync(path.join(dataDir, 'cev-challenge-cup-data.json'), 'utf8'));

// Collect all teams
const teamRegistry = {};

// Process VSL teams
console.log('\n📋 Processing VSL teams...');
vslData.teams.forEach(team => {
    const id = generateTeamId(team.name, 'VSL');
    const slug = createSlug(team.name, 'VSL');
    teamRegistry[id] = {
        id,
        slug,
        name: team.name,
        league: 'VSL',
        country: 'TUR',
        groupName: team.groupName || null
    };
});

// Process 1. Lig teams
console.log('📋 Processing 1. Lig teams...');
lig1Data.teams.forEach(team => {
    const id = generateTeamId(team.name, '1LIG');
    const slug = createSlug(team.name, '1LIG');
    teamRegistry[id] = {
        id,
        slug,
        name: team.name,
        league: '1LIG',
        country: 'TUR',
        groupName: team.groupName || null
    };
});

// Process 2. Lig teams
console.log('📋 Processing 2. Lig teams...');
lig2Data.teams.forEach(team => {
    const id = generateTeamId(team.name, '2LIG');
    const slug = createSlug(team.name, '2LIG');
    teamRegistry[id] = {
        id,
        slug,
        name: team.name,
        league: '2LIG',
        country: 'TUR',
        groupName: team.groupName || null
    };
});

// Process CEV CL teams
console.log('📋 Processing CEV Champions League teams...');
cevClData.teams.forEach(team => {
    const id = generateTeamId(team.name, 'CEV_CL');
    const slug = createSlug(team.name, 'CEV_CL');
    teamRegistry[id] = {
        id,
        slug,
        name: team.name,
        league: 'CEV_CL',
        country: null,
        groupName: team.groupName || null
    };
});

// Process CEV Cup teams
console.log('📋 Processing CEV Cup teams...');
cevCupData.teams.forEach(team => {
    const id = generateTeamId(team.name, 'CEV_CUP');
    const slug = createSlug(team.name, 'CEV_CUP');
    teamRegistry[id] = {
        id,
        slug,
        name: team.name,
        league: 'CEV_CUP',
        country: team.country || null,
        groupName: null
    };
});

// Process CEV Challenge Cup teams (from matches)
console.log('📋 Processing CEV Challenge Cup teams...');
const challengeTeams = new Set();
cevChallengeData.phases.forEach(phase => {
    phase.matches.forEach(match => {
        if (match.homeTeam) challengeTeams.add(match.homeTeam);
        if (match.awayTeam) challengeTeams.add(match.awayTeam);
    });
});
challengeTeams.forEach(teamName => {
    const id = generateTeamId(teamName, 'CEV_CHALLENGE');
    const slug = createSlug(teamName, 'CEV_CHALLENGE');
    teamRegistry[id] = {
        id,
        slug,
        name: teamName,
        league: 'CEV_CHALLENGE',
        country: null,
        groupName: null
    };
});

// Convert to array and sort
const teamsArray = Object.values(teamRegistry).sort((a, b) => {
    // Sort by league first, then by name
    if (a.league !== b.league) {
        const leagueOrder = ['VSL', '1LIG', '2LIG', 'CEV_CL', 'CEV_CUP', 'CEV_CHALLENGE'];
        return leagueOrder.indexOf(a.league) - leagueOrder.indexOf(b.league);
    }
    return a.name.localeCompare(b.name, 'tr');
});

// Generate output
const output = {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    totalTeams: teamsArray.length,
    teamsByLeague: {
        VSL: teamsArray.filter(t => t.league === 'VSL').length,
        '1LIG': teamsArray.filter(t => t.league === '1LIG').length,
        '2LIG': teamsArray.filter(t => t.league === '2LIG').length,
        CEV_CL: teamsArray.filter(t => t.league === 'CEV_CL').length,
        CEV_CUP: teamsArray.filter(t => t.league === 'CEV_CUP').length,
        CEV_CHALLENGE: teamsArray.filter(t => t.league === 'CEV_CHALLENGE').length
    },
    teams: teamsArray
};

// Save to file
const outputPath = path.join(dataDir, 'team-registry.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

console.log('\n✅ Team Registry Generated!');
console.log(`📁 Output: ${outputPath}`);
console.log(`📊 Total Teams: ${output.totalTeams}`);
console.log('\n📈 Teams by League:');
Object.entries(output.teamsByLeague).forEach(([league, count]) => {
    console.log(`   ${league}: ${count} takım`);
});

// Also generate TypeScript types file
const typesContent = `/**
 * Auto-generated Team IDs
 * Generated at: ${output.generatedAt}
 * Total Teams: ${output.totalTeams}
 */

export type TeamId = number;

export interface TeamInfo {
  id: TeamId;
  slug: string;
  name: string;
  league: 'VSL' | '1LIG' | '2LIG' | 'CEV_CL' | 'CEV_CUP' | 'CEV_CHALLENGE';
  country: string | null;
  groupName: string | null;
  clubId?: string | null;
}

export const TEAM_IDS: Record<string, TeamId> = {
${teamsArray.map(t => `  '${t.slug}': ${t.id}`).join(',\n')}
};

export const TEAMS: Record<TeamId, TeamInfo> = {
${teamsArray.map(t => `  ${t.id}: ${JSON.stringify(t)}`).join(',\n')}
};
`;

const typesPath = path.join(__dirname, '..', 'app', 'utils', 'teamIds.ts');
fs.writeFileSync(typesPath, typesContent, 'utf8');
console.log(`\n📝 TypeScript types generated: ${typesPath}`);
