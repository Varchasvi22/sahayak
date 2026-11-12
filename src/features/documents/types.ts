/**
 * SAHAYAK Cross-Scheme Document Intelligence Types
 */

export type CanonicalDocumentStatus =
  | 'AVAILABLE'
  | 'MISSING'
  | 'EXPIRED'
  | 'NEEDS_VERIFICATION'
  | 'NOT_APPLICABLE';

/**
 * Standard user vault record representing a citizen's certificate status
 */
export interface UserDocumentItem {
  id?: string;
  userId?: string;
  canonicalKey: string;
  documentName: string;
  status: CanonicalDocumentStatus;
  issuedDate?: string | null;
  expiryDate?: string | null;
  documentReferenceMasked?: string | null;
  notes?: string | null;
  updatedAt?: string;
}

/**
 * Reference to a scheme that requires a specific document
 */
export interface SchemeReference {
  schemeId: string;
  schemeName: string;
  slug: string;
  isMandatory: boolean;
  governmentLevel?: 'CENTRAL' | 'STATE';
}

/**
 * Raw document requirement as declared in a scheme's gazette specifications
 */
export interface SchemeDocumentSpec {
  id?: string;
  schemeId: string;
  schemeName?: string;
  schemeSlug?: string;
  governmentLevel?: 'CENTRAL' | 'STATE';
  canonicalKey: string;
  documentName: string;
  isMandatory: boolean;
  issuingAuthority?: string | null;
  validityPeriod?: string | null;
  howToObtainUrl?: string | null;
  approxDaysToIssue?: number | null;
  additionalInstructions?: string | null;
}

/**
 * Single aggregated requirement for a canonical document across all selected schemes
 */
export interface AggregatedDocumentRequirement {
  canonicalKey: string;
  documentName: string;
  status: CanonicalDocumentStatus;
  isMandatoryAcrossAny: boolean;
  issuingAuthority: string;
  validityPeriod: string;
  howToObtainUrl?: string | null;
  approxDaysToIssue?: number | null;
  additionalInstructions?: string | null;
  linkedSchemes: SchemeReference[];
  leverageCount: number; // Number of schemes sharing this document requirement
  issuedDate?: string | null;
  expiryDate?: string | null;
  documentReferenceMasked?: string | null;
  notes?: string | null;
  isExpiredAutoDetected?: boolean;
}

/**
 * Comprehensive cross-scheme readiness calculation
 */
export interface CrossSchemeReadinessMetrics {
  totalUniqueRequired: number;
  availableCount: number;
  missingCount: number;
  expiredCount: number;
  verificationPendingCount: number;
  notApplicableCount: number;
  completionPercentage: number;
  highLeverageDocument: AggregatedDocumentRequirement | null;
  allUniqueDocuments: AggregatedDocumentRequirement[];
  evaluatedAt: string;
}
