import fs from 'fs';
import path from 'path';
import CEVCLPlayoffsClient from './CEVCLPlayoffsClient';

export default async function CEVCLPlayoffsPage() {
    // Server-side data fetching (no API waterfall)
    const dataPath = path.join(process.cwd(), 'data', 'cev-cl-data.json');
    let teams = [];
    let matches = [];

    try {
        if (fs.existsSync(dataPath)) {
            const jsonData = fs.readFileSync(dataPath, 'utf-8');
            const data = JSON.parse(jsonData);
            teams = data.teams || [];
            matches = (data.fixture || []).map((m: any) => ({
                ...m,
                matchDate: m.date
            }));
        }
    } catch (error) {
        console.error("Error loading server side data:", error);
    }

    return (
        <CEVCLPlayoffsClient
            initialTeams={teams}
            initialMatches={matches}
        />
    );
}
