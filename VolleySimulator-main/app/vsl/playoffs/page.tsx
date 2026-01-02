import { getLeagueData } from "../../utils/serverData";
import VSLPlayoffsClient from "./VSLPlayoffsClient";

export default async function PlayoffsVSLPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <VSLPlayoffsClient initialTeams={teams} initialMatches={fixture} />
    );
}
