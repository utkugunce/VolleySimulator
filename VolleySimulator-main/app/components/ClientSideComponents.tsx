"use client";

import dynamic from "next/dynamic";

const ScrollToTop = dynamic(() => import("./ScrollToTop"), { ssr: false });
const OnboardingTour = dynamic(() => import("./ui/OnboardingTour"), { ssr: false });
const AccessiBeWidget = dynamic(() => import("./AccessiBeWidget"), { ssr: false });

export function ClientSideComponents() {
    return (
        <>
            <ScrollToTop />
            <OnboardingTour />
            <AccessiBeWidget />
        </>
    );
}
