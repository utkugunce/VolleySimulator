import { getLeagueData } from "../../utils/serverData";
import OneLigDetailedGroupsClient from "./OneLigDetailedGroupsClient";

export default async function OneLigDetailedGroupsPage() {
    const { teams, fixture } = await getLeagueData("1lig");

    return (
        <OneLigDetailedGroupsClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
