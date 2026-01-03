import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import CEVCLGuncelDurumClient from "./CEVCLGuncelDurumClient";

export const metadata: Metadata = {
    title: "CEV Şampiyonlar Ligi Güncel Durum",
    description: "CEV Kadınlar Şampiyonlar Ligi puan durumu, grup sıralamaları ve maç sonuçları. Avrupa'nın en prestijli turnuvası.",
    openGraph: {
        title: "CEV Şampiyonlar Ligi Güncel Durum | VolleySimulator",
        description: "Şampiyonlar Ligi grup sıralamaları ve puan durumu.",
    },
};

export default async function CEVCLGuncelDurum() {
    const { teams, fixture } = await getLeagueData("cev-cl");

    return (
        <CEVCLGuncelDurumClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
