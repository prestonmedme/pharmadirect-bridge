export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
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
          id: string
          language_preference: string
          notifications_enabled: boolean
          phone_number: string | null
          preferred_pharmacy_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          language_preference?: string
          notifications_enabled?: boolean
          phone_number?: string | null
          preferred_pharmacy_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
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
    }
    Views: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
