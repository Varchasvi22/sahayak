/**
 * SAHAYAK Cross-Scheme Document Intelligence Engine
 *
 * Implements deterministic deduplication, cross-scheme mapping,
 * automatic expiry detection, and non-double-counted readiness calculations.
 */

import { UNIVERSAL_DOCUMENTS } from '@/data/mockDocuments';
import {
  CanonicalDocumentStatus,
  UserDocumentItem,
  SchemeReference,
  SchemeDocumentSpec,
  AggregatedDocumentRequirement,
  CrossSchemeReadinessMetrics,
} from './types';

/**
 * Bidirectional Database <-> Domain Status Mappings
 */
export function mapDbStatusToDomain(
  dbStatus: string | null | undefined
): CanonicalDocumentStatus {
  switch (dbStatus) {
    case 'AVAILABLE':
      return 'AVAILABLE';
    case 'IN_PROGRESS':
      return 'NEEDS_VERIFICATION';
    case 'NEEDS_RENEWAL':
      return 'EXPIRED';
    case 'NOT_AVAILABLE':
      return 'MISSING';
    case 'NOT_APPLICABLE':
      return 'NOT_APPLICABLE';
    default:
      return 'MISSING';
  }
}

export function mapDomainStatusToDb(
  domainStatus: CanonicalDocumentStatus
): 'AVAILABLE' | 'IN_PROGRESS' | 'NEEDS_RENEWAL' | 'NOT_AVAILABLE' {
  switch (domainStatus) {
    case 'AVAILABLE':
      return 'AVAILABLE';
    case 'NEEDS_VERIFICATION':
      return 'IN_PROGRESS';
    case 'EXPIRED':
      return 'NEEDS_RENEWAL';
    case 'MISSING':
    case 'NOT_APPLICABLE':
    default:
      return 'NOT_AVAILABLE';
  }
}

/**
 * Metadata Lookup Helper from Universal Catalog
 */
export function getDocumentMetadata(canonicalKey: string): {
  title: string;
  description: string;
  issuing_authority: string;
  validity_period: string;
  how_to_obtain_url?: string;
  approx_days_to_issue: number;
} {
  const found = UNIVERSAL_DOCUMENTS.find((d) => d.canonical_key === canonicalKey);
  if (found) {
    return {
      title: found.title,
      description: found.description,
      issuing_authority: found.issuing_authority,
      validity_period: found.validity_period,
      how_to_obtain_url: found.how_to_obtain_url,
      approx_days_to_issue: found.approx_days_to_issue ?? 14,
    };
  }

  // Fallback human-readable formatting
  const formattedTitle = canonicalKey
    .replace(/^doc_/, '')
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return {
    title: formattedTitle,
    description: `Official ${formattedTitle} document required for government scheme verification.`,
    issuing_authority: 'Competent Issuing Authority',
    validity_period: 'Perpetual unless specified',
    how_to_obtain_url: 'https://services.india.gov.in',
    approx_days_to_issue: 14,
  };
}

/**
 * Standard input interface for schemes passed to intelligence engine
 */
export interface SchemeWithDocumentsInput {
  id: string;
  name: string;
  slug?: string;
  governmentLevel?: 'CENTRAL' | 'STATE';
  requiredDocs?: SchemeDocumentSpec[] | string[];
  required_document_keys?: string[];
}

/**
 * Core Cross-Scheme Aggregation & Readiness Engine
 *
 * Consolidates overlapping document requirements across any number of schemes
 * into canonical single requirements, links all calling schemes, avoids double-counting,
 * and auto-flags expired certificates.
 */
