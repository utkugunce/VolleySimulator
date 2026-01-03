import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import TwoLigDetailedGroupsClient from "./TwoLigDetailedGroupsClient";

export const metadata: Metadata = {
    title: "2. Lig Güncel Durum",
    description: "Kadınlar 2. Lig puan durumu, 5 grup sıralamaları ve maç sonuçları. Güncel tablo ve fikstür.",
    openGraph: {
        title: "2. Lig Güncel Durum | VolleySimulator",
        description: "2. Lig grup sıralamaları ve puan durumu.",
    },
};

export default async function TwoLigDetailedGroupsPage() {
    const { teams, fixture } = await getLeagueData("2lig");

    return (
        <TwoLigDetailedGroupsClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
