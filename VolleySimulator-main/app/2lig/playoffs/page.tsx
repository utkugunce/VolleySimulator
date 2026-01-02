import { getLeagueData } from "../../utils/serverData";
import TwoLigPlayoffsClient from "./TwoLigPlayoffsClient";

export default async function PlayoffsPage() {
    const { teams, fixture } = await getLeagueData("2lig");

    return (
        <TwoLigPlayoffsClient initialTeams={teams} initialMatches={fixture} />
    );
}
