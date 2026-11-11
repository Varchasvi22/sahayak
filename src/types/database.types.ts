export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      scheme_categories: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          icon_name: string | null;
          display_order: number;
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description?: string | null;
          icon_name?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          icon_name?: string | null;
          display_order?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      schemes: {
        Row: {
          id: string;
          slug: string;
          official_name: string;
          short_title: string;
          description: string;
          benefits: string;
          financial_benefit_amount: number | null;
          government_level: 'CENTRAL' | 'STATE';
          applicable_region: string | null;
          category_id: string;
          department_name: string;
          official_application_url: string;
          official_portal_name: string;
          status: 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'ALWAYS_ACTIVE';
          academic_or_financial_year: string | null;
          is_active: boolean;
          last_verified_at: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          official_name: string;
          short_title: string;
          description: string;
          benefits: string;
          financial_benefit_amount?: number | null;
          government_level: 'CENTRAL' | 'STATE';
          applicable_region?: string | null;
          category_id: string;
          department_name: string;
          official_application_url: string;
          official_portal_name: string;
          status?: 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'ALWAYS_ACTIVE';
          academic_or_financial_year?: string | null;
          is_active?: boolean;
          last_verified_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          official_name?: string;
          short_title?: string;
          description?: string;
          benefits?: string;
          financial_benefit_amount?: number | null;
          government_level?: 'CENTRAL' | 'STATE';
          applicable_region?: string | null;
          category_id?: string;
          department_name?: string;
          official_application_url?: string;
          official_portal_name?: string;
          status?: 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'ALWAYS_ACTIVE';
          academic_or_financial_year?: string | null;
          is_active?: boolean;
          last_verified_at?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'schemes_category_id_fkey';
            columns: ['category_id'];
            isOneToOne: false;
            referencedRelation: 'scheme_categories';
            referencedColumns: ['id'];
          }
        ];
      };
      eligibility_rules: {
        Row: {
          id: string;
          scheme_id: string;
          field: string;
          operator:
            | 'EQUALS'
            | 'NOT_EQUALS'
            | 'LESS_THAN'
            | 'LESS_THAN_OR_EQUAL'
            | 'GREATER_THAN'
            | 'GREATER_THAN_OR_EQUAL'
            | 'BETWEEN'
            | 'IN'
            | 'CONTAINS';
          expected_value: Json;
          rule_group: string;
          logical_relationship: 'AND' | 'OR';
          label: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          scheme_id: string;
          field: string;
          operator:
            | 'EQUALS'
            | 'NOT_EQUALS'
            | 'LESS_THAN'
            | 'LESS_THAN_OR_EQUAL'
            | 'GREATER_THAN'
            | 'GREATER_THAN_OR_EQUAL'
            | 'BETWEEN'
            | 'IN'
            | 'CONTAINS';
          expected_value: Json;
          rule_group?: string;
          logical_relationship?: 'AND' | 'OR';
          label: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          scheme_id?: string;
          field?: string;
          operator?:
            | 'EQUALS'
            | 'NOT_EQUALS'
            | 'LESS_THAN'
            | 'LESS_THAN_OR_EQUAL'
            | 'GREATER_THAN'
            | 'GREATER_THAN_OR_EQUAL'
            | 'BETWEEN'
            | 'IN'
            | 'CONTAINS';
          expected_value?: Json;
          rule_group?: string;
          logical_relationship?: 'AND' | 'OR';
          label?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'eligibility_rules_scheme_id_fkey';
            columns: ['scheme_id'];
            isOneToOne: false;
            referencedRelation: 'schemes';
            referencedColumns: ['id'];
          }
        ];
      };
      scheme_documents: {
        Row: {
          id: string;
          scheme_id: string;
          canonical_key: string;
          document_name: string;
          is_mandatory: boolean;
          additional_instructions: string | null;
          issuing_authority: string | null;
          validity_period: string | null;
          how_to_obtain_url: string | null;
          approx_days_to_issue: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scheme_id: string;
          canonical_key: string;
          document_name: string;
          is_mandatory?: boolean;
          additional_instructions?: string | null;
          issuing_authority?: string | null;
          validity_period?: string | null;
          how_to_obtain_url?: string | null;
          approx_days_to_issue?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          scheme_id?: string;
          canonical_key?: string;
          document_name?: string;
          is_mandatory?: boolean;
          additional_instructions?: string | null;
          issuing_authority?: string | null;
          validity_period?: string | null;
          how_to_obtain_url?: string | null;
          approx_days_to_issue?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scheme_documents_scheme_id_fkey';
            columns: ['scheme_id'];
            isOneToOne: false;
            referencedRelation: 'schemes';
            referencedColumns: ['id'];
          }
        ];
      };
      scheme_sources: {
        Row: {
          id: string;
          scheme_id: string;
          official_source_url: string;
          source_type: 'GAZETTE' | 'GUIDELINES_PDF' | 'MINISTRY_PORTAL' | 'PRESS_RELEASE';
          last_checked_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          scheme_id: string;
          official_source_url: string;
          source_type?: 'GAZETTE' | 'GUIDELINES_PDF' | 'MINISTRY_PORTAL' | 'PRESS_RELEASE';
          last_checked_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          scheme_id?: string;
          official_source_url?: string;
          source_type?: 'GAZETTE' | 'GUIDELINES_PDF' | 'MINISTRY_PORTAL' | 'PRESS_RELEASE';
          last_checked_date?: string;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'scheme_sources_scheme_id_fkey';
            columns: ['scheme_id'];
            isOneToOne: false;
            referencedRelation: 'schemes';
            referencedColumns: ['id'];
          }
        ];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          date_of_birth: string | null;
          age: number | null;
          gender: 'MALE' | 'FEMALE' | 'TRANSGENDER' | 'OTHER' | null;
          state_of_residence: string | null;
          district: string | null;
          residence_area: 'RURAL' | 'URBAN' | 'SEMI_URBAN' | null;
          annual_family_income: number | null;
          social_category: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' | null;
          employment_status:
            | 'STUDENT'
            | 'UNEMPLOYED'
            | 'SELF_EMPLOYED'
            | 'SALARIED_PRIVATE'
            | 'SALARIED_GOVERNMENT'
            | 'FARMER'
            | 'DAILY_WAGE_LABOUR'
            | 'HOMEMAKER'
            | 'RETIRED'
            | null;
          occupation: string | null;
          education_level:
            | 'BELOW_10TH'
            | 'CLASS_10_PASS'
            | 'CLASS_12_PASS'
            | 'DIPLOMA'
            | 'GRADUATE'
            | 'POST_GRADUATE'
            | 'DOCTORATE'
            | null;
          is_student: boolean;
          is_differently_abled: boolean;
          disability_percentage: number | null;
          has_bpl_card: boolean;
          owns_agricultural_land: boolean;
          additional_attributes: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          date_of_birth?: string | null;
          age?: number | null;
          gender?: 'MALE' | 'FEMALE' | 'TRANSGENDER' | 'OTHER' | null;
          state_of_residence?: string | null;
          district?: string | null;
          residence_area?: 'RURAL' | 'URBAN' | 'SEMI_URBAN' | null;
          annual_family_income?: number | null;
          social_category?: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' | null;
          employment_status?:
            | 'STUDENT'
            | 'UNEMPLOYED'
            | 'SELF_EMPLOYED'
            | 'SALARIED_PRIVATE'
            | 'SALARIED_GOVERNMENT'
            | 'FARMER'
            | 'DAILY_WAGE_LABOUR'
            | 'HOMEMAKER'
            | 'RETIRED'
            | null;
          occupation?: string | null;
          education_level?:
            | 'BELOW_10TH'
            | 'CLASS_10_PASS'
            | 'CLASS_12_PASS'
            | 'DIPLOMA'
            | 'GRADUATE'
            | 'POST_GRADUATE'
            | 'DOCTORATE'
            | null;
          is_student?: boolean;
          is_differently_abled?: boolean;
          disability_percentage?: number | null;
          has_bpl_card?: boolean;
          owns_agricultural_land?: boolean;
          additional_attributes?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          date_of_birth?: string | null;
          age?: number | null;
          gender?: 'MALE' | 'FEMALE' | 'TRANSGENDER' | 'OTHER' | null;
          state_of_residence?: string | null;
          district?: string | null;
          residence_area?: 'RURAL' | 'URBAN' | 'SEMI_URBAN' | null;
          annual_family_income?: number | null;
          social_category?: 'GENERAL' | 'OBC' | 'SC' | 'ST' | 'EWS' | null;
          employment_status?:
            | 'STUDENT'
            | 'UNEMPLOYED'
            | 'SELF_EMPLOYED'
            | 'SALARIED_PRIVATE'
            | 'SALARIED_GOVERNMENT'
            | 'FARMER'
            | 'DAILY_WAGE_LABOUR'
            | 'HOMEMAKER'
            | 'RETIRED'
            | null;
          occupation?: string | null;
          education_level?:
            | 'BELOW_10TH'
            | 'CLASS_10_PASS'
            | 'CLASS_12_PASS'
            | 'DIPLOMA'
            | 'GRADUATE'
            | 'POST_GRADUATE'
            | 'DOCTORATE'
            | null;
          is_student?: boolean;
          is_differently_abled?: boolean;
          disability_percentage?: number | null;
          has_bpl_card?: boolean;
          owns_agricultural_land?: boolean;
          additional_attributes?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      user_documents: {
        Row: {
          id: string;
          user_id: string;
          canonical_key: string;
          document_name: string;
          availability_status: 'AVAILABLE' | 'IN_PROGRESS' | 'NEEDS_RENEWAL' | 'NOT_AVAILABLE';
          issued_date: string | null;
          expiry_date: string | null;
          document_reference_masked: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          canonical_key: string;
          document_name: string;
          availability_status?: 'AVAILABLE' | 'IN_PROGRESS' | 'NEEDS_RENEWAL' | 'NOT_AVAILABLE';
          issued_date?: string | null;
          expiry_date?: string | null;
          document_reference_masked?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          canonical_key?: string;
          document_name?: string;
          availability_status?: 'AVAILABLE' | 'IN_PROGRESS' | 'NEEDS_RENEWAL' | 'NOT_AVAILABLE';
          issued_date?: string | null;
          expiry_date?: string | null;
          document_reference_masked?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      saved_schemes: {
        Row: {
          id: string;
          user_id: string;
          scheme_id: string;
          notes: string | null;
          saved_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          scheme_id: string;
          notes?: string | null;
          saved_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          scheme_id?: string;
          notes?: string | null;
          saved_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'saved_schemes_scheme_id_fkey';
            columns: ['scheme_id'];
            isOneToOne: false;
            referencedRelation: 'schemes';
            referencedColumns: ['id'];
          }
        ];
      };
      application_tasks: {
        Row: {
          id: string;
          user_id: string;
          scheme_id: string | null;
          task_description: string;
          stage:
            | 'DOCUMENT_PREPARATION'
            | 'PORTAL_REGISTRATION'
            | 'FORM_SUBMISSION'
            | 'DISBURSEMENT_AND_TRACKING';
          status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
          due_date: string | null;
          portal_url: string | null;
          acknowledgment_number: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          scheme_id?: string | null;
          task_description: string;
          stage?:
            | 'DOCUMENT_PREPARATION'
            | 'PORTAL_REGISTRATION'
            | 'FORM_SUBMISSION'
            | 'DISBURSEMENT_AND_TRACKING';
          status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
          due_date?: string | null;
          portal_url?: string | null;
          acknowledgment_number?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          scheme_id?: string | null;
          task_description?: string;
          stage?:
            | 'DOCUMENT_PREPARATION'
            | 'PORTAL_REGISTRATION'
            | 'FORM_SUBMISSION'
            | 'DISBURSEMENT_AND_TRACKING';
          status?: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'BLOCKED';
          due_date?: string | null;
          portal_url?: string | null;
          acknowledgment_number?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'application_tasks_scheme_id_fkey';
            columns: ['scheme_id'];
            isOneToOne: false;
            referencedRelation: 'schemes';
            referencedColumns: ['id'];
          }
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
