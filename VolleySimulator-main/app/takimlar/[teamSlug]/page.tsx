import { Metadata } from "next";
import TeamProfileClient from "./TeamProfileClient";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://volleysimulator.com';

interface TeamPageProps {
    params: Promise<{
        teamSlug: string;
    }>;
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
    const { teamSlug } = await params;
    const teamName = decodeURIComponent(teamSlug).replace(/-/g, ' ');
    const formattedName = teamName.split(' ').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');

    return {
        title: `${formattedName} - Takım Profili`,
        description: `${formattedName} voleybol takımı - Maç fikstürü, puan durumu, istatistikler ve turnuva bilgileri. VolleySimulator'da takımı takip edin.`,
        openGraph: {
            title: `${formattedName} - Takım Profili | VolleySimulator`,
            description: `${formattedName} voleybol takımı - Maç fikstürü, puan durumu, istatistikler ve turnuva bilgileri.`,
            url: `${BASE_URL}/takimlar/${teamSlug}`,
            type: "profile",
        },
        twitter: {
            card: "summary",
            title: `${formattedName} - Takım Profili`,
            description: `${formattedName} voleybol takımı - Maç fikstürü, puan durumu, istatistikler ve turnuva bilgileri.`,
        },
        alternates: {
            canonical: `${BASE_URL}/takimlar/${teamSlug}`,
        },
    };
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { teamSlug } = await params;

    return <TeamProfileClient teamSlug={teamSlug} />;
}
