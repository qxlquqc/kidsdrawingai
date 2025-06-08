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
          id: string
          user_id: string
          username?: string | null
          avatar_url?: string | null
          is_paid: boolean
          paid_at?: string | null
          plan_type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          username?: string | null
          avatar_url?: string | null
          is_paid?: boolean
          paid_at?: string | null
          plan_type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          username?: string | null
          avatar_url?: string | null
          is_paid?: boolean
          paid_at?: string | null
          plan_type?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_usage: {
        Row: {
          id: string
          user_id: string
          date: string
          generation_count: number
          created_at: string
          updated_at?: string | null
        }
        Insert: {
          id?: string
          user_id: string
          date: string
          generation_count?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          date?: string
          generation_count?: number
          created_at?: string
          updated_at?: string | null
        }
      }
      payment_events: {
        Row: {
          id: string
          event_id: string
          event_type: string
          user_id: string | null
          plan_type: string | null
          creem_customer_id: string | null
          creem_order_id: string | null
          amount: number | null
          currency: string
          processed_at: string
          metadata: Record<string, any>
        }
        Insert: {
          id?: string
          event_id: string
          event_type: string
          user_id?: string | null
          plan_type?: string | null
          creem_customer_id?: string | null
          creem_order_id?: string | null
          amount?: number | null
          currency?: string
          processed_at?: string
          metadata?: Record<string, any>
        }
        Update: {
          id?: string
          event_id?: string
          event_type?: string
          user_id?: string | null
          plan_type?: string | null
          creem_customer_id?: string | null
          creem_order_id?: string | null
          amount?: number | null
          currency?: string
          processed_at?: string
          metadata?: Record<string, any>
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