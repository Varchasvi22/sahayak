/**
 * SAHAYAK Deterministic Eligibility Engine Types
 * Pure TypeScript types for database-driven, configurable eligibility rules
 */

export type EvaluationStatus =
  | 'POTENTIALLY_ELIGIBLE'
  | 'NOT_ELIGIBLE'
  | 'INSUFFICIENT_INFORMATION';

export type ConditionStatus =
  | 'PASSED'
  | 'FAILED'
  | 'UNKNOWN'
  | 'NOT_APPLICABLE';

export type ConditionOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'BETWEEN'
  | 'IN'
  | 'NOT_IN'
  | 'CONTAINS';

export type LogicalOperator = 'AND' | 'OR';

/**
 * Normalized profile data used by the evaluator
 */
export interface ApplicantProfileInput {
  id?: string;
  fullName?: string | null;
  age?: number | null;
  dateOfBirth?: string | null;
  gender?: string | null;
  stateOfResidence?: string | null;
  district?: string | null;
  residenceArea?: 'RURAL' | 'URBAN' | 'SEMI_URBAN' | string | null;
  annualFamilyIncome?: number | null;
  socialCategory?: string | null;
  educationLevel?: string | null;
  isStudent?: boolean | null;
  employmentStatus?: string | null;
  occupation?: string | null;
  ownsAgriculturalLand?: boolean | null;
  hasBplCard?: boolean | null;
  isDifferentlyAbled?: boolean | null;
  disabilityPercentage?: number | null;
  hasUdidCard?: boolean | null;
  beneficiaryCategories?: string[] | null;
  additionalAttributes?: Record<string, unknown> | null;
  [key: string]: unknown;
}

/**
 * Antecedent condition for conditional/dependent rules
 * (e.g. IF employmentStatus == 'FARMER', THEN ownsAgriculturalLand must be true)
 */
export interface RuleDependency {
  field: string;
  operator: ConditionOperator;
  value: unknown;
}

/**
 * Atomic eligibility condition rule
 */
export interface AtomicRule {
  id: string;
  field: string;
  operator: ConditionOperator;
  expectedValue: unknown;
  label?: string | null;
  isMandatory?: boolean;
  description?: string | null;
  sourceReference?: string | null;
  dependsOn?: RuleDependency | null;
}

/**
 * Hierarchical Rule Group with AND / OR operator
 */
export interface RuleGroupNode {
  operator: LogicalOperator;
  isMandatory?: boolean;
  rules: (AtomicRule | RuleGroupNode)[];
}

/**
 * Detailed evaluation audit of a single atomic condition
 */
export interface ConditionEvaluation {
  ruleId: string;
  field: string;
  operator: ConditionOperator;
  expectedValue: unknown;
  actualValue: unknown;
  status: ConditionStatus;
  isMandatory: boolean;
  label: string;
  explanation: string;
  sourceReference?: string;
}

/**
 * Final deterministic scheme evaluation output
 */
export interface SchemeEvaluationResult {
  schemeId: string;
  schemeName?: string;
  status: EvaluationStatus;
  summary: string;
  passedConditions: ConditionEvaluation[];
  failedConditions: ConditionEvaluation[];
  unknownConditions: ConditionEvaluation[];
  notApplicableConditions: ConditionEvaluation[];
  missingFields: string[];
  evaluatedAt: string;
}
