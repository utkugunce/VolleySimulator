import { Metadata } from "next";
import TeamProfileClient from "./TeamProfileClient";

interface TeamPageProps {
    params: Promise<{
        teamSlug: string;
    }>;
}

export async function generateMetadata({ params }: TeamPageProps): Promise<Metadata> {
    const { teamSlug } = await params;
    const teamName = decodeURIComponent(teamSlug).replace(/-/g, ' ');

    return {
        title: `${teamName} | VolleySimulator`,
        description: `${teamName} takım profili - Fikstür, istatistikler ve turnuva bilgileri`,
    };
}

export default async function TeamPage({ params }: TeamPageProps) {
    const { teamSlug } = await params;

    return <TeamProfileClient teamSlug={teamSlug} />;
}
