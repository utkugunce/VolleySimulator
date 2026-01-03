import { Suspense } from "react";
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import OneLigCalculatorClient from "./OneLigCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export const metadata: Metadata = {
    title: "1. Lig Tahmin Oyunu",
    description: "Arabica Coffee House 1. Lig maç sonuçlarını tahmin edin. Grup A ve Grup B takımlarının maçlarını tahmin ederek puan kazanın.",
    openGraph: {
        title: "1. Lig Tahmin Oyunu | VolleySimulator",
        description: "1. Lig maç sonuçlarını tahmin edin ve liderlik tablosunda yerinizi alın.",
    },
};

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
