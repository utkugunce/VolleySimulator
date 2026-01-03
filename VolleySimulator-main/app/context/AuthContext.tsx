"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session, SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '../utils/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    signUp: (email: string, password: string, metadata?: { name?: string }) => Promise<{ error: Error | null }>;
    signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
    signInWithGoogle: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [supabase, setSupabase] = useState<SupabaseClient | null>(null);

    // Initialize Supabase client only in browser
    useEffect(() => {
        const client = createClient();
        setSupabase(client);

        if (!client) {
            setLoading(false);
            return;
        }

        const initAuth = async () => {
            try {
                const { data } = await client.auth.getSession();
                setSession(data.session);
                setUser(data.session?.user ?? null);
            } catch (err) {
                console.warn("Auth check failed:", err);
            } finally {
                setLoading(false);
            }
        };

        initAuth();

        // Listen for auth changes
        const { data: { subscription } } = client.auth.onAuthStateChange((_event: string, currentSession: Session | null) => {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const signUp = async (email: string, password: string, metadata?: { name?: string }) => {
        if (!supabase) {
            return { error: new Error('Supabase is not configured') };
        }
        const { error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metadata
            }
        });
        return { error: error as Error | null };
    };

    const signIn = async (email: string, password: string) => {
        if (!supabase) {
            return { error: new Error('Supabase is not configured') };
        }
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        return { error: error as Error | null };
    };

    const signOut = async () => {
        if (!supabase) return;
        await supabase.auth.signOut();
        // Redirect to home page after sign out
        window.location.href = '/';
    };

    const signInWithGoogle = async () => {
        if (!supabase) return;
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback`
            }
        });
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            signUp,
            signIn,
            signOut,
            signInWithGoogle
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
