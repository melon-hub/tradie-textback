import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useOnboarding } from './OnboardingContext';
import { ONBOARDING_STEPS } from '@/types/onboarding';
import { cn } from '@/lib/utils';
import { useOnboardingDevTools } from '@/hooks/useOnboardingDevTools';

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
    saveProgress,
    dispatch
  } = useOnboarding();
  
  // Enable dev tools in development mode
  useOnboardingDevTools();

  const currentStepData = ONBOARDING_STEPS[state.currentStep];
  const isFirstStep = state.currentStep === 0;
  const isLastStep = state.currentStep === ONBOARDING_STEPS.length - 1;
  
  // Automatically validate welcome step (step 0) since it has no required fields
  const canGoNext = state.currentStep === 0 ? true : (validateCurrentStep() || !currentStepData?.required);

  // Automatically mark welcome step as valid
  React.useEffect(() => {
    if (state.currentStep === 0) {
      dispatch({
        type: 'SET_STEP_VALIDATION',
        payload: {
          stepId: 0,
          isValid: true,
          errors: [],
        },
      });
    }
  }, [state.currentStep, dispatch]);
  const progressPercentage = ((state.currentStep + 1) / ONBOARDING_STEPS.length) * 100;
  
  // Ref for mobile scroller to ensure current step is visible
  const mobileScrollerRef = React.useRef<HTMLDivElement | null>(null);
  
  React.useEffect(() => {
    // Only run on mobile (tailwind sm:hidden equivalent)
    if (typeof window !== "undefined" && window.innerWidth < 640 && mobileScrollerRef.current) {
      const scroller = mobileScrollerRef.current;
      const current = scroller.children[state.currentStep] as HTMLElement | undefined;
      if (current) current.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    }
  }, [state.currentStep]);

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
    <div className={cn("min-h-screen bg-gray-50 py-2 md:py-4 px-2 md:px-4 overflow-x-hidden", className)}>
      <div className="max-w-2xl mx-auto">
        {/* Integrated Header Card */}
        <Card className="mb-4 md:mb-6">
          <CardContent className="p-3 md:p-4">
            {/* Top row: Title, Progress Bar, Step counter */}
            <div className="flex items-center justify-between mb-3 md:mb-4">
              <h1 className="text-base md:text-lg font-semibold text-gray-900">
                Account Setup
              </h1>
              
              {/* Center: Progress bar with percentage */}
              <div className="flex-1 max-w-xs mx-3 md:mx-6">
                <div className="flex items-center space-x-2 md:space-x-3">
                  <Progress value={progressPercentage} className="h-1 md:h-1.5 flex-1" />
                  <span className="text-xs md:text-sm font-medium text-gray-600 whitespace-nowrap">
                    {Math.round(progressPercentage)}%
                  </span>
                </div>
              </div>

              {/* Right: Step counter and close button */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <span className="text-xs md:text-sm text-gray-500 whitespace-nowrap">
                  {state.currentStep + 1}/{ONBOARDING_STEPS.length}
                </span>
                {showCloseButton && onClose && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1"
                  >
                    <X className="w-3 h-3 md:w-4 md:h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Bottom row: Step indicators */}
            <div className="border-t pt-3 md:pt-4" style={{ contain: "layout paint style" }}>
              {/* Desktop Step Indicators */}
              <div className="hidden md:block">
                {/* Grid container for perfect alignment */}
                <div className="grid grid-cols-7 gap-0 items-start">
                  {ONBOARDING_STEPS.map((step, index) => {
                    const isActive = index === state.currentStep;
                    const isCompleted = Object.keys(state.stepValidation)
                      .filter(stepId => state.stepValidation[parseInt(stepId)]?.isValid)
                      .map(stepId => parseInt(stepId))
                      .includes(index);
                    const isClickable = index < state.currentStep || 
                      (index === state.currentStep + 1 && Object.keys(state.stepValidation)
                        .filter(stepId => state.stepValidation[parseInt(stepId)]?.isValid)
                        .map(stepId => parseInt(stepId))
                        .includes(state.currentStep));

                    return (
                      <div key={step.id} className="flex flex-col items-center">
                        {/* Circle container */}
                        <div className="flex items-center justify-center mb-1">
                            {isClickable && goToStep ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => goToStep(index)}
                                className="p-0 h-auto hover:bg-transparent"
                              >
                                <div className={cn(
                                  "flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium transition-colors",
                                  isCompleted 
                                    ? "bg-green-100 border-green-600 text-green-600"
                                    : isActive 
                                    ? "bg-blue-100 border-blue-600 text-blue-600"
                                    : "bg-white border-gray-300 text-gray-400"
                                )}>
                                  {isCompleted ? "✓" : index + 1}
                                </div>
                              </Button>
                            ) : (
                              <div className={cn(
                                "flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium transition-colors",
                                isCompleted 
                                  ? "bg-green-100 border-green-600 text-green-600"
                                  : isActive 
                                  ? "bg-blue-100 border-blue-600 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-400"
                              )}>
                                {isCompleted ? "✓" : index + 1}
                              </div>
                            )}
                        </div>

                        {/* Step Label */}
                        <div className="px-1">
                          <span className={cn(
                            "text-xs text-center block transition-colors leading-tight",
                            isCompleted 
                              ? "text-green-700 font-medium"
                              : isActive 
                              ? "text-blue-700 font-medium"
                              : "text-gray-500"
                          )}>
                            {step.title}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mobile & Tablet Step Indicators */}
              <div className="md:hidden">
                {/* Tablet view (sm to md) - Grid-based layout for stability */}
                <div className="hidden sm:block md:hidden">
                  <div className="grid grid-cols-7 gap-0 items-start">
                    {ONBOARDING_STEPS.map((step, index) => {
                      const isActive = index === state.currentStep;
                      const isCompleted = Object.keys(state.stepValidation)
                        .filter(stepId => state.stepValidation[parseInt(stepId)]?.isValid)
                        .map(stepId => parseInt(stepId))
                        .includes(index);

                      return (
                        <div key={step.id} className="flex flex-col items-center">
                          <div className="h-8 w-8 mb-1 flex items-center justify-center">
                            <div
                              className={cn(
                                "w-6 h-6 rounded-full border text-xs font-medium grid place-items-center select-none",
                                isCompleted
                                  ? "bg-green-100 border-green-600 text-green-600"
                                  : isActive
                                  ? "bg-blue-100 border-blue-600 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-400"
                              )}
                            >
                              {isCompleted ? "✓" : index + 1}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "text-[11px] leading-[12px] text-center px-1 max-w-[100px] min-h-[24px] line-clamp-2",
                              isCompleted
                                ? "text-green-700 font-medium"
                                : isActive
                                ? "text-blue-700 font-medium"
                                : "text-gray-500"
                            )}
                          >
                            {step.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile view (below sm) - Enhanced for step 7 visibility */}
                <div className="sm:hidden">
                  <div
                    ref={mobileScrollerRef}
                    className="flex items-start gap-0.5 overflow-x-auto pb-2 px-1 scrollbar-none"
                    style={{ 
                      WebkitOverflowScrolling: "touch",
                      scrollPaddingRight: "1rem"
                    }}
                  >
                    {ONBOARDING_STEPS.map((step, index) => {
                      const isActive = index === state.currentStep;
                      const isCompleted = Object.keys(state.stepValidation)
                        .filter(stepId => state.stepValidation[parseInt(stepId)]?.isValid)
                        .map(stepId => parseInt(stepId))
                        .includes(index);

                      return (
                        <div
                          key={step.id}
                          className="flex flex-col items-center flex-shrink-0 snap-start"
                          style={{ width: 48, minWidth: 48 }}
                        >
                          <div className="flex items-center justify-center h-6 w-6 mb-0.5">
                            <div
                              className={cn(
                                "w-4 h-4 rounded-full border text-[10px] font-medium grid place-items-center select-none",
                                isCompleted
                                  ? "bg-green-100 border-green-600 text-green-600"
                                  : isActive
                                  ? "bg-blue-100 border-blue-600 text-blue-600"
                                  : "bg-white border-gray-300 text-gray-400"
                              )}
                            >
                              {isCompleted ? "✓" : index + 1}
                            </div>
                          </div>
                          <span
                            className={cn(
                              "block w-full overflow-hidden text-[9px] leading-[11px] text-center",
                              isCompleted
                                ? "text-green-700 font-medium"
                                : isActive
                                ? "text-blue-700 font-medium"
                                : "text-gray-500"
                            )}
                          >
                            {step.title.split(" ")[0]}
                          </span>
                        </div>
                      );
                    })}
                    {/* Spacer to ensure last item is visible */}
                    <div className="w-4 flex-shrink-0" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main content card */}
        <Card className="mb-4 md:mb-6">
          <CardContent className="px-6 py-6">
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
              disabled={!canGoNext || state.isLoading}
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