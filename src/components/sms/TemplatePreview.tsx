import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Eye, Smartphone, MessageSquare, AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TemplatePreviewProps {
  content: string;
  templateName?: string;
  className?: string;
  availableVariables?: string[];
}

interface PreviewData {
  [key: string]: string;
}

const DEFAULT_PREVIEW_DATA: PreviewData = {
  customer_name: 'John Smith',
  customer_first_name: 'John',
  customer_phone: '0400 123 456',
  business_name: 'Smith Plumbing',
  tradie_name: 'Mike Smith',
  phone_number: '0400 987 654',
  emergency_number: '0400 999 888',
  job_type: 'Blocked drain repair',
  job_description: 'Kitchen sink blocked drain',
  job_status: 'Scheduled',
  job_date: 'Monday 15th Jan',
  job_time: '9:00 AM',
  job_address: '123 Main St, Bondi NSW 2026',
  suburb: 'Bondi',
  location: 'kitchen sink',
  eta: '15',
  delay_minutes: '20',
  quote_amount: '450',
  amount: '350',
  due_date: '15th January',
  quote_date: '10th January',
  quote_validity: '30',
  payment_methods: 'cash, card, or bank transfer',
  warranty_period: '12 month',
  service_date: '15th January',
  next_service: '15th July'
};

const PREVIEW_SCENARIOS = [
  {
    id: 'standard',
    name: 'Standard Customer',
    description: 'Typical residential customer',
    data: DEFAULT_PREVIEW_DATA
  },
  {
    id: 'urgent',
    name: 'Urgent Job',
    description: 'Emergency call scenario',
    data: {
      ...DEFAULT_PREVIEW_DATA,
      customer_name: 'Sarah Wilson',
      customer_first_name: 'Sarah',
      job_type: 'Hot water system emergency',
      job_description: 'No hot water - urgent repair needed',
      job_status: 'Emergency',
      eta: '30',
      job_time: 'ASAP'
    }
  },
  {
    id: 'commercial',
    name: 'Commercial Client',
    description: 'Business customer scenario',
    data: {
      ...DEFAULT_PREVIEW_DATA,
      customer_name: 'David Chen',
      customer_first_name: 'David',
      business_name: 'Pro Trade Services',
      job_type: 'Office plumbing maintenance',
      job_description: 'Quarterly maintenance check',
      job_address: '456 Business Park, Sydney NSW 2000',
      suburb: 'Sydney',
      quote_amount: '850',
      amount: '750'
    }
  },
  {
    id: 'weekend',
    name: 'Weekend Job',
    description: 'Weekend/after hours scenario',
    data: {
      ...DEFAULT_PREVIEW_DATA,
      customer_name: 'Emma Thompson',
      customer_first_name: 'Emma',
      job_date: 'Saturday 20th Jan',
      job_time: '2:00 PM',
      job_type: 'Bathroom renovation',
      delay_minutes: '45'
    }
  }
];

