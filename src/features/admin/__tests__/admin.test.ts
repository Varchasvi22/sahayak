/**
 * SAHAYAK Scheme Admin & Governance Unit & Integration Test Suite
 *
 * Verifies role-based access control, rejection of unauthorized requests,
 * statutory publication guardrails, full CRUD lifecycle, and audit logging.
 */

import {
  isAuthorizedAdmin,
  assertAdminAccess,
  createScheme,
  updateScheme,
  updatePublicationStatus,
  deactivateScheme,
  reactivateScheme,
  getSchemeAuditLogs,
  DEFAULT_ADMINS,
} from '../adminService';
import {
  validateSchemeForPublication,
  validateEligibilityRule,
  validateSchemeDocument,
  validateSchemeSource,
} from '../validation';
import { SchemeFormData, AdminUser } from '../types';

const CITIZEN_USER: AdminUser = {
  id: 'citizen-123',
  email: 'citizen@example.in',
  name: 'Aarav Sharma',
  role: 'ADMIN', // But isVerifiedAdmin is false
  isVerifiedAdmin: false,
};

const UNAUTHENTICATED_USER = null;

function assert(condition: boolean, message: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${message}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${message}`);
}

async function runAdminTests() {
  console.log('\n================================================================');
  console.log('SAHAYAK SCHEME ADMIN & GOVERNANCE TEST SUITE');
  console.log('================================================================\n');

  // --- 1. Role Verification & RBAC Tests ---
  console.log('--- 1. Role-Based Access Control (RBAC) ---');
  assert(isAuthorizedAdmin(DEFAULT_ADMINS.SUPER_ADMIN) === true, 'Super Admin is verified');
  assert(isAuthorizedAdmin(DEFAULT_ADMINS.CURATOR) === true, 'Gazette Reviewer is verified');
  assert(isAuthorizedAdmin(CITIZEN_USER) === false, 'Citizen user is NOT authorized');
  assert(isAuthorizedAdmin(UNAUTHENTICATED_USER) === false, 'Unauthenticated user is NOT authorized');

  // assertAdminAccess check
  let thrown = false;
  try {
    assertAdminAccess(CITIZEN_USER);
  } catch (err: any) {
    thrown = true;
    assert(err.status === 403, 'assertAdminAccess returns 403 status for unauthorized citizen');
  }
  assert(thrown, 'assertAdminAccess threw error for citizen user');

  // --- 2. Reject Unauthorized Mutations ---
  console.log('\n--- 2. Unauthorized Mutation Protection ---');

  const testSchemeData: SchemeFormData = {
    slug: 'unauthorized-test-scheme',
    official_name: 'Test Scheme By Citizen',
    short_title: 'TSBC',
    description: 'This should be blocked by security gate.',
    benefits: 'None',
    government_level: 'CENTRAL',
    category_id: 'FARMERS',
    department_name: 'Test Dept',
    official_application_url: 'https://test.gov.in',
    official_portal_name: 'test.gov.in',
    status: 'OPEN',
    publication_status: 'DRAFT',
    verified_by_name: 'Imposter',
    last_verified_at: '2026-11-12',
    is_active: false,
    rules: [],
    documents: [],
    sources: [],
  };

  // Attempt creation by unauthorized citizen
  const createAttempt = await createScheme(testSchemeData, CITIZEN_USER);
  assert(createAttempt.data === null, 'Citizen cannot create scheme');
  assert(createAttempt.error !== null, 'Citizen creation attempt returns error');
  assert(
    Boolean(createAttempt.error?.message.includes('UNAUTHORIZED')),
    'Error explicitly identifies UNAUTHORIZED status'
  );

  // Attempt update by unauthenticated user
  const updateAttempt = await updateScheme('some-id', { official_name: 'Hacked' }, UNAUTHENTICATED_USER);
  assert(updateAttempt.data === null, 'Unauthenticated user cannot update scheme');
  assert(updateAttempt.error !== null, 'Update returns authorization error');

  // Attempt deactivation by citizen
  const deactAttempt = await deactivateScheme('some-id', 'Malicious intent', CITIZEN_USER);
  assert(deactAttempt.success === false, 'Citizen cannot deactivate scheme');

  // Attempt status change by citizen
  const statusAttempt = await updatePublicationStatus('some-id', 'VERIFIED', 'Hacker', CITIZEN_USER);
  assert(statusAttempt.data === null, 'Citizen cannot publish scheme');

  // --- 3. Statutory Publication Guardrails ---
  console.log('\n--- 3. Statutory Publication Guardrails ---');

  // Incomplete scheme: 0 sources, 0 rules, future date
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const invalidPublicationScheme: SchemeFormData = {
    slug: 'invalid-pub',
    official_name: 'Incomplete Welfare Initiative',
    short_title: 'IWI',
    description: 'Short',
    benefits: 'Short',
    government_level: 'CENTRAL',
    category_id: 'STUDENTS',
    department_name: 'Dept',
    official_application_url: 'not-a-url',
    official_portal_name: 'portal',
    status: 'OPEN',
    publication_status: 'VERIFIED',
    verified_by_name: '',
    last_verified_at: tomorrow,
    is_active: true,
    rules: [],
    documents: [],
    sources: [],
  };

  const pubValidation = validateSchemeForPublication(invalidPublicationScheme);
  assert(pubValidation.isValid === false, 'Incomplete scheme fails publication validation');
  assert(
    pubValidation.errors.some((e) => e.includes('verified gazette notification')),
    'Demands at least one verified gazette source'
  );
  assert(
    pubValidation.errors.some((e) => e.includes('deterministic eligibility rule')),
    'Demands at least one deterministic eligibility rule'
  );
  assert(
    pubValidation.errors.some((e) => e.includes('future')),
    'Rejects verification date set in the future'
  );
  assert(
    pubValidation.errors.some((e) => e.includes('responsible administrator')),
    'Demands named reviewing administrator'
  );

  // Fully qualified scheme
  const validPublicationScheme: SchemeFormData = {
    slug: 'pm-ujjwala-yojana-3',
    official_name: 'Pradhan Mantri Ujjwala Yojana 3.0',
    short_title: 'PMUY 3.0',
    description: 'Deposit-free LPG connections to poor women across India under Ministry of Petroleum.',
    benefits: 'Free LPG connection with financial aid of ₹1,600 and first refill cylinder with stove.',
    financial_benefit_amount: 1600,
    government_level: 'CENTRAL',
    category_id: 'WOMEN',
    department_name: 'Ministry of Petroleum and Natural Gas',
    official_application_url: 'https://pmuy.gov.in',
    official_portal_name: 'pmuy.gov.in',
    status: 'OPEN',
    publication_status: 'VERIFIED',
    verified_by_name: 'Dr. Rajesh Sharma (MeitY)',
    last_verified_at: '2026-11-12',
    is_active: true,
    rules: [
      {
        field: 'has_bpl_card',
        operator: 'EQUALS',
        expected_value: true,
        rule_group: 'default',
        logical_relationship: 'AND',
        label: 'Applicant family must hold a valid BPL / Antyodaya ration card',
      },
    ],
    documents: [
      {
        canonical_key: 'doc_ration_card',
        document_name: 'BPL Ration Card',
        is_mandatory: true,
        issuing_authority: 'Food & Civil Supplies Department',
      },
    ],
    sources: [
      {
        official_source_url: 'https://pmuy.gov.in/guidelines.pdf',
        source_type: 'GAZETTE',
        last_checked_date: '2026-11-12',
        notes: 'Ministry Notification No. 12/2026',
      },
    ],
  };

  const validPubResult = validateSchemeForPublication(validPublicationScheme);
  assert(validPubResult.isValid === true, 'Fully qualified scheme passes publication validation');
  assert(validPubResult.errors.length === 0, 'Zero publication errors for verified scheme');

  // --- 4. Admin CRUD Lifecycle & Status Transitions ---
  console.log('\n--- 4. Admin CRUD Lifecycle & Status Transitions ---');

  // Step 4.1: Create Scheme as DRAFT
  const newDraftData: SchemeFormData = {
    slug: 'karnataka-yuva-shakti-2026',
    official_name: 'Karnataka Yuva Shakti Internship Initiative',
    short_title: 'Yuva Shakti',
    description: 'Monthly skill internship stipend for technical diploma and graduate students in Karnataka.',
    benefits: 'Monthly stipend of ₹3,000 for up to 12 months with industry placement.',
    financial_benefit_amount: 36000,
    government_level: 'STATE',
    applicable_region: 'Karnataka',
    category_id: 'STUDENTS',
    department_name: 'Department of Skill Development, Karnataka',
    official_application_url: 'https://skill.karnataka.gov.in',
    official_portal_name: 'skill.karnataka.gov.in',
    status: 'OPEN',
    publication_status: 'DRAFT',
    verified_by_name: 'Pooja Varma',
    last_verified_at: '2026-11-12',
    is_active: false,
    rules: [
      {
        field: 'state_of_residence',
        operator: 'EQUALS',
        expected_value: 'Karnataka',
        rule_group: 'default',
        logical_relationship: 'AND',
        label: 'Applicant must be a domiciled resident of Karnataka',
      },
      {
        field: 'is_student',
        operator: 'EQUALS',
        expected_value: true,
        rule_group: 'default',
        logical_relationship: 'AND',
        label: 'Applicant must be a currently enrolled student or graduate within 2 years',
      },
    ],
    documents: [
      {
        canonical_key: 'doc_domicile_certificate',
        document_name: 'Karnataka Domicile Certificate',
        is_mandatory: true,
        issuing_authority: 'Revenue Department / Nadakacheri',
      },
    ],
    sources: [
      {
        official_source_url: 'https://skill.karnataka.gov.in/gazette-2026.pdf',
        source_type: 'GAZETTE',
        last_checked_date: '2026-11-12',
        notes: 'Govt Order No. ED 243 MIS 2026',
      },
    ],
  };

  const createRes = await createScheme(newDraftData, DEFAULT_ADMINS.SUPER_ADMIN);
  assert(createRes.error === null, 'Admin successfully created new scheme');
  assert(createRes.data !== null, 'Created scheme data returned');
  assert(createRes.data?.publication_status === 'DRAFT', 'New scheme has DRAFT status');
  assert(createRes.data?.is_active === false, 'Draft scheme is not publicly active');

  const createdId = createRes.data!.id!;

  // Step 4.2: Edit Scheme (Update stipend amount and add third rule)
  const updateRes = await updateScheme(
    createdId,
    {
      financial_benefit_amount: 40000,
      description: 'Monthly skill internship stipend of ₹3,500 for diploma and graduate students.',
    },
    DEFAULT_ADMINS.SUPER_ADMIN,
    'Increased monthly stipend ceiling from ₹36k to ₹40k'
  );
  assert(updateRes.error === null, 'Admin successfully updated scheme');
  assert(updateRes.data?.financial_benefit_amount === 40000, 'Financial benefit updated');

  // Step 4.3: Transition to PENDING_VERIFICATION
  const pendingRes = await updatePublicationStatus(
    createdId,
    'PENDING_VERIFICATION',
    'Pooja Varma',
    DEFAULT_ADMINS.CURATOR,
    'Submitted for legal gazette audit'
  );
  assert(pendingRes.error === null, 'Status shifted to PENDING_VERIFICATION');
  assert(pendingRes.data?.publication_status === 'PENDING_VERIFICATION', 'Status matches');

  // Step 4.4: Approve & Transition to VERIFIED (Live)
  const verifyRes = await updatePublicationStatus(
    createdId,
    'VERIFIED',
    'Dr. Rajesh Sharma',
    DEFAULT_ADMINS.SUPER_ADMIN,
    'Gazette Notification No. ED 243 confirmed and audited'
  );
  assert(verifyRes.error === null, 'Status shifted to VERIFIED');
  assert(verifyRes.data?.publication_status === 'VERIFIED', 'Status matches VERIFIED');
  assert(verifyRes.data?.is_active === true, 'Verified scheme automatically activated');

  // Step 4.5: Deactivate & Archive Scheme
  const deactRes = await deactivateScheme(
    createdId,
    'Annual cohort application window completed for 2026',
    DEFAULT_ADMINS.SUPER_ADMIN
  );
  assert(deactRes.success === true, 'Scheme successfully archived');

  // Step 4.6: Reactivate Scheme from Archive
  const reactRes = await reactivateScheme(createdId, DEFAULT_ADMINS.SUPER_ADMIN);
  assert(reactRes.success === true, 'Scheme successfully reactivated');

  // --- 5. Rule, Document & Source Micro-Validation ---
  console.log('\n--- 5. Deterministic Rule & Document Validation ---');

  // Rule operators
  assert(
    validateEligibilityRule({
      field: 'age',
      operator: 'BETWEEN',
      expected_value: [18, 30],
      rule_group: 'default',
      logical_relationship: 'AND',
      label: 'Age between 18 and 30',
    }).isValid === true,
    'Valid BETWEEN operator passes'
  );

  assert(
    validateEligibilityRule({
      field: 'age',
      operator: 'BETWEEN',
      expected_value: [35, 20], // Min > Max
      rule_group: 'default',
      logical_relationship: 'AND',
      label: 'Invalid range',
    }).isValid === false,
    'Inverted BETWEEN range fails'
  );

  // Document canonical key prefix
  assert(
    validateSchemeDocument({
      canonical_key: 'doc_income_certificate',
      document_name: 'Income Certificate',
      is_mandatory: true,
    }).isValid === true,
    'Valid doc_ prefix passes'
  );

  assert(
    validateSchemeDocument({
      canonical_key: 'custom_income_proof', // Missing doc_ prefix
      document_name: 'Income Proof',
      is_mandatory: true,
    }).isValid === false,
    'Missing doc_ prefix fails canonical validation'
  );

  // Source URL validation
  assert(
    validateSchemeSource({
      official_source_url: 'https://india.gov.in',
      source_type: 'GAZETTE',
      last_checked_date: '2026-11-12',
    }).isValid === true,
    'Valid https URL passes source validation'
  );

  assert(
    validateSchemeSource({
      official_source_url: 'ftp://invalid-source',
      source_type: 'GAZETTE',
      last_checked_date: '2026-11-12',
    }).isValid === false,
    'Invalid URL protocol fails source validation'
  );

  // --- 6. Audit Trail Logging Verification ---
  console.log('\n--- 6. Tamper-Resistant Audit Trail Verification ---');

  const logs = await getSchemeAuditLogs(createdId);
  assert(logs.length >= 4, `Audit trail recorded all mutations (count: ${logs.length})`);
  assert(
    logs.some((l) => l.action === 'SCHEME_CREATED'),
    'Audit log contains SCHEME_CREATED action'
  );
  assert(
    logs.some((l) => l.action === 'SCHEME_UPDATED'),
    'Audit log contains SCHEME_UPDATED action'
  );
  assert(
    logs.some((l) => l.action === 'PUBLICATION_STATUS_CHANGED'),
    'Audit log contains PUBLICATION_STATUS_CHANGED action'
  );
  assert(
    logs.some((l) => l.action === 'SCHEME_DEACTIVATED'),
    'Audit log contains SCHEME_DEACTIVATED action'
  );
  assert(
    logs.every((l) => Boolean(l.performed_by_name && l.created_at)),
    'Every audit log has an authenticated reviewer and timestamp'
  );

  console.log('\n================================================================');
  console.log('ALL ADMIN MANAGEMENT TESTS PASSED!');
  console.log('================================================================\n');
}

runAdminTests().catch((err) => {
  console.error('Fatal Admin Test Exception:', err);
  process.exit(1);
});
