import { getLeagueData } from "../../utils/serverData";
import CEVCLPlayoffsClient from "./CEVCLPlayoffsClient";

export default async function CEVCLPlayoffsPage() {
    const { teams, fixture } = await getLeagueData("cev-cl");

    return (
        <CEVCLPlayoffsClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
