import { Suspense } from "react";
import { Metadata } from "next";
import { getLeagueData } from "../../utils/serverData";
import CEVCLCalculatorClient from "./CEVCLCalculatorClient";
import ErrorBoundary from "../../components/ErrorBoundary";
import { SkeletonPage } from "../../components/Skeleton";

export const metadata: Metadata = {
    title: "CEV Şampiyonlar Ligi Tahmin Oyunu",
    description: "CEV Kadınlar Şampiyonlar Ligi maç sonuçlarını tahmin edin. Avrupa'nın en iyi takımlarının maçlarını tahmin ederek puan kazanın.",
    openGraph: {
        title: "CEV Şampiyonlar Ligi Tahmin Oyunu | VolleySimulator",
        description: "Şampiyonlar Ligi maç sonuçlarını tahmin edin ve liderlik tablosunda yerinizi alın.",
    },
};

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
