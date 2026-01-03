"use client";

import { TeamStats, Match } from "../../types";
import StatsTemplate from "../../components/LeagueTemplate/StatsTemplate";
import { LEAGUE_CONFIGS } from "../../components/LeagueTemplate/types";

interface VSLStatsClientProps {
    initialTeams: TeamStats[];
    initialMatches: Match[];
}

export default function VSLStatsClient({ initialTeams, initialMatches }: VSLStatsClientProps) {
    return (
        <StatsTemplate
            config={LEAGUE_CONFIGS.vsl}
            initialTeams={initialTeams}
            initialMatches={initialMatches}
        />
    );
}
