import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Phone, CheckCircle, XCircle, Clock, Info, ArrowRight } from 'lucide-react';
import { useOnboarding } from '../OnboardingContext';

interface TwilioStatus {
  status: 'pending' | 'provisioning' | 'active' | 'failed';
  phoneNumber?: string;
  error?: string;
  lastChecked?: Date;
}

export default function TwilioSetupStep() {
  const { state, dispatch } = useOnboarding();
  const [twilioStatus, setTwilioStatus] = useState<TwilioStatus>({ status: 'pending' });
  const [isRequesting, setIsRequesting] = useState(false);

  useEffect(() => {
    // Mark step as valid since it's optional
    dispatch({
      type: 'SET_STEP_VALIDATION',
      payload: {
        stepId: 4, // Assuming this is step 4
        isValid: true,
        errors: [],
      },
    });
  }, [dispatch]);

  const handleRequestPhoneNumber = async () => {
    setIsRequesting(true);
    setTwilioStatus({ status: 'provisioning' });

    try {
      // Simulate API call to request phone number provisioning
      // In real implementation, this would call your backend API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, randomly succeed or fail
      const success = Math.random() > 0.3;
      
      if (success) {
        setTwilioStatus({
          status: 'active',
          phoneNumber: '+61400123456',
          lastChecked: new Date(),
        });
      } else {
        setTwilioStatus({
          status: 'failed',
          error: 'Unable to provision phone number at this time. Please try again later.',
          lastChecked: new Date(),
        });
      }
    } catch (error) {
      setTwilioStatus({
        status: 'failed',
        error: 'Network error occurred. Please check your connection and try again.',
        lastChecked: new Date(),
      });
    } finally {
      setIsRequesting(false);
    }
  };

  const getStatusIcon = () => {
    switch (twilioStatus.status) {
      case 'active':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'provisioning':
        return <Clock className="h-5 w-5 text-yellow-600 animate-pulse" />;
      default:
        return <Phone className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (twilioStatus.status) {
      case 'active':
        return <Badge variant="success" className="bg-green-100 text-green-800">Active</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'provisioning':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Provisioning</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Phone Number Setup Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <div>
                <CardTitle className="text-lg">Business Phone Number</CardTitle>
                <CardDescription>
                  Get a dedicated phone number for your business communications
                </CardDescription>
              </div>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {twilioStatus.status === 'pending' && (
            <div className="space-y-4">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertDescription>
                  We'll provision a dedicated Australian phone number for your business. 
                  This number will be used for all SMS communications with your customers.
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleRequestPhoneNumber}
                disabled={isRequesting}
                className="w-full sm:w-auto"
              >
                {isRequesting ? (
                  <>
                    <Clock className="h-4 w-4 mr-2 animate-spin" />
                    Requesting Phone Number...
                  </>
                ) : (
                  <>
                    <Phone className="h-4 w-4 mr-2" />
                    Request Phone Number
                  </>
                )}
              </Button>
            </div>
          )}

          {twilioStatus.status === 'provisioning' && (
            <div className="space-y-4">
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  We're setting up your phone number. This usually takes 1-2 minutes.
                </AlertDescription>
              </Alert>
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                <span className="text-sm text-gray-600">Provisioning in progress...</span>
              </div>
            </div>
          )}

          {twilioStatus.status === 'active' && (
            <div className="space-y-4">
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Your business phone number is ready! You can now send and receive SMS messages.
                </AlertDescription>
              </Alert>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Your Business Number</p>
                    <p className="text-lg font-mono text-blue-600">{twilioStatus.phoneNumber}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>
            </div>
          )}

          {twilioStatus.status === 'failed' && (
            <div className="space-y-4">
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  {twilioStatus.error || 'Failed to provision phone number. Please try again.'}
                </AlertDescription>
              </Alert>
              
              <Button 
                onClick={handleRequestPhoneNumber}
                disabled={isRequesting}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Phone className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">What This Enables</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <ArrowRight className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Automated SMS Responses</p>
                <p className="text-sm text-gray-600">
                  Send automatic replies when you miss calls or receive after-hours contacts
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <ArrowRight className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Job Confirmations</p>
                <p className="text-sm text-gray-600">
                  Send booking confirmations and reminders to your customers
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                <ArrowRight className="h-3 w-3 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Two-Way Communication</p>
                <p className="text-sm text-gray-600">
                  Customers can reply to your messages and you'll receive them in your dashboard
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Skip Notice */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Optional:</strong> You can skip this step and set up your phone number later 
          in your account settings. The rest of the system will work without SMS functionality.
        </AlertDescription>
      </Alert>
    </div>
  );
}