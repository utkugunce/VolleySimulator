
export const SCORE_EXACT_MATCH = 15;
export const SCORE_WINNER_CORRECT = 8;

export function getWinner(score: string): string {
    const parts = score.split('-');
    if (parts.length !== 2) return 'draw';
    const home = parseInt(parts[0]);
    const away = parseInt(parts[1]);
    if (home > away) return 'home';
    if (away > home) return 'away';
    return 'draw';
}

export function calculatePoints(predicted: string, actual: string): number {
    if (predicted === actual) return SCORE_EXACT_MATCH;
    if (getWinner(predicted) === getWinner(actual)) return SCORE_WINNER_CORRECT;
    return 0;
}
