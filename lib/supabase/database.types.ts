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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      banquet_tables: {
        Row: {
          capacity: number | null
          created_at: string | null
          event_id: string
          id: string
          name: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          event_id: string
          id?: string
          name: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          event_id?: string
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "banquet_tables_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string | null
          custom_domain: string | null
          custom_domain_verification_token: string | null
          custom_domain_verified_at: string | null
          default_locale: string | null
          event_date: string
          event_time: string | null
          event_type: string
          id: string
          owner_id: string
          plan_id: string
          slug: string
          status: string | null
          subtitle_names: string[] | null
          supported_locales: string[] | null
          title: string
          updated_at: string | null
          venue_address: string | null
          venue_city: string | null
          venue_lat: number | null
          venue_lng: number | null
          venue_name: string | null
        }
        Insert: {
          created_at?: string | null
          custom_domain?: string | null
          custom_domain_verification_token?: string | null
          custom_domain_verified_at?: string | null
          default_locale?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string
          id?: string
          owner_id: string
          plan_id?: string
          slug: string
          status?: string | null
          subtitle_names?: string[] | null
          supported_locales?: string[] | null
          title: string
          updated_at?: string | null
          venue_address?: string | null
          venue_city?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
        }
        Update: {
          created_at?: string | null
          custom_domain?: string | null
          custom_domain_verification_token?: string | null
          custom_domain_verified_at?: string | null
          default_locale?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string
          id?: string
          owner_id?: string
          plan_id?: string
          slug?: string
          status?: string | null
          subtitle_names?: string[] | null
          supported_locales?: string[] | null
          title?: string
          updated_at?: string | null
          venue_address?: string | null
          venue_city?: string | null
          venue_lat?: number | null
          venue_lng?: number | null
          venue_name?: string | null
        }
        Relationships: []
      }
      gift_preferences: {
        Row: {
          description: string | null
          event_id: string
          id: string
          image_url: string | null
          order_index: number | null
          title: string
          type: string
          url: string | null
        }
        Insert: {
          description?: string | null
          event_id: string
          id?: string
          image_url?: string | null
          order_index?: number | null
          title: string
          type: string
          url?: string | null
        }
        Update: {
          description?: string | null
          event_id?: string
          id?: string
          image_url?: string | null
          order_index?: number | null
          title?: string
          type?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gift_preferences_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      guests: {
        Row: {
          created_at: string | null
          email: string | null
          event_id: string
          full_name: string
          group_label: string | null
          id: string
          invitation_sent_at: string | null
          invite_code: string
          max_plus_ones: number | null
          phone: string | null
          table_id: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          event_id: string
          full_name: string
          group_label?: string | null
          id?: string
          invitation_sent_at?: string | null
          invite_code?: string
          max_plus_ones?: number | null
          phone?: string | null
          table_id?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          event_id?: string
          full_name?: string
          group_label?: string | null
          id?: string
          invitation_sent_at?: string | null
          invite_code?: string
          max_plus_ones?: number | null
          phone?: string | null
          table_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guests_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "guests_table_id_fkey"
            columns: ["table_id"]
            isOneToOne: false
            referencedRelation: "banquet_tables"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_attendees: {
        Row: {
          created_at: string | null
          full_name: string
          guest_id: string
          id: string
        }
        Insert: {
          created_at?: string | null
          full_name: string
          guest_id: string
          id?: string
        }
        Update: {
          created_at?: string | null
          full_name?: string
          guest_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_attendees_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      rsvp_responses: {
        Row: {
          allergies: string | null
          attending: boolean
          comment: string | null
          event_id: string
          guest_id: string | null
          guest_name: string
          guestbook_hidden: boolean
          id: string
          meal_preferences: Json | null
          party_size: number
          submitted_at: string | null
        }
        Insert: {
          allergies?: string | null
          attending: boolean
          comment?: string | null
          event_id: string
          guest_id?: string | null
          guest_name: string
          guestbook_hidden?: boolean
          id?: string
          meal_preferences?: Json | null
          party_size?: number
          submitted_at?: string | null
        }
        Update: {
          allergies?: string | null
          attending?: boolean
          comment?: string | null
          event_id?: string
          guest_id?: string | null
          guest_name?: string
          guestbook_hidden?: boolean
          id?: string
          meal_preferences?: Json | null
          party_size?: number
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rsvp_responses_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rsvp_responses_guest_id_fkey"
            columns: ["guest_id"]
            isOneToOne: false
            referencedRelation: "guests"
            referencedColumns: ["id"]
          },
        ]
      }
      site_config: {
        Row: {
          canvas: Json | null
          content: Json
          event_id: string
          id: string
          layout_mode: string
          sections: Json
          theme_id: string
          updated_at: string | null
        }
        Insert: {
          canvas?: Json | null
          content?: Json
          event_id: string
          id?: string
          layout_mode?: string
          sections?: Json
          theme_id?: string
          updated_at?: string | null
        }
        Update: {
          canvas?: Json | null
          content?: Json
          event_id?: string
          id?: string
          layout_mode?: string
          sections?: Json
          theme_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "site_config_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      lookup_guest_by_invite_code: {
        Args: {
          p_event_id: string
          p_invite_code: string
        }
        Returns: {
          id: string
          full_name: string
          max_plus_ones: number | null
          table_name: string | null
        }[]
      }
      lookup_guest_table_by_name: {
        Args: {
          p_event_id: string
          p_full_name: string
        }
        Returns: {
          found: boolean
          table_name: string | null
          attending: boolean | null
        }[]
      }
      get_guestbook_messages: {
        Args: {
          p_event_id: string
        }
        Returns: {
          guest_name: string
          comment: string
          submitted_at: string
        }[]
      }
      find_or_create_self_service_guest: {
        Args: {
          p_event_id: string
          p_full_name: string
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
  public: {
    Enums: {},
  },
} as const
