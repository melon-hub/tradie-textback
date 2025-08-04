import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MessageSquare, RotateCcw, Phone, Clock, CheckCircle, Info, Plus, Trash2, Eye, Library, Settings } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TemplateLibrary } from '@/components/sms/TemplateLibrary';
import { VariableHelper } from '@/components/sms/VariableHelper';
import { TemplatePreview } from '@/components/sms/TemplatePreview';
import { TemplateCategories } from '@/components/sms/TemplateCategories';
import { TemplateLibraryItem } from '@/data/smsTemplateLibrary';

// Template configuration with defaults and metadata
interface TemplateConfig {
  id: string;
  name: string;
  type: string;
  defaultContent: string;
  description: string;
  availableVariables: string[];
  maxLength: number;
  icon: React.ReactNode;
  category: 'automation' | 'lifecycle' | 'custom';
}

const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'missed_call',
    name: 'Missed Call Response',
    type: 'missed_call',
    category: 'automation',
    description: 'Sent automatically when you miss a call from a potential customer',
    defaultContent: 'Hi {customer_name}, thanks for calling {business_name}! I missed your call but will get back to you within 2 hours. For urgent matters, please text back with details. - {tradie_name}',
    availableVariables: ['{customer_name}', '{business_name}', '{tradie_name}', '{phone_number}'],
    maxLength: 160,
    icon: <Phone className="h-4 w-4" />,
  },
  {
    id: 'after_hours',
    name: 'After Hours Message',
    type: 'after_hours',
    category: 'automation',
    description: 'Sent when customers contact you outside business hours',
    defaultContent: 'Hi {customer_name}, thanks for contacting {business_name}! We\'re currently closed but will respond first thing in the morning. For emergencies, please call {emergency_number}. - {tradie_name}',
    availableVariables: ['{customer_name}', '{business_name}', '{tradie_name}', '{emergency_number}'],
    maxLength: 160,
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'job_confirmation',
    name: 'Job Confirmation',
    type: 'job_confirmation',
    category: 'lifecycle',
    description: 'Sent to confirm scheduled appointments with customers',
    defaultContent: 'Hi {customer_name}, this is {tradie_name} from {business_name}. Confirming our appointment for {job_date} at {job_time}. Address: {job_address}. I\'ll text when I\'m on my way. Thanks!',
    availableVariables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_date}', '{job_time}', '{job_address}'],
    maxLength: 160,
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    id: 'job_reminder',
    name: 'Job Reminder',
    type: 'job_reminder',
    category: 'lifecycle',
    description: 'Reminder sent before scheduled appointments',
    defaultContent: 'Hi {customer_name}, this is a reminder about your {job_type} appointment tomorrow at {job_time}. We\'ll see you at {job_address}. - {business_name}',
    availableVariables: ['{customer_name}', '{business_name}', '{job_type}', '{job_time}', '{job_address}'],
    maxLength: 160,
    icon: <Clock className="h-4 w-4" />,
  },
  {
    id: 'job_arrival',
    name: 'Arrival Notification',
    type: 'job_arrival',
    category: 'lifecycle',
    description: 'Sent when you\'re on your way to the job',
    defaultContent: 'Hi {customer_name}, I\'m on my way to your {job_address} for the {job_type} job. ETA: {eta} minutes. - {tradie_name}',
    availableVariables: ['{customer_name}', '{tradie_name}', '{job_type}', '{job_address}', '{eta}'],
    maxLength: 160,
    icon: <CheckCircle className="h-4 w-4" />,
  },
  {
    id: 'job_completion',
    name: 'Job Completion',
    type: 'job_completion',
    category: 'lifecycle',
    description: 'Sent when the job is completed',
    defaultContent: 'Job completed! Thanks for choosing {business_name}. If you have any questions or need anything else, please don\'t hesitate to contact us. - {tradie_name}',
    availableVariables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_type}'],
    maxLength: 160,
    icon: <CheckCircle className="h-4 w-4" />,
  },
];

interface SMSTemplate {
  id?: string;
  template_type: string;
  content: string;
  is_active: boolean;
  variables?: string[];
}

