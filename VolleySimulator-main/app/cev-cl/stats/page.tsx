import { getLeagueData } from "../../utils/serverData";
import CEVCLStatsClient from "./CEVCLStatsClient";

export default async function CEVCLStatsPage() {
    const { teams } = await getLeagueData("cev-cl");

    return (
        <CEVCLStatsClient initialTeams={teams} />
    );
}