export function aggregateSchemeDocuments(
  schemes: SchemeWithDocumentsInput[],
  userDocs: UserDocumentItem[],
  options?: { referenceDate?: Date | string }
): CrossSchemeReadinessMetrics {
  const refDate = options?.referenceDate
    ? new Date(options.referenceDate)
    : new Date();

  // Index user documents by canonicalKey
  const userDocMap = new Map<string, UserDocumentItem>();
  for (const doc of userDocs) {
    userDocMap.set(doc.canonicalKey, doc);
  }

  // Group by canonicalKey
  const docGroupMap = new Map<
    string,
    {
      canonicalKey: string;
      documentName?: string;
      isMandatoryAcrossAny: boolean;
      issuingAuthority?: string | null;
      validityPeriod?: string | null;
      howToObtainUrl?: string | null;
      approxDaysToIssue?: number | null;
      additionalInstructions?: string | null;
      linkedSchemes: Map<string, SchemeReference>;
    }
  >();

  for (const scheme of schemes) {
    const schemeRef: SchemeReference = {
      schemeId: scheme.id,
      schemeName: scheme.name,
      slug: scheme.slug || scheme.id,
      isMandatory: true,
      governmentLevel: scheme.governmentLevel,
    };

    // Extract list of document specs or string keys
    const docItems: Array<{ key: string; isMandatory?: boolean; spec?: SchemeDocumentSpec }> = [];

    if (Array.isArray(scheme.requiredDocs) && scheme.requiredDocs.length > 0) {
      for (const item of scheme.requiredDocs) {
        if (typeof item === 'string') {
          docItems.push({ key: item, isMandatory: true });
        } else if (item && typeof item === 'object') {
          docItems.push({
            key: item.canonicalKey,
            isMandatory: item.isMandatory !== false,
            spec: item,
          });
        }
      }
    } else if (Array.isArray(scheme.required_document_keys)) {
      for (const key of scheme.required_document_keys) {
        docItems.push({ key, isMandatory: true });
      }
    }

    for (const item of docItems) {
      if (!item.key) continue;

      let group = docGroupMap.get(item.key);
      if (!group) {
        const meta = getDocumentMetadata(item.key);
        group = {
          canonicalKey: item.key,
          documentName: item.spec?.documentName || meta.title,
          isMandatoryAcrossAny: false,
          issuingAuthority: item.spec?.issuingAuthority || meta.issuing_authority,
          validityPeriod: item.spec?.validityPeriod || meta.validity_period,
          howToObtainUrl: item.spec?.howToObtainUrl || meta.how_to_obtain_url,
          approxDaysToIssue: item.spec?.approxDaysToIssue ?? meta.approx_days_to_issue,
          additionalInstructions: item.spec?.additionalInstructions || null,
          linkedSchemes: new Map<string, SchemeReference>(),
        };
        docGroupMap.set(item.key, group);
      }

      const isMandatory = item.isMandatory ?? true;
      if (isMandatory) {
        group.isMandatoryAcrossAny = true;
      }

      // Link scheme (avoid duplicate scheme references)
      if (!group.linkedSchemes.has(scheme.id)) {
        group.linkedSchemes.set(scheme.id, {
          ...schemeRef,
          isMandatory,
        });
      }
    }
  }

  // Transform aggregated groups into canonical requirements with user status
  const aggregatedList: AggregatedDocumentRequirement[] = [];

  for (const [canonicalKey, group] of docGroupMap.entries()) {
    const userDoc = userDocMap.get(canonicalKey);
    let status: CanonicalDocumentStatus = 'MISSING';
    let isExpiredAutoDetected = false;

    if (userDoc) {
      status = userDoc.status;

      // Auto-detect expiry if expiry date is present and in the past
      if (userDoc.expiryDate) {
        const expiry = new Date(userDoc.expiryDate);
        if (!isNaN(expiry.getTime()) && expiry < refDate) {
          if (status === 'AVAILABLE' || status === 'NEEDS_VERIFICATION') {
            status = 'EXPIRED';
            isExpiredAutoDetected = true;
          }
        }
      }
    }

    const linkedSchemesList = Array.from(group.linkedSchemes.values());

    aggregatedList.push({
      canonicalKey,
      documentName: group.documentName || getDocumentMetadata(canonicalKey).title,
      status,
      isMandatoryAcrossAny: group.isMandatoryAcrossAny,
      issuingAuthority: group.issuingAuthority || 'Competent Issuing Authority',
      validityPeriod: group.validityPeriod || 'Permanent',
      howToObtainUrl: group.howToObtainUrl,
      approxDaysToIssue: group.approxDaysToIssue,
      additionalInstructions: group.additionalInstructions,
      linkedSchemes: linkedSchemesList,
      leverageCount: linkedSchemesList.length,
      issuedDate: userDoc?.issuedDate || null,
      expiryDate: userDoc?.expiryDate || null,
      documentReferenceMasked: userDoc?.documentReferenceMasked || null,
      notes: userDoc?.notes || null,
      isExpiredAutoDetected,
    });
  }

  // Calculate Readiness Metrics (No double-counting!)
  const activeDocs = aggregatedList.filter((d) => d.status !== 'NOT_APPLICABLE');
  const totalUniqueRequired = activeDocs.length;
  const availableCount = activeDocs.filter((d) => d.status === 'AVAILABLE').length;
  const missingCount = activeDocs.filter((d) => d.status === 'MISSING').length;
  const expiredCount = activeDocs.filter((d) => d.status === 'EXPIRED').length;
  const verificationPendingCount = activeDocs.filter(
    (d) => d.status === 'NEEDS_VERIFICATION'
  ).length;
  const notApplicableCount = aggregatedList.filter(
    (d) => d.status === 'NOT_APPLICABLE'
  ).length;

  const completionPercentage =
    totalUniqueRequired > 0
      ? Math.round((availableCount / totalUniqueRequired) * 100)
      : 100;

  // Identify High-Leverage Document Recommendation
  // Unfulfilled document (MISSING, EXPIRED, NEEDS_VERIFICATION) with highest leverage
  const unfulfilledDocs = activeDocs.filter((d) => d.status !== 'AVAILABLE');

  unfulfilledDocs.sort((a, b) => {
    // 1. Highest leverage count
    if (b.leverageCount !== a.leverageCount) {
      return b.leverageCount - a.leverageCount;
    }
    // 2. Mandatory over optional
    if (b.isMandatoryAcrossAny !== a.isMandatoryAcrossAny) {
      return b.isMandatoryAcrossAny ? 1 : -1;
    }
    // 3. Expired or Missing before Pending Verification
    const statusWeight = (s: CanonicalDocumentStatus) => {
      if (s === 'EXPIRED') return 3;
      if (s === 'MISSING') return 2;
      return 1;
    };
    return statusWeight(b.status) - statusWeight(a.status);
  });

  const highLeverageDocument = unfulfilledDocs.length > 0 ? unfulfilledDocs[0] : null;

  // Sort overall document list for intuitive display:
  // Unfulfilled first (sorted by leverage desc), then Available (sorted by leverage desc)
  aggregatedList.sort((a, b) => {
    const isAFulfilled = a.status === 'AVAILABLE';
    const isBFulfilled = b.status === 'AVAILABLE';

    if (isAFulfilled !== isBFulfilled) {
      return isAFulfilled ? 1 : -1;
    }
    if (b.leverageCount !== a.leverageCount) {
      return b.leverageCount - a.leverageCount;
    }
    return a.documentName.localeCompare(b.documentName);
  });

  return {
    totalUniqueRequired,
    availableCount,
    missingCount,
    expiredCount,
    verificationPendingCount,
    notApplicableCount,
    completionPercentage,
    highLeverageDocument,
    allUniqueDocuments: aggregatedList,
    evaluatedAt: refDate.toISOString(),
  };
}

