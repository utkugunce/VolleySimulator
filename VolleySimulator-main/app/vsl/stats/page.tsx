import { getLeagueData } from "../../utils/serverData";
import VSLStatsClient from "./VSLStatsClient";

export default async function VSLStatsPage() {
    const { teams } = await getLeagueData("vsl");

    return (
        <VSLStatsClient initialTeams={teams} />
    );
}
