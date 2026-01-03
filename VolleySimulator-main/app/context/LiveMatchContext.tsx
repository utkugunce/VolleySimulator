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
      const response = await fetch('/api/live/matches');
      
      if (!response.ok) throw new Error('Failed to fetch live matches');
      
      const data = await response.json();
      setLiveMatches(data.matches || []);
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
      console.log('Connected to live match:', matchId);
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
      console.log('Disconnected from live match');
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
