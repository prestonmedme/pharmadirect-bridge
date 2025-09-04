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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      medme_pharmacies: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          pharmacy_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          pharmacy_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          pharmacy_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medme_pharmacies_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      pharmacies: {
        Row: {
          address: string
          city: string
          created_at: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          services: string[] | null
          state: string
          updated_at: string
          zip_code: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          services?: string[] | null
          state: string
          updated_at?: string
          zip_code: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          services?: string[] | null
          state?: string
          updated_at?: string
          zip_code?: string
        }
        Relationships: []
      }
      pharmacy_impressions: {
        Row: {
          created_at: string
          id: string
          impression_type: string
          is_medme_pharmacy: boolean | null
          pharmacy_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          impression_type: string
          is_medme_pharmacy?: boolean | null
          pharmacy_id: string
        }
        Update: {
          created_at?: string
          id?: string
          impression_type?: string
          is_medme_pharmacy?: boolean | null
          pharmacy_id?: string
        }
        Relationships: []
      }
      us_pharmacies_raw: {
        Row: {
          address: string | null
          clean_pharmacy_name: string | null
          cleaned_up_services: string | null
          clinical_services_raw_scrape: string | null
          created_at: string
          domain_1: string | null
          first_name: string | null
          id: string
          imms_cleaned_up: string | null
          opening_hours: string | null
          owner_name: string | null
          patient_forms: string | null
          phone: string | null
          preferred_email: string | null
          purpose: string | null
          ratings: string | null
          score: string | null
          solution_used: string | null
          state_name: string | null
          tier_justification: string | null
          tier_list: string | null
          updated_at: string
          url: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          clean_pharmacy_name?: string | null
          cleaned_up_services?: string | null
          clinical_services_raw_scrape?: string | null
          created_at?: string
          domain_1?: string | null
          first_name?: string | null
          id?: string
          imms_cleaned_up?: string | null
          opening_hours?: string | null
          owner_name?: string | null
          patient_forms?: string | null
          phone?: string | null
          preferred_email?: string | null
          purpose?: string | null
          ratings?: string | null
          score?: string | null
          solution_used?: string | null
          state_name?: string | null
          tier_justification?: string | null
          tier_list?: string | null
          updated_at?: string
          url?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          clean_pharmacy_name?: string | null
          cleaned_up_services?: string | null
          clinical_services_raw_scrape?: string | null
          created_at?: string
          domain_1?: string | null
          first_name?: string | null
          id?: string
          imms_cleaned_up?: string | null
          opening_hours?: string | null
          owner_name?: string | null
          patient_forms?: string | null
          phone?: string | null
          preferred_email?: string | null
          purpose?: string | null
          ratings?: string | null
          score?: string | null
          solution_used?: string | null
          state_name?: string | null
          tier_justification?: string | null
          tier_list?: string | null
          updated_at?: string
          url?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      user_analytics_events: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          is_medme_pharmacy: boolean | null
          pharmacy_id: string | null
          service_type: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          is_medme_pharmacy?: boolean | null
          pharmacy_id?: string | null
          service_type?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          is_medme_pharmacy?: boolean | null
          pharmacy_id?: string | null
          service_type?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          employee_id: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
