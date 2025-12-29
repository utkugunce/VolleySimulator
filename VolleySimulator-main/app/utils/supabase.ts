import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

// Check if Supabase is properly configured
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
    // Only create client in browser environment
    if (typeof window === 'undefined') {
        return null;
    }

    if (!isSupabaseConfigured) {
        return null;
    }

    if (!supabaseClient) {
        supabaseClient = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
    }

    return supabaseClient;
}
