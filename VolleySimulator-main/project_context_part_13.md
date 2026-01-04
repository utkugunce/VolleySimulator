# Project Application Context - Part 13

## File: app\ligler\page.tsx
```
import Link from "next/link";
import { Metadata } from "next";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Trophy, Globe, Zap, ArrowRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
    title: "Ligler - Türkiye Kadınlar Voleybol Ligleri",
    description: "Sultanlar Ligi, 1. Lig, 2. Lig ve CEV Avrupa turnuvaları. 2025-2026 sezonu maç tahminleri ve puan durumları.",
};

const leagues = [
    {
        name: "Vodafone Sultanlar Ligi",
        desc: "Türkiye'nin en üst düzey kadınlar voleybol ligi",
        href: "/vsl/tahminoyunu",
        color: "from-red-600 to-rose-700",
        badge: "PRO LİG",
        icon: Trophy,
        stats: "14 Takım • Play-off Sistemi"
    },
    {
        name: "Arabica Coffee House 1. Lig",
        desc: "2 Gruplu 1. Lig Heyecanı",
        href: "/1lig/tahminoyunu",
        color: "from-amber-500 to-orange-600",
        badge: "YENİ",
        icon: Zap,
        stats: "2 Grup • 24 Takım"
    },
    {
        name: "Kadınlar 2. Lig",
        desc: "5 Gruplu Geniş Kapsamlı 2. Lig",
        href: "/2lig/tahminoyunu",
        color: "from-emerald-600 to-teal-700",
        badge: "AKTİF",
        icon: Star,
        stats: "5 Grup • Bölgesel Lig"
    },
    {
        name: "CEV Şampiyonlar Ligi",
        desc: "Avrupa'nın En İyilerinin Mücadelesi",
        href: "/cev-cl/tahminoyunu",
        color: "from-blue-600 to-indigo-700",
        badge: "AVRUPA",
        icon: Globe,
        stats: "Grup Aşaması • Play-off"
    }
];

export default function LiglerPage() {
    return (
        <main className="min-h-screen bg-background text-text-primary p-4 sm:p-8 lg:p-12 animate-in fade-in duration-500">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* Hero / Header */}
                <div className="text-center space-y-4">
                    <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 uppercase tracking-widest px-4">
                        Sezon 2025-2026
                    </Badge>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-text-primary uppercase italic">
                        AKTİF <span className="text-primary shadow-glow-primary">LİGLER</span>
                    </h1>
                    <p className="max-w-xl mx-auto text-text-secondary text-lg font-medium leading-relaxed">
                        Tahmin yapmak istediğin ligi seç ve simülasyona başla. Puanları toplayarak liderlik koltuğuna otur!
                    </p>
                </div>

                {/* Leagues Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
                    {leagues.map((league) => (
                        <Link
                            key={league.name}
                            href={league.href}
                            className="group block"
                        >
                            <Card className="h-full relative overflow-hidden border-border-main/50 transition-all duration-500 group-hover:scale-[1.02] group-hover:border-primary/30 group-hover:shadow-premium-lg">
                                {/* Gradient Background overlay */}
                                <div className={cn(
                                    "absolute top-0 right-0 w-32 h-32 blur-[64px] opacity-10 transition-opacity group-hover:opacity-20 bg-gradient-to-br",
                                    league.color
                                )} />

                                <CardContent className="p-8">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:rotate-6 bg-gradient-to-br",
                                            league.color
                                        )}>
                                            <league.icon className="w-7 h-7 text-white" />
                                        </div>
                                        <Badge variant="secondary" className="font-black text-[10px] tracking-widest px-3">
                                            {league.badge}
                                        </Badge>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-black text-text-primary tracking-tight group-hover:text-primary transition-colors">
                                                {league.name}
                                            </h2>
                                            <p className="text-text-secondary text-sm font-medium line-clamp-1">
                                                {league.desc}
                                            </p>
                                        </div>

                                        <div className="pt-4 flex items-center justify-between border-t border-border-subtle">
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">
                                                {league.stats}
                                            </span>
                                            <div className="flex items-center gap-1.5 text-primary font-bold text-sm">
                                                Giriş Yap
                                                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>

                {/* Info Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-12 border-t border-border-subtle">
                    <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                            <Zap className="w-5 h-5 text-amber-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-xs uppercase tracking-widest">Hızlı Tahmin</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">Özel arayüz ile saniyeler içinde tüm haftayı tahmin et.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                            <Trophy className="w-5 h-5 text-emerald-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-xs uppercase tracking-widest">Liderlik Yarışı</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">Tahmin başarılarına göre global sıralamada yüksel.</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <div className="shrink-0 w-10 h-10 rounded-full bg-surface-secondary flex items-center justify-center">
                            <ArrowRight className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="font-black text-xs uppercase tracking-widest">Gelişmiş Veriler</h4>
                            <p className="text-xs text-text-secondary leading-relaxed">Yapay zeka destekli form durumlarını ve analizleri gör.</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}

```