const templateSchema = z.object({
  content: z.string().min(10, 'Template must be at least 10 characters').max(320, 'Template too long'),
});

export function SMSTemplatesForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('missed_call');
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);

  const [customTemplateDialog, setCustomTemplateDialog] = useState(false);
  const [newCustomTemplate, setNewCustomTemplate] = useState({ type: '', content: '' });

  const form = useForm({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      content: '',
    },
    mode: 'onChange',
  });

  const { watch, setValue, reset } = form;
  const watchedContent = watch('content');

  // Preview data for template variables
  const [previewData] = useState({
    customer_name: 'John Smith',
    business_name: profile?.business_name || 'Your Business',
    tradie_name: profile?.name || 'Your Name',
    phone_number: profile?.phone || '0400 123 456',
    emergency_number: '0400 123 456',
    job_date: 'Monday 15th Jan',
    job_time: '9:00 AM',
    job_address: '123 Main St, Sydney NSW',
    job_type: 'Plumbing',
    eta: '15',
  });

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  useEffect(() => {
    // Update form when active tab changes
    const currentTemplate = templates.find(t => t.template_type === activeTab);
    const defaultTemplate = TEMPLATE_CONFIGS.find(c => c.type === activeTab);
    
    setValue('content', currentTemplate?.content || defaultTemplate?.defaultContent || '');
  }, [activeTab, templates, setValue]);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tenant_sms_templates')
        .select('*')
        .eq('user_id', user!.id)
        .eq('is_active', true);

      if (error) throw error;

      setTemplates(data || []);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load SMS templates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const saveTemplate = async (templateType: string, content: string) => {
    if (!user) return;

    try {
      setSaving(true);

      const templateConfig = TEMPLATE_CONFIGS.find(c => c.type === templateType);
      const existingTemplate = templates.find(t => t.template_type === templateType);

      const templateData = {
        user_id: user.id,
        template_type: templateType,
        content: content,
        is_active: true,
        variables: templateConfig?.availableVariables || [],
        updated_at: new Date().toISOString(),
      };

      if (existingTemplate?.id) {
        // Update existing template
        const { error } = await supabase
          .from('tenant_sms_templates')
          .update(templateData)
          .eq('id', existingTemplate.id);

        if (error) throw error;
      } else {
        // Create new template
        const { error } = await supabase
          .from('tenant_sms_templates')
          .insert([templateData]);

        if (error) throw error;
      }

      await loadTemplates(); // Refresh templates

      toast({
        title: 'Success',
        description: `${templateConfig?.name || 'Template'} saved successfully`,
      });

    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: 'Failed to save template',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const resetTemplate = async (templateType: string) => {
    const templateConfig = TEMPLATE_CONFIGS.find(c => c.type === templateType);
    if (templateConfig) {
      setValue('content', templateConfig.defaultContent);
      await saveTemplate(templateType, templateConfig.defaultContent);
    }
  };

  const deleteTemplate = async (templateId: string) => {
    try {
      const { error } = await supabase
        .from('tenant_sms_templates')
        .delete()
        .eq('id', templateId);

      if (error) throw error;

      await loadTemplates();
      
      toast({
        title: 'Success',
        description: 'Template deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete template',
        variant: 'destructive',
      });
    }
  };

  const previewTemplate = (content: string) => {
    let preview = content;
    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return preview;
  };

  const getCharacterCount = () => watchedContent?.length || 0;

  const getCharacterCountColor = () => {
    const count = getCharacterCount();
    if (count > 160) return 'text-red-600';
    if (count > 144) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const getCurrentTemplate = () => {
    return TEMPLATE_CONFIGS.find(config => config.type === activeTab);
  };

  const handleSubmit = async (data: { content: string }) => {
    await saveTemplate(activeTab, data.content);
  };

  const automationTemplates = TEMPLATE_CONFIGS.filter(t => t.category === 'automation');
  const lifecycleTemplates = TEMPLATE_CONFIGS.filter(t => t.category === 'lifecycle');
  const customTemplates = templates.filter(t => !TEMPLATE_CONFIGS.find(c => c.type === t.template_type));

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading SMS templates...</div>
        </CardContent>
      </Card>
    );
  }

  const currentTemplate = getCurrentTemplate();

  const handleLibraryTemplateSelect = (template: TemplateLibraryItem) => {
    setValue('content', template.content);
    // If this is a new template type not in our config, we might need to handle it
    const existingConfig = TEMPLATE_CONFIGS.find(c => c.type === template.category);
    if (existingConfig && activeTab !== template.category) {
      setActiveTab(template.category);
    }
  };

  const handleVariableSelect = (variable: string) => {
    const currentContent = form.getValues('content');
    const cursorPosition = currentContent.length; // Simple append for now
    setValue('content', currentContent + variable);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                SMS Templates
              </CardTitle>
              <CardDescription>
                Customize your automated messages to customers. Use variables like {'{customer_name}'} to personalize each message.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <TemplateLibrary 
                onTemplateSelect={handleLibraryTemplateSelect}
                selectedCategory={activeTab}
              />
              <VariableHelper 
                onVariableSelect={handleVariableSelect}
                availableVariables={currentTemplate?.availableVariables}
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            {/* Enhanced Template Categories */}
            <div className="space-y-4">
              {/* Quick Template Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center space-x-2">
                    <Settings className="h-4 w-4" />
                    <span>Template Categories</span>
                  </CardTitle>
                  <CardDescription>Choose the type of message you want to customize</CardDescription>
                </CardHeader>
                <CardContent>
                  {/* Automation Templates */}
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>Automatic Messages</span>
                        <Badge variant="secondary" className="text-xs">Auto-sent</Badge>
                      </h4>
                      <TabsList className="grid w-full grid-cols-2">
                        {automationTemplates.map((config) => (
                          <TabsTrigger key={config.id} value={config.id} className="flex items-center space-x-2 text-xs">
                            {config.icon}
                            <span className="hidden sm:inline">{config.name}</span>
                            <span className="sm:hidden">{config.name.split(' ')[0]}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4" />
                        <span>Job Workflow Messages</span>
                        <Badge variant="outline" className="text-xs">Manual/Auto</Badge>
                      </h4>
                      <TabsList className="grid w-full grid-cols-4">
                        {lifecycleTemplates.map((config) => (
                          <TabsTrigger key={config.id} value={config.id} className="flex items-center space-x-2 text-xs">
                            {config.icon}
                            <span className="hidden sm:inline">{config.name}</span>
                            <span className="sm:hidden">{config.name.split(' ')[0]}</span>
                          </TabsTrigger>
                        ))}
                      </TabsList>
                    </div>

                    {/* Custom Templates */}
                    {customTemplates.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-sm font-medium text-gray-700 flex items-center space-x-2">
                            <Plus className="h-4 w-4" />
                            <span>Custom Templates</span>
                            <Badge variant="outline" className="text-xs">{customTemplates.length}</Badge>
                          </h4>
                          <Dialog open={customTemplateDialog} onOpenChange={setCustomTemplateDialog}>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm">
                                <Plus className="h-3 w-3 mr-1" />
                                Add Custom
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Create Custom Template</DialogTitle>
                                <DialogDescription>
                                  Create a custom SMS template for specific use cases.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div>
                                  <Label htmlFor="template-type">Template Name</Label>
                                  <Input
                                    id="template-type"
                                    value={newCustomTemplate.type}
                                    onChange={(e) => setNewCustomTemplate({ ...newCustomTemplate, type: e.target.value })}
                                    placeholder="e.g., follow_up, quote_reminder"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="template-content">Content</Label>
                                  <Textarea
                                    id="template-content"
                                    value={newCustomTemplate.content}
                                    onChange={(e) => setNewCustomTemplate({ ...newCustomTemplate, content: e.target.value })}
                                    placeholder="Enter your custom template content..."
                                    rows={4}
                                  />
                                </div>
                                <div className="flex justify-end space-x-2">
                                  <Button variant="outline" onClick={() => setCustomTemplateDialog(false)}>
                                    Cancel
                                  </Button>
                                  <Button 
                                    onClick={async () => {
                                      await saveTemplate(newCustomTemplate.type, newCustomTemplate.content);
                                      setNewCustomTemplate({ type: '', content: '' });
                                      setCustomTemplateDialog(false);
                                    }}
                                    disabled={!newCustomTemplate.type || !newCustomTemplate.content}
                                  >
                                    Create Template
                                  </Button>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {customTemplates.map((template) => (
                            <div key={template.id} className="flex items-center space-x-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setActiveTab(template.template_type)}
                                className={`text-xs ${activeTab === template.template_type ? 'bg-primary text-primary-foreground' : ''}`}
                              >
                                {template.template_type}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => deleteTemplate(template.id!)}
                                className="text-red-600 hover:text-red-700 p-1"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Template Editor */}
            {[...TEMPLATE_CONFIGS, ...customTemplates].map((config) => (
              <TabsContent key={config.id || config.template_type} value={config.id || config.template_type} className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          {(config as TemplateConfig).icon || <MessageSquare className="h-4 w-4" />}
                          <span>{(config as TemplateConfig).name || config.template_type}</span>
                        </CardTitle>
                        <CardDescription>
                          {(config as TemplateConfig).description || 'Custom template'}
                        </CardDescription>
                      </div>
                      <div className="flex space-x-2">
                        <TemplatePreview
                        content={watchedContent}
                        templateName={currentTemplate?.name}
                        availableVariables={currentTemplate?.availableVariables}
                        />
                        {TEMPLATE_CONFIGS.find(c => c.type === activeTab) && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => resetTemplate(activeTab)}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Reset
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name="content"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Enter your template content..."
                              className="min-h-[120px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <div className="flex items-center justify-between">
                            <FormDescription>
                              {currentTemplate && (
                                <>Available variables: {currentTemplate.availableVariables.join(', ')}</>
                              )}
                            </FormDescription>
                            <span className={`text-sm ${getCharacterCountColor()}`}>
                              {getCharacterCount()}/160 {getCharacterCount() > 160 && '(Multiple SMS)'}
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Available Variables */}
                    {currentTemplate && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-700">Available Variables:</p>
                          <VariableHelper 
                            onVariableSelect={handleVariableSelect}
                            availableVariables={currentTemplate?.availableVariables}
                            className="text-xs"
                          />
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {currentTemplate.availableVariables.slice(0, 6).map((variable) => (
                            <Badge 
                              key={variable} 
                              variant="secondary" 
                              className="text-xs cursor-pointer hover:bg-secondary/80"
                              onClick={() => handleVariableSelect(variable)}
                            >
                              {variable}
                            </Badge>
                          ))}
                          {currentTemplate.availableVariables.length > 6 && (
                            <Badge variant="outline" className="text-xs">
                              +{currentTemplate.availableVariables.length - 6} more
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-gray-500">Click a variable to add it to your template, or use the Variable Helper for more options</p>
                      </div>
                    )}

                    {/* Save Button */}
                    <div className="flex justify-end">
                      <Button type="submit" disabled={saving}>
                        {saving ? 'Saving...' : 'Save Template'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </form>
      </Form>

      {/* Enhanced Tips */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div className="bg-blue-100 p-2 rounded-full">
              <Info className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-blue-900 mb-2">SMS Template Best Practices</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-blue-800">
                <div className="space-y-1">
                  <p>• Keep messages under 160 characters when possible</p>
                  <p>• Always include your business name for recognition</p>
                  <p>• Use a friendly, professional tone</p>
                </div>
                <div className="space-y-1">
                  <p>• Test templates with the preview feature</p>
                  <p>• Personalize with customer names when available</p>
                  <p>• Browse the template library for inspiration</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Character limit warning */}
      {getCharacterCount() > 160 && (
        <Alert variant="destructive">
          <AlertDescription>
            This template exceeds 160 characters and will be sent as multiple SMS messages, 
            which may increase costs.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}