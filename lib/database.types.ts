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
      user_meta: {
        Row: {
          user_id: string
          username: string | null
          avatar_url: string | null
          is_paid: boolean
          paid_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          username?: string | null
          avatar_url?: string | null
          is_paid?: boolean
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          username?: string | null
          avatar_url?: string | null
          is_paid?: boolean
          paid_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_usage: {
        Row: {
          id: number
          user_id: string
          date: string
          generation_count: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          date: string
          generation_count: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          date?: string
          generation_count?: number
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 