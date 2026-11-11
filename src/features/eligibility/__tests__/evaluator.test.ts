import { evaluateSchemeEligibility } from '../evaluator';
import {
  SCHEME_NATIONAL_SCHOLARSHIP,
  SCHEME_STATE_FARMER_GRANT,
  SCHEME_COMPLEX_INCLUSIVE_LIVELIHOOD,
  APPLICANT_IDEAL_STUDENT,
  APPLICANT_AGE_FAILURE,
  APPLICANT_INCOME_FAILURE,
  APPLICANT_STATE_MISMATCH,
  APPLICANT_MATCHING_MAHARASHTRA_FARMER,
  APPLICANT_FARMER_NO_LAND,
  APPLICANT_NON_FARMER,
  APPLICANT_MISSING_INCOME,
  APPLICANT_MISSING_EDUCATION,
  APPLICANT_MULTIPLE_FAILURES,
  APPLICANT_BOUNDARY_EXACT_MATCH,
  APPLICANT_BOUNDARY_OFF_BY_ONE,
  APPLICANT_OR_BRANCH_BPL,
  APPLICANT_OR_BRANCH_DISABILITY,
  APPLICANT_OR_ALL_FAILED,
} from '../fixtures';

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (!condition) {
    console.error(`❌ FAIL: ${testName}`, detail || '');
    throw new Error(`Test failed: ${testName}`);
  }
  passedTests++;
  console.log(`✅ PASS: ${testName}`);
}

