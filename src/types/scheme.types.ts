export type GovernmentLevel = 'CENTRAL' | 'STATE';

export type BeneficiaryCategory =
  | 'STUDENTS'
  | 'FARMERS'
  | 'WOMEN'
  | 'SENIOR_CITIZENS'
  | 'LOW_INCOME'
  | 'PERSONS_WITH_DISABILITIES'
  | 'EMPLOYMENT_SEEKERS'
  | 'HEALTHCARE';

export type ApplicationStatus = 'OPEN' | 'CLOSING_SOON' | 'CLOSED' | 'ALWAYS_ACTIVE';

export type EvaluationStatus =
  | 'POTENTIALLY_ELIGIBLE'
  | 'NOT_ELIGIBLE'
  | 'INSUFFICIENT_INFORMATION';

export type ConditionOperator =
  | 'EQUALS'
  | 'NOT_EQUALS'
  | 'LESS_THAN'
  | 'LESS_THAN_OR_EQUAL'
  | 'GREATER_THAN'
  | 'GREATER_THAN_OR_EQUAL'
  | 'BETWEEN'
  | 'IN'
  | 'CONTAINS';

export interface ConditionRule {
  field: string;
  operator: ConditionOperator;
  value: string | number | boolean | (string | number)[];
  label: string;
}

export interface RuleGroup {
  operator: 'AND' | 'OR';
  conditions: (ConditionRule | RuleGroup)[];
}

export interface ConditionResult {
  ruleId: string;
  field: string;
  label: string;
  status: 'PASSED' | 'FAILED' | 'UNKNOWN';
  userValue?: unknown;
  expectedValue: unknown;
  reason: string;
}

export interface SchemeEvaluationResult {
  schemeId: string;
  status: EvaluationStatus;
  summary: string;
  passedConditions: ConditionResult[];
  failedConditions: ConditionResult[];
  unknownConditions: ConditionResult[];
  missingProfileFields: string[];
}

export interface Scheme {
  id: string;
  slug: string;
  official_name: string;
  short_title: string;
  government_level: GovernmentLevel;
  state_or_ut?: string; // e.g. "Karnataka", "Uttar Pradesh", or undefined for Central
  beneficiary_category: BeneficiaryCategory;
  department_name: string;
  brief_description: string;
  detailed_benefits: string;
  financial_benefit_amount?: number;
  eligibility_rules: RuleGroup;
  official_application_url: string;
  official_portal_name: string;
  official_source_url: string;
  last_verified_at: string; // ISO date
  application_status: ApplicationStatus;
  academic_or_financial_year: string;
  is_active: boolean;
  required_document_keys: string[];
}
