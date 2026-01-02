"use client";

import TeamAvatar from "./TeamAvatar";

interface BracketTeam {
    name: string;
    sourceGroup: string;
    position: number;
    eliminated?: boolean;
}

interface BracketMatch {
    team1: BracketTeam | null;
    team2: BracketTeam | null;
    winner?: 1 | 2;
}

interface BracketViewProps {
    quarterGroups: { name: string; teams: { name: string; sourceGroup: string; position: string }[] }[];
    semiGroups: { name: string; teams: { name: string; sourceGroup: string; position: string }[] }[];
    finalGroups: { name: string; teams: { name: string; sourceGroup: string; position: string }[] }[];
}

export default function BracketView({ quarterGroups, semiGroups, finalGroups }: BracketViewProps) {
    const getWinners = (groups: { name: string; teams: any[] }[]) => {
        return groups.map(g => ({
            name: g.name,
            first: g.teams[0],
            second: g.teams[1]
        }));
    };

    const quarterWinners = getWinners(quarterGroups);
    const semiWinners = getWinners(semiGroups);
    const finalWinners = getWinners(finalGroups);

    return (
        <div className="overflow-x-auto pb-4">
            <div className="min-w-[800px] flex items-center gap-4 p-4">

                {/* Quarter Finals */}
                <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-amber-400 text-center mb-2">ÇEYREK FİNAL</h3>
                    {quarterWinners.slice(0, 4).map((group, idx) => (
                        <BracketCard
                            key={group.name}
                            groupName={`Grup ${group.name}`}
                            team1={group.first?.name || '?'}
                            team2={group.second?.name || '?'}
                            color="amber"
                        />
                    ))}
                </div>

                {/* Connector Lines 1 */}
                <div className="flex flex-col gap-4 items-center self-stretch justify-around py-16">
                    <ConnectorLine />
                    <ConnectorLine />
                </div>

                {/* Semi Finals Left */}
                <div className="flex flex-col gap-4 self-center">
                    <h3 className="text-xs font-bold text-blue-400 text-center mb-2">YARI FİNAL</h3>
                    {semiWinners.slice(0, 2).map((group) => (
                        <BracketCard
                            key={group.name}
                            groupName={`Grup ${group.name}`}
                            team1={group.first?.name || '?'}
                            team2={group.second?.name || '?'}
                            color="blue"
                        />
                    ))}
                </div>

                {/* Connector Lines 2 */}
                <div className="flex flex-col gap-4 items-center self-center">
                    <ConnectorLine />
                </div>

                {/* Final */}
                <div className="flex flex-col gap-4 self-center">
                    <h3 className="text-xs font-bold text-emerald-400 text-center mb-2">FİNAL</h3>
                    {finalWinners.map((group) => (
                        <BracketCard
                            key={group.name}
                            groupName={`Grup ${group.name}`}
                            team1={group.first?.name || '?'}
                            team2={group.second?.name || '?'}
                            color="emerald"
                            isChampion
                        />
                    ))}
                </div>

                {/* Right Side Mirror */}
                <div className="flex flex-col gap-4 items-center self-center">
                    <ConnectorLine />
                </div>

                <div className="flex flex-col gap-4 self-center">
                    <h3 className="text-xs font-bold text-blue-400 text-center mb-2 opacity-0">.</h3>
                    {semiWinners.slice(2, 4).map((group) => (
                        <BracketCard
                            key={group.name}
                            groupName={`Grup ${group.name}`}
                            team1={group.first?.name || '?'}
                            team2={group.second?.name || '?'}
                            color="blue"
                        />
                    ))}
                </div>

                <div className="flex flex-col gap-4 items-center self-stretch justify-around py-16">
                    <ConnectorLine />
                    <ConnectorLine />
                </div>

                <div className="flex flex-col gap-4">
                    <h3 className="text-xs font-bold text-amber-400 text-center mb-2 opacity-0">.</h3>
                    {quarterWinners.slice(4, 8).map((group) => (
                        <BracketCard
                            key={group.name}
                            groupName={`Grup ${group.name}`}
                            team1={group.first?.name || '?'}
                            team2={group.second?.name || '?'}
                            color="amber"
                        />
                    ))}
                </div>
            </div>

            {/* Legend */}
            <div className="flex justify-center gap-6 mt-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-amber-600"></span> Çeyrek Final
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-blue-600"></span> Yarı Final
                </span>
                <span className="flex items-center gap-1">
                    <span className="w-3 h-3 rounded bg-emerald-700"></span> Final
                </span>
            </div>
        </div>
    );
}

function BracketCard({
    groupName,
    team1,
    team2,
    color = 'slate',
    isChampion = false
}: {
    groupName: string;
    team1: string;
    team2: string;
    color?: 'amber' | 'blue' | 'emerald' | 'slate';
    isChampion?: boolean;
}) {
    const colors = {
        amber: 'border-amber-600 bg-amber-950/30',
        blue: 'border-blue-600 bg-blue-950/30',
        emerald: 'border-emerald-600 bg-emerald-950/30',
        slate: 'border-slate-700 bg-slate-900'
    };

    return (
        <div className={`rounded-lg border-2 ${colors[color]} p-2 w-40 transition-all hover:scale-105 ${isChampion ? 'glow-emerald' : ''}`}>
            <div className="text-[10px] text-center opacity-50 mb-1">{groupName}</div>
            <div className="space-y-1">
                <TeamSlot name={team1} isWinner />
                <TeamSlot name={team2} />
            </div>
        </div>
    );
}

function TeamSlot({ name, isWinner = false }: { name: string; isWinner?: boolean }) {
    return (
        <div className={`text-xs px-2 py-1 rounded truncate flex items-center gap-2 ${isWinner
            ? 'bg-emerald-900/50 text-emerald-300 border border-emerald-700'
            : 'bg-slate-800/50 text-slate-400'
            }`}>
            <TeamAvatar name={name} size="sm" />
            <span className="truncate">{name}</span>
        </div>
    );
}

function ConnectorLine() {
    return (
        <div className="w-8 h-px bg-gradient-to-r from-slate-600 to-slate-700"></div>
    );
}
