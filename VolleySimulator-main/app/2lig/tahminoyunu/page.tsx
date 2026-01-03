import { Suspense } from "react";
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import TwoLigCalculatorClient from "./TwoLigCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export const metadata: Metadata = {
    title: "2. Lig Tahmin Oyunu",
    description: "Kadınlar 2. Lig maç sonuçlarını tahmin edin. 5 gruplu sistemde takımların maçlarını tahmin ederek puan kazanın.",
    openGraph: {
        title: "2. Lig Tahmin Oyunu | VolleySimulator",
        description: "2. Lig maç sonuçlarını tahmin edin ve liderlik tablosunda yerinizi alın.",
    },
};

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