## File: app\live\page.tsx
```
"use client";

import { useState, useEffect } from "react";
import { useLiveMatch } from "../context/LiveMatchContext";
import { useAuth } from "../context/AuthContext";
import { LiveMatch, SetScore } from "../types";
import Link from "next/link";

export default function LivePage() {
  const { user } = useAuth();
  const { 
    liveMatches, 
    currentMatch,
    comments,
    chatMessages,
    isConnected,
    selectMatch,
    addComment,
    likeComment,
    sendChatMessage,
    subscribeToMatch,
    unsubscribeFromMatch,
    refreshLiveMatches,
    isLoading
  } = useLiveMatch();
  
  const [newComment, setNewComment] = useState('');
  const [newChatMessage, setNewChatMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'matches' | 'chat' | 'comments'>('matches');

  useEffect(() => {
    if (currentMatch) {
      subscribeToMatch(currentMatch.id);
    }
    
    return () => {
      unsubscribeFromMatch();
    };
  }, [currentMatch?.id]);

  const handleSendComment = async () => {
    if (!currentMatch || !newComment.trim()) return;
    
    await addComment(currentMatch.id, newComment.trim());
    setNewComment('');
  };

  const handleSendChat = async () => {
    if (!currentMatch || !newChatMessage.trim()) return;
    
    await sendChatMessage(currentMatch.id, newChatMessage.trim());
    setNewChatMessage('');
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <span className="animate-pulse">🔴</span> Canlı Maçlar
              </h1>
              <p className="text-white/70 text-sm mt-1">
                {liveMatches.filter(m => m.status === 'live').length} canlı maç
              </p>
            </div>
            <button
              onClick={refreshLiveMatches}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
            >
              🔄 Yenile
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Live Matches Grid */}
        {!currentMatch ? (
          <div className="space-y-4">
            {liveMatches.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">📺</div>
                <p className="text-slate-400">Şu anda canlı maç bulunmuyor</p>
                <p className="text-sm text-slate-500 mt-2">
                  Yaklaşan maçlar için tahminlerinizi yapmayı unutmayın!
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {liveMatches.map(match => (
                  <LiveMatchCard 
                    key={match.id} 
                    match={match} 
                    onClick={() => selectMatch(match.id)}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          // Match Detail View
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => selectMatch('')}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              ← Geri
            </button>

            {/* Match Score Board */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 rounded-2xl p-6">
              {/* Connection Status */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                <span className="text-xs text-slate-500">
                  {isConnected ? 'Canlı Bağlantı' : 'Bağlantı Bekleniyor...'}
                </span>
              </div>

              {/* Teams and Score */}
              <div className="flex items-center justify-between">
                <div className="flex-1 text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-3xl mb-3">
                    🏐
                  </div>
                  <h3 className="font-bold text-white text-lg">{currentMatch.homeTeam}</h3>
                </div>

                <div className="px-8 text-center">
                  <div className="text-5xl font-black text-white">
                    {currentMatch.homeSetScore} - {currentMatch.awaySetScore}
                  </div>
                  <div className="text-sm text-slate-400 mt-2">Set Skoru</div>
                  
                  {currentMatch.status === 'live' && (
                    <div className="mt-4 bg-red-500/20 border border-red-500/30 rounded-lg px-4 py-2">
                      <div className="text-2xl font-bold text-white">
                        {currentMatch.currentSetHomePoints} - {currentMatch.currentSetAwayPoints}
                      </div>
                      <div className="text-xs text-red-400">{currentMatch.currentSet}. Set</div>
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center">
                  <div className="w-20 h-20 mx-auto bg-gradient-to-br from-orange-500 to-orange-600 rounded-2xl flex items-center justify-center text-3xl mb-3">
                    🏐
                  </div>
                  <h3 className="font-bold text-white text-lg">{currentMatch.awayTeam}</h3>
                </div>
              </div>

              {/* Set Scores */}
              {currentMatch.setScores.length > 0 && (
                <div className="mt-6 flex justify-center gap-4">
                  {currentMatch.setScores.map((set, index) => (
                    <div 
                      key={index}
                      className={`px-4 py-2 rounded-lg text-center ${
                        set.winner === 'home' 
                          ? 'bg-blue-500/20 border border-blue-500/30' 
                          : 'bg-orange-500/20 border border-orange-500/30'
                      }`}
                    >
                      <div className="text-xs text-slate-400">{index + 1}. Set</div>
                      <div className="font-bold text-white">{set.homePoints}-{set.awayPoints}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-slate-800 pb-4">
              {[
                { key: 'chat', label: 'Canlı Sohbet', icon: '💬' },
                { key: 'comments', label: 'Yorumlar', icon: '📝' },
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
                </button>
              ))}
            </div>

            {/* Chat */}
            {activeTab === 'chat' && (
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl">
                <div className="h-64 overflow-y-auto p-4 space-y-3">
                  {chatMessages.length === 0 ? (
                    <div className="text-center text-slate-500 py-8">
                      Henüz mesaj yok. İlk mesajı sen yaz!
                    </div>
                  ) : (
                    chatMessages.map(msg => (
                      <div key={msg.id} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                          {msg.user?.displayName?.charAt(0) || '?'}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-sm">
                              {msg.user?.displayName}
                            </span>
                            <span className="text-xs text-slate-500">
                              {new Date(msg.timestamp).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-slate-300 text-sm">{msg.message}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {user && (
                  <div className="border-t border-slate-800 p-4">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChatMessage}
                        onChange={(e) => setNewChatMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendChat()}
                        placeholder="Mesaj yaz..."
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        onClick={handleSendChat}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl font-medium transition-colors"
                      >
                        Gönder
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Comments */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                {user && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Maç hakkında yorumunuzu yazın..."
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none h-20"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        onClick={handleSendComment}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-sm font-medium transition-colors"
                      >
                        Yorum Yap
                      </button>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                      Henüz yorum yok
                    </div>
                  ) : (
                    comments.map(comment => (
                      <div 
                        key={comment.id}
                        className="bg-slate-900/50 border border-slate-800 rounded-xl p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-bold">
                            {comment.user?.displayName?.charAt(0) || '?'}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white">{comment.user?.displayName}</span>
                              <span className="text-xs text-slate-500">
                                {new Date(comment.createdAt).toLocaleString('tr-TR')}
                              </span>
                            </div>
                            <p className="text-slate-300 mt-1">{comment.message}</p>
                            <button
                              onClick={() => likeComment(comment.id)}
                              className="flex items-center gap-1 text-sm text-slate-500 hover:text-red-400 mt-2 transition-colors"
                            >
                              ❤️ {comment.likes}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

// Live Match Card Component
function LiveMatchCard({ match, onClick }: { match: LiveMatch; onClick: () => void }) {
  const isLive = match.status === 'live';
  
  return (
    <button
      onClick={onClick}
      className={`w-full bg-slate-900/50 border rounded-xl p-4 text-left transition-all hover:border-slate-600 ${
        isLive ? 'border-red-500/50' : 'border-slate-800'
      }`}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-1">
          {/* Home Team */}
          <div className="flex-1 text-right">
            <span className="font-bold text-white">{match.homeTeam}</span>
          </div>

          {/* Score */}
          <div className="text-center px-4">
            {isLive ? (
              <div>
                <div className="flex items-center gap-2 justify-center">
                  <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-xs text-red-400 font-medium">CANLI</span>
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {match.homeSetScore} - {match.awaySetScore}
                </div>
                <div className="text-xs text-slate-400">
                  {match.currentSetHomePoints}-{match.currentSetAwayPoints} ({match.currentSet}. Set)
                </div>
              </div>
            ) : match.status === 'finished' ? (
              <div>
                <span className="text-xs text-slate-500">Bitti</span>
                <div className="text-2xl font-black text-white mt-1">
                  {match.homeSetScore} - {match.awaySetScore}
                </div>
              </div>
            ) : (
              <div>
                <span className="text-xs text-slate-500">
                  {new Date(match.startTime).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <div className="text-lg font-bold text-slate-400 mt-1">vs</div>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex-1 text-left">
            <span className="font-bold text-white">{match.awayTeam}</span>
          </div>
        </div>

        <span className="text-slate-400 ml-4">→</span>
      </div>

      <div className="mt-3 text-xs text-slate-500 text-center">
        {match.league} {match.venue && `• ${match.venue}`}
      </div>
    </button>
  );
}

```

