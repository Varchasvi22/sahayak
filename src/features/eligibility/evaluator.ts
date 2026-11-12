import {
  ApplicantProfileInput,
  AtomicRule,
  RuleGroupNode,
  ConditionEvaluation,
  SchemeEvaluationResult,
  EvaluationStatus,
  ConditionStatus,
} from './types';
import { evaluateOperator } from './operators';

/**
 * Resolve profile field with support for both snake_case and camelCase
 */
export function resolveProfileValue(
  profile: ApplicantProfileInput,
  fieldName: string
): { value: unknown; isProvided: boolean } {
  if (!profile) return { value: null, isProvided: false };

  // Helper to convert snake_case to camelCase
  const toCamel = (str: string) =>
    str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());

  // Helper to convert camelCase to snake_case
  const toSnake = (str: string) =>
    str.replace(/([A-Z])/g, '_$1').toLowerCase();

  const camelKey = toCamel(fieldName);
  const snakeKey = toSnake(fieldName);

  const candidates = [fieldName, camelKey, snakeKey];

  for (const key of candidates) {
    if (key in profile && profile[key] !== undefined && profile[key] !== null) {
      const val = profile[key];
      // Empty string is treated as not provided
      if (typeof val === 'string' && val.trim() === '') {
        return { value: null, isProvided: false };
      }
      return { value: val, isProvided: true };
    }
  }

  // Check in additionalAttributes or additional_attributes
  const extra = profile.additionalAttributes || profile.additional_attributes;
  if (extra && typeof extra === 'object') {
    for (const key of candidates) {
      if (key in extra && (extra as any)[key] !== undefined && (extra as any)[key] !== null) {
        const val = (extra as any)[key];
        if (typeof val === 'string' && val.trim() === '') {
          return { value: null, isProvided: false };
        }
        return { value: val, isProvided: true };
      }
    }
  }

  return { value: null, isProvided: false };
}

/**
 * Human-friendly field label generator
 */
