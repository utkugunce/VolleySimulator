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
