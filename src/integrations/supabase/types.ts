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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      appointment_audit_log: {
        Row: {
          accessed_fields: string[] | null
          action: string
          appointment_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          accessed_fields?: string[] | null
          action: string
          appointment_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          accessed_fields?: string[] | null
          action?: string
          appointment_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          appointment_time: string
          created_at: string
          id: string
          notes: string | null
          patient_email: string | null
          patient_name: string
          patient_phone: string | null
          pharmacy_id: string
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          appointment_time: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_email?: string | null
          patient_name: string
          patient_phone?: string | null
          pharmacy_id: string
          service_type: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          appointment_time?: string
          created_at?: string
          id?: string
          notes?: string | null
          patient_email?: string | null
          patient_name?: string
          patient_phone?: string | null
          pharmacy_id?: string
          service_type?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_pharmacy_id_fkey"
            columns: ["pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_audit_log: {
        Row: {
          action: string
          brand_config_id: string
          changes: Json | null
          created_at: string
          id: string
          previous_values: Json | null
          user_id: string
        }
        Insert: {
          action: string
          brand_config_id: string
          changes?: Json | null
          created_at?: string
          id?: string
          previous_values?: Json | null
          user_id: string
        }
        Update: {
          action?: string
          brand_config_id?: string
          changes?: Json | null
          created_at?: string
          id?: string
          previous_values?: Json | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_audit_log_brand_config_id_fkey"
            columns: ["brand_config_id"]
            isOneToOne: false
            referencedRelation: "brand_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_configurations: {
        Row: {
          created_at: string
          created_by: string | null
          cta_style: string
          custom_css: string | null
          description: string | null
          domain_mapping: string[] | null
          favicon_url: string | null
          font_family: string
          gradient_enabled: boolean
          gradient_end_color: string | null
          gradient_start_color: string | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          primary_color: string
          secondary_color: string
          subdomain_mapping: string[] | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          cta_style?: string
          custom_css?: string | null
          description?: string | null
          domain_mapping?: string[] | null
          favicon_url?: string | null
          font_family?: string
          gradient_enabled?: boolean
          gradient_end_color?: string | null
          gradient_start_color?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          primary_color?: string
          secondary_color?: string
          subdomain_mapping?: string[] | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          cta_style?: string
          custom_css?: string | null
          description?: string | null
          domain_mapping?: string[] | null
          favicon_url?: string | null
          font_family?: string
          gradient_enabled?: boolean
          gradient_end_color?: string | null
          gradient_start_color?: string | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          primary_color?: string
          secondary_color?: string
          subdomain_mapping?: string[] | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      brand_templates: {
        Row: {
          category: string
          created_at: string
          cta_style: string
          description: string | null
          font_family: string
          gradient_enabled: boolean
          gradient_end_color: string | null
          gradient_start_color: string | null
          id: string
          is_public: boolean
          logo_url: string | null
          name: string
          preview_image_url: string | null
          primary_color: string
          secondary_color: string
          updated_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          cta_style?: string
          description?: string | null
          font_family: string
          gradient_enabled?: boolean
          gradient_end_color?: string | null
          gradient_start_color?: string | null
          id?: string
          is_public?: boolean
          logo_url?: string | null
          name: string
          preview_image_url?: string | null
          primary_color: string
          secondary_color: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          cta_style?: string
          description?: string | null
          font_family?: string
          gradient_enabled?: boolean
          gradient_end_color?: string | null
          gradient_start_color?: string | null
          id?: string
          is_public?: boolean
          logo_url?: string | null
          name?: string
          preview_image_url?: string | null
          primary_color?: string
          secondary_color?: string
          updated_at?: string
        }
        Relationships: []
      }
      medme_pharmacies: {
        Row: {
          domain: string | null
          enterprise: string | null
          google_place_id: string | null
          id: string
          name: string | null
          "Pharmacy Address__city": string | null
          "Pharmacy Address__country": string | null
          "Pharmacy Address__latitude": string | null
          "Pharmacy Address__longitude": string | null
          "Pharmacy Address__po_box": string | null
          "Pharmacy Address__postal_code": string | null
          "Pharmacy Address__province": string | null
          "Pharmacy Address__street_address": string | null
          "Pharmacy Address__street_name": string | null
          "Pharmacy Address__street_number": string | null
          "Pharmacy Address__unit": string | null
          province: string | null
          store_no: string | null
          tenant_id: string | null
          time_zone: string | null
          website: string | null
        }
        Insert: {
          domain?: string | null
          enterprise?: string | null
          google_place_id?: string | null
          id: string
          name?: string | null
          "Pharmacy Address__city"?: string | null
          "Pharmacy Address__country"?: string | null
          "Pharmacy Address__latitude"?: string | null
          "Pharmacy Address__longitude"?: string | null
          "Pharmacy Address__po_box"?: string | null
          "Pharmacy Address__postal_code"?: string | null
          "Pharmacy Address__province"?: string | null
          "Pharmacy Address__street_address"?: string | null
          "Pharmacy Address__street_name"?: string | null
          "Pharmacy Address__street_number"?: string | null
          "Pharmacy Address__unit"?: string | null
          province?: string | null
          store_no?: string | null
          tenant_id?: string | null
          time_zone?: string | null
          website?: string | null
        }
        Update: {
          domain?: string | null
          enterprise?: string | null
          google_place_id?: string | null
          id?: string
          name?: string | null
          "Pharmacy Address__city"?: string | null
          "Pharmacy Address__country"?: string | null
          "Pharmacy Address__latitude"?: string | null
          "Pharmacy Address__longitude"?: string | null
          "Pharmacy Address__po_box"?: string | null
          "Pharmacy Address__postal_code"?: string | null
          "Pharmacy Address__province"?: string | null
          "Pharmacy Address__street_address"?: string | null
          "Pharmacy Address__street_name"?: string | null
          "Pharmacy Address__street_number"?: string | null
          "Pharmacy Address__unit"?: string | null
          province?: string | null
          store_no?: string | null
          tenant_id?: string | null
          time_zone?: string | null
          website?: string | null
        }
        Relationships: []
      }
      pharmacies: {
        Row: {
          address: string
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          phone: string | null
          website: string | null
        }
        Insert: {
          address: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          phone?: string | null
          website?: string | null
        }
        Update: {
          address?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          phone?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          employee_id: string | null
          id: string
          is_admin: boolean | null
          language_preference: string
          notifications_enabled: boolean
          phone_number: string | null
          preferred_pharmacy_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          employee_id?: string | null
          id?: string
          is_admin?: boolean | null
          language_preference?: string
          notifications_enabled?: boolean
          phone_number?: string | null
          preferred_pharmacy_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          employee_id?: string | null
          id?: string
          is_admin?: boolean | null
          language_preference?: string
          notifications_enabled?: boolean
          phone_number?: string | null
          preferred_pharmacy_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_preferred_pharmacy_id_fkey"
            columns: ["preferred_pharmacy_id"]
            isOneToOne: false
            referencedRelation: "pharmacies"
            referencedColumns: ["id"]
          },
        ]
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
          role: Database["public"]["Enums"]["app_role"]
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
      get_appointment_with_audit: {
        Args: { appointment_id: string }
        Returns: {
          appointment_date: string
          appointment_time: string
          created_at: string
          id: string
          notes: string
          patient_name: string
          pharmacy_id: string
          service_type: string
          status: string
          updated_at: string
          user_id: string
        }[]
      }
      get_sensitive_appointment_data: {
        Args: { appointment_id: string; explicit_consent?: boolean }
        Returns: {
          patient_email: string
          patient_phone: string
        }[]
      }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
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
