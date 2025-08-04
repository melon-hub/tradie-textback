// =============================================================================
// ENHANCED TWILIO SETTINGS FORM
// =============================================================================
// Complete Twilio settings management for the settings page
// Features: credential management, phone number selection, testing, templates
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { 
  MessageSquare, 
  Phone, 
  Key, 
  Send, 
  Copy, 
  Eye, 
  EyeOff, 
  Shield, 
  Webhook,
  CheckCircle,
  AlertTriangle,
  Info,
  Settings,
  Trash2,
  Plus,
  Edit,
  Save,
  X,
  Loader2,
  ExternalLink
} from 'lucide-react';

import TwilioPhoneSelector from '@/components/twilio/TwilioPhoneSelector';
import { 
  validateTwilioCredentials,
  saveTwilioSettings,
  getUserTwilioSettings,
  testTwilioConnection,
  twilioService
} from '@/services/twilio';
import { hasStoredCredentials, deleteStoredCredentials } from '@/services/vault';

import type {
  TwilioCredentials,
  TwilioSettings,
  TwilioError,
  AvailablePhoneNumber,
  TwilioValidationResponse
} from '@/types/twilio';

// =============================================================================
// INTERFACES
// =============================================================================

interface SmsTemplate {
  id?: string;
  user_id: string;
  template_type: 'missed_call' | 'after_hours' | 'job_confirmation' | 'appointment_reminder' | 'follow_up' | 'quote_ready' | 'invoice_sent' | 'custom';
  content: string;
  variables: string[];
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

interface TwilioSettingsState {
  settings: TwilioSettings | null;
  credentials: TwilioCredentials;
  hasCredentials: boolean;
  loading: boolean;
  saving: boolean;
  testing: boolean;
  error: TwilioError | null;
  showCredentials: boolean;
  validation: TwilioValidationResponse | null;
}

// =============================================================================
// DEFAULT TEMPLATES
// =============================================================================

const DEFAULT_SMS_TEMPLATES: Omit<SmsTemplate, 'id' | 'user_id' | 'created_at' | 'updated_at'>[] = [
  {
    template_type: 'missed_call',
    content: 'Hi {customer_name}, thanks for calling {business_name}! We missed your call but will get back to you within {callback_window} minutes. For urgent matters, please call again.',
    variables: ['customer_name', 'business_name', 'callback_window'],
    is_active: true
  },
  {
    template_type: 'after_hours',
    content: 'Thanks for contacting {business_name}! We\'re currently closed but will respond first thing in the morning. For emergencies, please call {emergency_number}.',
    variables: ['business_name', 'emergency_number'],
    is_active: true
  },
  {
    template_type: 'job_confirmation',
    content: 'Hi {customer_name}, we\'ve received your request for {job_type} at {location}. We\'ll be in touch shortly to discuss details and scheduling.',
    variables: ['customer_name', 'job_type', 'location'],
    is_active: true
  },
  {
    template_type: 'appointment_reminder',
    content: 'Reminder: {business_name} will be arriving at {location} on {appointment_date} at {appointment_time} for your {job_type} job.',
    variables: ['business_name', 'location', 'appointment_date', 'appointment_time', 'job_type'],
    is_active: true
  },
  {
    template_type: 'follow_up',
    content: 'Hi {customer_name}, thanks for choosing {business_name}! How did we do? We\'d love your feedback and would appreciate a review if you were happy with our service.',
    variables: ['customer_name', 'business_name'],
    is_active: true
  },
  {
    template_type: 'quote_ready',
    content: 'Hi {customer_name}, your quote for {job_type} is ready! Total: ${quote_amount}. Valid for 30 days. Reply YES to accept or call us to discuss.',
    variables: ['customer_name', 'job_type', 'quote_amount'],
    is_active: true
  },
  {
    template_type: 'invoice_sent',
    content: 'Hi {customer_name}, your invoice for ${invoice_amount} has been sent. Payment due in {payment_terms} days. Thank you for choosing {business_name}!',
    variables: ['customer_name', 'invoice_amount', 'payment_terms', 'business_name'],
    is_active: true
  }
];

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function TwilioSettingsForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [state, setState] = useState<TwilioSettingsState>({
    settings: null,
    credentials: { accountSid: '', authToken: '' },
    hasCredentials: false,
    loading: true,
    saving: false,
    testing: false,
    error: null,
    showCredentials: false,
    validation: null
  });

  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Test message from your Twilio integration! This confirms everything is working correctly.');
  const [showPhoneSelector, setShowPhoneSelector] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  useEffect(() => {
    if (user) {
      initializeSettings();
    }
  }, [user]);

