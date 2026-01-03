import Script from "next/script";

interface OrganizationSchemaProps {
    name?: string;
    url?: string;
    logo?: string;
    description?: string;
    sameAs?: string[];
}

export function OrganizationSchema({
    name = "VolleySimulator",
    url = "https://volleysimulator.com",
    logo = "https://volleysimulator.com/volley_simulator_logo.png",
    description = "Türkiye voleybol ligleri için puan durumu, maç tahminleri, playoff simülasyonu ve liderlik tablosu platformu.",
    sameAs = [],
}: OrganizationSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Organization",
        name,
        url,
        logo,
        description,
        sameAs,
    };

    return (
        <Script
            id="organization-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface WebsiteSchemaProps {
    name?: string;
    url?: string;
    description?: string;
}

export function WebsiteSchema({
    name = "VolleySimulator",
    url = "https://volleysimulator.com",
    description = "Türkiye voleybol ligleri için puan durumu, maç tahminleri, playoff simülasyonu ve liderlik tablosu.",
}: WebsiteSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "WebSite",
        name,
        url,
        description,
        potentialAction: {
            "@type": "SearchAction",
            target: {
                "@type": "EntryPoint",
                urlTemplate: `${url}/takimlar/{search_term_string}`,
            },
            "query-input": "required name=search_term_string",
        },
    };

    return (
        <Script
            id="website-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface SportsEventSchemaProps {
    name: string;
    startDate: string;
    location?: string;
    homeTeam: string;
    awayTeam: string;
    sport?: string;
}

export function SportsEventSchema({
    name,
    startDate,
    location = "Turkey",
    homeTeam,
    awayTeam,
    sport = "Volleyball",
}: SportsEventSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SportsEvent",
        name,
        startDate,
        location: {
            "@type": "Place",
            name: location,
        },
        homeTeam: {
            "@type": "SportsTeam",
            name: homeTeam,
        },
        awayTeam: {
            "@type": "SportsTeam",
            name: awayTeam,
        },
        sport,
    };

    return (
        <Script
            id={`sports-event-${homeTeam}-${awayTeam}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbSchemaProps {
    items: BreadcrumbItem[];
}

export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: items.map((item, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: item.name,
            item: item.url,
        })),
    };

    return (
        <Script
            id="breadcrumb-schema"
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}

interface SportsTeamSchemaProps {
    name: string;
    url?: string;
    logo?: string;
    sport?: string;
    league?: string;
}

export function SportsTeamSchema({
    name,
    url,
    logo,
    sport = "Volleyball",
    league,
}: SportsTeamSchemaProps) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SportsTeam",
        name,
        sport,
        ...(url && { url }),
        ...(logo && { logo }),
        ...(league && {
            memberOf: {
                "@type": "SportsOrganization",
                name: league,
            },
        }),
    };

    return (
        <Script
            id={`sports-team-${name}`}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
