import { TeamStats, Match } from "../../types";
import CalculatorTemplate from "../../components/LeagueTemplate/CalculatorTemplate";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface VSLCalculatorClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function VSLCalculatorClient({ initialTeams, initialMatches }: VSLCalculatorClientProps) {
    return (
        <CalculatorTemplate
            config={LEAGUE_CONFIGS.vsl}
            initialTeams={initialTeams}
            initialMatches={initialMatches}
        />
    );
}
