"use client";

import React, { useState, useEffect } from "react";
import { useCustomLeagues } from "../context/CustomLeaguesContext";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

export default function CustomLeaguesPage() {
  const { user } = useAuth();
  const {
    myLeagues,
    joinedLeagues,
    pendingInvites,
    isLoading,
    createLeague,
    joinLeague,
    acceptInvite,
    rejectInvite,
  } = useCustomLeagues();

  const [activeTab, setActiveTab] = useState<'my' | 'joined' | 'create' | 'join'>('my');
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create league form state
  const [newLeague, setNewLeague] = useState({
    name: '',
    description: '',
    isPrivate: true,
    maxMembers: 20,
    leagues: ['vsl'],
    startDate: '',
    endDate: '',
  });

  // Initialize dates after render (Date.now() is impure, so must be in effect)
  const [initialStartDate, setInitialStartDate] = useState('');
  const [initialEndDate, setInitialEndDate] = useState('');

  useEffect(() => {
    const start = new Date().toISOString().split('T')[0];
    const end = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    Promise.resolve().then(() => {
      setInitialStartDate(start);
      setInitialEndDate(end);
      setNewLeague(prev => ({ ...prev, startDate: start, endDate: end }));
    });
  }, []);

  const handleJoinLeague = async () => {
    if (!joinCode.trim()) return;

    setJoinError('');
    const success = await joinLeague(joinCode.trim());

    if (success) {
      setJoinCode('');
      setActiveTab('joined');
    } else {
      setJoinError('Geçersiz kod veya lig bulunamadı');
    }
  };

  const handleCreateLeague = async () => {
    if (!newLeague.name.trim()) return;

    const league = await createLeague(newLeague);

    if (league) {
      setShowCreateModal(false);
      setActiveTab('my');
      setNewLeague({
        name: '',
        description: '',
        isPrivate: true,
        maxMembers: 20,
        leagues: ['vsl'],
        startDate: initialStartDate,
        endDate: initialEndDate,
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">Bu sayfayı görüntülemek için giriş yapmalısınız.</p>
          <Link href="/" className="text-emerald-400 hover:underline">Giriş Yap</Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Özel Ligler</h1>
              <p className="text-white/70 text-sm mt-1">
                Arkadaşlarınla kendi ligini oluştur!
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
            >
              + Lig Oluştur
            </button>
          </div>
        </div>
      </div>

      {/* Pending Invites Banner */}
      {pendingInvites.length > 0 && (
        <div className="max-w-4xl mx-auto px-4 mt-4">
          <div className="bg-amber-500/20 border border-amber-500/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📩</span>
                <div>
                  <p className="font-medium text-amber-300">
                    {pendingInvites.length} bekleyen davet
                  </p>
                  <p className="text-sm text-amber-400/70">
                    Özel liglere katılmak için davetleri kontrol edin
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {pendingInvites.slice(0, 2).map(invite => (
                  <div key={invite.id} className="flex gap-1">
                    <button
                      onClick={() => acceptInvite(invite.id)}
                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs"
                    >
                      Kabul
                    </button>
                    <button
                      onClick={() => rejectInvite(invite.id)}
                      className="px-3 py-1 bg-slate-600 hover:bg-slate-700 rounded-lg text-xs"
                    >
                      Reddet
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-2 py-4 border-b border-slate-800">
          {[
            { key: 'my', label: 'Liglerim', icon: '👑', count: myLeagues.length },
            { key: 'joined', label: 'Katıldıklarım', icon: '🎮', count: joinedLeagues.length },
            { key: 'join', label: 'Katıl', icon: '🔗' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${activeTab === tab.key
                ? 'bg-white/10 text-white'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-indigo-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-6">
          {/* My Leagues */}
          {activeTab === 'my' && (
            <div className="space-y-4">
              {myLeagues.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">👑</div>
                  <p className="text-slate-400">Henüz oluşturduğunuz bir lig yok</p>
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    İlk Ligini Oluştur
                  </button>
                </div>
              ) : (
                myLeagues.map(league => (
                  <LeagueCard key={league.id} league={league} isOwner />
                ))
              )}
            </div>
          )}

          {/* Joined Leagues */}
          {activeTab === 'joined' && (
            <div className="space-y-4">
              {joinedLeagues.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎮</div>
                  <p className="text-slate-400">Henüz katıldığınız bir lig yok</p>
                  <button
                    onClick={() => setActiveTab('join')}
                    className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Bir Lige Katıl
                  </button>
                </div>
              ) : (
                joinedLeagues.map(league => (
                  <LeagueCard key={league.id} league={league} />
                ))
              )}
            </div>
          )}

          {/* Join League */}
          {activeTab === 'join' && (
            <div className="max-w-md mx-auto">
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h2 className="text-lg font-bold text-white mb-4">Lige Katıl</h2>
                <p className="text-sm text-slate-400 mb-6">
                  Arkadaşınızdan aldığınız davet kodunu girin
                </p>

                <div className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase());
                        setJoinError('');
                      }}
                      placeholder="ABCD1234"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-xl tracking-widest placeholder:text-slate-600 focus:outline-none focus:border-indigo-500"
                      maxLength={8}
                    />
                    {joinError && (
                      <p className="text-red-400 text-sm mt-2">{joinError}</p>
                    )}
                  </div>

                  <button
                    onClick={handleJoinLeague}
                    disabled={!joinCode.trim()}
                    className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-medium transition-colors"
                  >
                    Katıl
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create League Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Yeni Lig Oluştur</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Lig Adı *
                </label>
                <input
                  type="text"
                  value={newLeague.name}
                  onChange={(e) => setNewLeague({ ...newLeague, name: e.target.value })}
                  placeholder="Arkadaşlar Ligi"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Açıklama
                </label>
                <textarea
                  value={newLeague.description}
                  onChange={(e) => setNewLeague({ ...newLeague, description: e.target.value })}
                  placeholder="Lig hakkında kısa bir açıklama..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none h-20"
                />
              </div>

              {/* Privacy */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Gizlilik
                </label>
                <div className="flex gap-3">
                  <button
                    onClick={() => setNewLeague({ ...newLeague, isPrivate: true })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${newLeague.isPrivate
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                  >
                    🔒 Özel
                  </button>
                  <button
                    onClick={() => setNewLeague({ ...newLeague, isPrivate: false })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${!newLeague.isPrivate
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                  >
                    🌐 Herkese Açık
                  </button>
                </div>
              </div>

              {/* Max Members */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Maksimum Üye: {newLeague.maxMembers}
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  value={newLeague.maxMembers}
                  onChange={(e) => setNewLeague({ ...newLeague, maxMembers: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Included Leagues */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Dahil Edilecek Ligler
                </label>
                <div className="flex flex-wrap gap-2">
                  {['vsl', '1lig', '2lig', 'cev-cl', 'cev-cup'].map(league => (
                    <button
                      key={league}
                      onClick={() => {
                        const leagues = newLeague.leagues.includes(league)
                          ? newLeague.leagues.filter(l => l !== league)
                          : [...newLeague.leagues, league];
                        setNewLeague({ ...newLeague, leagues });
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${newLeague.leagues.includes(league)
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400'
                        }`}
                    >
                      {league.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Başlangıç
                  </label>
                  <input
                    type="date"
                    value={newLeague.startDate}
                    onChange={(e) => setNewLeague({ ...newLeague, startDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">
                    Bitiş
                  </label>
                  <input
                    type="date"
                    value={newLeague.endDate}
                    onChange={(e) => setNewLeague({ ...newLeague, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                onClick={handleCreateLeague}
                disabled={!newLeague.name.trim() || newLeague.leagues.length === 0}
                className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-700 disabled:cursor-not-allowed rounded-xl font-medium transition-colors mt-4"
              >
                Lig Oluştur
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// League Card Component
function LeagueCard({ league, isOwner = false }: { league: any; isOwner?: boolean }) {
  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-2xl">
          {isOwner ? '👑' : '🏆'}
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-white text-lg">{league.name}</h3>
            {league.isPrivate && (
              <span className="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">🔒 Özel</span>
            )}
          </div>

          {league.description && (
            <p className="text-sm text-slate-400 mt-1">{league.description}</p>
          )}

          <div className="flex items-center gap-4 mt-3 text-sm text-slate-500">
            <span>👥 {league.members?.length || 0}/{league.maxMembers}</span>
            <span>📅 {new Date(league.endDate).toLocaleDateString('tr-TR')}</span>
            {isOwner && (
              <span className="text-indigo-400">Kod: {league.code}</span>
            )}
          </div>
        </div>

        <Link
          href={`/custom-leagues/${league.id}`}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-sm font-medium transition-colors"
        >
          Görüntüle
        </Link>
      </div>
    </div>
  );
}
