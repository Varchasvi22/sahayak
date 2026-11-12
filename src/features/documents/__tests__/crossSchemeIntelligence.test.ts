/**
 * Unit Tests for Cross-Scheme Document Intelligence Engine
 */

import {
  aggregateSchemeDocuments,
  evaluateStatutoryVsReadiness,
  mapDbStatusToDomain,
  mapDomainStatusToDb,
} from '../crossSchemeIntelligence';
import {
  TEST_SCHEMES_FIXTURE,
  FIXTURE_USER_DOCS_EMPTY,
  FIXTURE_USER_DOCS_PARTIAL,
  FIXTURE_USER_DOCS_AUTO_EXPIRED,
  FIXTURE_USER_DOCS_FULLY_READY,
} from '../fixtures';
import { UserDocumentItem } from '../types';

const FIXED_TEST_DATE = new Date('2026-11-12T00:00:00.000Z');

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

function runTests() {
  console.log('--- RUNNING CROSS-SCHEME DOCUMENT INTELLIGENCE TESTS ---');

  // TEST 1: Database <-> Domain Mapping
  {
    console.log('Test 1: Status mapping between Database and Domain');
    assert(mapDbStatusToDomain('AVAILABLE') === 'AVAILABLE', 'AVAILABLE maps to AVAILABLE');
    assert(mapDbStatusToDomain('IN_PROGRESS') === 'NEEDS_VERIFICATION', 'IN_PROGRESS maps to NEEDS_VERIFICATION');
    assert(mapDbStatusToDomain('NEEDS_RENEWAL') === 'EXPIRED', 'NEEDS_RENEWAL maps to EXPIRED');
    assert(mapDbStatusToDomain('NOT_AVAILABLE') === 'MISSING', 'NOT_AVAILABLE maps to MISSING');
    assert(mapDbStatusToDomain(null) === 'MISSING', 'null maps to MISSING');

    assert(mapDomainStatusToDb('AVAILABLE') === 'AVAILABLE', 'Domain AVAILABLE maps to DB AVAILABLE');
    assert(mapDomainStatusToDb('NEEDS_VERIFICATION') === 'IN_PROGRESS', 'Domain NEEDS_VERIFICATION maps to DB IN_PROGRESS');
    assert(mapDomainStatusToDb('EXPIRED') === 'NEEDS_RENEWAL', 'Domain EXPIRED maps to DB NEEDS_RENEWAL');
    assert(mapDomainStatusToDb('MISSING') === 'NOT_AVAILABLE', 'Domain MISSING maps to DB NOT_AVAILABLE');
    assert(mapDomainStatusToDb('NOT_APPLICABLE') === 'NOT_AVAILABLE', 'Domain NOT_APPLICABLE maps to DB NOT_AVAILABLE');
    console.log('✓ Test 1 passed');
  }

  // TEST 2: Overlapping Documents & Non-Double-Counting Deduplication
  {
    console.log('Test 2: Deduplication across 5 schemes & No Double-Counting');
    // 5 schemes in fixture have raw total document references:
    // PM-Kisan (3) + Ayushman (3) + Post-Matric (5) + Yuva Nidhi (4) + Sukanya (3) = 18 references
    const metrics = aggregateSchemeDocuments(
      TEST_SCHEMES_FIXTURE,
      FIXTURE_USER_DOCS_EMPTY,
      { referenceDate: FIXED_TEST_DATE }
    );

    // Count unique canonical keys across all 5 schemes:
    // bank_passbook, land_record, aadhaar_seed, ration_card, voter_id, caste_cert,
    // income_cert, marksheet_10, college_id, domicile_cert, degree_cert, birth_cert, parent_id = 13 unique
    assert(metrics.totalUniqueRequired === 13, `Expected 13 unique documents, got ${metrics.totalUniqueRequired}`);
    assert(metrics.availableCount === 0, `Expected 0 available, got ${metrics.availableCount}`);
    assert(metrics.missingCount === 13, `Expected 13 missing, got ${metrics.missingCount}`);
    assert(metrics.completionPercentage === 0, 'Completion percentage is 0% when no docs available');

    // Verify doc_bank_passbook appears in all 5 schemes
    const passbook = metrics.allUniqueDocuments.find((d) => d.canonicalKey === 'doc_bank_passbook');
    assert(Boolean(passbook), 'Passbook must be in aggregated list');
    assert(passbook?.leverageCount === 5, `Expected passbook leverage 5, got ${passbook?.leverageCount}`);
    assert(passbook?.linkedSchemes.length === 5, 'Passbook links to all 5 schemes');

    // Verify doc_income_cert appears in Post-Matric & Yuva Nidhi (leverage 2)
    const incomeCert = metrics.allUniqueDocuments.find((d) => d.canonicalKey === 'doc_income_cert');
    assert(Boolean(incomeCert), 'Income certificate must be in aggregated list');
    assert(incomeCert?.leverageCount === 2, `Expected income cert leverage 2, got ${incomeCert?.leverageCount}`);

    console.log('✓ Test 2 passed');
  }

  // TEST 3: Non-Double-Counting Readiness Calculation with Shared Docs
  {
    console.log('Test 3: Accurate Readiness Percentage (No Double-Counting Shared Passbook)');
    // Take PM-Kisan (3 docs) and Ayushman Bharat (3 docs).
    // Shared: doc_bank_passbook.
    // Total raw references = 6. Unique required = 5.
    const twoSchemes = TEST_SCHEMES_FIXTURE.slice(0, 2);
    const userWithOnlyPassbook: UserDocumentItem[] = [
      {
        canonicalKey: 'doc_bank_passbook',
        documentName: 'Aadhaar-Seeded Bank Account Passbook',
        status: 'AVAILABLE',
      },
    ];

    const metrics = aggregateSchemeDocuments(twoSchemes, userWithOnlyPassbook, {
      referenceDate: FIXED_TEST_DATE,
    });

    assert(metrics.totalUniqueRequired === 5, `Expected 5 unique documents, got ${metrics.totalUniqueRequired}`);
    assert(metrics.availableCount === 1, `Expected 1 available, got ${metrics.availableCount}`);
    assert(metrics.missingCount === 4, `Expected 4 missing, got ${metrics.missingCount}`);
    // 1 / 5 = 20% (if double-counted, it would be 2 / 6 = 33% which is INCORRECT)
    assert(
      metrics.completionPercentage === 20,
      `Expected completion percentage 20%, got ${metrics.completionPercentage}%`
    );

    console.log('✓ Test 3 passed');
  }

  // TEST 4: Automatic Expired Certificate Detection
  {
    console.log('Test 4: Automatic Expiry Detection based on date');
    const metrics = aggregateSchemeDocuments(
      TEST_SCHEMES_FIXTURE,
      FIXTURE_USER_DOCS_AUTO_EXPIRED,
      { referenceDate: FIXED_TEST_DATE }
    );

    const incomeCert = metrics.allUniqueDocuments.find((d) => d.canonicalKey === 'doc_income_cert');
    assert(Boolean(incomeCert), 'Income cert must exist');
    assert(incomeCert?.status === 'EXPIRED', `Expected status EXPIRED, got ${incomeCert?.status}`);
    assert(incomeCert?.isExpiredAutoDetected === true, 'Auto-detected flag must be true');
    assert(metrics.expiredCount >= 1, `Expected at least 1 expired document, got ${metrics.expiredCount}`);

    console.log('✓ Test 4 passed');
  }

  // TEST 5: High-Leverage Recommendation Selection
  {
    console.log('Test 5: High-Leverage Document Recommendation identification');
    // In FIXTURE_USER_DOCS_PARTIAL:
    // doc_bank_passbook is AVAILABLE (leverage 5)
    // doc_income_cert is EXPIRED (leverage 2)
    // All others are missing (leverage 1) or pending
    // High-leverage unfulfilled document must be doc_income_cert!
    const metrics = aggregateSchemeDocuments(
      TEST_SCHEMES_FIXTURE,
      FIXTURE_USER_DOCS_PARTIAL,
      { referenceDate: FIXED_TEST_DATE }
    );

    assert(Boolean(metrics.highLeverageDocument), 'High leverage document should be identified');
    assert(
      metrics.highLeverageDocument?.canonicalKey === 'doc_income_cert',
      `Expected doc_income_cert as top leverage, got ${metrics.highLeverageDocument?.canonicalKey}`
    );
    assert(
      metrics.highLeverageDocument?.leverageCount === 2,
      `Expected leverage count 2, got ${metrics.highLeverageDocument?.leverageCount}`
    );

    console.log('✓ Test 5 passed');
  }

  // TEST 6: In-Progress / Verification Pending Handling
  {
    console.log('Test 6: In-Progress verification tracking');
    const metrics = aggregateSchemeDocuments(
      TEST_SCHEMES_FIXTURE,
      FIXTURE_USER_DOCS_PARTIAL,
      { referenceDate: FIXED_TEST_DATE }
    );

    const domicile = metrics.allUniqueDocuments.find((d) => d.canonicalKey === 'doc_domicile_cert');
    assert(domicile?.status === 'NEEDS_VERIFICATION', 'Domicile cert must be in NEEDS_VERIFICATION');
    assert(metrics.verificationPendingCount >= 1, 'Verification pending count must be >= 1');
    assert(domicile?.notes?.includes('Nada Kacheri') === true, 'Notes must be preserved');

    console.log('✓ Test 6 passed');
  }

  // TEST 7: 100% Ready Profile
  {
    console.log('Test 7: 100% Ready Profile');
    const metrics = aggregateSchemeDocuments(
      TEST_SCHEMES_FIXTURE,
      FIXTURE_USER_DOCS_FULLY_READY,
      { referenceDate: FIXED_TEST_DATE }
    );

    assert(metrics.totalUniqueRequired === 13, 'Total required is 13');
    assert(metrics.availableCount === 13, 'All 13 available');
    assert(metrics.missingCount === 0, '0 missing');
    assert(metrics.expiredCount === 0, '0 expired');
    assert(metrics.completionPercentage === 100, 'Completion percentage is 100%');
    assert(metrics.highLeverageDocument === null, 'No high leverage alert when 100% ready');

    console.log('✓ Test 7 passed');
  }

  // TEST 8: Dual Dimension Evaluation (Statutory Eligibility vs Document Readiness)
  {
    console.log('Test 8: Distinguish Statutory Eligibility vs Document Readiness');

    const fullyReadyMetrics = aggregateSchemeDocuments(
      TEST_SCHEMES_FIXTURE,
      FIXTURE_USER_DOCS_FULLY_READY,
      { referenceDate: FIXED_TEST_DATE }
    );
    const partialMetrics = aggregateSchemeDocuments(
      TEST_SCHEMES_FIXTURE,
      FIXTURE_USER_DOCS_PARTIAL,
      { referenceDate: FIXED_TEST_DATE }
    );

    // Case A: Potentially eligible + 100% documents -> ACTIONABLE_READY
    const resA = evaluateStatutoryVsReadiness('POTENTIALLY_ELIGIBLE', fullyReadyMetrics);
    assert(resA.overallAssessment === 'ACTIONABLE_READY', 'Case A should be ACTIONABLE_READY');

    // Case B: Potentially eligible + Partial documents -> LEGAL_OK_DOCS_MISSING
    const resB = evaluateStatutoryVsReadiness('POTENTIALLY_ELIGIBLE', partialMetrics);
    assert(resB.overallAssessment === 'LEGAL_OK_DOCS_MISSING', 'Case B should be LEGAL_OK_DOCS_MISSING');
    assert(resB.documentReadinessStatus === 'RENEWAL_REQUIRED', 'Has expired income cert');

    // Case C: Legally NOT_ELIGIBLE even if 100% document ready -> INELIGIBLE
    const resC = evaluateStatutoryVsReadiness('NOT_ELIGIBLE', fullyReadyMetrics);
    assert(resC.overallAssessment === 'INELIGIBLE', 'Case C should be INELIGIBLE');
    assert(resC.statutoryStatus === 'NOT_ELIGIBLE', 'Statutory must remain NOT_ELIGIBLE');

    // Case D: Insufficient information in profile -> NEED_MORE_PROFILE_DATA
    const resD = evaluateStatutoryVsReadiness('INSUFFICIENT_INFORMATION', partialMetrics);
    assert(resD.overallAssessment === 'NEED_MORE_PROFILE_DATA', 'Case D should be NEED_MORE_PROFILE_DATA');

    console.log('✓ Test 8 passed');
  }

  // TEST 9: Single Scheme Isolation
  {
    console.log('Test 9: Single Scheme Document Aggregation');
    const pmKisan = [TEST_SCHEMES_FIXTURE[0]]; // PM-Kisan has 3 docs
    const metrics = aggregateSchemeDocuments(pmKisan, FIXTURE_USER_DOCS_PARTIAL, {
      referenceDate: FIXED_TEST_DATE,
    });

    assert(metrics.totalUniqueRequired === 3, 'PM Kisan requires exactly 3 docs');
    assert(metrics.availableCount === 1, 'Only bank passbook is available');
    assert(metrics.missingCount === 2, '2 missing');
    assert(metrics.completionPercentage === 33, '33% readiness for PM-Kisan');

    console.log('✓ Test 9 passed');
  }

  console.log('\n========================================');
  console.log('ALL 9 DOCUMENT INTELLIGENCE TESTS PASSED!');
  console.log('========================================\n');
}

runTests();
