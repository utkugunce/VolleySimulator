/**
 * Supabase Database Types
 * Auto-generated types for the VolleySimulator database schema
 * 
 * To regenerate: npx supabase gen types typescript --project-id "YOUR_PROJECT_ID" > types/supabase.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      leagues: {
        Row: {
          id: string
          name: string
          short_name: string
          subtitle: string | null
          season: string
          country: 'TR' | 'EU'
          theme: 'red' | 'amber' | 'emerald' | 'blue' | 'rose' | 'purple'
          icon: string
          has_groups: boolean
          has_rounds: boolean
          has_playoffs: boolean
          playoff_spots: number
          secondary_playoff_spots: number
          relegation_spots: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          short_name: string
          subtitle?: string | null
          season?: string
          country?: 'TR' | 'EU'
          theme?: 'red' | 'amber' | 'emerald' | 'blue' | 'rose' | 'purple'
          icon?: string
          has_groups?: boolean
          has_rounds?: boolean
          has_playoffs?: boolean
          playoff_spots?: number
          secondary_playoff_spots?: number
          relegation_spots?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          short_name?: string
          subtitle?: string | null
          season?: string
          country?: 'TR' | 'EU'
          theme?: 'red' | 'amber' | 'emerald' | 'blue' | 'rose' | 'purple'
          icon?: string
          has_groups?: boolean
          has_rounds?: boolean
          has_playoffs?: boolean
          playoff_spots?: number
          secondary_playoff_spots?: number
          relegation_spots?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          league_id: string
          name: string
          short_name: string | null
          slug: string
          group_name: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          arena: string | null
          city: string | null
          strength_rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          name: string
          short_name?: string | null
          slug: string
          group_name?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          arena?: string | null
          city?: string | null
          strength_rating?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          name?: string
          short_name?: string | null
          slug?: string
          group_name?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          arena?: string | null
          city?: string | null
          strength_rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          league_id: string
          home_team_id: string | null
          away_team_id: string | null
          home_team_name: string
          away_team_name: string
          group_name: string | null
          week: number | null
          round: string | null
          match_date: string | null
          match_time: string | null
          venue: string | null
          status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
          home_score: number
          away_score: number
          home_sets: number[]
          away_sets: number[]
          is_played: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          home_team_id?: string | null
          away_team_id?: string | null
          home_team_name: string
          away_team_name: string
          group_name?: string | null
          week?: number | null
          round?: string | null
          match_date?: string | null
          match_time?: string | null
          venue?: string | null
          status?: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
          home_score?: number
          away_score?: number
          home_sets?: number[]
          away_sets?: number[]
          is_played?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          home_team_id?: string | null
          away_team_id?: string | null
          home_team_name?: string
          away_team_name?: string
          group_name?: string | null
          week?: number | null
          round?: string | null
          match_date?: string | null
          match_time?: string | null
          venue?: string | null
          status?: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
          home_score?: number
          away_score?: number
          home_sets?: number[]
          away_sets?: number[]
          is_played?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      standings: {
        Row: {
          id: string
          league_id: string
          team_id: string
          group_name: string | null
          matches_played: number
          wins: number
          losses: number
          sets_won: number
          sets_lost: number
          points_scored: number
          points_conceded: number
          points: number
          set_ratio: number
          point_ratio: number
          rank: number | null
          form: ('W' | 'L')[]
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          team_id: string
          group_name?: string | null
          matches_played?: number
          wins?: number
          losses?: number
          sets_won?: number
          sets_lost?: number
          points_scored?: number
          points_conceded?: number
          points?: number
          set_ratio?: number
          point_ratio?: number
          rank?: number | null
          form?: ('W' | 'L')[]
          updated_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          team_id?: string
          group_name?: string | null
          matches_played?: number
          wins?: number
          losses?: number
          sets_won?: number
          sets_lost?: number
          points_scored?: number
          points_conceded?: number
          points?: number
          set_ratio?: number
          point_ratio?: number
          rank?: number | null
          form?: ('W' | 'L')[]
          updated_at?: string
        }
      }
      playoff_matches: {
        Row: {
          id: string
          league_id: string
          stage: string
          match_number: number
          home_team_id: string | null
          away_team_id: string | null
          home_team_name: string | null
          away_team_name: string | null
          home_score: number
          away_score: number
          home_sets: number[]
          away_sets: number[]
          match_date: string | null
          status: string
          series_home_wins: number
          series_away_wins: number
          series_completed: boolean
          winner_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          stage: string
          match_number?: number
          home_team_id?: string | null
          away_team_id?: string | null
          home_team_name?: string | null
          away_team_name?: string | null
          home_score?: number
          away_score?: number
          home_sets?: number[]
          away_sets?: number[]
          match_date?: string | null
          status?: string
          series_home_wins?: number
          series_away_wins?: number
          series_completed?: boolean
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          league_id?: string
          stage?: string
          match_number?: number
          home_team_id?: string | null
          away_team_id?: string | null
          home_team_name?: string | null
          away_team_name?: string | null
          home_score?: number
          away_score?: number
          home_sets?: number[]
          away_sets?: number[]
          match_date?: string | null
          status?: string
          series_home_wins?: number
          series_away_wins?: number
          series_completed?: boolean
          winner_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      league_standings_view: {
        Row: {
          id: string
          league_id: string
          team_id: string
          group_name: string | null
          matches_played: number
          wins: number
          losses: number
          sets_won: number
          sets_lost: number
          points: number
          rank: number | null
          team_name: string
          team_short_name: string | null
          team_logo: string | null
          team_slug: string
          league_name: string
          league_short_name: string
        }
      }
      upcoming_matches_view: {
        Row: {
          id: string
          league_id: string
          home_team_name: string
          away_team_name: string
          match_date: string | null
          status: string
          home_team_display: string | null
          home_team_logo: string | null
          away_team_display: string | null
          away_team_logo: string | null
          league_name: string
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Helper types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type InsertTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type UpdateTables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
export type Views<T extends keyof Database['public']['Views']> = Database['public']['Views'][T]['Row']

// Convenient aliases
export type League = Tables<'leagues'>
export type Team = Tables<'teams'>
export type Match = Tables<'matches'>
export type Standing = Tables<'standings'>
export type PlayoffMatch = Tables<'playoff_matches'>

export type LeagueStandingView = Views<'league_standings_view'>
export type UpcomingMatchView = Views<'upcoming_matches_view'>

// Insert types
export type LeagueInsert = InsertTables<'leagues'>
export type TeamInsert = InsertTables<'teams'>
export type MatchInsert = InsertTables<'matches'>
export type StandingInsert = InsertTables<'standings'>
