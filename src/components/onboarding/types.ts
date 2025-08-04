// Re-export types from the main types directory for convenience
export {
  type Profile,
  type BasicInfoData,
  type BusinessDetailsData,
  type ServiceAreaData,
  type SMSTemplateData,
  type OnboardingFormData,
  type OnboardingStep,
  type StepValidation,
  type OnboardingContextState,
  type OnboardingAction,
  ONBOARDING_STEPS,
} from '@/types/onboarding';

// Additional types specific to onboarding components
export interface OnboardingComponentProps {
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
}

export interface StepperProps {
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  onStepClick?: (stepId: number) => void;
  allowSkip?: boolean;
}

export interface ValidationProps {
  errors?: string[];
  touched?: boolean;
  showErrors?: boolean;
}

// Form field types for better type safety
export interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  helperText?: string;
  value?: any;
  onChange?: (value: any) => void;
  onBlur?: () => void;
}

// Progress tracking types
export interface ProgressState {
  totalSteps: number;
  completedSteps: number;
  currentStep: number;
  percentComplete: number;
}

// Auto-save status types
export interface AutoSaveStatus {
  isEnabled: boolean;
  lastSaved: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: string | null;
}

// Navigation types
export interface NavigationState {
  canGoNext: boolean;
  canGoPrevious: boolean;
  canSkipStep: boolean;
  isFirstStep: boolean;
  isLastStep: boolean;
}

// Step completion requirements
export interface StepRequirement {
  stepId: number;
  field: string;
  required: boolean;
  validator?: (value: any) => boolean;
  errorMessage?: string;
}

// Onboarding analytics/tracking types
export interface OnboardingEvent {
  type: 'step_started' | 'step_completed' | 'step_skipped' | 'form_saved' | 'onboarding_completed';
  stepId: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

// Form state management types
export interface FormState<T = any> {
  data: T;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  isValid: boolean;
  isDirty: boolean;
  isSubmitting: boolean;
}

// Async operation status
export interface AsyncStatus {
  isLoading: boolean;
  error: string | null;
  success: boolean;
}

// Trade and specialization types (for dropdowns/selectors)
export interface TradeOption {
  code: string;
  label: string;
  category?: string;
  icon?: string;
  description?: string;
}

export interface SpecializationOption {
  id: string;
  name: string;
  tradeCode: string;
  description?: string;
}

// Service area types
export interface PostcodeOption {
  postcode: string;
  suburb: string;
  state: string;
  latitude?: number;
  longitude?: number;
}

export interface ServiceAreaConfig {
  type: 'postcodes' | 'radius';
  postcodes?: string[];
  radius?: {
    center: {
      lat: number;
      lng: number;
    };
    kilometers: number;
  };
}

// SMS template configuration
export interface SMSTemplateConfig {
  id: string;
  name: string;
  type: string;
  defaultContent: string;
  availableVariables: string[];
  required: boolean;
  maxLength: number;
}

// Validation result types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

// Component layout types
export interface LayoutProps {
  title?: string;
  subtitle?: string;
  showProgress?: boolean;
  showNavigation?: boolean;
  className?: string;
  children: React.ReactNode;
}

// Error boundary types
export interface OnboardingError {
  message: string;
  code?: string;
  step?: number;
  field?: string;
  recoverable?: boolean;
}

export default {};