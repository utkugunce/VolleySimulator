import { MetadataRoute } from 'next';

// Your production domain
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://volleysimulator.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const now = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: BASE_URL,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 1.0,
        },
        {
            url: `${BASE_URL}/ligler`,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${BASE_URL}/leaderboard`,
            lastModified: now,
            changeFrequency: 'daily',
            priority: 0.8,
        },
        {
            url: `${BASE_URL}/login`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
        {
            url: `${BASE_URL}/register`,
            lastModified: now,
            changeFrequency: 'monthly',
            priority: 0.3,
        },
    ];

    // League pages
    const leagues = ['vsl', '1lig', '2lig', 'cev-cl', 'cev-cup', 'cev-challenge'];
    const leagueSubpages = ['tahminoyunu', 'gunceldurum', 'playoffs', 'stats'];

    const leaguePages: MetadataRoute.Sitemap = leagues.flatMap((league) =>
        leagueSubpages.map((subpage) => ({
            url: `${BASE_URL}/${league}/${subpage}`,
            lastModified: now,
            changeFrequency: 'daily' as const,
            priority: 0.8,
        }))
    );

    // TODO: Add dynamic team pages from team-registry.json
    // const teamsData = await import('@/data/team-registry.json');
    // const teamPages = teamsData.teams.map(team => ({
    //     url: `${BASE_URL}/takimlar/${team.slug}`,
    //     lastModified: now,
    //     changeFrequency: 'weekly' as const,
    //     priority: 0.6,
    // }));

    return [...staticPages, ...leaguePages];
}
