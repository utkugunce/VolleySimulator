"use client";

import { useState } from "react";

const LEAGUES = [
  { id: 'vsl', name: 'Sultanlar Ligi', icon: '👑' },
  { id: '1lig', name: '1. Lig', icon: '🥈' },
  { id: '2lig', name: '2. Lig', icon: '🥉' },
  { id: 'cev-cl', name: 'CEV ŞL', icon: '🌟' },
];

const SAMPLE_TEAMS: Record<string, string[]> = {
  vsl: [
    "FENERBAHÇE MEDICANA", "ECZACIBAŞI DYNAVİT", "VAKIFBANK", "GALATASARAY DAIKIN",
    "THY", "NİLÜFER BELEDİYESPOR", "BEŞİKTAŞ", "ARAS KARGO",
    "KUZEYBORUİSTANBUL", "SIGORTA SHOP", "PTT", "TOKAT BELEDİYE PLEVNE"
  ],
  '1lig': ["BURSA BÜYÜKŞEHIR", "AYDIN B.ŞEHİR BEL", "MERSİN", "KARAYOLLARI"],
  '2lig': ["SAKARYA", "MUĞLA", "İZMİR", "ESKİŞEHİR"],
  'cev-cl': ["VAKIFBANK", "ECZACIBAŞI", "FENERBAHÇE", "IMOCO VOLLEY"],
};

