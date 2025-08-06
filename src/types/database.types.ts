
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
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
  public: {
    Tables: {
      auth_sessions: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          session_token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          session_token: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          session_token?: string
          user_id?: string
        }
        Relationships: []
      }
      business_settings: {
        Row: {
          abn: string | null
          business_name: string | null
          created_at: string | null
          logo_url: string | null
          operating_hours: Json | null
          primary_color: string | null
          service_areas: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          abn?: string | null
          business_name?: string | null
          created_at?: string | null
          logo_url?: string | null
          operating_hours?: Json | null
          primary_color?: string | null
          service_areas?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          abn?: string | null
          business_name?: string | null
          created_at?: string | null
          logo_url?: string | null
          operating_hours?: Json | null
          primary_color?: string | null
          service_areas?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      job_links: {
        Row: {
          accessed_count: number | null
          created_at: string
          created_for_phone: string | null
          expires_at: string
          id: string
          job_id: string
          last_accessed_at: string | null
          token: string
        }
        Insert: {
          accessed_count?: number | null
          created_at?: string
          created_for_phone?: string | null
          expires_at: string
          id?: string
          job_id: string
          last_accessed_at?: string | null
          token: string
        }
        Update: {
          accessed_count?: number | null
          created_at?: string
          created_for_phone?: string | null
          expires_at?: string
          id?: string
          job_id?: string
          last_accessed_at?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "customer_jobs_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_links_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      job_photos: {
        Row: {
          created_at: string
          file_name: string | null
          file_size: number | null
          id: string
          job_id: string
          mime_type: string | null
          photo_url: string
          retry_count: number | null
          storage_path: string | null
          upload_status: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          job_id: string
          mime_type?: string | null
          photo_url: string
          retry_count?: number | null
          storage_path?: string | null
          upload_status?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string | null
          file_size?: number | null
          id?: string
          job_id?: string
          mime_type?: string | null
          photo_url?: string
          retry_count?: number | null
          storage_path?: string | null
          upload_status?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "customer_jobs_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_photos_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      jobs: {
        Row: {
          cancellation_reason: string | null
          client_id: string | null
          created_at: string
          customer_name: string
          description: string | null
          estimated_value: number | null
          id: string
          job_type: string
          last_contact: string | null
          last_update_request_at: string | null
          location: string
          phone: string
          preferred_time: string | null
          quote_accepted_at: string | null
          quote_accepted_by: string | null
          sms_blocked: boolean | null
          status: string
          updated_at: string
          urgency: string
        }
        Insert: {
          cancellation_reason?: string | null
          client_id?: string | null
          created_at?: string
          customer_name: string
          description?: string | null
          estimated_value?: number | null
          id?: string
          job_type: string
          last_contact?: string | null
          last_update_request_at?: string | null
          location: string
          phone: string
          preferred_time?: string | null
          quote_accepted_at?: string | null
          quote_accepted_by?: string | null
          sms_blocked?: boolean | null
          status?: string
          updated_at?: string
          urgency: string
        }
        Update: {
          cancellation_reason?: string | null
          client_id?: string | null
          created_at?: string
          customer_name?: string
          description?: string | null
          estimated_value?: number | null
          id?: string
          job_type?: string
          last_contact?: string | null
          last_update_request_at?: string | null
          location?: string
          phone?: string
          preferred_time?: string | null
          quote_accepted_at?: string | null
          quote_accepted_by?: string | null
          sms_blocked?: boolean | null
          status?: string
          updated_at?: string
          urgency?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          abn: string | null
          address: string | null
          after_hours_enabled: boolean | null
          business_name: string | null
          callback_window_minutes: number | null
          created_at: string
          id: string
          insurance_expiry: string | null
          insurance_provider: string | null
          is_admin: boolean | null
          languages_spoken: Json | null
          license_expiry: string | null
          license_number: string | null
          name: string | null
          onboarding_completed: boolean | null
          onboarding_step: number | null
          phone: string | null
          role: string | null
          service_postcodes: string[] | null
          service_radius_km: number | null
          specializations: Json | null
          timezone: string | null
          trade_primary: string | null
          trade_secondary: string[] | null
          updated_at: string
          user_id: string
          user_type: string
          years_experience: number | null
        }
        Insert: {
          abn?: string | null
          address?: string | null
          after_hours_enabled?: boolean | null
          business_name?: string | null
          callback_window_minutes?: number | null
          created_at?: string
          id?: string
          insurance_expiry?: string | null
          insurance_provider?: string | null
          is_admin?: boolean | null
          languages_spoken?: Json | null
          license_expiry?: string | null
          license_number?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          role?: string | null
          service_postcodes?: string[] | null
          service_radius_km?: number | null
          specializations?: Json | null
          timezone?: string | null
          trade_primary?: string | null
          trade_secondary?: string[] | null
          updated_at?: string
          user_id: string
          user_type?: string
          years_experience?: number | null
        }
        Update: {
          abn?: string | null
          address?: string | null
          after_hours_enabled?: boolean | null
          business_name?: string | null
          callback_window_minutes?: number | null
          created_at?: string
          id?: string
          insurance_expiry?: string | null
          insurance_provider?: string | null
          is_admin?: boolean | null
          languages_spoken?: Json | null
          license_expiry?: string | null
          license_number?: string | null
          name?: string | null
          onboarding_completed?: boolean | null
          onboarding_step?: number | null
          phone?: string | null
          role?: string | null
          service_postcodes?: string[] | null
          service_radius_km?: number | null
          specializations?: Json | null
          timezone?: string | null
          trade_primary?: string | null
          trade_secondary?: string[] | null
          updated_at?: string
          user_id?: string
          user_type?: string
          years_experience?: number | null
        }
        Relationships: []
      }
      service_locations: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          postcode: string
          state: string | null
          suburb: string | null
          surcharge: number | null
          travel_time: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          postcode: string
          state?: string | null
          suburb?: string | null
          surcharge?: number | null
          travel_time?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          postcode?: string
          state?: string | null
          suburb?: string | null
          surcharge?: number | null
          travel_time?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tenant_sms_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_active: boolean | null
          template_type: string
          updated_at: string | null
          user_id: string | null
          variables: string[] | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          template_type: string
          updated_at?: string | null
          user_id?: string | null
          variables?: string[] | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          template_type?: string
          updated_at?: string | null
          user_id?: string | null
          variables?: string[] | null
        }
        Relationships: []
      }
      trade_types: {
        Row: {
          category: string | null
          code: string
          created_at: string | null
          icon_name: string | null
          label: string
          typical_urgency: string | null
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          code: string
          created_at?: string | null
          icon_name?: string | null
          label: string
          typical_urgency?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          code?: string
          created_at?: string | null
          icon_name?: string | null
          label?: string
          typical_urgency?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      twilio_settings: {
        Row: {
          capabilities: Json | null
          created_at: string | null
          id: string
          phone_number: string
          status: string | null
          updated_at: string | null
          user_id: string | null
          vault_secret_name: string | null
          verified_at: string | null
          webhook_url: string | null
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string | null
          id?: string
          phone_number: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vault_secret_name?: string | null
          verified_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          capabilities?: Json | null
          created_at?: string | null
          id?: string
          phone_number?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vault_secret_name?: string | null
          verified_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      customer_jobs_view: {
        Row: {
          cancellation_reason: string | null
          created_at: string | null
          customer_address: string | null
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          id: string | null
          job_type: string | null
          last_contact: string | null
          last_update_request_at: string | null
          preferred_time: string | null
          quote_accepted_at: string | null
          quote_accepted_by: string | null
          sms_blocked: boolean | null
          status: string | null
          tradie_address: string | null
          tradie_business_name: string | null
          tradie_id: string | null
          tradie_name: string | null
          tradie_phone: string | null
          updated_at: string | null
          urgency: string | null
          value: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      clear_current_user_test_data: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      clear_test_user_data: {
        Args: { test_email: string }
        Returns: undefined
      }
      create_client_job_request: {
        Args: {
          tradie_user_id: string
          job_type: string
          urgency: string
          description: string
          location: string
          preferred_time?: string
          hours_ago?: number
        }
        Returns: string
      }
      create_default_sms_templates: {
        Args: { target_user_id: string }
        Returns: undefined
      }
      create_job_link: {
        Args: { p_job_id: string; p_phone?: string; p_expires_hours?: number }
        Returns: string
      }
      create_test_client_jobs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      create_test_job: {
        Args: {
          tradie_email: string
          customer_name: string
          phone: string
          location: string
          job_type: string
          urgency: string
          status: string
          description: string
          estimated_value: number
          hours_ago?: number
          last_contact_hours_ago?: number
        }
        Returns: string
      }
      create_test_job_for_current_user: {
        Args: {
          customer_name: string
          phone: string
          location: string
          job_type: string
          urgency: string
          status: string
          description: string
          estimated_value: number
          hours_ago?: number
          last_contact_hours_ago?: number
        }
        Returns: string
      }
      create_time_based_test_jobs: {
        Args: { tradie_email: string }
        Returns: undefined
      }
      create_time_based_test_jobs_for_current_user: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_client_jobs: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          job_type: string
          urgency: string
          status: string
          description: string
          location: string
          created_at: string
          updated_at: string
          last_contact: string
          tradie_name: string
          tradie_phone: string
          tradie_business: string
        }[]
      }
      get_current_user_job_age_stats: {
        Args: Record<PropertyKey, never>
        Returns: {
          time_period: string
          job_count: number
          status_breakdown: Json
        }[]
      }
      get_customer_jobs_by_phone: {
        Args: { customer_phone_param: string }
        Returns: {
          id: string
          client_id: string
          customer_name: string
          customer_phone: string
          job_type: string
          location: string
          urgency: string
          status: string
          estimated_value: number
          description: string
          preferred_time: string
          last_contact: string
          sms_blocked: boolean
          created_at: string
          updated_at: string
          tradie_name: string
          tradie_phone: string
          tradie_id: string
          tradie_type: string
        }[]
      }
      get_job_age_stats: {
        Args: { tradie_email: string }
        Returns: {
          time_period: string
          job_count: number
          status_breakdown: Json
        }[]
      }
      get_twilio_settings: {
        Args: { target_user_id: string }
        Returns: {
          phone_number: string
          webhook_url: string
          forward_to_phone: string
          forward_to_email: string
          is_active: boolean
          vault_secret_name: string
        }[]
      }
      store_twilio_credentials: {
        Args: {
          target_user_id: string
          account_sid: string
          auth_token: string
          phone_number: string
        }
        Returns: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
