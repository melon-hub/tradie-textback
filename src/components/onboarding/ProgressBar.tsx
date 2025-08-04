import React from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { 
  CheckCircle2, 
  Circle, 
  Clock,
  User,
  Building2,
  MapPin,
  Phone,
  MessageSquare,
  Eye,
  PartyPopper
} from 'lucide-react';
import { OnboardingStep } from '@/types/onboarding';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  steps: OnboardingStep[];
  onStepClick?: (stepId: number) => void;
  allowSkip?: boolean;
  className?: string;
  completedSteps?: number[];
  validSteps?: number[];
}

// Map step components to icons
const getStepIcon = (component: string, isActive: boolean, isCompleted: boolean) => {
  const iconClass = cn(
    "h-4 w-4 transition-colors",
    isCompleted ? "text-green-600" : isActive ? "text-blue-600" : "text-gray-400"
  );

  switch (component) {
    case 'Welcome':
      return <PartyPopper className={iconClass} />;
    case 'BasicInfo':
      return <User className={iconClass} />;
    case 'BusinessDetails':
      return <Building2 className={iconClass} />;
    case 'ServiceArea':
      return <MapPin className={iconClass} />;
    case 'TwilioSetup':
      return <Phone className={iconClass} />;
    case 'SMSTemplates':
      return <MessageSquare className={iconClass} />;
    case 'Review':
      return <Eye className={iconClass} />;
    case 'Complete':
      return <CheckCircle2 className={iconClass} />;
    default:
      return <Circle className={iconClass} />;
  }
};

// Get shorter labels for mobile
const getShortLabel = (title: string) => {
  const shortLabels: Record<string, string> = {
    'Welcome': 'Welcome',
    'Basic Information': 'Basic',
    'Business Details': 'Business',
    'Service Area': 'Area',
    'Phone Setup': 'Phone',
    'SMS Templates': 'SMS',
    'Review & Confirm': 'Review',
    'Complete': 'Done',
  };
  return shortLabels[title] || title.split(' ')[0];
};

