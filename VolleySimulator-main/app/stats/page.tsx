import { getLeagueData } from "../utils/serverData";
import StatsClient from "./StatsClient";

export default async function StatsPage() {
    const [lig1, lig2, vsl, cev] = await Promise.all([
        getLeagueData("1lig"),
        getLeagueData("2lig"),
        getLeagueData("vsl"),
        getLeagueData("cev-cl")
    ]);

    // Combine all teams for global stats
    const allTeams = [
        ...lig1.teams,
        ...lig2.teams,
        ...vsl.teams,
        ...cev.teams
    ];

    return (
        <StatsClient initialTeams={allTeams} />
    );
}
