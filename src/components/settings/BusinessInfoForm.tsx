import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Clock, MapPin, Phone, Mail, Globe, CalendarIcon, Shield } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface BusinessSettings {
  id?: string;
  user_id: string;
  business_name: string;
  business_phone: string;
  business_email: string;
  business_address: string;
  business_website?: string;
  service_area: string;
  operating_hours: {
    [key: string]: { open: string; close: string; closed: boolean };
  };
  emergency_available: boolean;
  business_description?: string;
  bio?: string;
  abn?: string;
  license_number?: string;
  license_expiry?: Date | null;
  insurance_provider?: string;
  insurance_expiry?: Date | null;
}

const DAYS_OF_WEEK = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday'
];

const DEFAULT_HOURS = {
  open: '09:00',
  close: '17:00',
  closed: false
};

export function BusinessInfoForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [settings, setSettings] = useState<BusinessSettings>({
    user_id: user?.id || '',
    business_name: '',
    business_phone: '',
    business_email: '',
    business_address: '',
    business_website: '',
    service_area: '',
    operating_hours: DAYS_OF_WEEK.reduce((acc, day) => ({
      ...acc,
      [day]: { ...DEFAULT_HOURS }
    }), {}),
    emergency_available: false,
    business_description: '',
    bio: '',
    abn: '',
    license_number: '',
    license_expiry: null,
    insurance_provider: '',
    insurance_expiry: null,
  });

  useEffect(() => {
    if (user) {
      fetchBusinessSettings();
    }
  }, [user]);

  const fetchBusinessSettings = async () => {
    try {
      setLoading(true);
      
      // Fetch business settings
      const { data: businessData, error: businessError } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (businessError && businessError.code !== 'PGRST116') {
        throw businessError;
      }

      // Also get profile data for bio, insurance and license info
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('bio, insurance_provider, insurance_expiry, license_expiry')
        .eq('user_id', user!.id)
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        throw profileError;
      }

      const combinedData = {
        ...businessData,
        operating_hours: businessData?.operating_hours || settings.operating_hours,
        bio: profileData?.bio || '',
        insurance_provider: profileData?.insurance_provider || '',
        insurance_expiry: profileData?.insurance_expiry ? new Date(profileData.insurance_expiry) : null,
        license_expiry: profileData?.license_expiry ? new Date(profileData.license_expiry) : null,
      };

      setSettings(combinedData);
    } catch (error) {
      console.error('Error fetching business settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to load business settings',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);

      const businessDataToSave = {
        ...settings,
        user_id: user!.id,
        updated_at: new Date().toISOString(),
        // Remove profile-specific fields
        bio: undefined,
        insurance_provider: undefined,
        insurance_expiry: undefined,
        license_expiry: undefined,
      };

      const profileDataToSave = {
        bio: settings.bio,
        insurance_provider: settings.insurance_provider,
        insurance_expiry: settings.insurance_expiry?.toISOString(),
        license_expiry: settings.license_expiry?.toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Update/create business settings
      if (settings.id) {
        const { error } = await supabase
          .from('business_settings')
          .update(businessDataToSave)
          .eq('id', settings.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('business_settings')
          .insert([businessDataToSave]);
        if (error) throw error;
      }

      // Update profile data
      const { error: profileError } = await supabase
        .from('profiles')
        .update(profileDataToSave)
        .eq('user_id', user!.id);
      
      if (profileError) throw profileError;

      toast({
        title: 'Success',
        description: 'Business information saved successfully',
      });

      fetchBusinessSettings(); // Refresh data
    } catch (error) {
      console.error('Error saving business settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save business information',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const updateHours = (day: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      operating_hours: {
        ...prev.operating_hours,
        [day]: {
          ...prev.operating_hours[day],
          [field]: value
        }
      }
    }));
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading business settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Your business details that customers will see
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_name">Business Name</Label>
              <Input
                id="business_name"
                value={settings.business_name}
                onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                placeholder="ABC Plumbing Services"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="abn">ABN</Label>
              <Input
                id="abn"
                value={settings.abn}
                onChange={(e) => setSettings({ ...settings, abn: e.target.value })}
                placeholder="12 345 678 901"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_phone">Business Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="business_phone"
                  type="tel"
                  value={settings.business_phone}
                  onChange={(e) => setSettings({ ...settings, business_phone: e.target.value })}
                  placeholder="0412 345 678"
                  className="pl-10"
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business_email">Business Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="business_email"
                  type="email"
                  value={settings.business_email}
                  onChange={(e) => setSettings({ ...settings, business_email: e.target.value })}
                  placeholder="info@abcplumbing.com.au"
                  className="pl-10"
                  required
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_address">Business Address</Label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="business_address"
                value={settings.business_address}
                onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                placeholder="123 Main St, Sydney NSW 2000"
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="business_website">Website (optional)</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="business_website"
                  type="url"
                  value={settings.business_website}
                  onChange={(e) => setSettings({ ...settings, business_website: e.target.value })}
                  placeholder="https://abcplumbing.com.au"
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="license_number">License Number</Label>
              <Input
                id="license_number"
                value={settings.license_number}
                onChange={(e) => setSettings({ ...settings, license_number: e.target.value })}
                placeholder="L12345"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="business_description">Business Description</Label>
            <Textarea
              id="business_description"
              value={settings.business_description}
              onChange={(e) => setSettings({ ...settings, business_description: e.target.value })}
              placeholder="Describe your services and specialties..."
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              This description will be visible to customers and helps them understand your expertise
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Professional Bio</Label>
            <Textarea
              id="bio"
              value={settings.bio || ''}
              onChange={(e) => setSettings({ ...settings, bio: e.target.value })}
              placeholder="Tell customers about your background, experience, and what makes you unique..."
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Share your professional story, certifications, or what sets you apart from competitors
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Licensing & Insurance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Licensing & Insurance
          </CardTitle>
          <CardDescription>
            Professional credentials and insurance information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Licensing Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">License Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="license_expiry">License Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !settings.license_expiry && "text-muted-foreground"
                      )}
                    >
                      {settings.license_expiry ? (
                        format(settings.license_expiry, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={settings.license_expiry}
                      onSelect={(date) => setSettings({ ...settings, license_expiry: date || null })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          {/* Insurance Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Insurance Information</h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="insurance_provider">Insurance Provider</Label>
                <Input
                  id="insurance_provider"
                  value={settings.insurance_provider}
                  onChange={(e) => setSettings({ ...settings, insurance_provider: e.target.value })}
                  placeholder="e.g., AAMI, Allianz"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="insurance_expiry">Insurance Expiry Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full pl-3 text-left font-normal",
                        !settings.insurance_expiry && "text-muted-foreground"
                      )}
                    >
                      {settings.insurance_expiry ? (
                        format(settings.insurance_expiry, "PPP")
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={settings.insurance_expiry}
                      onSelect={(date) => setSettings({ ...settings, insurance_expiry: date || null })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Professional Credibility</h4>
              <p className="text-sm text-blue-800">
                Adding license and insurance information helps build trust with customers and
                demonstrates your professionalism and compliance with industry standards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Service Area
          </CardTitle>
          <CardDescription>
            Areas where you provide services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="service_area">Service Areas</Label>
            <Textarea
              id="service_area"
              value={settings.service_area}
              onChange={(e) => setSettings({ ...settings, service_area: e.target.value })}
              placeholder="Sydney CBD, Eastern Suburbs, North Shore..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Operating Hours
          </CardTitle>
          <CardDescription>
            When customers can reach you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div key={day} className="flex items-center justify-between py-2 border-b last:border-0">
              <div className="flex items-center gap-4 flex-1">
                <Label className="w-24 capitalize">{day}</Label>
                <Switch
                  checked={!settings.operating_hours[day].closed}
                  onCheckedChange={(checked) => updateHours(day, 'closed', !checked)}
                />
              </div>
              
              {!settings.operating_hours[day].closed && (
                <div className="flex items-center gap-2">
                  <Input
                    type="time"
                    value={settings.operating_hours[day].open}
                    onChange={(e) => updateHours(day, 'open', e.target.value)}
                    className="w-24"
                  />
                  <span>to</span>
                  <Input
                    type="time"
                    value={settings.operating_hours[day].close}
                    onChange={(e) => updateHours(day, 'close', e.target.value)}
                    className="w-24"
                  />
                </div>
              )}
              
              {settings.operating_hours[day].closed && (
                <span className="text-muted-foreground">Closed</span>
              )}
            </div>
          ))}
          
          <div className="flex items-center justify-between pt-4">
            <Label htmlFor="emergency">Available for emergencies</Label>
            <Switch
              id="emergency"
              checked={settings.emergency_available}
              onCheckedChange={(checked) => setSettings({ ...settings, emergency_available: checked })}
            />
          </div>
        </CardContent>
      </Card>

      {/* Auto-save status */}
      <div className="flex justify-between items-center text-sm text-muted-foreground">
        <span>Changes are saved when you click the button</span>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Business Information'}
        </Button>
      </div>
    </form>
  );
}