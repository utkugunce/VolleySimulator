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
