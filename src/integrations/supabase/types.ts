export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      app_users: {
        Row: {
          created_at: string | null
          email: string
          id: string
          is_banned: boolean | null
          last_check_in: string | null
          name: string
          photo_url: string | null
          role: string | null
          streak: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
          is_banned?: boolean | null
          last_check_in?: string | null
          name: string
          photo_url?: string | null
          role?: string | null
          streak?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          is_banned?: boolean | null
          last_check_in?: string | null
          name?: string
          photo_url?: string | null
          role?: string | null
          streak?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          client_id: string
          created_at: string | null
          description: string | null
          duration_minutes: number
          id: string
          location: string | null
          notes: string | null
          status: string
          title: string
          trainer_id: string
          updated_at: string | null
        }
        Insert: {
          appointment_date: string
          client_id: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
          title: string
          trainer_id: string
          updated_at?: string | null
        }
        Update: {
          appointment_date?: string
          client_id?: string
          created_at?: string | null
          description?: string | null
          duration_minutes?: number
          id?: string
          location?: string | null
          notes?: string | null
          status?: string
          title?: string
          trainer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_trainer_id_fkey"
            columns: ["trainer_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      body_measurements: {
        Row: {
          bicep_left: number | null
          bicep_right: number | null
          body_fat: number | null
          chest: number | null
          created_at: string | null
          forearm_left: number | null
          forearm_right: number | null
          height: number
          hips: number | null
          id: string
          measurement_date: string
          muscle_mass: number | null
          neck: number | null
          notes: string | null
          shoulders: number | null
          thigh_left: number | null
          thigh_right: number | null
          user_id: string
          waist: number | null
          weight: number
        }
        Insert: {
          bicep_left?: number | null
          bicep_right?: number | null
          body_fat?: number | null
          chest?: number | null
          created_at?: string | null
          forearm_left?: number | null
          forearm_right?: number | null
          height: number
          hips?: number | null
          id?: string
          measurement_date?: string
          muscle_mass?: number | null
          neck?: number | null
          notes?: string | null
          shoulders?: number | null
          thigh_left?: number | null
          thigh_right?: number | null
          user_id: string
          waist?: number | null
          weight: number
        }
        Update: {
          bicep_left?: number | null
          bicep_right?: number | null
          body_fat?: number | null
          chest?: number | null
          created_at?: string | null
          forearm_left?: number | null
          forearm_right?: number | null
          height?: number
          hips?: number | null
          id?: string
          measurement_date?: string
          muscle_mass?: number | null
          neck?: number | null
          notes?: string | null
          shoulders?: number | null
          thigh_left?: number | null
          thigh_right?: number | null
          user_id?: string
          waist?: number | null
          weight?: number
        }
        Relationships: []
      }
      check_ins: {
        Row: {
          check_in_date: string
          count_in_ranking: boolean | null
          created_at: string | null
          id: string
          notes: string | null
          photo_url: string | null
          user_id: string
          workout_type: string | null
        }
        Insert: {
          check_in_date?: string
          count_in_ranking?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          user_id: string
          workout_type?: string | null
        }
        Update: {
          check_in_date?: string
          count_in_ranking?: boolean | null
          created_at?: string | null
          id?: string
          notes?: string | null
          photo_url?: string | null
          user_id?: string
          workout_type?: string | null
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
      fitness_goals: {
        Row: {
          created_at: string | null
          current_value: number | null
          description: string
          goal_type: string
          id: string
          is_active: boolean | null
          measurement_type: string | null
          target_date: string
          target_value: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          current_value?: number | null
          description: string
          goal_type: string
          id?: string
          is_active?: boolean | null
          measurement_type?: string | null
          target_date: string
          target_value: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          current_value?: number | null
          description?: string
          goal_type?: string
          id?: string
          is_active?: boolean | null
          measurement_type?: string | null
          target_date?: string
          target_value?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      group_members: {
        Row: {
          group_id: string
          id: string
          is_admin: boolean | null
          joined_at: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          is_admin?: boolean | null
          joined_at?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          is_admin?: boolean | null
          joined_at?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "training_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_post_likes: {
        Row: {
          created_at: string | null
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "group_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      group_posts: {
        Row: {
          content: string
          created_at: string | null
          group_id: string
          id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          group_id: string
          id?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          group_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "group_posts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "training_groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "group_posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_proposals: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_proposals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          message: string
          read: boolean | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          read?: boolean | null
          related_id?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          read?: boolean | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_entries: {
        Row: {
          amount: number
          calories: number
          carbs: number
          created_at: string | null
          entry_date: string
          fat: number
          fiber: number | null
          food_name: string
          id: string
          meal_type: string
          protein: number
          user_id: string
        }
        Insert: {
          amount: number
          calories: number
          carbs: number
          created_at?: string | null
          entry_date?: string
          fat: number
          fiber?: number | null
          food_name: string
          id?: string
          meal_type: string
          protein: number
          user_id: string
        }
        Update: {
          amount?: number
          calories?: number
          carbs?: number
          created_at?: string | null
          entry_date?: string
          fat?: number
          fiber?: number | null
          food_name?: string
          id?: string
          meal_type?: string
          protein?: number
          user_id?: string
        }
        Relationships: []
      }
      nutrition_goals: {
        Row: {
          calories: number
          carbs: number
          created_at: string | null
          fat: number
          id: string
          protein: number
          updated_at: string | null
          user_id: string
          water_ml: number
        }
        Insert: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          id?: string
          protein?: number
          updated_at?: string | null
          user_id: string
          water_ml?: number
        }
        Update: {
          calories?: number
          carbs?: number
          created_at?: string | null
          fat?: number
          id?: string
          protein?: number
          updated_at?: string | null
          user_id?: string
          water_ml?: number
        }
        Relationships: []
      }
      parties: {
        Row: {
          code: string
          created_at: string | null
          creator_id: string
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_members: number | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          creator_id: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          creator_id?: string
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "parties_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      party_members: {
        Row: {
          id: string
          joined_at: string | null
          party_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          party_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
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
          {
            foreignKeyName: "party_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      training_groups: {
        Row: {
          code: string
          created_at: string | null
          creator_id: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string | null
          creator_id: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string | null
          creator_id?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_groups_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "app_users"
            referencedColumns: ["id"]
          },
        ]
      }
      user_achievements: {
        Row: {
          achievement_type: string
          earned_at: string | null
          id: string
          user_id: string
        }
        Insert: {
          achievement_type: string
          earned_at?: string | null
          id?: string
          user_id: string
        }
        Update: {
          achievement_type?: string
          earned_at?: string | null
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
      user_fitness_achievements: {
        Row: {
          achievement_id: string
          created_at: string | null
          id: string
          max_progress: number
          progress: number | null
          unlocked: boolean | null
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          created_at?: string | null
          id?: string
          max_progress: number
          progress?: number | null
          unlocked?: boolean | null
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          created_at?: string | null
          id?: string
          max_progress?: number
          progress?: number | null
          unlocked?: boolean | null
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_fitness_levels: {
        Row: {
          coins: number | null
          created_at: string | null
          id: string
          level: number | null
          title: string | null
          total_xp: number | null
          updated_at: string | null
          user_id: string
          xp: number | null
        }
        Insert: {
          coins?: number | null
          created_at?: string | null
          id?: string
          level?: number | null
          title?: string | null
          total_xp?: number | null
          updated_at?: string | null
          user_id: string
          xp?: number | null
        }
        Update: {
          coins?: number | null
          created_at?: string | null
          id?: string
          level?: number | null
          title?: string | null
          total_xp?: number | null
          updated_at?: string | null
          user_id?: string
          xp?: number | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      water_intake: {
        Row: {
          amount_ml: number
          created_at: string | null
          entry_date: string
          id: string
          user_id: string
        }
        Insert: {
          amount_ml: number
          created_at?: string | null
          entry_date?: string
          id?: string
          user_id: string
        }
        Update: {
          amount_ml?: number
          created_at?: string | null
          entry_date?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      workout_exercises: {
        Row: {
          category: string
          created_at: string | null
          difficulty: string | null
          equipment: string | null
          id: string
          instructions: string | null
          muscle_groups: string[] | null
          name: string
          order_index: number | null
          reps: string
          rest_time: number | null
          sets: number
          tempo: string | null
          video_url: string | null
          weight: string | null
          workout_plan_id: string
        }
        Insert: {
          category: string
          created_at?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          muscle_groups?: string[] | null
          name: string
          order_index?: number | null
          reps?: string
          rest_time?: number | null
          sets?: number
          tempo?: string | null
          video_url?: string | null
          weight?: string | null
          workout_plan_id: string
        }
        Update: {
          category?: string
          created_at?: string | null
          difficulty?: string | null
          equipment?: string | null
          id?: string
          instructions?: string | null
          muscle_groups?: string[] | null
          name?: string
          order_index?: number | null
          reps?: string
          rest_time?: number | null
          sets?: number
          tempo?: string | null
          video_url?: string | null
          weight?: string | null
          workout_plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workout_exercises_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_history: {
        Row: {
          calories_burned: number | null
          completed_at: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          notes: string | null
          started_at: string
          user_id: string
          volume_total: number | null
          workout_plan_id: string | null
        }
        Insert: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          started_at?: string
          user_id: string
          volume_total?: number | null
          workout_plan_id?: string | null
        }
        Update: {
          calories_burned?: number | null
          completed_at?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          notes?: string | null
          started_at?: string
          user_id?: string
          volume_total?: number | null
          workout_plan_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_history_workout_plan_id_fkey"
            columns: ["workout_plan_id"]
            isOneToOne: false
            referencedRelation: "workout_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      workout_plans: {
        Row: {
          completed_count: number | null
          created_at: string | null
          description: string | null
          difficulty: string
          duration: number
          id: string
          is_active: boolean | null
          name: string
          rating: number | null
          tags: string[] | null
          type: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_count?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration?: number
          id?: string
          is_active?: boolean | null
          name: string
          rating?: number | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_count?: number | null
          created_at?: string | null
          description?: string | null
          difficulty?: string
          duration?: number
          id?: string
          is_active?: boolean | null
          name?: string
          rating?: number | null
          tags?: string[] | null
          type?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_admin_by_email: { Args: { _email: string }; Returns: undefined }
      generate_group_code: { Args: never; Returns: string }
      generate_party_code: { Args: never; Returns: string }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      get_users_with_seven_or_more_checkins:
        | {
            Args: never
            Returns: {
              check_in_count: number
              email: string
              name: string
              user_id: string
            }[]
          }
        | {
            Args: { start_date?: string }
            Returns: {
              check_in_count: number
              email: string
              name: string
              user_id: string
            }[]
          }
      has_checked_in_today: { Args: { user_uuid: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { user_uuid: string }; Returns: boolean }
      is_group_admin: {
        Args: { p_group_id: string; p_user_id: string }
        Returns: boolean
      }
      is_party_member: {
        Args: { party_uuid: string; user_uuid: string }
        Returns: boolean
      }
      process_party_check_in:
        | { Args: { party_uuid: string; user_uuid: string }; Returns: boolean }
        | {
            Args: {
              p_member_ids?: string[]
              party_uuid: string
              user_uuid: string
            }
            Returns: boolean
          }
    }
    Enums: {
      app_role: "admin" | "personal" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "personal", "user"],
    },
  },
} as const
