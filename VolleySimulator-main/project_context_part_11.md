# Project Application Context - Part 11

## File: app\custom-leagues\page.tsx
```
"use client";

import { useState, useEffect } from "react";
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
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  });

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
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab.key
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
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      newLeague.isPrivate
                        ? 'bg-indigo-600 border-indigo-500 text-white'
                        : 'bg-slate-800 border-slate-700 text-slate-400'
                    }`}
                  >
                    🔒 Özel
                  </button>
                  <button
                    onClick={() => setNewLeague({ ...newLeague, isPrivate: false })}
                    className={`flex-1 px-4 py-3 rounded-xl border transition-colors ${
                      !newLeague.isPrivate
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
                      className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                        newLeague.leagues.includes(league)
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

```

## File: app\dashboard\page.tsx
```
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

// Stat Card Component
function StatCard({ 
  title, 
  value, 
  description, 
  icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  description?: string;
  icon: string;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <Card className="bg-slate-900/80 border-slate-800 hover:border-slate-700 transition-colors">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-slate-400">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-white">{value}</div>
        {description && (
          <p className="text-xs text-slate-500 mt-1">{description}</p>
        )}
        {trend && (
          <div className={`flex items-center gap-1 mt-2 text-xs ${trend.isPositive ? 'text-emerald-500' : 'text-red-500'}`}>
            <span>{trend.isPositive ? '↑' : '↓'}</span>
            <span>{Math.abs(trend.value)}% geçen haftaya göre</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// League Progress Card
function LeagueProgressCard({
  league,
  logo,
  completedMatches,
  totalMatches,
  predictedMatches,
}: {
  league: string;
  logo: string;
  completedMatches: number;
  totalMatches: number;
  predictedMatches: number;
}) {
  const completionPercent = Math.round((completedMatches / totalMatches) * 100);
  const predictionPercent = Math.round((predictedMatches / totalMatches) * 100);
  
  return (
    <Card className="bg-slate-900/80 border-slate-800">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={logo} alt={league} />
            <AvatarFallback className="bg-slate-800 text-xs">{league.substring(0, 2)}</AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-base text-white">{league}</CardTitle>
            <CardDescription className="text-xs">{completedMatches}/{totalMatches} maç oynandı</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Sezon İlerlemesi</span>
            <span className="text-slate-300">{completionPercent}%</span>
          </div>
          <Progress value={completionPercent} className="h-2" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Tahmin Oranın</span>
            <span className="text-emerald-400">{predictionPercent}%</span>
          </div>
          <Progress value={predictionPercent} className="h-2 [&>div]:bg-emerald-500" />
        </div>
      </CardContent>
    </Card>
  );
}

// Recent Activity Item
function ActivityItem({
  action,
  league,
  time,
  icon
}: {
  action: string;
  league: string;
  time: string;
  icon: string;
}) {
  return (
    <div className="flex items-center gap-3 py-3">
      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-white truncate">{action}</p>
        <p className="text-xs text-slate-500">{league}</p>
      </div>
      <span className="text-xs text-slate-600">{time}</span>
    </div>
  );
}

// Mock data for demonstration
const mockLeaderboard = [
  { rank: 1, name: 'voleybolcu42', points: 2847, avatar: '🥇', accuracy: 78 },
  { rank: 2, name: 'smash_master', points: 2654, avatar: '🥈', accuracy: 75 },
  { rank: 3, name: 'set_king', points: 2512, avatar: '🥉', accuracy: 72 },
  { rank: 4, name: 'ace_hunter', points: 2398, avatar: '🏐', accuracy: 70 },
  { rank: 5, name: 'block_star', points: 2256, avatar: '🏐', accuracy: 68 },
];

const mockUpcomingMatches = [
  { id: 1, home: 'Eczacıbaşı', away: 'VakıfBank', date: '05 Ocak', league: 'VSL' },
  { id: 2, home: 'Fenerbahçe', away: 'Galatasaray', date: '06 Ocak', league: 'VSL' },
  { id: 3, home: 'THY', away: 'Nilüfer', date: '06 Ocak', league: 'VSL' },
  { id: 4, home: 'Ankara DSİ', away: 'Kuzeyboru', date: '07 Ocak', league: '1. Lig' },
];

const mockActivities = [
  { action: 'VSL 15. Hafta tahminleri kaydedildi', league: 'Vestel Sultanlar Ligi', time: '2 dk', icon: '📝' },
  { action: 'Liderlik tablosunda 12. sıraya yükseldin', league: 'Genel', time: '1 sa', icon: '📈' },
  { action: 'Eczacıbaşı vs VakıfBank tahmini doğru!', league: 'VSL', time: '3 sa', icon: '✅' },
  { action: 'CEV Cup tahminleri tamamlandı', league: 'CEV Cup', time: '1 gün', icon: '🏆' },
];

export default function DashboardPage() {
  const [mounted, setMounted] = useState(() => {
    // Check if we're on client side
    return typeof window !== 'undefined';
  });

  // Handle hydration mismatch by checking window availability
  if (!mounted) {
    // This will only render on server, client will immediately have mounted=true
    if (typeof window !== 'undefined') {
      setMounted(true);
    }
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-slate-950/60">
        <div className="container flex h-14 items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🏐</span>
              <span className="font-bold text-white hidden sm:inline">VolleySimulator</span>
            </Link>
            <Badge variant="secondary" className="bg-emerald-900/50 text-emerald-400 border-emerald-800">
              Dashboard
            </Badge>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              🔔
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src="/avatars/user.png" />
                    <AvatarFallback className="bg-slate-800 text-xs">U</AvatarFallback>
                  </Avatar>
                  <span className="hidden sm:inline text-slate-300">Kullanıcı</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-slate-900 border-slate-800">
                <DropdownMenuLabel className="text-slate-400">Hesabım</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-800">
                  👤 Profil
                </DropdownMenuItem>
                <DropdownMenuItem className="text-slate-300 focus:bg-slate-800">
                  ⚙️ Ayarlar
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-800" />
                <DropdownMenuItem className="text-red-400 focus:bg-slate-800">
                  🚪 Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container px-4 py-6 space-y-6">
        {/* Welcome Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Hoş Geldin! 👋</h1>
            <p className="text-slate-400 mt-1">Tahminlerini takip et, istatistiklerini gör.</p>
          </div>
          <div className="flex gap-2">
            <Button asChild className="bg-emerald-600 hover:bg-emerald-500">
              <Link href="/vsl">Tahmin Yap</Link>
            </Button>
            <Button variant="outline" asChild className="border-slate-700 text-slate-300 hover:bg-slate-800">
              <Link href="/leaderboard">Sıralama</Link>
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Toplam Puan"
            value="2,847"
            icon="🏆"
            trend={{ value: 12, isPositive: true }}
          />
          <StatCard
            title="Sıralaman"
            value="#12"
            description="1,245 kullanıcı arasında"
            icon="📊"
          />
          <StatCard
            title="Doğru Tahmin"
            value="78%"
            description="Son 30 gün"
            icon="🎯"
            trend={{ value: 5, isPositive: true }}
          />
          <StatCard
            title="Tahmin Edilen"
            value="156"
            description="Toplam maç"
            icon="📝"
          />
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="bg-slate-900 border border-slate-800">
            <TabsTrigger value="overview" className="data-[state=active]:bg-slate-800">
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="leagues" className="data-[state=active]:bg-slate-800">
              Ligler
            </TabsTrigger>
            <TabsTrigger value="matches" className="data-[state=active]:bg-slate-800">
              Maçlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Leaderboard Preview */}
              <Card className="lg:col-span-2 bg-slate-900/80 border-slate-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-white">Liderlik Tablosu</CardTitle>
                      <CardDescription>En iyi tahmin edenler</CardDescription>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-slate-400">
                      <Link href="/leaderboard">Tümünü Gör →</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-slate-800 hover:bg-transparent">
                        <TableHead className="text-slate-400 w-12">#</TableHead>
                        <TableHead className="text-slate-400">Kullanıcı</TableHead>
                        <TableHead className="text-slate-400 text-right">Puan</TableHead>
                        <TableHead className="text-slate-400 text-right hidden sm:table-cell">Doğruluk</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {mockLeaderboard.map((user) => (
                        <TableRow key={user.rank} className="border-slate-800 hover:bg-slate-800/50">
                          <TableCell className="font-medium">
                            <span className="text-lg">{user.avatar}</span>
                          </TableCell>
                          <TableCell className="text-white font-medium">{user.name}</TableCell>
                          <TableCell className="text-right text-emerald-400 font-bold">{user.points.toLocaleString()}</TableCell>
                          <TableCell className="text-right text-slate-400 hidden sm:table-cell">{user.accuracy}%</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card className="bg-slate-900/80 border-slate-800">
                <CardHeader>
                  <CardTitle className="text-white">Son Aktiviteler</CardTitle>
                  <CardDescription>Senin aktivitelerin</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[280px] px-6">
                    {mockActivities.map((activity, idx) => (
                      <div key={idx}>
                        <ActivityItem {...activity} />
                        {idx < mockActivities.length - 1 && <Separator className="bg-slate-800" />}
                      </div>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="leagues" className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <LeagueProgressCard
                league="Vestel Sultanlar Ligi"
                logo="/logos/vsl.png"
                completedMatches={98}
                totalMatches={132}
                predictedMatches={85}
              />
              <LeagueProgressCard
                league="1. Lig"
                logo="/logos/1lig.png"
                completedMatches={72}
                totalMatches={110}
                predictedMatches={45}
              />
              <LeagueProgressCard
                league="2. Lig"
                logo="/logos/2lig.png"
                completedMatches={54}
                totalMatches={96}
                predictedMatches={20}
              />
              <LeagueProgressCard
                league="CEV Champions League"
                logo="/logos/cev-cl.png"
                completedMatches={24}
                totalMatches={48}
                predictedMatches={24}
              />
              <LeagueProgressCard
                league="CEV Cup"
                logo="/logos/cev-cup.png"
                completedMatches={16}
                totalMatches={32}
                predictedMatches={16}
              />
              <LeagueProgressCard
                league="CEV Challenge Cup"
                logo="/logos/cev-challenge.png"
                completedMatches={12}
                totalMatches={24}
                predictedMatches={8}
              />
            </div>
          </TabsContent>

          <TabsContent value="matches" className="space-y-4">
            <Card className="bg-slate-900/80 border-slate-800">
              <CardHeader>
                <CardTitle className="text-white">Yaklaşan Maçlar</CardTitle>
                <CardDescription>Tahmin bekleyen maçlar</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800 hover:bg-transparent">
                      <TableHead className="text-slate-400">Maç</TableHead>
                      <TableHead className="text-slate-400 text-center">Lig</TableHead>
                      <TableHead className="text-slate-400 text-right">Tarih</TableHead>
                      <TableHead className="text-slate-400 text-right">Aksiyon</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mockUpcomingMatches.map((match) => (
                      <TableRow key={match.id} className="border-slate-800 hover:bg-slate-800/50">
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{match.home}</span>
                            <span className="text-slate-500">vs</span>
                            <span className="text-white font-medium">{match.away}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="border-slate-700 text-slate-400">
                            {match.league}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right text-slate-400">{match.date}</TableCell>
                        <TableCell className="text-right">
                          <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-900/20">
                            Tahmin Et
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

```

## File: app\friends\page.tsx
```
"use client";

import { useState, useEffect } from "react";
import { useFriends } from "../context/FriendsContext";
import { useAuth } from "../context/AuthContext";
import TeamAvatar from "../components/TeamAvatar";
import Link from "next/link";

export default function FriendsPage() {
  const { user } = useAuth();
  const { 
    friends, 
    pendingRequests, 
    friendActivities,
    isLoading, 
    sendFriendRequest, 
    acceptFriendRequest, 
    rejectFriendRequest,
    removeFriend,
    searchUsers 
  } = useFriends();
  
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search' | 'activity'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Search users
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (searchQuery.length >= 2) {
        setIsSearching(true);
        const results = await searchUsers(searchQuery);
        setSearchResults(results);
        setIsSearching(false);
      } else {
        setSearchResults([]);
      }
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

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
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white">Arkadaşlar</h1>
          <p className="text-white/70 text-sm mt-1">
            {friends.length} arkadaş • {pendingRequests.length} bekleyen istek
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-2 py-4 border-b border-slate-800 overflow-x-auto">
          {[
            { key: 'friends', label: 'Arkadaşlar', icon: '👥', count: friends.length },
            { key: 'requests', label: 'İstekler', icon: '📩', count: pendingRequests.length },
            { key: 'search', label: 'Ara', icon: '🔍' },
            { key: 'activity', label: 'Aktivite', icon: '📊' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? 'bg-white/10 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className="bg-purple-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-6">
          {/* Friends List */}
          {activeTab === 'friends' && (
            <div className="space-y-3">
              {friends.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">👥</div>
                  <p className="text-slate-400">Henüz arkadaşınız yok</p>
                  <button
                    onClick={() => setActiveTab('search')}
                    className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Arkadaş Bul
                  </button>
                </div>
              ) : (
                friends.map(friend => (
                  <div
                    key={friend.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {friend.friend?.displayName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{friend.friend?.displayName}</h3>
                      <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>Lv.{friend.friend?.level || 1}</span>
                        <span>•</span>
                        <span>{friend.friend?.totalPoints || 0} puan</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/profile/${friend.friendId}`}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors"
                      >
                        Profil
                      </Link>
                      <button
                        onClick={() => removeFriend(friend.id)}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/40 text-red-400 rounded-lg text-sm transition-colors"
                      >
                        Çıkar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Pending Requests */}
          {activeTab === 'requests' && (
            <div className="space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📩</div>
                  <p className="text-slate-400">Bekleyen arkadaşlık isteği yok</p>
                </div>
              ) : (
                pendingRequests.map(request => (
                  <div
                    key={request.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                      {request.friend?.displayName?.charAt(0) || '?'}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-white">{request.friend?.displayName}</h3>
                      <p className="text-sm text-slate-400">Arkadaşlık isteği gönderdi</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptFriendRequest(request.id)}
                        className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Kabul Et
                      </button>
                      <button
                        onClick={() => rejectFriendRequest(request.id)}
                        className="px-4 py-1.5 bg-slate-700 hover:bg-slate-600 rounded-lg text-sm transition-colors"
                      >
                        Reddet
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Search */}
          {activeTab === 'search' && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Kullanıcı ara..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 pl-10 text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">🔍</span>
              </div>
              
              {isSearching && (
                <div className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full mx-auto"></div>
                </div>
              )}
              
              {!isSearching && searchResults.length > 0 && (
                <div className="space-y-3">
                  {searchResults.map(user => (
                    <div
                      key={user.id}
                      className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 flex items-center gap-4"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                        {user.displayName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">{user.displayName}</h3>
                        <p className="text-sm text-slate-400">Lv.{user.level || 1}</p>
                      </div>
                      <button
                        onClick={() => sendFriendRequest(user.id)}
                        className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium transition-colors"
                      >
                        Arkadaş Ekle
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-slate-400">Kullanıcı bulunamadı</p>
                </div>
              )}
            </div>
          )}

          {/* Activity Feed */}
          {activeTab === 'activity' && (
            <div className="space-y-3">
              {friendActivities.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">📊</div>
                  <p className="text-slate-400">Henüz aktivite yok</p>
                </div>
              ) : (
                friendActivities.map(activity => (
                  <div
                    key={activity.id}
                    className="bg-slate-900/50 border border-slate-800 rounded-xl p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                        {activity.user?.displayName?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1">
                        <p className="text-white">
                          <span className="font-bold">{activity.user?.displayName}</span>
                          {' '}{activity.description}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(activity.createdAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                      <span className="text-2xl">{getActivityIcon(activity.activityType)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function getActivityIcon(type: string): string {
  switch (type) {
    case 'prediction': return '🎯';
    case 'achievement': return '🏆';
    case 'level_up': return '⬆️';
    case 'badge': return '🎖️';
    case 'streak': return '🔥';
    default: return '📌';
  }
}

```

## File: app\hooks\index.ts
```
// Hooks barrel export
export { useLocalStorage } from './useLocalStorage';
export { usePredictions } from './usePredictions';
export { useSimulationEngine } from './useSimulationEngine';
export { useUndoableAction } from './useUndoableAction';
export { useUserStats } from './useUserStats';
export { useLeagueQuery, useLeagueData, useInvalidateLeague } from './useLeagueQuery';
export { useWebVitals, useNavigationTiming } from './usePerformance';
export { usePushNotifications } from './usePushNotifications';
export { useModal } from './useModal';

```

## File: app\hooks\useAdvancedStats.ts
```
"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { 
  TeamDetailedStats, 
  UserPredictionStats, 
  HeadToHeadStats,
  TeamForm
} from "../types";

interface TeamStatsInput {
  name: string;
  played: number;
  wins: number;
  points: number;
  setsWon: number;
  setsLost: number;
}

interface MatchResult {
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  date?: string;
}

export function useAdvancedStats(teams: TeamStatsInput[], matches: MatchResult[]) {
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Calculate detailed stats for all teams
  const teamStats = useMemo((): Map<string, TeamDetailedStats> => {
    const stats = new Map<string, TeamDetailedStats>();
    
    teams.forEach(team => {
      const teamMatches = matches.filter(
        m => m.homeTeam === team.name || m.awayTeam === team.name
      );
      
      const homeMatches = teamMatches.filter(m => m.homeTeam === team.name);
      const awayMatches = teamMatches.filter(m => m.awayTeam === team.name);
      
      const homeWins = homeMatches.filter(m => m.homeScore > m.awayScore).length;
      const awayWins = awayMatches.filter(m => m.awayScore > m.homeScore).length;
      
      // Calculate score-specific wins/losses
      const threeZeroWins = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 3 && m.awayScore === 0) ||
        (m.awayTeam === team.name && m.awayScore === 3 && m.homeScore === 0)
      ).length;
      
      const threeOneWins = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 3 && m.awayScore === 1) ||
        (m.awayTeam === team.name && m.awayScore === 3 && m.homeScore === 1)
      ).length;
      
      const threeTwoWins = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 3 && m.awayScore === 2) ||
        (m.awayTeam === team.name && m.awayScore === 3 && m.homeScore === 2)
      ).length;
      
      const threeZeroLosses = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 0 && m.awayScore === 3) ||
        (m.awayTeam === team.name && m.awayScore === 0 && m.homeScore === 3)
      ).length;
      
      const threeOneLosses = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 1 && m.awayScore === 3) ||
        (m.awayTeam === team.name && m.awayScore === 1 && m.homeScore === 3)
      ).length;
      
      const threeTwoLosses = teamMatches.filter(m => 
        (m.homeTeam === team.name && m.homeScore === 2 && m.awayScore === 3) ||
        (m.awayTeam === team.name && m.awayScore === 2 && m.homeScore === 3)
      ).length;
      
      // Calculate last 10 results
      const sortedMatches = [...teamMatches].sort((a, b) => 
        new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()
      );
      
      const last10: ('W' | 'L')[] = sortedMatches.slice(0, 10).map(m => {
        const isHome = m.homeTeam === team.name;
        const won = isHome ? m.homeScore > m.awayScore : m.awayScore > m.homeScore;
        return won ? 'W' : 'L';
      });
      
      // Calculate current streak
      let currentStreak = 0;
      let streakType: 'W' | 'L' = 'W';
      
      for (const result of last10) {
        if (currentStreak === 0) {
          streakType = result;
          currentStreak = 1;
        } else if (result === streakType) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      // ELO rating calculation (simplified)
      const eloRating = 1500 + (team.wins * 30) - ((team.played - team.wins) * 20) + 
        (team.setsWon - team.setsLost) * 2;
      
      stats.set(team.name, {
        teamName: team.name,
        league: '',
        season: '',
        played: team.played,
        wins: team.wins,
        losses: team.played - team.wins,
        points: team.points,
        setsWon: team.setsWon,
        setsLost: team.setsLost,
        setRatio: team.setsLost > 0 ? team.setsWon / team.setsLost : team.setsWon,
        avgPointsPerSet: team.setsWon > 0 ? (team.points / team.setsWon) * 25 : 0,
        avgPointsConcededPerSet: team.setsLost > 0 ? (team.points / team.setsLost) * 20 : 0,
        homeRecord: { wins: homeWins, losses: homeMatches.length - homeWins },
        awayRecord: { wins: awayWins, losses: awayMatches.length - awayWins },
        threeZeroWins,
        threeOneWins,
        threeTwoWins,
        threeZeroLosses,
        threeOneLosses,
        threeTwoLosses,
        currentStreak,
        streakType,
        last10,
        eloRating,
        strengthRank: 0, // Will be calculated after
      });
    });
    
    // Calculate strength rank
    const sortedByElo = [...stats.entries()]
      .sort((a, b) => b[1].eloRating - a[1].eloRating);
    
    sortedByElo.forEach(([name, teamStat], index) => {
      teamStat.strengthRank = index + 1;
      stats.set(name, teamStat);
    });
    
    return stats;
  }, [teams, matches]);

  // Get head-to-head stats between two teams
  const getHeadToHead = useCallback((team1: string, team2: string): HeadToHeadStats => {
    const h2hMatches = matches.filter(
      m => (m.homeTeam === team1 && m.awayTeam === team2) ||
           (m.homeTeam === team2 && m.awayTeam === team1)
    );
    
    let team1Wins = 0;
    let team2Wins = 0;
    let team1Sets = 0;
    let team2Sets = 0;
    
    h2hMatches.forEach(m => {
      const isTeam1Home = m.homeTeam === team1;
      if (isTeam1Home) {
        if (m.homeScore > m.awayScore) team1Wins++;
        else team2Wins++;
        team1Sets += m.homeScore;
        team2Sets += m.awayScore;
      } else {
        if (m.awayScore > m.homeScore) team1Wins++;
        else team2Wins++;
        team1Sets += m.awayScore;
        team2Sets += m.homeScore;
      }
    });
    
    return {
      totalMatches: h2hMatches.length,
      homeWins: team1Wins,
      awayWins: team2Wins,
      homeSetWins: team1Sets,
      awaySetWins: team2Sets,
      lastMeetings: h2hMatches.slice(0, 5).map(m => ({
        date: m.date || '',
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        score: `${m.homeScore}-${m.awayScore}`,
        venue: '',
        competition: '',
      })),
      averageHomeScore: h2hMatches.length > 0 ? team1Sets / h2hMatches.length : 0,
      averageAwayScore: h2hMatches.length > 0 ? team2Sets / h2hMatches.length : 0,
    };
  }, [matches]);

  // Get team form
  const getTeamForm = useCallback((teamName: string): TeamForm => {
    const teamData = teamStats.get(teamName);
    
    if (!teamData) {
      return {
        teamName,
        last5Results: [],
        last5Scores: [],
        winRate: 0,
        avgPointsScored: 0,
        avgPointsConceded: 0,
        trend: 'stable',
        strengthRating: 0,
      };
    }
    
    const last5 = teamData.last10.slice(0, 5) as ('W' | 'L')[];
    const recentWins = last5.filter(r => r === 'W').length;
    const previousWins = teamData.last10.slice(5, 10).filter(r => r === 'W').length;
    
    let trend: 'improving' | 'declining' | 'stable' = 'stable';
    if (recentWins > previousWins + 1) trend = 'improving';
    else if (recentWins < previousWins - 1) trend = 'declining';
    
    return {
      teamName,
      last5Results: last5,
      last5Scores: [],
      winRate: teamData.played > 0 ? (teamData.wins / teamData.played) * 100 : 0,
      avgPointsScored: teamData.avgPointsPerSet,
      avgPointsConceded: teamData.avgPointsConcededPerSet,
      trend,
      strengthRating: teamData.eloRating,
    };
  }, [teamStats]);

  // Get top performers in various categories
  const getTopPerformers = useCallback((category: keyof TeamDetailedStats, count: number = 5) => {
    return [...teamStats.values()]
      .sort((a, b) => {
        const aVal = a[category];
        const bVal = b[category];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return bVal - aVal;
        }
        return 0;
      })
      .slice(0, count);
  }, [teamStats]);

  // Get comparison between teams
  const compareTeams = useCallback((team1: string, team2: string) => {
    const stats1 = teamStats.get(team1);
    const stats2 = teamStats.get(team2);
    
    if (!stats1 || !stats2) return null;
    
    const h2h = getHeadToHead(team1, team2);
    
    return {
      team1: stats1,
      team2: stats2,
      headToHead: h2h,
      comparison: {
        winRate: {
          team1: stats1.played > 0 ? (stats1.wins / stats1.played) * 100 : 0,
          team2: stats2.played > 0 ? (stats2.wins / stats2.played) * 100 : 0,
        },
        setRatio: {
          team1: stats1.setRatio,
          team2: stats2.setRatio,
        },
        elo: {
          team1: stats1.eloRating,
          team2: stats2.eloRating,
        },
        form: {
          team1: stats1.last10.slice(0, 5).filter(r => r === 'W').length,
          team2: stats2.last10.slice(0, 5).filter(r => r === 'W').length,
        },
      },
    };
  }, [teamStats, getHeadToHead]);

  return {
    teamStats,
    selectedTeam,
    setSelectedTeam,
    getHeadToHead,
    getTeamForm,
    getTopPerformers,
    compareTeams,
    isLoading,
    getTeamDetails: (name: string) => teamStats.get(name),
  };
}

// Hook for user prediction stats
export function useUserPredictionStats(userId: string) {
  const [stats, setStats] = useState<UserPredictionStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!userId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/users/${userId}/prediction-stats`);
      
      if (!response.ok) throw new Error('Failed to fetch prediction stats');
      
      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    error,
    refetch: fetchStats,
  };
}

```

## File: app\hooks\useAIPredictions.ts
```
"use client";

import { useState, useCallback } from "react";
import { 
  AIPrediction, 
  AIMatchAnalysis, 
  HeadToHeadStats, 
  TeamForm 
} from "../types";

interface UseAIPredictionsOptions {
  cacheTime?: number; // ms
}

interface UseAIPredictionsReturn {
  isLoading: boolean;
  error: string | null;
  getPrediction: (homeTeam: string, awayTeam: string, league: string) => Promise<AIPrediction | null>;
  getMatchAnalysis: (homeTeam: string, awayTeam: string, league: string) => Promise<AIMatchAnalysis | null>;
  getHeadToHead: (team1: string, team2: string) => Promise<HeadToHeadStats | null>;
  getTeamForm: (teamName: string, league: string) => Promise<TeamForm | null>;
  getBulkPredictions: (matches: { homeTeam: string; awayTeam: string }[], league: string) => Promise<AIPrediction[]>;
}

// Simple in-memory cache
const predictionCache = new Map<string, { data: AIPrediction; timestamp: number }>();
const analysisCache = new Map<string, { data: AIMatchAnalysis; timestamp: number }>();

export function useAIPredictions(options: UseAIPredictionsOptions = {}): UseAIPredictionsReturn {
  const { cacheTime = 5 * 60 * 1000 } = options; // 5 minutes default
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get AI prediction for a match
  const getPrediction = useCallback(async (
    homeTeam: string, 
    awayTeam: string, 
    league: string
  ): Promise<AIPrediction | null> => {
    const cacheKey = `${league}-${homeTeam}-${awayTeam}`;
    
    // Check cache
    const cached = predictionCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeTeam, awayTeam, league }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI prediction');
      }
      
      const data = await response.json();
      const prediction = data.prediction as AIPrediction;
      
      // Cache result
      predictionCache.set(cacheKey, { data: prediction, timestamp: Date.now() });
      
      return prediction;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cacheTime]);

  // Get detailed match analysis
  const getMatchAnalysis = useCallback(async (
    homeTeam: string, 
    awayTeam: string, 
    league: string
  ): Promise<AIMatchAnalysis | null> => {
    const cacheKey = `analysis-${league}-${homeTeam}-${awayTeam}`;
    
    // Check cache
    const cached = analysisCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeTeam, awayTeam, league }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get match analysis');
      }
      
      const data = await response.json();
      const analysis = data.analysis as AIMatchAnalysis;
      
      // Cache result
      analysisCache.set(cacheKey, { data: analysis, timestamp: Date.now() });
      
      return analysis;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cacheTime]);

  // Get head-to-head stats
  const getHeadToHead = useCallback(async (
    team1: string, 
    team2: string
  ): Promise<HeadToHeadStats | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stats/h2h?team1=${encodeURIComponent(team1)}&team2=${encodeURIComponent(team2)}`);
      
      if (!response.ok) {
        throw new Error('Failed to get head-to-head stats');
      }
      
      const data = await response.json();
      return data.stats as HeadToHeadStats;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get team form
  const getTeamForm = useCallback(async (
    teamName: string, 
    league: string
  ): Promise<TeamForm | null> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/stats/form?team=${encodeURIComponent(teamName)}&league=${encodeURIComponent(league)}`);
      
      if (!response.ok) {
        throw new Error('Failed to get team form');
      }
      
      const data = await response.json();
      return data.form as TeamForm;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Get bulk predictions for multiple matches
  const getBulkPredictions = useCallback(async (
    matches: { homeTeam: string; awayTeam: string }[],
    league: string
  ): Promise<AIPrediction[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/ai/predict/bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ matches, league }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to get bulk predictions');
      }
      
      const data = await response.json();
      return data.predictions as AIPrediction[];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    getPrediction,
    getMatchAnalysis,
    getHeadToHead,
    getTeamForm,
    getBulkPredictions,
  };
}

// Utility function to generate simple AI prediction locally (fallback)
export function generateLocalPrediction(
  homeTeam: string,
  awayTeam: string,
  homeStats: { wins: number; played: number; setsWon: number; setsLost: number },
  awayStats: { wins: number; played: number; setsWon: number; setsLost: number }
): AIPrediction {
  // Calculate win rates
  const homeWinRate = homeStats.played > 0 ? homeStats.wins / homeStats.played : 0.5;
  const awayWinRate = awayStats.played > 0 ? awayStats.wins / awayStats.played : 0.5;
  
  // Calculate set ratios
  const homeSetRatio = homeStats.setsLost > 0 ? homeStats.setsWon / homeStats.setsLost : homeStats.setsWon || 1;
  const awaySetRatio = awayStats.setsLost > 0 ? awayStats.setsWon / awayStats.setsLost : awayStats.setsWon || 1;
  
  // Home advantage factor
  const homeAdvantage = 0.05;
  
  // Calculate probabilities
  let homeWinProb = (homeWinRate + homeAdvantage + (1 - awayWinRate)) / 2;
  let awayWinProb = 1 - homeWinProb;
  
  // Adjust based on set ratio
  const setRatioFactor = homeSetRatio / (homeSetRatio + awaySetRatio);
  homeWinProb = (homeWinProb + setRatioFactor) / 2;
  awayWinProb = 1 - homeWinProb;
  
  // Normalize to percentages
  homeWinProb = Math.round(homeWinProb * 100);
  awayWinProb = Math.round(awayWinProb * 100);
  
  // Determine predicted score
  let predictedScore: string;
  if (homeWinProb > 65) {
    predictedScore = '3-0';
  } else if (homeWinProb > 55) {
    predictedScore = '3-1';
  } else if (homeWinProb > 45) {
    predictedScore = homeWinProb > 50 ? '3-2' : '2-3';
  } else if (awayWinProb > 55) {
    predictedScore = '1-3';
  } else {
    predictedScore = '0-3';
  }
  
  // Calculate confidence
  const confidence = Math.max(homeWinProb, awayWinProb);
  
  return {
    matchId: `${homeTeam}-${awayTeam}`,
    homeTeam,
    awayTeam,
    predictedScore,
    confidence,
    homeWinProbability: homeWinProb,
    awayWinProbability: awayWinProb,
    analysis: generateAnalysisText(homeTeam, awayTeam, homeWinProb, awayWinProb),
    factors: [
      {
        name: 'Galibiyet Oranı',
        description: `${homeTeam}: ${Math.round(homeWinRate * 100)}%, ${awayTeam}: ${Math.round(awayWinRate * 100)}%`,
        impact: homeWinRate > awayWinRate ? 'positive' : 'negative',
        weight: 0.4,
        team: homeWinRate > awayWinRate ? 'home' : 'away',
      },
      {
        name: 'Set Oranı',
        description: `${homeTeam}: ${homeSetRatio.toFixed(2)}, ${awayTeam}: ${awaySetRatio.toFixed(2)}`,
        impact: homeSetRatio > awaySetRatio ? 'positive' : 'negative',
        weight: 0.3,
        team: homeSetRatio > awaySetRatio ? 'home' : 'away',
      },
      {
        name: 'Ev Sahibi Avantajı',
        description: `${homeTeam} ev sahibi olarak oynuyor`,
        impact: 'positive',
        weight: 0.15,
        team: 'home',
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

function generateAnalysisText(
  homeTeam: string, 
  awayTeam: string, 
  homeWinProb: number, 
  awayWinProb: number
): string {
  if (homeWinProb > 70) {
    return `${homeTeam} bu maçta açık favori. Ev sahibi avantajı ve form durumu göz önüne alındığında rahat bir galibiyet bekleniyor.`;
  } else if (homeWinProb > 55) {
    return `${homeTeam} hafif favori görünüyor. Ancak ${awayTeam} sürpriz yapabilecek kapasitede. Çekişmeli bir maç olması bekleniyor.`;
  } else if (awayWinProb > 55) {
    return `${awayTeam} deplasmana rağmen favorisi. ${homeTeam} ev sahibi avantajını kullanmakta zorlanabilir.`;
  } else {
    return `İki takım arasında dengeli bir mücadele bekleniyor. Her iki taraf da galibiyete yakın, maç son setlere gidebilir.`;
  }
}

```

## File: app\hooks\useLeagueQuery.ts
```
"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { TeamStats, Match } from '../types';

interface RoundData {
    name?: string;
    matches?: Match[];
}

interface PoolData {
    name?: string;
    teams?: TeamStats[];
}

interface LeagueData {
    teams: TeamStats[];
    fixture: Match[];
    groups?: string[];
    rounds?: RoundData[];
    pools?: PoolData[];
}

interface LeagueConfig {
    hasGroups: boolean;
    apiEndpoint: string;
    name: string;
}

export function useLeagueQuery(
    leagueId: string,
    config: LeagueConfig,
    options?: {
        enabled?: boolean;
    }
) {
    return useQuery({
        queryKey: ['league', leagueId],
        queryFn: async () => {
            const res = await fetch(config.apiEndpoint);
            if (!res.ok) throw new Error(`Failed to fetch ${leagueId} data`);

            const json = await res.json();

            // Normalize data structure
            const normalizedData: LeagueData = {
                teams: json.teams || [],
                fixture: json.fixture || json.matches || [],
                groups: json.groups || (config.hasGroups ? extractGroups(json.teams) : undefined),
                rounds: json.rounds || undefined,
                pools: json.pools || undefined
            };

            return normalizedData;
        },
        staleTime: 1000 * 60 * 10, // 10 minutes
        gcTime: 1000 * 60 * 30, // 30 minutes
        retry: 2,
        enabled: options?.enabled !== false,
    });
}

export function useLeagueData(leagueId: string, config: LeagueConfig) {
    return useQuery({
        queryKey: ['league', leagueId, 'data'],
        queryFn: async () => {
            const res = await fetch(config.apiEndpoint);
            if (!res.ok) throw new Error(`Failed to fetch ${leagueId} data`);
            return res.json();
        },
        staleTime: 1000 * 60 * 10,
        gcTime: 1000 * 60 * 30,
        retry: 2,
    });
}

export function useInvalidateLeague(leagueId: string) {
    const queryClient = useQueryClient();
    
    return {
        invalidate: () => {
            queryClient.invalidateQueries({
                queryKey: ['league', leagueId]
            });
        },
        refetch: () => {
            queryClient.refetchQueries({
                queryKey: ['league', leagueId]
            });
        }
    };
}

// Helper to extract unique groups from teams
function extractGroups(teams: TeamStats[]): string[] {
    const groups = [...new Set(teams.map(t => t.groupName))].filter(Boolean);
    return groups.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)?.[0] || '0');
        const numB = parseInt(b.match(/\d+/)?.[0] || '0');
        return numA - numB;
    });
}

```

## File: app\hooks\useLocalStorage.ts
```
"use client";

import { useState, useEffect, useCallback } from 'react';

/**
 * Type-safe localStorage hook with SSR support
 */
export function useLocalStorage<T>(
    key: string,
    initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
    // State to store our value
    const [storedValue, setStoredValue] = useState<T>(initialValue);
    const [isHydrated, setIsHydrated] = useState(false);

    // Hydrate from localStorage after mount
    useEffect(() => {
        try {
            const item = window.localStorage.getItem(key);
            if (item) {
                setStoredValue(JSON.parse(item));
            }
        } catch (error) {
            console.warn(`Error reading localStorage key "${key}":`, error);
        }
        setIsHydrated(true);
    }, [key]);

    // Return a wrapped version of useState's setter function
    const setValue = useCallback((value: T | ((prev: T) => T)) => {
        try {
            // Allow value to be a function for same API as useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);

            if (typeof window !== 'undefined') {
                window.localStorage.setItem(key, JSON.stringify(valueToStore));
            }
        } catch (error) {
            console.warn(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, storedValue]);

    // Remove from localStorage
    const removeValue = useCallback(() => {
        try {
            setStoredValue(initialValue);
            if (typeof window !== 'undefined') {
                window.localStorage.removeItem(key);
            }
        } catch (error) {
            console.warn(`Error removing localStorage key "${key}":`, error);
        }
    }, [key, initialValue]);

    return [storedValue, setValue, removeValue];
}

export default useLocalStorage;

```

## File: app\hooks\useMatchSimulation.ts
```
"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { 
  MatchSimulation, 
  SimulatedSet, 
  SimulatedPoint,
  SimulationMoment 
} from "../types";

interface UseMatchSimulationOptions {
  speed?: number; // Animation speed multiplier
  autoPlay?: boolean;
}

interface UseMatchSimulationReturn {
  simulation: MatchSimulation | null;
  isSimulating: boolean;
  isPlaying: boolean;
  currentSet: number;
  currentPoint: number;
  progress: number; // 0-100
  // Actions
  startSimulation: (homeTeam: string, awayTeam: string) => Promise<void>;
  play: () => void;
  pause: () => void;
  reset: () => void;
  skipToEnd: () => void;
  setSpeed: (speed: number) => void;
}

export function useMatchSimulation(
  options: UseMatchSimulationOptions = {}
): UseMatchSimulationReturn {
  const { speed: initialSpeed = 1, autoPlay = true } = options;
  
  const [simulation, setSimulation] = useState<MatchSimulation | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSet, setCurrentSet] = useState(0);
  const [currentPoint, setCurrentPoint] = useState(0);
  const [speed, setSpeedState] = useState(initialSpeed);
  
  const animationRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef(0);

  // Calculate progress
  const progress = simulation 
    ? (progressRef.current / simulation.duration) * 100 
    : 0;

  // Generate a simulated match
  const generateSimulation = useCallback((
    homeTeam: string, 
    awayTeam: string
  ): MatchSimulation => {
    const sets: SimulatedSet[] = [];
    let homeSetsWon = 0;
    let awaySetsWon = 0;
    let setNumber = 0;
    const moments: SimulationMoment[] = [];
    let totalDuration = 0;
    
    // Simulate sets until one team wins 3
    while (homeSetsWon < 3 && awaySetsWon < 3) {
      setNumber++;
      const isDecidingSet = homeSetsWon === 2 && awaySetsWon === 2;
      const setEndScore = isDecidingSet ? 15 : 25;
      
      const set = simulateSet(setNumber, setEndScore, homeTeam, awayTeam);
      sets.push(set);
      
      if (set.winner === 'home') {
        homeSetsWon++;
      } else {
        awaySetsWon++;
      }
      
      // Add set end moment
      moments.push({
        time: totalDuration + set.pointByPoint.length * 2,
        type: 'set_point',
        description: `${set.winner === 'home' ? homeTeam : awayTeam} ${setNumber}. seti kazandı (${set.homePoints}-${set.awayPoints})`,
      });
      
      totalDuration += set.pointByPoint.length * 2;
    }
    
    const winner = homeSetsWon === 3 ? homeTeam : awayTeam;
    
    // Add match end moment
    moments.push({
      time: totalDuration,
      type: 'match_point',
      description: `${winner} maçı kazandı! (${homeSetsWon}-${awaySetsWon})`,
    });
    
    return {
      matchId: `sim-${Date.now()}`,
      homeTeam,
      awayTeam,
      simulatedSets: sets,
      finalScore: `${homeSetsWon}-${awaySetsWon}`,
      winner,
      keyMoments: moments,
      duration: totalDuration,
    };
  }, []);

  // Simulate a single set
  const simulateSet = (
    setNumber: number, 
    endScore: number,
    homeTeam: string,
    awayTeam: string
  ): SimulatedSet => {
    const points: SimulatedPoint[] = [];
    let homeScore = 0;
    let awayScore = 0;
    let pointNumber = 0;
    
    // Randomly determine which team is slightly favored
    const homeBias = 0.48 + Math.random() * 0.08; // 48-56% for home
    
    while (true) {
      pointNumber++;
      
      // Determine point type
      const types: Array<'attack' | 'block' | 'ace' | 'error'> = ['attack', 'attack', 'attack', 'block', 'ace', 'error'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      // Determine scorer
      const scorer = Math.random() < homeBias ? 'home' : 'away';
      
      if (scorer === 'home') {
        homeScore++;
      } else {
        awayScore++;
      }
      
      points.push({
        pointNumber,
        homeScore,
        awayScore,
        scorer,
        type,
      });
      
      // Check if set is over
      const maxScore = Math.max(homeScore, awayScore);
      const minScore = Math.min(homeScore, awayScore);
      
      if (maxScore >= endScore && maxScore - minScore >= 2) {
        break;
      }
      
      // Safety limit
      if (pointNumber > 100) break;
    }
    
    return {
      setNumber,
      homePoints: homeScore,
      awayPoints: awayScore,
      winner: homeScore > awayScore ? 'home' : 'away',
      pointByPoint: points,
    };
  };

  // Start simulation
  const startSimulation = useCallback(async (
    homeTeam: string, 
    awayTeam: string
  ) => {
    setIsSimulating(true);
    setCurrentSet(0);
    setCurrentPoint(0);
    progressRef.current = 0;
    
    // Generate simulation
    const sim = generateSimulation(homeTeam, awayTeam);
    setSimulation(sim);
    setIsSimulating(false);
    
    if (autoPlay) {
      setIsPlaying(true);
    }
  }, [generateSimulation, autoPlay]);

  // Play animation
  const play = useCallback(() => {
    if (!simulation) return;
    setIsPlaying(true);
  }, [simulation]);

  // Pause animation
  const pause = useCallback(() => {
    setIsPlaying(false);
    if (animationRef.current) {
      clearTimeout(animationRef.current);
      animationRef.current = null;
    }
  }, []);

  // Reset simulation
  const reset = useCallback(() => {
    pause();
    setCurrentSet(0);
    setCurrentPoint(0);
    progressRef.current = 0;
  }, [pause]);

  // Skip to end
  const skipToEnd = useCallback(() => {
    if (!simulation) return;
    
    pause();
    setCurrentSet(simulation.simulatedSets.length - 1);
    const lastSet = simulation.simulatedSets[simulation.simulatedSets.length - 1];
    setCurrentPoint(lastSet.pointByPoint.length - 1);
    progressRef.current = simulation.duration;
  }, [simulation, pause]);

  // Set speed
  const setSpeed = useCallback((newSpeed: number) => {
    setSpeedState(Math.max(0.25, Math.min(4, newSpeed)));
  }, []);

  // Animation loop
  useEffect(() => {
    if (!isPlaying || !simulation) return;
    
    const animate = () => {
      progressRef.current += 2 * speed;
      
      // Find current set and point based on progress
      let elapsed = 0;
      let foundSet = 0;
      let foundPoint = 0;
      
      for (let s = 0; s < simulation.simulatedSets.length; s++) {
        const set = simulation.simulatedSets[s];
        for (let p = 0; p < set.pointByPoint.length; p++) {
          elapsed += 2;
          if (elapsed >= progressRef.current) {
            foundSet = s;
            foundPoint = p;
            break;
          }
        }
        if (elapsed >= progressRef.current) break;
      }
      
      setCurrentSet(foundSet);
      setCurrentPoint(foundPoint);
      
      // Check if animation is complete
      if (progressRef.current >= simulation.duration) {
        setIsPlaying(false);
        return;
      }
      
      animationRef.current = setTimeout(animate, 50 / speed);
    };
    
    animationRef.current = setTimeout(animate, 50 / speed);
    
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [isPlaying, simulation, speed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, []);

  return {
    simulation,
    isSimulating,
    isPlaying,
    currentSet,
    currentPoint,
    progress,
    startSimulation,
    play,
    pause,
    reset,
    skipToEnd,
    setSpeed,
  };
}

// Utility to get current state of simulation
export function getSimulationState(
  simulation: MatchSimulation,
  setIndex: number,
  pointIndex: number
) {
  const currentSetData = simulation.simulatedSets[setIndex];
  const currentPointData = currentSetData?.pointByPoint[pointIndex];
  
  let homeSetsWon = 0;
  let awaySetsWon = 0;
  
  for (let i = 0; i < setIndex; i++) {
    if (simulation.simulatedSets[i].winner === 'home') {
      homeSetsWon++;
    } else {
      awaySetsWon++;
    }
  }
  
  return {
    setScore: { home: homeSetsWon, away: awaySetsWon },
    currentSetScore: currentPointData 
      ? { home: currentPointData.homeScore, away: currentPointData.awayScore }
      : { home: 0, away: 0 },
    lastPoint: currentPointData,
    isComplete: setIndex >= simulation.simulatedSets.length - 1 && 
      pointIndex >= currentSetData.pointByPoint.length - 1,
  };
}

```

## File: app\hooks\useModal.ts
```
'use client';

import { useEffect, useCallback, useRef } from 'react';

interface UseModalOptions {
  isOpen: boolean;
  onClose: () => void;
  closeOnEscape?: boolean;
  closeOnBackdrop?: boolean;
  trapFocus?: boolean;
}

/**
 * Hook for accessible modal behavior
 * - Escape key to close
 * - Focus trap within modal
 * - Click outside to close
 * - Prevents body scroll when open
 */
export function useModal({
  isOpen,
  onClose,
  closeOnEscape = true,
  closeOnBackdrop = true,
  trapFocus = true,
}: UseModalOptions) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (closeOnEscape && e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }

      // Focus trap
      if (trapFocus && e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    },
    [closeOnEscape, trapFocus, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose]
  );

  useEffect(() => {
    if (isOpen) {
      // Store current active element
      previousActiveElement.current = document.activeElement as HTMLElement;
      
      // Add event listener
      document.addEventListener('keydown', handleKeyDown);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus first focusable element in modal
      if (trapFocus && modalRef.current) {
        const firstFocusable = modalRef.current.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        firstFocusable?.focus();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
      
      // Restore focus to previous element
      if (previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isOpen, handleKeyDown, trapFocus]);

  return {
    modalRef,
    handleBackdropClick,
  };
}

```

## File: app\hooks\usePerformance.ts
```
"use client";

import { useEffect } from 'react';

declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
    }
}

// Extended PerformanceEntry types for Web Vitals
interface LCPEntry extends PerformanceEntry {
    renderTime?: number;
    loadTime?: number;
}

interface LayoutShiftEntry extends PerformanceEntry {
    hadRecentInput?: boolean;
    value: number;
}

interface InteractionEntry extends PerformanceEntry {
    processingDuration?: number;
}

interface WebVitals {
    name: string;
    value: number;
    rating?: 'good' | 'needs-improvement' | 'poor';
}

/**
 * Track Web Vitals (LCP, FID, CLS)
 * Useful for performance monitoring and optimization
 */
export function useWebVitals() {
    useEffect(() => {
        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
            try {
                const lcpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    const lastEntry = entries[entries.length - 1] as LCPEntry;
                    if (lastEntry) {
                        const vital: WebVitals = {
                            name: 'LCP',
                            value: lastEntry.renderTime || lastEntry.loadTime || lastEntry.startTime || 0,
                        };
                        // LCP > 2.5s is poor
                        if (vital.value > 2500) {
                            vital.rating = 'poor';
                        } else if (vital.value > 1200) {
                            vital.rating = 'needs-improvement';
                        } else {
                            vital.rating = 'good';
                        }
                        sendAnalytics(vital);
                    }
                });
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'], buffered: true });
            } catch {
                console.warn('LCP observer not supported');
            }

            // Cumulative Layout Shift
            try {
                const clsObserver = new PerformanceObserver((entryList) => {
                    let clsValue = 0;
                    for (const entry of entryList.getEntries()) {
                        const shiftEntry = entry as LayoutShiftEntry;
                        if (shiftEntry.hadRecentInput) continue;
                        clsValue += shiftEntry.value;
                    }
                    const vital: WebVitals = {
                        name: 'CLS',
                        value: clsValue,
                    };
                    // CLS > 0.25 is poor
                    if (vital.value > 0.25) {
                        vital.rating = 'poor';
                    } else if (vital.value > 0.1) {
                        vital.rating = 'needs-improvement';
                    } else {
                        vital.rating = 'good';
                    }
                    sendAnalytics(vital);
                });
                clsObserver.observe({ type: 'layout-shift', buffered: true });
            } catch {
                console.warn('CLS observer not supported');
            }

            // First Input Delay / Interaction to Next Paint
            try {
                const ttpObserver = new PerformanceObserver((entryList) => {
                    const entries = entryList.getEntries();
                    if (entries.length > 0) {
                        const entry = entries[0] as InteractionEntry;
                        const vital: WebVitals = {
                            name: 'INP',
                            value: entry.processingDuration || 0,
                        };
                        // INP > 500ms is poor
                        if (vital.value > 500) {
                            vital.rating = 'poor';
                        } else if (vital.value > 200) {
                            vital.rating = 'needs-improvement';
                        } else {
                            vital.rating = 'good';
                        }
                        sendAnalytics(vital);
                    }
                });
                ttpObserver.observe({ entryTypes: ['first-input', 'interaction'], buffered: true });
            } catch {
                console.warn('INP observer not supported');
            }
        }
    }, []);
}

function sendAnalytics(vital: WebVitals) {
    // Send to Google Analytics if available
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', vital.name, {
            value: Math.round(vital.value),
            event_category: 'Web Vitals',
            event_label: vital.name,
            non_interaction: true,
        });
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log(`[${vital.name}] ${vital.value}ms - ${vital.rating}`);
    }
}

/**
 * Track Navigation Timing
 */
export function useNavigationTiming() {
    useEffect(() => {
        const logNavigationMetrics = () => {
            if (typeof window !== 'undefined' && 'performance' in window) {
                const perfData = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
                
                if (perfData) {
                    const metrics = {
                        'DNS Lookup': perfData.domainLookupEnd - perfData.domainLookupStart,
                        'TCP Connection': perfData.connectEnd - perfData.connectStart,
                        'Request Time': perfData.responseStart - perfData.requestStart,
                        'Response Time': perfData.responseEnd - perfData.responseStart,
                        'DOM Processing': perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
                        'Page Load Time': perfData.loadEventEnd - perfData.loadEventStart,
                        'Total Time to Interactive': perfData.loadEventEnd - perfData.fetchStart,
                    };

                    if (process.env.NODE_ENV === 'development') {
                        console.group('Navigation Timing Metrics');
                        Object.entries(metrics).forEach(([key, value]) => {
                            console.log(`${key}: ${Math.round(value)}ms`);
                        });
                        console.groupEnd();
                    }
                }
            }
        };

        // Wait for page to fully load
        window.addEventListener('load', logNavigationMetrics);
        return () => window.removeEventListener('load', logNavigationMetrics);
    }, []);
}

```

## File: app\hooks\usePredictions.ts
```
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "../utils/supabase";
import { useAuth } from "../context/AuthContext";

// Types
export interface Prediction {
    id?: string;
    user_id: string;
    league: "vsl" | "1lig" | "2lig" | "cev-cl";
    group_name?: string;
    match_id: string;
    score: string;
    created_at?: string;
    updated_at?: string;
}

export type PredictionOverrides = Record<string, string>;

// ============================================
// FETCH PREDICTIONS
// ============================================
async function fetchPredictions(
    userId: string,
    league: string,
    groupName?: string
): Promise<PredictionOverrides> {
    const supabase = createClient();
    if (!supabase) {
        // Fallback to localStorage if Supabase is not configured
        const storageKey = getStorageKey(league);
        const saved = localStorage.getItem(storageKey);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (groupName && parsed[groupName]) {
                return parsed[groupName];
            }
            return parsed;
        }
        return {};
    }

    let query = supabase
        .from("predictions")
        .select("match_id, score")
        .eq("user_id", userId)
        .eq("league", league);

    if (groupName) {
        query = query.eq("group_name", groupName);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching predictions:", error);
        return {};
    }

    // Convert array to Record<matchId, score>
    const overrides: PredictionOverrides = {};
    data?.forEach((p) => {
        overrides[p.match_id] = p.score;
    });

    return overrides;
}

// ============================================
// SAVE PREDICTION
// ============================================
async function savePrediction(
    userId: string,
    league: string,
    matchId: string,
    score: string,
    groupName?: string
): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
        // Fallback to localStorage
        const storageKey = getStorageKey(league);
        const saved = localStorage.getItem(storageKey);
        const existing = saved ? JSON.parse(saved) : {};

        if (groupName) {
            if (!existing[groupName]) existing[groupName] = {};
            if (score) {
                existing[groupName][matchId] = score;
            } else {
                delete existing[groupName][matchId];
            }
        } else {
            if (score) {
                existing[matchId] = score;
            } else {
                delete existing[matchId];
            }
        }

        localStorage.setItem(storageKey, JSON.stringify(existing));
        return;
    }

    if (!score) {
        // Delete prediction
        await supabase
            .from("predictions")
            .delete()
            .eq("user_id", userId)
            .eq("league", league)
            .eq("match_id", matchId);
    } else {
        // Upsert prediction
        await supabase.from("predictions").upsert(
            {
                user_id: userId,
                league,
                group_name: groupName || null,
                match_id: matchId,
                score,
            },
            { onConflict: "user_id,league,match_id" }
        );
    }
}

// ============================================
// BULK SAVE PREDICTIONS
// ============================================
async function bulkSavePredictions(
    userId: string,
    league: string,
    overrides: PredictionOverrides,
    groupName?: string
): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
        // Fallback to localStorage
        const storageKey = getStorageKey(league);
        const saved = localStorage.getItem(storageKey);
        const existing = saved ? JSON.parse(saved) : {};

        if (groupName) {
            existing[groupName] = overrides;
        } else {
            Object.assign(existing, overrides);
        }

        localStorage.setItem(storageKey, JSON.stringify(existing));
        return;
    }

    // Convert overrides to array of predictions
    const predictions = Object.entries(overrides).map(([matchId, score]) => ({
        user_id: userId,
        league,
        group_name: groupName || null,
        match_id: matchId,
        score,
    }));

    if (predictions.length > 0) {
        await supabase
            .from("predictions")
            .upsert(predictions, { onConflict: "user_id,league,match_id" });
    }
}

// ============================================
// CLEAR PREDICTIONS
// ============================================
async function clearPredictions(
    userId: string,
    league: string,
    groupName?: string
): Promise<void> {
    const supabase = createClient();
    if (!supabase) {
        const storageKey = getStorageKey(league);
        if (groupName) {
            const saved = localStorage.getItem(storageKey);
            const existing = saved ? JSON.parse(saved) : {};
            delete existing[groupName];
            localStorage.setItem(storageKey, JSON.stringify(existing));
        } else {
            localStorage.removeItem(storageKey);
        }
        return;
    }

    let query = supabase
        .from("predictions")
        .delete()
        .eq("user_id", userId)
        .eq("league", league);

    if (groupName) {
        query = query.eq("group_name", groupName);
    }

    await query;
}

// ============================================
// STORAGE KEY HELPER
// ============================================
function getStorageKey(league: string): string {
    switch (league) {
        case "1lig":
            return "1ligGroupScenarios";
        case "2lig":
            return "groupScenarios";
        case "cev-cl":
            return "cevclGroupScenarios";
        case "vsl":
            return "vslGroupScenarios";
        default:
            return `${league}Scenarios`;
    }
}

// ============================================
// REACT QUERY HOOKS
// ============================================

/**
 * Hook to fetch and manage predictions for a specific league
 */
export function usePredictions(league: string, groupName?: string) {
    const { user } = useAuth();
    const queryClient = useQueryClient();

    const userId = user?.id || "anonymous";

    const query = useQuery({
        queryKey: ["predictions", league, groupName, userId],
        queryFn: () => fetchPredictions(userId, league, groupName),
        enabled: true, // Always enabled, will use localStorage fallback
    });

    const saveMutation = useMutation({
        mutationFn: ({
            matchId,
            score,
        }: {
            matchId: string;
            score: string;
        }) => savePrediction(userId, league, matchId, score, groupName),
        onMutate: async ({ matchId, score }) => {
            // Optimistic update
            await queryClient.cancelQueries({
                queryKey: ["predictions", league, groupName, userId],
            });
            const previousData = queryClient.getQueryData<PredictionOverrides>([
                "predictions",
                league,
                groupName,
                userId,
            ]);

            queryClient.setQueryData<PredictionOverrides>(
                ["predictions", league, groupName, userId],
                (old = {}) => {
                    const newData = { ...old };
                    if (score) {
                        newData[matchId] = score;
                    } else {
                        delete newData[matchId];
                    }
                    return newData;
                }
            );

            return { previousData };
        },
        onError: (err, variables, context) => {
            if (context?.previousData) {
                queryClient.setQueryData(
                    ["predictions", league, groupName, userId],
                    context.previousData
                );
            }
        },
        onSettled: () => {
            queryClient.invalidateQueries({
                queryKey: ["predictions", league, groupName, userId],
            });
        },
    });

    const bulkSaveMutation = useMutation({
        mutationFn: (overrides: PredictionOverrides) =>
            bulkSavePredictions(userId, league, overrides, groupName),
        onSuccess: () => {
            queryClient.invalidateQueries({
                queryKey: ["predictions", league, groupName, userId],
            });
        },
    });

    const clearMutation = useMutation({
        mutationFn: () => clearPredictions(userId, league, groupName),
        onSuccess: () => {
            queryClient.setQueryData(
                ["predictions", league, groupName, userId],
                {}
            );
        },
    });

    return {
        overrides: query.data || {},
        isLoading: query.isLoading,
        isError: query.isError,
        error: query.error,
        // Actions
        setPrediction: (matchId: string, score: string) =>
            saveMutation.mutate({ matchId, score }),
        bulkSave: (overrides: PredictionOverrides) =>
            bulkSaveMutation.mutate(overrides),
        clear: () => clearMutation.mutate(),
        // Mutation states
        isSaving: saveMutation.isPending,
        isClearing: clearMutation.isPending,
    };
}

```

