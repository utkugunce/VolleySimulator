import fs from 'fs';
import path from 'path';
import CEVCupGuncelDurumClient from './CEVCupGuncelDurumClient';

interface CEVCupMatch {
    id: number;
    round: string;
    leg?: number;
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number | null;
    awayScore: number | null;
    setScores?: string;
    isPlayed: boolean;
}

interface CEVCupTeam {
    name: string;
    country: string;
}

interface CEVCupData {
    league: string;
    season: string;
    currentStage: string;
    teams: CEVCupTeam[];
    fixture: CEVCupMatch[];
}

export default async function CEVCupGuncelDurumPage() {
    const dataPath = path.join(process.cwd(), 'data', 'cev-cup-data.json');
    let data: CEVCupData | null = null;

    try {
        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        data = JSON.parse(jsonData);
    } catch (error) {
        console.error('Error reading CEV Cup data:', error);
    }

    if (!data) {
        return (
            <main className="min-h-screen bg-slate-950 text-slate-100 p-4 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-red-500">Veri Yüklenemedi</h1>
                    <p className="text-slate-400 mt-2">CEV Cup verileri yüklenirken bir hata oluştu.</p>
                </div>
            </main>
        );
    }

    return (
        <CEVCupGuncelDurumClient
            initialData={data}
        />
    );
}
