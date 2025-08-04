import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { RotateCcw, MessageSquare, Clock, Phone, CheckCircle, Info } from 'lucide-react';
import { useOnboarding } from '../OnboardingContext';
import { SMSTemplateData } from '@/types/onboarding';

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
}

const TEMPLATE_CONFIGS: TemplateConfig[] = [
  {
    id: 'missed_call',
    name: 'Missed Call Response',
    type: 'missed_call',
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
    description: 'Sent to confirm scheduled appointments with customers',
    defaultContent: 'Hi {customer_name}, this is {tradie_name} from {business_name}. Confirming our appointment for {job_date} at {job_time}. Address: {job_address}. I\'ll text when I\'m on my way. Thanks!',
    availableVariables: ['{customer_name}', '{business_name}', '{tradie_name}', '{job_date}', '{job_time}', '{job_address}'],
    maxLength: 160,
    icon: <CheckCircle className="h-4 w-4" />,
  },
];

// Form validation schema
const templatesSchema = z.object({
  missed_call: z.string().min(10, 'Template must be at least 10 characters').max(160, 'Template must be 160 characters or less'),
  after_hours: z.string().min(10, 'Template must be at least 10 characters').max(160, 'Template must be 160 characters or less'),
  job_confirmation: z.string().min(10, 'Template must be at least 10 characters').max(160, 'Template must be 160 characters or less'),
});

type TemplatesFormData = z.infer<typeof templatesSchema>;

export default function TemplatesStep() {
  const { state, updateStepData, dispatch } = useOnboarding();
  const [activeTab, setActiveTab] = useState('missed_call');
  const [previewData, setPreviewData] = useState({
    customer_name: 'John Smith',
    business_name: state.formData.businessDetails.business_name || 'Your Business',
    tradie_name: state.formData.basicInfo.name || 'Your Name',
    phone_number: state.formData.basicInfo.phone || '0400 123 456',
    emergency_number: '0400 123 456',
    job_date: 'Monday 15th Jan',
    job_time: '9:00 AM',
    job_address: '123 Main St, Sydney NSW',
  });

  const form = useForm<TemplatesFormData>({
    resolver: zodResolver(templatesSchema),
    defaultValues: {
      missed_call: state.formData.smsTemplates?.find(t => t.template_type === 'missed_call')?.content || 
                   TEMPLATE_CONFIGS.find(t => t.type === 'missed_call')?.defaultContent || '',
      after_hours: state.formData.smsTemplates?.find(t => t.template_type === 'after_hours')?.content || 
                   TEMPLATE_CONFIGS.find(t => t.type === 'after_hours')?.defaultContent || '',
      job_confirmation: state.formData.smsTemplates?.find(t => t.template_type === 'job_confirmation')?.content || 
                        TEMPLATE_CONFIGS.find(t => t.type === 'job_confirmation')?.defaultContent || '',
    },
    mode: 'onChange',
  });

  const { watch, setValue, getValues } = form;
  const watchedValues = watch();

  // Auto-save form data changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      const templates: SMSTemplateData[] = Object.entries(value).map(([type, content]) => ({
        template_type: type,
        content: content || '',
        variables: TEMPLATE_CONFIGS.find(config => config.type === type)?.availableVariables || [],
      }));
      
      updateStepData('smsTemplates', templates);
      
      // Validate current step
      form.trigger().then((isValid) => {
        dispatch({
          type: 'SET_STEP_VALIDATION',
          payload: {
            stepId: 5, // Assuming this is step 5
            isValid,
            errors: isValid ? [] : ['Please complete all SMS templates'],
          },
        });
      });
    });

    return () => subscription.unsubscribe();
  }, [form, updateStepData, dispatch]);

  const getCurrentTemplate = () => {
    return TEMPLATE_CONFIGS.find(config => config.id === activeTab);
  };

  const getCharacterCount = (templateType: string) => {
    const content = watchedValues[templateType as keyof TemplatesFormData] || '';
    return content.length;
  };

  const getCharacterCountColor = (templateType: string) => {
    const count = getCharacterCount(templateType);
    const maxLength = getCurrentTemplate()?.maxLength || 160;
    
    if (count > maxLength) return 'text-red-600';
    if (count > maxLength * 0.9) return 'text-yellow-600';
    return 'text-gray-500';
  };

  const resetTemplate = (templateType: string) => {
    const config = TEMPLATE_CONFIGS.find(t => t.type === templateType);
    if (config) {
      setValue(templateType as keyof TemplatesFormData, config.defaultContent);
    }
  };

  const previewTemplate = (content: string) => {
    let preview = content;
    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
    });
    return preview;
  };

  const currentTemplate = getCurrentTemplate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <MessageSquare className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">SMS Templates</h3>
        </div>
        <p className="text-sm text-gray-600">
          Customize your automated messages to customers. You can use variables like {'{customer_name}'} 
          to personalize each message.
        </p>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              {TEMPLATE_CONFIGS.map((config) => (
                <TabsTrigger key={config.id} value={config.id} className="flex items-center space-x-2">
                  {config.icon}
                  <span className="hidden sm:inline">{config.name}</span>
                  <span className="sm:hidden">{config.name.split(' ')[0]}</span>
                </TabsTrigger>
              ))}
            </TabsList>

            {TEMPLATE_CONFIGS.map((config) => (
              <TabsContent key={config.id} value={config.id} className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center space-x-2">
                          {config.icon}
                          <span>{config.name}</span>
                        </CardTitle>
                        <CardDescription>{config.description}</CardDescription>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => resetTemplate(config.type)}
                        className="flex items-center space-x-1"
                      >
                        <RotateCcw className="h-3 w-3" />
                        <span>Reset</span>
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <FormField
                      control={form.control}
                      name={config.type as keyof TemplatesFormData}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Template Content</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={config.defaultContent}
                              className="min-h-[100px] resize-none"
                              {...field}
                            />
                          </FormControl>
                          <div className="flex items-center justify-between">
                            <FormDescription>
                              Available variables: {config.availableVariables.join(', ')}
                            </FormDescription>
                            <span className={`text-sm ${getCharacterCountColor(config.type)}`}>
                              {getCharacterCount(config.type)}/{config.maxLength}
                            </span>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Available Variables */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Available Variables:</p>
                      <div className="flex flex-wrap gap-2">
                        {config.availableVariables.map((variable) => (
                          <Badge key={variable} variant="secondary" className="text-xs">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-700">Preview:</p>
                      <div className="bg-gray-50 p-3 rounded-lg border">
                        <div className="bg-blue-500 text-white p-3 rounded-lg max-w-xs ml-auto">
                          <p className="text-sm">
                            {previewTemplate(watchedValues[config.type as keyof TemplatesFormData] || config.defaultContent)}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500">
                        This is how your message will appear to customers
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </form>
      </Form>

      {/* Tips */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Tips:</strong> Keep messages under 160 characters for single SMS delivery. 
          Use a friendly, professional tone and always include your business name for brand recognition.
        </AlertDescription>
      </Alert>

      {/* Character limits warning */}
      {Object.keys(watchedValues).some(key => getCharacterCount(key) > 160) && (
        <Alert variant="destructive">
          <AlertDescription>
            One or more templates exceed 160 characters and may be sent as multiple SMS messages, 
            which could increase costs.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}