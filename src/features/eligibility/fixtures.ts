import { ApplicantProfileInput, RuleGroupNode } from './types';

// ==============================================================================
// 1. FICTIONAL TEST SCHEMES
// ==============================================================================

/**
 * Scheme 1: National Higher Education Scholarship (Strict AND rules)
 * Rules:
 * 1. Annual family income <= 250,000 (Income ceiling)
 * 2. Enrolled student == true (Student status)
 * 3. Age between 17 and 28 (Age range)
 * 4. Education level IN ['CLASS_12_PASS', 'GRADUATE'] (Education)
 */
export const SCHEME_NATIONAL_SCHOLARSHIP: RuleGroupNode = {
  operator: 'AND',
  rules: [
    {
      id: 'rule-scholarship-income',
      field: 'annualFamilyIncome',
      operator: 'LESS_THAN_OR_EQUAL',
      expectedValue: 250000,
      label: 'Family Income Ceiling (₹2.5 Lakh)',
      isMandatory: true,
      sourceReference: 'Ministry of Education Guidelines 2026, Clause 4.1',
    },
    {
      id: 'rule-scholarship-student',
      field: 'isStudent',
      operator: 'EQUALS',
      expectedValue: true,
      label: 'Enrolled Student Requirement',
      isMandatory: true,
      sourceReference: 'Ministry of Education Guidelines 2026, Clause 3.2',
    },
    {
      id: 'rule-scholarship-age',
      field: 'age',
      operator: 'BETWEEN',
      expectedValue: [17, 28],
      label: 'Eligible Age Bracket (17 - 28 Years)',
      isMandatory: true,
      sourceReference: 'Ministry of Education Guidelines 2026, Clause 2.1',
    },
    {
      id: 'rule-scholarship-edu',
      field: 'educationLevel',
      operator: 'IN',
      expectedValue: ['CLASS_12_PASS', 'GRADUATE'],
      label: 'Eligible Education Stage (12th Pass or Bachelor)',
      isMandatory: true,
      sourceReference: 'Ministry of Education Guidelines 2026, Clause 5.3',
    },
  ],
};

/**
 * Scheme 2: State Domicile Farmer Assistance (State Domicile + Conditional Landholding)
 * Rules:
 * 1. State of residence == 'Maharashtra'
 * 2. Employment status == 'FARMER'
 * 3. Conditional: IF employmentStatus == 'FARMER', ownsAgriculturalLand must be true
 */
export const SCHEME_STATE_FARMER_GRANT: RuleGroupNode = {
  operator: 'AND',
  rules: [
    {
      id: 'rule-state-domicile',
      field: 'stateOfResidence',
      operator: 'EQUALS',
      expectedValue: 'Maharashtra',
      label: 'Maharashtra State Domicile',
      isMandatory: true,
      sourceReference: 'Govt of Maharashtra Gazette 2026/89',
    },
    {
      id: 'rule-farmer-vocation',
      field: 'employmentStatus',
      operator: 'EQUALS',
      expectedValue: 'FARMER',
      label: 'Farmer Occupation',
      isMandatory: true,
    },
    {
      id: 'rule-agri-land-conditional',
      field: 'ownsAgriculturalLand',
      operator: 'EQUALS',
      expectedValue: true,
      label: 'Cultivable Agricultural Landholding',
      isMandatory: true,
      dependsOn: {
        field: 'employmentStatus',
        operator: 'EQUALS',
        value: 'FARMER',
      },
      sourceReference: 'Maharashtra Agri Tenancy Code, Sec 12',
    },
  ],
};

/**
 * Scheme 3: Inclusive Livelihood Guarantee (Complex Nested AND / OR groups)
 * Rule Logic:
 * (Annual Family Income <= 300,000)
 * AND
 * (
 *   (Social Category IN ['SC', 'ST'])
 *   OR
 *   (Has BPL Card == true)
 *   OR
 *   (Benchmark Disability == true AND Disability Percentage >= 40)
 * )
 */
