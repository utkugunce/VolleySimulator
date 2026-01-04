# Project Application Context - Part 11

## File: app\context\FriendsContext.tsx
```
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Friend, UserProfile, FriendActivity, FriendshipStatus } from "../types";
import { useAuth } from "./AuthContext";

interface FriendsContextType {
  friends: Friend[];
  pendingRequests: Friend[];
  friendActivities: FriendActivity[];
  isLoading: boolean;
  error: string | null;
  // Actions
  sendFriendRequest: (userId: string) => Promise<boolean>;
  acceptFriendRequest: (friendshipId: string) => Promise<boolean>;
  rejectFriendRequest: (friendshipId: string) => Promise<boolean>;
  removeFriend: (friendshipId: string) => Promise<boolean>;
  blockUser: (userId: string) => Promise<boolean>;
  searchUsers: (query: string) => Promise<UserProfile[]>;
  getFriendProfile: (userId: string) => Promise<UserProfile | null>;
  comparePredictions: (friendId: string, league?: string) => Promise<PredictionComparison | null>;
  refreshFriends: () => Promise<void>;
}

interface PredictionComparison {
  userId: string;
  friendId: string;
  userStats: {
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
    points: number;
  };
  friendStats: {
    totalPredictions: number;
    correctPredictions: number;
    accuracy: number;
    points: number;
  };
  commonMatches: CommonMatchPrediction[];
}

interface CommonMatchPrediction {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  userPrediction: string;
  friendPrediction: string;
  actualResult?: string;
  userCorrect?: boolean;
  friendCorrect?: boolean;
}

const FriendsContext = createContext<FriendsContextType | undefined>(undefined);

export function FriendsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [pendingRequests, setPendingRequests] = useState<Friend[]>([]);
  const [friendActivities, setFriendActivities] = useState<FriendActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch friends list
  const fetchFriends = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/friends', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch friends');
      
      const data = await response.json();
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
      setFriendActivities(data.activities || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Send friend request
  const sendFriendRequest = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ friendId: userId }),
      });
      
      if (!response.ok) throw new Error('Failed to send friend request');
      
      await fetchFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchFriends]);

  // Accept friend request
  const acceptFriendRequest = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/friends/request/${friendshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ action: 'accept' }),
      });
      
      if (!response.ok) throw new Error('Failed to accept friend request');
      
      await fetchFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchFriends]);

  // Reject friend request
  const rejectFriendRequest = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/friends/request/${friendshipId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ action: 'reject' }),
      });
      
      if (!response.ok) throw new Error('Failed to reject friend request');
      
      await fetchFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchFriends]);

  // Remove friend
  const removeFriend = useCallback(async (friendshipId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/friends/${friendshipId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to remove friend');
      
      await fetchFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchFriends]);

  // Block user
  const blockUser = useCallback(async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch('/api/friends/block', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ userId }),
      });
      
      if (!response.ok) throw new Error('Failed to block user');
      
      await fetchFriends();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchFriends]);

  // Search users
  const searchUsers = useCallback(async (query: string): Promise<UserProfile[]> => {
    if (!user || query.length < 2) return [];
    
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to search users');
      
      const data = await response.json();
      return data.users || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    }
  }, [user]);

  // Get friend profile
  const getFriendProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch(`/api/users/${userId}/profile`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to get user profile');
      
      const data = await response.json();
      return data.profile;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [user]);

  // Compare predictions with friend
  const comparePredictions = useCallback(async (
    friendId: string,
    league?: string
  ): Promise<PredictionComparison | null> => {
    if (!user) return null;
    
    try {
      const url = league 
        ? `/api/friends/${friendId}/compare?league=${encodeURIComponent(league)}`
        : `/api/friends/${friendId}/compare`;
        
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to compare predictions');
      
      const data = await response.json();
      return data.comparison;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [user]);

  // Refresh friends data
  const refreshFriends = useCallback(async () => {
    await fetchFriends();
  }, [fetchFriends]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user, fetchFriends]);

  return (
    <FriendsContext.Provider
      value={{
        friends,
        pendingRequests,
        friendActivities,
        isLoading,
        error,
        sendFriendRequest,
        acceptFriendRequest,
        rejectFriendRequest,
        removeFriend,
        blockUser,
        searchUsers,
        getFriendProfile,
        comparePredictions,
        refreshFriends,
      }}
    >
      {children}
    </FriendsContext.Provider>
  );
}

export function useFriends() {
  const context = useContext(FriendsContext);
  if (context === undefined) {
    throw new Error('useFriends must be used within a FriendsProvider');
  }
  return context;
}

```

