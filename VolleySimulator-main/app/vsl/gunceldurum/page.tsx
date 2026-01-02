import { getLeagueData } from "../../utils/serverData";
import VSLDetailedClient from "./VSLDetailedClient";

export default async function VSLDetailedPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <VSLDetailedClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
