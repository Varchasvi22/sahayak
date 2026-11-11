import { ConditionOperator } from './types';
import { formatINR } from '@/lib/utils';

export interface OperatorEvaluationResult {
  passed: boolean;
  explanation: string;
}

/**
 * Cleanly format values for civic explanations
 */
export function formatValueForDisplay(val: unknown, fieldName?: string): string {
  if (val === null || val === undefined) return 'Not Provided';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (typeof val === 'number') {
    if (fieldName?.toLowerCase().includes('income')) {
      return formatINR(val);
    }
    return val.toString();
  }
  if (Array.isArray(val)) {
    return val.map((v) => formatValueForDisplay(v, fieldName)).join(', ');
  }
  return String(val);
}

/**
 * Pure deterministic evaluation of an atomic operator against actual and expected values
 */
export function evaluateOperator(
  operator: ConditionOperator,
  actualValue: unknown,
  expectedValue: unknown,
  fieldLabel: string,
  fieldName: string
): OperatorEvaluationResult {
  const displayActual = formatValueForDisplay(actualValue, fieldName);
  const displayExpected = formatValueForDisplay(expectedValue, fieldName);

  switch (operator) {
    case 'EQUALS': {
      if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
        const passed = actualValue.trim().toLowerCase() === expectedValue.trim().toLowerCase();
        return {
          passed,
          explanation: passed
            ? `Matches requirement: ${fieldLabel} is "${displayActual}".`
            : `Requirement not met: expected "${displayExpected}", but profile has "${displayActual}".`,
        };
      }
      const passed = actualValue === expectedValue;
      return {
        passed,
        explanation: passed
          ? `Matches requirement: ${fieldLabel} is ${displayActual}.`
          : `Requirement not met: expected ${displayExpected}, but profile has ${displayActual}.`,
      };
    }

    case 'NOT_EQUALS': {
      if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
        const passed = actualValue.trim().toLowerCase() !== expectedValue.trim().toLowerCase();
        return {
          passed,
          explanation: passed
            ? `Satisfies exclusion rule: ${fieldLabel} is not "${displayExpected}".`
            : `Exclusion violated: ${fieldLabel} cannot be "${displayExpected}".`,
        };
      }
      const passed = actualValue !== expectedValue;
      return {
        passed,
        explanation: passed
          ? `Satisfies exclusion rule: ${fieldLabel} is not ${displayExpected}.`
          : `Exclusion violated: ${fieldLabel} cannot be ${displayExpected}.`,
      };
    }

    case 'LESS_THAN': {
      const numActual = Number(actualValue);
      const numExpected = Number(expectedValue);
      if (isNaN(numActual) || isNaN(numExpected)) {
        return {
          passed: false,
          explanation: `Numerical evaluation failed: Invalid number for ${fieldLabel}.`,
        };
      }
      const passed = numActual < numExpected;
      return {
        passed,
        explanation: passed
          ? `Qualifies: ${fieldLabel} (${displayActual}) is less than ${displayExpected}.`
          : `Exceeds threshold: ${fieldLabel} (${displayActual}) must be less than ${displayExpected}.`,
      };
    }

    case 'LESS_THAN_OR_EQUAL': {
      const numActual = Number(actualValue);
      const numExpected = Number(expectedValue);
      if (isNaN(numActual) || isNaN(numExpected)) {
        return {
          passed: false,
          explanation: `Numerical evaluation failed: Invalid number for ${fieldLabel}.`,
        };
      }
      const passed = numActual <= numExpected;
      return {
        passed,
        explanation: passed
          ? `Qualifies within ceiling: ${fieldLabel} (${displayActual}) is at or below maximum limit of ${displayExpected}.`
          : `Exceeds ceiling: ${fieldLabel} (${displayActual}) exceeds statutory maximum limit of ${displayExpected}.`,
      };
    }

    case 'GREATER_THAN': {
      const numActual = Number(actualValue);
      const numExpected = Number(expectedValue);
      if (isNaN(numActual) || isNaN(numExpected)) {
        return {
          passed: false,
          explanation: `Numerical evaluation failed: Invalid number for ${fieldLabel}.`,
        };
      }
      const passed = numActual > numExpected;
      return {
        passed,
        explanation: passed
          ? `Qualifies: ${fieldLabel} (${displayActual}) is greater than minimum requirement of ${displayExpected}.`
          : `Below requirement: ${fieldLabel} (${displayActual}) must be greater than ${displayExpected}.`,
      };
    }

    case 'GREATER_THAN_OR_EQUAL': {
      const numActual = Number(actualValue);
      const numExpected = Number(expectedValue);
      if (isNaN(numActual) || isNaN(numExpected)) {
        return {
          passed: false,
          explanation: `Numerical evaluation failed: Invalid number for ${fieldLabel}.`,
        };
      }
      const passed = numActual >= numExpected;
      return {
        passed,
        explanation: passed
          ? `Qualifies: ${fieldLabel} (${displayActual}) meets or exceeds minimum requirement of ${displayExpected}.`
          : `Below minimum threshold: ${fieldLabel} (${displayActual}) is below minimum requirement of ${displayExpected}.`,
      };
    }

    case 'BETWEEN': {
      const numActual = Number(actualValue);
      let range: [number, number] = [0, 0];
      if (Array.isArray(expectedValue) && expectedValue.length === 2) {
        range = [Number(expectedValue[0]), Number(expectedValue[1])];
      }
      if (isNaN(numActual) || isNaN(range[0]) || isNaN(range[1])) {
        return {
          passed: false,
          explanation: `Numerical evaluation failed: Invalid range for ${fieldLabel}.`,
        };
      }
      const passed = numActual >= range[0] && numActual <= range[1];
      const rangeText = `${range[0]} to ${range[1]}`;
      return {
        passed,
        explanation: passed
          ? `Within eligible bracket: ${fieldLabel} (${displayActual}) falls within statutory range of ${rangeText}.`
          : `Outside allowable bracket: ${fieldLabel} (${displayActual}) is outside required range of ${rangeText}.`,
      };
    }

    case 'IN': {
      let allowedList: unknown[] = [];
      if (Array.isArray(expectedValue)) {
        allowedList = expectedValue;
      } else if (typeof expectedValue === 'string') {
        try {
          const parsed = JSON.parse(expectedValue);
          if (Array.isArray(parsed)) allowedList = parsed;
        } catch {
          allowedList = [expectedValue];
        }
      }

      const passed = allowedList.some((item) => {
        if (typeof item === 'string' && typeof actualValue === 'string') {
          return item.trim().toLowerCase() === actualValue.trim().toLowerCase();
        }
        return item === actualValue;
      });

      return {
        passed,
        explanation: passed
          ? `Matches approved list: ${fieldLabel} ("${displayActual}") is among recognized categories.`
          : `Not in approved list: ${fieldLabel} ("${displayActual}") is not among recognized categories (${displayExpected}).`,
      };
    }

    case 'NOT_IN': {
      let disallowedList: unknown[] = [];
      if (Array.isArray(expectedValue)) {
        disallowedList = expectedValue;
      } else if (typeof expectedValue === 'string') {
        try {
          const parsed = JSON.parse(expectedValue);
          if (Array.isArray(parsed)) disallowedList = parsed;
        } catch {
          disallowedList = [expectedValue];
        }
      }

      const found = disallowedList.some((item) => {
        if (typeof item === 'string' && typeof actualValue === 'string') {
          return item.trim().toLowerCase() === actualValue.trim().toLowerCase();
        }
        return item === actualValue;
      });

      const passed = !found;
      return {
        passed,
        explanation: passed
          ? `Satisfies exclusion criteria: ${fieldLabel} ("${displayActual}") is not in excluded list.`
          : `Disqualified under exclusion list: ${fieldLabel} ("${displayActual}") belongs to excluded category (${displayExpected}).`,
      };
    }

    case 'CONTAINS': {
      if (Array.isArray(actualValue)) {
        const passed = actualValue.some((item) => {
          if (typeof item === 'string' && typeof expectedValue === 'string') {
            return item.trim().toLowerCase() === expectedValue.trim().toLowerCase();
          }
          return item === expectedValue;
        });
        return {
          passed,
          explanation: passed
            ? `Contains required attribute: Profile contains "${displayExpected}".`
            : `Missing required attribute: Profile does not include "${displayExpected}".`,
        };
      }
      if (typeof actualValue === 'string' && typeof expectedValue === 'string') {
        const passed = actualValue.toLowerCase().includes(expectedValue.toLowerCase());
        return {
          passed,
          explanation: passed
            ? `Contains match: "${displayActual}" matches "${displayExpected}".`
            : `Does not contain: "${displayActual}" does not match "${displayExpected}".`,
        };
      }
      return {
        passed: false,
        explanation: `Cannot evaluate CONTAINS on non-collection type for ${fieldLabel}.`,
      };
    }

    default:
      return {
        passed: false,
        explanation: `Unsupported operator "${operator}" for ${fieldLabel}.`,
      };
  }
}
