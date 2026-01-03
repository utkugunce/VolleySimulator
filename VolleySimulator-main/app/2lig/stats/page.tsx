import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import TwoLigStatsClient from "./TwoLigStatsClient";

export const metadata: Metadata = {
    title: "2. Lig İstatistikler",
    description: "Kadınlar 2. Lig takım istatistikleri ve performans analizleri. 5 grup detaylı veriler.",
    openGraph: {
        title: "2. Lig İstatistikler | VolleySimulator",
        description: "2. Lig takım istatistikleri ve performans analizleri.",
    },
};

export default async function TwoLigStatsPage() {
    const { teams } = await getLeagueData("2lig");

    return (
        <TwoLigStatsClient initialTeams={teams} />
    );
}
