import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import TwoLigPlayoffsClient from "./TwoLigPlayoffsClient";

export const metadata: Metadata = {
    title: "2. Lig Playoff Simülasyonu",
    description: "Kadınlar 2. Lig playoff simülasyonu. Grup birincileri arasındaki eşleşmeleri simüle edin.",
    openGraph: {
        title: "2. Lig Playoff Simülasyonu | VolleySimulator",
        description: "2. Lig playoff eşleşmelerini simüle edin.",
    },
};

export default async function PlayoffsPage() {
    const { teams, fixture } = await getLeagueData("2lig");

    return (
        <TwoLigPlayoffsClient initialTeams={teams} initialMatches={fixture} />
    );
}
