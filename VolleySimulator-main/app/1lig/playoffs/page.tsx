import { getLeagueData } from "../../utils/serverData";
import OneLigPlayoffsClient from "./OneLigPlayoffsClient";

export default async function Playoffs1LigPage() {
    const { teams, fixture } = await getLeagueData("1lig");

    return (
        <OneLigPlayoffsClient initialTeams={teams} initialMatches={fixture} />
    );
}