## File: app\context\LiveMatchContext.tsx
```
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import {
  LiveMatch,
  MatchComment,
  LiveChatMessage,
  MatchSimulation
} from "../types";
import { useAuth } from "./AuthContext";

interface LiveMatchContextType {
  liveMatches: LiveMatch[];
  currentMatch: LiveMatch | null;
  comments: MatchComment[];
  chatMessages: LiveChatMessage[];
  isLoading: boolean;
  isConnected: boolean;
  // Actions
  selectMatch: (matchId: string) => void;
  addComment: (matchId: string, message: string) => Promise<boolean>;
  likeComment: (commentId: string) => Promise<boolean>;
  sendChatMessage: (matchId: string, message: string) => Promise<boolean>;
  subscribeToMatch: (matchId: string) => void;
  unsubscribeFromMatch: () => void;
  simulateMatch: (homeTeam: string, awayTeam: string) => Promise<MatchSimulation | null>;
  refreshLiveMatches: () => Promise<void>;
}

const LiveMatchContext = createContext<LiveMatchContextType | undefined>(undefined);

export function LiveMatchProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [liveMatches, setLiveMatches] = useState<LiveMatch[]>([]);
  const [currentMatch, setCurrentMatch] = useState<LiveMatch | null>(null);
  const [comments, setComments] = useState<MatchComment[]>([]);
  const [chatMessages, setChatMessages] = useState<LiveChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);

  // Fetch live matches
  const fetchLiveMatches = useCallback(async () => {
    setIsLoading(true);

    try {
      // Use consolidated API endpoint
      const response = await fetch('/api/live');

      if (!response.ok) throw new Error('Failed to fetch live matches');

      const data = await response.json();
      // API returns liveMatches, context expects matches but state is named liveMatches
      // The previous code expected data.matches, but route returns data.liveMatches
      setLiveMatches(data.liveMatches || []);
    } catch (err) {
      console.error('Failed to fetch live matches:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Select a match to follow
  const selectMatch = useCallback((matchId: string) => {
    const match = liveMatches.find(m => m.id === matchId);
    setCurrentMatch(match || null);

    if (match) {
      // Fetch comments for this match
      fetchComments(matchId);
    }
  }, [liveMatches]);

  // Fetch comments for a match
  const fetchComments = async (matchId: string) => {
    try {
      const response = await fetch(`/api/live/matches/${matchId}/comments`);

      if (response.ok) {
        const data = await response.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.error('Failed to fetch comments:', err);
    }
  };

  // Add comment
  const addComment = useCallback(async (matchId: string, message: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/live/matches/${matchId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('Failed to add comment');

      const data = await response.json();
      setComments(prev => [data.comment, ...prev]);

      return true;
    } catch (err) {
      console.error('Failed to add comment:', err);
      return false;
    }
  }, [user]);

  // Like comment
  const likeComment = useCallback(async (commentId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const response = await fetch(`/api/live/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) throw new Error('Failed to like comment');

      setComments(prev =>
        prev.map(c => c.id === commentId ? { ...c, likes: c.likes + 1 } : c)
      );

      return true;
    } catch (err) {
      console.error('Failed to like comment:', err);
      return false;
    }
  }, [user]);

  // Send chat message (WebSocket)
  const sendChatMessage = useCallback(async (matchId: string, message: string): Promise<boolean> => {
    if (!user || !websocket || websocket.readyState !== WebSocket.OPEN) return false;

    try {
      websocket.send(JSON.stringify({
        type: 'chat_message',
        matchId,
        message,
        userId: user.id,
      }));

      return true;
    } catch (err) {
      console.error('Failed to send chat message:', err);
      return false;
    }
  }, [user, websocket]);

  // Subscribe to live match updates (WebSocket)
  const subscribeToMatch = useCallback((matchId: string) => {
    // Close existing connection
    if (websocket) {
      websocket.close();
    }

    // Create new WebSocket connection
    const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001'}/live/${matchId}`);

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnected(true);
      // Connected
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        switch (data.type) {
          case 'match_update':
            setCurrentMatch(prev => prev ? { ...prev, ...data.match } : null);
            break;
          case 'chat_message':
            setChatMessages(prev => [...prev, data.message]);
            break;
          case 'score_update':
            setCurrentMatch(prev => {
              if (!prev) return null;
              return {
                ...prev,
                currentSetHomePoints: data.homePoints,
                currentSetAwayPoints: data.awayPoints,
              };
            });
            break;
          case 'set_end':
            setCurrentMatch(prev => {
              if (!prev) return null;
              return {
                ...prev,
                homeSetScore: data.homeSetScore,
                awaySetScore: data.awaySetScore,
                currentSet: data.currentSet,
                setScores: data.setScores,
              };
            });
            break;
          case 'match_end':
            setCurrentMatch(prev => prev ? { ...prev, status: 'finished' } : null);
            break;
        }
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsConnected(false);
      // Disconnected
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };

    setWebsocket(ws);
  }, [websocket]);

  // Unsubscribe from match
  const unsubscribeFromMatch = useCallback(() => {
    if (websocket) {
      websocket.close();
      setWebsocket(null);
    }
    setIsConnected(false);
    setChatMessages([]);
  }, [websocket]);

  // Simulate a match
  const simulateMatch = useCallback(async (
    homeTeam: string,
    awayTeam: string
  ): Promise<MatchSimulation | null> => {
    try {
      const response = await fetch('/api/simulation/match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ homeTeam, awayTeam }),
      });

      if (!response.ok) throw new Error('Failed to simulate match');

      const data = await response.json();
      return data.simulation;
    } catch (err) {
      console.error('Failed to simulate match:', err);
      return null;
    }
  }, []);

  // Refresh live matches
  const refreshLiveMatches = useCallback(async () => {
    await fetchLiveMatches();
  }, [fetchLiveMatches]);

  // Initial fetch and polling
  useEffect(() => {
    fetchLiveMatches();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchLiveMatches, 30000);

    return () => clearInterval(interval);
  }, [fetchLiveMatches]);

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, [websocket]);

  return (
    <LiveMatchContext.Provider
      value={{
        liveMatches,
        currentMatch,
        comments,
        chatMessages,
        isLoading,
        isConnected,
        selectMatch,
        addComment,
        likeComment,
        sendChatMessage,
        subscribeToMatch,
        unsubscribeFromMatch,
        simulateMatch,
        refreshLiveMatches,
      }}
    >
      {children}
    </LiveMatchContext.Provider>
  );
}