export const SCHEME_COMPLEX_INCLUSIVE_LIVELIHOOD: RuleGroupNode = {
  operator: 'AND',
  rules: [
    {
      id: 'rule-livelihood-income',
      field: 'annualFamilyIncome',
      operator: 'LESS_THAN_OR_EQUAL',
      expectedValue: 300000,
      label: 'Low-Income Ceiling (₹3 Lakh)',
      isMandatory: true,
    },
    {
      operator: 'OR',
      rules: [
        {
          id: 'rule-or-affirmative-caste',
          field: 'socialCategory',
          operator: 'IN',
          expectedValue: ['SC', 'ST'],
          label: 'Affirmative Action Community (SC / ST)',
          isMandatory: true,
        },
        {
          id: 'rule-or-bpl-card',
          field: 'hasBplCard',
          operator: 'EQUALS',
          expectedValue: true,
          label: 'Active NFSA BPL / Antyodaya Ration Card',
          isMandatory: true,
        },
        {
          operator: 'AND',
          rules: [
            {
              id: 'rule-or-pwd',
              field: 'isDifferentlyAbled',
              operator: 'EQUALS',
              expectedValue: true,
              label: 'Divyangjan Disability Status',
              isMandatory: true,
            },
            {
              id: 'rule-or-pwd-pct',
              field: 'disabilityPercentage',
              operator: 'GREATER_THAN_OR_EQUAL',
              expectedValue: 40,
              label: 'Benchmark Disability (≥ 40%)',
              isMandatory: true,
              dependsOn: {
                field: 'isDifferentlyAbled',
                operator: 'EQUALS',
                value: true,
              },
            },
          ],
        },
      ],
    },
  ],
};

// ==============================================================================
// 2. FICTIONAL APPLICANT PROFILES
// ==============================================================================

/**
 * Applicant A: Ideal Matching Student
 */
export const APPLICANT_IDEAL_STUDENT: ApplicantProfileInput = {
  fullName: 'Arun Verma',
  age: 20,
  gender: 'MALE',
  stateOfResidence: 'Uttar Pradesh',
  annualFamilyIncome: 150000,
  educationLevel: 'CLASS_12_PASS',
  isStudent: true,
  socialCategory: 'OBC',
  employmentStatus: 'STUDENT',
  hasBplCard: false,
};

/**
 * Applicant B: Age Failure (Too old for student scholarship, age 32 > 28)
 */
export const APPLICANT_AGE_FAILURE: ApplicantProfileInput = {
  ...APPLICANT_IDEAL_STUDENT,
  fullName: 'Ramesh Patel',
  age: 32,
};

/**
 * Applicant C: Income Failure (Income ₹4,00,000 exceeds ₹2,50,000 ceiling)
 */
export const APPLICANT_INCOME_FAILURE: ApplicantProfileInput = {
  ...APPLICANT_IDEAL_STUDENT,
  fullName: 'Kavita Singh',
  annualFamilyIncome: 400000,
};

/**
 * Applicant D: State Domicile Mismatch (Resident of Bihar applying for Maharashtra scheme)
 */
export const APPLICANT_STATE_MISMATCH: ApplicantProfileInput = {
  fullName: 'Vijay Kumar',
  age: 45,
  stateOfResidence: 'Bihar',
  employmentStatus: 'FARMER',
  ownsAgriculturalLand: true,
  annualFamilyIncome: 120000,
};

/**
 * Applicant E: Matching Maharashtra Farmer
 */
export const APPLICANT_MATCHING_MAHARASHTRA_FARMER: ApplicantProfileInput = {
  fullName: 'Sanjay Shinde',
  age: 42,
  stateOfResidence: 'Maharashtra',
  employmentStatus: 'FARMER',
  ownsAgriculturalLand: true,
  annualFamilyIncome: 140000,
};

