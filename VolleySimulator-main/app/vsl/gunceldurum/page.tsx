import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import VSLDetailedClient from "./VSLDetailedClient";

export const metadata: Metadata = {
    title: "Sultanlar Ligi Güncel Durum",
    description: "Vodafone Sultanlar Ligi puan durumu, fikstür ve maç sonuçları. 2025-2026 sezonu güncel sıralama tablosu.",
    openGraph: {
        title: "Sultanlar Ligi Güncel Durum | VolleySimulator",
        description: "Sultanlar Ligi puan durumu ve fikstür bilgileri.",
    },
};

export default async function VSLDetailedPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <VSLDetailedClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