export function useLiveMatch() {
  const context = useContext(LiveMatchContext);
  if (context === undefined) {
    throw new Error('useLiveMatch must be used within a LiveMatchProvider');
  }
  return context;
}

```

## File: app\context\LocaleContext.tsx
```
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Locale = 'tr' | 'en';

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

function getInitialLocale(): Locale {
  if (typeof document === 'undefined') return 'tr';
  
  const savedLocale = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_LOCALE='))
    ?.split('=')[1];
  
  if (savedLocale === 'tr' || savedLocale === 'en') {
    return savedLocale;
  }
  return 'tr';
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(getInitialLocale);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    // Set cookie for 1 year
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`;
    // Reload to apply new locale
    window.location.reload();
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale }}>
      {children}
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
}

```

## File: app\context\NotificationsContext.tsx
```
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

```

## File: app\context\QuestsContext.tsx
```
"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { DailyQuest, WeeklyChallenge, StreakData, Badge } from "../types";
import { useAuth } from "./AuthContext";
import { useGameState } from "../utils/gameState";

interface QuestsContextType {
  dailyQuests: DailyQuest[];
  weeklyChallenge: WeeklyChallenge | null;
  streakData: StreakData;
  badges: Badge[];
  unlockedBadges: Badge[];
  isLoading: boolean;
  // Actions
  claimQuestReward: (questId: string) => Promise<{ xp: number; coins: number } | null>;
  useStreakFreeze: () => Promise<boolean>;
  refreshQuests: () => Promise<void>;
  trackQuestProgress: (questType: string, amount?: number) => Promise<void>;
}

const defaultStreakData: StreakData = {
  currentStreak: 0,
  longestStreak: 0,
  lastPredictionDate: '',
  streakFreezeAvailable: 0,
  streakHistory: [],
};

const QuestsContext = createContext<QuestsContextType | undefined>(undefined);

export function QuestsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addXP } = useGameState();
  const [dailyQuests, setDailyQuests] = useState<DailyQuest[]>([]);
  const [weeklyChallenge, setWeeklyChallenge] = useState<WeeklyChallenge | null>(null);
  const [streakData, setStreakData] = useState<StreakData>(defaultStreakData);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [unlockedBadges, setUnlockedBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch daily quests
  const fetchQuests = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);

    try {
      // Use consolidated API endpoint
      const response = await fetch('/api/quests', {
        headers: { 'Authorization': `Bearer ${user.id}` },
      });

      if (response.ok) {
        const data = await response.json();

        if (data.dailyQuests) {
          setDailyQuests(data.dailyQuests);
        } else {
          setDailyQuests(generateDefaultQuests());
        }

        if (data.weeklyChallenge) {
          setWeeklyChallenge(data.weeklyChallenge);
        }

        if (data.streak) {
          setStreakData(data.streak);
        } else {
          setStreakData(defaultStreakData);
        }

        if (data.badges) {
          setBadges(data.badges);
          // Assuming unlockedBadges are part of badges or separate property, 
          // but API returns 'badges' which likely contains status.
          // For now, filtering if structure supports it, or setting empty if separate property missing
          setUnlockedBadges(data.badges.filter((b: Badge) => b.unlockedAt) || []);
        }
      } else {
        throw new Error('Failed to fetch quests');
      }
    } catch (err) {
      console.error('Failed to fetch quests:', err);
      // Use default quests on error
      setDailyQuests(generateDefaultQuests());
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Generate default daily quests
  function generateDefaultQuests(): DailyQuest[] {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    const expiresAt = today.toISOString();

    return [
      {
        id: 'daily_predict_3',
        type: 'make_predictions',
        title: '3 Tahmin Yap',
        description: 'Bugün en az 3 maç tahmini yap',
        icon: '🎯',
        target: 3,
        progress: 0,
        xpReward: 50,
        coinReward: 10,
        expiresAt,
        completed: false,
        claimed: false,
      },
      {
        id: 'daily_correct_1',
        type: 'correct_predictions',
        title: 'Doğru Tahmin',
        description: '1 doğru tahmin yap',
        icon: '✅',
        target: 1,
        progress: 0,
        xpReward: 75,
        coinReward: 15,
        expiresAt,
        completed: false,
        claimed: false,
      },
      {
        id: 'daily_underdog',
        type: 'predict_underdog',
        title: 'Underdog Tahmini',
        description: 'Bir maçta sürpriz sonuç tahmin et',
        icon: '🐺',
        target: 1,
        progress: 0,
        xpReward: 100,
        coinReward: 25,
        expiresAt,
        completed: false,
        claimed: false,
      },
      {
        id: 'daily_view_stats',
        type: 'view_stats',
        title: 'İstatistikleri İncele',
        description: 'Takım istatistiklerini görüntüle',
        icon: '📊',
        target: 1,
        progress: 0,
        xpReward: 25,
        coinReward: 5,
        expiresAt,
        completed: false,
        claimed: false,
      },
    ];
  }

  // Claim quest reward
  const claimQuestReward = useCallback(async (questId: string): Promise<{ xp: number; coins: number } | null> => {
    if (!user) return null;

    const quest = dailyQuests.find(q => q.id === questId);
    if (!quest || !quest.completed || quest.claimed) return null;

    try {
      const response = await fetch(`/api/quests/${questId}/claim`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) throw new Error('Failed to claim reward');

      const data = await response.json();

      // Update local state
      setDailyQuests(prev =>
        prev.map(q => q.id === questId ? { ...q, claimed: true } : q)
      );

      // Add XP
      addXP(quest.xpReward);

      return { xp: quest.xpReward, coins: quest.coinReward };
    } catch (err) {
      console.error('Failed to claim reward:', err);
      return null;
    }
  }, [user, dailyQuests, addXP]);

  // Use streak freeze
  const useStreakFreeze = useCallback(async (): Promise<boolean> => {
    if (!user || streakData.streakFreezeAvailable <= 0) return false;

    try {
      const response = await fetch('/api/streak/freeze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });

      if (!response.ok) throw new Error('Failed to use streak freeze');

      setStreakData(prev => ({
        ...prev,
        streakFreezeAvailable: prev.streakFreezeAvailable - 1,
      }));

      return true;
    } catch (err) {
      console.error('Failed to use streak freeze:', err);
      return false;
    }
  }, [user, streakData.streakFreezeAvailable]);

  // Track quest progress
  const trackQuestProgress = useCallback(async (questType: string, amount: number = 1) => {
    if (!user) return;

    // Update local state optimistically
    setDailyQuests(prev =>
      prev.map(q => {
        if (q.type === questType && !q.completed) {
          const newProgress = Math.min(q.progress + amount, q.target);
          return {
            ...q,
            progress: newProgress,
            completed: newProgress >= q.target,
          };
        }
        return q;
      })
    );

    // Send to server
    try {
      await fetch('/api/quests/progress', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ questType, amount }),
      });
    } catch (err) {
      console.error('Failed to track quest progress:', err);
    }
  }, [user]);

  // Refresh quests
  const refreshQuests = useCallback(async () => {
    await fetchQuests();
  }, [fetchQuests]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchQuests();
    }
  }, [user, fetchQuests]);

  // Check for new day and reset quests
  useEffect(() => {
    const checkDailyReset = () => {
      const now = new Date();
      const questExpiry = dailyQuests[0]?.expiresAt;

      if (questExpiry && new Date(questExpiry) < now) {
        fetchQuests();
      }
    };

    const interval = setInterval(checkDailyReset, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [dailyQuests, fetchQuests]);

  return (
    <QuestsContext.Provider
      value={{
        dailyQuests,
        weeklyChallenge,
        streakData,
        badges,
        unlockedBadges,
        isLoading,
        claimQuestReward,
        useStreakFreeze,
        refreshQuests,
        trackQuestProgress,
      }}
    >
      {children}
    </QuestsContext.Provider>
  );
}

export function useQuests() {
  const context = useContext(QuestsContext);
  if (context === undefined) {
    throw new Error('useQuests must be used within a QuestsProvider');
  }
  return context;
}

```

## File: app\context\ThemeContext.tsx
```
"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { ThemeMode, AccentColor, UIPreferences, DashboardWidget } from "../types";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    themeMode: ThemeMode;
    accentColor: AccentColor;
    preferences: UIPreferences;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    setThemeMode: (mode: ThemeMode) => void;
    setAccentColor: (color: AccentColor) => void;
    updatePreferences: (prefs: Partial<UIPreferences>) => void;
    updateDashboardLayout: (widgets: DashboardWidget[]) => void;
    playSound: (sound: SoundType) => void;
}

type SoundType = 'success' | 'error' | 'notification' | 'levelUp' | 'achievement' | 'click';

const defaultPreferences: UIPreferences = {
    theme: 'dark',
    accentColor: 'emerald',
    soundEffects: true,
    hapticFeedback: true,
    compactMode: false,
    showAnimations: true,
    fontSize: 'medium',
    dashboardLayout: [
        { id: 'standings', type: 'standings', position: 1, size: 'large', visible: true },
        { id: 'upcoming', type: 'upcoming', position: 2, size: 'medium', visible: true },
        { id: 'quests', type: 'quests', position: 3, size: 'small', visible: true },
        { id: 'streak', type: 'streak', position: 4, size: 'small', visible: true },
        { id: 'leaderboard', type: 'leaderboard', position: 5, size: 'medium', visible: true },
        { id: 'friends', type: 'friends', position: 6, size: 'medium', visible: true },
    ],
};

const SOUNDS: Record<SoundType, string> = {
    success: '/sounds/success.mp3',
    error: '/sounds/error.mp3',
    notification: '/sounds/notification.mp3',
    levelUp: '/sounds/level-up.mp3',
    achievement: '/sounds/achievement.mp3',
    click: '/sounds/click.mp3',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark");
    const [themeMode, setThemeModeState] = useState<ThemeMode>("dark");
    const [accentColor, setAccentColorState] = useState<AccentColor>("emerald");
    const [preferences, setPreferences] = useState<UIPreferences>(defaultPreferences);
    const [mounted, setMounted] = useState(false);
    const [systemTheme, setSystemTheme] = useState<'light' | 'dark'>('dark');

    const isDark = themeMode === 'dark' || (themeMode === 'system' && systemTheme === 'dark');

    // Listen for system theme changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        // Initialize system theme
        Promise.resolve().then(() => setSystemTheme(mediaQuery.matches ? 'dark' : 'light'));

        const handleChange = (e: MediaQueryListEvent) => {
            setSystemTheme(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        Promise.resolve().then(() => setMounted(true));
    }, []);

    useEffect(() => {
        if (!mounted) return;

        const saved = localStorage.getItem("theme") as Theme | null;
        const savedPrefs = localStorage.getItem("ui-preferences");

        if (saved) {
            Promise.resolve().then(() => {
                setThemeState(saved);
                document.documentElement.setAttribute("data-theme", saved);
            });
        }

        if (savedPrefs) {
            try {
                const prefs = JSON.parse(savedPrefs);
                Promise.resolve().then(() => {
                    setPreferences(prefs);
                    setThemeModeState(prefs.theme || 'dark');
                    setAccentColorState(prefs.accentColor || 'emerald');
                });
            } catch (e) {
                // Ignore parse errors
            }
        }
    }, []);

    // Apply accent color as CSS variable
    useEffect(() => {
        if (!mounted) return;

        const root = document.documentElement;
        const colors: Record<AccentColor, string> = {
            emerald: '#10b981',
            blue: '#3b82f6',
            purple: '#8b5cf6',
            rose: '#f43f5e',
            amber: '#f59e0b',
            cyan: '#06b6d4',
        };
        root.style.setProperty('--accent-color', colors[accentColor]);

        // Apply font size
        const fontSizes = { small: '14px', medium: '16px', large: '18px' };
        root.style.setProperty('--base-font-size', fontSizes[preferences.fontSize]);
    }, [mounted, accentColor, preferences.fontSize]);

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    const setThemeMode = useCallback((mode: ThemeMode) => {
        setThemeModeState(mode);
        const newPrefs = { ...preferences, theme: mode };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));

        // Also update legacy theme
        const actualTheme = mode === 'system' ? systemTheme : mode;
        setTheme(actualTheme as Theme);
    }, [preferences, systemTheme]);

    const setAccentColor = useCallback((color: AccentColor) => {
        setAccentColorState(color);
        const newPrefs = { ...preferences, accentColor: color };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));
    }, [preferences]);

    const updatePreferences = useCallback((prefs: Partial<UIPreferences>) => {
        const newPrefs = { ...preferences, ...prefs };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));
    }, [preferences]);

    const updateDashboardLayout = useCallback((widgets: DashboardWidget[]) => {
        const newPrefs = { ...preferences, dashboardLayout: widgets };
        setPreferences(newPrefs);
        localStorage.setItem("ui-preferences", JSON.stringify(newPrefs));
    }, [preferences]);

    const playSound = useCallback((sound: SoundType) => {
        if (!preferences.soundEffects) return;

        try {
            const audio = new Audio(SOUNDS[sound]);
            audio.volume = 0.5;
            audio.play().catch(() => {
                // Ignore errors (e.g., user hasn't interacted with page yet)
            });
        } catch (err) {
            // Ignore sound errors
        }
    }, [preferences.soundEffects]);

    // Prevent flash of wrong theme
    if (!mounted) {
        return <>{children}</>;
    }

    return (
        <ThemeContext.Provider value={{
            theme,
            themeMode,
            accentColor,
            preferences,
            isDark,
            toggleTheme,
            setTheme,
            setThemeMode,
            setAccentColor,
            updatePreferences,
            updateDashboardLayout,
            playSound,
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}

// Hook for accent color classes
export function useAccentClasses() {
    const { accentColor } = useTheme();

    const classes: Record<AccentColor, {
        bg: string;
        bgHover: string;
        text: string;
        border: string;
        gradient: string;
    }> = {
        emerald: {
            bg: 'bg-emerald-500',
            bgHover: 'hover:bg-emerald-600',
            text: 'text-emerald-500',
            border: 'border-emerald-500',
            gradient: 'from-emerald-500 to-teal-500',
        },
        blue: {
            bg: 'bg-blue-500',
            bgHover: 'hover:bg-blue-600',
            text: 'text-blue-500',
            border: 'border-blue-500',
            gradient: 'from-blue-500 to-cyan-500',
        },
        purple: {
            bg: 'bg-purple-500',
            bgHover: 'hover:bg-purple-600',
            text: 'text-purple-500',
            border: 'border-purple-500',
            gradient: 'from-purple-500 to-pink-500',
        },
        rose: {
            bg: 'bg-rose-500',
            bgHover: 'hover:bg-rose-600',
            text: 'text-rose-500',
            border: 'border-rose-500',
            gradient: 'from-rose-500 to-red-500',
        },
        amber: {
            bg: 'bg-amber-500',
            bgHover: 'hover:bg-amber-600',
            text: 'text-amber-500',
            border: 'border-amber-500',
            gradient: 'from-amber-500 to-orange-500',
        },
        cyan: {
            bg: 'bg-cyan-500',
            bgHover: 'hover:bg-cyan-600',
            text: 'text-cyan-500',
            border: 'border-cyan-500',
            gradient: 'from-cyan-500 to-blue-500',
        },
    };

    return classes[accentColor];
}

```

## File: app\custom-leagues\page.tsx
```
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
                <label htmlFor="max-members" className="block text-sm font-medium text-slate-400 mb-2">
                  Maksimum Üye: {newLeague.maxMembers}
                </label>
                <input
                  id="max-members"
                  type="range"
                  min="5"
                  max="100"
                  value={newLeague.maxMembers}
                  onChange={(e) => setNewLeague({ ...newLeague, maxMembers: parseInt(e.target.value) })}
                  className="w-full"
                  aria-label="Maksimum Üye Sayısı"
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
                  <label htmlFor="start-date" className="block text-sm font-medium text-slate-400 mb-2">
                    Başlangıç
                  </label>
                  <input
                    id="start-date"
                    type="date"
                    value={newLeague.startDate}
                    onChange={(e) => setNewLeague({ ...newLeague, startDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    aria-label="Başlangıç Tarihi"
                  />
                </div>
                <div>
                  <label htmlFor="end-date" className="block text-sm font-medium text-slate-400 mb-2">
                    Bitiş
                  </label>
                  <input
                    id="end-date"
                    type="date"
                    value={newLeague.endDate}
                    onChange={(e) => setNewLeague({ ...newLeague, endDate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                    aria-label="Bitiş Tarihi"
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

