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
      app_users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_banned: boolean
          last_check_in: string | null
          name: string
          photo_url: string | null
          role: string | null
          streak: number
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_banned?: boolean
          last_check_in?: string | null
          name: string
          photo_url?: string | null
          role?: string | null
          streak?: number
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_banned?: boolean
          last_check_in?: string | null
          name?: string
          photo_url?: string | null
          role?: string | null
          streak?: number
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          check_in_date: string
          count_in_ranking: boolean
          id: string
          photo_url: string | null
          timestamp: string
          user_id: string
        }
        Insert: {
          check_in_date?: string
          count_in_ranking?: boolean
          id?: string
          photo_url?: string | null
          timestamp?: string
          user_id: string
        }
        Update: {
          check_in_date?: string
          count_in_ranking?: boolean
          id?: string
          photo_url?: string | null
          timestamp?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "check_ins_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_proposals: {
        Row: {
          created_at: string
          due_date: string
          id: string
          payment_key: string | null
          payment_link: string
          payment_value: number
          status: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          due_date: string
          id?: string
          payment_key?: string | null
          payment_link: string
          payment_value: number
          status?: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          due_date?: string
          id?: string
          payment_key?: string | null
          payment_link?: string
          payment_value?: number
          status?: string
          user_id?: string
          value?: number
        }
        Relationships: []
      }
      parties: {
        Row: {
          checked_in: boolean
          code: string
          created_at: string
          creator_id: string
          custom_message: string | null
          expires_at: string
          id: string
          is_active: boolean
          max_members: number
        }
        Insert: {
          checked_in?: boolean
          code: string
          created_at?: string
          creator_id: string
          custom_message?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          max_members?: number
        }
        Update: {
          checked_in?: boolean
          code?: string
          created_at?: string
          creator_id?: string
          custom_message?: string | null
          expires_at?: string
          id?: string
          is_active?: boolean
          max_members?: number
        }
        Relationships: []
      }
      party_members: {
        Row: {
          id: string
          joined_at: string
          party_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          party_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          party_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "party_members_party_id_fkey"
            columns: ["party_id"]
            isOneToOne: false
            referencedRelation: "parties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_id: string
          awarded_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_id: string
          awarded_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_id?: string
          awarded_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_party_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_users_with_seven_or_more_checkins: {
        Args: { start_date: string }
        Returns: {
          id: string
          name: string
          email: string
          photo_url: string
          count: number
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_party_member: {
        Args: { user_id: string; party_id: string }
        Returns: boolean
      }
      process_party_check_in: {
        Args: {
          p_member_ids: string[]
          p_check_in_date: string
          p_timestamp: string
        }
        Returns: Json
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
