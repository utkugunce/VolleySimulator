import fs from 'fs';
import path from 'path';
import { Metadata } from "next";
import CEVCupStatsClient from './CEVCupStatsClient';

export const metadata: Metadata = {
    title: "CEV Cup İstatistikler",
    description: "CEV Kadınlar Kupası takım istatistikleri ve performans analizleri.",
    openGraph: {
        title: "CEV Cup İstatistikler | VolleySimulator",
        description: "CEV Cup takım istatistikleri.",
    },
};

export default async function CEVCupStatsPage() {
    const dataPath = path.join(process.cwd(), 'data', 'cev-cup-data.json');
    let teams: any[] = [];
    let fixture: any[] = [];

    try {
        const jsonData = fs.readFileSync(dataPath, 'utf-8');
        const data = JSON.parse(jsonData);
        teams = data.teams || [];
        fixture = data.fixture || [];
    } catch (error) {
        console.error('Error reading CEV Cup data:', error);
    }

    return (
        <CEVCupStatsClient teams={teams} fixture={fixture} />
    );
}
