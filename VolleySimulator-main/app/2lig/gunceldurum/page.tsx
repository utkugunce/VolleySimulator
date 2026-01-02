import { getLeagueData } from "../../utils/serverData";
import TwoLigDetailedGroupsClient from "./TwoLigDetailedGroupsClient";

export default async function TwoLigDetailedGroupsPage() {
    const { teams, fixture } = await getLeagueData("2lig");

    return (
        <TwoLigDetailedGroupsClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
