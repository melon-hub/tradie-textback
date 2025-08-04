import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { 
  User, 
  Building2, 
  MapPin, 
  MessageSquare, 
  Phone, 
  Mail, 
  Edit3, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Shield
} from 'lucide-react';
import { useOnboarding } from '../OnboardingContext';
import { ONBOARDING_STEPS } from '@/types/onboarding';

export default function ReviewStep() {
  const { state, dispatch, goToStep } = useOnboarding();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [privacyAccepted, setPrivacyAccepted] = useState(false);

  useEffect(() => {
    // Validate step based on terms acceptance and data completeness
    const isValid = termsAccepted && privacyAccepted && hasRequiredData();
    
    dispatch({
      type: 'SET_STEP_VALIDATION',
      payload: {
        stepId: 6, // Assuming this is step 6
        isValid,
        errors: isValid ? [] : ['Please accept the terms and conditions to continue'],
      },
    });
  }, [termsAccepted, privacyAccepted, dispatch, state.formData]);

  const hasRequiredData = () => {
    const { basicInfo, businessDetails, serviceArea } = state.formData;
    return (
      basicInfo.name &&
      basicInfo.phone &&
      basicInfo.email &&
      basicInfo.trade_primary &&
      businessDetails.business_name &&
      businessDetails.abn &&
      (serviceArea.service_postcodes?.length || serviceArea.service_radius_km)
    );
  };

  const getCompletionStatus = () => {
    const completedSections = [];
    const incompleteSections = [];

    // Check basic info
    if (state.formData.basicInfo.name && 
        state.formData.basicInfo.phone && 
        state.formData.basicInfo.email && 
        state.formData.basicInfo.trade_primary) {
      completedSections.push('Basic Information');
    } else {
      incompleteSections.push('Basic Information');
    }

    // Check business details
    if (state.formData.businessDetails.business_name && 
        state.formData.businessDetails.abn) {
      completedSections.push('Business Details');
    } else {
      incompleteSections.push('Business Details');
    }

    // Check service area
    if (state.formData.serviceArea.service_postcodes?.length || 
        state.formData.serviceArea.service_radius_km) {
      completedSections.push('Service Area');
    } else {
      incompleteSections.push('Service Area');
    }

    // SMS Templates are optional
    if (state.formData.smsTemplates?.length) {
      completedSections.push('SMS Templates');
    }

    return { completedSections, incompleteSections };
  };

  const { completedSections, incompleteSections } = getCompletionStatus();

  const getStepIdByComponent = (component: string) => {
    return ONBOARDING_STEPS.find(step => step.component === component)?.id || 0;
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple phone formatting for display
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Review Your Information</h3>
        <p className="text-sm text-gray-600">
          Please review all details before completing your account setup
        </p>
      </div>

      {/* Completion Status */}
      {incompleteSections.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please complete the following required sections: {incompleteSections.join(', ')}
          </AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Basic Information</CardTitle>
              {state.formData.basicInfo.name ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToStep(getStepIdByComponent('BasicInfo'))}
              className="flex items-center space-x-1"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Name</p>
              <p className="text-sm text-gray-900">{state.formData.basicInfo.name || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Primary Trade</p>
              <p className="text-sm text-gray-900">{state.formData.basicInfo.trade_primary || 'Not selected'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Phone</p>
              <p className="text-sm text-gray-900 flex items-center space-x-1">
                <Phone className="h-3 w-3" />
                <span>{state.formData.basicInfo.phone ? formatPhoneNumber(state.formData.basicInfo.phone) : 'Not provided'}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Email</p>
              <p className="text-sm text-gray-900 flex items-center space-x-1">
                <Mail className="h-3 w-3" />
                <span>{state.formData.basicInfo.email || 'Not provided'}</span>
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Experience</p>
              <p className="text-sm text-gray-900">
                {state.formData.basicInfo.years_experience || 0} years
              </p>
            </div>
            {state.formData.basicInfo.trade_secondary?.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Secondary Trades</p>
                <div className="flex flex-wrap gap-1">
                  {state.formData.basicInfo.trade_secondary.map((trade) => (
                    <Badge key={trade} variant="secondary" className="text-xs">
                      {trade}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Details */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Business Details</CardTitle>
              {state.formData.businessDetails.business_name ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToStep(getStepIdByComponent('BusinessDetails'))}
              className="flex items-center space-x-1"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Business Name</p>
              <p className="text-sm text-gray-900">{state.formData.businessDetails.business_name || 'Not provided'}</p>
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">ABN</p>
              <p className="text-sm text-gray-900 font-mono">{state.formData.businessDetails.abn || 'Not provided'}</p>
            </div>
            {state.formData.businessDetails.license_number && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">License Number</p>
                <p className="text-sm text-gray-900 font-mono">{state.formData.businessDetails.license_number}</p>
              </div>
            )}
            {state.formData.businessDetails.insurance_provider && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-700">Insurance Provider</p>
                <p className="text-sm text-gray-900">{state.formData.businessDetails.insurance_provider}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Service Area */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Service Area</CardTitle>
              {(state.formData.serviceArea.service_postcodes?.length || state.formData.serviceArea.service_radius_km) ? (
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600" />
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToStep(getStepIdByComponent('ServiceArea'))}
              className="flex items-center space-x-1"
            >
              <Edit3 className="h-3 w-3" />
              <span>Edit</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {state.formData.serviceArea.service_postcodes?.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-700">Service Postcodes</p>
              <div className="flex flex-wrap gap-1">
                {state.formData.serviceArea.service_postcodes.map((postcode) => (
                  <Badge key={postcode} variant="outline" className="text-xs">
                    {postcode}
                  </Badge>
                ))}
              </div>
            </div>
          ) : state.formData.serviceArea.service_radius_km ? (
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-700">Service Radius</p>
              <p className="text-sm text-gray-900">{state.formData.serviceArea.service_radius_km}km radius</p>
            </div>
          ) : (
            <p className="text-sm text-gray-500">No service area defined</p>
          )}
        </CardContent>
      </Card>

      {/* SMS Templates */}
      {state.formData.smsTemplates?.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <CardTitle className="text-lg">SMS Templates</CardTitle>
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => goToStep(getStepIdByComponent('SMSTemplates'))}
                className="flex items-center space-x-1"
              >
                <Edit3 className="h-3 w-3" />
                <span>Edit</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {state.formData.smsTemplates.map((template) => (
                <div key={template.template_type} className="border-l-2 border-blue-200 pl-3">
                  <p className="text-sm font-medium text-gray-700 capitalize">
                    {template.template_type.replace('_', ' ')} Template
                  </p>
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {template.content}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator />

      {/* Terms and Conditions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <span>Terms and Conditions</span>
          </CardTitle>
          <CardDescription>
            Please read and accept our terms to complete your account setup
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={setTermsAccepted}
              className="mt-1"
            />
            <div className="space-y-1">
              <label htmlFor="terms" className="text-sm font-medium cursor-pointer">
                I accept the Terms of Service
              </label>
              <p className="text-xs text-gray-600">
                By checking this box, you agree to our{' '}
                <a href="/terms" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Terms of Service
                </a>
                {' '}and confirm that you have read and understood them.
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="privacy"
              checked={privacyAccepted}
              onCheckedChange={setPrivacyAccepted}
              className="mt-1"
            />
            <div className="space-y-1">
              <label htmlFor="privacy" className="text-sm font-medium cursor-pointer">
                I accept the Privacy Policy
              </label>
              <p className="text-xs text-gray-600">
                By checking this box, you acknowledge that you have read our{' '}
                <a href="/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  Privacy Policy
                </a>
                {' '}and consent to the collection and use of your information as described.
              </p>
            </div>
          </div>

          {(!termsAccepted || !privacyAccepted) && (
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You must accept both the Terms of Service and Privacy Policy to complete your account setup.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-green-700">Completed Sections</p>
              <p className="text-sm text-gray-600">{completedSections.length} of 3 required</p>
            </div>
            {incompleteSections.length > 0 && (
              <div>
                <p className="text-sm font-medium text-red-700">Incomplete Sections</p>
                <p className="text-sm text-gray-600">{incompleteSections.length} remaining</p>
              </div>
            )}
          </div>
          
          {incompleteSections.length === 0 && termsAccepted && privacyAccepted && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <p className="text-sm text-green-800 font-medium">
                  Ready to complete setup!
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}