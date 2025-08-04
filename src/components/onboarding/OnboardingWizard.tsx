import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useOnboarding } from './OnboardingContext';
import { ONBOARDING_STEPS } from '@/types/onboarding';
import { cn } from '@/lib/utils';

// Step components imports
import BasicInfoStep from './steps/BasicInfoStep';
import BusinessDetailsStep from './steps/BusinessDetailsStep';
import ServiceAreaStep from './steps/ServiceAreaStep';
import TwilioSetupStep from './steps/TwilioSetupStep';
import TemplatesStep from './steps/TemplatesStep';
import ReviewStep from './steps/ReviewStep';
import ProgressBar from './ProgressBar';

interface OnboardingWizardProps {
  className?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  onComplete?: (data: any) => void;
  isPublicMode?: boolean;
}

export default function OnboardingWizard({ 
  className, 
  onClose,
  showCloseButton = false,
  onComplete,
  isPublicMode = false
}: OnboardingWizardProps) {
  const { 
    state, 
    nextStep, 
    previousStep, 
    goToStep,
    validateCurrentStep,
    saveProgress 
  } = useOnboarding();

  const currentStepData = ONBOARDING_STEPS[state.currentStep];
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === ONBOARDING_STEPS.length - 1;
  const canGoNext = validateCurrentStep() || !currentStepData?.required;
  const progressPercentage = ((state.currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const handleNext = async () => {
    if (canGoNext) {
      // Skip database saves in public mode
      if (!isPublicMode) {
        await saveProgress();
      }
      
      // Handle completion in public mode
      if (isLastStep && isPublicMode && onComplete) {
        onComplete(state.formData);
        return;
      }
      
      nextStep();
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      previousStep();
    }
  };

  const handleSkip = async () => {
    if (!currentStepData?.required) {
      // Skip database saves in public mode
      if (!isPublicMode) {
        await saveProgress();
      }
      nextStep();
    }
  };

  const renderStepComponent = () => {
    switch (currentStepData?.component) {
      case 'BasicInfo':
        return <BasicInfoStep />;
      case 'BusinessDetails':
        return <BusinessDetailsStep />;
      case 'ServiceArea':
        return <ServiceAreaStep />;
      case 'TwilioSetup':
        return <TwilioSetupStep />;
      case 'SMSTemplates':
        return <TemplatesStep />;
      case 'Review':
        return <ReviewStep />;
      case 'Welcome':
        return (
          <div className="text-center space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Welcome to Tradie TextBack
              </h2>
              <p className="text-gray-600">
                Let's set up your account to get you started with managing your business communications.
              </p>
            </div>
            <div className="max-w-md mx-auto space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">1</span>
                </div>
                <p className="text-sm text-gray-600">Tell us about your trade and experience</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">2</span>
                </div>
                <p className="text-sm text-gray-600">Add your business details and credentials</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-600">3</span>
                </div>
                <p className="text-sm text-gray-600">Define your service area</p>
              </div>
            </div>
          </div>
        );


      case 'Complete':
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">
                Setup Complete!
              </h2>
              <p className="text-gray-600">
                Your account is now ready. You can start managing your business communications.
              </p>
            </div>
          </div>
        );
      default:
        return (
          <div className="text-center py-8">
            <p className="text-gray-500">Step content not found</p>
          </div>
        );
    }
  };

  return (
    <div className={cn("min-h-screen bg-gray-50 py-4 px-4", className)}>
      <div className="max-w-2xl mx-auto">
        {/* Header with close button */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-lg font-semibold text-gray-900">
              Account Setup
            </h1>
            {showCloseButton && onClose && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>

          {/* Progress Bar Component */}
          <ProgressBar
            currentStep={state.currentStep}
            totalSteps={ONBOARDING_STEPS.length}
            steps={ONBOARDING_STEPS}
            onStepClick={goToStep}
            allowSkip={!currentStepData?.required}
            completedSteps={Object.keys(state.stepValidation)
              .filter(stepId => state.stepValidation[parseInt(stepId)]?.isValid)
              .map(stepId => parseInt(stepId))}
            validSteps={Object.keys(state.stepValidation)
              .filter(stepId => state.stepValidation[parseInt(stepId)]?.isValid)
              .map(stepId => parseInt(stepId))}
          />
        </div>

        {/* Main content card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">
              {currentStepData?.title || 'Loading...'}
            </CardTitle>
            {currentStepData?.description && (
              <p className="text-gray-600 text-sm">
                {currentStepData.description}
              </p>
            )}
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {state.isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              renderStepComponent()
            )}

            {state.error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={isFirstStep || state.isLoading}
            className="flex items-center space-x-2"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </Button>

          <div className="flex items-center space-x-3">
            {!currentStepData?.required && (
              <Button
                variant="ghost"
                onClick={handleSkip}
                disabled={state.isLoading}
                className="text-gray-500 hover:text-gray-700"
              >
                Skip
              </Button>
            )}

            <Button
              onClick={handleNext}
              disabled={!canGoNext || state.isLoading || isLastStep}
              className="flex items-center space-x-2"
            >
              <span>{isLastStep ? 'Complete' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile-specific spacing */}
        <div className="h-safe-area-inset-bottom" />
      </div>
    </div>
  );
}