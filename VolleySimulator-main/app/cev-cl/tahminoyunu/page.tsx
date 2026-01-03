import { Suspense } from "react";
import { getLeagueData } from "../../utils/serverData";
import CEVCLCalculatorClient from "./CEVCLCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export default async function CEVCLTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("cev-cl");

    return (
        <ErrorBoundary>
            <Suspense fallback={<SkeletonPage />}>
                <CEVCLCalculatorClient
                    initialTeams={teams}
                    initialMatches={fixture}
                />
            </Suspense>
        </ErrorBoundary>
    );
}
