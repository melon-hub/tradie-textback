import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, MapPin, Shield, Calendar, CreditCard } from 'lucide-react';

interface EmailPreviewProps {
  formData: any;
  email?: string;
}

export function EmailPreview({ formData, email }: EmailPreviewProps) {
  const { basicInfo, businessDetails, serviceArea } = formData;
  
  return (
    <Card className="border-2 border-blue-200 bg-blue-50/30">
      <CardHeader className="bg-white border-b">
        <div className="flex items-center gap-2">
          <Mail className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">Welcome Email Preview</CardTitle>
        </div>
        <p className="text-sm text-gray-600 mt-1">
          This is what you'll receive at <strong>{email || basicInfo.email || 'your email'}</strong>
        </p>
      </CardHeader>
      <CardContent className="bg-white p-6 space-y-6">
        {/* Email Header */}
        <div className="text-center space-y-2 pb-4 border-b">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome to Tradie Textback! 🎉
          </h2>
          <p className="text-gray-600">
            Your 14-day free trial has been activated
          </p>
        </div>

        {/* Account Details */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">Your Account Details:</h3>
          
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="font-medium text-gray-900">{businessDetails.business_name || 'Your Business'}</p>
                <p className="text-sm text-gray-600">{basicInfo.trade_primary} Services</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{basicInfo.phone}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-600">Service Area</p>
                <p className="font-medium">
                  {serviceArea.service_postcodes?.length > 0 
                    ? `${serviceArea.service_postcodes.length} postcodes` 
                    : `${serviceArea.service_radius_km}km radius`}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">What's Next?</h3>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                1
              </div>
              <div>
                <p className="font-medium">Check your email for the magic link</p>
                <p className="text-sm text-gray-600">Click the link to activate your account</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                2
              </div>
              <div>
                <p className="font-medium">Configure your phone number</p>
                <p className="text-sm text-gray-600">We'll help you set up SMS automation</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                3
              </div>
              <div>
                <p className="font-medium">Start receiving leads</p>
                <p className="text-sm text-gray-600">Never miss a customer again!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Trial Info */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <p className="font-medium text-green-900">14-Day Free Trial Active</p>
              <p className="text-sm text-green-700">
                No credit card required • Cancel anytime
              </p>
            </div>
          </div>
        </div>

        {/* Support */}
        <div className="pt-4 border-t text-center space-y-2">
          <p className="text-sm text-gray-600">
            Need help? Reply to this email or call us at 1800-TRADIE
          </p>
          <p className="text-xs text-gray-500">
            You're receiving this because you signed up at tradietextback.com.au
          </p>
        </div>
      </CardContent>
    </Card>
  );
}