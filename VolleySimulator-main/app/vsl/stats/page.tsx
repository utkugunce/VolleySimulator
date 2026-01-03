import { getLeagueData } from "../../utils/serverData";
import VSLStatsClient from "./VSLStatsClient";

export default async function VSLStatsPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <VSLStatsClient initialTeams={teams} initialMatches={fixture} />
    );
}
