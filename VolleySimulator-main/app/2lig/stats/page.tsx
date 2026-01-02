import { getLeagueData } from "../../utils/serverData";
import TwoLigStatsClient from "./TwoLigStatsClient";

export default async function TwoLigStatsPage() {
    const { teams } = await getLeagueData("2lig");

    return (
        <TwoLigStatsClient initialTeams={teams} />
    );
}
