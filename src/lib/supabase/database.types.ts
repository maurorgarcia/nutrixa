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
      users: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      patients: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      anamnesis: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      recipes: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      meal_plans: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
      }
      follow_ups: {
        Row: Record<string, any>
        Insert: Record<string, any>
        Update: Record<string, any>
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
  }
}
