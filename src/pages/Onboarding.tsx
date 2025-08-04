import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { OnboardingProvider } from '@/components/onboarding/OnboardingContext';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

/**
 * Inner component that uses the OnboardingProvider context
 * This separation is needed because we need to use the context inside the provider
 */
function OnboardingContent() {
  const navigate = useNavigate();
  const { 
    state, 
    completeOnboarding, 
    loadFromDatabase, 
    isOnboardingComplete,
    error: onboardingError 
  } = useOnboarding();
  const [isCompleting, setIsCompleting] = useState(false);

  // Handle completion
  const handleComplete = async () => {
    try {
      setIsCompleting(true);
      await completeOnboarding();
      
      // Redirect to dashboard after successful completion
      navigate('/dashboard', { replace: true });
    } catch (error) {
      console.error('Error completing onboarding:', error);
      // Error will be shown via the onboarding context
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle wizard close (optional skip)
  const handleClose = () => {
    // Redirect to dashboard even if not completed
    navigate('/dashboard', { replace: true });
  };

  // Load data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        await loadFromDatabase();
      } catch (error) {
        console.error('Error loading onboarding data:', error);
        // Continue with empty form if loading fails
      }
    };

    if (state.userId) {
      loadData();
    }
  }, [state.userId]);

  // Show completion screen if we're at the final step
  if (state.currentStep === 6) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <CardTitle className="text-xl text-gray-900">
              Setup Complete!
            </CardTitle>
            <CardDescription>
              Your account is ready. You can now start managing your business communications.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {onboardingError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{onboardingError}</p>
              </div>
            )}
            
            <div className="flex flex-col space-y-2">
              <Button 
                onClick={handleComplete} 
                disabled={isCompleting}
                className="w-full"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Finalizing...
                  </>
                ) : (
                  'Get Started'
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleClose} 
                disabled={isCompleting}
                className="w-full"
              >
                Skip for Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the main onboarding wizard
  return (
    <OnboardingWizard 
      onClose={handleClose}
      showCloseButton={true}
    />
  );
}

/**
 * Main Onboarding page component
 * Handles authentication, routing logic, and provides the onboarding context
 */
export default function Onboarding() {
  const { user, profile, loading } = useAuth();
  const [shouldRedirect, setShouldRedirect] = useState<string | null>(null);

  useEffect(() => {
    // Don't do anything while auth is loading
    if (loading) {
      return;
    }

    // Redirect to auth if not authenticated
    if (!user) {
      setShouldRedirect('/auth?redirect=/onboarding');
      return;
    }

    // If profile exists and onboarding is already completed, redirect to dashboard
    if (profile?.onboarding_completed) {
      setShouldRedirect('/dashboard');
      return;
    }

    // If we have a user but no profile, we might need to wait for profile to load
    // or create a basic profile record
    if (user && !profile) {
      // You might want to create a basic profile here or handle this case
      console.log('User exists but no profile found - this might be a new user');
    }
  }, [user, profile, loading]);

  // Show loading state while auth is loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Handle redirects
  if (shouldRedirect) {
    return <Navigate to={shouldRedirect} replace />;
  }

  // Ensure we have a user to proceed
  if (!user) {
    return <Navigate to="/auth?redirect=/onboarding" replace />;
  }

  // Render the onboarding flow
  return (
    <OnboardingProvider userId={user.id}>
      <OnboardingContent />
    </OnboardingProvider>
  );
}

/**
 * Helper component for protected routes that require onboarding
 * You can wrap routes with this to ensure onboarding is completed
 */
export function RequireOnboarding({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-gray-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // If onboarding is not completed, redirect to onboarding
  if (profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
}

/**
 * Helper function to check if a user needs onboarding
 * Can be used in other components to conditionally show onboarding prompts
 */
export function useOnboardingStatus() {
  const { profile, loading } = useAuth();
  
  return {
    needsOnboarding: profile && !profile.onboarding_completed,
    onboardingCompleted: profile?.onboarding_completed || false,
    currentStep: profile?.onboarding_step || 0,
    loading,
  };
}