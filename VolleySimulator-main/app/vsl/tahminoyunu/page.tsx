import { Suspense } from "react";
import { getLeagueData } from "../../utils/serverData";
import VSLCalculatorClient from "./VSLCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export default async function VSLTahminOyunuPage() {
    const { teams, fixture } = await getLeagueData("vsl");

    return (
        <ErrorBoundary>
            <Suspense fallback={<SkeletonPage />}>
                <VSLCalculatorClient
                    initialTeams={teams}
                    initialMatches={fixture}
                />
            </Suspense>
        </ErrorBoundary>
    );
}
