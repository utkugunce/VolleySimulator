import { Suspense } from "react";
import { getLeagueData } from "../../utils/serverData";
import OneLigCalculatorClient from "./OneLigCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export default async function OneLigTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("1lig");

    return (
        <ErrorBoundary>
            <Suspense fallback={<SkeletonPage />}>
                <OneLigCalculatorClient
                    initialTeams={teams}
                    initialMatches={fixture}
                />
            </Suspense>
        </ErrorBoundary>
    );
}
