/**
 * JSON to Database Migration Script
 * 
 * Bu script, mevcut JSON dosyalarındaki verileri Supabase veritabanına aktarır.
 * 
 * Kullanım:
 *   node scripts/migrate-to-db.js
 * 
 * Gereksinimler:
 *   - .env.local dosyasında NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı
 *   - Supabase'de 20260104_leagues_tables.sql migration'ı çalıştırılmış olmalı
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// .env.local dosyasını manuel parse et
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local dosyası bulunamadı!');
    console.log('   Lütfen .env.example dosyasını .env.local olarak kopyalayın ve değerleri doldurun.');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('=').replace(/^["']|["']$/g, '');
      process.env[key] = value;
    }
  }
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Supabase credentials eksik!');
  console.log('   NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY tanımlı olmalı.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Slug oluşturma yardımcı fonksiyonu
function createSlug(name) {
  return name
    .toLowerCase()
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ı/g, 'i')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Lig konfigürasyonları
const LEAGUE_CONFIGS = {
  vsl: {
    id: 'vsl',
    name: 'Vodafone Sultanlar Ligi',
    short_name: 'VSL',
    subtitle: 'Kadınlar • 2025-2026',
    country: 'TR',
    theme: 'red',
    icon: '🏆',
    has_groups: false,
    has_playoffs: true,
    playoff_spots: 4,
    secondary_playoff_spots: 4,
    relegation_spots: 2,
    dataFile: 'vsl-data.json'
  },
  '1lig': {
    id: '1lig',
    name: 'Arabica Coffee House 1. Lig',
    short_name: '1. Lig',
    subtitle: 'Kadınlar • 2025-2026',
    country: 'TR',
    theme: 'amber',
    icon: '🥈',
    has_groups: true,
    has_playoffs: true,
    playoff_spots: 2,
    secondary_playoff_spots: 0,
    relegation_spots: 2,
    dataFile: '1lig-data.json'
  },
  '2lig': {
    id: '2lig',
    name: 'Kadınlar 2. Lig',
    short_name: '2. Lig',
    subtitle: 'Kadınlar • 2025-2026',
    country: 'TR',
    theme: 'emerald',
    icon: '🥉',
    has_groups: true,
    has_playoffs: true,
    playoff_spots: 2,
    secondary_playoff_spots: 0,
    relegation_spots: 2,
    dataFile: '2lig-data.json'
  },
  'cev-cl': {
    id: 'cev-cl',
    name: 'CEV Şampiyonlar Ligi',
    short_name: 'CEV CL',
    subtitle: 'Kadınlar • 2025-2026',
    country: 'EU',
    theme: 'blue',
    icon: '⭐',
    has_groups: true,
    has_playoffs: true,
    playoff_spots: 4,
    dataFile: 'cev-cl-data.json'
  },
  'cev-cup': {
    id: 'cev-cup',
    name: 'CEV Cup',
    short_name: 'CEV Cup',
    subtitle: 'Kadınlar • 2025-2026',
    country: 'EU',
    theme: 'amber',
    icon: '🏅',
    has_groups: false,
    has_rounds: true,
    has_playoffs: true,
    playoff_spots: 4,
    dataFile: 'cev-cup-data.json'
  },
  'cev-challenge': {
    id: 'cev-challenge',
    name: 'CEV Challenge Cup',
    short_name: 'Challenge',
    subtitle: 'Kadınlar • 2025-2026',
    country: 'EU',
    theme: 'emerald',
    icon: '🎯',
    has_groups: false,
    has_rounds: true,
    has_playoffs: true,
    playoff_spots: 4,
    dataFile: 'cev-challenge-cup-data.json'
  }
};

// Takımları migrate et
async function migrateTeams(leagueId, teams) {
  console.log(`  📦 Migrating ${teams.length} teams...`);
  
  const teamMap = new Map(); // name -> id mapping
  
  for (const team of teams) {
    const slug = createSlug(team.name);
    
    const { data, error } = await supabase
      .from('teams')
      .upsert({
        league_id: leagueId,
        name: team.name,
        slug: slug,
        group_name: team.groupName || null,
        logo_url: `/logos/${encodeURIComponent(team.name)}.png`,
        strength_rating: 1000
      }, { 
        onConflict: 'league_id,slug',
        ignoreDuplicates: false 
      })
      .select('id, name')
      .single();
    
    if (error) {
      console.error(`    ❌ Team error (${team.name}):`, error.message);
    } else if (data) {
      teamMap.set(team.name, data.id);
    }
  }
  
  console.log(`    ✅ ${teamMap.size} teams migrated`);
  return teamMap;
}

// Puan durumunu migrate et
async function migrateStandings(leagueId, teams, teamMap) {
  console.log(`  📊 Migrating standings...`);
  
  let successCount = 0;
  
  for (let i = 0; i < teams.length; i++) {
    const team = teams[i];
    const teamId = teamMap.get(team.name);
    
    if (!teamId) {
      console.error(`    ⚠️ Team ID not found for: ${team.name}`);
      continue;
    }
    
    const setsWon = team.setsWon || 0;
    const setsLost = team.setsLost || 0;
    
    const { error } = await supabase
      .from('standings')
      .upsert({
        league_id: leagueId,
        team_id: teamId,
        group_name: team.groupName || null,
        matches_played: team.played || 0,
        wins: team.wins || 0,
        losses: (team.played || 0) - (team.wins || 0),
        sets_won: setsWon,
        sets_lost: setsLost,
        points: team.points || 0,
        set_ratio: setsLost > 0 ? (setsWon / setsLost) : setsWon,
        rank: i + 1,
        form: []
      }, {
        onConflict: 'league_id,team_id'
      });
    
    if (error) {
      console.error(`    ❌ Standing error (${team.name}):`, error.message);
    } else {
      successCount++;
    }
  }
  
  console.log(`    ✅ ${successCount} standings migrated`);
}

// Maçları migrate et
async function migrateMatches(leagueId, fixtures, teamMap) {
  if (!fixtures || fixtures.length === 0) {
    console.log(`  📅 No fixtures to migrate`);
    return;
  }
  
  console.log(`  📅 Migrating ${fixtures.length} matches...`);
  
  let successCount = 0;
  
  for (const match of fixtures) {
    const homeTeamId = teamMap.get(match.homeTeam);
    const awayTeamId = teamMap.get(match.awayTeam);
    
    // Skor parse et
    let homeScore = 0;
    let awayScore = 0;
    if (match.score && typeof match.score === 'string') {
      const [h, a] = match.score.split('-').map(s => parseInt(s.trim(), 10));
      homeScore = isNaN(h) ? 0 : h;
      awayScore = isNaN(a) ? 0 : a;
    }
    
    const { error } = await supabase
      .from('matches')
      .insert({
        league_id: leagueId,
        home_team_id: homeTeamId || null,
        away_team_id: awayTeamId || null,
        home_team_name: match.homeTeam,
        away_team_name: match.awayTeam,
        group_name: match.groupName || null,
        week: match.week || null,
        match_date: match.matchDate || match.date || null,
        status: match.isPlayed ? 'finished' : 'scheduled',
        home_score: homeScore,
        away_score: awayScore,
        is_played: match.isPlayed || false
      });
    
    if (error) {
      // Duplicate key hatalarını sessizce atla
      if (!error.message.includes('duplicate')) {
        console.error(`    ❌ Match error:`, error.message);
      }
    } else {
      successCount++;
    }
  }
  
  console.log(`    ✅ ${successCount} matches migrated`);
}

// Tek bir ligi migrate et
async function migrateLeague(leagueId) {
  const config = LEAGUE_CONFIGS[leagueId];
  if (!config) {
    console.error(`❌ Unknown league: ${leagueId}`);
    return;
  }
  
  console.log(`\n🏐 Migrating ${config.name}...`);
  
  // JSON dosyasını oku
  const dataPath = path.join(__dirname, '..', 'data', config.dataFile);
  if (!fs.existsSync(dataPath)) {
    console.error(`  ❌ Data file not found: ${config.dataFile}`);
    return;
  }
  
  const rawData = fs.readFileSync(dataPath, 'utf-8');
  const data = JSON.parse(rawData);
  
  // Takımları migrate et
  const teamMap = await migrateTeams(leagueId, data.teams || []);
  
  // Puan durumunu migrate et
  await migrateStandings(leagueId, data.teams || [], teamMap);
  
  // Maçları migrate et
  await migrateMatches(leagueId, data.fixture || [], teamMap);
  
  console.log(`  ✅ ${config.name} migration completed!`);
}

// Ana fonksiyon
async function main() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  VolleySimulator - JSON to Database Migration');
  console.log('═══════════════════════════════════════════════════════════');
  console.log(`  Supabase URL: ${supabaseUrl}`);
  console.log('');
  
  // Tüm ligleri migrate et
  const leagues = Object.keys(LEAGUE_CONFIGS);
  
  for (const leagueId of leagues) {
    await migrateLeague(leagueId);
  }
  
  console.log('\n═══════════════════════════════════════════════════════════');
  console.log('  ✅ Migration completed!');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n📌 Sonraki adımlar:');
  console.log('   1. Supabase Dashboard > Table Editor\'da verileri kontrol et');
  console.log('   2. npm run dev ile uygulamayı test et');
  console.log('   3. /leagues/vsl sayfasını ziyaret et\n');
}

main().catch(console.error);
