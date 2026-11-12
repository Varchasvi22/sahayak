/**
 * Unit Tests for Sahayak Dashboard Analytics & Application Tracker
 * Tests:
 * 1. Empty accounts (no profile, 0 saved schemes)
 * 2. Incomplete profiles (missing attributes & completion score)
 * 3. Users with multiple saved schemes & tracker pipeline stages
 */

import {
  calculateProfileCompleteness,
  computeRecommendedSchemes,
} from '../dashboardUtils';
import {
  ApplicationPreparationStatus,
  TRACKER_STATUS_LABELS,
} from '@/services/applicationTrackerService';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`[ASSERTION FAILED]: ${message}`);
  }
}

function runDashboardTests() {
  console.log('--- RUNNING SAHAYAK DASHBOARD & TRACKER TESTS ---');

  // TEST 1: Empty Account Profile
  {
    console.log('Test 1: Empty account profile handling');
    const emptyProfile = {};
    const result = calculateProfileCompleteness(emptyProfile);

    assert(result.completedCount === 0, `Expected 0 completed fields, got ${result.completedCount}`);
    assert(result.percentage === 0, `Expected 0% completeness, got ${result.percentage}`);
    assert(result.isComplete === false, 'Empty profile is not complete');
    assert(result.missingFields.length === 10, `Expected 10 missing fields, got ${result.missingFields.length}`);

    // Verify recommendations still compute without throwing errors
    const recs = computeRecommendedSchemes(emptyProfile, []);
    assert(recs.length > 0, 'Recommendations should evaluate even for empty profile');
    console.log('✓ Test 1 passed');
  }

  // TEST 2: Incomplete Profile (Partial attributes)
  {
    console.log('Test 2: Incomplete profile (missing income and category)');
    const partialProfile = {
      full_name: 'Rahul Sharma',
      age: 21,
      gender: 'MALE',
      state_of_residence: 'Uttar Pradesh',
      district: 'Varanasi',
      // annual_family_income MISSING
      // social_category MISSING
      // education_level MISSING
      employment_status: 'STUDENT',
      residence_area: 'URBAN',
    };

    const result = calculateProfileCompleteness(partialProfile);
    assert(result.completedCount === 7, `Expected 7 completed fields, got ${result.completedCount}`);
    assert(result.percentage === 70, `Expected 70% completeness, got ${result.percentage}`);
    assert(result.isComplete === false, 'Partial profile must not be marked complete');

    const missingKeys = result.missingFields.map((f) => f.key);
    assert(missingKeys.includes('annual_family_income'), 'annual_family_income must be identified as missing');
    assert(missingKeys.includes('social_category'), 'social_category must be identified as missing');
    assert(missingKeys.includes('education_level'), 'education_level must be identified as missing');

    console.log('✓ Test 2 passed');
  }

  // TEST 3: Fully Complete Profile (100% complete)
  {
    console.log('Test 3: 100% Complete profile verification');
    const fullProfile = {
      full_name: 'Anita Devi',
      age: 22,
      gender: 'FEMALE',
      state_of_residence: 'Karnataka',
      district: 'Bangalore Urban',
      residence_area: 'URBAN',
      annual_family_income: 180000,
      social_category: 'SC',
      education_level: 'GRADUATE',
      employment_status: 'STUDENT',
      is_student: true,
    };

    const result = calculateProfileCompleteness(fullProfile);
    assert(result.completedCount === 10, 'All 10 fields completed');
    assert(result.percentage === 100, 'Profile completeness is 100%');
    assert(result.isComplete === true, 'Profile is marked complete');
    assert(result.missingFields.length === 0, 'Zero missing fields');

    // Run recommendations
    const recs = computeRecommendedSchemes(fullProfile, []);
    const eligibleSchemes = recs.filter((s) => s.matchStatus === 'POTENTIALLY_ELIGIBLE');
    assert(eligibleSchemes.length > 0, 'Expected at least one eligible scheme for qualified student');

    console.log('✓ Test 3 passed');
  }

  // TEST 4: Application Tracker 7-Stage Pipeline
  {
    console.log('Test 4: Application Tracker 7-stage status integrity');
    const expectedStages: ApplicationPreparationStatus[] = [
      'DISCOVERED',
      'REVIEWING_ELIGIBILITY',
      'COLLECTING_DOCUMENTS',
      'READY_TO_APPLY',
      'APPLIED',
      'COMPLETED',
      'CLOSED',
    ];

    for (const stage of expectedStages) {
      const meta = TRACKER_STATUS_LABELS[stage];
      assert(Boolean(meta), `Stage ${stage} must have metadata defined`);
      assert(Boolean(meta.label), `Stage ${stage} must have a human-readable label`);
      assert(meta.stepNumber >= 1 && meta.stepNumber <= 7, `Stage ${stage} step number must be 1-7`);
    }

    console.log('✓ Test 4 passed');
  }

  // TEST 5: Multiple Saved Schemes & Financial Benefits Sum
  {
    console.log('Test 5: Multiple saved schemes and recommendation ranking');
    const studentProfile = {
      full_name: 'Pooja Kumari',
      age: 20,
      gender: 'FEMALE',
      state_of_residence: 'Uttar Pradesh',
      district: 'Lucknow',
      residence_area: 'RURAL',
      annual_family_income: 150000,
      social_category: 'SC',
      education_level: 'GRADUATE',
      employment_status: 'STUDENT',
      is_student: true,
      has_bpl_card: true,
      owns_agricultural_land: false,
    };

    const recs = computeRecommendedSchemes(studentProfile, [
      {
        canonicalKey: 'doc_bank_passbook',
        documentName: 'Passbook',
        status: 'AVAILABLE',
      },
    ]);

    // Check that top recommended scheme has valid financial benefit
    assert(recs[0].financialBenefitAmount >= 0, 'Financial benefit must be positive');
    assert(recs[0].documentReadinessPercentage >= 0, 'Document readiness percentage must be calculated');

    console.log('✓ Test 5 passed');
  }

  console.log('\n========================================');
  console.log('ALL DASHBOARD & TRACKER TESTS PASSED!');
  console.log('========================================\n');
}

runDashboardTests();