  const initializeSettings = async () => {
    if (!user) return;

    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Load existing Twilio settings
      const settings = await getUserTwilioSettings(user.id);
      
      // Check if user has stored credentials
      const hasCredentials = await hasStoredCredentials(user.id);

      // Load SMS templates
      await loadSmsTemplates();

      setState(prev => ({
        ...prev,
        settings,
        hasCredentials,
        loading: false
      }));

    } catch (error: any) {
      console.error('Error initializing Twilio settings:', error);
      setState(prev => ({
        ...prev,
        error: {
          code: error.code || 30008,
          message: error.message || 'Failed to load Twilio settings',
          status: error.status || 500
        },
        loading: false
      }));
    }
  };

  const loadSmsTemplates = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tenant_sms_templates')
        .select('*')
        .eq('user_id', user.id)
        .order('template_type');

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data && data.length > 0) {
        setTemplates(data.map(template => ({
          id: template.id,
          user_id: template.user_id,
          template_type: template.template_type as any,
          content: template.content,
          variables: template.variables || [],
          is_active: template.is_active,
          created_at: template.created_at,
          updated_at: template.updated_at
        })));
      } else {
        // Load default templates
        setTemplates(DEFAULT_SMS_TEMPLATES.map(template => ({
          ...template,
          user_id: user.id
        })));
      }
    } catch (error) {
      console.error('Error loading SMS templates:', error);
      // Load default templates as fallback
      setTemplates(DEFAULT_SMS_TEMPLATES.map(template => ({
        ...template,
        user_id: user.id
      })));
    }
  };

  // =============================================================================
  // CREDENTIAL HANDLERS
  // =============================================================================

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!state.credentials.accountSid || !state.credentials.authToken) {
      setState(prev => ({
        ...prev,
        error: {
          code: 20003,
          message: 'Please enter both Account SID and Auth Token',
          status: 400
        }
      }));
      return;
    }

    setState(prev => ({ ...prev, saving: true, error: null }));

    try {
      const validation = await validateTwilioCredentials(state.credentials);
      
      if (validation.valid) {
        setState(prev => ({
          ...prev,
          validation,
          saving: false
        }));
        
        setShowPhoneSelector(true);
        
        toast({
          title: 'Credentials Validated',
          description: 'Your Twilio credentials are valid. Now select a phone number.',
        });
      } else {
        setState(prev => ({
          ...prev,
          error: validation.error || {
            code: 20003,
            message: 'Invalid credentials',
            status: 401
          },
          saving: false
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: {
          code: error.code || 30008,
          message: error.message || 'Failed to validate credentials',
          status: error.status || 500
        },
        saving: false
      }));
    }
  };

  const handlePhoneNumberSelected = async (phoneNumber: AvailablePhoneNumber) => {
    if (!user) return;

    setState(prev => ({ ...prev, saving: true, error: null }));

    try {
      const webhookUrl = `${window.location.origin}/api/webhooks/twilio`;
      
      const settings = await saveTwilioSettings(
        user.id,
        state.credentials,
        phoneNumber.phoneNumber,
        webhookUrl
      );

      setState(prev => ({
        ...prev,
        settings,
        hasCredentials: true,
        saving: false
      }));

      setShowPhoneSelector(false);
      
      toast({
        title: 'Twilio Setup Complete',
        description: `Your business phone number ${phoneNumber.phoneNumber} is now configured.`,
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: {
          code: error.code || 30008,
          message: error.message || 'Failed to save settings',
          status: error.status || 500
        },
        saving: false
      }));
    }
  };

  const handleDeleteConfiguration = async () => {
    if (!user || !confirm('Are you sure you want to delete your Twilio configuration? This cannot be undone.')) {
      return;
    }

    setState(prev => ({ ...prev, saving: true, error: null }));

    try {
      await twilioService.deleteTwilioSettings(user.id);
      
      setState(prev => ({
        ...prev,
        settings: null,
        hasCredentials: false,
        credentials: { accountSid: '', authToken: '' },
        validation: null,
        saving: false
      }));

      toast({
        title: 'Configuration Deleted',
        description: 'Your Twilio configuration has been removed.',
      });

    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: {
          code: error.code || 30008,
          message: error.message || 'Failed to delete configuration',
          status: error.status || 500
        },
        saving: false
      }));
    }
  };

  // =============================================================================
  // TEST HANDLERS
  // =============================================================================

  const handleTestConnection = async () => {
    if (!state.settings) return;

    setState(prev => ({ ...prev, testing: true, error: null }));

    try {
      const result = await testTwilioConnection(
        state.settings,
        testPhoneNumber || state.settings.phoneNumber,
        testMessage
      );

      if (result.success) {
        toast({
          title: 'Test Successful',
          description: 'Test message sent successfully!',
        });
      } else {
        setState(prev => ({
          ...prev,
          error: result.error || {
            code: 30008,
            message: 'Test failed',
            status: 500
          }
        }));
      }
    } catch (error: any) {
      setState(prev => ({
        ...prev,
        error: {
          code: error.code || 30008,
          message: error.message || 'Test failed',
          status: error.status || 500
        }
      }));
    } finally {
      setState(prev => ({ ...prev, testing: false }));
    }
  };

  // =============================================================================
  // TEMPLATE HANDLERS
  // =============================================================================

  const handleTemplateUpdate = async (templateId: string, updates: Partial<SmsTemplate>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('tenant_sms_templates')
        .update(updates)
        .eq('id', templateId)
        .eq('user_id', user.id);

      if (error) throw error;

      setTemplates(prev => prev.map(template =>
        template.id === templateId ? { ...template, ...updates } : template
      ));

      toast({
        title: 'Template Updated',
        description: 'SMS template has been saved.',
      });

    } catch (error) {
      console.error('Error updating template:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update SMS template.',
        variant: 'destructive',
      });
    }
  };

  const handleAddCustomTemplate = () => {
    const newTemplate: SmsTemplate = {
      user_id: user!.id,
      template_type: 'custom',
      content: '',
      variables: [],
      is_active: true
    };
    setTemplates(prev => [...prev, newTemplate]);
    setEditingTemplateId('new');
  };

  // =============================================================================
  // UTILITY FUNCTIONS
  // =============================================================================

  const copyWebhookUrl = () => {
    if (state.settings?.webhookUrl) {
      navigator.clipboard.writeText(state.settings.webhookUrl);
      toast({
        title: 'Copied',
        description: 'Webhook URL copied to clipboard',
      });
    }
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  if (state.loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Loading Twilio settings...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert */}
      {state.error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Error:</strong> {state.error.message}
            {state.error.moreInfo && (
              <div className="mt-2 text-sm">{state.error.moreInfo}</div>
            )}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="templates">SMS Templates</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-6">
          {/* Current Configuration Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Twilio Integration Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {state.settings ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">Active Configuration</span>
                      </div>
                      <div className="text-sm text-green-700">
                        Phone: <span className="font-mono">{state.settings.phoneNumber}</span>
                      </div>
                      <div className="text-sm text-green-700">
                        Status: <Badge variant="default" className="bg-green-100 text-green-800">
                          {state.settings.status}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeleteConfiguration}
                      disabled={state.saving}
                      className="text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>

                  {/* Webhook Configuration */}
                  <div className="space-y-2">
                    <Label>Webhook URL</Label>
                    <div className="flex gap-2">
                      <Input
                        value={state.settings.webhookUrl || ''}
                        readOnly
                        className="font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={copyWebhookUrl}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                    <Alert>
                      <Info className="h-4 w-4" />
                      <AlertDescription>
                        Configure this URL in your Twilio phone number settings for incoming messages.
                        <Button variant="link" className="p-0 h-auto text-sm" asChild>
                          <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming" target="_blank" rel="noopener noreferrer">
                            Open Twilio Console <ExternalLink className="h-3 w-3 ml-1" />
                          </a>
                        </Button>
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <Alert>
                    <Info className="h-4 w-4" />
                    <AlertDescription>
                      Set up your Twilio integration to enable SMS functionality for your business.
                    </AlertDescription>
                  </Alert>

                  {/* Credentials Form */}
                  {!showPhoneSelector && (
                    <form onSubmit={handleCredentialSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="account_sid">Twilio Account SID</Label>
                        <Input
                          id="account_sid"
                          placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                          value={state.credentials.accountSid}
                          onChange={(e) => setState(prev => ({
                            ...prev,
                            credentials: { ...prev.credentials, accountSid: e.target.value }
                          }))}
                          className="font-mono"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="auth_token">Auth Token</Label>
                        <div className="relative">
                          <Input
                            id="auth_token"
                            type={state.showCredentials ? 'text' : 'password'}
                            placeholder="Your Twilio Auth Token"
                            value={state.credentials.authToken}
                            onChange={(e) => setState(prev => ({
                              ...prev,
                              credentials: { ...prev.credentials, authToken: e.target.value }
                            }))}
                            className="font-mono pr-12"
                            required
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                            onClick={() => setState(prev => ({ 
                              ...prev, 
                              showCredentials: !prev.showCredentials 
                            }))}
                          >
                            {state.showCredentials ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>

                      <Button type="submit" disabled={state.saving} className="w-full">
                        {state.saving ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Validating...
                          </>
                        ) : (
                          <>
                            <Key className="h-4 w-4 mr-2" />
                            Validate Credentials
                          </>
                        )}
                      </Button>
                    </form>
                  )}

                  {/* Phone Number Selection */}
                  {showPhoneSelector && state.validation?.valid && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Select Your Business Phone Number</CardTitle>
                        <CardDescription>
                          Choose a phone number for your SMS communications
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <TwilioPhoneSelector
                          credentials={state.credentials}
                          onPhoneNumberSelected={handlePhoneNumberSelected}
                          onError={(error) => setState(prev => ({ ...prev, error }))}
                          showPricing={true}
                          autoSearch={true}
                        />
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* SMS Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    SMS Templates
                  </CardTitle>
                  <CardDescription>
                    Manage automated message templates for different scenarios
                  </CardDescription>
                </div>
                <Button onClick={handleAddCustomTemplate} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Template
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {templates.map((template, index) => (
                <div key={template.id || index} className="p-4 border rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {template.template_type.replace('_', ' ')}
                      </Badge>
                      <Switch
                        checked={template.is_active}
                        onCheckedChange={(checked) => {
                          if (template.id) {
                            handleTemplateUpdate(template.id, { is_active: checked });
                          }
                        }}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingTemplateId(template.id || 'new')}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Message Content</Label>
                    <Textarea
                      value={template.content}
                      onChange={(e) => {
                        setTemplates(prev => prev.map((t, i) => 
                          i === index ? { ...t, content: e.target.value } : t
                        ));
                      }}
                      rows={3}
                      className="resize-none"
                    />
                  </div>

                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      <span className="text-xs text-muted-foreground">Available variables:</span>
                      {template.variables.map((variable) => (
                        <Badge key={variable} variant="secondary" className="text-xs">
                          {`{${variable}}`}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Testing Tab */}
        <TabsContent value="testing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5" />
                Test SMS Configuration
              </CardTitle>
              <CardDescription>
                Send a test message to verify your Twilio integration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!state.settings ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please configure your Twilio settings first before testing.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="test_phone">Test Phone Number</Label>
                      <Input
                        id="test_phone"
                        type="tel"
                        value={testPhoneNumber}
                        onChange={(e) => setTestPhoneNumber(e.target.value)}
                        placeholder={state.settings.phoneNumber}
                      />
                      <p className="text-xs text-muted-foreground">
                        Leave empty to send to your Twilio number
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="test_message">Test Message</Label>
                    <Textarea
                      id="test_message"
                      value={testMessage}
                      onChange={(e) => setTestMessage(e.target.value)}
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleTestConnection}
                    disabled={state.testing}
                    className="w-full"
                  >
                    {state.testing ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending Test...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Test SMS
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}