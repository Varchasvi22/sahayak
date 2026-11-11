export type DocumentReadinessStatus =
  | 'AVAILABLE'
  | 'IN_PROGRESS'
  | 'NEEDS_RENEWAL'
  | 'NOT_AVAILABLE';

export interface DocumentDefinition {
  canonical_key: string;
  title: string;
  description: string;
  issuing_authority: string;
  validity_period: string;
  how_to_obtain_url?: string;
  approx_days_to_issue?: number;
}

export interface UserDocumentRecord {
  id?: string;
  user_id: string;
  canonical_key: string;
  status: DocumentReadinessStatus;
  issued_date?: string;
  expiry_date?: string;
  updated_at?: string;
}

export interface SchemeDocumentRequirement {
  canonical_key: string;
  is_mandatory: boolean;
  condition_note?: string;
}

export interface SchemeReadinessSummary {
  scheme_id: string;
  total_required: number;
  available_count: number;
  in_progress_count: number;
  missing_count: number;
  readiness_percentage: number;
  missing_mandatory_keys: string[];
}