async function runEligibilityUnitTests() {
  console.log('================================================================');
  console.log('SAHAYAK DETERMINISTIC ELIGIBILITY ENGINE — UNIT TEST SUITE');
  console.log('================================================================\n');

  // TEST 1: Fully Matching Applicant
  console.log('--- 1. Fully Matching Applicant Test ---');
  const result1 = evaluateSchemeEligibility(
    'sch-national-scholarship',
    SCHEME_NATIONAL_SCHOLARSHIP,
    APPLICANT_IDEAL_STUDENT,
    'National Scholarship'
  );
  assert(
    result1.status === 'POTENTIALLY_ELIGIBLE',
    'Ideal applicant returns POTENTIALLY_ELIGIBLE',
    `Received: ${result1.status}`
  );
  assert(
    result1.passedConditions.length === 4,
    'All 4 conditions passed',
    `Passed count: ${result1.passedConditions.length}`
  );
  assert(
    result1.failedConditions.length === 0,
    'Zero failed conditions'
  );
  assert(
    result1.unknownConditions.length === 0,
    'Zero unknown conditions'
  );
  assert(
    result1.passedConditions.every((c) => c.explanation.length > 5),
    'Every passed condition includes human-readable explanation'
  );
  assert(
    Boolean(result1.passedConditions[0].sourceReference),
    'Passed condition includes gazette source reference'
  );

  // TEST 2: Age Failure
  console.log('\n--- 2. Age Failure Test ---');
  const result2 = evaluateSchemeEligibility(
    'sch-national-scholarship',
    SCHEME_NATIONAL_SCHOLARSHIP,
    APPLICANT_AGE_FAILURE
  );
  assert(
    result2.status === 'NOT_ELIGIBLE',
    'Age failure applicant returns NOT_ELIGIBLE',
    `Received: ${result2.status}`
  );
  assert(
    result2.failedConditions.some((c) => c.field === 'age'),
    'Age condition is flagged as FAILED'
  );
  assert(
    result2.failedConditions.find((c) => c.field === 'age')!.explanation.includes('Outside allowable bracket'),
    'Age failure explanation clearly states reason'
  );

  // TEST 3: Income Failure
  console.log('\n--- 3. Income Failure Test ---');
  const result3 = evaluateSchemeEligibility(
    'sch-national-scholarship',
    SCHEME_NATIONAL_SCHOLARSHIP,
    APPLICANT_INCOME_FAILURE
  );
  assert(
    result3.status === 'NOT_ELIGIBLE',
    'Income failure applicant returns NOT_ELIGIBLE',
    `Received: ${result3.status}`
  );
  const incomeFail = result3.failedConditions.find((c) => c.field === 'annualFamilyIncome');
  assert(
    Boolean(incomeFail),
    'annualFamilyIncome is flagged as FAILED'
  );
  assert(
    incomeFail!.explanation.includes('exceeds statutory maximum limit'),
    'Income failure explanation identifies ceiling breach'
  );

  // TEST 4: State Domicile Mismatch
  console.log('\n--- 4. State Mismatch Test ---');
  const result4 = evaluateSchemeEligibility(
    'sch-state-farmer-grant',
    SCHEME_STATE_FARMER_GRANT,
    APPLICANT_STATE_MISMATCH
  );
  assert(
    result4.status === 'NOT_ELIGIBLE',
    'Out-of-state applicant returns NOT_ELIGIBLE for state scheme',
    `Received: ${result4.status}`
  );
  const stateFail = result4.failedConditions.find((c) => c.field === 'stateOfResidence');
  assert(
    Boolean(stateFail),
    'stateOfResidence is flagged as FAILED'
  );
  assert(
    stateFail!.explanation.includes('expected "Maharashtra", but profile has "Bihar"'),
    'State mismatch explains expected vs actual state'
  );

  // TEST 5: Matching State Farmer
  console.log('\n--- 5. Matching State Farmer Test ---');
  const result5 = evaluateSchemeEligibility(
    'sch-state-farmer-grant',
    SCHEME_STATE_FARMER_GRANT,
    APPLICANT_MATCHING_MAHARASHTRA_FARMER
  );
  assert(
    result5.status === 'POTENTIALLY_ELIGIBLE',
    'Matching state farmer returns POTENTIALLY_ELIGIBLE',
    `Received: ${result5.status}`
  );
  assert(
    result5.passedConditions.length === 3,
    'State, vocation, and landholding all pass'
  );

  // TEST 6: Missing Income
  console.log('\n--- 6. Missing Income Test ---');
  const result6 = evaluateSchemeEligibility(
    'sch-national-scholarship',
    SCHEME_NATIONAL_SCHOLARSHIP,
    APPLICANT_MISSING_INCOME
  );
  assert(
    result6.status === 'INSUFFICIENT_INFORMATION',
    'Missing income returns INSUFFICIENT_INFORMATION',
    `Received: ${result6.status}`
  );
  assert(
    result6.missingFields.includes('annualFamilyIncome'),
    'missingFields array contains annualFamilyIncome'
  );
  assert(
    result6.failedConditions.length === 0,
    'No condition is marked FAILED when field is simply unprovided'
  );
  assert(
    result6.unknownConditions.some((c) => c.field === 'annualFamilyIncome'),
    'Income condition is explicitly marked UNKNOWN'
  );

  // TEST 7: Missing Education
  console.log('\n--- 7. Missing Education Test ---');
  const result7 = evaluateSchemeEligibility(
    'sch-national-scholarship',
    SCHEME_NATIONAL_SCHOLARSHIP,
    APPLICANT_MISSING_EDUCATION
  );
  assert(
    result7.status === 'INSUFFICIENT_INFORMATION',
    'Missing education returns INSUFFICIENT_INFORMATION',
    `Received: ${result7.status}`
  );
  assert(
    result7.missingFields.includes('educationLevel'),
    'missingFields array contains educationLevel'
  );

  // TEST 8: AND Conditions Resolution
  console.log('\n--- 8. AND Conditions Test ---');
  // In an AND group, 3 pass and 1 fails => group FAILED
  assert(
    result2.status === 'NOT_ELIGIBLE',
    'AND group fails when single mandatory child fails'
  );
  // In an AND group, 3 pass and 1 missing => group UNKNOWN
  assert(
    result6.status === 'INSUFFICIENT_INFORMATION',
    'AND group yields INSUFFICIENT_INFORMATION when child is missing'
  );

  // TEST 9: OR Conditions Resolution
  console.log('\n--- 9. OR Conditions Test ---');
  // Case 9a: Qualifies via BPL branch
  const result9a = evaluateSchemeEligibility(
    'sch-inclusive-livelihood',
    SCHEME_COMPLEX_INCLUSIVE_LIVELIHOOD,
    APPLICANT_OR_BRANCH_BPL
  );
  assert(
    result9a.status === 'POTENTIALLY_ELIGIBLE',
    'OR branch passes via BPL card even though General caste',
    `Received: ${result9a.status}`
  );

  // Case 9b: Qualifies via PWD branch (Disability 50%)
  const result9b = evaluateSchemeEligibility(
    'sch-inclusive-livelihood',
    SCHEME_COMPLEX_INCLUSIVE_LIVELIHOOD,
    APPLICANT_OR_BRANCH_DISABILITY
  );
  assert(
    result9b.status === 'POTENTIALLY_ELIGIBLE',
    'OR branch passes via Disability >= 40% sub-branch',
    `Received: ${result9b.status}`
  );

  // Case 9c: Fails all OR branches
  const result9c = evaluateSchemeEligibility(
    'sch-inclusive-livelihood',
    SCHEME_COMPLEX_INCLUSIVE_LIVELIHOOD,
    APPLICANT_OR_ALL_FAILED
  );
  assert(
    result9c.status === 'NOT_ELIGIBLE',
    'OR group returns NOT_ELIGIBLE when all branches fail',
    `Received: ${result9c.status}`
  );

  // TEST 10: Multiple Failed Conditions
  console.log('\n--- 10. Multiple Failed Conditions Test ---');
  const result10 = evaluateSchemeEligibility(
    'sch-national-scholarship',
    SCHEME_NATIONAL_SCHOLARSHIP,
    APPLICANT_MULTIPLE_FAILURES
  );
  assert(
    result10.status === 'NOT_ELIGIBLE',
    'Multiple failures return NOT_ELIGIBLE'
  );
  assert(
    result10.failedConditions.length >= 2,
    'Reports all failing conditions (both Age and Income fail)',
    `Failed count: ${result10.failedConditions.length}`
  );
  assert(
    result10.failedConditions.some((c) => c.field === 'age') &&
    result10.failedConditions.some((c) => c.field === 'annualFamilyIncome'),
    'Both Age and Income are present in failedConditions list'
  );

  // TEST 11: Conditional Rules (Dependencies)
  console.log('\n--- 11. Conditional Rules Test ---');
  // Case 11a: Farmer who has NO land fails the conditional land rule
  const result11a = evaluateSchemeEligibility(
    'sch-state-farmer-grant',
    SCHEME_STATE_FARMER_GRANT,
    APPLICANT_FARMER_NO_LAND
  );
  assert(
    result11a.status === 'NOT_ELIGIBLE',
    'Farmer without land fails conditional landholding rule'
  );
  assert(
    result11a.failedConditions.some((c) => c.field === 'ownsAgriculturalLand'),
    'ownsAgriculturalLand is flagged as failed for farmer'
  );

  // Case 11b: Non-farmer evaluates conditional rule as NOT_APPLICABLE
  const result11b = evaluateSchemeEligibility(
    'sch-state-farmer-grant',
    SCHEME_STATE_FARMER_GRANT,
    APPLICANT_NON_FARMER
  );
  assert(
    result11b.notApplicableConditions.some((c) => c.field === 'ownsAgriculturalLand'),
    'Non-farmer has ownsAgriculturalLand marked as NOT_APPLICABLE'
  );

  // TEST 12: Boundary Values
  console.log('\n--- 12. Boundary Values Test ---');
  // Case 12a: Exact boundary values (Income == 250,000, Age == 28)
  const result12a = evaluateSchemeEligibility(
    'sch-national-scholarship',
    SCHEME_NATIONAL_SCHOLARSHIP,
    APPLICANT_BOUNDARY_EXACT_MATCH
  );
  assert(
    result12a.status === 'POTENTIALLY_ELIGIBLE',
    'Applicant on exact upper boundaries (income=250000, age=28) is POTENTIALLY_ELIGIBLE',
    `Received: ${result12a.status}`
  );
  assert(
    result12a.passedConditions.find((c) => c.field === 'annualFamilyIncome')?.status === 'PASSED',
    'Income exactly equal to ceiling passes (LESS_THAN_OR_EQUAL)'
  );
  assert(
    result12a.passedConditions.find((c) => c.field === 'age')?.status === 'PASSED',
    'Age exactly equal to max range passes (BETWEEN)'
  );

  // Case 12b: Off-by-one boundary failure (Income == 250,001, Age == 29)
  const result12b = evaluateSchemeEligibility(
    'sch-national-scholarship',
    SCHEME_NATIONAL_SCHOLARSHIP,
    APPLICANT_BOUNDARY_OFF_BY_ONE
  );
  assert(
    result12b.status === 'NOT_ELIGIBLE',
    'Applicant off-by-one above boundary (income=250001, age=29) is NOT_ELIGIBLE',
    `Received: ${result12b.status}`
  );
  assert(
    result12b.failedConditions.some((c) => c.field === 'annualFamilyIncome'),
    'Income of 250,001 fails ceiling of 250,000'
  );
  assert(
    result12b.failedConditions.some((c) => c.field === 'age'),
    'Age of 29 fails range [17, 28]'
  );

  // TEST 13: Database Eligibility Rules Parsing (Supabase Format)
  console.log('\n--- 13. Database Eligibility Rules Parsing Test ---');
  const mockDbRules = [
    {
      id: 'db-rule-1',
      field: 'annual_family_income',
      operator: 'LESS_THAN_OR_EQUAL',
      expected_value: 200000,
      rule_group: 'default',
      logical_relationship: 'AND',
      label: 'Family Income <= 2 Lakh',
      is_mandatory: true,
    },
    {
      id: 'db-rule-2',
      field: 'is_student',
      operator: 'EQUALS',
      expected_value: true,
      rule_group: 'default',
      logical_relationship: 'AND',
      label: 'Enrolled Student',
      is_mandatory: true,
    },
  ];
  const dbResult = evaluateSchemeEligibility(
    'sch-db-test',
    mockDbRules,
    { annualFamilyIncome: 180000, isStudent: true }
  );
  assert(
    dbResult.status === 'POTENTIALLY_ELIGIBLE',
    'buildRuleGroupFromDbRules seamlessly parses Supabase table rows'
  );
  assert(
    dbResult.passedConditions.length === 2,
    'Both DB rules passed'
  );

  console.log('\n================================================================');
  console.log(`ALL TESTS PASSED: ${passedTests} / ${totalTests} assertions verified!`);
  console.log('================================================================\n');
}

runEligibilityUnitTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED WITH EXCEPTION:', err);
  process.exit(1);
});
