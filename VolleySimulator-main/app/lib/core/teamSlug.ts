/**
 * Team Slug Utility
 * Generates URL-safe slugs from team names and provides reverse lookup
 */

// Turkish character normalization map
const turkishCharMap: Record<string, string> = {
    'ş': 's', 'Ş': 'S',
    'ğ': 'g', 'Ğ': 'G',
    'ü': 'u', 'Ü': 'U',
    'ö': 'o', 'Ö': 'O',
    'ç': 'c', 'Ç': 'C',
    'ı': 'i', 'İ': 'I',
};

// Store for reverse lookup (populated as teams are encountered)
const slugToNameMap = new Map<string, string>();

/**
 * Normalize Turkish characters to ASCII equivalents
 */
function normalizeTurkish(str: string): string {
    return str.split('').map(char => turkishCharMap[char] || char).join('');
}

/**
 * Generate a URL-safe slug from a team name
 * Example: "Fenerbahçe Medicana" -> "fenerbahce-medicana"
 */
export function generateTeamSlug(teamName: string): string {
    const normalized = normalizeTurkish(teamName);
    const slug = normalized
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except spaces and hyphens
        .replace(/\s+/g, '-')          // Replace spaces with hyphens
        .replace(/-+/g, '-')           // Remove consecutive hyphens
        .replace(/^-|-$/g, '');        // Remove leading/trailing hyphens

    // Store for reverse lookup
    slugToNameMap.set(slug, teamName);

    return slug;
}

/**
 * Get the original team name from a slug
 * Returns null if the slug hasn't been registered
 */
export function getTeamNameFromSlug(slug: string): string | null {
    return slugToNameMap.get(slug) || null;
}

/**
 * Register a team name for reverse lookup without generating a new slug
 * Useful for pre-populating the map with known teams
 */
export function registerTeamSlug(teamName: string): void {
    generateTeamSlug(teamName);
}

/**
 * Check if a slug is registered
 */
export function isSlugRegistered(slug: string): boolean {
    return slugToNameMap.has(slug);
}
