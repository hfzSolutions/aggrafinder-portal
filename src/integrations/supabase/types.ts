export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      accounts_pending_deletion: {
        Row: {
          deletion_reason: string | null;
          id: string;
          is_processed: boolean | null;
          requested_at: string | null;
          scheduled_deletion_at: string | null;
        };
        Insert: {
          deletion_reason?: string | null;
          id: string;
          is_processed?: boolean | null;
          requested_at?: string | null;
          scheduled_deletion_at?: string | null;
        };
        Update: {
          deletion_reason?: string | null;
          id?: string;
          is_processed?: boolean | null;
          requested_at?: string | null;
          scheduled_deletion_at?: string | null;
        };
        Relationships: [];
      };
      admin_users: {
        Row: {
          created_at: string;
          id: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      ai_tools: {
        Row: {
          ai_chat_enabled: boolean | null;
          approval_status: string;
          category: string[];
          created_at: string;
          description: string;
          featured: boolean;
          id: string;
          image_url: string | null;
          is_admin_added: boolean | null;
          name: string;
          pricing: string;
          tagline: string | null;
          tags: string[];
          url: string;
          user_id: string | null;
          youtube_url: string | null;
        };
        Insert: {
          ai_chat_enabled?: boolean | null;
          approval_status?: string;
          category: string[];
          created_at?: string;
          description: string;
          featured?: boolean;
          id?: string;
          image_url?: string | null;
          is_admin_added?: boolean | null;
          name: string;
          pricing: string;
          tagline?: string | null;
          tags: string[];
          url: string;
          user_id?: string | null;
          youtube_url?: string | null;
        };
        Update: {
          ai_chat_enabled?: boolean | null;
          approval_status?: string;
          category?: string[];
          created_at?: string;
          description?: string;
          featured?: boolean;
          id?: string;
          image_url?: string | null;
          is_admin_added?: boolean | null;
          name?: string;
          pricing?: string;
          tagline?: string | null;
          tags?: string[];
          url?: string;
          user_id?: string | null;
          youtube_url?: string | null;
        };
        Relationships: [];
      };
      categories: {
        Row: {
          id: number;
          name: string;
        };
        Insert: {
          id?: number;
          name: string;
        };
        Update: {
          id?: number;
          name?: string;
        };
        Relationships: [];
      };
      daily_featured_tools: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          feature_date: string;
          id: string;
          notes: string | null;
          tool_id: string;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          feature_date: string;
          id?: string;
          notes?: string | null;
          tool_id: string;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          feature_date?: string;
          id?: string;
          notes?: string | null;
          tool_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'daily_featured_tools_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'daily_featured_tools_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools_random';
            referencedColumns: ['id'];
          }
        ];
      };
      general_analytics: {
        Row: {
          action: string;
          created_at: string;
          event_type: Database['public']['Enums']['general_analytics_event_type'];
          id: string;
          metadata: Json | null;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          action: string;
          created_at?: string;
          event_type: Database['public']['Enums']['general_analytics_event_type'];
          id?: string;
          metadata?: Json | null;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          action?: string;
          created_at?: string;
          event_type?: Database['public']['Enums']['general_analytics_event_type'];
          id?: string;
          metadata?: Json | null;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          updated_at: string | null;
          username: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          updated_at?: string | null;
          username?: string | null;
        };
        Relationships: [];
      };
      sponsor_ads: {
        Row: {
          created_at: string;
          description: string;
          end_date: string;
          id: string;
          image_url: string;
          is_active: boolean | null;
          link: string;
          link_text: string;
          start_date: string;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description: string;
          end_date: string;
          id?: string;
          image_url: string;
          is_active?: boolean | null;
          link: string;
          link_text?: string;
          start_date: string;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string;
          end_date?: string;
          id?: string;
          image_url?: string;
          is_active?: boolean | null;
          link?: string;
          link_text?: string;
          start_date?: string;
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      sponsor_banners: {
        Row: {
          background_color: string;
          created_at: string;
          end_date: string;
          id: string;
          link: string;
          link_text: string;
          message: string;
          start_date: string;
          text_color: string;
          updated_at: string;
        };
        Insert: {
          background_color?: string;
          created_at?: string;
          end_date: string;
          id?: string;
          link: string;
          link_text: string;
          message: string;
          start_date: string;
          text_color?: string;
          updated_at?: string;
        };
        Update: {
          background_color?: string;
          created_at?: string;
          end_date?: string;
          id?: string;
          link?: string;
          link_text?: string;
          message?: string;
          start_date?: string;
          text_color?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      subscribers: {
        Row: {
          created_at: string;
          email: string | null;
          idssss: number;
        };
        Insert: {
          created_at?: string;
          email?: string | null;
          idssss?: number;
        };
        Update: {
          created_at?: string;
          email?: string | null;
          idssss?: number;
        };
        Relationships: [];
      };
      support_messages: {
        Row: {
          created_at: string;
          email: string;
          id: string;
          message: string;
          name: string;
          status: string;
          subject: string;
        };
        Insert: {
          created_at?: string;
          email: string;
          id?: string;
          message: string;
          name: string;
          status?: string;
          subject: string;
        };
        Update: {
          created_at?: string;
          email?: string;
          id?: string;
          message?: string;
          name?: string;
          status?: string;
          subject?: string;
        };
        Relationships: [];
      };
      tool_analytics: {
        Row: {
          action: string;
          affiliate_code: string | null;
          created_at: string;
          id: string;
          metadata: Json | null;
          tool_id: string | null;
          user_id: string;
        };
        Insert: {
          action: string;
          affiliate_code?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          tool_id?: string | null;
          user_id: string;
        };
        Update: {
          action?: string;
          affiliate_code?: string | null;
          created_at?: string;
          id?: string;
          metadata?: Json | null;
          tool_id?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tool_analytics_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tool_analytics_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools_random';
            referencedColumns: ['id'];
          }
        ];
      };
      tool_ownership_claims: {
        Row: {
          admin_feedback: string | null;
          created_at: string;
          id: string;
          status: string;
          submitter_email: string;
          submitter_name: string;
          tool_id: string;
          updated_at: string;
          user_id: string;
          verification_details: string;
        };
        Insert: {
          admin_feedback?: string | null;
          created_at?: string;
          id?: string;
          status?: string;
          submitter_email: string;
          submitter_name: string;
          tool_id: string;
          updated_at?: string;
          user_id: string;
          verification_details: string;
        };
        Update: {
          admin_feedback?: string | null;
          created_at?: string;
          id?: string;
          status?: string;
          submitter_email?: string;
          submitter_name?: string;
          tool_id?: string;
          updated_at?: string;
          user_id?: string;
          verification_details?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tool_ownership_claims_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tool_ownership_claims_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools_random';
            referencedColumns: ['id'];
          }
        ];
      };
      tool_reports: {
        Row: {
          category: string[];
          created_at: string;
          description: string;
          id: string;
          migrated: boolean | null;
          name: string;
          pricing: string | null;
          request_type: string;
          status: string;
          submitter_email: string | null;
          submitter_name: string | null;
          tool_id: string | null;
          url: string;
          youtube_url: string | null;
        };
        Insert: {
          category: string[];
          created_at?: string;
          description: string;
          id?: string;
          migrated?: boolean | null;
          name: string;
          pricing?: string | null;
          request_type?: string;
          status?: string;
          submitter_email?: string | null;
          submitter_name?: string | null;
          tool_id?: string | null;
          url: string;
          youtube_url?: string | null;
        };
        Update: {
          category?: string[];
          created_at?: string;
          description?: string;
          id?: string;
          migrated?: boolean | null;
          name?: string;
          pricing?: string | null;
          request_type?: string;
          status?: string;
          submitter_email?: string | null;
          submitter_name?: string | null;
          tool_id?: string | null;
          url?: string;
          youtube_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tool_reports_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tool_reports_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools_random';
            referencedColumns: ['id'];
          }
        ];
      };
      tool_reviews: {
        Row: {
          comment: string | null;
          created_at: string;
          id: string;
          rating: number | null;
          tool_id: string | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating?: number | null;
          tool_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          comment?: string | null;
          created_at?: string;
          id?: string;
          rating?: number | null;
          tool_id?: string | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tool_reviews_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tool_reviews_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools_random';
            referencedColumns: ['id'];
          }
        ];
      };
      tool_votes: {
        Row: {
          created_at: string;
          id: string;
          ip_address: string;
          tool_id: string;
          vote_type: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          ip_address: string;
          tool_id: string;
          vote_type: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          ip_address?: string;
          tool_id?: string;
          vote_type?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tool_votes_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tool_votes_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools_random';
            referencedColumns: ['id'];
          }
        ];
      };
      user_preferences: {
        Row: {
          created_at: string;
          id: string;
          preferred_categories: string[] | null;
          preferred_pricing: string | null;
          receive_recommendations: boolean | null;
          updated_at: string;
          user_id: string | null;
        };
        Insert: {
          created_at?: string;
          id?: string;
          preferred_categories?: string[] | null;
          preferred_pricing?: string | null;
          receive_recommendations?: boolean | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Update: {
          created_at?: string;
          id?: string;
          preferred_categories?: string[] | null;
          preferred_pricing?: string | null;
          receive_recommendations?: boolean | null;
          updated_at?: string;
          user_id?: string | null;
        };
        Relationships: [];
      };
    };
    Views: {
      ai_tools_random: {
        Row: {
          approval_status: string | null;
          category: string[] | null;
          created_at: string | null;
          description: string | null;
          featured: boolean | null;
          id: string | null;
          image_url: string | null;
          is_admin_added: boolean | null;
          name: string | null;
          pricing: string | null;
          tagline: string | null;
          tags: string[] | null;
          url: string | null;
          user_id: string | null;
          youtube_url: string | null;
        };
        Insert: {
          approval_status?: string | null;
          category?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          featured?: boolean | null;
          id?: string | null;
          image_url?: string | null;
          is_admin_added?: boolean | null;
          name?: string | null;
          pricing?: string | null;
          tagline?: string | null;
          tags?: string[] | null;
          url?: string | null;
          user_id?: string | null;
          youtube_url?: string | null;
        };
        Update: {
          approval_status?: string | null;
          category?: string[] | null;
          created_at?: string | null;
          description?: string | null;
          featured?: boolean | null;
          id?: string | null;
          image_url?: string | null;
          is_admin_added?: boolean | null;
          name?: string | null;
          pricing?: string | null;
          tagline?: string | null;
          tags?: string[] | null;
          url?: string | null;
          user_id?: string | null;
          youtube_url?: string | null;
        };
        Relationships: [];
      };
      tool_vote_counts: {
        Row: {
          downvotes: number | null;
          tool_id: string | null;
          upvotes: number | null;
          vote_score: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'tool_votes_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tool_votes_tool_id_fkey';
            columns: ['tool_id'];
            isOneToOne: false;
            referencedRelation: 'ai_tools_random';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Functions: {
      approve_tool: {
        Args: { tool_id: string };
        Returns: undefined;
      };
      create_affiliate: {
        Args: { user_id: string };
        Returns: string;
      };
      generate_affiliate_code: {
        Args: Record<PropertyKey, never>;
        Returns: string;
      };
      get_todays_featured_tool: {
        Args: Record<PropertyKey, never>;
        Returns: {
          ai_chat_enabled: boolean | null;
          approval_status: string;
          category: string[];
          created_at: string;
          description: string;
          featured: boolean;
          id: string;
          image_url: string | null;
          is_admin_added: boolean | null;
          name: string;
          pricing: string;
          tagline: string | null;
          tags: string[];
          url: string;
          user_id: string | null;
          youtube_url: string | null;
        }[];
      };
      mark_account_for_deletion: {
        Args: { user_id: string; deletion_reason?: string };
        Returns: boolean;
      };
      process_accounts_pending_deletion: {
        Args: Record<PropertyKey, never>;
        Returns: undefined;
      };
      random_ai_tools: {
        Args: Record<PropertyKey, never>;
        Returns: {
          ai_chat_enabled: boolean | null;
          approval_status: string;
          category: string[];
          created_at: string;
          description: string;
          featured: boolean;
          id: string;
          image_url: string | null;
          is_admin_added: boolean | null;
          name: string;
          pricing: string;
          tagline: string | null;
          tags: string[];
          url: string;
          user_id: string | null;
          youtube_url: string | null;
        }[];
      };
      reject_tool: {
        Args: { tool_id: string };
        Returns: undefined;
      };
    };
    Enums: {
      general_analytics_event_type:
        | 'newsletter'
        | 'sponsor_ad'
        | 'page_view'
        | 'traffic_source'
        | 'sponsor_ad_banner';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DefaultSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
      DefaultSchema['Views'])
  ? (DefaultSchema['Tables'] &
      DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
  ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
  ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
  ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
  : never;

export const Constants = {
  public: {
    Enums: {
      general_analytics_event_type: [
        'newsletter',
        'sponsor_ad',
        'page_view',
        'traffic_source',
        'sponsor_ad_banner',
      ],
    },
  },
} as const;
