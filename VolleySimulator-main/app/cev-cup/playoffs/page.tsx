import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVCupPlayoffsClient from './CEVCupPlayoffsClient';

export const metadata: Metadata = {
    title: "CEV Cup Playoff Simülasyonu",
    description: "CEV Kadınlar Kupası playoff simülasyonu. Eleme turlarını simüle edin.",
    openGraph: {
        title: "CEV Cup Playoff Simülasyonu | VolleySimulator",
        description: "CEV Cup playoff eşleşmelerini simüle edin.",
    },
};

export default async function CEVCupPlayoffsPage() {
    const dataPath = path.join(process.cwd(), 'data', 'cev-cup-data.json');
    let data = null;

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
        <CEVCupPlayoffsClient initialData={data} />
    );
}
