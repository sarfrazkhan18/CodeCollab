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
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
          bio: string | null
          preferences: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
          bio?: string | null
          preferences?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          framework: string | null
          template: string | null
          is_public: boolean | null
          settings: Json | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          framework?: string | null
          template?: string | null
          is_public?: boolean | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          framework?: string | null
          template?: string | null
          is_public?: boolean | null
          settings?: Json | null
          created_at?: string
          updated_at?: string
        }
      }
      project_files: {
        Row: {
          id: string
          project_id: string
          file_path: string
          content: string | null
          file_type: string | null
          size_bytes: number | null
          version: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          file_path: string
          content?: string | null
          file_type?: string | null
          size_bytes?: number | null
          version?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          file_path?: string
          content?: string | null
          file_type?: string | null
          size_bytes?: number | null
          version?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      collaboration_sessions: {
        Row: {
          id: string
          project_id: string
          user_id: string
          session_data: Json | null
          last_activity: string
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          session_data?: Json | null
          last_activity?: string
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          session_data?: Json | null
          last_activity?: string
          is_active?: boolean | null
          created_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          project_id: string
          file_path: string
          line_number: number | null
          user_id: string
          content: string
          parent_comment_id: string | null
          resolved: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          file_path: string
          line_number?: number | null
          user_id: string
          content: string
          parent_comment_id?: string | null
          resolved?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          file_path?: string
          line_number?: number | null
          user_id?: string
          content?: string
          parent_comment_id?: string | null
          resolved?: boolean | null
          created_at?: string
          updated_at?: string
        }
      }
      ai_interactions: {
        Row: {
          id: string
          user_id: string
          project_id: string | null
          agent_type: string
          prompt: string
          response: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_id?: string | null
          agent_type: string
          prompt: string
          response?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_id?: string | null
          agent_type?: string
          prompt?: string
          response?: string | null
          metadata?: Json | null
          created_at?: string
        }
      }
      file_versions: {
        Row: {
          id: string
          project_file_id: string
          version_number: number
          content: string | null
          change_description: string | null
          user_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          project_file_id: string
          version_number: number
          content?: string | null
          change_description?: string | null
          user_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          project_file_id?: string
          version_number?: number
          content?: string | null
          change_description?: string | null
          user_id?: string | null
          created_at?: string
        }
      }
      project_collaborators: {
        Row: {
          id: string
          project_id: string
          user_id: string
          role: string | null
          invited_by: string | null
          joined_at: string
        }
        Insert: {
          id?: string
          project_id: string
          user_id: string
          role?: string | null
          invited_by?: string | null
          joined_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          user_id?: string
          role?: string | null
          invited_by?: string | null
          joined_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_inactive_sessions: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}