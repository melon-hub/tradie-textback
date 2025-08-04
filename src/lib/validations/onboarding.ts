import { z } from 'zod';

// Basic Info Schema
export const basicInfoSchema = z.object({
  name: z.string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters")
    .trim(),
  phone: z.string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits")
    .regex(/^[\d\s\-\+\(\)]+$/, "Phone number contains invalid characters")
    .transform(val => val.replace(/\s/g, '')), // Remove spaces
  email: z.string()
    .email("Please enter a valid email address")
    .max(255, "Email must be less than 255 characters")
    .toLowerCase()
    .trim()
    .optional(),  // Email might not be required for all tradies
  trade_primary: z.string()
    .min(2, "Primary trade is required")
    .max(50, "Trade name must be less than 50 characters"),
  years_experience: z.number()
    .min(0, "Years of experience cannot be negative")
    .max(60, "Years of experience seems too high")
    .int("Years of experience must be a whole number"),
});

// Business Details Schema
export const businessDetailsSchema = z.object({
  business_name: z.string()
    .min(2, "Business name must be at least 2 characters")
    .max(100, "Business name must be less than 100 characters")
    .trim(),
  abn: z.string()
    .regex(/^\d{11}$/, "ABN must be exactly 11 digits")
    .transform(val => val.replace(/\s/g, '')) // Remove spaces
    .optional()
    .or(z.literal('')), // ABN might be optional for sole traders
  license_number: z.string()
    .min(3, "License number must be at least 3 characters")
    .max(50, "License number must be less than 50 characters")
    .trim()
    .optional()
    .or(z.literal('')),
  license_expiry: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "License expiry must be in YYYY-MM-DD format")
    .refine(date => {
      const expiry = new Date(date);
      const today = new Date();
      return expiry > today;
    }, "License expiry date must be in the future")
    .optional()
    .or(z.literal('')),
  insurance_provider: z.string()
    .min(2, "Insurance provider must be at least 2 characters")
    .max(100, "Insurance provider must be less than 100 characters")
    .trim()
    .optional()
    .or(z.literal('')),
  insurance_expiry: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Insurance expiry must be in YYYY-MM-DD format")
    .refine(date => {
      const expiry = new Date(date);
      const today = new Date();
      return expiry > today;
    }, "Insurance expiry date must be in the future")
    .optional()
    .or(z.literal('')),
});

// Service Area Schema
export const serviceAreaSchema = z.object({
  service_postcodes: z.array(z.string().regex(/^\d{4}$/, "Postcode must be 4 digits"))
    .min(1, "At least one postcode is required")
    .max(50, "Maximum 50 postcodes allowed")
    .optional(),
  service_radius_km: z.number()
    .min(1, "Service radius must be at least 1km")
    .max(500, "Service radius cannot exceed 500km")
    .int("Service radius must be a whole number")
    .optional(),
}).refine(data => {
  // Either postcodes or radius must be provided, but not both
  const hasPostcodes = data.service_postcodes && data.service_postcodes.length > 0;
  const hasRadius = data.service_radius_km && data.service_radius_km > 0;
  return hasPostcodes !== hasRadius; // XOR - exactly one must be true
}, {
  message: "Please provide either specific postcodes OR a service radius, not both",
  path: ['service_area'],
});

// SMS Template Schema
export const smsTemplateSchema = z.object({
  template_type: z.enum([
    'job_confirmation',
    'job_reminder',
    'job_arrival',
    'job_completion',
    'follow_up',
    'quote_follow_up',
    'custom'
  ]),
  content: z.string()
    .min(10, "Template content must be at least 10 characters")
    .max(1600, "SMS content cannot exceed 1600 characters") // SMS limit
    .trim(),
  variables: z.array(z.string())
    .optional()
    .default([]),
});

// SMS Templates collection schema
export const smsTemplatesSchema = z.array(smsTemplateSchema)
  .max(10, "Maximum 10 SMS templates allowed")
  .optional()
  .default([]);  // SMS templates are optional during onboarding

// Combined onboarding schema
export const onboardingFormSchema = z.object({
  basicInfo: basicInfoSchema,
  businessDetails: businessDetailsSchema,
  serviceArea: serviceAreaSchema,
  smsTemplates: smsTemplatesSchema.optional().default([]),
});

// Individual step schemas for partial validation
export const stepSchemas = {
  0: z.object({}), // Welcome step - no validation needed
  1: basicInfoSchema,
  2: businessDetailsSchema,
  3: serviceAreaSchema,
  4: smsTemplatesSchema,
  5: z.object({}), // Review step - uses combined validation
  6: z.object({}), // Complete step - no validation needed
};

// Helper function to validate a specific step
export const validateStep = (stepId: number, data: any) => {
  const schema = stepSchemas[stepId as keyof typeof stepSchemas];
  if (!schema) {
    return { success: false, error: { message: 'Invalid step ID' } };
  }
  
  try {
    const result = schema.parse(data);
    return { success: true, data: result };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: { 
          message: error.errors.map(e => e.message).join(', '),
          details: error.errors 
        } 
      };
    }
    return { success: false, error };
  }
};

// Utility function to get validation errors as array
export const getValidationErrors = (stepId: number, data: any): string[] => {
  const result = validateStep(stepId, data);
  if (result.success) return [];
  
  if (result.error?.details) {
    return result.error.details.map((err: any) => err.message);
  }
  
  return [result.error?.message || 'Validation failed'];
};

// Check if step data is partially valid (useful for showing progress)
export const isStepPartiallyValid = (stepId: number, data: any): boolean => {
  // For optional steps, return true if they're empty
  if (stepId === 0 || stepId === 5 || stepId === 6) return true;
  if (stepId === 4 && (!data || data.length === 0)) return true;
  
  // For required steps, check if at least some required fields are filled
  switch (stepId) {
    case 1: // Basic Info
      return !!(data?.name && data?.phone && data?.trade_primary);
    case 2: // Business Details
      return !!(data?.business_name);
    case 3: // Service Area
      return !!((data?.service_postcodes && data.service_postcodes.length > 0) || data?.service_radius_km);
    default:
      return false;
  }
};

// Export types inferred from schemas
export type BasicInfoData = z.infer<typeof basicInfoSchema>;
export type BusinessDetailsData = z.infer<typeof businessDetailsSchema>;
export type ServiceAreaData = z.infer<typeof serviceAreaSchema>;
export type SMSTemplateData = z.infer<typeof smsTemplateSchema>;
export type OnboardingFormData = z.infer<typeof onboardingFormSchema>;

// Additional utility types
export type ValidationResult = {
  success: boolean;
  data?: any;
  error?: {
    message: string;
    details?: any[];
  };
};

export type StepData = BasicInfoData | BusinessDetailsData | ServiceAreaData | SMSTemplateData[];