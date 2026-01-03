import { Metadata } from "next";
import { getLeagueData } from "../utils/serverData";
import StatsClient from "./StatsClient";

export const metadata: Metadata = {
    title: "Genel İstatistikler",
    description: "Tüm liglerin birleşik istatistikleri. Sultanlar Ligi, 1. Lig, 2. Lig ve CEV turnuvaları takım performans analizleri.",
    openGraph: {
        title: "Genel İstatistikler | VolleySimulator",
        description: "Tüm liglerin birleşik istatistikleri ve takım performans analizleri.",
    },
};

export default async function StatsPage() {
    const [lig1, lig2, vsl, cev] = await Promise.all([
        getLeagueData("1lig"),
        getLeagueData("2lig"),
        getLeagueData("vsl"),
        getLeagueData("cev-cl")
    ]);

    // Combine all teams for global stats
    const allTeams = [
        ...lig1.teams,
        ...lig2.teams,
        ...vsl.teams,
        ...cev.teams
    ];

    return (
        <StatsClient initialTeams={allTeams} />
    );
}
