import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Clock, AlertCircle, ArrowLeft } from 'lucide-react';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessingOnboarding, setIsProcessingOnboarding] = useState(false);

  useEffect(() => {
    const processAuthCallback = async () => {
      try {
        // First, wait for auth state to settle
        if (authLoading) {
          return;
        }

        // Check if user is authenticated
        if (!user) {
          setStatus('error');
          setErrorMessage('Authentication failed. Please try logging in again.');
          toast({
            title: "Authentication failed",
            description: "Please try logging in again.",
            variant: "destructive"
          });
          return;
        }

        // Check for onboarding completion parameter
        const onboardingComplete = searchParams.get('onboarding');
        
        if (onboardingComplete === 'complete') {
          // Process onboarding data
          await processOnboardingData(user.id);
        } else {
          // Regular auth callback without onboarding
          setStatus('success');
          toast({
            title: "Welcome back!",
            description: "You're successfully signed in.",
          });
          
          // Redirect to dashboard after a short delay
          setTimeout(() => {
            navigate('/dashboard');
          }, 1500);
        }

      } catch (error) {
        console.error('Auth callback error:', error);
        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'An unexpected error occurred');
        toast({
          title: "Authentication error",
          description: error instanceof Error ? error.message : 'An unexpected error occurred',
          variant: "destructive"
        });
      }
    };

    processAuthCallback();
  }, [user, authLoading, searchParams, navigate, toast]);

  const processOnboardingData = async (userId: string) => {
    setIsProcessingOnboarding(true);
    
    try {
      // Retrieve stored onboarding data from localStorage
      const storedOnboardingData = localStorage.getItem('onboardingData');
      
      if (!storedOnboardingData) {
        throw new Error('No onboarding data found. Please complete the onboarding process again.');
      }

      const onboardingData = JSON.parse(storedOnboardingData);
      
      // Call the auth-callback-handler edge function
      const { data, error } = await supabase.functions.invoke('auth-callback-handler', {
        body: {
          user_id: userId,
          stored_onboarding_data: onboardingData
        }
      });

      if (error) {
        throw new Error(`Failed to process onboarding data: ${error.message}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to process onboarding data');
      }

      // Clear localStorage after successful processing
      localStorage.removeItem('onboardingData');
      
      setStatus('success');
      toast({
        title: "Welcome to TradiePro!",
        description: "Your account has been set up successfully.",
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Onboarding processing error:', error);
      setStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Failed to process onboarding data');
      toast({
        title: "Onboarding failed",
        description: error instanceof Error ? error.message : 'Failed to process onboarding data',
        variant: "destructive"
      });
    } finally {
      setIsProcessingOnboarding(false);
    }
  };

  const handleRetry = () => {
    if (user) {
      const onboardingComplete = searchParams.get('onboarding');
      if (onboardingComplete === 'complete') {
        processOnboardingData(user.id);
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/auth');
    }
  };

  const handleBackToLogin = () => {
    // Clear any stored data and redirect to login
    localStorage.removeItem('onboardingData');
    navigate('/auth');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6 space-y-6">
            <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto">
              <Clock className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">Verifying Authentication</h2>
              <p className="text-muted-foreground">
                Please wait while we verify your login...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'processing' || isProcessingOnboarding) {
    const isOnboarding = searchParams.get('onboarding') === 'complete';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6 space-y-6">
            <div className="bg-primary/10 p-6 rounded-full w-fit mx-auto">
              <Clock className="h-12 w-12 text-primary animate-spin" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">
                {isOnboarding ? 'Setting Up Your Account' : 'Processing Login'}
              </h2>
              <p className="text-muted-foreground">
                {isOnboarding 
                  ? 'Please wait while we set up your TradiePro account with your onboarding information...'
                  : 'Please wait while we complete your login...'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'success') {
    const isOnboarding = searchParams.get('onboarding') === 'complete';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-success/5 to-success/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="p-6 space-y-6">
            <div className="bg-success/10 p-6 rounded-full w-fit mx-auto">
              <CheckCircle className="h-12 w-12 text-success" />
            </div>
            <div className="space-y-3">
              <h2 className="text-2xl font-bold">
                {isOnboarding ? 'Welcome to TradiePro!' : 'Welcome Back!'}
              </h2>
              <p className="text-muted-foreground">
                {isOnboarding 
                  ? 'Your account has been set up successfully. Redirecting to your dashboard...'
                  : 'You\'re successfully signed in. Redirecting to dashboard...'
                }
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-destructive/5 to-destructive/10 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 space-y-6">
            <div className="text-center space-y-4">
              <div className="bg-destructive/10 p-6 rounded-full w-fit mx-auto">
                <AlertCircle className="h-12 w-12 text-destructive" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold">Authentication Error</h2>
                <p className="text-muted-foreground">
                  We encountered an issue processing your login.
                </p>
              </div>
            </div>

            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Button 
                onClick={handleRetry}
                className="w-full"
              >
                Try Again
              </Button>
              
              <Button 
                variant="outline"
                onClick={handleBackToLogin}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default AuthCallback;