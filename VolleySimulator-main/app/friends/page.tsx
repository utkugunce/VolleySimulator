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
