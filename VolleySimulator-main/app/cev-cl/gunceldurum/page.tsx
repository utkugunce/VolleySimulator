import { getLeagueData } from "../../utils/serverData";
import CEVCLGuncelDurumClient from "./CEVCLGuncelDurumClient";

export default async function CEVCLGuncelDurum() {
    const { teams, fixture } = await getLeagueData("cev-cl");

    return (
        <CEVCLGuncelDurumClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
