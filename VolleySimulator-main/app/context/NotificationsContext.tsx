"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import type { Notification, NotificationPreferences, NotificationType } from "../types";
import { useAuth } from "./AuthContext";

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  preferences: NotificationPreferences;
  isLoading: boolean;
  // Actions
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  clearAll: () => Promise<void>;
  updatePreferences: (prefs: Partial<NotificationPreferences>) => Promise<void>;
  requestPushPermission: () => Promise<boolean>;
  // Real-time
  subscribeToNotifications: () => void;
  unsubscribeFromNotifications: () => void;
}

const defaultPreferences: NotificationPreferences = {
  matchReminders: true,
  matchResults: true,
  friendRequests: true,
  friendActivity: true,
  achievements: true,
  leaderboardChanges: true,
  dailyQuests: true,
  weeklyDigest: true,
  pushEnabled: false,
  emailEnabled: true,
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>(defaultPreferences);
  const [isLoading, setIsLoading] = useState(false);
  const eventSourceRef = useRef<EventSource | null>(null);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/notifications', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch notifications');
      
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Fetch preferences
  const fetchPreferences = useCallback(async () => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/notifications/preferences', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch preferences');
      
      const data = await response.json();
      setPreferences(data.preferences || defaultPreferences);
    } catch (err) {
      console.error('Failed to fetch preferences:', err);
    }
  }, [user]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  }, [user]);

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    if (!user) return;
    
    try {
      await fetch('/api/notifications/read-all', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  }, [user]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    if (!user) return;
    
    try {
      await fetch(`/api/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  }, [user]);

  // Clear all notifications
  const clearAll = useCallback(async () => {
    if (!user) return;
    
    try {
      await fetch('/api/notifications', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      setNotifications([]);
    } catch (err) {
      console.error('Failed to clear notifications:', err);
    }
  }, [user]);

  // Update preferences
  const updatePreferences = useCallback(async (prefs: Partial<NotificationPreferences>) => {
    if (!user) return;
    
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify(prefs),
      });
      
      if (!response.ok) throw new Error('Failed to update preferences');
      
      setPreferences(prev => ({ ...prev, ...prefs }));
    } catch (err) {
      console.error('Failed to update preferences:', err);
    }
  }, [user]);

  // Request push permission
  const requestPushPermission = useCallback(async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }
    
    if (Notification.permission === 'granted') {
      await updatePreferences({ pushEnabled: true });
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        await updatePreferences({ pushEnabled: true });
        
        // Register service worker for push
        if ('serviceWorker' in navigator) {
          try {
            const registration = await navigator.serviceWorker.ready;
            // Here you would subscribe to push notifications
            console.log('Push notification registered');
          } catch (err) {
            console.error('Failed to register push:', err);
          }
        }
        
        return true;
      }
    }
    
    return false;
  }, [updatePreferences]);

  // Subscribe to real-time notifications (SSE)
  const subscribeToNotifications = useCallback(() => {
    if (!user || eventSourceRef.current) return;
    
    eventSourceRef.current = new EventSource(`/api/notifications/stream?userId=${user.id}`);
    
    eventSourceRef.current.onmessage = (event) => {
      try {
        const notification = JSON.parse(event.data) as Notification;
        setNotifications(prev => [notification, ...prev]);
        
        // Show browser notification if enabled
        if (preferences.pushEnabled && Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/icons/icon-192x192.png',
          });
        }
      } catch (err) {
        console.error('Failed to parse notification:', err);
      }
    };
    
    eventSourceRef.current.onerror = () => {
      eventSourceRef.current?.close();
      eventSourceRef.current = null;
      
      // Retry after 5 seconds
      setTimeout(subscribeToNotifications, 5000);
    };
  }, [user, preferences.pushEnabled]);

  // Unsubscribe from notifications
  const unsubscribeFromNotifications = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchNotifications();
      fetchPreferences();
    }
  }, [user, fetchNotifications, fetchPreferences]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribeFromNotifications();
    };
  }, [unsubscribeFromNotifications]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        preferences,
        isLoading,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAll,
        updatePreferences,
        requestPushPermission,
        subscribeToNotifications,
        unsubscribeFromNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
