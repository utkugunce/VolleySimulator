import { getLeagueData } from "../../utils/serverData";
import OneLigStatsClient from "./OneLigStatsClient";

export default async function OneLigStatsPage() {
    const { teams } = await getLeagueData("1lig");

    return (
        <OneLigStatsClient initialTeams={teams} />
    );
}
