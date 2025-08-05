import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { Tables } from '@/types/database.types';
import {
  OnboardingContextState,
  OnboardingAction,
  OnboardingFormData,
  StepValidation,
  ONBOARDING_STEPS,
} from '@/types/onboarding';

// Profile type from database
type Profile = Tables<'profiles'>;

// Context interface
interface OnboardingContextType {
  state: OnboardingContextState;
  dispatch: React.Dispatch<OnboardingAction>;
  // Helper functions
  nextStep: () => void;
  previousStep: () => void;
  goToStep: (stepId: number) => void;
  updateStepData: (step: keyof OnboardingFormData, data: any) => void;
  validateCurrentStep: () => boolean;
  saveProgress: () => Promise<void>;
  resetOnboarding: () => void;
}

// Initial state
const initialState: OnboardingContextState = {
  currentStep: 0,
  formData: {
    basicInfo: {},
    businessDetails: {},
    serviceArea: {},
    smsTemplates: [],
  },
  stepValidation: {},
  isLoading: false,
  error: null,
  userId: null,
};

// Reducer function
function onboardingReducer(
  state: OnboardingContextState,
  action: OnboardingAction
): OnboardingContextState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return {
        ...state,
        currentStep: Math.max(0, Math.min(action.payload, ONBOARDING_STEPS.length - 1)),
        error: null,
      };

    case 'UPDATE_FORM_DATA':
      // Special handling for smsTemplates which should remain an array
      if (action.payload.step === 'smsTemplates') {
        return {
          ...state,
          formData: {
            ...state.formData,
            smsTemplates: action.payload.data,
          },
        };
      }
      return {
        ...state,
        formData: {
          ...state.formData,
          [action.payload.step]: {
            ...state.formData[action.payload.step],
            ...action.payload.data,
          },
        },
      };

    case 'SET_STEP_VALIDATION':
      return {
        ...state,
        stepValidation: {
          ...state.stepValidation,
          [action.payload.stepId]: action.payload,
        },
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };

    case 'SET_USER_ID':
      return {
        ...state,
        userId: action.payload,
      };

    case 'RESET_ONBOARDING':
      return {
        ...initialState,
        userId: state.userId, // Keep user ID
      };

    default:
      return state;
  }
}

// Create context
const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

// Provider component
interface OnboardingProviderProps {
  children: React.ReactNode;
  userId?: string;
}

