import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Building2, Clock, MapPin, Phone, Mail, Globe } from 'lucide-react';

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
  abn?: string;
  license_number?: string;
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
  const { user } = useAuth();
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
    abn: '',
    license_number: ''
  });

  useEffect(() => {
    if (user) {
      fetchBusinessSettings();
    }
  }, [user]);

  const fetchBusinessSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('business_settings')
        .select('*')
        .eq('user_id', user!.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setSettings({
          ...data,
          operating_hours: data.operating_hours || settings.operating_hours
        });
      }
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

      const dataToSave = {
        ...settings,
        user_id: user!.id,
        updated_at: new Date().toISOString()
      };

      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('business_settings')
          .update(dataToSave)
          .eq('id', settings.id);

        if (error) throw error;
      } else {
        // Create new settings
        const { error } = await supabase
          .from('business_settings')
          .insert([dataToSave]);

        if (error) throw error;
      }

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
              rows={3}
            />
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

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving...' : 'Save Business Information'}
        </Button>
      </div>
    </form>
  );
}