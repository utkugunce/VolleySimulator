import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import CEVCLStatsClient from "./CEVCLStatsClient";

export const metadata: Metadata = {
    title: "CEV Şampiyonlar Ligi İstatistikler",
    description: "CEV Şampiyonlar Ligi takım istatistikleri, performans analizleri ve karşılaştırmalar.",
    openGraph: {
        title: "CEV Şampiyonlar Ligi İstatistikler | VolleySimulator",
        description: "Şampiyonlar Ligi takım istatistikleri ve analizler.",
    },
};

export default async function CEVCLStatsPage() {
    const { teams } = await getLeagueData("cev-cl");

    return (
        <CEVCLStatsClient initialTeams={teams} />
    );
}
