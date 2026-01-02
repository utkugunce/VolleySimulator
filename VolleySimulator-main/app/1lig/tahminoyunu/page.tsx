import { Suspense } from "react";
import { getLeagueData } from "../../utils/serverData";
import OneLigCalculatorClient from "./OneLigCalculatorClient";

export default async function OneLigTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("1lig");

    return (
        <Suspense fallback={
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
        }>
            <OneLigCalculatorClient
                initialTeams={teams}
                initialMatches={fixture}
            />
        </Suspense>
    );
}