export default function ProgressBar({
  currentStep,
  totalSteps,
  steps,
  onStepClick,
  allowSkip = false,
  className,
  completedSteps = [],
  validSteps = []
}: ProgressBarProps) {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  const isStepClickable = (stepIndex: number) => {
    if (!onStepClick) return false;
    // Can always go back to previous steps
    if (stepIndex < currentStep) return true;
    // Can go to next step if current step is valid
    if (stepIndex === currentStep + 1 && validSteps.includes(currentStep)) return true;
    return false;
  };

  const getStepStatus = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) return 'completed';
    if (stepIndex === currentStep) return 'active';
    if (stepIndex < currentStep) return 'previous';
    return 'upcoming';
  };

  const getStepIndicator = (stepIndex: number, step: OnboardingStep) => {
    const status = getStepStatus(stepIndex);
    const isClickable = isStepClickable(stepIndex);

    switch (status) {
      case 'completed':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 border-2 border-green-600">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </div>
        );
      case 'active':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 border-2 border-blue-600">
            <span className="text-sm font-semibold text-blue-600">{stepIndex + 1}</span>
          </div>
        );
      case 'previous':
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 border-2 border-gray-400">
            <span className="text-sm font-medium text-gray-600">{stepIndex + 1}</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white border-2 border-gray-300">
            <span className="text-sm text-gray-400">{stepIndex + 1}</span>
          </div>
        );
    }
  };

  return (
    <div className={cn("w-full space-y-4", className)}>
      {/* Overall Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progress</span>
          <span className="text-gray-500">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
        <div className="text-center">
          <span className="text-xs text-gray-500">
            {Math.round(progressPercentage)}% complete
          </span>
        </div>
      </div>

      {/* Step Indicators - Desktop View */}
      <div className="hidden lg:flex items-center justify-between space-x-4">
        {steps.map((step, index) => {
          const status = getStepStatus(index);
          const isClickable = isStepClickable(index);

          return (
            <div key={step.id} className="flex flex-col items-center space-y-2 flex-1">
              {/* Step Indicator */}
              <div className="relative">
                {isClickable ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onStepClick?.(index)}
                    className="p-0 h-auto hover:bg-transparent"
                  >
                    {getStepIndicator(index, step)}
                  </Button>
                ) : (
                  getStepIndicator(index, step)
                )}
                
                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className={cn(
                    "absolute top-4 left-8 h-0.5 w-16 transition-colors",
                    status === 'completed' || (status === 'active' && index < currentStep)
                      ? "bg-green-600"
                      : status === 'active'
                      ? "bg-blue-600"
                      : "bg-gray-300"
                  )} />
                )}
              </div>

              {/* Step Info */}
              <div className="text-center space-y-1">
                <div className="flex items-center justify-center space-x-1">
                  {getStepIcon(step.component, status === 'active', status === 'completed')}
                  <p className={cn(
                    "text-xs font-medium transition-colors",
                    status === 'completed' ? "text-green-700" :
                    status === 'active' ? "text-blue-700" :
                    "text-gray-500"
                  )}>
                    {step.title}
                  </p>
                </div>
                
                {/* Step Status Badge */}
                {status === 'active' && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                    Current
                  </Badge>
                )}
                {status === 'completed' && (
                  <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                    Complete
                  </Badge>
                )}
                {!step.required && status !== 'completed' && (
                  <Badge variant="outline" className="text-xs">
                    Optional
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Step Indicators - Mobile/Tablet View */}
      <div className="lg:hidden">
        <div className="flex items-center space-x-2 overflow-x-auto pb-2">
          {steps.map((step, index) => {
            const status = getStepStatus(index);
            const isClickable = isStepClickable(index);

            return (
              <div key={step.id} className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  {/* Step Circle */}
                  {isClickable ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onStepClick?.(index)}
                      className="p-1 h-auto hover:bg-transparent"
                    >
                      {getStepIndicator(index, step)}
                    </Button>
                  ) : (
                    getStepIndicator(index, step)
                  )}

                  {/* Step Label */}
                  <div className="flex flex-col">
                    <div className="flex items-center space-x-1">
                      {getStepIcon(step.component, status === 'active', status === 'completed')}
                      <span className={cn(
                        "text-xs font-medium whitespace-nowrap transition-colors",
                        status === 'completed' ? "text-green-700" :
                        status === 'active' ? "text-blue-700" :
                        "text-gray-500"
                      )}>
                        {getShortLabel(step.title)}
                      </span>
                    </div>
                    
                    {/* Status indicators */}
                    <div className="flex items-center space-x-1 mt-1">
                      {status === 'active' && (
                        <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 px-1 py-0">
                          Now
                        </Badge>
                      )}
                      {status === 'completed' && (
                        <Badge variant="secondary" className="text-xs bg-green-100 text-green-800 px-1 py-0">
                          ✓
                        </Badge>
                      )}
                      {!step.required && status !== 'completed' && (
                        <Badge variant="outline" className="text-xs px-1 py-0">
                          Opt
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Connection Line for mobile */}
                  {index < steps.length - 1 && (
                    <div className={cn(
                      "w-4 h-0.5 transition-colors",
                      status === 'completed' ? "bg-green-600" :
                      status === 'active' ? "bg-blue-600" : "bg-gray-300"
                    )} />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Current Step Info */}
      <div className="text-center bg-gray-50 p-3 rounded-lg">
        <div className="flex items-center justify-center space-x-2 mb-1">
          {getStepIcon(steps[currentStep]?.component, true, false)}
          <h4 className="font-medium text-gray-900">
            {steps[currentStep]?.title}
          </h4>
        </div>
        {steps[currentStep]?.description && (
          <p className="text-sm text-gray-600">
            {steps[currentStep].description}
          </p>
        )}
        
        {/* Step requirements */}
        <div className="flex items-center justify-center space-x-4 mt-2">
          {steps[currentStep]?.required ? (
            <Badge variant="secondary" className="text-xs">
              Required
            </Badge>
          ) : (
            <Badge variant="outline" className="text-xs">
              Optional
            </Badge>
          )}
          
          {allowSkip && !steps[currentStep]?.required && (
            <Badge variant="outline" className="text-xs">
              Can Skip
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
}