## File: app\login\layout.tsx
```
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Giriş Yap",
    description: "VolleySimulator hesabınıza giriş yapın. Maç tahminleri yapın, puan kazanın ve liderlik tablosunda yerinizi alın.",
    openGraph: {
        title: "Giriş Yap | VolleySimulator",
        description: "VolleySimulator hesabınıza giriş yapın ve tahmin oyununa katılın.",
    },
    robots: {
        index: false,
        follow: true,
    },
};

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}

```

## File: app\login\page.tsx
```
"use client";

// Prevent static prerendering - this page requires auth context
export const dynamic = 'force-dynamic';

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";

import LoginBackground from "../components/LoginBackground";

export default function LoginPage() {
    const router = useRouter();
    const { signIn, signInWithGoogle, user } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    // Redirect if already logged in
    useEffect(() => {
        if (user) {
            router.push('/ligler');
        }
    }, [user, router]);

    if (user) {
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        const { error } = await signIn(email, password);

        if (error) {
            setError(error.message === "Invalid login credentials"
                ? "E-posta veya şifre hatalı"
                : error.message
            );
            setIsLoading(false);
        } else {
            router.push('/ligler');
        }
    };

    const handleGoogleLogin = async () => {
        await signInWithGoogle();
    };

    return (
        <main className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden">
            <LoginBackground />

            <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">

                {/* Left Side: Brand & Features (Desktop) */}
                <div className="hidden lg:block space-y-8 animate-fade-in-left">
                    <div className="space-y-2">
                        <Link href="/" className="inline-block">
                            <span className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-cyan-400">
                                VolleySimulator
                            </span>
                        </Link>
                        <h1 className="text-2xl font-light text-slate-300">
                            Voleybol Tutkunları İçin <br />
                            <span className="font-semibold text-white">Yeni Nesil Simülasyon</span>
                        </h1>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
                            <div className="text-3xl mb-2">🏆</div>
                            <h3 className="font-bold text-white mb-1">Tahmin Oyunu</h3>
                            <p className="text-sm text-slate-400">Maç skorlarını tahmin et, puanları topla ve liderliğe yüksel.</p>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
                            <div className="text-3xl mb-2">📊</div>
                            <h3 className="font-bold text-white mb-1">Detaylı Analiz</h3>
                            <p className="text-sm text-slate-400">Takım form durumları ve yapay zeka destekli maç analizleri.</p>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
                            <div className="text-3xl mb-2">⚡</div>
                            <h3 className="font-bold text-white mb-1">Canlı Skor</h3>
                            <p className="text-sm text-slate-400">Maç sonuçlarını anlık takip et, ligdeki gelişmeleri kaçırma.</p>
                        </div>
                        <div className="bg-slate-900/40 backdrop-blur-sm border border-slate-700/50 p-4 rounded-2xl">
                            <div className="text-3xl mb-2">🌍</div>
                            <h3 className="font-bold text-white mb-1">Topluluk</h3>
                            <p className="text-sm text-slate-400">Diğer voleybol severlerle yarış ve sıralamada yerini al.</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Login Card */}
                <div className="w-full max-w-md mx-auto lg:ml-auto">
                    <Card className="bg-background/60 backdrop-blur-xl border-border/50 shadow-2xl">
                        <CardHeader className="text-center">
                            {/* Mobile Header (Visible only on mobile) */}
                            <div className="lg:hidden mb-4">
                                <Link href="/" className="inline-block mb-2">
                                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                                        VolleySimulator
                                    </span>
                                </Link>
                            </div>
                            <CardTitle className="text-2xl">Giriş Yap</CardTitle>
                            <CardDescription>Hesabınıza erişmek için bilgilerinizi girin</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {error && (
                                    <Alert variant="destructive">
                                        <AlertCircle className="h-4 w-4" />
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}

                                <div className="space-y-2">
                                    <Label htmlFor="email">E-posta</Label>
                                    <Input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="ornek@email.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label htmlFor="password">Şifre</Label>
                                        <Link href="#" className="text-xs text-primary hover:underline">
                                            Unuttum?
                                        </Link>
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="••••••••"
                                        required
                                    />
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                                >
                                    {isLoading ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : (
                                        <>
                                            Giriş Yap
                                            <ArrowRight className="ml-2 h-4 w-4" />
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="relative my-6">
                                <Separator />
                                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                                    veya
                                </span>
                            </div>

                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleGoogleLogin}
                                className="w-full"
                            >
                                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                </svg>
                                Google ile devam et
                            </Button>

                            <p className="mt-6 text-center text-sm text-muted-foreground">
                                Hesabın yok mu?{" "}
                                <Link href="/register" className="text-primary font-medium hover:underline">
                                    Hemen Kayıt Ol
                                </Link>
                            </p>
                        </CardContent>
                    </Card>

                    {/* Skip Link (Subtle) */}
                    <div className="text-center mt-6">
                        <Link href="/1lig/tahminoyunu" className="text-muted-foreground text-xs hover:text-foreground transition-colors flex items-center justify-center gap-1 group">
                            Giriş yapmadan siteye göz at
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </Link>
                    </div>
                </div>
            </div>

            <style jsx>{`
                @keyframes fade-in-up {
                    from { opacity: 0; transform: translateY(20px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-left {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
                .animate-fade-in-up {
                    animation: fade-in-up 0.6s ease-out forwards;
                }
                .animate-fade-in-left {
                    animation: fade-in-left 0.6s ease-out forwards;
                    animation-delay: 0.2s;
                    opacity: 0;
                }
            `}</style>
        </main>
    );
}

```

## File: app\notifications\page.tsx
```
"use client";

import { useState, useMemo } from "react";
import { useNotifications } from "../context/NotificationsContext";
import { useAuth } from "../context/AuthContext";
import { Notification, NotificationType } from "../types";
import Link from "next/link";

export default function NotificationsPage() {
  const { user } = useAuth();
  const { 
    notifications, 
    unreadCount,
    preferences,
    markAsRead, 
    markAllAsRead,
    deleteNotification,
    clearAll,
    updatePreferences,
    requestPushPermission,
    isLoading 
  } = useNotifications();
  
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [filter, setFilter] = useState<NotificationType | 'all'>('all');

  // Filter notifications
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;
    
    if (activeTab === 'unread') {
      filtered = filtered.filter(n => !n.isRead);
    }
    
    if (filter !== 'all') {
      filtered = filtered.filter(n => n.type === filter);
    }
    
    return filtered;
  }, [notifications, activeTab, filter]);

  // Group notifications by date
  const groupedNotifications = useMemo(() => {
    const groups: Record<string, Notification[]> = {};
    
    filteredNotifications.forEach(notification => {
      const date = new Date(notification.createdAt).toLocaleDateString('tr-TR');
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
    });
    
    return groups;
  }, [filteredNotifications]);

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
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Bildirimler</h1>
              <p className="text-white/70 text-sm mt-1">
                {unreadCount > 0 ? `${unreadCount} okunmamış bildirim` : 'Tüm bildirimler okundu'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-xl text-sm font-medium transition-colors"
              >
                Tümünü Okundu İşaretle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="flex gap-2 py-4 border-b border-slate-800">
          {[
            { key: 'all', label: 'Tümü', icon: '📬', count: notifications.length },
            { key: 'unread', label: 'Okunmamış', icon: '🔔', count: unreadCount },
            { key: 'settings', label: 'Ayarlar', icon: '⚙️' },
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
                <span className="bg-cyan-500 text-white text-xs px-2 py-0.5 rounded-full">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="py-6">
          {/* Notification List */}
          {(activeTab === 'all' || activeTab === 'unread') && (
            <div className="space-y-6">
              {/* Filter */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { key: 'all', label: 'Tümü' },
                  { key: 'match_reminder', label: 'Maç Hatırlatma' },
                  { key: 'match_result', label: 'Sonuçlar' },
                  { key: 'friend_request', label: 'Arkadaşlık' },
                  { key: 'achievement', label: 'Başarımlar' },
                  { key: 'leaderboard_change', label: 'Sıralama' },
                ].map(f => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key as typeof filter)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                      filter === f.key
                        ? 'bg-cyan-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Notifications */}
              {Object.keys(groupedNotifications).length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🔔</div>
                  <p className="text-slate-400">Bildirim yok</p>
                </div>
              ) : (
                Object.entries(groupedNotifications).map(([date, notifs]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-slate-500 mb-3">{date}</h3>
                    <div className="space-y-2">
                      {notifs.map(notification => (
                        <NotificationItem
                          key={notification.id}
                          notification={notification}
                          onRead={() => markAsRead(notification.id)}
                          onDelete={() => deleteNotification(notification.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))
              )}

              {notifications.length > 0 && (
                <div className="text-center pt-4">
                  <button
                    onClick={clearAll}
                    className="text-sm text-slate-500 hover:text-red-400 transition-colors"
                  >
                    Tüm Bildirimleri Temizle
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Settings */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Push Notifications */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">Push Bildirimleri</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Tarayıcı bildirimleri alın
                    </p>
                  </div>
                  {preferences.pushEnabled ? (
                    <span className="text-emerald-400 text-sm">✓ Aktif</span>
                  ) : (
                    <button
                      onClick={requestPushPermission}
                      className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      Etkinleştir
                    </button>
                  )}
                </div>
              </div>

              {/* Notification Types */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800">
                  <h3 className="font-bold text-white">Bildirim Türleri</h3>
                </div>
                
                <div className="divide-y divide-slate-800">
                  {[
                    { key: 'matchReminders', label: 'Maç Hatırlatmaları', icon: '⏰', desc: 'Tahmin edilmemiş maçlar için hatırlatma' },
                    { key: 'matchResults', label: 'Maç Sonuçları', icon: '⚽', desc: 'Tahmin edilen maçların sonuçları' },
                    { key: 'friendRequests', label: 'Arkadaşlık İstekleri', icon: '👥', desc: 'Yeni arkadaşlık istekleri' },
                    { key: 'friendActivity', label: 'Arkadaş Aktiviteleri', icon: '📊', desc: 'Arkadaşların tahminleri ve başarımları' },
                    { key: 'achievements', label: 'Başarımlar', icon: '🏆', desc: 'Yeni rozetler ve başarımlar' },
                    { key: 'leaderboardChanges', label: 'Sıralama Değişiklikleri', icon: '📈', desc: 'Liderlik tablosu güncellemeleri' },
                    { key: 'dailyQuests', label: 'Günlük Görevler', icon: '📋', desc: 'Günlük görev hatırlatmaları' },
                    { key: 'weeklyDigest', label: 'Haftalık Özet', icon: '📰', desc: 'Haftalık performans özeti' },
                  ].map(setting => (
                    <div key={setting.key} className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{setting.icon}</span>
                        <div>
                          <h4 className="font-medium text-white">{setting.label}</h4>
                          <p className="text-xs text-slate-500">{setting.desc}</p>
                        </div>
                      </div>
                      <button
                        onClick={() => updatePreferences({ 
                          [setting.key]: !preferences[setting.key as keyof typeof preferences]
                        })}
                        className={`relative w-12 h-6 rounded-full transition-colors ${
                          preferences[setting.key as keyof typeof preferences]
                            ? 'bg-cyan-600'
                            : 'bg-slate-700'
                        }`}
                      >
                        <span 
                          className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                            preferences[setting.key as keyof typeof preferences]
                              ? 'left-7'
                              : 'left-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quiet Hours */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <h3 className="font-bold text-white mb-4">Sessiz Saatler</h3>
                <p className="text-sm text-slate-400 mb-4">
                  Bu saatler arasında bildirim almayın
                </p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Başlangıç</label>
                    <input
                      type="time"
                      value={preferences.quietHoursStart || '23:00'}
                      onChange={(e) => updatePreferences({ quietHoursStart: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-2">Bitiş</label>
                    <input
                      type="time"
                      value={preferences.quietHoursEnd || '08:00'}
                      onChange={(e) => updatePreferences({ quietHoursEnd: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Email Notifications */}
              <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-white">E-posta Bildirimleri</h3>
                    <p className="text-sm text-slate-400 mt-1">
                      Önemli güncellemeler için e-posta alın
                    </p>
                  </div>
                  <button
                    onClick={() => updatePreferences({ emailEnabled: !preferences.emailEnabled })}
                    className={`relative w-12 h-6 rounded-full transition-colors ${
                      preferences.emailEnabled ? 'bg-cyan-600' : 'bg-slate-700'
                    }`}
                  >
                    <span 
                      className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                        preferences.emailEnabled ? 'left-7' : 'left-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

// Notification Item Component
function NotificationItem({ 
  notification, 
  onRead, 
  onDelete 
}: { 
  notification: Notification; 
  onRead: () => void;
  onDelete: () => void;
}) {
  const icon = getNotificationIcon(notification.type);
  
  return (
    <div 
      className={`bg-slate-900/50 border rounded-xl p-4 transition-all ${
        notification.isRead 
          ? 'border-slate-800 opacity-70' 
          : 'border-cyan-500/30 bg-cyan-500/5'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="text-2xl">{icon}</div>
        <div className="flex-1">
          <h4 className={`font-medium ${notification.isRead ? 'text-slate-300' : 'text-white'}`}>
            {notification.title}
          </h4>
          <p className="text-sm text-slate-400 mt-1">{notification.message}</p>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-slate-500">
              {new Date(notification.createdAt).toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}
            </span>
            {notification.link && (
              <Link 
                href={notification.link}
                className="text-xs text-cyan-400 hover:underline"
              >
                Görüntüle →
              </Link>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!notification.isRead && (
            <button
              onClick={onRead}
              className="p-1 text-slate-400 hover:text-white transition-colors"
              title="Okundu işaretle"
            >
              ✓
            </button>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-slate-400 hover:text-red-400 transition-colors"
            title="Sil"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}

function getNotificationIcon(type: NotificationType): string {
  switch (type) {
    case 'match_reminder': return '⏰';
    case 'match_result': return '⚽';
    case 'prediction_result': return '🎯';
    case 'friend_request': return '👥';
    case 'friend_activity': return '📊';
    case 'achievement': return '🏆';
    case 'level_up': return '⬆️';
    case 'leaderboard_change': return '📈';
    case 'daily_quest': return '📋';
    case 'weekly_challenge': return '🏅';
    case 'system': return '📢';
    default: return '🔔';
  }
}

```

## File: app\oauth\consent\page.tsx
```
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "../../utils/supabase";
import Link from "next/link";
import { Suspense } from "react";

function ConsentContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const supabase = createClient();

    useEffect(() => {
        // Check if there's an auth code to exchange
        const code = searchParams.get('code');
        if (code && supabase) {
            supabase.auth.exchangeCodeForSession(code).then(() => {
                router.push('/profile');
            });
        }
    }, [searchParams, router, supabase]);

    return (
        <main className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/" className="inline-block mb-6">
                        <span className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-400 to-teal-200">
                            VolleySimulator
                        </span>
                    </Link>
                </div>

                {/* Consent Card */}
                <div className="bg-slate-900/80 rounded-2xl border border-slate-700 p-8 space-y-6">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                        <span className="text-3xl">🔐</span>
                    </div>

                    <div>
                        <h1 className="text-2xl font-black text-white mb-2">Giriş Onayı</h1>
                        <p className="text-slate-400 text-sm">
                            VolleySimulator uygulamasına erişim izni verin
                        </p>
                    </div>

                    <div className="bg-slate-800/50 rounded-xl p-4 text-left space-y-3">
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                            İzin Verilen Erişimler:
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>Profil bilgileriniz</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>E-posta adresiniz</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-slate-300">
                            <span className="text-emerald-400">✓</span>
                            <span>Tahmin ve oyun ilerlemeniz</span>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Link
                            href="/profile"
                            className="block w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all text-center"
                        >
                            ✓ İzin Ver ve Devam Et
                        </Link>
                        <Link
                            href="/"
                            className="block w-full py-3 bg-slate-800 border border-slate-700 text-slate-400 font-medium rounded-xl hover:bg-slate-700 transition-all text-center"
                        >
                            İptal
                        </Link>
                    </div>
                </div>

                <p className="mt-6 text-xs text-slate-500">
                    Giriş yaparak{" "}
                    <a href="#" className="text-emerald-400 hover:underline">Kullanım Koşulları</a>
                    {" "}ve{" "}
                    <a href="#" className="text-emerald-400 hover:underline">Gizlilik Politikası</a>
                    &apos;nı kabul etmiş olursunuz.
                </p>
            </div>
        </main>
    );
}

export default function OAuthConsentPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
        }>
            <ConsentContent />
        </Suspense>
    );
}

```

## File: app\offline\page.tsx
```
'use client';

import Link from 'next/link';

export default function OfflinePage() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-950 to-slate-900 flex flex-col items-center justify-center p-4">
            <div className="text-center space-y-6 max-w-md">
                {/* Icon */}
                <div className="text-6xl">📡</div>

                {/* Title */}
                <h1 className="text-3xl font-bold text-white">
                    İnternet Bağlantısı Yok
                </h1>

                {/* Description */}
                <p className="text-slate-400 text-lg">
                    Şu anda çevrimdışısınız. Lütfen internet bağlantınızı kontrol edin.
                </p>

                {/* Cached Content Info */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-4 text-sm text-slate-300">
                    <p className="mb-2">✓ Kacak sayfa önbellekte saklanmıştır</p>
                    <p className="mb-2">✓ Tahminleriniz yerel olarak kaydedilmiştir</p>
                    <p>✓ Bağlantı sağlandığında senkronize olacaktır</p>
                </div>

                {/* Actions */}
                <div className="space-y-3 pt-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
                    >
                        Yenile
                    </button>

                    <Link
                        href="/"
                        className="block w-full px-4 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-lg transition-colors text-center"
                    >
                        Ana Sayfaya Dön
                    </Link>
                </div>

                {/* Tips */}
                <div className="text-xs text-slate-500 space-y-1 pt-4 border-t border-slate-800">
                    <p>💡 WiFi bağlantınızı kontrol edin</p>
                    <p>💡 Mobil veri bağlantınızı açmayı deneyin</p>
                    <p>💡 Uçak modu kapalı olduğundan emin olun</p>
                </div>
            </div>
        </div>
    );
}

```

## File: app\premium\page.tsx
```
"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Link from "next/link";

interface PremiumPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
}

const PREMIUM_PLANS: PremiumPlan[] = [
  {
    id: 'basic',
    name: 'Temel',
    price: 0,
    period: 'monthly',
    features: [
      'Maç tahminleri',
      'Temel istatistikler',
      'Haftalık sıralama',
      'Arkadaşlık sistemi',
    ]
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 29.99,
    period: 'monthly',
    features: [
      'Tüm Temel özellikler',
      'AI Tahmin Asistanı',
      'Gelişmiş istatistikler',
      'Özel rozetler',
      'Reklamsız deneyim',
      'Öncelikli destek',
      'Özel temalar',
      'Maç simülasyonu',
    ],
    popular: true
  },
  {
    id: 'elite',
    name: 'Elite',
    price: 199.99,
    period: 'yearly',
    features: [
      'Tüm Pro özellikler',
      'Sınırsız özel lig',
      'Elit rozetler',
      'VIP Discord kanalı',
      'Erken erişim',
      'Aylık ödüller',
      '%40 indirim',
    ]
  }
];

const PREMIUM_FEATURES = [
  {
    icon: '🤖',
    title: 'AI Tahmin Asistanı',
    description: 'Yapay zeka destekli tahmin önerileri ve analiz',
    premium: true
  },
  {
    icon: '📊',
    title: 'Gelişmiş İstatistikler',
    description: 'Takım formları, H2H analizleri ve trend grafikleri',
    premium: true
  },
  {
    icon: '🎮',
    title: 'Maç Simülasyonu',
    description: 'Maçları simüle et ve sonuçları tahmin et',
    premium: true
  },
  {
    icon: '🎨',
    title: 'Özel Temalar',
    description: '15+ özel tema ve renk seçeneği',
    premium: true
  },
  {
    icon: '🏆',
    title: 'Özel Rozetler',
    description: 'Premium üyelere özel rozetler ve unvanlar',
    premium: true
  },
  {
    icon: '🚫',
    title: 'Reklamsız Deneyim',
    description: 'Hiçbir reklam görmeden oyunun keyfini çıkar',
    premium: true
  },
  {
    icon: '⚡',
    title: 'Öncelikli Destek',
    description: '24 saat içinde yanıt garantisi',
    premium: true
  },
  {
    icon: '🔮',
    title: 'Erken Erişim',
    description: 'Yeni özelliklere ilk sen eriş',
    premium: true
  }
];

export default function PremiumPage() {
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  const handleSubscribe = (planId: string) => {
    // In real app, this would open payment modal
    alert(`${planId} planına abone olunuyor...`);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 px-4 py-16 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="animate-pulse">✨</span>
            <span>Premium Üyelik</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Tahmin Gücünü
            <span className="block text-amber-200">Sınırsız Hale Getir</span>
          </h1>
          
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            AI destekli tahminler, gelişmiş istatistikler ve özel özelliklerle 
            rakiplerinin bir adım önünde ol.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-white text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Aylık
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-white text-slate-900'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yıllık <span className="text-emerald-400 text-sm ml-1">%40 indirim</span>
          </button>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PREMIUM_PLANS.map(plan => {
            const displayPrice = billingPeriod === 'yearly' && plan.id === 'pro' 
              ? (plan.price * 12 * 0.6).toFixed(2)
              : plan.price;
            
            return (
              <div
                key={plan.id}
                className={`relative bg-slate-900/50 border rounded-2xl p-6 transition-all ${
                  plan.popular 
                    ? 'border-amber-500 scale-105 shadow-2xl shadow-amber-500/20' 
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-1 rounded-full text-sm font-bold text-white">
                    En Popüler
                  </div>
                )}
                
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-4">
                    <span className="text-4xl font-black text-white">
                      {displayPrice === 0 ? 'Ücretsiz' : `₺${displayPrice}`}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-400 ml-2">
                        /{billingPeriod === 'yearly' ? 'yıl' : 'ay'}
                      </span>
                    )}
                  </div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm text-slate-300">
                      <span className="text-emerald-400">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleSubscribe(plan.id)}
                  className={`w-full py-3 rounded-xl font-bold transition-all ${
                    plan.price === 0
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : plan.popular
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                  }`}
                  disabled={plan.price === 0}
                >
                  {plan.price === 0 ? 'Mevcut Plan' : 'Abone Ol'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Features Grid */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Premium Özellikleri
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {PREMIUM_FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-slate-900/50 border border-slate-800 rounded-xl p-6 hover:border-amber-500/50 transition-colors"
              >
                <span className="text-3xl">{feature.icon}</span>
                <h3 className="font-bold text-white mt-3">{feature.title}</h3>
                <p className="text-sm text-slate-400 mt-1">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/30 rounded-2xl p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { value: '10,000+', label: 'Premium Üye' },
              { value: '%89', label: 'Daha Yüksek Doğruluk' },
              { value: '50+', label: 'AI Modeli' },
              { value: '24/7', label: 'Destek' },
            ].map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-black text-amber-400">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div>
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            Sık Sorulan Sorular
          </h2>
          
          <div className="space-y-4 max-w-3xl mx-auto">
            {[
              {
                q: 'Premium üyelik nasıl çalışır?',
                a: 'Premium üyelik satın aldığınızda, tüm premium özelliklere anında erişim kazanırsınız. Üyeliğiniz otomatik olarak yenilenir.'
              },
              {
                q: 'İstediğim zaman iptal edebilir miyim?',
                a: 'Evet, üyeliğinizi istediğiniz zaman iptal edebilirsiniz. İptal ettiğinizde, mevcut dönemin sonuna kadar premium özelliklere erişiminiz devam eder.'
              },
              {
                q: 'AI Tahmin Asistanı ne kadar doğru?',
                a: 'AI modelimiz, tarihsel veriler ve form analizleri ile %89 doğruluk oranına sahiptir. Ancak futbol her zaman sürprizlere açıktır!'
              },
              {
                q: 'Özel rozetler nasıl kazanılır?',
                a: 'Premium üye olduğunuzda otomatik olarak özel Premium rozeti alırsınız. Ayrıca premium görevleri tamamlayarak ek rozetler kazanabilirsiniz.'
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="bg-slate-900/50 border border-slate-800 rounded-xl group"
              >
                <summary className="px-6 py-4 cursor-pointer font-medium text-white flex items-center justify-between">
                  {faq.q}
                  <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-6 pb-4 text-slate-400 text-sm">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Hala Düşünüyor musun?
          </h2>
          <p className="text-slate-400 mb-6">
            7 günlük ücretsiz deneme ile tüm özellikleri keşfet!
          </p>
          <button className="px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-xl font-bold text-lg transition-all">
            🚀 Ücretsiz Denemeyi Başlat
          </button>
        </div>

        {/* Guarantee */}
        <div className="flex items-center justify-center gap-4 py-6 border-t border-slate-800">
          <span className="text-2xl">🔒</span>
          <div>
            <div className="font-medium text-white">30 Gün Para İade Garantisi</div>
            <div className="text-sm text-slate-400">Memnun kalmazsan, paranı iade ederiz</div>
          </div>
        </div>
      </div>
    </main>
  );
}

```

## File: app\profile\page.tsx
```
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { useGameState, ACHIEVEMENTS, getLevelTitle, getXPForNextLevel } from "../utils/gameState";
import { LEVEL_THRESHOLDS } from "../types";
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Skeleton } from "../components/ui/Skeleton";
import { motion } from "framer-motion";
import { LogOut, Trophy, Zap, Target, TrendingUp, Settings as SettingsIcon, Heart, Home, Edit2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
    const router = useRouter();
    const { user, loading: authLoading, signOut } = useAuth();
    const { gameState, toggleSound, setFavoriteTeam } = useGameState();

    function getXPProgress(state: typeof gameState) {
        const currentLevelXP = LEVEL_THRESHOLDS[state.level - 1] || 0;
        const nextLevelXP = getXPForNextLevel(state.level);
        const progress = state.xp - currentLevelXP;
        const required = nextLevelXP - currentLevelXP;
        return { progress, required, percentage: (progress / required) * 100 };
    }

    const { progress, required, percentage } = getXPProgress(gameState);
    const accuracy = gameState.stats.totalPredictions > 0
        ? Math.round((gameState.stats.correctPredictions / gameState.stats.totalPredictions) * 100)
        : 0;

    const allAchievements = Object.values(ACHIEVEMENTS);
    const unlockedCount = gameState.achievements.length;

    const handleSignOut = async () => {
        await signOut();
        router.push('/login');
    };

    if (authLoading) {
        return (
            <main className="min-h-screen bg-background flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Zap className="w-12 h-12 text-primary animate-pulse shadow-glow-primary" />
                    <span className="text-xs font-black uppercase tracking-widest text-text-muted">Profil Yükleniyor</span>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-background text-text-primary p-4 sm:p-6 lg:p-8 animate-in fade-in duration-500">
            <div className="max-w-2xl mx-auto space-y-6">

                {/* Profile Header Block */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <Card className="relative overflow-hidden border-border-main/50 bg-surface-primary/50 shadow-premium-lg">
                        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 blur-[64px] -z-10" />
                        <CardContent className="p-6">
                            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                                {/* Large Avatar/Level Badge */}
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-primary-dark to-black flex flex-col items-center justify-center shadow-glow-primary transition-transform duration-500 group-hover:rotate-3">
                                        <span className="text-[10px] font-black text-white/50 uppercase tracking-tighter -mb-1">LVL</span>
                                        <span className="text-4xl font-black text-white italic">{gameState.level}</span>
                                    </div>
                                    <div className="absolute -bottom-2 -right-2">
                                        <Badge variant="success" className="h-6 w-6 rounded-full flex items-center justify-center p-0 border-2 border-surface-primary ring-2 ring-emerald-500/20">
                                            <TrendingUp className="w-3.5 h-3.5" />
                                        </Badge>
                                    </div>
                                </div>

                                {/* User Meta Info */}
                                <div className="flex-1 text-center sm:text-left space-y-2">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <h1 className="text-2xl font-black tracking-tight text-text-primary uppercase italic">
                                            {user?.user_metadata?.name || 'Voleybol Tutkunu'}
                                        </h1>
                                        <Badge variant="outline" className="text-[10px] font-black tracking-widest text-primary border-primary/20 bg-primary/5 self-center sm:self-auto italic">
                                            {getLevelTitle(gameState.level)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-text-secondary font-medium">
                                        {user?.email || 'Anonim Hesap'}
                                    </p>

                                    {/* XP Progress Bar */}
                                    <div className="pt-2">
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Tecrübe (XP)</span>
                                            <span className="text-[10px] font-black text-text-primary">{gameState.xp.toLocaleString()} / {required.toLocaleString()}</span>
                                        </div>
                                        <div className="h-2 bg-surface-secondary/50 rounded-full overflow-hidden border border-border-subtle p-0.5">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${Math.min(percentage, 100)}%` }}
                                                className="h-full bg-gradient-to-r from-primary to-primary-light rounded-full shadow-glow-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex flex-col gap-2 w-full sm:w-auto">
                                    {user && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="h-9 font-black uppercase text-[10px] tracking-widest border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white"
                                            onClick={handleSignOut}
                                            leftIcon={<LogOut className="w-3 h-3" />}
                                        >
                                            ÇIKIŞ YAP
                                        </Button>
                                    )}
                                    <Button
                                        variant="secondary"
                                        size="sm"
                                        className="h-9 font-black uppercase text-[10px] tracking-widest"
                                        onClick={() => router.push('/ayarlar')}
                                        leftIcon={<SettingsIcon className="w-3 h-3" />}
                                    >
                                        AYARLAR
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Primary Stats Grid */}
                <motion.div
                    className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <StatMini icon={<Trophy className="w-4 h-4" />} value={gameState.stats.totalPredictions} label="Toplam Tahmin" />
                    <StatMini icon={<Target className="w-4 h-4" />} value={gameState.stats.correctPredictions} label="Doğru Skor" />
                    <StatMini icon={<TrendingUp className="w-4 h-4" />} value={`${accuracy}%`} label="Başarı Oranı" />
                    <StatMini icon={<Zap className="w-4 h-4" />} value={gameState.stats.bestStreak} label="En İyi Seri" />
                </motion.div>

                {/* Favorite Team & Shared Space */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gameState.favoriteTeam && (
                        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                            <Card className="bg-primary/5 border-primary/20 overflow-hidden group">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                                            <Heart className="w-5 h-5 text-primary fill-current" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest">Favori Takım</p>
                                            <p className="text-lg font-black text-text-primary italic uppercase tracking-tighter">{gameState.favoriteTeam}</p>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-text-muted hover:text-rose-500"
                                        onClick={() => setFavoriteTeam(null)}
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Button>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}

                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="bg-surface-secondary/20 border-border-main/50">
                            <CardContent className="p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-surface-secondary/50 flex items-center justify-center">
                                        <Zap className="w-5 h-5 text-amber-500" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Ses Efektleri</p>
                                        <p className="text-sm font-black text-text-primary uppercase">{gameState.soundEnabled ? 'Aktif' : 'Pasif'}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={toggleSound}
                                    className={cn(
                                        "w-10 h-5 rounded-full transition-all relative border border-border-subtle",
                                        gameState.soundEnabled ? "bg-primary shadow-glow-primary" : "bg-surface-dark"
                                    )}
                                    aria-label="Ses Efektlerini Değiştir"
                                >
                                    <motion.div
                                        layout
                                        className="w-3.5 h-3.5 bg-white rounded-full absolute top-0.5"
                                        animate={{ x: gameState.soundEnabled ? 20 : 2 }}
                                    />
                                </button>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>

                {/* Achievements Showcase */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                >
                    <Card className="bg-surface-primary border-border-main/50 overflow-hidden shadow-2xl">
                        <CardHeader className="bg-surface-secondary/30 p-4 border-b border-border-main flex-row justify-between items-center space-y-0">
                            <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                                <Trophy className="w-4 h-4 text-primary" />
                                Başarı Başarımları
                            </CardTitle>
                            <Badge variant="secondary" className="px-2 py-0 h-5 text-[10px] font-black">
                                {unlockedCount}/{allAchievements.length}
                            </Badge>
                        </CardHeader>
                        <CardContent className="p-4">
                            <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                {allAchievements.map((achievement, idx) => {
                                    const isUnlocked = gameState.achievements.some(a => a.id === achievement.id);
                                    return (
                                        <motion.div
                                            key={achievement.id}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            transition={{ delay: 0.4 + (idx * 0.05) }}
                                            className={cn(
                                                "relative flex flex-col items-center justify-center p-3 rounded-2xl border transition-all aspect-square",
                                                isUnlocked
                                                    ? "bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-premium-sm"
                                                    : "bg-surface-dark/50 border-border-subtle opacity-30 grayscale"
                                            )}
                                            title={`${achievement.name}: ${achievement.description}`}
                                        >
                                            <span className="text-2xl mb-1">{achievement.icon}</span>
                                            <div className="text-[8px] font-black text-center truncate w-full uppercase tracking-tighter text-text-primary px-1">
                                                {achievement.name}
                                            </div>
                                            {isUnlocked && (
                                                <div className="absolute -top-1 -right-1">
                                                    <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center shadow-glow-primary">
                                                        <Zap className="w-2 h-2 text-white fill-current" />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Footer Navigation */}
                <div className="flex items-center justify-center gap-4 py-8">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push('/anasayfa')}
                        className="text-text-muted hover:text-text-primary font-black uppercase text-[10px] tracking-widest"
                        leftIcon={<Home className="w-4 h-4" />}
                    >
                        Ana Sayfa
                    </Button>
                </div>

            </div>
        </main>
    );
}

function StatMini({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) {
    return (
        <Card className="bg-surface-primary border-border-main/50 p-4 flex flex-col items-center justify-center gap-1 group hover:border-primary/30 transition-all duration-300">
            <div className="w-8 h-8 rounded-xl bg-surface-secondary/50 flex items-center justify-center text-primary transition-transform group-hover:scale-110 group-hover:bg-primary/10">
                {icon}
            </div>
            <div className="text-xl font-black text-text-primary italic tabular-nums mt-1">{value}</div>
            <div className="text-[9px] font-black text-text-muted uppercase tracking-[0.1em]">{label}</div>
        </Card>
    );
}


```

## File: app\providers\QueryProvider.tsx
```
"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode, useState } from "react";

export function QueryProvider({ children }: { children: ReactNode }) {
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 10, // 10 minutes - data doesn't change frequently
                gcTime: 1000 * 60 * 30, // 30 minutes cache time (formerly cacheTime)
                refetchOnWindowFocus: false,
                refetchOnMount: false,
                refetchOnReconnect: false,
                retry: 1, // Only retry once on failure
                retryDelay: 1000,
            },
        },
    }));

    return (
        <QueryClientProvider client={queryClient}>
            {children}
        </QueryClientProvider>
    );
}

```

