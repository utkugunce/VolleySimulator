import { getLeagueData } from "../utils/serverData";
import RankingsClient from "./RankingsClient";

export const dynamic = 'force-dynamic';

export default async function RankingsPage() {
    const { teams, fixture } = await getLeagueData("cev-cl");

    return (
        <RankingsClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
