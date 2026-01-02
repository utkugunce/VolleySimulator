import { Suspense } from "react";
import { getLeagueData } from "../../utils/serverData";
import TwoLigCalculatorClient from "./TwoLigCalculatorClient";

export default async function TwoLigTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("2lig");

    return (
        <Suspense fallback={
            <div className="h-[calc(100vh-64px)] flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <TwoLigCalculatorClient
                initialTeams={teams}
                initialMatches={fixture}
            />
        </Suspense>
    );
}
