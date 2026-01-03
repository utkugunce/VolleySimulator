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
