/**
-- ==============================================================================
-- SAHAYAK Admin Management Types
-- ==============================================================================
*/

import { Database } from '@/types/database.types';

export type PublicationStatus =
  | 'DRAFT'
  | 'PENDING_VERIFICATION'
  | 'VERIFIED'
  | 'NEEDS_REVIEW'
  | 'ARCHIVED';

export type ApplicationStatus =
  | 'OPEN'
  | 'CLOSING_SOON'
  | 'CLOSED'
  | 'ALWAYS_ACTIVE';

export type AdminRole = 'SUPER_ADMIN' | 'ADMIN' | 'REVIEWER';

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: AdminRole;
  department?: string;
  isVerifiedAdmin: boolean;
}

export type SchemeAuditLogRow = Database['public']['Tables']['scheme_audit_logs']['Row'];

export interface SchemeRuleInput {
  id?: string;
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
  expected_value: any;
  rule_group: string;
  logical_relationship: 'AND' | 'OR';
  label: string;
}

export interface SchemeDocumentInput {
  id?: string;
  canonical_key: string;
  document_name: string;
  is_mandatory: boolean;
  issuing_authority?: string;
  validity_period?: string;
  how_to_obtain_url?: string;
  approx_days_to_issue?: number;
  additional_instructions?: string;
}

export interface SchemeSourceInput {
  id?: string;
  official_source_url: string;
  source_type: 'GAZETTE' | 'GUIDELINES_PDF' | 'MINISTRY_PORTAL' | 'PRESS_RELEASE';
  last_checked_date: string;
  notes?: string;
}

export interface SchemeFormData {
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
  status: ApplicationStatus;
  publication_status: PublicationStatus;
  verified_by_name: string;
  last_verified_at: string;
  audit_notes?: string;
  is_active: boolean;
  academic_or_financial_year?: string | null;
  rules: SchemeRuleInput[];
  documents: SchemeDocumentInput[];
  sources: SchemeSourceInput[];
}

export interface VerificationValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export const INDIAN_STATES_AND_UTS = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
];

