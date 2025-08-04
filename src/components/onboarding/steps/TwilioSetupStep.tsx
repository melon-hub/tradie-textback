// =============================================================================
// TWILIO SETUP STEP - ENHANCED VERSION
// =============================================================================
// Complete Twilio integration step for onboarding
// Features: credential input, validation, phone number selection, testing
// =============================================================================

import React, { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Info, 
  ArrowRight, 
  Key,
  Search,
  Settings,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  ExternalLink,
  Shield
} from 'lucide-react';

import { useOnboarding } from '../OnboardingContext';
import TwilioPhoneSelector from '@/components/twilio/TwilioPhoneSelector';
import TwilioErrorDisplay from '@/components/twilio/TwilioErrorDisplay';
import { 
  validateTwilioCredentials, 
  saveTwilioSettings, 
  getUserTwilioSettings,
  testTwilioConnection
} from '@/services/twilio';
import { supabase } from '@/integrations/supabase/client';

import type {
  TwilioCredentials,
  TwilioSettings,
  TwilioError,
  AvailablePhoneNumber,
  TwilioValidationResponse,
  TwilioSetupStep as SetupStep
} from '@/types/twilio';

// =============================================================================
// COMPONENT STATE TYPES
// =============================================================================

interface TwilioSetupState {
  step: SetupStep;
  credentials: TwilioCredentials;
  validation: TwilioValidationResponse | null;
  selectedNumber: AvailablePhoneNumber | null;
  settings: TwilioSettings | null;
  error: TwilioError | null;
  loading: boolean;
  showCredentials: boolean;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TwilioSetupStep() {
  const { state, dispatch } = useOnboarding();
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [setupState, setSetupState] = useState<TwilioSetupState>({
    step: 'credentials',
    credentials: {
      accountSid: '',
      authToken: ''
    },
    validation: null,
    selectedNumber: null,
    settings: null,
    error: null,
    loading: false,
    showCredentials: false
  });

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  useEffect(() => {
    // Get current user
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      
      if (user) {
        // Check if user already has Twilio settings
        const existingSettings = await getUserTwilioSettings(user.id);
        if (existingSettings) {
          setSetupState(prev => ({
            ...prev,
            settings: existingSettings,
            step: 'complete'
          }));
        }
      }
    };

    getCurrentUser();
  }, []);

  useEffect(() => {
    // Mark step as valid when setup is complete
    dispatch({
      type: 'SET_STEP_VALIDATION',
      payload: {
        stepId: 4,
        isValid: setupState.step === 'complete' || setupState.settings !== null,
        errors: [],
      },
    });
  }, [dispatch, setupState.step, setupState.settings]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!setupState.credentials.accountSid || !setupState.credentials.authToken) {
      setSetupState(prev => ({
        ...prev,
        error: {
          code: 20003,
          message: 'Please enter both Account SID and Auth Token',
          status: 400
        }
      }));
      return;
    }

    setSetupState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const validation = await validateTwilioCredentials(setupState.credentials);
      