export function TemplatePreview({ content, templateName, className, availableVariables }: TemplatePreviewProps) {
  const [selectedScenario, setSelectedScenario] = useState('standard');
  const [customData, setCustomData] = useState<PreviewData>({});
  const [showCustomEditor, setShowCustomEditor] = useState(false);

  const getCurrentPreviewData = (): PreviewData => {
    const scenarioData = PREVIEW_SCENARIOS.find(s => s.id === selectedScenario)?.data || DEFAULT_PREVIEW_DATA;
    return { ...scenarioData, ...customData };
  };

  const renderPreview = (previewContent: string, previewData: PreviewData): string => {
    let rendered = previewContent;
    
    // Replace all variables with preview data
    Object.entries(previewData).forEach(([key, value]) => {
      const variablePattern = new RegExp(`\\{${key}\\}`, 'g');
      rendered = rendered.replace(variablePattern, value);
    });

    return rendered;
  };

  const getUnreplacedVariables = (previewContent: string): string[] => {
    const variablePattern = /\{([^}]+)\}/g;
    const variables: string[] = [];
    let match;
    
    while ((match = variablePattern.exec(previewContent)) !== null) {
      const fullVariable = match[0];
      if (!variables.includes(fullVariable)) {
        variables.push(fullVariable);
      }
    }
    
    return variables;
  };

  const getCharacterCount = (text: string): number => {
    return text.length;
  };

  const getSMSCount = (text: string): number => {
    return Math.ceil(text.length / 160);
  };

  const getCharacterCountColor = (count: number): string => {
    if (count > 160) return 'text-red-600';
    if (count > 144) return 'text-yellow-600';
    return 'text-green-600';
  };

  const currentPreviewData = getCurrentPreviewData();
  const renderedContent = renderPreview(content, currentPreviewData);
  const unreplacedVariables = getUnreplacedVariables(renderedContent);
  const charCount = getCharacterCount(renderedContent);
  const smsCount = getSMSCount(renderedContent);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Eye className="h-4 w-4 mr-2" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5" />
            <span>Template Preview</span>
            {templateName && <Badge variant="outline">{templateName}</Badge>}
          </DialogTitle>
          <DialogDescription>
            See how your template will look to customers with different scenarios
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview Scenarios */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Preview Scenarios</Label>
            <Tabs value={selectedScenario} onValueChange={setSelectedScenario}>
              <TabsList className="grid w-full grid-cols-4">
                {PREVIEW_SCENARIOS.map((scenario) => (
                  <TabsTrigger 
                    key={scenario.id} 
                    value={scenario.id}
                    className="text-xs"
                  >
                    {scenario.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
            <p className="text-xs text-gray-500">
              {PREVIEW_SCENARIOS.find(s => s.id === selectedScenario)?.description}
            </p>
          </div>

          <Separator />

          {/* Mobile Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">SMS Preview</Label>
              <div className="flex items-center space-x-4 text-xs">
                <span className={getCharacterCountColor(charCount)}>
                  {charCount} characters
                </span>
                <span className="text-gray-500">
                  {smsCount} SMS{smsCount > 1 ? ' messages' : ''}
                </span>
              </div>
            </div>

            {/* Mobile Phone Mockup */}
            <Card className="mx-auto max-w-sm bg-gray-900 text-white relative">
              <div className="bg-gray-800 rounded-t-lg px-4 py-2 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-3 h-3 bg-white rounded-full opacity-20"></div>
                  <span className="text-xs font-medium">iPhone</span>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
              </div>
              <CardContent className="p-4 bg-gray-100 text-black min-h-[200px]">
                <div className="space-y-2">
                  <div className="text-xs text-gray-500 text-center">
                    Today {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex justify-end">
                    <div className="bg-blue-500 text-white p-3 rounded-lg rounded-br-sm max-w-[85%] shadow-sm">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {renderedContent || 'Your template preview will appear here...'}
                      </p>
                      <div className="flex items-center justify-end mt-2 space-x-1">
                        <CheckCircle className="h-3 w-3 opacity-70" />
                        <span className="text-xs opacity-70">
                          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Character Count Alert */}
            {charCount > 160 && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This message is {charCount} characters and will be sent as {smsCount} SMS messages, which may increase costs.
                </AlertDescription>
              </Alert>
            )}

            {charCount > 0 && charCount <= 160 && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Perfect! This message fits in a single SMS ({charCount} characters).
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Variable Information */}
          {unreplacedVariables.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Missing preview data for:</strong> {unreplacedVariables.join(', ')}
                <br />
                <span className="text-xs">These variables will be replaced with real data when messages are sent.</span>
              </AlertDescription>
            </Alert>
          )}

          {/* Preview Data Editor */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-sm">Preview Data</CardTitle>
                  <CardDescription className="text-xs">
                    Customize the preview data to test different scenarios
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCustomEditor(!showCustomEditor)}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {showCustomEditor ? 'Hide Editor' : 'Customize Data'}
                </Button>
              </div>
            </CardHeader>
            {showCustomEditor && (
              <CardContent>
                <div className="grid grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                  {Object.entries(currentPreviewData)
                    .filter(([key]) => availableVariables ? availableVariables.includes(`{${key}}`) : true)
                    .map(([key, value]) => (
                    <div key={key} className="space-y-1">
                      <Label className="text-xs font-mono text-gray-600">
                        {'{' + key + '}'}
                      </Label>
                      <Input
                        value={customData[key] || value}
                        onChange={(e) => setCustomData({ ...customData, [key]: e.target.value })}
                        className="text-xs"
                        placeholder={value}
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCustomData({})}
                  >
                    Reset to Default
                  </Button>
                  <div className="text-xs text-gray-500">
                    {Object.keys(customData).length} custom values
                  </div>
                </div>
              </CardContent>
            )}
          </Card>

          {/* Tips */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Preview Tips
              </h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Test different scenarios to ensure your message works for all customer types</li>
                <li>• Keep messages under 160 characters when possible to avoid SMS splitting</li>
                <li>• Make sure your message is clear and professional in tone</li>
                <li>• Check that all variables are relevant and will have data when sent</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}