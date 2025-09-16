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
      ca_pharmacy_data: {
        Row: {
          address_city: string
          address_country: string | null
          address_po_box: string | null
          address_postal_code: string | null
          address_province: string | null
          address_street_name: string | null
          address_street_number: string | null
          address_unit: string | null
          created_at: string
          domain: string | null
          enterprise: string | null
          google_place_id: string | null
          id: string
          lat: number | null
          lng: number | null
          medme_id: string
          name: string
          province: string
          store_no: string | null
          street_address: string | null
          tenant_id: string | null
          time_zone: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address_city: string
          address_country?: string | null
          address_po_box?: string | null
          address_postal_code?: string | null
          address_province?: string | null
          address_street_name?: string | null
          address_street_number?: string | null
          address_unit?: string | null
          created_at?: string
          domain?: string | null
          enterprise?: string | null
          google_place_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          medme_id: string
          name: string
          province: string
          store_no?: string | null
          street_address?: string | null
          tenant_id?: string | null
          time_zone?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_city?: string
          address_country?: string | null
          address_po_box?: string | null
          address_postal_code?: string | null
          address_province?: string | null
          address_street_name?: string | null
          address_street_number?: string | null
          address_unit?: string | null
          created_at?: string
          domain?: string | null
          enterprise?: string | null
          google_place_id?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          medme_id?: string
          name?: string
          province?: string
          store_no?: string | null
          street_address?: string | null
          tenant_id?: string | null
          time_zone?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
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
      us_pharmacy_data: {
        Row: {
          address: string | null
          booking: string | null
          booking_link: string | null
          category: string | null
          chronic_disease_condition_managem: string | null
          clinical_services: string | null
          clinical_services_2: string | null
          clinical_services_immunizations: string | null
          clinical_services_lowercase: string | null
          clinical_services_summary: string | null
          column_24: string | null
          competitor: string | null
          consent_form_type_purpose: string | null
          created_at: string
          domain: string | null
          domain_1: string | null
          email: string | null
          health_screenings_point_of_care: string | null
          healthcare_services: string | null
          id: string
          imms_cleaned_up: string | null
          immunizations: string | null
          immunizations_vaccinations: string | null
          intake_forms_services: string | null
          is_a_pharmacy: string | null
          lat: number | null
          letter_count: number | null
          lng: number | null
          main_image_url: string | null
          name: string | null
          opening_hours: string | null
          owner_manager_info: string | null
          owner_name: string | null
          owners: string | null
          patient_forms: string | null
          patient_forms_2: string | null
          pharmacy_location_profile: string | null
          pharmacy_research: string | null
          phone: string | null
          pioneer_rx_info: string | null
          popular_times: string | null
          preferred_email: string | null
          primary_data_source: string | null
          purpose: string | null
          ratings: number | null
          response: string | null
          scheduler_used: string | null
          score: number | null
          solution_used: string | null
          specialized_health_programs: string | null
          state_name: string | null
          tier_justification: string | null
          tier_list: string | null
          updated_at: string
          url: string | null
          website: string | null
          zip_code: number | null
        }
        Insert: {
          address?: string | null
          booking?: string | null
          booking_link?: string | null
          category?: string | null
          chronic_disease_condition_managem?: string | null
          clinical_services?: string | null
          clinical_services_2?: string | null
          clinical_services_immunizations?: string | null
          clinical_services_lowercase?: string | null
          clinical_services_summary?: string | null
          column_24?: string | null
          competitor?: string | null
          consent_form_type_purpose?: string | null
          created_at?: string
          domain?: string | null
          domain_1?: string | null
          email?: string | null
          health_screenings_point_of_care?: string | null
          healthcare_services?: string | null
          id?: string
          imms_cleaned_up?: string | null
          immunizations?: string | null
          immunizations_vaccinations?: string | null
          intake_forms_services?: string | null
          is_a_pharmacy?: string | null
          lat?: number | null
          letter_count?: number | null
          lng?: number | null
          main_image_url?: string | null
          name?: string | null
          opening_hours?: string | null
          owner_manager_info?: string | null
          owner_name?: string | null
          owners?: string | null
          patient_forms?: string | null
          patient_forms_2?: string | null
          pharmacy_location_profile?: string | null
          pharmacy_research?: string | null
          phone?: string | null
          pioneer_rx_info?: string | null
          popular_times?: string | null
          preferred_email?: string | null
          primary_data_source?: string | null
          purpose?: string | null
          ratings?: number | null
          response?: string | null
          scheduler_used?: string | null
          score?: number | null
          solution_used?: string | null
          specialized_health_programs?: string | null
          state_name?: string | null
          tier_justification?: string | null
          tier_list?: string | null
          updated_at?: string
          url?: string | null
          website?: string | null
          zip_code?: number | null
        }
        Update: {
          address?: string | null
          booking?: string | null
          booking_link?: string | null
          category?: string | null
          chronic_disease_condition_managem?: string | null
          clinical_services?: string | null
          clinical_services_2?: string | null
          clinical_services_immunizations?: string | null
          clinical_services_lowercase?: string | null
          clinical_services_summary?: string | null
          column_24?: string | null
          competitor?: string | null
          consent_form_type_purpose?: string | null
          created_at?: string
          domain?: string | null
          domain_1?: string | null
          email?: string | null
          health_screenings_point_of_care?: string | null
          healthcare_services?: string | null
          id?: string
          imms_cleaned_up?: string | null
          immunizations?: string | null
          immunizations_vaccinations?: string | null
          intake_forms_services?: string | null
          is_a_pharmacy?: string | null
          lat?: number | null
          letter_count?: number | null
          lng?: number | null
          main_image_url?: string | null
          name?: string | null
          opening_hours?: string | null
          owner_manager_info?: string | null
          owner_name?: string | null
          owners?: string | null
          patient_forms?: string | null
          patient_forms_2?: string | null
          pharmacy_location_profile?: string | null
          pharmacy_research?: string | null
          phone?: string | null
          pioneer_rx_info?: string | null
          popular_times?: string | null
          preferred_email?: string | null
          primary_data_source?: string | null
          purpose?: string | null
          ratings?: number | null
          response?: string | null
          scheduler_used?: string | null
          score?: number | null
          solution_used?: string | null
          specialized_health_programs?: string | null
          state_name?: string | null
          tier_justification?: string | null
          tier_list?: string | null
          updated_at?: string
          url?: string | null
          website?: string | null
          zip_code?: number | null
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
      can_view_sensitive_pharmacy_data: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      get_pharmacy_data_secure: {
        Args: { include_sensitive?: boolean }
        Returns: {
          address: string
          booking_link: string
          category: string
          clinical_services: string
          clinical_services_2: string
          clinical_services_lowercase: string
          clinical_services_summary: string
          created_at: string
          email: string
          health_screenings_point_of_care: string
          healthcare_services: string
          id: string
          immunizations: string
          immunizations_vaccinations: string
          is_a_pharmacy: string
          lat: number
          lng: number
          main_image_url: string
          name: string
          opening_hours: string
          owner_manager_info: string
          owner_name: string
          owners: string
          phone: string
          preferred_email: string
          ratings: number
          score: number
          specialized_health_programs: string
          state_name: string
          updated_at: string
          website: string
          zip_code: number
        }[]
      }
      get_public_pharmacy_data: {
        Args: Record<PropertyKey, never>
        Returns: {
          address: string
          booking_link: string
          category: string
          clinical_services: string
          clinical_services_2: string
          clinical_services_lowercase: string
          clinical_services_summary: string
          created_at: string
          health_screenings_point_of_care: string
          healthcare_services: string
          id: string
          immunizations: string
          immunizations_vaccinations: string
          is_a_pharmacy: string
          lat: number
          lng: number
          main_image_url: string
          name: string
          opening_hours: string
          phone: string
          ratings: number
          score: number
          specialized_health_programs: string
          state_name: string
          updated_at: string
          website: string
          zip_code: number
        }[]
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