      if (validation.valid) {
        setSetupState(prev => ({
          ...prev,
          validation,
          step: 'phone-selection',
          loading: false
        }));
      } else {
        setSetupState(prev => ({
          ...prev,
          error: validation.error || {
            code: 20003,
            message: 'Invalid credentials',
            status: 401
          },
          loading: false
        }));
      }
    } catch (error: any) {
      setSetupState(prev => ({
        ...prev,
        error: {
          code: error.code || 30008,
          message: error.message || 'Failed to validate credentials',
          status: error.status || 500
        },
        loading: false
      }));
    }
  };

  const handlePhoneNumberSelected = async (phoneNumber: AvailablePhoneNumber) => {
    if (!currentUser) {
      setSetupState(prev => ({
        ...prev,
        error: {
          code: 20003,
          message: 'User authentication required',
          status: 401
        }
      }));
      return;
    }

    setSetupState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const settings = await saveTwilioSettings(
        currentUser.id,
        setupState.credentials,
        phoneNumber.phoneNumber,
        `${window.location.origin}/api/webhooks/twilio`
      );

      setSetupState(prev => ({
        ...prev,
        selectedNumber: phoneNumber,
        settings,
        step: 'complete',
        loading: false
      }));
    } catch (error: any) {
      setSetupState(prev => ({
        ...prev,
        error: {
          code: error.code || 30008,
          message: error.message || 'Failed to save settings',
          status: error.status || 500
        },
        loading: false
      }));
    }
  };

  const handleTestConnection = async () => {
    if (!setupState.settings) return;

    setSetupState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const testResult = await testTwilioConnection(
        setupState.settings,
        setupState.settings.phoneNumber, // Test by sending to same number
        'Test message from your Twilio integration setup'
      );

      if (testResult.success) {
        // Update settings to mark as verified
        const { error } = await supabase
          .from('twilio_settings')
          .update({ verified_at: new Date().toISOString() })
          .eq('id', setupState.settings.id);

        if (!error) {
          setSetupState(prev => ({
            ...prev,
            settings: prev.settings ? {
              ...prev.settings,
              verifiedAt: new Date().toISOString()
            } : null,
            loading: false
          }));
        }
      } else {
        setSetupState(prev => ({
          ...prev,
          error: testResult.error || {
            code: 30008,
            message: 'Connection test failed',
            status: 500
          },
          loading: false
        }));
      }
    } catch (error: any) {
      setSetupState(prev => ({
        ...prev,
        error: {
          code: error.code || 30008,
          message: error.message || 'Connection test failed',
          status: error.status || 500
        },
        loading: false
      }));
    }
  };

  const handleStartOver = () => {
    setSetupState({
      step: 'credentials',
      credentials: { accountSid: '', authToken: '' },
      validation: null,
      selectedNumber: null,
      settings: null,
      error: null,
      loading: false,
      showCredentials: false
    });
  };

  const handleError = (error: TwilioError) => {
    setSetupState(prev => ({ ...prev, error }));
  };

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getStepIcon = (step: SetupStep) => {
    switch (step) {
      case 'credentials':
        return <Key className="h-5 w-5" />;
      case 'validation':
        return <Shield className="h-5 w-5" />;
      case 'phone-selection':
        return <Search className="h-5 w-5" />;
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      default:
        return <Settings className="h-5 w-5" />;
    }
  };

  const getStepStatus = (step: SetupStep) => {
    if (setupState.step === step) {
      return setupState.loading ? 'in-progress' : 'current';
    }
    
    const stepOrder: SetupStep[] = ['credentials', 'validation', 'phone-selection', 'complete'];
    const currentIndex = stepOrder.indexOf(setupState.step);
    const stepIndex = stepOrder.indexOf(step);
    
    return stepIndex < currentIndex ? 'completed' : 'pending';
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className="space-y-6 pt-2">
      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-6 p-4 bg-gray-50 rounded-lg">
        {(['credentials', 'phone-selection', 'complete'] as SetupStep[]).map((step, index) => {
          const status = getStepStatus(step);
          const isLast = index === 2;
          
          return (
            <div key={step} className="flex items-center">
              <div className={`
                flex items-center justify-center w-10 h-10 rounded-full border-2 
                ${status === 'completed' ? 'bg-green-100 border-green-500 text-green-700' : 
                  status === 'current' || status === 'in-progress' ? 'bg-blue-100 border-blue-500 text-blue-700' : 
                  'bg-gray-100 border-gray-300 text-gray-500'}
              `}>
                {status === 'in-progress' ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  getStepIcon(step)
                )}
              </div>
              
              {!isLast && (
                <div className={`
                  ml-4 w-12 h-0.5 
                  ${status === 'completed' ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
          );
        })}
      </div>

      {/* Error Display */}
      {setupState.error && (
        <TwilioErrorDisplay
          error={setupState.error}
          context="credential_validation"
          onRetry={() => {
            setState(prev => ({ ...prev, error: null }));
            if (setupState.step === 'credentials') {
              // Allow retry of credential validation
            } else if (setupState.step === 'phone-selection') {
              // Error context would be phone_number_search or phone_number_purchase
            }
          }}
          onDismiss={() => setState(prev => ({ ...prev, error: null }))}
        />
      )}

      {/* Main Content */}
      <div className="space-y-6">

        {/* Credentials Input Step */}
        {setupState.step === 'credentials' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Twilio Account Credentials
              </CardTitle>
              <CardDescription>
                Enter your Twilio Account SID and Auth Token to connect your account
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Help Information */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <div className="space-y-2">
                    <p><strong>Don't have a Twilio account?</strong></p>
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href="https://www.twilio.com/try-twilio" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2"
                      >
                        Sign up for Twilio
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Credentials Form */}
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="accountSid">Account SID</Label>
                  <Input
                    id="accountSid"
                    placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    value={setupState.credentials.accountSid}
                    onChange={(e) => setSetupState(prev => ({
                      ...prev,
                      credentials: { ...prev.credentials, accountSid: e.target.value }
                    }))}
                    className="font-mono"
                  />
                  <p className="text-xs text-gray-600">
                    Found in your Twilio Console dashboard
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="authToken">Auth Token</Label>
                  <div className="relative">
                    <Input
                      id="authToken"
                      type={setupState.showCredentials ? 'text' : 'password'}
                      placeholder="Enter your auth token"
                      value={setupState.credentials.authToken}
                      onChange={(e) => setSetupState(prev => ({
                        ...prev,
                        credentials: { ...prev.credentials, authToken: e.target.value }
                      }))}
                      className="font-mono pr-12"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                      onClick={() => setSetupState(prev => ({ 
                        ...prev, 
                        showCredentials: !prev.showCredentials 
                      }))}
                    >
                      {setupState.showCredentials ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">
                    Found in your Twilio Console dashboard (click to reveal)
                  </p>
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={setupState.loading}
                >
                  {setupState.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Validating Credentials...
                    </>
                  ) : (
                    <>
                      <Shield className="h-4 w-4 mr-2" />
                      Validate Credentials
                    </>
                  )}
                </Button>
              </form>

              {/* Security Notice */}
              <Alert>
                <Shield className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  <strong>Security:</strong> Your credentials are encrypted and stored securely using Supabase Vault. 
                  They are never stored in plain text and are only used to configure your Twilio integration.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        )}

        {/* Phone Number Selection Step */}
        {setupState.step === 'phone-selection' && setupState.validation?.valid && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Choose Your Business Phone Number
              </CardTitle>
              <CardDescription>
                Select a phone number that will be used for all SMS communications with your customers
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <TwilioPhoneSelector
                credentials={setupState.credentials}
                onPhoneNumberSelected={handlePhoneNumberSelected}
                onError={handleError}
                showPricing={true}
                autoSearch={true}
                filters={{
                  areaCode: '02',
                  capabilities: {
                    sms: true,
                    mms: true,
                    voice: true,
                    fax: false
                  }
                }}
              />
            </CardContent>
          </Card>
        )}

        {/* Setup Complete Step */}
        {setupState.step === 'complete' && setupState.settings && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                Twilio Integration Complete!
              </CardTitle>
              <CardDescription>
                Your business phone number is ready for SMS communications
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* Settings Summary */}
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-900">Business Phone Number</span>
                    <span className="font-mono text-green-700 font-semibold">
                      {setupState.settings.phoneNumber}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-900">Status</span>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {setupState.settings.status === 'active' ? 'Active' : 'Pending'}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-green-900">Features</span>
                    <div className="flex gap-1">
                      {setupState.settings.capabilities.sms && (
                        <Badge variant="outline" className="text-xs">SMS</Badge>
                      )}
                      {setupState.settings.capabilities.mms && (
                        <Badge variant="outline" className="text-xs">MMS</Badge>
                      )}
                      {setupState.settings.capabilities.voice && (
                        <Badge variant="outline" className="text-xs">Voice</Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Test Connection */}
              <div className="space-y-4">
                <h4 className="font-medium">Test Your Connection</h4>
                <p className="text-sm text-gray-600">
                  Send a test message to verify your Twilio integration is working correctly.
                </p>
                
                <Button 
                  onClick={handleTestConnection}
                  disabled={setupState.loading}
                  variant="outline"
                >
                  {setupState.loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Testing Connection...
                    </>
                  ) : (
                    <>
                      <Phone className="h-4 w-4 mr-2" />
                      Test Connection
                    </>
                  )}
                </Button>

                {setupState.settings.verifiedAt && (
                  <div className="flex items-center gap-2 text-sm text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Connection verified on {new Date(setupState.settings.verifiedAt).toLocaleString()}
                  </div>
                )}
              </div>

              {/* What's Next */}
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  <strong>What's next?</strong>
                  <div className="mt-2 space-y-1 text-sm">
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Your SMS templates are ready to use
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      Customers can now receive automated messages
                    </div>
                    <div className="flex items-center gap-2">
                      <ArrowRight className="h-3 w-3" />
                      You can manage settings anytime in your dashboard
                    </div>
                  </div>
                </AlertDescription>
              </Alert>

              {/* Start Over Option */}
              <div className="pt-4 border-t">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleStartOver}
                >
                  Use Different Credentials
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Skip Option */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Optional Step:</strong> You can skip this setup and configure Twilio later 
            in your account settings. The rest of the system will work without SMS functionality.
          </AlertDescription>
        </Alert>

      </div>
    </div>
  );
}