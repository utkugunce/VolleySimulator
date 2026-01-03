import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import VSLStatsClient from "./VSLStatsClient";

export const metadata: Metadata = {
    title: "Sultanlar Ligi İstatistikler",
    description: "Vodafone Sultanlar Ligi takım istatistikleri, performans analizleri ve karşılaştırmaları. 2025-2026 sezonu detaylı veriler.",
    openGraph: {
        title: "Sultanlar Ligi İstatistikler | VolleySimulator",
        description: "Sultanlar Ligi takım istatistikleri ve performans analizleri.",
    },
};

export default async function VSLStatsPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <VSLStatsClient initialTeams={teams} initialMatches={fixture} />
    );
}
