import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, MessageSquare, Palette, Bell, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { BusinessInfoForm } from '@/components/settings/BusinessInfoForm';
import { TwilioSettingsForm } from '@/components/settings/TwilioSettingsForm';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('business');
  const navigate = useNavigate();
  const { profile } = useAuth();

  // Only allow tradies to access settings
  if (profile?.user_type !== 'tradie' && !profile?.is_admin) {
    navigate('/dashboard');
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
          <TabsList className="grid w-full grid-cols-4 max-w-[800px]">
            <TabsTrigger value="business" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Business
            </TabsTrigger>
            <TabsTrigger value="twilio" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              SMS/Twilio
            </TabsTrigger>
            <TabsTrigger value="branding" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Branding
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
          </TabsList>

          <TabsContent value="business" className="space-y-4">
            <BusinessInfoForm />
          </TabsContent>

          <TabsContent value="twilio" className="space-y-4">
            <TwilioSettingsForm />
          </TabsContent>

          <TabsContent value="branding" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Branding & Customization</CardTitle>
                <CardDescription>
                  Customize the look and feel of your customer portal
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Branding customization coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
                <CardDescription>
                  Configure how and when you receive notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Notification settings coming soon...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}