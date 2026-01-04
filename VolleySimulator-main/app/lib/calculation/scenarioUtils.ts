import { TeamStats, ScenarioExport } from "../../types";

export interface TeamDiff {
    name: string;
    rankDiff: number;   // e.g. +2 (rose 2 spots), -1 (fell 1 spot)
    pointDiff: number;  // e.g. +3 points
    winDiff: number;
}

export function compareStandings(baseStandings: TeamStats[], targetStandings: TeamStats[]): TeamDiff[] {
    const baseMap = new Map<string, { rank: number, stats: TeamStats }>();
    baseStandings.forEach((t, i) => baseMap.set(t.name, { rank: i + 1, stats: t }));

    const diffs: TeamDiff[] = [];

    targetStandings.forEach((t, i) => {
        const currentRank = i + 1;
        const base = baseMap.get(t.name);

        if (base) {
            // Rank Diff: oldRank - newRank. 
            // If old was 5 and new is 3, diff is 5-3 = 2 (Positive means improvement)
            const rankDiff = base.rank - currentRank;
            const pointDiff = t.points - base.stats.points;
            const winDiff = t.wins - base.stats.wins;

            diffs.push({
                name: t.name,
                rankDiff,
                pointDiff,
                winDiff
            });
        }
    });

    return diffs;
}

// ============================================
// SCENARIO SHARE SYSTEM
// ============================================

const SHARE_CODE_CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';

/**
 * Generates a short shareable code from scenario data
 * Uses Base64 encoding with compression
 */
export function generateScenarioShareCode(scenario: ScenarioExport): string {
    try {
        const jsonStr = JSON.stringify(scenario);
        // Use btoa for Base64 encoding (works in browser)
        const base64 = btoa(encodeURIComponent(jsonStr));
        // Generate a short ID prefix for readability
        const shortId = generateShortId(6);
        
        // Store in localStorage with the short ID as key
        const shareData = {
            code: shortId,
            data: base64,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        };
        
        const storedShares = getStoredShares();
        storedShares[shortId] = shareData;
        localStorage.setItem('volleySim_scenarioShares', JSON.stringify(storedShares));
        
        return shortId;
    } catch (error) {
        console.error('Failed to generate share code:', error);
        throw new Error('Paylaşım kodu oluşturulamadı');
    }
}

/**
 * Decodes a share code back to ScenarioExport
 */
export function decodeScenarioShareCode(code: string): ScenarioExport | null {
    try {
        const storedShares = getStoredShares();
        const shareData = storedShares[code];
        
        if (!shareData) {
            // Try to decode as direct Base64 (for URL sharing)
            try {
                const jsonStr = decodeURIComponent(atob(code));
                return JSON.parse(jsonStr) as ScenarioExport;
            } catch {
                return null;
            }
        }
        
        // Check expiration
        if (new Date(shareData.expiresAt) < new Date()) {
            delete storedShares[code];
            localStorage.setItem('volleySim_scenarioShares', JSON.stringify(storedShares));
            return null;
        }
        
        const jsonStr = decodeURIComponent(atob(shareData.data));
        return JSON.parse(jsonStr) as ScenarioExport;
    } catch (error) {
        console.error('Failed to decode share code:', error);
        return null;
    }
}

/**
 * Generates a full shareable URL for the scenario
 */
export function generateScenarioShareUrl(scenario: ScenarioExport): string {
    const code = generateScenarioShareCode(scenario);
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return `${baseUrl}/scenario/${code}`;
}

/**
 * Creates a compact Base64 string for URL parameter sharing
 */
export function scenarioToUrlParam(scenario: ScenarioExport): string {
    const jsonStr = JSON.stringify({
        v: scenario.version,
        l: scenario.league,
        g: scenario.groupId,
        o: scenario.overrides
    });
    return btoa(encodeURIComponent(jsonStr));
}

/**
 * Decodes URL parameter back to scenario
 */
export function urlParamToScenario(param: string): Partial<ScenarioExport> | null {
    try {
        const jsonStr = decodeURIComponent(atob(param));
        const compact = JSON.parse(jsonStr);
        return {
            version: compact.v || '1.0',
            league: compact.l,
            groupId: compact.g,
            overrides: compact.o,
            timestamp: new Date().toISOString(),
            metadata: { completedMatches: 0, totalMatches: 0 }
        } as ScenarioExport;
    } catch {
        return null;
    }
}

// Helper functions
function generateShortId(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
        result += SHARE_CODE_CHARS.charAt(Math.floor(Math.random() * SHARE_CODE_CHARS.length));
    }
    return result;
}

function getStoredShares(): Record<string, { code: string; data: string; createdAt: string; expiresAt: string }> {
    if (typeof window === 'undefined') return {};
    try {
        const stored = localStorage.getItem('volleySim_scenarioShares');
        return stored ? JSON.parse(stored) : {};
    } catch {
        return {};
    }
}

/**
 * Get all stored scenario shares
 */
export function getMyScenarioShares(): Array<{ code: string; createdAt: string; expiresAt: string; scenario: ScenarioExport }> {
    const storedShares = getStoredShares();
    const shares: Array<{ code: string; createdAt: string; expiresAt: string; scenario: ScenarioExport }> = [];
    
    for (const [code, data] of Object.entries(storedShares)) {
        const scenario = decodeScenarioShareCode(code);
        if (scenario) {
            shares.push({
                code,
                createdAt: data.createdAt,
                expiresAt: data.expiresAt,
                scenario
            });
        }
    }
    
    return shares.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
