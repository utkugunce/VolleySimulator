import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

// Teams relegated from 2. Lig (to be excluded)
const RELEGATED_TEAMS = [
    'EDİRNE SPOR',
    'KUŞADASI YAKAMOZ SPOR',
    'DÜZİÇİ GENÇLİK',
    'SMART HOLDİNG A.Ş. ÇAYELİ',
    'KAHRAMANMARAŞ ELBİSTAN FEDA',
    'VAN B. ŞEHİR BLD.',
    // Alternate spellings
    'EDIRNE SPOR',
    'KUSADASI YAKAMOZ SPOR',
    'DUZICI GENCLIK',
    'VAN B.SEHIR BLD.',
    'VAN BÜYÜKŞEHIR BLD.',
];

export async function GET() {
    try {
        const dataPath = path.join(process.cwd(), 'data', '2lig-data.json');

        if (!fs.existsSync(dataPath)) {
            throw new Error("Cached data not found. Please run 'node scripts/scrape-tvf-live.js'");
        }

        const fileContent = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(fileContent);

        // Filter out relegated teams
        const isRelegated = (teamName: string) => {
            const normalized = teamName.toUpperCase().trim();
            return RELEGATED_TEAMS.some(rt =>
                normalized.includes(rt) || rt.includes(normalized)
            );
        };

        // Filter teams
        const filteredTeams = data.teams.filter((t: any) => !isRelegated(t.name));

        // Filter fixtures (remove matches where either team is relegated)
        const filteredFixture = data.fixture.filter((m: any) =>
            !isRelegated(m.homeTeam) && !isRelegated(m.awayTeam)
        );

        return NextResponse.json({
            ...data,
            teams: filteredTeams,
            fixture: filteredFixture
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
