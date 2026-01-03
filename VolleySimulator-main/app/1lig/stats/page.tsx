import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import OneLigStatsClient from "./OneLigStatsClient";

export const metadata: Metadata = {
    title: "1. Lig İstatistikler",
    description: "Arabica Coffee House 1. Lig takım istatistikleri ve performans analizleri. Grup bazlı detaylı veriler.",
    openGraph: {
        title: "1. Lig İstatistikler | VolleySimulator",
        description: "1. Lig takım istatistikleri ve performans analizleri.",
    },
};

export default async function OneLigStatsPage() {
    const { teams } = await getLeagueData("1lig");

    return (
        <OneLigStatsClient initialTeams={teams} />
    );
}
