/**
 * SAHAYAK Scheme Verification & Validation Engine
 *
 * Enforces mandatory statutory verification criteria before any welfare
 * initiative can be transitioned to VERIFIED / published state.
 */

import {
  SchemeFormData,
  SchemeRuleInput,
  SchemeDocumentInput,
  SchemeSourceInput,
  VerificationValidationResult,
} from './types';

const VALID_OPERATORS = [
  'EQUALS',
  'NOT_EQUALS',
  'LESS_THAN',
  'LESS_THAN_OR_EQUAL',
  'GREATER_THAN',
  'GREATER_THAN_OR_EQUAL',
  'BETWEEN',
  'IN',
  'CONTAINS',
];

/**
 * Validates a scheme for statutory publication.
 * Every published scheme MUST possess verified gazette references,
 * a named reviewer, and deterministic rule definitions.
 */
export function validateSchemeForPublication(
  scheme: SchemeFormData
): VerificationValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Basic Identity
  if (!scheme.official_name || scheme.official_name.trim().length < 5) {
    errors.push('Official scheme name must be at least 5 characters.');
  }

  if (!scheme.short_title || scheme.short_title.trim().length < 2) {
    errors.push('Short title / acronym must be at least 2 characters.');
  }

  if (!scheme.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(scheme.slug.trim())) {
    errors.push('Slug must be lowercase alphanumeric with hyphens (e.g. "pm-kisan-yojana").');
  }

  if (!scheme.department_name || scheme.department_name.trim().length < 3) {
    errors.push('Nodal department or ministry name is required.');
  }

  if (!scheme.category_id) {
    errors.push('A primary beneficiary category is required.');
  }

  // 2. Publication-Specific Guardrails
  if (scheme.publication_status === 'VERIFIED') {
    // Official application link
    if (!scheme.official_application_url || !/^https?:\/\/.+/i.test(scheme.official_application_url.trim())) {
      errors.push('Publication requires a valid official application URL (e.g. https://...).');
    } else if (!scheme.official_application_url.includes('.gov.in') && !scheme.official_application_url.includes('.nic.in')) {
      warnings.push('Official application URL does not appear to end in .gov.in or .nic.in domain.');
    }

    if (!scheme.official_portal_name || scheme.official_portal_name.trim().length < 3) {
      errors.push('Official portal name is required before publishing.');
    }

    // Official sources requirement: MUST have at least 1 verified source
    if (!scheme.sources || scheme.sources.length === 0) {
      errors.push('Publication requires at least one verified gazette notification or official guideline source.');
    } else {
      const validSources = scheme.sources.filter(
        (s) => s.official_source_url && /^https?:\/\/.+/i.test(s.official_source_url)
      );
      if (validSources.length === 0) {
        errors.push('At least one source must have a valid HTTP/HTTPS URL.');
      }
    }

    // Verification date
    if (!scheme.last_verified_at) {
      errors.push('A verified audit date is mandatory for published records.');
    } else {
      const vDate = new Date(scheme.last_verified_at);
      const now = new Date();
      if (isNaN(vDate.getTime())) {
        errors.push('Verification date must be a valid calendar date.');
      } else if (vDate > now) {
        errors.push('Verification date cannot be set in the future.');
      }
    }

    // Responsible reviewer / administrator
    if (!scheme.verified_by_name || scheme.verified_by_name.trim().length < 3) {
      errors.push('A responsible administrator or verified reviewer name must be attributed.');
    }

    // Eligibility rules requirement: MUST have at least 1 deterministic rule
    if (!scheme.rules || scheme.rules.length === 0) {
      errors.push('A verified scheme must configure at least one deterministic eligibility rule.');
    }

    // Required documents requirement: At least 1 document or clear acknowledgment
    if (!scheme.documents || scheme.documents.length === 0) {
      warnings.push('Scheme has 0 required documents. Confirm if this scheme is entirely documentation-free.');
    }

    // Content completeness
    if (!scheme.description || scheme.description.trim().length < 20) {
      errors.push('Verified description must provide at least 20 characters of explanatory context.');
    }

    if (!scheme.benefits || scheme.benefits.trim().length < 15) {
      errors.push('Specific welfare benefits must be clearly stated.');
    }
  }

  // State level geographic sanity check
  if (scheme.government_level === 'STATE' && (!scheme.applicable_region || scheme.applicable_region.trim().length < 2)) {
    errors.push('State-level initiatives must declare the applicable State or Union Territory.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates an individual eligibility rule
 */
export function validateEligibilityRule(rule: SchemeRuleInput): { isValid: boolean; error?: string } {
  if (!rule.field || rule.field.trim().length === 0) {
    return { isValid: false, error: 'Rule field cannot be blank.' };
  }

  if (!VALID_OPERATORS.includes(rule.operator)) {
    return { isValid: false, error: `Invalid operator "${rule.operator}".` };
  }

  if (!rule.label || rule.label.trim().length === 0) {
    return { isValid: false, error: 'Human-readable rule label is required for audit explanations.' };
  }

  if (rule.operator === 'BETWEEN') {
    if (!Array.isArray(rule.expected_value) || rule.expected_value.length !== 2) {
      return { isValid: false, error: 'BETWEEN operator requires an array with [min, max] values.' };
    }
    if (Number(rule.expected_value[0]) > Number(rule.expected_value[1])) {
      return { isValid: false, error: 'BETWEEN min value cannot exceed max value.' };
    }
  }

  if (rule.operator === 'IN') {
    if (!Array.isArray(rule.expected_value) || rule.expected_value.length === 0) {
      return { isValid: false, error: 'IN operator requires a non-empty array of allowed values.' };
    }
  }

  return { isValid: true };
}

/**
 * Validates an individual required document
 */
export function validateSchemeDocument(doc: SchemeDocumentInput): { isValid: boolean; error?: string } {
  if (!doc.canonical_key || !doc.canonical_key.startsWith('doc_')) {
    return { isValid: false, error: 'Canonical key must follow "doc_..." prefix (e.g. doc_caste_certificate).' };
  }

  if (!doc.document_name || doc.document_name.trim().length < 2) {
    return { isValid: false, error: 'Document display name is required.' };
  }

  return { isValid: true };
}

/**
 * Validates an individual official source reference
 */
export function validateSchemeSource(source: SchemeSourceInput): { isValid: boolean; error?: string } {
  if (!source.official_source_url || !/^https?:\/\/.+/i.test(source.official_source_url)) {
    return { isValid: false, error: 'Source URL must begin with http:// or https://' };
  }

  if (!source.last_checked_date) {
    return { isValid: false, error: 'Source last checked date is required.' };
  }

  return { isValid: true };
}