/**
 * Composite Evaluation: Distinguish Statutory Eligibility vs Document Readiness
 */
export interface DualDimensionEvaluation {
  statutoryStatus: 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE' | 'INSUFFICIENT_INFORMATION';
  documentReadinessStatus: 'READY_TO_APPLY' | 'DOCUMENTS_PENDING' | 'RENEWAL_REQUIRED' | 'NO_REQUIREMENTS';
  overallAssessment: 'ACTIONABLE_READY' | 'LEGAL_OK_DOCS_MISSING' | 'INELIGIBLE' | 'NEED_MORE_PROFILE_DATA';
  headline: string;
  actionSummary: string;
}

export function evaluateStatutoryVsReadiness(
  statutoryStatus: 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE' | 'INSUFFICIENT_INFORMATION',
  readiness: CrossSchemeReadinessMetrics
): DualDimensionEvaluation {
  let documentReadinessStatus: DualDimensionEvaluation['documentReadinessStatus'] = 'DOCUMENTS_PENDING';

  if (readiness.totalUniqueRequired === 0) {
    documentReadinessStatus = 'NO_REQUIREMENTS';
  } else if (readiness.completionPercentage === 100) {
    documentReadinessStatus = 'READY_TO_APPLY';
  } else if (readiness.expiredCount > 0) {
    documentReadinessStatus = 'RENEWAL_REQUIRED';
  } else {
    documentReadinessStatus = 'DOCUMENTS_PENDING';
  }

  // Statutory NOT_ELIGIBLE overrides document readiness for final application advice
  if (statutoryStatus === 'NOT_ELIGIBLE') {
    return {
      statutoryStatus,
      documentReadinessStatus,
      overallAssessment: 'INELIGIBLE',
      headline: 'Statutory Criteria Not Met',
      actionSummary:
        'You do not meet one or more legal eligibility criteria (e.g. income limit, age, or land ownership). Gathering documents will not enable approval for this scheme.',
    };
  }

  if (statutoryStatus === 'INSUFFICIENT_INFORMATION') {
    return {
      statutoryStatus,
      documentReadinessStatus,
      overallAssessment: 'NEED_MORE_PROFILE_DATA',
      headline: 'Profile Details Incomplete',
      actionSummary:
        'Please complete your applicant profile first so Sahayak can confirm statutory eligibility before you spend time preparing certificates.',
    };
  }

  // Statutory POTENTIALLY_ELIGIBLE
  if (documentReadinessStatus === 'READY_TO_APPLY' || documentReadinessStatus === 'NO_REQUIREMENTS') {
    return {
      statutoryStatus,
      documentReadinessStatus,
      overallAssessment: 'ACTIONABLE_READY',
      headline: 'Statutory Match & 100% Document Ready',
      actionSummary:
        'You satisfy all legal criteria and hold all required certificates. You are fully ready to submit your official application!',
    };
  }

  return {
    statutoryStatus,
    documentReadinessStatus,
    overallAssessment: 'LEGAL_OK_DOCS_MISSING',
    headline: 'Statutorily Eligible, Documents Pending',
    actionSummary: `You satisfy the legal eligibility criteria! To apply, you need to obtain or renew ${
      readiness.totalUniqueRequired - readiness.availableCount
    } remaining certificate(s).`,
  };
}
