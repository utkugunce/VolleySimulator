import { Suspense } from "react";
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import VSLCalculatorClient from "./VSLCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export const metadata: Metadata = {
    title: "Vodafone Sultanlar Ligi Tahmin Oyunu",
    description: "Sultanlar Ligi maç sonuçlarını tahmin edin, puan kazanın ve liderlik tablosunda yerinizi alın. 2025-2026 sezonu.",
    openGraph: {
        title: "Vodafone Sultanlar Ligi Tahmin Oyunu",
        description: "Sultanlar Ligi maç sonuçlarını tahmin edin, puan kazanın ve liderlik tablosunda yerinizi alın.",
    },
};

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
