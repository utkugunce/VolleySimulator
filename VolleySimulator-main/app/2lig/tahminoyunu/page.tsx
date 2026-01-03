import { Suspense } from "react";
import { getLeagueData } from "../../utils/serverData";
import TwoLigCalculatorClient from "./TwoLigCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export default async function TwoLigTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("2lig");

    return (
        <ErrorBoundary>
            <Suspense fallback={<SkeletonPage />}>
                <TwoLigCalculatorClient
                    initialTeams={teams}
                    initialMatches={fixture}
                />
            </Suspense>
        </ErrorBoundary>
    );
}
