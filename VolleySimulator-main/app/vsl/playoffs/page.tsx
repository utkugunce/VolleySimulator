import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import VSLPlayoffsClient from "./VSLPlayoffsClient";

export const metadata: Metadata = {
    title: "Sultanlar Ligi Playoff Simülasyonu",
    description: "Vodafone Sultanlar Ligi playoff simülasyonu. Çeyrek final, yarı final ve final eşleşmelerini simüle edin.",
    openGraph: {
        title: "Sultanlar Ligi Playoff Simülasyonu | VolleySimulator",
        description: "Sultanlar Ligi playoff eşleşmelerini simüle edin.",
    },
};

export default async function PlayoffsVSLPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <VSLPlayoffsClient initialTeams={teams} initialMatches={fixture} />
    );
}
