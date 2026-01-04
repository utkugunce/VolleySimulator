import { calculateLiveStandings } from "../lib/calculation/calculatorUtils";
import { calculateElo } from "../lib/calculation/eloCalculator";

self.onmessage = (e: MessageEvent) => {
    const { type, payload } = e.data;

    if (type === 'CALCULATE_STANDINGS') {
        const { teams, matches, overrides } = payload;
        const start = performance.now();
        const standings = calculateLiveStandings(teams, matches, overrides);
        const end = performance.now();
        
        self.postMessage({
            type: 'STANDINGS_RESULT',
            payload: standings,
            duration: end - start
        });
    } else if (type === 'CALCULATE_ELO') {
        const { teams, matches } = payload;
        const start = performance.now();
        const eloRatings = calculateElo(teams, matches);
        const end = performance.now();

        self.postMessage({
            type: 'ELO_RESULT',
            payload: eloRatings,
            duration: end - start
        });
    }
};
