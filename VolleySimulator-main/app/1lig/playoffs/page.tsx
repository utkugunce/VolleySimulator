import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import OneLigPlayoffsClient from "./OneLigPlayoffsClient";

export const metadata: Metadata = {
    title: "1. Lig Playoff Simülasyonu",
    description: "1. Lig playoff simülasyonu. Grup birincileri ve ikincileri arasındaki eşleşmeleri simüle edin.",
    openGraph: {
        title: "1. Lig Playoff Simülasyonu | VolleySimulator",
        description: "1. Lig playoff eşleşmelerini simüle edin.",
    },
};

export default async function Playoffs1LigPage() {
    const { teams, fixture } = await getLeagueData("1lig");

    return (
        <OneLigPlayoffsClient initialTeams={teams} initialMatches={fixture} />
    );
}
