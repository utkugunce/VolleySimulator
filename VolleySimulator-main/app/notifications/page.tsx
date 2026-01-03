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