export default function AdvancedStatsPage() {
  const [selectedLeague, setSelectedLeague] = useState('vsl');
  const [selectedTeam1, setSelectedTeam1] = useState('');
  const [selectedTeam2, setSelectedTeam2] = useState('');
  const [activeTab, setActiveTab] = useState<'rankings' | 'compare' | 'trends'>('rankings');

  // Mock data for teams and matches
  const mockTeams = (SAMPLE_TEAMS[selectedLeague] || []).map((name) => ({
    name,
    played: 10,
    wins: 7,
    points: 21,
    setsWon: 25,
    setsLost: 15,
  }));

  const mockMatches = [
    { homeTeam: SAMPLE_TEAMS[selectedLeague]?.[0] || '', awayTeam: SAMPLE_TEAMS[selectedLeague]?.[1] || '', homeScore: 3, awayScore: 1, date: '2024-01-01' },
    { homeTeam: SAMPLE_TEAMS[selectedLeague]?.[1] || '', awayTeam: SAMPLE_TEAMS[selectedLeague]?.[2] || '', homeScore: 2, awayScore: 3, date: '2024-01-02' },
  ];

  const { 
    getHeadToHead, 
    getTeamForm, 
    getTopPerformers,
    compareTeams,
  } = useAdvancedStats(mockTeams, mockMatches);

  const teams = SAMPLE_TEAMS[selectedLeague] || [];
  const topPerformers = useMemo(() => getTopPerformers('points', 5), [selectedLeague, getTopPerformers]);

  const team1Form = selectedTeam1 ? getTeamForm(selectedTeam1) : null;
  const team2Form = selectedTeam2 ? getTeamForm(selectedTeam2) : null;
  const h2hStats = selectedTeam1 && selectedTeam2 
    ? getHeadToHead(selectedTeam1, selectedTeam2) 
    : null;
  const comparison = selectedTeam1 && selectedTeam2
    ? compareTeams(selectedTeam1, selectedTeam2)
    : null;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Gelişmiş İstatistikler</h1>
          <p className="text-white/70 text-sm mt-1">
            Takım formları, karşılaşma geçmişleri ve detaylı analizler
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* League Selector */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {LEAGUES.map(league => (
            <button
              key={league.id}
              onClick={() => {
                setSelectedLeague(league.id);
                setSelectedTeam1('');
                setSelectedTeam2('');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium whitespace-nowrap transition-colors ${
                selectedLeague === league.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <span>{league.icon}</span>
              <span>{league.name}</span>
            </button>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-slate-800 pb-4">
          {[
            { key: 'rankings', label: 'Güç Sıralaması', icon: '📊' },
            { key: 'compare', label: 'Takım Karşılaştır', icon: '⚔️' },
            { key: 'trends', label: 'Trendler', icon: '📈' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-colors ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Rankings Tab */}
        {activeTab === 'rankings' && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white">ELO Güç Sıralaması</h2>
            
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-400">Takım</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">ELO</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Form</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Kazanma %</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-400">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {topPerformers.map((team, index) => (
                    <tr key={team.teamName} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`w-6 h-6 rounded flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-amber-500 text-slate-900' :
                          index === 1 ? 'bg-slate-400 text-slate-900' :
                          index === 2 ? 'bg-amber-700 text-white' :
                          'bg-slate-700 text-slate-300'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-white">{team.teamName}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="font-bold text-cyan-400">{team.points}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          {team.lastFiveMatches?.map((result, i) => (
                            <span 
                              key={i}
                              className={`w-5 h-5 rounded text-xs flex items-center justify-center font-bold ${
                                result === 'W' ? 'bg-emerald-500/30 text-emerald-400' :
                                result === 'D' ? 'bg-amber-500/30 text-amber-400' :
                                'bg-red-500/30 text-red-400'
                              }`}
                            >
                              {result === 'W' ? 'G' : result === 'D' ? 'B' : 'M'}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`font-medium ${
                          team.winPercentage >= 70 ? 'text-emerald-400' :
                          team.winPercentage >= 50 ? 'text-amber-400' :
                          'text-red-400'
                        }`}>
                          %{team.winPercentage}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={
                          team.trend === 'up' ? 'text-emerald-400' :
                          team.trend === 'down' ? 'text-red-400' :
                          'text-slate-400'
                        }>
                          {team.trend === 'up' ? '↑' : team.trend === 'down' ? '↓' : '−'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Compare Tab */}
        {activeTab === 'compare' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Takım Karşılaştır</h2>
            
            {/* Team Selectors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-2">1. Takım</label>
                <select
                  value={selectedTeam1}
                  onChange={(e) => setSelectedTeam1(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Takım Seç</option>
                  {teams.map(team => (
                    <option key={team} value={team} disabled={team === selectedTeam2}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-2">2. Takım</label>
                <select
                  value={selectedTeam2}
                  onChange={(e) => setSelectedTeam2(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Takım Seç</option>
                  {teams.map(team => (
                    <option key={team} value={team} disabled={team === selectedTeam1}>
                      {team}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Comparison Results */}
            {selectedTeam1 && selectedTeam2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Team Forms */}
                {team1Form && <TeamFormDisplay form={team1Form} teamName={selectedTeam1} />}
                {team2Form && <TeamFormDisplay form={team2Form} teamName={selectedTeam2} />}

                {/* Head to Head */}
                {h2hStats && (
                  <div className="md:col-span-2">
                    <HeadToHeadDisplay 
                      stats={h2hStats} 
                      homeTeam={selectedTeam1} 
                      awayTeam={selectedTeam2} 
                    />
                  </div>
                )}

                {/* Comparison Stats */}
                {comparison && (
                  <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                    <h3 className="font-bold text-white mb-4">Karşılaştırma</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {Object.entries(comparison.categories || {}).map(([category, data]) => (
                        <div key={category} className="text-center">
                          <div className="text-xs text-slate-500 mb-2">{category}</div>
                          <div className="flex items-center justify-center gap-2">
                            <span className={`font-bold ${
                              (data as { team1: number; team2: number }).team1 > (data as { team1: number; team2: number }).team2 ? 'text-blue-400' : 'text-slate-400'
                            }`}>
                              {(data as { team1: number; team2: number }).team1}
                            </span>
                            <span className="text-slate-600">vs</span>
                            <span className={`font-bold ${
                              (data as { team1: number; team2: number }).team2 > (data as { team1: number; team2: number }).team1 ? 'text-orange-400' : 'text-slate-400'
                            }`}>
                              {(data as { team1: number; team2: number }).team2}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Trends Tab */}
        {activeTab === 'trends' && (
          <div className="space-y-6">
            <h2 className="text-lg font-bold text-white">Sezon Trendleri</h2>
            
            {/* Hot & Cold Teams */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Hot Teams */}
              <div className="bg-gradient-to-br from-emerald-500/10 to-green-500/10 border border-emerald-500/30 rounded-xl p-6">
                <h3 className="flex items-center gap-2 font-bold text-emerald-400 mb-4">
                  <span>🔥</span> Formda Takımlar
                </h3>
                <div className="space-y-3">
                  {topPerformers.filter(t => t.trend === 'up').slice(0, 3).map(team => (
                    <div key={team.teamName} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                      <span className="text-white font-medium">{team.teamName}</span>
                      <span className="text-emerald-400 font-bold">↑ {team.winPercentage}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cold Teams */}
              <div className="bg-gradient-to-br from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-6">
                <h3 className="flex items-center gap-2 font-bold text-red-400 mb-4">
                  <span>❄️</span> Form Düşüşünde
                </h3>
                <div className="space-y-3">
                  {topPerformers.filter(t => t.trend === 'down').slice(0, 3).map(team => (
                    <div key={team.teamName} className="flex items-center justify-between bg-slate-900/50 rounded-lg p-3">
                      <span className="text-white font-medium">{team.teamName}</span>
                      <span className="text-red-400 font-bold">↓ {team.winPercentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Season Stats Overview */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
              <h3 className="font-bold text-white mb-4">Sezon İstatistikleri</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Toplam Maç', value: '156', icon: '🏐' },
                  { label: 'Toplam Set', value: '589', icon: '📊' },
                  { label: 'Ort. Set/Maç', value: '3.78', icon: '📈' },
                  { label: 'Tie-break', value: '42', icon: '⚡' },
                ].map(stat => (
                  <div key={stat.label} className="bg-slate-800/50 rounded-lg p-4 text-center">
                    <span className="text-2xl">{stat.icon}</span>
                    <div className="text-2xl font-bold text-white mt-2">{stat.value}</div>
                    <div className="text-xs text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
