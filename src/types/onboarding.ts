import { Tables } from './database.types';

// Extract profile type from database types
export type Profile = Tables<'profiles'>;

// Individual step data types (matching validation schemas)
export interface BasicInfoData {
  name: string;
  phone: string;
  email?: string; // Optional to match validation
  trade_primary: string;
  years_experience: number;
}

export interface BusinessDetailsData {
  business_name: string;
  abn?: string; // Optional to match validation
  license_number?: string;
  license_expiry?: string;
  insurance_provider?: string;
  insurance_expiry?: string;
}

export interface ServiceAreaData {
  service_postcodes?: string[];
  service_radius_km?: number;
  radius_center_address?: string;
}

export interface SMSTemplateData {
  template_type: 'job_confirmation' | 'job_reminder' | 'job_arrival' | 'job_completion' | 'follow_up' | 'quote_follow_up' | 'custom';
  content: string;
  variables?: string[];
}

// Combined onboarding form data
export interface OnboardingFormData {
  basicInfo: Partial<BasicInfoData>;
  businessDetails: Partial<BusinessDetailsData>;
  serviceArea: Partial<ServiceAreaData>;
  smsTemplates: SMSTemplateData[];
}

// Onboarding step definitions
export interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  component: string;
  required: boolean;
}

// Template types for SMS
export const SMS_TEMPLATE_TYPES = [
  'job_confirmation',
  'job_reminder', 
  'job_arrival',
  'job_completion',
  'follow_up',
  'quote_follow_up',
  'custom'
] as const;

export type SMSTemplateType = typeof SMS_TEMPLATE_TYPES[number];

// Default SMS templates
export const DEFAULT_SMS_TEMPLATES: Record<SMSTemplateType, string> = {
  job_confirmation: "Hi {customer_name}, your {job_type} job has been confirmed for {date} at {time}. We'll text you when we're on our way. - {business_name}",
  job_reminder: "Hi {customer_name}, this is a reminder about your {job_type} appointment tomorrow at {time}. See you then! - {business_name}",
  job_arrival: "Hi {customer_name}, we're on our way to your {location} for the {job_type} job. ETA: {eta} minutes. - {business_name}",
  job_completion: "Job completed! Thanks for choosing {business_name}. Please let us know if you need anything else. - {business_name}",
  follow_up: "Hi {customer_name}, just following up on the {job_type} work we completed. Everything working well? - {business_name}",
  quote_follow_up: "Hi {customer_name}, following up on the quote we provided for {job_type}. Any questions? - {business_name}",
  custom: "Custom message template - edit this to suit your needs."
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: 0,
    title: "Welcome",
    description: "Welcome to the onboarding process",
    component: "Welcome",
    required: true,
  },
  {
    id: 1,
    title: "Basic Information",
    description: "Tell us about yourself and your trade",
    component: "BasicInfo",
    required: true,
  },
  {
    id: 2,
    title: "Business Details",
    description: "Add your business information and credentials",
    component: "BusinessDetails",
    required: true,
  },
  {
    id: 3,
    title: "Service Area",
    description: "Define where you provide services",
    component: "ServiceArea",
    required: true,
  },
  {
    id: 4,
    title: "SMS Templates",
    description: "Customize your customer communication",
    component: "SMSTemplates",
    required: false,
  },
  {
    id: 5,
    title: "Review & Confirm",
    description: "Review your information before finalizing",
    component: "Review",
    required: true,
  },
  {
    id: 6,
    title: "Complete",
    description: "Your account is ready to use",
    component: "Complete",
    required: true,
  },
];

// Step validation status
export interface StepValidation {
  stepId: number;
  isValid: boolean;
  errors: string[];
}

// Context state interface
export interface OnboardingContextState {
  currentStep: number;
  formData: OnboardingFormData;
  stepValidation: Record<number, StepValidation>;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
}

// Context actions
export type OnboardingAction =
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'UPDATE_FORM_DATA'; payload: { step: keyof OnboardingFormData; data: any } }
  | { type: 'SET_STEP_VALIDATION'; payload: StepValidation }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_USER_ID'; payload: string | null }
  | { type: 'RESET_ONBOARDING' }
  | { type: 'LOAD_FROM_PROFILE'; payload: Partial<Profile> }
  | { type: 'SET_FORM_DATA'; payload: OnboardingFormData };

// Additional utility types for better type safety
export type OnboardingStepComponent = 'Welcome' | 'BasicInfo' | 'BusinessDetails' | 'ServiceArea' | 'SMSTemplates' | 'Review' | 'Complete';

export interface OnboardingProgress {
  completedSteps: number[];
  currentStep: number;
  totalSteps: number;
  isComplete: boolean;
  completionPercentage: number;
}

// Error handling types
export interface OnboardingError {
  step?: number;
  field?: string;
  message: string;
  code?: string;
}

// Database integration types
export interface OnboardingProfileUpdate {
  name?: string;
  phone?: string;
  trade_primary?: string;
  years_experience?: number;
  business_name?: string;
  abn?: string;
  license_number?: string;
  license_expiry?: string;
  insurance_provider?: string;
  insurance_expiry?: string;
  service_postcodes?: string[];
  service_radius_km?: number;
  onboarding_step?: number;
  onboarding_completed?: boolean;
}