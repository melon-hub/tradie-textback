import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { FormDataItem, Wand2, ArrowRight, RotateCcw } from 'lucide-react';
import { useOnboarding } from '@/components/onboarding/OnboardingContext';

interface MockDataSet {
  id: string;
  name: string;
  description: string;
  data: {
    basicInfo: {
      name: string;
      phone: string;
      email: string;
      trade_primary: string;
      trade_secondary?: string[];
      years_experience: number;
    };
    businessDetails: {
      business_name: string;
      abn: string;
      license_number?: string;
      license_expiry?: string;
      insurance_provider?: string;
      insurance_expiry?: string;
    };
    serviceArea: {
      area_type?: 'postcodes' | 'radius';
      service_postcodes?: string[];
      service_radius_km?: number;
      radius_center_address?: string;
      suburbs?: string[]; // legacy field
      radius?: number; // legacy field
      travel_preference?: string; // legacy field
    };
    twilioSetup?: {
      account_sid?: string;
      auth_token?: string;
      phone_number?: string;
      enabled?: boolean;
    };
    templates: {
      missed_call?: string;
      after_hours?: string;
      job_confirmation?: string;
    };
  };
}

const MOCK_DATA_SETS: MockDataSet[] = [
  {
    id: 'sydney-plumber',
    name: 'Sydney Plumber',
    description: 'Experienced plumber in Sydney area',
    data: {
      basicInfo: {
        name: 'John Smith',
        phone: '0412 345 678',
        email: 'john.smith@plumbingpro.com.au',
        trade_primary: 'plumber',
        trade_secondary: ['gasfitter', 'drainage'],
        years_experience: 15
      },
      businessDetails: {
        business_name: 'Smith Plumbing Services',
        abn: '12345678901',
        license_number: 'PL12345',
        license_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        insurance_provider: 'AAMI',
        insurance_expiry: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      serviceArea: {
        area_type: 'postcodes',
        service_postcodes: ['2000', '2026', '2034', '2031', '2035'],
        suburbs: ['Sydney CBD', 'Bondi', 'Coogee', 'Randwick', 'Maroubra'],
        radius: 25,
        travel_preference: 'radius'
      },
      twilioSetup: {
        account_sid: 'AC' + '0'.repeat(30),
        auth_token: 'mock_auth_token_' + Math.random().toString(36).substring(7),
        phone_number: '+61412345678',
        enabled: true
      },
      templates: {
        missed_call: 'Hi, this is Smith Plumbing. I missed your call but will get back to you ASAP. For emergencies, please text URGENT.',
        after_hours: 'Thanks for calling Smith Plumbing! We\'re closed but will respond first thing in the morning. For emergencies, call 0400 123 456.',
        job_confirmation: 'Hi {customer_name}, confirming our appointment for {job_date} at {job_time}. I\'ll text when I\'m on my way. - John from Smith Plumbing'
      }
    }
  },
  {
    id: 'melbourne-electrician',
    name: 'Melbourne Electrician',
    description: 'Licensed electrician in Melbourne',
    data: {
      basicInfo: {
        name: 'Sarah Johnson',
        phone: '0423 456 789',
        email: 'sarah@sparkysolutions.com.au',
        trade_primary: 'electrician',
        trade_secondary: ['solar', 'data-cabling'],
        years_experience: 10
      },
      businessDetails: {
        business_name: 'Sparky Solutions Melbourne',
        abn: '98765432109',
        license_number: 'REC-25678',
        license_expiry: new Date(Date.now() + 400 * 24 * 60 * 60 * 1000).toISOString(),
        insurance_provider: 'Allianz',
        insurance_expiry: new Date(Date.now() + 200 * 24 * 60 * 60 * 1000).toISOString()
      },
      serviceArea: {
        area_type: 'radius',
        service_radius_km: 30,
        radius_center_address: '123 Collins Street, Melbourne VIC 3000',
        suburbs: ['Melbourne CBD', 'Richmond', 'South Yarra', 'Prahran', 'St Kilda'],
        radius: 30,
        travel_preference: 'suburbs'
      },
      twilioSetup: {
        account_sid: 'AC' + '1'.repeat(30),
        auth_token: 'mock_auth_token_' + Math.random().toString(36).substring(7),
        phone_number: '+61423456789',
        enabled: true
      },
      templates: {
        missed_call: 'Hi, Sparky Solutions here. Missed your call but I\'ll call back soon. For urgent electrical issues, text URGENT.',
        after_hours: 'Thanks for contacting Sparky Solutions. We\'re closed but will respond first thing tomorrow. For electrical emergencies, call 0423 456 789.',
        job_confirmation: 'Confirmed! I\'ll be at {job_address} on {job_date} at {job_time}. - Sarah from Sparky Solutions'
      }
    }
  },
  {
    id: 'brisbane-carpenter',
    name: 'Brisbane Carpenter',
    description: 'Custom carpentry and renovations',
    data: {
      basicInfo: {
        name: 'Mike Wilson',
        phone: '0434 567 890',
        email: 'mike@customcarpentry.com.au',
        trade_primary: 'carpenter',
        trade_secondary: ['builder', 'handyman'],
        years_experience: 20
      },
      businessDetails: {
        business_name: 'Wilson Custom Carpentry',
        abn: '11223344556',
        license_number: 'QBCC-123456',
        license_expiry: new Date(Date.now() + 300 * 24 * 60 * 60 * 1000).toISOString(),
        insurance_provider: 'CGU',
        insurance_expiry: new Date(Date.now() + 250 * 24 * 60 * 60 * 1000).toISOString()
      },
      serviceArea: {
        area_type: 'postcodes',
        service_postcodes: ['4000', '4005', '4006', '4001', '4169'],
        suburbs: ['Brisbane City', 'New Farm', 'Teneriffe', 'Fortitude Valley', 'Kangaroo Point'],
        radius: 50,
        travel_preference: 'anywhere'
      },
      templates: {
        missed_call: 'G\'day! Mike from Wilson Carpentry here. Missed your call but will ring back shortly.',
        after_hours: 'Thanks for calling Wilson Carpentry. We\'re closed but will call you back tomorrow. Cheers! - Mike',
        job_confirmation: 'Job confirmed for {job_date} at {job_time}. Location: {job_address}. - Mike'
      }
    }
  },
  {
    id: 'minimal-tradie',
    name: 'Minimal Setup',
    description: 'Just the required fields',
    data: {
      basicInfo: {
        name: 'Test Tradie',
        phone: '0400 000 000',
        email: 'test@example.com',
        trade_primary: 'handyman',
        years_experience: 5
      },
      businessDetails: {
        business_name: 'Test Business',
        abn: '00000000000'
      },
      serviceArea: {
        area_type: 'postcodes',
        service_postcodes: ['2000'],
        suburbs: ['Test Suburb'],
        travel_preference: 'suburbs'
      },
      templates: {
        missed_call: 'Missed your call, will get back to you soon.',
        after_hours: 'We\'re closed, will call back tomorrow.',
        job_confirmation: 'Job confirmed for {job_date} at {job_time}.'
      }
    }
  }
];

export function OnboardingMockDataFiller() {
  const { toast } = useToast();
  const [selectedDataSet, setSelectedDataSet] = React.useState<string>('sydney-plumber');
  
  // Try to use the onboarding context if available
  let dispatch: any = null;
  let state: any = null;
  
  try {
    const context = useOnboarding();
    dispatch = context.dispatch;
    state = context.state;
  } catch (error) {
    console.log('⚠️ OnboardingMockDataFiller: Not inside OnboardingProvider context');
  }

  const fillMockData = (dataSetId: string) => {
    console.log('🔍 fillMockData called with:', dataSetId);
    
    if (!dispatch) {
      console.error('❌ No onboarding context available');
      toast({
        title: "⚠️ Context Error",
        description: "Please use this tool from the onboarding page",
        variant: "destructive"
      });
      return;
    }
    
    const dataSet = MOCK_DATA_SETS.find(ds => ds.id === dataSetId);
    if (!dataSet) {
      console.error('❌ Dataset not found:', dataSetId);
      return;
    }

    console.log('📦 Dataset found:', dataSet);
    console.log('📊 Current state before fill:', state);

    // Fill each step's data individually
    console.log('📝 Dispatching basicInfo:', dataSet.data.basicInfo);
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step: 'basicInfo',
        data: dataSet.data.basicInfo
      }
    });

    console.log('📝 Dispatching businessDetails:', dataSet.data.businessDetails);
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step: 'businessDetails',
        data: dataSet.data.businessDetails
      }
    });

    console.log('📝 Dispatching serviceArea:', dataSet.data.serviceArea);
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step: 'serviceArea',
        data: dataSet.data.serviceArea
      }
    });

    if (dataSet.data.templates) {
      // Convert templates to the format expected by the form
      const templatesArray = Object.entries(dataSet.data.templates).map(([type, content]) => ({
        template_type: type,
        content: content || '',
        variables: [] // The component will handle this
      }));
      
      console.log('📝 Dispatching templates:', templatesArray);
      dispatch({
        type: 'UPDATE_FORM_DATA',
        payload: {
          step: 'smsTemplates',
          data: templatesArray
        }
      });
    }

    // Mark all required steps as valid
    dispatch({
      type: 'SET_STEP_VALIDATION',
      payload: {
        stepId: 0,
        isValid: true,
        errors: []
      }
    });

    dispatch({
      type: 'SET_STEP_VALIDATION',
      payload: {
        stepId: 1,
        isValid: true,
        errors: []
      }
    });

    dispatch({
      type: 'SET_STEP_VALIDATION',
      payload: {
        stepId: 2,
        isValid: true,
        errors: []
      }
    });

    dispatch({
      type: 'SET_STEP_VALIDATION',
      payload: {
        stepId: 3,
        isValid: true,
        errors: []
      }
    });

    // Optional steps
    dispatch({
      type: 'SET_STEP_VALIDATION',
      payload: {
        stepId: 4,
        isValid: true,
        errors: []
      }
    });

    dispatch({
      type: 'SET_STEP_VALIDATION',
      payload: {
        stepId: 5,
        isValid: true,
        errors: []
      }
    });

    toast({
      title: "✅ Mock Data Filled",
      description: `Loaded ${dataSet.name} profile. Navigate through steps to review.`
    });
  };

  const clearAllData = () => {
    if (!dispatch) {
      toast({
        title: "⚠️ Context Error",
        description: "Please use this tool from the onboarding page",
        variant: "destructive"
      });
      return;
    }
    
    // Clear each step's data
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step: 'basicInfo',
        data: {}
      }
    });
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step: 'businessDetails',
        data: {}
      }
    });
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step: 'serviceArea',
        data: {}
      }
    });
    
    dispatch({
      type: 'UPDATE_FORM_DATA',
      payload: {
        step: 'smsTemplates',
        data: []
      }
    });
    
    // Reset to first step
    dispatch({
      type: 'SET_CURRENT_STEP',
      payload: 0
    });
    
    toast({
      title: "🗑️ Data Cleared",
      description: "All onboarding form data has been reset."
    });
  };

  const jumpToStep = (stepIndex: number) => {
    if (!dispatch) {
      toast({
        title: "⚠️ Context Error",
        description: "Please use this tool from the onboarding page",
        variant: "destructive"
      });
      return;
    }
    
    dispatch({
      type: 'SET_CURRENT_STEP',
      payload: stepIndex
    });
  };

  const getCurrentStepName = () => {
    const steps = ['Welcome', 'Basic Info', 'Business Details', 'Service Area', 'SMS Templates', 'Review & Confirm', 'Complete'];
    return steps[state?.currentStep] || 'Unknown';
  };

  // If not in onboarding context, show helpful message
  if (!dispatch || !state) {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800 font-medium mb-2">
            📝 Onboarding Dev Tools
          </p>
          <div className="space-y-2 text-xs text-blue-700">
            <p>Click any action below to execute it:</p>
            <div className="bg-white p-2 rounded border border-blue-200 space-y-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs font-mono hover:bg-blue-50 h-auto py-1 px-2"
                onClick={() => {
                  window.location.href = '/onboarding?devAction=fillMockData&dataSet=sydney-plumber';
                }}
              >
                <Wand2 className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-left">Fill Sydney Plumber Data</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs font-mono hover:bg-blue-50 h-auto py-1 px-2"
                onClick={() => {
                  window.location.href = '/onboarding?devAction=fillMockData&dataSet=melbourne-electrician';
                }}
              >
                <Wand2 className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-left">Fill Melbourne Electrician Data</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs font-mono hover:bg-blue-50 h-auto py-1 px-2"
                onClick={() => {
                  window.location.href = '/onboarding?devAction=fillMockData&dataSet=brisbane-carpenter';
                }}
              >
                <Wand2 className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-left">Fill Brisbane Carpenter Data</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs font-mono hover:bg-blue-50 h-auto py-1 px-2"
                onClick={() => {
                  window.location.href = '/onboarding?devAction=fillMockData&dataSet=minimal-tradie';
                }}
              >
                <Wand2 className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-left">Fill Minimal Setup Data</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs font-mono hover:bg-blue-50 h-auto py-1 px-2"
                onClick={() => {
                  window.location.href = '/onboarding?devAction=jumpToStep&step=2';
                }}
              >
                <ArrowRight className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-left">Jump to Step 2</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs font-mono hover:bg-blue-50 h-auto py-1 px-2"
                onClick={() => {
                  window.location.href = '/onboarding?devAction=clearData';
                }}
              >
                <RotateCcw className="h-3 w-3 mr-2 flex-shrink-0" />
                <span className="text-left">Clear All Data</span>
              </Button>
            </div>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full"
          onClick={() => window.location.href = '/onboarding'}
        >
          Go to Onboarding Page
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Label>Onboarding Mock Data</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Fill the onboarding form with test data
        </p>
      </div>

      {/* Data Set Selection */}
      <div className="space-y-2">
        <Label htmlFor="mock-data-set">Select Mock Profile</Label>
        <Select value={selectedDataSet} onValueChange={setSelectedDataSet}>
          <SelectTrigger id="mock-data-set">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MOCK_DATA_SETS.map(dataSet => (
              <SelectItem key={dataSet.id} value={dataSet.id}>
                <div>
                  <div className="font-medium">{dataSet.name}</div>
                  <div className="text-xs text-muted-foreground">{dataSet.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Fill Data Button */}
      <Button
        variant="outline"
        className="w-full justify-start"
        onClick={() => fillMockData(selectedDataSet)}
      >
        <Wand2 className="h-4 w-4 mr-2" />
        Fill Mock Data
      </Button>

      <Separator />

      {/* Current Step Info */}
      <div className="space-y-2">
        <Label>Current Step</Label>
        <div className="p-2 bg-muted rounded-md text-sm">
          Step {state.currentStep + 1}: {getCurrentStepName()}
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="space-y-2">
        <Label>Quick Navigation</Label>
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => jumpToStep(0)}
            disabled={state.currentStep === 0}
          >
            Welcome
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => jumpToStep(1)}
            disabled={state.currentStep === 1}
          >
            Basic Info
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => jumpToStep(2)}
            disabled={state.currentStep === 2}
          >
            Business
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => jumpToStep(3)}
            disabled={state.currentStep === 3}
          >
            Service Area
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => jumpToStep(4)}
            disabled={state.currentStep === 4}
          >
            SMS Setup
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => jumpToStep(5)}
            disabled={state.currentStep === 5}
          >
            Review
          </Button>
        </div>
      </div>

      <Separator />

      {/* Clear Data */}
      <Button
        variant="outline"
        className="w-full justify-start text-red-600 hover:text-red-700"
        onClick={clearAllData}
      >
        Clear All Data
      </Button>

      {/* Tips */}
      <div className="text-xs text-muted-foreground space-y-1">
        <p>• Mock data fills all required fields</p>
        <p>• Navigate between steps without submitting</p>
        <p>• Review & Confirm shows all entered data</p>
        <p>• Final submit only happens on last step</p>
      </div>
    </div>
  );
}