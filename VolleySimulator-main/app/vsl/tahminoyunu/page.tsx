import { getLeagueData } from "../../utils/serverData";
import VSLCalculatorClient from "./VSLCalculatorClient";

export default async function VSLTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <VSLCalculatorClient
            initialTeams={teams}
            initialMatches={fixture}
        />
    );
}
