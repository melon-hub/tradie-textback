import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { User, Building2, MapPin, DollarSign, MessageSquare, Settings as SettingsIcon, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { PersonalInfoForm } from '@/components/settings/PersonalInfoForm';
import { BusinessInfoForm } from '@/components/settings/BusinessInfoForm';
import { ServiceAreaForm } from '@/components/settings/ServiceAreaForm';
import { PricingAvailabilityForm } from '@/components/settings/PricingAvailabilityForm';
import { SMSTemplatesForm } from '@/components/settings/SMSTemplatesForm';
import { TwilioSettingsForm } from '@/components/settings/TwilioSettingsForm';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Only allow tradies and admins to access settings
  useEffect(() => {
    if (profile && profile.user_type !== 'tradie' && !profile.is_admin) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  // Show loading or redirect for non-tradies
  if (profile && profile.user_type !== 'tradie' && !profile.is_admin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Settings</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate('/dashboard')}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </header>

      <div className="container mx-auto py-8 px-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          {/* Mobile: Stack tabs in 2 rows, Desktop: Single row */}
          <div className="space-y-2">
            <TabsList className="grid w-full grid-cols-3 sm:hidden">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Business
              </TabsTrigger>
              <TabsTrigger value="service-areas" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Areas
              </TabsTrigger>
            </TabsList>
            <TabsList className="grid w-full grid-cols-3 sm:hidden">
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="sms-templates" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="twilio" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Twilio
              </TabsTrigger>
            </TabsList>
            {/* Desktop: Single row */}
            <TabsList className="hidden sm:grid w-full grid-cols-6 max-w-[1200px]">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
              <TabsTrigger value="business" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Business
              </TabsTrigger>
              <TabsTrigger value="service-areas" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Service Areas
              </TabsTrigger>
              <TabsTrigger value="pricing" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Pricing
              </TabsTrigger>
              <TabsTrigger value="sms-templates" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                SMS
              </TabsTrigger>
              <TabsTrigger value="twilio" className="flex items-center gap-2">
                <SettingsIcon className="h-4 w-4" />
                Twilio
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="space-y-4">
            <PersonalInfoForm />
          </TabsContent>

          <TabsContent value="business" className="space-y-4">
            <BusinessInfoForm />
          </TabsContent>

          <TabsContent value="service-areas" className="space-y-4">
            <ServiceAreaForm />
          </TabsContent>

          <TabsContent value="pricing" className="space-y-4">
            <PricingAvailabilityForm />
          </TabsContent>

          <TabsContent value="sms-templates" className="space-y-4">
            <SMSTemplatesForm />
          </TabsContent>

          <TabsContent value="twilio" className="space-y-4">
            <TwilioSettingsForm />
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>SMS Notifications</CardTitle>
                <CardDescription>
                  Automatic notifications when jobs are updated
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="rounded-lg bg-muted p-4">
                    <h4 className="font-medium mb-2">Job Update Notifications</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      When clients update their job details, you'll receive an SMS notification instantly.
                    </p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span>Location/address changes</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                        <span>Job description updates</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                        <span>Visual indicator on dashboard</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                    <p className="text-sm text-yellow-800">
                      <strong>Setup Required:</strong> SMS notifications require Twilio to be configured above. Without valid Twilio credentials, only dashboard indicators will show updates.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}