export function OnboardingProvider({ children, userId }: OnboardingProviderProps) {
  const [state, dispatch] = useReducer(onboardingReducer, {
    ...initialState,
    userId: userId || null,
  });

  // Auto-save interval ref
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSaveRef = useRef<string>('');

  // Auto-save functionality - saves every 30 seconds if data has changed
  useEffect(() => {
    const startAutoSave = () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }

      autoSaveIntervalRef.current = setInterval(async () => {
        const currentData = JSON.stringify(state.formData);
        if (currentData !== lastSaveRef.current && state.userId) {
          try {
            await saveToDatabase();
            lastSaveRef.current = currentData;
            console.log('Auto-saved onboarding progress');
          } catch (error) {
            console.error('Auto-save failed:', error);
          }
        }
      }, 30000); // 30 seconds
    };

    if (state.userId) {
      startAutoSave();
    }

    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [state.userId, state.formData]);

  // Save progress to database
  const saveToDatabase = async (): Promise<void> => {
    if (!state.userId) {
      throw new Error('User ID is required to save progress');
    }

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Here you would implement the actual database save
      // For now, we'll save to localStorage as fallback
      const progressData = {
        currentStep: state.currentStep,
        formData: state.formData,
        stepValidation: state.stepValidation,
        lastSaved: new Date().toISOString(),
      };

      localStorage.setItem(`onboarding_progress_${state.userId}`, JSON.stringify(progressData));
      
      // TODO: Replace with actual Supabase save
      // await supabase
      //   .from('profiles')
      //   .update({
      //     onboarding_step: state.currentStep,
      //     // Map form data to profile fields
      //     name: state.formData.basicInfo.name,
      //     phone: state.formData.basicInfo.phone,
      //     trade_primary: state.formData.basicInfo.trade_primary,
      //     years_experience: state.formData.basicInfo.years_experience,
      //     business_name: state.formData.businessDetails.business_name,
      //     abn: state.formData.businessDetails.abn,
      //     license_number: state.formData.businessDetails.license_number,
      //     license_expiry: state.formData.businessDetails.license_expiry,
      //     insurance_provider: state.formData.businessDetails.insurance_provider,
      //     insurance_expiry: state.formData.businessDetails.insurance_expiry,
      //     service_postcodes: state.formData.serviceArea.service_postcodes,
      //     service_radius_km: state.formData.serviceArea.service_radius_km,
      //   })
      //   .eq('user_id', state.userId);

    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: `Failed to save progress: ${error}` });
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load saved progress
  const loadProgress = async (): Promise<void> => {
    if (!state.userId) return;

    dispatch({ type: 'SET_LOADING', payload: true });

    try {
      // Try to load from localStorage first (fallback)
      const savedProgress = localStorage.getItem(`onboarding_progress_${state.userId}`);
      
      if (savedProgress) {
        const progress = JSON.parse(savedProgress);
        dispatch({ type: 'SET_CURRENT_STEP', payload: progress.currentStep || 0 });
        
        if (progress.formData) {
          Object.keys(progress.formData).forEach((step) => {
            dispatch({
              type: 'UPDATE_FORM_DATA',
              payload: {
                step: step as keyof OnboardingFormData,
                data: progress.formData[step],
              },
            });
          });
        }

        if (progress.stepValidation) {
          Object.values(progress.stepValidation).forEach((validation: any) => {
            dispatch({ type: 'SET_STEP_VALIDATION', payload: validation });
          });
        }
      }

      // TODO: Replace with actual Supabase load
      // const { data: profile } = await supabase
      //   .from('profiles')
      //   .select('*')
      //   .eq('user_id', state.userId)
      //   .single();
      
      // if (profile) {
      //   // Map profile data back to form data
      //   dispatch({
      //     type: 'SET_CURRENT_STEP',
      //     payload: profile.onboarding_step || 0,
      //   });
      //   // ... map other fields
      // }

    } catch (error) {
      console.error('Failed to load onboarding progress:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to load saved progress' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Load progress when user ID changes
  useEffect(() => {
    if (state.userId) {
      loadProgress();
    }
  }, [state.userId]);

  // Helper functions
  const nextStep = () => {
    const nextStepId = state.currentStep + 1;
    if (nextStepId < ONBOARDING_STEPS.length) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: nextStepId });
    }
  };

  const previousStep = () => {
    const prevStepId = state.currentStep - 1;
    if (prevStepId >= 0) {
      dispatch({ type: 'SET_CURRENT_STEP', payload: prevStepId });
    }
  };

  const goToStep = (stepId: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: stepId });
  };

  const updateStepData = (step: keyof OnboardingFormData, data: any) => {
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: { step, data },
    });
  };

  const validateCurrentStep = (): boolean => {
    const currentStepValidation = state.stepValidation[state.currentStep];
    return currentStepValidation?.isValid || false;
  };

  const saveProgress = async (): Promise<void> => {
    await saveToDatabase();
  };

  const resetOnboarding = () => {
    dispatch({ type: 'RESET_ONBOARDING' });
    if (state.userId) {
      localStorage.removeItem(`onboarding_progress_${state.userId}`);
    }
  };

  const contextValue: OnboardingContextType = {
    state,
    dispatch,
    nextStep,
    previousStep,
    goToStep,
    updateStepData,
    validateCurrentStep,
    saveProgress,
    resetOnboarding,
  };

  return (
    <OnboardingContext.Provider value={contextValue}>
      {children}
    </OnboardingContext.Provider>
  );
}

// Hook to use the onboarding context
export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
}

export default OnboardingContext;