/**
 * Applicant F: Conditional Failure (Farmer who does NOT own agricultural land)
 */
export const APPLICANT_FARMER_NO_LAND: ApplicantProfileInput = {
  fullName: 'Babu Rao',
  age: 38,
  stateOfResidence: 'Maharashtra',
  employmentStatus: 'FARMER',
  ownsAgriculturalLand: false,
  annualFamilyIncome: 100000,
};

/**
 * Applicant G: Non-Farmer (Conditional Land Rule does NOT apply)
 */
export const APPLICANT_NON_FARMER: ApplicantProfileInput = {
  fullName: 'Meera Deshmukh',
  age: 30,
  stateOfResidence: 'Maharashtra',
  employmentStatus: 'SALARIED_PRIVATE',
  ownsAgriculturalLand: false,
  annualFamilyIncome: 250000,
};

/**
 * Applicant H: Missing Income (Income field is null/unprovided)
 */
export const APPLICANT_MISSING_INCOME: ApplicantProfileInput = {
  ...APPLICANT_IDEAL_STUDENT,
  fullName: 'Deepak Joshi',
  annualFamilyIncome: null,
};

/**
 * Applicant I: Missing Education (Education level is empty)
 */
export const APPLICANT_MISSING_EDUCATION: ApplicantProfileInput = {
  ...APPLICANT_IDEAL_STUDENT,
  fullName: 'Ananya Roy',
  educationLevel: null,
};

/**
 * Applicant J: Multiple Failures (Both Age and Income fail)
 */
export const APPLICANT_MULTIPLE_FAILURES: ApplicantProfileInput = {
  ...APPLICANT_IDEAL_STUDENT,
  fullName: 'Sudhir Gupta',
  age: 35, // Fails: > 28
  annualFamilyIncome: 550000, // Fails: > 250,000
};

/**
 * Applicant K: Boundary Exact Match (Income exactly ₹250,000, Age exactly 28)
 */
export const APPLICANT_BOUNDARY_EXACT_MATCH: ApplicantProfileInput = {
  ...APPLICANT_IDEAL_STUDENT,
  fullName: 'Pooja Nair',
  age: 28, // Boundary: exactly max
  annualFamilyIncome: 250000, // Boundary: exactly max
};

/**
 * Applicant L: Boundary Off-By-One Failures
 */
export const APPLICANT_BOUNDARY_OFF_BY_ONE: ApplicantProfileInput = {
  ...APPLICANT_IDEAL_STUDENT,
  fullName: 'Nitin Sharma',
  age: 29, // Boundary fail: 29 > 28
  annualFamilyIncome: 250001, // Boundary fail: 250001 > 250000
};

/**
 * Applicant M: Qualifies via OR branch (General category, but holds BPL card)
 */
export const APPLICANT_OR_BRANCH_BPL: ApplicantProfileInput = {
  fullName: 'Alok Mishra',
  annualFamilyIncome: 180000,
  socialCategory: 'GENERAL', // Caste branch fails
  hasBplCard: true, // BPL branch passes
  isDifferentlyAbled: false,
};

/**
 * Applicant N: Qualifies via OR branch (Disability 50%)
 */
export const APPLICANT_OR_BRANCH_DISABILITY: ApplicantProfileInput = {
  fullName: 'Sunita Sen',
  annualFamilyIncome: 190000,
  socialCategory: 'GENERAL',
  hasBplCard: false,
  isDifferentlyAbled: true,
  disabilityPercentage: 50, // PWD sub-branch passes
};

/**
 * Applicant O: Fails all OR branches
 */
export const APPLICANT_OR_ALL_FAILED: ApplicantProfileInput = {
  fullName: 'Ravi Kumar',
  annualFamilyIncome: 220000,
  socialCategory: 'GENERAL', // Fails
  hasBplCard: false, // Fails
  isDifferentlyAbled: false, // Fails
};
