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
      analysis_reports: {
        Row: {
          chart_configs: Json | null
          created_at: string | null
          data: Json
          description: string | null
          filters: Json | null
          id: string
          name: string
          report_type: string
          updated_at: string | null
        }
        Insert: {
          chart_configs?: Json | null
          created_at?: string | null
          data: Json
          description?: string | null
          filters?: Json | null
          id?: string
          name: string
          report_type: string
          updated_at?: string | null
        }
        Update: {
          chart_configs?: Json | null
          created_at?: string | null
          data?: Json
          description?: string | null
          filters?: Json | null
          id?: string
          name?: string
          report_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_errors: {
        Row: {
          business_id: string | null
          created_at: string | null
          error: string
          id: string
          occurred_at: string | null
          resolution_notes: string | null
          resolved: boolean | null
          updated_at: string | null
          url: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string | null
          error: string
          id?: string
          occurred_at?: string | null
          resolution_notes?: string | null
          resolved?: boolean | null
          updated_at?: string | null
          url: string
        }
        Update: {
          business_id?: string | null
          created_at?: string | null
          error?: string
          id?: string
          occurred_at?: string | null
          resolution_notes?: string | null
          resolved?: boolean | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "audit_errors_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      business_comparisons: {
        Row: {
          analysis_date: string | null
          business_id: string | null
          comparison_data: Json
          created_at: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          analysis_date?: string | null
          business_id?: string | null
          comparison_data: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          analysis_date?: string | null
          business_id?: string | null
          comparison_data?: Json
          created_at?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "business_comparisons_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      businesses: {
        Row: {
          address: string | null
          audit_date: string | null
          category: string | null
          city: string | null
          created_at: string | null
          description: string | null
          desktop_screenshot: string | null
          external_id: string | null
          id: string
          image: string | null
          is_upgraded: boolean | null
          mobile_screenshot: string | null
          name: string
          phone: string | null
          scores: Json | null
          slug: string | null
          source_id: string | null
          suggested_improvements: string[] | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          audit_date?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          desktop_screenshot?: string | null
          external_id?: string | null
          id?: string
          image?: string | null
          is_upgraded?: boolean | null
          mobile_screenshot?: string | null
          name: string
          phone?: string | null
          scores?: Json | null
          slug?: string | null
          source_id?: string | null
          suggested_improvements?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          audit_date?: string | null
          category?: string | null
          city?: string | null
          created_at?: string | null
          description?: string | null
          desktop_screenshot?: string | null
          external_id?: string | null
          id?: string
          image?: string | null
          is_upgraded?: boolean | null
          mobile_screenshot?: string | null
          name?: string
          phone?: string | null
          scores?: Json | null
          slug?: string | null
          source_id?: string | null
          suggested_improvements?: string[] | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      category_insights: {
        Row: {
          analysis_date: string | null
          category: string
          city: string | null
          created_at: string | null
          data: Json
          id: string
          updated_at: string | null
        }
        Insert: {
          analysis_date?: string | null
          category: string
          city?: string | null
          created_at?: string | null
          data: Json
          id?: string
          updated_at?: string | null
        }
        Update: {
          analysis_date?: string | null
          category?: string
          city?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      geo_grids: {
        Row: {
          bounds: Json
          city: string
          created_at: string | null
          id: string
          last_scraped: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          bounds: Json
          city: string
          created_at?: string | null
          id?: string
          last_scraped?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          bounds?: Json
          city?: string
          created_at?: string | null
          id?: string
          last_scraped?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      geographic_insights: {
        Row: {
          analysis_date: string | null
          created_at: string | null
          data: Json
          id: string
          region: string
          region_type: string
          updated_at: string | null
        }
        Insert: {
          analysis_date?: string | null
          created_at?: string | null
          data: Json
          id?: string
          region: string
          region_type: string
          updated_at?: string | null
        }
        Update: {
          analysis_date?: string | null
          created_at?: string | null
          data?: Json
          id?: string
          region?: string
          region_type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      raw_business_data: {
        Row: {
          created_at: string | null
          error: string | null
          external_id: string
          id: string
          processed: boolean | null
          raw_data: Json
          source_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          error?: string | null
          external_id: string
          id?: string
          processed?: boolean | null
          raw_data: Json
          source_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          error?: string | null
          external_id?: string
          id?: string
          processed?: boolean | null
          raw_data?: Json
          source_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_business_data_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "scraper_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      scraper_runs: {
        Row: {
          businessesfound: number | null
          created_at: string | null
          error: string | null
          id: string
          location: string
          status: string
          updated_at: string | null
        }
        Insert: {
          businessesfound?: number | null
          created_at?: string | null
          error?: string | null
          id?: string
          location: string
          status: string
          updated_at?: string | null
        }
        Update: {
          businessesfound?: number | null
          created_at?: string | null
          error?: string | null
          id?: string
          location?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      scraper_sources: {
        Row: {
          config: Json | null
          created_at: string | null
          enabled: boolean | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id: string
          name: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          first_name: string | null
          id: string
          last_name: string | null
          preferences: Json | null
          role: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id: string
          last_name?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          preferences?: Json | null
          role?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      website_audits: {
        Row: {
          audit_date: string | null
          business_id: string | null
          created_at: string | null
          error: string | null
          id: string
          lighthouse_data: Json | null
          recommendations: string[] | null
          scores: Json
          screenshots: Json | null
          technology_stack: Json | null
          updated_at: string | null
          url: string
        }
        Insert: {
          audit_date?: string | null
          business_id?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          lighthouse_data?: Json | null
          recommendations?: string[] | null
          scores?: Json
          screenshots?: Json | null
          technology_stack?: Json | null
          updated_at?: string | null
          url: string
        }
        Update: {
          audit_date?: string | null
          business_id?: string | null
          created_at?: string | null
          error?: string | null
          id?: string
          lighthouse_data?: Json | null
          recommendations?: string[] | null
          scores?: Json
          screenshots?: Json | null
          technology_stack?: Json | null
          updated_at?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "website_audits_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_slug: {
        Args: { input_text: string }
        Returns: string
      }
      increment_counter: {
        Args: { row_id: string; count: number }
        Returns: number
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      process_business_import: {
        Args: { businesses: Json }
        Returns: undefined
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
