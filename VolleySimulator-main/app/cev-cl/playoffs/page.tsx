import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import CEVCLPlayoffsClient from "./CEVCLPlayoffsClient";

export const metadata: Metadata = {
    title: "CEV Şampiyonlar Ligi Playoff Simülasyonu",
    description: "CEV Şampiyonlar Ligi playoff simülasyonu. Çeyrek final, yarı final ve final eşleşmelerini simüle edin.",
    openGraph: {
        title: "CEV Şampiyonlar Ligi Playoff | VolleySimulator",
        description: "Şampiyonlar Ligi playoff eşleşmelerini simüle edin.",
    },
};

export default async function CEVCLPlayoffsPage() {
    const { teams, fixture } = await getLeagueData("cev-cl");

    return (
        <CEVCLPlayoffsClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
