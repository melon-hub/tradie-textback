// Re-export validation schemas from the main validations directory
export {
  basicInfoSchema,
  businessDetailsSchema,
  serviceAreaSchema,
  smsTemplateSchema,
  smsTemplatesSchema,
  onboardingFormSchema,
  stepSchemas,
  validateStep,
  type BasicInfoData,
  type BusinessDetailsData,
  type ServiceAreaData,
  type SMSTemplateData,
  type OnboardingFormData,
} from '@/lib/validations/onboarding';

import { z } from 'zod';
import { stepSchemas } from '@/lib/validations/onboarding';
import { StepValidation } from './types';

// Additional validation helpers specific to the onboarding components

/**
 * Validates form data for a specific step and returns validation result
 * @param stepId - The step ID to validate
 * @param data - The form data to validate
 * @returns StepValidation object with validation status and errors
 */
export function validateStepData(stepId: number, data: any): StepValidation {
  const schema = stepSchemas[stepId as keyof typeof stepSchemas];
  
  if (!schema) {
    return {
      stepId,
      isValid: false,
      errors: ['Invalid step ID'],
    };
  }

  try {
    schema.parse(data);
    return {
      stepId,
      isValid: true,
      errors: [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map(err => {
        const field = err.path.join('.');
        return field ? `${field}: ${err.message}` : err.message;
      });
      
      return {
        stepId,
        isValid: false,
        errors,
      };
    }
    
    return {
      stepId,
      isValid: false,
      errors: ['Validation failed'],
    };
  }
}

/**
 * Validates all completed steps and returns a summary
 * @param formData - Complete form data object
 * @param currentStep - Current step index
 * @returns Object with overall validation status and step-by-step results
 */
export function validateAllSteps(formData: any, currentStep: number) {
  const results: Record<number, StepValidation> = {};
  let overallValid = true;
  let totalErrors = 0;

  // Validate each step up to and including current step
  for (let i = 0; i <= currentStep; i++) {
    let stepData;
    
    // Map step index to form data section
    switch (i) {
      case 1: // Basic Info
        stepData = formData.basicInfo || {};
        break;
      case 2: // Business Details
        stepData = formData.businessDetails || {};
        break;
      case 3: // Service Area
        stepData = formData.serviceArea || {};
        break;
      case 4: // SMS Templates
        stepData = formData.smsTemplates || [];
        break;
      default:
        stepData = {}; // Steps that don't require validation
    }

    const validation = validateStepData(i, stepData);
    results[i] = validation;
    
    if (!validation.isValid) {
      overallValid = false;
      totalErrors += validation.errors.length;
    }
  }

  return {
    isValid: overallValid,
    totalErrors,
    stepValidations: results,
  };
}

/**
 * Formats validation errors for display in UI components
 * @param errors - Array of error messages
 * @param options - Formatting options
 * @returns Formatted error messages
 */
export function formatValidationErrors(
  errors: string[],
  options: {
    showFieldNames?: boolean;
    separator?: string;
    maxErrors?: number;
  } = {}
) {
  const {
    showFieldNames = true,
    separator = '\n',
    maxErrors = 5,
  } = options;

  if (!errors || errors.length === 0) {
    return '';
  }

  let formattedErrors = errors.slice(0, maxErrors);

  if (!showFieldNames) {
    // Remove field names from error messages
    formattedErrors = formattedErrors.map(error => 
      error.includes(':') ? error.split(':')[1].trim() : error
    );
  }

  const result = formattedErrors.join(separator);
  
  // Add "and X more errors" if we truncated
  if (errors.length > maxErrors) {
    const remaining = errors.length - maxErrors;
    return `${result}${separator}... and ${remaining} more error${remaining > 1 ? 's' : ''}`;
  }

  return result;
}

/**
 * Checks if a step can be skipped based on validation and step configuration
 * @param stepId - The step to check
 * @param validation - Current validation state
 * @param isRequired - Whether the step is required
 * @returns Whether the step can be skipped
 */
export function canSkipStep(
  stepId: number,
  validation: StepValidation | undefined,
  isRequired: boolean = true
): boolean {
  // Required steps cannot be skipped if they have validation errors
  if (isRequired && validation && !validation.isValid) {
    return false;
  }

  // Optional steps can always be skipped
  if (!isRequired) {
    return true;
  }

  // Welcome, Review, and Complete steps can usually be navigated through
  if (stepId === 0 || stepId === 5 || stepId === 6) {
    return true;
  }

  return validation?.isValid || false;
}

/**
 * Gets the next valid step that can be navigated to
 * @param currentStep - Current step index
 * @param stepValidations - All step validations
 * @param totalSteps - Total number of steps
 * @returns Next valid step index or null if none available
 */
export function getNextValidStep(
  currentStep: number,
  stepValidations: Record<number, StepValidation>,
  totalSteps: number
): number | null {
  for (let i = currentStep + 1; i < totalSteps; i++) {
    const validation = stepValidations[i];
    if (!validation || validation.isValid || canSkipStep(i, validation, false)) {
      return i;
    }
  }
  return null;
}

/**
 * Validates required fields for step completion
 * @param stepId - Step to validate
 * @param data - Form data
 * @returns Array of missing required fields
 */
export function getMissingRequiredFields(stepId: number, data: any): string[] {
  const missingFields: string[] = [];

  switch (stepId) {
    case 1: // Basic Info
      if (!data.name?.trim()) missingFields.push('Name');
      if (!data.phone?.trim()) missingFields.push('Phone');
      if (!data.email?.trim()) missingFields.push('Email');
      if (!data.trade_primary?.trim()) missingFields.push('Primary Trade');
      if (data.years_experience === undefined || data.years_experience === null) {
        missingFields.push('Years of Experience');
      }
      break;

    case 2: // Business Details
      if (!data.business_name?.trim()) missingFields.push('Business Name');
      if (!data.abn?.trim()) missingFields.push('ABN');
      break;

    case 3: // Service Area
      const hasPostcodes = data.service_postcodes && data.service_postcodes.length > 0;
      const hasRadius = data.service_radius_km && data.service_radius_km > 0;
      if (!hasPostcodes && !hasRadius) {
        missingFields.push('Service Area (postcodes or radius)');
      }
      break;

    case 4: // SMS Templates (optional step)
      // No required fields for SMS templates
      break;
  }

  return missingFields;
}

/**
 * Checks if step data has changed from saved state
 * @param currentData - Current form data
 * @param savedData - Previously saved data
 * @param stepId - Step to check
 * @returns Whether data has changed
 */
export function hasStepDataChanged(
  currentData: any,
  savedData: any,
  stepId: number
): boolean {
  const getStepData = (data: any, step: number) => {
    switch (step) {
      case 1: return data?.basicInfo || {};
      case 2: return data?.businessDetails || {};
      case 3: return data?.serviceArea || {};
      case 4: return data?.smsTemplates || [];
      default: return {};
    }
  };

  const current = getStepData(currentData, stepId);
  const saved = getStepData(savedData, stepId);

  return JSON.stringify(current) !== JSON.stringify(saved);
}

// Common validation patterns
export const ValidationPatterns = {
  phone: /^[\d\s\-\+\(\)]+$/,
  abn: /^\d{11}$/,
  postcode: /^\d{4}$/,
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  date: /^\d{4}-\d{2}-\d{2}$/,
} as const;

// Common error messages
export const ErrorMessages = {
  required: (field: string) => `${field} is required`,
  invalid: (field: string) => `${field} is invalid`,
  tooShort: (field: string, min: number) => `${field} must be at least ${min} characters`,
  tooLong: (field: string, max: number) => `${field} must be less than ${max} characters`,
  invalidFormat: (field: string, format: string) => `${field} must be in ${format} format`,
  futureDate: (field: string) => `${field} must be a future date`,
  networkError: 'Network error. Please check your connection and try again.',
  saveError: 'Failed to save progress. Your changes will be saved automatically when connection is restored.',
} as const;