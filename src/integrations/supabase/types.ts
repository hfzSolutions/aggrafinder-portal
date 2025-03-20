export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_outcomes: {
        Row: {
          created_at: string
          description: string
          id: string
          image_url: string
          submitter_email: string | null
          submitter_name: string
          title: string
          tool_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          image_url: string
          submitter_email?: string | null
          submitter_name: string
          title: string
          tool_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          submitter_email?: string | null
          submitter_name?: string
          title?: string
          tool_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_outcomes_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_tools: {
        Row: {
          category: string[]
          created_at: string
          description: string
          featured: boolean
          id: string
          image_url: string
          name: string
          pricing: string
          tags: string[]
          url: string
        }
        Insert: {
          category: string[]
          created_at?: string
          description: string
          featured?: boolean
          id?: string
          image_url: string
          name: string
          pricing: string
          tags: string[]
          url: string
        }
        Update: {
          category?: string[]
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_url?: string
          name?: string
          pricing?: string
          tags?: string[]
          url?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          id: number
          name: string
        }
        Insert: {
          id?: number
          name: string
        }
        Update: {
          id?: number
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string | null
          id: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: number
        }
        Relationships: []
      }
      tool_analytics: {
        Row: {
          action: string
          created_at: string
          id: string
          metadata: Json | null
          tool_id: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          metadata?: Json | null
          tool_id: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          tool_id?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_requests: {
        Row: {
          category: string[]
          created_at: string
          description: string
          id: string
          name: string
          pricing: string | null
          status: string
          submitter_email: string | null
          submitter_name: string | null
          url: string
        }
        Insert: {
          category: string[]
          created_at?: string
          description: string
          id?: string
          name: string
          pricing?: string | null
          status?: string
          submitter_email?: string | null
          submitter_name?: string | null
          url: string
        }
        Update: {
          category?: string[]
          created_at?: string
          description?: string
          id?: string
          name?: string
          pricing?: string | null
          status?: string
          submitter_email?: string | null
          submitter_name?: string | null
          url?: string
        }
        Relationships: []
      }
      tool_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number
          tool_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          tool_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          tool_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tool_votes: {
        Row: {
          created_at: string
          id: string
          ip_address: string
          tool_id: string
          vote_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip_address: string
          tool_id: string
          vote_type: string
        }
        Update: {
          created_at?: string
          id?: string
          ip_address?: string
          tool_id?: string
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_votes_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preferred_categories: string[] | null
          preferred_pricing: string | null
          receive_recommendations: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          preferred_categories?: string[] | null
          preferred_pricing?: string | null
          receive_recommendations?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          preferred_categories?: string[] | null
          preferred_pricing?: string | null
          receive_recommendations?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      tool_vote_counts: {
        Row: {
          downvotes: number | null
          tool_id: string | null
          upvotes: number | null
          vote_score: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_votes_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
