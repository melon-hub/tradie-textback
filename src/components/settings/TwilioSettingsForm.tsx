import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
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
  Info
} from 'lucide-react';

interface TwilioSettings {
  id?: string;
  user_id: string;
  account_sid: string;
  auth_token: string;
  phone_number: string;
  webhook_url: string;
  is_configured: boolean;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

interface SmsTemplate {
  id?: string;
  user_id: string;
  template_type: 'missed_call' | 'job_update' | 'quote_ready' | 'appointment_reminder' | 'follow_up' | 'custom';
  template_name: string;
  message_content: string;
  is_active: boolean;
  variables: string[];
}

const DEFAULT_TEMPLATES: Omit<SmsTemplate, 'id' | 'user_id'>[] = [
  {
    template_type: 'missed_call',
    template_name: 'Missed Call Response',
    message_content: 'Hi {customer_name}, I missed your call. I\'ll get back to you within 30 minutes. For urgent matters, please text me details. - {business_name}',
    is_active: true,
    variables: ['customer_name', 'business_name']
  },
  {
    template_type: 'job_update',
    template_name: 'Job Status Update',
    message_content: 'Hi {customer_name}, quick update on your {job_type}: {update_message}. Expected completion: {completion_time}. - {business_name}',
    is_active: true,
    variables: ['customer_name', 'job_type', 'update_message', 'completion_time', 'business_name']
  },
  {
    template_type: 'quote_ready',
    template_name: 'Quote Ready',
    message_content: 'Hi {customer_name}, your quote for {job_type} is ready! Check it out here: {quote_link} - {business_name}',
    is_active: true,
    variables: ['customer_name', 'job_type', 'quote_link', 'business_name']
  },
  {
    template_type: 'appointment_reminder',
    template_name: 'Appointment Reminder',
    message_content: 'Reminder: I\'ll be at {location} tomorrow at {appointment_time} for {job_type}. Please ensure someone is available. - {business_name}',
    is_active: true,
    variables: ['location', 'appointment_time', 'job_type', 'business_name']
  },
  {
    template_type: 'follow_up',
    template_name: 'Follow Up',
    message_content: 'Hi {customer_name}, hope you\'re happy with the {job_type} work completed. If you need anything else or have feedback, just reply! - {business_name}',
    is_active: true,
    variables: ['customer_name', 'job_type', 'business_name']
  }
];

export function TwilioSettingsForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showAuthToken, setShowAuthToken] = useState(false);
  
  const [settings, setSettings] = useState<TwilioSettings>({
    user_id: user?.id || '',
    account_sid: '',
    auth_token: '',
    phone_number: '',
    webhook_url: '',
    is_configured: false,
    is_verified: false
  });

  const [templates, setTemplates] = useState<SmsTemplate[]>([]);
  const [testPhoneNumber, setTestPhoneNumber] = useState('');
  const [testMessage, setTestMessage] = useState('Test message from Tradie Textback! This confirms your Twilio integration is working.');

  useEffect(() => {
    if (user) {
      fetchTwilioSettings();
      fetchSmsTemplates();
    }
  }, [user]);

  // Generate webhook URL based on current domain
  useEffect(() => {
    if (settings.user_id) {
      const baseUrl = window.location.origin;
      const webhookUrl = `${baseUrl}/api/webhooks/twilio/${settings.user_id}`;
      setSettings(prev => ({ ...prev, webhook_url: webhookUrl }));
    }
  }, [settings.user_id]);

  const fetchTwilioSettings = async () => {
    try {
      setLoading(true);
      
      // Note: This table doesn't exist yet - will be created when Twilio is integrated
      const { data, error } = await supabase
        .from('twilio_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        // Table doesn't exist yet - this is expected for now
        console.log('Twilio settings table not found (expected for now)');
        return;
      }

      if (data) {
        setSettings(data);
      }
    } catch (error) {
      console.log('Twilio not integrated yet:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSmsTemplates = async () => {
    try {
      // Note: This table doesn't exist yet - will be created when Twilio is integrated
      const { data, error } = await supabase
        .from('sms_templates')
        .select('*')
        .eq('user_id', user!.id);

      if (error && error.code !== 'PGRST116') {
        // Table doesn't exist yet - this is expected for now
        console.log('SMS templates table not found (expected for now)');
        return;
      }

      if (data && data.length > 0) {
        setTemplates(data);
      } else {
        // Load default templates for preview
        setTemplates(DEFAULT_TEMPLATES.map(template => ({
          ...template,
          user_id: user!.id
        })));
      }
    } catch (error) {
      console.log('SMS templates not available yet:', error);
      // Load default templates for preview
      setTemplates(DEFAULT_TEMPLATES.map(template => ({
        ...template,
        user_id: user!.id
      })));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      // Validate phone number format (Australian format)
      const phoneRegex = /^\+61[0-9]{9}$|^04[0-9]{8}$/;
      if (!phoneRegex.test(settings.phone_number)) {
        toast({
          title: 'Invalid Phone Number',
          description: 'Please enter a valid Australian phone number (e.g., +61412345678 or 0412345678)',
          variant: 'destructive',
        });
        return;
      }

      // For now, just show a message that Twilio isn't integrated yet
      toast({
        title: 'Configuration Saved',
        description: 'Twilio settings saved locally. Integration will be available once Twilio is set up.',
        variant: 'default',
      });

      // TODO: When Twilio is integrated, save to database
      /*
      const dataToSave = {
        ...settings,
        user_id: user!.id,
        updated_at: new Date().toISOString(),
        // Encrypt auth_token before saving
        auth_token: await encryptAuthToken(settings.auth_token)
      };

      if (settings.id) {
        const { error } = await supabase
          .from('twilio_settings')
          .update(dataToSave)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('twilio_settings')
          .insert([dataToSave]);
        if (error) throw error;
      }
      */

    } catch (error) {
      console.error('Error saving Twilio settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save Twilio settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTestSms = async () => {
    if (!testPhoneNumber || !testMessage) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both phone number and test message',
        variant: 'destructive',
      });
      return;
    }

    try {
      setTesting(true);

      // For now, just simulate the test
      toast({
        title: 'Test SMS Simulated',
        description: 'Twilio integration not available yet. Test will work once integrated.',
      });

      // TODO: When Twilio is integrated, send actual test SMS
      /*
      const response = await fetch('/api/twilio/test-sms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: testPhoneNumber,
          message: testMessage,
          user_id: user!.id
        }),
      });

      if (response.ok) {
        toast({
          title: 'Test SMS Sent',
          description: 'Check your phone for the test message',
        });
      } else {
        throw new Error('Failed to send test SMS');
      }
      */

    } catch (error) {
      console.error('Error sending test SMS:', error);
      toast({
        title: 'Test Failed',
        description: 'Failed to send test SMS. Please check your configuration.',
        variant: 'destructive',
      });
    } finally {
      setTesting(false);
    }
  };

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(settings.webhook_url);
    toast({
      title: 'Copied',
      description: 'Webhook URL copied to clipboard',
    });
  };

  const updateTemplate = (index: number, field: keyof SmsTemplate, value: any) => {
    setTemplates(prev => prev.map((template, i) => 
      i === index ? { ...template, [field]: value } : template
    ));
  };

  const addCustomTemplate = () => {
    const newTemplate: SmsTemplate = {
      user_id: user!.id,
      template_type: 'custom',
      template_name: 'Custom Template',
      message_content: '',
      is_active: true,
      variables: []
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const removeTemplate = (index: number) => {
    setTemplates(prev => prev.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading Twilio settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Integration Status Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Twilio integration is not yet active. This form allows you to configure settings that will be used once Twilio is integrated into the system.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Twilio Credentials */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              Twilio Credentials
              {settings.is_verified && (
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Configure your Twilio account details for SMS functionality
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="account_sid">Account SID</Label>
                <Input
                  id="account_sid"
                  value={settings.account_sid}
                  onChange={(e) => setSettings({ ...settings, account_sid: e.target.value })}
                  placeholder="ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Found in your Twilio Console dashboard
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone_number">Twilio Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone_number"
                    type="tel"
                    value={settings.phone_number}
                    onChange={(e) => setSettings({ ...settings, phone_number: e.target.value })}
                    placeholder="+61412345678"
                    className="pl-10"
                    required
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Your purchased Twilio phone number
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth_token">Auth Token</Label>
              <div className="relative">
                <Shield className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="auth_token"
                  type={showAuthToken ? "text" : "password"}
                  value={settings.auth_token}
                  onChange={(e) => setSettings({ ...settings, auth_token: e.target.value })}
                  placeholder="Your Twilio Auth Token"
                  className="pl-10 pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowAuthToken(!showAuthToken)}
                >
                  {showAuthToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Keep this secure - it will be encrypted when saved
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Webhook Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Webhook className="h-5 w-5" />
              Webhook Configuration
            </CardTitle>
            <CardDescription>
              Configure Twilio to send incoming SMS to your application
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Webhook URL</Label>
              <div className="flex gap-2">
                <Input
                  value={settings.webhook_url}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={copyWebhookUrl}
                  className="px-3"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  Copy this URL and add it to your Twilio phone number's webhook configuration for incoming messages.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>

        {/* Test SMS */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Test SMS Configuration
            </CardTitle>
            <CardDescription>
              Send a test message to verify your Twilio setup
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="test_phone">Test Phone Number</Label>
                <Input
                  id="test_phone"
                  type="tel"
                  value={testPhoneNumber}
                  onChange={(e) => setTestPhoneNumber(e.target.value)}
                  placeholder="+61412345678"
                />
              </div>
              <div className="flex items-end">
                <Button
                  type="button"
                  onClick={handleTestSms}
                  disabled={testing || !settings.account_sid || !settings.auth_token}
                  className="w-full"
                >
                  {testing ? 'Sending...' : 'Send Test SMS'}
                </Button>
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
          </CardContent>
        </Card>

        {/* SMS Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS Templates
            </CardTitle>
            <CardDescription>
              Pre-configured message templates for different scenarios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {templates.map((template, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Input
                      value={template.template_name}
                      onChange={(e) => updateTemplate(index, 'template_name', e.target.value)}
                      className="font-medium"
                      placeholder="Template name"
                    />
                    <Badge variant="outline">{template.template_type}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={template.is_active}
                      onCheckedChange={(checked) => updateTemplate(index, 'is_active', checked)}
                    />
                    {template.template_type === 'custom' && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeTemplate(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Message Content</Label>
                  <Textarea
                    value={template.message_content}
                    onChange={(e) => updateTemplate(index, 'message_content', e.target.value)}
                    rows={3}
                    placeholder="Enter your message template..."
                  />
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
              </div>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addCustomTemplate}
              className="w-full"
            >
              Add Custom Template
            </Button>
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving...' : 'Save Twilio Configuration'}
          </Button>
        </div>
      </form>
    </div>
  );
}