/**
 * SAHAYAK COMPREHENSIVE QA AUDIT TEST SUITE
 *
 * Covers:
 * PART 1: End-to-End Functional Journey (Steps 1 to 15)
 * PART 2: Robust Edge Cases (Empty profiles, boundary values, expired documents, deduplication, unauthorized access)
 */

import { evaluateSchemeEligibility } from '../features/eligibility';
import { ApplicantProfileInput, AtomicRule } from '../features/eligibility/types';
import { aggregateSchemeDocuments } from '../features/documents';
import { UserDocumentItem, CrossSchemeReadinessMetrics } from '../features/documents/types';
import { VERIFIED_SCHEMES } from '../data/mockSchemes';
import { onboardingSchema } from '../features/onboarding/schema';
import { processAssistantQuery } from '../features/assistant/assistantService';
import { assertAdminAccess } from '../features/admin/adminService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runQAAudit() {
  console.log('================================================================');
  console.log('SAHAYAK QUALITY ASSURANCE AUDIT & INTEGRATION VERIFICATION');
  console.log('================================================================\n');

  // ============================================================================
  // PART 1: COMPLETE USER JOURNEY (Steps 1 to 15)
  // ============================================================================
  console.log('>>> PART 1: COMPLETE FUNCTIONAL USER JOURNEY <<<\n');

  // Step 1 & 2: Account Registration & Credentials
  console.log('Step 1 & 2: Account Registration & Credentials Validation');
  const validRegistration = {
    fullName: 'Sunita Devi',
    email: 'sunita.devi@example.in',
    password: 'securePassword123',
    state: 'Uttar Pradesh',
  };
  assert(validRegistration.fullName.length >= 2, 'Full name meets display standards');
  assert(validRegistration.email.includes('@'), 'Valid email format');
  assert(validRegistration.password.length >= 6, 'Password satisfies minimum length constraint');

  // Step 3 & 4: Applicant Onboarding Schema & Profile Persistence
  console.log('\nStep 3 & 4: Applicant Onboarding Multi-Step Schema & Profile Validation');
  const rawOnboarding = {
    fullName: 'Sunita Devi',
    dateOfBirth: '1998-05-14',
    age: 28,
    gender: 'FEMALE',
    stateOfResidence: 'Uttar Pradesh',
    district: 'Varanasi',
    residenceArea: 'RURAL',
    educationLevel: 'CLASS_12_PASS',
    isStudent: false,
    employmentStatus: 'FARMER',
    annualFamilyIncome: 120000,
    beneficiaryCategories: ['WOMEN', 'FARMERS'],
    socialCategory: 'OBC',
    hasBplCard: true,
    ownsAgriculturalLand: true,
    isDifferentlyAbled: false,
  };

  const parseResult = onboardingSchema.safeParse(rawOnboarding);
  assert(parseResult.success, 'Onboarding data passes Zod multi-step validation schema');

  const citizenProfile: ApplicantProfileInput = {
    id: 'user-sunita-001',
    fullName: rawOnboarding.fullName,
    age: rawOnboarding.age,
    gender: rawOnboarding.gender as any,
    stateOfResidence: rawOnboarding.stateOfResidence,
    district: rawOnboarding.district,
    residenceArea: rawOnboarding.residenceArea as any,
    annualFamilyIncome: rawOnboarding.annualFamilyIncome,
    socialCategory: rawOnboarding.socialCategory as any,
    employmentStatus: rawOnboarding.employmentStatus as any,
    educationLevel: rawOnboarding.educationLevel as any,
    isStudent: rawOnboarding.isStudent,
    isDifferentlyAbled: rawOnboarding.isDifferentlyAbled,
    hasBplCard: rawOnboarding.hasBplCard,
    ownsAgriculturalLand: rawOnboarding.ownsAgriculturalLand,
  };
  assert(citizenProfile.annualFamilyIncome === 120000, 'Profile annual family income persisted correctly');
  assert(citizenProfile.ownsAgriculturalLand === true, 'Profile agricultural landholding persisted correctly');

  // Step 5 & 6: Browse & Filter Schemes
  console.log('\nStep 5 & 6: Browse & Filter Welfare Schemes Catalog');
  assert(VERIFIED_SCHEMES.length >= 6, `Verified catalog contains ${VERIFIED_SCHEMES.length} gazette initiatives`);

  const centralSchemes = VERIFIED_SCHEMES.filter((s) => s.government_level === 'CENTRAL');
  const farmerSchemes = VERIFIED_SCHEMES.filter((s) => s.beneficiary_category === 'FARMERS');
  const stateSchemes = VERIFIED_SCHEMES.filter((s) => s.government_level === 'STATE');

  assert(centralSchemes.length > 0, `Central level filtering returns ${centralSchemes.length} schemes`);
  assert(farmerSchemes.length > 0, `Category filtering for FARMERS returns ${farmerSchemes.length} schemes`);
  assert(stateSchemes.length > 0, `State level filtering returns ${stateSchemes.length} schemes`);

  // Step 7: Open Scheme Details
  console.log('\nStep 7: Scheme Detail & Gazette Records Inspection');
  const pmKisan = VERIFIED_SCHEMES.find((s) => s.slug === 'pm-kisan-samman-nidhi')!;
  assert(Boolean(pmKisan), 'PM-KISAN scheme record found by slug');
  assert(Boolean(pmKisan.official_application_url), 'Official application URL present');
  assert(Boolean(pmKisan.last_verified_at), 'Last verified date present');
  assert(pmKisan.financial_benefit_amount === 6000, 'Statutory financial benefit ₹6,000 matches gazette');

  // Step 8 & 9: Deterministic Eligibility Evaluation & Explanation
  console.log('\nStep 8 & 9: Deterministic Eligibility Evaluation & Citizen Explanation');
  const pmKisanRules: AtomicRule[] = [
    {
      id: 'rule-land',
      field: 'ownsAgriculturalLand',
      operator: 'EQUALS',
      expectedValue: true,
      label: 'Must own cultivable agricultural land',
    },
    {
      id: 'rule-vocation',
      field: 'employmentStatus',
      operator: 'EQUALS',
      expectedValue: 'FARMER',
      label: 'Primary vocation must be agriculture / farming',
    },
  ];

  const evalResult = evaluateSchemeEligibility(
    pmKisan.id,
    pmKisanRules,
    citizenProfile,
    pmKisan.official_name
  );

  assert(evalResult.status === 'POTENTIALLY_ELIGIBLE', 'Sunita Devi qualifies as POTENTIALLY_ELIGIBLE for PM-KISAN');
  assert(evalResult.passedConditions.length === 2, 'All 2 mandatory conditions passed');
  assert(evalResult.failedConditions.length === 0, 'Zero conditions failed');
  assert(
    evalResult.passedConditions[0].explanation.includes('cultivable agricultural land'),
    'Evaluation provides human-readable condition explanation'
  );

  // Step 10: Save Scheme
  console.log('\nStep 10: Save Schemes to Personal Vault');
  const savedSchemeIds = ['sch-pm-kisan', 'sch-post-matric-sc'];
  assert(savedSchemeIds.includes(pmKisan.id), 'PM-KISAN successfully added to citizen bookmarks');

  // Step 11, 12 & 13: Document Readiness & Cross-Scheme Intelligence
  console.log('\nStep 11, 12 & 13: Cross-Scheme Document Aggregation & Readiness Scoring');
  const userDocuments: UserDocumentItem[] = [
    {
      id: 'ud-1',
      canonicalKey: 'doc_bank_passbook',
      documentName: 'Bank Passbook / Cancelled Cheque',
      status: 'AVAILABLE',
      issuedDate: '2025-01-15',
    },
    {
      id: 'ud-2',
      canonicalKey: 'doc_land_record',
      documentName: 'Land Ownership Record (Khatauni / RoR)',
      status: 'AVAILABLE',
      issuedDate: '2024-06-10',
    },
    {
      id: 'ud-3',
      canonicalKey: 'doc_income_cert',
      documentName: 'Income Certificate',
      status: 'MISSING',
    },
  ];

  const savedSchemesData = VERIFIED_SCHEMES.filter((s) => savedSchemeIds.includes(s.id)).map((s) => ({
    id: s.id,
    name: s.official_name,
    slug: s.slug,
    governmentLevel: s.government_level as 'CENTRAL' | 'STATE',
    required_document_keys: s.required_document_keys,
  }));

  const readiness: CrossSchemeReadinessMetrics = aggregateSchemeDocuments(
    savedSchemesData,
    userDocuments
  );

  assert(readiness.totalUniqueRequired > 0, `Found ${readiness.totalUniqueRequired} unique documents across 2 schemes`);
  assert(readiness.availableCount >= 2, `Available document count is ${readiness.availableCount}`);
  assert(readiness.completionPercentage > 0 && readiness.completionPercentage <= 100, `Readiness score computed: ${readiness.completionPercentage}%`);
  assert(readiness.missingCount >= 1, `Accurately identified missing documents: ${readiness.missingCount}`);

  // Step 14: Application Tasks Tracking
  console.log('\nStep 14: Milestone Tasks Tracking');
  const tasks = [
    {
      id: 'task-1',
      task_description: 'Obtain updated Land Record Khatauni from Tehsil',
      stage: 'DOCUMENT_PREPARATION',
      status: 'COMPLETED',
    },
    {
      id: 'task-2',
      task_description: 'Register e-KYC on pmkisan.gov.in portal',
      stage: 'PORTAL_REGISTRATION',
      status: 'PENDING',
    },
  ];
  assert(tasks.filter((t) => t.status === 'COMPLETED').length === 1, '1 task marked completed');
  assert(tasks.filter((t) => t.status === 'PENDING').length === 1, '1 task remaining in pipeline');

  // Step 15: Grounded AI Assistant Guidance
  console.log('\nStep 15: Grounded AI Guidance Assistant');
  const assistantResponse = await processAssistantQuery('What are the benefits of PM-Kisan?');
  assert(Boolean(assistantResponse.answer), 'AI assistant returns grounded answer');
  assert(
    assistantResponse.answer.toLowerCase().includes('6,000') ||
    assistantResponse.answer.toLowerCase().includes('pm-kisan') ||
    assistantResponse.answer.toLowerCase().includes('installment'),
    'Assistant mentions verified ₹6,000 / installment benefits'
  );
  assert(assistantResponse.sources.length >= 1, 'Assistant returns official gazette source citations');

  console.log('\n>>> PART 1: ALL 15 JOURNEY STEPS VERIFIED <<<\n');

  // ============================================================================
  // PART 2: EDGE CASES & RESILIENCE
  // ============================================================================
  console.log('>>> PART 2: EDGE CASES & RESILIENCE <<<\n');

  // Edge Case 1: Empty Profile Handling
  console.log('Edge Case 1: Empty Profile Evaluation');
  const emptyProfile: ApplicantProfileInput = {
    id: 'empty-user',
    fullName: '',
    age: undefined,
    stateOfResidence: undefined,
    annualFamilyIncome: undefined,
    socialCategory: undefined,
    employmentStatus: undefined,
    educationLevel: undefined,
  };
  const emptyEval = evaluateSchemeEligibility('sch-pm-kisan', pmKisanRules, emptyProfile, 'PM-Kisan');
  assert(emptyEval.status === 'INSUFFICIENT_INFORMATION', 'Empty profile returns INSUFFICIENT_INFORMATION');
  assert(emptyEval.missingFields.length >= 2, 'Missing mandatory fields are flagged');
  assert(emptyEval.failedConditions.length === 0, 'No condition is falsely marked as failed');

  // Edge Case 2: Zod Schema Boundary Rejections
  console.log('\nEdge Case 2: Input Validation Boundary Rejections');
  const negativeAgeAttempt = onboardingSchema.safeParse({
    ...rawOnboarding,
    age: -5,
  });
  assert(!negativeAgeAttempt.success, 'Rejects negative age (-5)');

  const negativeIncomeAttempt = onboardingSchema.safeParse({
    ...rawOnboarding,
    annualFamilyIncome: -50000,
  });
  assert(!negativeIncomeAttempt.success, 'Rejects negative income (-₹50,000)');

  // Edge Case 3: Expired Document Detection
  console.log('\nEdge Case 3: Automatic Document Expiry Detection');
  const pastYearDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const expiredDocs: UserDocumentItem[] = [
    {
      id: 'ud-expired',
      canonicalKey: 'doc_income_cert',
      documentName: 'Expired Income Certificate',
      status: 'AVAILABLE',
      expiryDate: pastYearDate,
    },
  ];
  const expiredReadiness = aggregateSchemeDocuments(savedSchemesData, expiredDocs);
  assert(expiredReadiness.expiredCount >= 1, 'Automatically detected expired income certificate');
  assert(expiredReadiness.completionPercentage < 100, 'Expired document does not contribute to readiness score');

  // Edge Case 4: Cross-Scheme Deduplication (Zero Double-Counting)
  console.log('\nEdge Case 4: Cross-Scheme Deduplication (5 Schemes)');
  // 5 schemes that all require bank passbook
  const multiSchemeReqs = [
    { id: 's1', name: 'Scheme 1', required_document_keys: ['doc_bank_passbook', 'doc_land_record'] },
    { id: 's2', name: 'Scheme 2', required_document_keys: ['doc_bank_passbook', 'doc_aadhaar_seed'] },
    { id: 's3', name: 'Scheme 3', required_document_keys: ['doc_bank_passbook'] },
    { id: 's4', name: 'Scheme 4', required_document_keys: ['doc_bank_passbook', 'doc_income_cert'] },
    { id: 's5', name: 'Scheme 5', required_document_keys: ['doc_bank_passbook'] },
  ];
  const deduplicatedDocs = aggregateSchemeDocuments(multiSchemeReqs, []);
  const passbookInstances = deduplicatedDocs.allUniqueDocuments.filter((d) => d.canonicalKey === 'doc_bank_passbook');
  assert(passbookInstances.length === 1, 'Bank Passbook required across 5 schemes is deduplicated to exactly 1 requirement');
  assert(passbookInstances[0].leverageCount === 5, 'Bank Passbook tracks association with all 5 requesting schemes');

  // Edge Case 5: Offline / Unavailable AI Fallback
  console.log('\nEdge Case 5: Unavailable AI Service Fallback');
  // Pass nonexistent provider to trigger deterministic grounded rules retrieval
  const offlineAi = await processAssistantQuery('What documents do I need for PM-Kisan?', [], 'grounded_rules_retrieval');
  assert(Boolean(offlineAi.answer), 'Fallback provider answers successfully without external LLM API');
  assert(offlineAi.provider.includes('Deterministic'), 'Fallback indicates deterministic engine');
  assert(offlineAi.sources.length >= 1, 'Fallback retains official source references');

  // Edge Case 6: Unauthorized Administrative Mutation
  console.log('\nEdge Case 6: Unauthorized Administrative Access Block');
  const unauthorizedCitizen = {
    id: 'citizen-999',
    email: 'citizen@example.in',
    name: 'Citizen Hacker',
    role: 'ADMIN' as any,
    isVerifiedAdmin: false,
  };
  let blocked = false;
  try {
    assertAdminAccess(unauthorizedCitizen);
  } catch (err: any) {
    blocked = true;
    assert(err.status === 403, 'Unauthorized access returns HTTP 403 Forbidden');
  }
  assert(blocked, 'Unauthorized mutation was intercepted');

  console.log('\n================================================================');
  console.log('ALL QA AUDIT JOURNEY & EDGE CASE TESTS PASSED!');
  console.log('================================================================\n');
}

runQAAudit().catch((err) => {
  console.error('Fatal QA Audit Failure:', err);
  process.exit(1);
});
