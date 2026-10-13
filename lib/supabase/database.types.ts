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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      recipe_submissions: {
        Row: {
          ai_review: Json | null
          allergens: string[]
          category: Database["public"]["Enums"]["recipe_category"]
          consent_privacy: boolean
          consent_publish: boolean
          created_at: string
          credit_name: string | null
          description: string
          effort: Database["public"]["Enums"]["recipe_effort"]
          guardian_email: string | null
          id: string
          image_path: string
          ingredients: Json
          ip_hash: string
          is_adult: boolean
          review_note: string | null
          reviewed_at: string | null
          serves: number
          status: Database["public"]["Enums"]["submission_status"]
          steps: Json
          submitter_email: string
          submitter_name: string
          submitter_phone: string | null
          title: string
          total_minutes: number
        }
        Insert: {
          ai_review?: Json | null
          allergens?: string[]
          category: Database["public"]["Enums"]["recipe_category"]
          consent_privacy: boolean
          consent_publish: boolean
          created_at?: string
          credit_name?: string | null
          description: string
          effort: Database["public"]["Enums"]["recipe_effort"]
          guardian_email?: string | null
          id?: string
          image_path: string
          ingredients: Json
          ip_hash: string
          is_adult?: boolean
          review_note?: string | null
          reviewed_at?: string | null
          serves: number
          status?: Database["public"]["Enums"]["submission_status"]
          steps: Json
          submitter_email: string
          submitter_name: string
          submitter_phone?: string | null
          title: string
          total_minutes: number
        }
        Update: {
          ai_review?: Json | null
          allergens?: string[]
          category?: Database["public"]["Enums"]["recipe_category"]
          consent_privacy?: boolean
          consent_publish?: boolean
          created_at?: string
          credit_name?: string | null
          description?: string
          effort?: Database["public"]["Enums"]["recipe_effort"]
          guardian_email?: string | null
          id?: string
          image_path?: string
          ingredients?: Json
          ip_hash?: string
          is_adult?: boolean
          review_note?: string | null
          reviewed_at?: string | null
          serves?: number
          status?: Database["public"]["Enums"]["submission_status"]
          steps?: Json
          submitter_email?: string
          submitter_name?: string
          submitter_phone?: string | null
          title?: string
          total_minutes?: number
        }
        Relationships: []
      }
      recipes: {
        Row: {
          allergens: string[]
          card_colour: Database["public"]["Enums"]["card_colour"]
          category: Database["public"]["Enums"]["recipe_category"]
          created_at: string
          credit_name: string | null
          description: string
          effort: Database["public"]["Enums"]["recipe_effort"]
          id: string
          image_path: string
          image_style: Database["public"]["Enums"]["image_style"]
          ingredients: Json
          published: boolean
          published_at: string | null
          serves: number
          slug: string
          source_submission_id: string | null
          steps: Json
          tag: string
          title: string
          total_minutes: number
          updated_at: string
        }
        Insert: {
          allergens?: string[]
          card_colour?: Database["public"]["Enums"]["card_colour"]
          category: Database["public"]["Enums"]["recipe_category"]
          created_at?: string
          credit_name?: string | null
          description: string
          effort: Database["public"]["Enums"]["recipe_effort"]
          id?: string
          image_path: string
          image_style?: Database["public"]["Enums"]["image_style"]
          ingredients: Json
          published?: boolean
          published_at?: string | null
          serves: number
          slug: string
          source_submission_id?: string | null
          steps: Json
          tag: string
          title: string
          total_minutes: number
          updated_at?: string
        }
        Update: {
          allergens?: string[]
          card_colour?: Database["public"]["Enums"]["card_colour"]
          category?: Database["public"]["Enums"]["recipe_category"]
          created_at?: string
          credit_name?: string | null
          description?: string
          effort?: Database["public"]["Enums"]["recipe_effort"]
          id?: string
          image_path?: string
          image_style?: Database["public"]["Enums"]["image_style"]
          ingredients?: Json
          published?: boolean
          published_at?: string | null
          serves?: number
          slug?: string
          source_submission_id?: string | null
          steps?: Json
          tag?: string
          title?: string
          total_minutes?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_source_submission_id_fkey"
            columns: ["source_submission_id"]
            isOneToOne: false
            referencedRelation: "recipe_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      approve_submission: {
        Args: {
          p_card_colour: Database["public"]["Enums"]["card_colour"]
          p_image_path: string
          p_image_style: Database["public"]["Enums"]["image_style"]
          p_slug: string
          p_submission_id: string
          p_tag: string
        }
        Returns: {
          allergens: string[]
          card_colour: Database["public"]["Enums"]["card_colour"]
          category: Database["public"]["Enums"]["recipe_category"]
          created_at: string
          credit_name: string | null
          description: string
          effort: Database["public"]["Enums"]["recipe_effort"]
          id: string
          image_path: string
          image_style: Database["public"]["Enums"]["image_style"]
          ingredients: Json
          published: boolean
          published_at: string | null
          serves: number
          slug: string
          source_submission_id: string | null
          steps: Json
          tag: string
          title: string
          total_minutes: number
          updated_at: string
        }
        SetofOptions: {
          from: "*"
          to: "recipes"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      is_admin: { Args: never; Returns: boolean }
      purge_rejected_submissions: { Args: never; Returns: string[] }
      valid_allergens: { Args: { items: string[] }; Returns: boolean }
    }
    Enums: {
      card_colour: "peach" | "yellow" | "herb"
      image_style: "illustration" | "photo"
      recipe_category:
        | "rice"
        | "soups_stews"
        | "small_chops"
        | "swallow"
        | "drinks"
        | "desserts"
      recipe_effort: "easy" | "medium" | "involved"
      submission_status: "pending" | "approved" | "rejected"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      card_colour: ["peach", "yellow", "herb"],
      image_style: ["illustration", "photo"],
      recipe_category: [
        "rice",
        "soups_stews",
        "small_chops",
        "swallow",
        "drinks",
        "desserts",
      ],
      recipe_effort: ["easy", "medium", "involved"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
