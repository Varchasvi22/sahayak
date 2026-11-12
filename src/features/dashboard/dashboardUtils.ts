/**
 * SAHAYAK Dashboard Analytics & Recommendation Utilities
 */

import { evaluateSchemeEligibility } from '@/features/eligibility';
import { aggregateSchemeDocuments } from '@/features/documents/crossSchemeIntelligence';
import { SchemeWithDocumentsInput } from '@/features/documents/crossSchemeIntelligence';
import { UserDocumentItem } from '@/features/documents/types';
import { VERIFIED_SCHEMES } from '@/data/mockSchemes';

export interface ProfileCompletenessResult {
  percentage: number;
  completedCount: number;
  totalFields: number;
  isComplete: boolean;
  missingFields: Array<{ key: string; label: string; reason: string }>;
}

export function calculateProfileCompleteness(
  profile: any
): ProfileCompletenessResult {
  const fieldsToCheck = [
    {
      key: 'full_name',
      label: 'Full Legal Name',
      value: profile?.full_name || profile?.fullName,
      reason: 'Required for matching certificates & official records',
    },
    {
      key: 'age',
      label: 'Age / Date of Birth',
      value: profile?.age ?? profile?.date_of_birth,
      reason: 'Mandatory for youth, elderly, and student age ceilings',
    },
    {
      key: 'gender',
      label: 'Gender',
      value: profile?.gender,
      reason: 'Required for women-focused welfare initiatives',
    },
    {
      key: 'state_of_residence',
      label: 'State / Union Territory',
      value: profile?.state_of_residence || profile?.stateOfResidence,
      reason: 'Crucial for state-sponsored welfare entitlements',
    },
    {
      key: 'district',
      label: 'District',
      value: profile?.district,
      reason: 'Determines local Tehsildar jurisdiction & tribal zones',
    },
    {
      key: 'residence_area',
      label: 'Area (Rural / Urban)',
      value: profile?.residence_area || profile?.residenceArea,
      reason: 'Required for rural livelihood & housing schemes',
    },
    {
      key: 'annual_family_income',
      label: 'Annual Family Income',
      value: profile?.annual_family_income ?? profile?.annualFamilyIncome,
      reason: 'Determines income ceilings across Central & State scholarships',
    },
    {
      key: 'social_category',
      label: 'Social Category (Caste / Community)',
      value: profile?.social_category || profile?.socialCategory,
      reason: 'Identifies affirmative action entitlements (SC/ST/OBC/EWS)',
    },
    {
      key: 'education_level',
      label: 'Education Level',
      value: profile?.education_level || profile?.educationLevel,
      reason: 'Required for scholarships and skill development programs',
    },
    {
      key: 'employment_status',
      label: 'Occupation / Employment Status',
      value: profile?.employment_status || profile?.employmentStatus,
      reason: 'Distinguishes farmers, students, workers, and job seekers',
    },
  ];

  let completedCount = 0;
  const missingFields: Array<{ key: string; label: string; reason: string }> = [];

  for (const item of fieldsToCheck) {
    if (item.value !== null && item.value !== undefined && item.value !== '') {
      completedCount++;
    } else {
      missingFields.push({
        key: item.key,
        label: item.label,
        reason: item.reason,
      });
    }
  }

  const totalFields = fieldsToCheck.length;
  const percentage = Math.round((completedCount / totalFields) * 100);

  return {
    percentage,
    completedCount,
    totalFields,
    isComplete: percentage === 100,
    missingFields,
  };
}

export interface RecommendedSchemeCardData {
  id: string;
  slug: string;
  name: string;
  departmentName: string;
  governmentLevel: 'CENTRAL' | 'STATE';
  briefDescription: string;
  financialBenefitAmount: number;
  applicationStatus: string;
  officialApplicationUrl: string;
  matchStatus: 'POTENTIALLY_ELIGIBLE' | 'NOT_ELIGIBLE' | 'INSUFFICIENT_INFORMATION';
  matchReason: string;
  passedCount: number;
  failedCount: number;
  unknownCount: number;
  documentReadinessPercentage: number;
}

export function computeRecommendedSchemes(
  applicantProfile: any,
  userDocs: UserDocumentItem[]
): RecommendedSchemeCardData[] {
  const results: RecommendedSchemeCardData[] = [];

  for (const scheme of VERIFIED_SCHEMES) {
    const evalResult = evaluateSchemeEligibility(
      scheme.id,
      (scheme as any).eligibility_rules?.conditions || (scheme as any).eligibility_rules || [],
      applicantProfile,
      scheme.official_name
    );

    // Compute document readiness for this specific scheme
    const schemeDocInput: SchemeWithDocumentsInput = {
      id: scheme.id,
      name: scheme.official_name,
      slug: scheme.slug,
      governmentLevel: scheme.government_level,
      required_document_keys: scheme.required_document_keys,
    };

    const docMetrics = aggregateSchemeDocuments([schemeDocInput], userDocs);

    // Formulate clean explanation of why it matched or needs info
    let matchReason = '';
    if (evalResult.status === 'POTENTIALLY_ELIGIBLE') {
      matchReason = `All ${evalResult.passedConditions.length} statutory conditions satisfied based on your verified profile attributes.`;
    } else if (evalResult.status === 'INSUFFICIENT_INFORMATION') {
      const missingLabels = evalResult.missingFields.slice(0, 2).join(', ');
      matchReason = `Requires confirming ${missingLabels || 'profile fields'} to evaluate statutory eligibility.`;
    } else {
      const firstFailure = evalResult.failedConditions[0]?.explanation || 'Does not meet criteria';
      matchReason = firstFailure;
    }

    results.push({
      id: scheme.id,
      slug: scheme.slug,
      name: scheme.official_name,
      departmentName: scheme.department_name,
      governmentLevel: scheme.government_level,
      briefDescription: scheme.brief_description,
      financialBenefitAmount: scheme.financial_benefit_amount || 0,
      applicationStatus: scheme.application_status,
      officialApplicationUrl: scheme.official_application_url,
      matchStatus: evalResult.status,
      matchReason,
      passedCount: evalResult.passedConditions.length,
      failedCount: evalResult.failedConditions.length,
      unknownCount: evalResult.unknownConditions.length,
      documentReadinessPercentage: docMetrics.completionPercentage,
    });
  }

  // Sort:
  // 1. POTENTIALLY_ELIGIBLE first
  // 2. INSUFFICIENT_INFORMATION second
  // 3. NOT_ELIGIBLE last
  // Within groups, sort by financial benefit amount descending
  results.sort((a, b) => {
    const statusOrder: Record<string, number> = {
      POTENTIALLY_ELIGIBLE: 1,
      INSUFFICIENT_INFORMATION: 2,
      NOT_ELIGIBLE: 3,
    };

    const orderA = statusOrder[a.matchStatus] || 4;
    const orderB = statusOrder[b.matchStatus] || 4;

    if (orderA !== orderB) {
      return orderA - orderB;
    }

    return b.financialBenefitAmount - a.financialBenefitAmount;
  });

  return results;
}
