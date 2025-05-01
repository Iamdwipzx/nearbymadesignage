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
        Row: {
          id: string
          name: string
          role: 'admin' | 'user'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          name: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: 'admin' | 'user'
          created_at?: string
          updated_at?: string
        }
      }
      screens: {
        Row: {
          id: string
          name: string
          aspect_ratio: '16:9' | '9:16'
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          aspect_ratio: '16:9' | '9:16'
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          aspect_ratio?: '16:9' | '9:16'
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      playlists: {
        Row: {
          id: string
          name: string
          screen_id: string
          created_by: string
          preview_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          screen_id: string
          created_by: string
          preview_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          screen_id?: string
          created_by?: string
          preview_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      playlist_contents: {
        Row: {
          id: string
          playlist_id: string
          type: 'image' | 'video' | 'youtube' | 'canva' | 'html'
          content: string
          position_x: number
          position_y: number
          width: number
          height: number
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          playlist_id: string
          type: 'image' | 'video' | 'youtube' | 'canva' | 'html'
          content: string
          position_x: number
          position_y: number
          width: number
          height: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          playlist_id?: string
          type?: 'image' | 'video' | 'youtube' | 'canva' | 'html'
          content?: string
          position_x?: number
          position_y?: number
          width?: number
          height?: number
          settings?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}