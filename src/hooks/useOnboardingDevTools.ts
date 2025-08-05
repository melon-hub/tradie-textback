import { useEffect } from 'react';
import { useOnboarding } from '@/components/onboarding/OnboardingContext';

// Mock data sets
const MOCK_DATA_SETS = {
  'sydney-plumber': {
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
    },
    templates: {
      missed_call: 'Hi, this is Smith Plumbing. I missed your call but will get back to you ASAP. For emergencies, please text URGENT.',
      after_hours: 'Thanks for calling Smith Plumbing! We\'re closed but will respond first thing in the morning. For emergencies, call 0400 123 456.',
      job_confirmation: 'Hi {customer_name}, confirming our appointment for {job_date} at {job_time}. I\'ll text when I\'m on my way. - John from Smith Plumbing'
    }
  },
  'melbourne-electrician': {
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
    },
    templates: {
      missed_call: 'Hi, Sparky Solutions here. Missed your call but I\'ll call back soon. For urgent electrical issues, text URGENT.',
      after_hours: 'Thanks for contacting Sparky Solutions. We\'re closed but will respond first thing tomorrow. For electrical emergencies, call 0423 456 789.',
      job_confirmation: 'Confirmed! I\'ll be at {job_address} on {job_date} at {job_time}. - Sarah from Sparky Solutions'
    }
  },
  'brisbane-carpenter': {
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
    },
    templates: {
      missed_call: 'G\'day! Mike from Wilson Carpentry here. Missed your call but will ring back shortly.',
      after_hours: 'Thanks for calling Wilson Carpentry. We\'re closed but will call you back tomorrow. Cheers! - Mike',
      job_confirmation: 'Job confirmed for {job_date} at {job_time}. Location: {job_address}. - Mike'
    }
  },
  'minimal-tradie': {
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
    },
    templates: {
      missed_call: 'Missed your call, will get back to you soon.',
      after_hours: 'We\'re closed, will call back tomorrow.',
      job_confirmation: 'Job confirmed for {job_date} at {job_time}.'
    }
  }
};

export function useOnboardingDevTools() {
  const { dispatch, state } = useOnboarding();

  useEffect(() => {
    // Check for URL parameters on mount
    if (import.meta.env.DEV && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const devAction = urlParams.get('devAction');
      const dataSet = urlParams.get('dataSet');
      const step = urlParams.get('step');

      // Process dev actions from URL
      if (devAction) {
        // Clear URL parameters after reading to prevent re-execution on refresh
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, '', cleanUrl);

        // Execute the action after a small delay to ensure context is ready
        setTimeout(() => {
          const devTools = (window as any).__onboardingDevTools;
          if (!devTools) {
            console.error('Dev tools not ready yet');
            return;
          }

          switch (devAction) {
            case 'fillMockData':
              if (dataSet && MOCK_DATA_SETS[dataSet as keyof typeof MOCK_DATA_SETS]) {
                console.log('🚀 Executing fillMockData from URL:', dataSet);
                devTools.fillMockData(dataSet as keyof typeof MOCK_DATA_SETS);
              }
              break;
            case 'jumpToStep':
              if (step) {
                const stepNumber = parseInt(step, 10);
                if (!isNaN(stepNumber)) {
                  console.log('🚀 Executing jumpToStep from URL:', stepNumber);
                  devTools.jumpToStep(stepNumber);
                }
              }
              break;
            case 'clearData':
              console.log('🚀 Executing clearData from URL');
              devTools.clearData();
              break;
          }
        }, 100);
      }
    }

    // Expose dev tools to window for console access
    if (import.meta.env.DEV) {
      (window as any).__onboardingDevTools = {
        fillMockData: (dataSetName: keyof typeof MOCK_DATA_SETS = 'sydney-plumber') => {
          const dataSet = MOCK_DATA_SETS[dataSetName];
          if (!dataSet) {
            console.error('Dataset not found:', dataSetName);
            return;
          }

          console.log('🎯 Filling mock data:', dataSetName);

          // Fill each step's data
          dispatch({
            type: 'UPDATE_FORM_DATA',
            payload: {
              step: 'basicInfo',
              data: dataSet.basicInfo
            }
          });

          dispatch({
            type: 'UPDATE_FORM_DATA',
            payload: {
              step: 'businessDetails',
              data: dataSet.businessDetails
            }
          });

          dispatch({
            type: 'UPDATE_FORM_DATA',
            payload: {
              step: 'serviceArea',
              data: dataSet.serviceArea
            }
          });

          // Convert templates to array format
          if (dataSet.templates) {
            const templatesArray = Object.entries(dataSet.templates).map(([type, content]) => ({
              template_type: type as any,
              content: content || '',
              variables: []
            }));
            
            dispatch({
              type: 'UPDATE_FORM_DATA',
              payload: {
                step: 'smsTemplates',
                data: templatesArray
              }
            });
          }

          // Mark steps as valid
          for (let i = 0; i <= 5; i++) {
            dispatch({
              type: 'SET_STEP_VALIDATION',
              payload: {
                stepId: i,
                isValid: true,
                errors: []
              }
            });
          }

          console.log('✅ Mock data filled successfully!');
          console.log('💡 Use __onboardingDevTools.jumpToStep(n) to navigate');
        },
        
        jumpToStep: (step: number) => {
          dispatch({
            type: 'SET_CURRENT_STEP',
            payload: step
          });
        },

        clearData: () => {
          dispatch({
            type: 'UPDATE_FORM_DATA',
            payload: { step: 'basicInfo', data: {} }
          });
          dispatch({
            type: 'UPDATE_FORM_DATA',
            payload: { step: 'businessDetails', data: {} }
          });
          dispatch({
            type: 'UPDATE_FORM_DATA',
            payload: { step: 'serviceArea', data: {} }
          });
          dispatch({
            type: 'UPDATE_FORM_DATA',
            payload: { step: 'smsTemplates', data: [] }
          });
          dispatch({
            type: 'SET_CURRENT_STEP',
            payload: 0
          });
          console.log('🗑️ Data cleared');
        },

        getState: () => state,
        
        availableDataSets: Object.keys(MOCK_DATA_SETS)
      };

      console.log('🛠️ Onboarding Dev Tools loaded!');
      console.log('📝 Usage:');
      console.log('  __onboardingDevTools.fillMockData("sydney-plumber")');
      console.log('  __onboardingDevTools.fillMockData("melbourne-electrician")');
      console.log('  __onboardingDevTools.fillMockData("brisbane-carpenter")');
      console.log('  __onboardingDevTools.fillMockData("minimal-tradie")');
      console.log('  __onboardingDevTools.jumpToStep(2) // Go to step 2');
      console.log('  __onboardingDevTools.clearData() // Clear all data');
      console.log('  __onboardingDevTools.getState() // View current state');
    }

    return () => {
      // Cleanup
      if ((window as any).__onboardingDevTools) {
        delete (window as any).__onboardingDevTools;
      }
    };
  }, [dispatch, state]);
}