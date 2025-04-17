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
      accounts_pending_deletion: {
        Row: {
          deletion_reason: string | null
          id: string
          is_processed: boolean | null
          requested_at: string | null
          scheduled_deletion_at: string | null
        }
        Insert: {
          deletion_reason?: string | null
          id: string
          is_processed?: boolean | null
          requested_at?: string | null
          scheduled_deletion_at?: string | null
        }
        Update: {
          deletion_reason?: string | null
          id?: string
          is_processed?: boolean | null
          requested_at?: string | null
          scheduled_deletion_at?: string | null
        }
        Relationships: []
      }
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
          approval_status: string
          category: string[]
          created_at: string
          description: string
          featured: boolean
          id: string
          image_url: string | null
          is_admin_added: boolean | null
          name: string
          pricing: string
          tagline: string | null
          tags: string[]
          url: string
          user_id: string | null
          youtube_url: string | null
        }
        Insert: {
          approval_status?: string
          category: string[]
          created_at?: string
          description: string
          featured?: boolean
          id?: string
          image_url?: string | null
          is_admin_added?: boolean | null
          name: string
          pricing: string
          tagline?: string | null
          tags: string[]
          url: string
          user_id?: string | null
          youtube_url?: string | null
        }
        Update: {
          approval_status?: string
          category?: string[]
          created_at?: string
          description?: string
          featured?: boolean
          id?: string
          image_url?: string | null
          is_admin_added?: boolean | null
          name?: string
          pricing?: string
          tagline?: string | null
          tags?: string[]
          url?: string
          user_id?: string | null
          youtube_url?: string | null
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
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          email: string | null
          idssss: number
        }
        Insert: {
          created_at?: string
          email?: string | null
          idssss?: number
        }
        Update: {
          created_at?: string
          email?: string | null
          idssss?: number
        }
        Relationships: []
      }
      support_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string
          subject?: string
        }
        Relationships: []
      }
      tool_analytics: {
        Row: {
          action: string
          affiliate_code: string | null
          created_at: string
          id: string
          metadata: Json | null
          tool_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          affiliate_code?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          tool_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          affiliate_code?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          tool_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_analytics_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_ownership_claims: {
        Row: {
          admin_feedback: string | null
          created_at: string
          id: string
          status: string
          submitter_email: string
          submitter_name: string
          tool_id: string
          updated_at: string
          user_id: string
          verification_details: string
        }
        Insert: {
          admin_feedback?: string | null
          created_at?: string
          id?: string
          status?: string
          submitter_email: string
          submitter_name: string
          tool_id: string
          updated_at?: string
          user_id: string
          verification_details: string
        }
        Update: {
          admin_feedback?: string | null
          created_at?: string
          id?: string
          status?: string
          submitter_email?: string
          submitter_name?: string
          tool_id?: string
          updated_at?: string
          user_id?: string
          verification_details?: string
        }
        Relationships: [
          {
            foreignKeyName: "tool_ownership_claims_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_requests: {
        Row: {
          category: string[]
          created_at: string
          description: string
          id: string
          migrated: boolean | null
          name: string
          pricing: string | null
          request_type: string
          status: string
          submitter_email: string | null
          submitter_name: string | null
          tool_id: string | null
          url: string
          youtube_url: string | null
        }
        Insert: {
          category: string[]
          created_at?: string
          description: string
          id?: string
          migrated?: boolean | null
          name: string
          pricing?: string | null
          request_type?: string
          status?: string
          submitter_email?: string | null
          submitter_name?: string | null
          tool_id?: string | null
          url: string
          youtube_url?: string | null
        }
        Update: {
          category?: string[]
          created_at?: string
          description?: string
          id?: string
          migrated?: boolean | null
          name?: string
          pricing?: string | null
          request_type?: string
          status?: string
          submitter_email?: string | null
          submitter_name?: string | null
          tool_id?: string | null
          url?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_requests_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
      }
      tool_reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rating: number | null
          tool_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          tool_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number | null
          tool_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tool_reviews_tool_id_fkey"
            columns: ["tool_id"]
            isOneToOne: false
            referencedRelation: "ai_tools"
            referencedColumns: ["id"]
          },
        ]
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
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          preferred_categories?: string[] | null
          preferred_pricing?: string | null
          receive_recommendations?: boolean | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          preferred_categories?: string[] | null
          preferred_pricing?: string | null
          receive_recommendations?: boolean | null
          updated_at?: string
          user_id?: string | null
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
      approve_tool: {
        Args: { tool_id: string }
        Returns: undefined
      }
      create_affiliate: {
        Args: { user_id: string }
        Returns: string
      }
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      mark_account_for_deletion: {
        Args: { user_id: string; deletion_reason?: string }
        Returns: boolean
      }
      process_accounts_pending_deletion: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      reject_tool: {
        Args: { tool_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
