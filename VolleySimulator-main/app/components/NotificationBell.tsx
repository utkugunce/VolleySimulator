"use client";

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useNotifications } from '../context/NotificationsContext';
import { Notification, NotificationType } from '../types';

export default function NotificationBell() {
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const recentNotifications = notifications.slice(0, 5);

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-400 hover:text-white transition-colors"
        aria-label={`Bildirimler ${unreadCount > 0 ? `(${unreadCount} okunmamış)` : ''}`}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-6 w-6" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" 
          />
        </svg>
        
        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900 border border-slate-800 rounded-xl shadow-xl overflow-hidden z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <h3 className="font-bold text-white">Bildirimler</h3>
            {unreadCount > 0 && (
              <span className="text-xs text-cyan-400">{unreadCount} yeni</span>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-80 overflow-y-auto">
            {recentNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-slate-500">
                <span className="text-3xl block mb-2">🔔</span>
                Bildirim yok
              </div>
            ) : (
              recentNotifications.map(notification => (
                <NotificationItem 
                  key={notification.id} 
                  notification={notification}
                  onRead={() => markAsRead(notification.id)}
                  onClose={() => setIsOpen(false)}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t border-slate-800">
            <Link 
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Tümünü Gör →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ 
  notification, 
  onRead,
  onClose 
}: { 
  notification: Notification;
  onRead: () => void;
  onClose: () => void;
}) {
  const icon = getNotificationIcon(notification.type);
  
  const handleClick = () => {
    if (!notification.isRead) {
      onRead();
    }
    onClose();
  };

  return (
    <Link
      href={notification.link || '/notifications'}
      onClick={handleClick}
      className={`block px-4 py-3 hover:bg-slate-800/50 transition-colors ${
        !notification.isRead ? 'bg-cyan-500/5' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl">{icon}</span>
        <div className="flex-1 min-w-0">
          <p className={`text-sm ${notification.isRead ? 'text-slate-400' : 'text-white font-medium'}`}>
            {notification.title}
          </p>
          <p className="text-xs text-slate-500 mt-0.5 truncate">
            {notification.message}
          </p>
          <p className="text-xs text-slate-600 mt-1">
            {formatTimeAgo(notification.createdAt)}
          </p>
        </div>
        {!notification.isRead && (
          <span className="w-2 h-2 bg-cyan-400 rounded-full flex-shrink-0 mt-2" />
        )}
      </div>
    </Link>
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

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  
  if (minutes < 1) return 'Az önce';
  if (minutes < 60) return `${minutes} dk önce`;
  if (hours < 24) return `${hours} saat önce`;
  if (days < 7) return `${days} gün önce`;
  
  return date.toLocaleDateString('tr-TR');
}
