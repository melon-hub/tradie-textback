import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OnboardingProvider } from '@/components/onboarding/OnboardingContext';
import OnboardingWizard from '@/components/onboarding/OnboardingWizard';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Mail } from 'lucide-react';

/**
 * Public onboarding flow for new users
 * They complete all steps first, then create account at the end
 */
export default function OnboardingPublic() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showEmailStep, setShowEmailStep] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [onboardingData, setOnboardingData] = useState<any>(null);

  // Handle wizard completion (before account creation)
  const handleWizardComplete = (data: any) => {
    // Store the data and show email step
    setOnboardingData(data);
    setShowEmailStep(true);
  };

  // Handle account creation with magic link
  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !onboardingData) return;

    setIsSubmitting(true);

    try {
      // Sign up with magic link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?onboarding=complete`,
          data: {
            // Pass onboarding data through signup
            onboarding_data: onboardingData,
            user_type: 'tradie',
            name: onboardingData.basicInfo?.name || '',
            phone: onboardingData.basicInfo?.phone || ''
          }
        }
      });

      if (error) throw error;

      // Show success message
      toast({
        title: "Check your email!",
        description: "We've sent you a magic link to complete your signup.",
      });

      // Store onboarding data in localStorage for after auth
      localStorage.setItem('pending_onboarding', JSON.stringify(onboardingData));

      // Redirect to auth page with success message
      navigate('/auth', { 
        state: { 
          message: 'Check your email to activate your account',
          email 
        } 
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create account",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show email collection step
  if (showEmailStep) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl">Almost Done!</CardTitle>
            <CardDescription>
              Enter your email to create your account and start your free trial
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                <p className="text-sm text-gray-500 mt-1">
                  We'll send you a magic link to sign in
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting || !email}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Start Free Trial'
                )}
              </Button>

              <div className="text-center text-sm text-gray-500">
                <p>By signing up, you agree to our Terms of Service</p>
                <p>and Privacy Policy</p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show the onboarding wizard (no auth required)
  return (
    <OnboardingProvider userId={null}>
      <div className="min-h-screen bg-gray-50">
        <OnboardingWizard 
          onComplete={handleWizardComplete}
          isPublicMode={true}
          showCloseButton={true}
          onClose={() => navigate('/')}
        />
      </div>
    </OnboardingProvider>
  );
}