export function getFriendlyFieldLabel(field: string): string {
  const map: Record<string, string> = {
    age: 'Applicant Age',
    dateOfBirth: 'Date of Birth',
    date_of_birth: 'Date of Birth',
    gender: 'Gender',
    stateOfResidence: 'State of Residence',
    state_of_residence: 'State of Residence',
    district: 'District of Residence',
    residenceArea: 'Residence Area Type',
    residence_area: 'Residence Area Type',
    annualFamilyIncome: 'Annual Household Income',
    annual_family_income: 'Annual Household Income',
    socialCategory: 'Social Category (Community)',
    social_category: 'Social Category (Community)',
    educationLevel: 'Highest Completed Education',
    education_level: 'Highest Completed Education',
    isStudent: 'Enrolled Student Status',
    is_student: 'Enrolled Student Status',
    employmentStatus: 'Employment / Vocational Status',
    employment_status: 'Employment / Vocational Status',
    ownsAgriculturalLand: 'Agricultural Landholding',
    owns_agricultural_land: 'Agricultural Landholding',
    hasBplCard: 'BPL / NFSA Priority Ration Card',
    has_bpl_card: 'BPL / NFSA Priority Ration Card',
    isDifferentlyAbled: 'Benchmark Disability (Divyangjan)',
    is_differently_abled: 'Benchmark Disability (Divyangjan)',
    disabilityPercentage: 'Disability Percentage',
    disability_percentage: 'Disability Percentage',
    hasUdidCard: 'Swavlamban UDID Card Possession',
    has_udid_card: 'Swavlamban UDID Card Possession',
  };

  return map[field] || field.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Evaluate an atomic rule against an applicant profile
 */
export function evaluateAtomicRule(
  rule: AtomicRule,
  profile: ApplicantProfileInput
): ConditionEvaluation {
  const isMandatory = rule.isMandatory !== false;
  const label = rule.label || getFriendlyFieldLabel(rule.field);

  // 1. Check rule dependency (Conditional Requirement)
  if (rule.dependsOn) {
    const depResolution = resolveProfileValue(profile, rule.dependsOn.field);
    if (!depResolution.isProvided) {
      // The condition depends on an unprovided field
      return {
        ruleId: rule.id,
        field: rule.field,
        operator: rule.operator,
        expectedValue: rule.expectedValue,
        actualValue: null,
        status: 'UNKNOWN',
        isMandatory,
        label,
        explanation: `Condition depends on unprovided prerequisite "${getFriendlyFieldLabel(
          rule.dependsOn.field
        )}".`,
        sourceReference: rule.sourceReference || undefined,
      };
    }

    const depCheck = evaluateOperator(
      rule.dependsOn.operator,
      depResolution.value,
      rule.dependsOn.value,
      rule.dependsOn.field,
      rule.dependsOn.field
    );

    if (!depCheck.passed) {
      // The prerequisite condition does not apply to this applicant
      return {
        ruleId: rule.id,
        field: rule.field,
        operator: rule.operator,
        expectedValue: rule.expectedValue,
        actualValue: null,
        status: 'NOT_APPLICABLE',
        isMandatory,
        label,
        explanation: `Not applicable: Conditional rule prerequisite (${getFriendlyFieldLabel(
          rule.dependsOn.field
        )} != ${String(rule.dependsOn.value)}) does not apply.`,
        sourceReference: rule.sourceReference || undefined,
      };
    }
  }

  // 2. Resolve field value from applicant profile
  const expectedVal =
    rule.expectedValue !== undefined
      ? rule.expectedValue
      : (rule as any).value !== undefined
      ? (rule as any).value
      : (rule as any).expected_value;

  const resolution = resolveProfileValue(profile, rule.field);

  if (!resolution.isProvided) {
    return {
      ruleId: rule.id,
      field: rule.field,
      operator: rule.operator,
      expectedValue: expectedVal,
      actualValue: null,
      status: 'UNKNOWN',
      isMandatory,
      label,
      explanation: `Information missing: "${label}" has not been provided in applicant profile.`,
      sourceReference: rule.sourceReference || undefined,
    };
  }

  // 3. Evaluate atomic operator
  const opResult = evaluateOperator(
    rule.operator,
    resolution.value,
    expectedVal,
    label,
    rule.field
  );

  return {
    ruleId: rule.id,
    field: rule.field,
    operator: rule.operator,
    expectedValue: expectedVal,
    actualValue: resolution.value,
    status: opResult.passed ? 'PASSED' : 'FAILED',
    isMandatory,
    label,
    explanation: opResult.explanation,
    sourceReference: rule.sourceReference || undefined,
  };
}

/**
 * Internal result for tree group evaluation
 */
interface GroupEvaluationOutcome {
  status: ConditionStatus;
  conditions: ConditionEvaluation[];
}

/**
 * Recursively evaluate a complex rule group node with 3-valued logic
 */
export function evaluateRuleNode(
  node: AtomicRule | RuleGroupNode,
  profile: ApplicantProfileInput
): GroupEvaluationOutcome {
  // Base case: Atomic Rule
  if ('field' in node) {
    const evalResult = evaluateAtomicRule(node, profile);
    return {
      status: evalResult.status,
      conditions: [evalResult],
    };
  }

  // Recursive case: Rule Group (AND / OR)
  const childOutcomes: GroupEvaluationOutcome[] = node.rules.map((child) =>
    evaluateRuleNode(child, profile)
  );

  const allConditions: ConditionEvaluation[] = childOutcomes.flatMap(
    (c) => c.conditions
  );

  // Filter out NOT_APPLICABLE conditions when resolving group logic
  const activeStatuses = childOutcomes.map((c) => c.status);
  const nonNaStatuses = activeStatuses.filter((s) => s !== 'NOT_APPLICABLE');

  if (nonNaStatuses.length === 0) {
    return {
      status: 'NOT_APPLICABLE',
      conditions: allConditions,
    };
  }

  if (node.operator === 'AND') {
    // AND logic:
    // - Fails if ANY child fails
    // - Unknown if NO child fails, but at least one is unknown
    // - Passes if ALL non-NA children pass
    if (nonNaStatuses.includes('FAILED')) {
      return { status: 'FAILED', conditions: allConditions };
    }
    if (nonNaStatuses.includes('UNKNOWN')) {
      return { status: 'UNKNOWN', conditions: allConditions };
    }
    return { status: 'PASSED', conditions: allConditions };
  } else {
    // OR logic:
    // - Passes if AT LEAST ONE child passes
    // - Unknown if NO child passes, but at least one child is unknown (could turn into a pass)
    // - Fails if ALL non-NA children fail
    if (nonNaStatuses.includes('PASSED')) {
      return { status: 'PASSED', conditions: allConditions };
    }
    if (nonNaStatuses.includes('UNKNOWN')) {
      return { status: 'UNKNOWN', conditions: allConditions };
    }
    return { status: 'FAILED', conditions: allConditions };
  }
}

/**
 * Convert an array of database eligibility rules (from Supabase eligibility_rules table)
 * into a structured rule group node.
 */
export function buildRuleGroupFromDbRules(
  dbRules: Array<{
    id: string;
    field: string;
    operator: string;
    expected_value: unknown;
    rule_group?: string | null;
    logical_relationship?: string | null;
    label?: string | null;
    is_mandatory?: boolean | null;
  }>
): RuleGroupNode {
  if (dbRules.length === 0) {
    return { operator: 'AND', rules: [] };
  }

  // Determine top-level logical relationship from rules
  const hasOr = dbRules.some(
    (r) => r.logical_relationship?.toUpperCase() === 'OR'
  );
  const operator: 'AND' | 'OR' = hasOr ? 'OR' : 'AND';

  const atomicRules: AtomicRule[] = dbRules.map((r) => ({
    id: r.id,
    field: r.field,
    operator: r.operator as any,
    expectedValue: r.expected_value,
    label: r.label,
    isMandatory: r.is_mandatory !== false,
  }));

  return {
    operator,
    rules: atomicRules,
  };
}

/**
 * Main Deterministic Eligibility Evaluation Entry Point
 */
export function evaluateSchemeEligibility(
  schemeId: string,
  rulesInput: AtomicRule[] | RuleGroupNode | Array<any>,
  profile: ApplicantProfileInput,
  schemeName?: string
): SchemeEvaluationResult {
  const evaluatedAt = new Date().toISOString();

  // Normalize input into a RuleGroupNode
  let rootNode: RuleGroupNode;
  if ('operator' in rulesInput && 'rules' in rulesInput) {
    rootNode = rulesInput as RuleGroupNode;
  } else if (Array.isArray(rulesInput)) {
    if (rulesInput.length > 0 && 'expected_value' in (rulesInput[0] as any)) {
      // From Supabase DB format
      rootNode = buildRuleGroupFromDbRules(rulesInput as any);
    } else {
      // Array of AtomicRules
      rootNode = {
        operator: 'AND',
        rules: rulesInput as AtomicRule[],
      };
    }
  } else {
    rootNode = { operator: 'AND', rules: [] };
  }

  // Empty rules case: No statutory restrictions recorded
  if (rootNode.rules.length === 0) {
    return {
      schemeId,
      schemeName,
      status: 'POTENTIALLY_ELIGIBLE',
      summary: 'No statutory eligibility exclusions recorded for this scheme.',
      passedConditions: [],
      failedConditions: [],
      unknownConditions: [],
      notApplicableConditions: [],
      missingFields: [],
      evaluatedAt,
    };
  }

  // Evaluate the rule tree
  const outcome = evaluateRuleNode(rootNode, profile);

  // Partition condition evaluations
  const passedConditions = outcome.conditions.filter((c) => c.status === 'PASSED');
  const failedConditions = outcome.conditions.filter((c) => c.status === 'FAILED');
  const unknownConditions = outcome.conditions.filter((c) => c.status === 'UNKNOWN');
  const notApplicableConditions = outcome.conditions.filter(
    (c) => c.status === 'NOT_APPLICABLE'
  );

  // Collect missing fields uniquely
  const missingFields = Array.from(
    new Set(unknownConditions.map((c) => c.field))
  );

  // Determine overall status based on strict civic-tech logic:
  // 1. Any confirmed failed mandatory condition => NOT_ELIGIBLE
  // 2. If no failure, but required fields are missing => INSUFFICIENT_INFORMATION
  // 3. Only if all conditions pass => POTENTIALLY_ELIGIBLE
  let overallStatus: EvaluationStatus;
  let summary: string;

  if (outcome.status === 'FAILED') {
    overallStatus = 'NOT_ELIGIBLE';
    const failedLabels = failedConditions
      .filter((c) => c.isMandatory)
      .map((c) => c.label)
      .slice(0, 2)
      .join(', ');
    summary = `Applicant does not meet mandatory criteria (${failedLabels || 'Statutory condition failed'}).`;
  } else if (outcome.status === 'UNKNOWN') {
    overallStatus = 'INSUFFICIENT_INFORMATION';
    const missingLabels = missingFields.map(getFriendlyFieldLabel).slice(0, 2).join(', ');
    summary = `Missing information: Please provide ${missingLabels || 'required details'} to verify eligibility.`;
  } else {
    overallStatus = 'POTENTIALLY_ELIGIBLE';
    summary = `Applicant meets all ${passedConditions.length} evaluated statutory eligibility conditions.`;
  }

  // If overall outcome has passed, any missing fields from unchosen OR branches do not block eligibility
  const finalMissingFields = overallStatus === 'POTENTIALLY_ELIGIBLE' ? [] : missingFields;

  return {
    schemeId,
    schemeName,
    status: overallStatus,
    summary,
    passedConditions,
    failedConditions,
    unknownConditions,
    notApplicableConditions,
    missingFields: finalMissingFields,
    evaluatedAt,
  };
}
