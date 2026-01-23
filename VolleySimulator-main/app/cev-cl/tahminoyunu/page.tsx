import { getLeagueData } from "../../utils/serverData";
import CEVCLCalculatorClient from "./CEVCLCalculatorClient";

export default async function CEVCLTahminOyunuPage() {
    const { teams, fixture, rankings } = await getLeagueData("cev-cl");

    return (
        <CEVCLCalculatorClient
            initialTeams={teams}
            initialMatches={fixture}
            rankings={rankings}
        />
    );
}
