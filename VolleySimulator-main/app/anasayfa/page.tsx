import { getLeagueData } from "../utils/serverData";
import AnasayfaClient from "./AnasayfaClient";

export default async function AnasayfaPage() {
    // Fetch all league data in parallel on the server
    const [lig1, lig2, vsl] = await Promise.all([
        getLeagueData("1lig"),
        getLeagueData("2lig"),
        getLeagueData("vsl")
    ]);

    return (
        <AnasayfaClient
            initialLig1={{ teams: lig1.teams || [], fixture: lig1.fixture || [] }}
            initialLig2={{ teams: lig2.teams || [], fixture: lig2.fixture || [] }}
            initialVsl={{ teams: vsl.teams || [], fixture: vsl.fixture || [] }}
        />
    );
}
