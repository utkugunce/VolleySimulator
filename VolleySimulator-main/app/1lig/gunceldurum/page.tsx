import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import OneLigDetailedGroupsClient from "./OneLigDetailedGroupsClient";

export const metadata: Metadata = {
    title: "1. Lig Güncel Durum",
    description: "Arabica Coffee House 1. Lig puan durumu, grup sıralamaları ve maç sonuçları. Grup A ve Grup B güncel tablo.",
    openGraph: {
        title: "1. Lig Güncel Durum | VolleySimulator",
        description: "1. Lig grup sıralamaları ve puan durumu.",
    },
};

export default async function OneLigDetailedGroupsPage() {
    const { teams, fixture } = await getLeagueData("1lig");

    return (
        <OneLigDetailedGroupsClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
