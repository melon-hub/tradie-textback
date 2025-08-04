import { useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import OnboardingContext, { useOnboarding as useOnboardingContext } from '@/components/onboarding/OnboardingContext';
import { validateStep } from '@/lib/validations/onboarding';
import { OnboardingFormData, StepValidation } from '@/types/onboarding';
import { Tables } from '@/types/database.types';

// Re-export the context hook for backward compatibility
export { useOnboarding as useOnboardingContext } from '@/components/onboarding/OnboardingContext';

type Profile = Tables<'profiles'>;

/**
 * Enhanced useOnboarding hook with additional helper functions
 * This provides a higher-level API for onboarding operations
 */
export const useOnboarding = () => {
  const context = useOnboardingContext();
  
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }

  const { state, dispatch, ...contextMethods } = context;

  /**
   * Validate a specific step with proper error handling
   */
  const validateStepById = (stepId: number, data?: any): StepValidation => {
    try {
      const stepData = data || getStepData(stepId);
      const result = validateStep(stepId, stepData);
      
      const validation: StepValidation = {
        stepId,
        isValid: result.success,
        errors: result.success ? [] : [result.error?.message || 'Validation failed'],
      };

      // Update context with validation result
      dispatch({ type: 'SET_STEP_VALIDATION', payload: validation });
      
      return validation;
    } catch (error) {
      const validation: StepValidation = {
        stepId,
        isValid: false,
        errors: [`Validation error: ${error}`],
      };
      
      dispatch({ type: 'SET_STEP_VALIDATION', payload: validation });
      return validation;
    }
  };

  /**
   * Get data for a specific step
   */
  const getStepData = (stepId: number) => {
    switch (stepId) {
      case 1:
        return state.formData.basicInfo;
      case 2:
        return state.formData.businessDetails;
      case 3:
        return state.formData.serviceArea;
      case 4:
        return state.formData.smsTemplates;
      default:
        return {};
    }
  };

  /**
   * Check if onboarding is completed
   */
  const isOnboardingComplete = (): boolean => {
    // Check if all required steps are valid
    const requiredSteps = [1, 2, 3]; // BasicInfo, BusinessDetails, ServiceArea
    return requiredSteps.every(stepId => 
      state.stepValidation[stepId]?.isValid === true
    );
  };

  /**
   * Get completion percentage
   */
  const getCompletionPercentage = (): number => {
    const totalSteps = 7; // 0-6
    const completedSteps = Object.values(state.stepValidation)
      .filter(validation => validation.isValid).length;
    
    return Math.round((completedSteps / totalSteps) * 100);
  };

  /**
   * Save all onboarding data to the database
   */
  const saveToDatabase = async (): Promise<void> => {
    if (!state.userId) {
      throw new Error('User ID is required to save onboarding data');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      const { basicInfo, businessDetails, serviceArea } = state.formData;
      
      // Prepare profile update data
      const profileUpdates: Partial<Profile> = {
        // Basic info
        name: basicInfo.name,
        phone: basicInfo.phone,
        trade_primary: basicInfo.trade_primary,
        years_experience: basicInfo.years_experience,
        
        // Business details
        business_name: businessDetails.business_name,
        abn: businessDetails.abn,
        license_number: businessDetails.license_number,
        license_expiry: businessDetails.license_expiry,
        insurance_provider: businessDetails.insurance_provider,
        insurance_expiry: businessDetails.insurance_expiry,
        
        // Service area
        service_postcodes: serviceArea.service_postcodes,
        service_radius_km: serviceArea.service_radius_km,
        
        // Onboarding progress
        onboarding_step: state.currentStep,
        onboarding_completed: isOnboardingComplete(),
        updated_at: new Date().toISOString(),
      };

      // Remove undefined values
      Object.keys(profileUpdates).forEach(key => {
        if (profileUpdates[key as keyof Profile] === undefined) {
          delete profileUpdates[key as keyof Profile];
        }
      });

      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileUpdates)
        .eq('user_id', state.userId);

      if (profileError) {
        throw new Error(`Profile update failed: ${profileError.message}`);
      }

      // Save SMS templates if any exist
      if (state.formData.smsTemplates && state.formData.smsTemplates.length > 0) {
        // First, delete existing templates for this user
        const { error: deleteError } = await supabase
          .from('tenant_sms_templates')
          .delete()
          .eq('user_id', state.userId);

        if (deleteError) {
          console.warn('Warning: Could not delete existing SMS templates:', deleteError);
        }

        // Insert new templates
        const templatesData = state.formData.smsTemplates.map(template => ({
          user_id: state.userId,
          template_type: template.template_type,
          content: template.content,
          variables: template.variables || [],
          is_active: true,
        }));

        const { error: templatesError } = await supabase
          .from('tenant_sms_templates')
          .insert(templatesData);

        if (templatesError) {
          throw new Error(`SMS templates save failed: ${templatesError.message}`);
        }
      }

      // Clear localStorage cache since we've saved to database
      localStorage.removeItem(`onboarding_progress_${state.userId}`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save onboarding data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Load onboarding data from database
   */
  const loadFromDatabase = async (): Promise<void> => {
    if (!state.userId) {
      throw new Error('User ID is required to load onboarding data');
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });

    try {
      // Load profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', state.userId)
        .maybeSingle();

      if (profileError) {
        throw new Error(`Failed to load profile: ${profileError.message}`);
      }

      if (profile) {
        // Map profile data to form data
        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: {
            step: 'basicInfo',
            data: {
              name: profile.name || '',
              phone: profile.phone || '',
              trade_primary: profile.trade_primary || '',
              years_experience: profile.years_experience || 0,
            },
          },
        });

        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: {
            step: 'businessDetails',
            data: {
              business_name: profile.business_name || '',
              abn: profile.abn || '',
              license_number: profile.license_number || '',
              license_expiry: profile.license_expiry || '',
              insurance_provider: profile.insurance_provider || '',
              insurance_expiry: profile.insurance_expiry || '',
            },
          },
        });

        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: {
            step: 'serviceArea',
            data: {
              service_postcodes: profile.service_postcodes || [],
              service_radius_km: profile.service_radius_km || undefined,
            },
          },
        });

        // Set current step
        dispatch({ 
          type: 'SET_CURRENT_STEP', 
          payload: profile.onboarding_step || 0 
        });
      }

      // Load SMS templates
      const { data: templates, error: templatesError } = await supabase
        .from('tenant_sms_templates')
        .select('*')
        .eq('user_id', state.userId)
        .eq('is_active', true);

      if (templatesError) {
        console.warn('Warning: Could not load SMS templates:', templatesError);
      } else if (templates && templates.length > 0) {
        dispatch({
          type: 'UPDATE_FORM_DATA',
          payload: {
            step: 'smsTemplates',
            data: templates.map(t => ({
              template_type: t.template_type,
              content: t.content,
              variables: t.variables || [],
            })),
          },
        });
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to load onboarding data';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  /**
   * Complete the onboarding process
   */
  const completeOnboarding = async (): Promise<void> => {
    if (!isOnboardingComplete()) {
      throw new Error('Cannot complete onboarding: required steps are not valid');
    }

    await saveToDatabase();

    // Mark as completed in database
    if (state.userId) {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          onboarding_completed: true,
          onboarding_step: 6, // Complete step
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', state.userId);

      if (error) {
        throw new Error(`Failed to complete onboarding: ${error.message}`);
      }
    }
  };

  /**
   * Skip to a specific step (if allowed)
   */
  const skipToStep = (stepId: number): boolean => {
    if (stepId < 0 || stepId >= 7) {
      return false;
    }

    // Allow skipping to any step for now
    // In the future, you might want to enforce rules about which steps can be skipped
    dispatch({ type: 'SET_CURRENT_STEP', payload: stepId });
    return true;
  };

  /**
   * Get current step validation status
   */
  const getCurrentStepValidation = (): StepValidation | null => {
    return state.stepValidation[state.currentStep] || null;
  };

  /**
   * Get all validation errors
   */
  const getAllErrors = (): string[] => {
    return Object.values(state.stepValidation)
      .flatMap(validation => validation.errors);
  };

  return {
    // Original context methods
    ...contextMethods,
    state,
    dispatch,

    // Enhanced helper methods
    validateStepById,
    getStepData,
    isOnboardingComplete,
    getCompletionPercentage,
    saveToDatabase,
    loadFromDatabase,
    completeOnboarding,
    skipToStep,
    getCurrentStepValidation,
    getAllErrors,

    // Convenience getters
    isLoading: state.isLoading,
    error: state.error,
    currentStep: state.currentStep,
    formData: state.formData,
    userId: state.userId,
  };
};

export default useOnboarding;