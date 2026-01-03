"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { 
  CustomLeague, 
  CustomLeagueMember, 
  CustomLeagueInvite,
  UserProfile 
} from "../types";
import { useAuth } from "./AuthContext";

interface CustomLeaguesContextType {
  myLeagues: CustomLeague[];
  joinedLeagues: CustomLeague[];
  pendingInvites: CustomLeagueInvite[];
  currentLeague: CustomLeague | null;
  isLoading: boolean;
  error: string | null;
  // Actions
  createLeague: (data: CreateLeagueData) => Promise<CustomLeague | null>;
  updateLeague: (leagueId: string, data: Partial<CreateLeagueData>) => Promise<boolean>;
  deleteLeague: (leagueId: string) => Promise<boolean>;
  joinLeague: (code: string) => Promise<boolean>;
  leaveLeague: (leagueId: string) => Promise<boolean>;
  inviteMember: (leagueId: string, email: string) => Promise<boolean>;
  removeMember: (leagueId: string, userId: string) => Promise<boolean>;
  promoteMember: (leagueId: string, userId: string, role: 'admin' | 'member') => Promise<boolean>;
  acceptInvite: (inviteId: string) => Promise<boolean>;
  rejectInvite: (inviteId: string) => Promise<boolean>;
  getLeagueDetails: (leagueId: string) => Promise<CustomLeague | null>;
  getLeagueLeaderboard: (leagueId: string) => Promise<CustomLeagueMember[]>;
  refreshLeagues: () => Promise<void>;
}

interface CreateLeagueData {
  name: string;
  description?: string;
  isPrivate: boolean;
  maxMembers: number;
  leagues: string[];
  startDate: string;
  endDate: string;
}

const CustomLeaguesContext = createContext<CustomLeaguesContextType | undefined>(undefined);

export function CustomLeaguesProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [myLeagues, setMyLeagues] = useState<CustomLeague[]>([]);
  const [joinedLeagues, setJoinedLeagues] = useState<CustomLeague[]>([]);
  const [pendingInvites, setPendingInvites] = useState<CustomLeagueInvite[]>([]);
  const [currentLeague, setCurrentLeague] = useState<CustomLeague | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's leagues
  const fetchLeagues = useCallback(async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/custom-leagues', {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch leagues');
      
      const data = await response.json();
      setMyLeagues(data.myLeagues || []);
      setJoinedLeagues(data.joinedLeagues || []);
      setPendingInvites(data.pendingInvites || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  // Create new league
  const createLeague = useCallback(async (data: CreateLeagueData): Promise<CustomLeague | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch('/api/custom-leagues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to create league');
      
      const result = await response.json();
      await fetchLeagues();
      return result.league;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [user, fetchLeagues]);

  // Update league
  const updateLeague = useCallback(async (
    leagueId: string, 
    data: Partial<CreateLeagueData>
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update league');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Delete league
  const deleteLeague = useCallback(async (leagueId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to delete league');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Join league with code
  const joinLeague = useCallback(async (code: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch('/api/custom-leagues/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ code }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to join league');
      }
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Leave league
  const leaveLeague = useCallback(async (leagueId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}/leave`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to leave league');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Invite member
  const inviteMember = useCallback(async (leagueId: string, email: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}/invite`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ email }),
      });
      
      if (!response.ok) throw new Error('Failed to invite member');
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user]);

  // Remove member
  const removeMember = useCallback(async (leagueId: string, userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}/members/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to remove member');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Promote/demote member
  const promoteMember = useCallback(async (
    leagueId: string, 
    userId: string, 
    role: 'admin' | 'member'
  ): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}/members/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.id}`,
        },
        body: JSON.stringify({ role }),
      });
      
      if (!response.ok) throw new Error('Failed to update member role');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Accept invite
  const acceptInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/invites/${inviteId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to accept invite');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Reject invite
  const rejectInvite = useCallback(async (inviteId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const response = await fetch(`/api/custom-leagues/invites/${inviteId}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to reject invite');
      
      await fetchLeagues();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return false;
    }
  }, [user, fetchLeagues]);

  // Get league details
  const getLeagueDetails = useCallback(async (leagueId: string): Promise<CustomLeague | null> => {
    if (!user) return null;
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to get league details');
      
      const data = await response.json();
      setCurrentLeague(data.league);
      return data.league;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return null;
    }
  }, [user]);

  // Get league leaderboard
  const getLeagueLeaderboard = useCallback(async (leagueId: string): Promise<CustomLeagueMember[]> => {
    if (!user) return [];
    
    try {
      const response = await fetch(`/api/custom-leagues/${leagueId}/leaderboard`, {
        headers: {
          'Authorization': `Bearer ${user.id}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to get leaderboard');
      
      const data = await response.json();
      return data.leaderboard || [];
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      return [];
    }
  }, [user]);

  // Refresh leagues
  const refreshLeagues = useCallback(async () => {
    await fetchLeagues();
  }, [fetchLeagues]);

  // Initial fetch
  useEffect(() => {
    if (user) {
      fetchLeagues();
    }
  }, [user, fetchLeagues]);

  return (
    <CustomLeaguesContext.Provider
      value={{
        myLeagues,
        joinedLeagues,
        pendingInvites,
        currentLeague,
        isLoading,
        error,
        createLeague,
        updateLeague,
        deleteLeague,
        joinLeague,
        leaveLeague,
        inviteMember,
        removeMember,
        promoteMember,
        acceptInvite,
        rejectInvite,
        getLeagueDetails,
        getLeagueLeaderboard,
        refreshLeagues,
      }}
    >
      {children}
    </CustomLeaguesContext.Provider>
  );
}

export function useCustomLeagues() {
  const context = useContext(CustomLeaguesContext);
  if (context === undefined) {
    throw new Error('useCustomLeagues must be used within a CustomLeaguesProvider');
  }
  return context;
}
