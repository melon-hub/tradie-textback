import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { MapPin, Radius, Plus, X, Zap } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';

// Validation schema similar to the onboarding ServiceAreaStep
const serviceAreaSchema = z.object({
  area_type: z.enum(['postcodes', 'radius'], {
    required_error: 'Please select how you want to define your service area',
  }),
  service_postcodes: z.array(z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits')).optional(),
  service_radius_km: z.number().min(1).max(200).optional(),
  radius_center_address: z.string().optional(),
  emergency_available: z.boolean().default(false),
}).refine((data) => {
  if (data.area_type === 'postcodes') {
    return data.service_postcodes && data.service_postcodes.length > 0;
  }
  return true;
}, {
  message: "At least one postcode is required when using postcode-based service area",
  path: ["service_postcodes"],
}).refine((data) => {
  if (data.area_type === 'radius') {
    return data.service_radius_km && data.service_radius_km > 0 && data.radius_center_address;
  }
  return true;
}, {
  message: "Radius and base location are required when using radius-based service area",
  path: ["service_radius_km"],
});

type ServiceAreaFormData = z.infer<typeof serviceAreaSchema>;

// Common Australian postcodes for suggestions
const COMMON_POSTCODES = [
  { postcode: '2000', suburb: 'Sydney', state: 'NSW' },
  { postcode: '3000', suburb: 'Melbourne', state: 'VIC' },
  { postcode: '4000', suburb: 'Brisbane', state: 'QLD' },
  { postcode: '5000', suburb: 'Adelaide', state: 'SA' },
  { postcode: '6000', suburb: 'Perth', state: 'WA' },
  { postcode: '7000', suburb: 'Hobart', state: 'TAS' },
  { postcode: '0800', suburb: 'Darwin', state: 'NT' },
  { postcode: '2600', suburb: 'Canberra', state: 'ACT' },
  // Add more common postcodes
  { postcode: '2010', suburb: 'Surry Hills', state: 'NSW' },
  { postcode: '2015', suburb: 'Alexandria', state: 'NSW' },
  { postcode: '2016', suburb: 'Redfern', state: 'NSW' },
  { postcode: '2017', suburb: 'Waterloo', state: 'NSW' },
  { postcode: '2021', suburb: 'Centennial Park', state: 'NSW' },
  { postcode: '2022', suburb: 'Bondi Junction', state: 'NSW' },
  { postcode: '2026', suburb: 'Bondi', state: 'NSW' },
  { postcode: '2030', suburb: 'Dover Heights', state: 'NSW' },
  { postcode: '2031', suburb: 'Coogee', state: 'NSW' },
  { postcode: '2040', suburb: 'Leichhardt', state: 'NSW' },
  { postcode: '2041', suburb: 'Balmain', state: 'NSW' },
  { postcode: '2050', suburb: 'Camperdown', state: 'NSW' },
  { postcode: '2060', suburb: 'North Sydney', state: 'NSW' },
  { postcode: '2065', suburb: 'St Leonards', state: 'NSW' },
  { postcode: '2070', suburb: 'Lindfield', state: 'NSW' },
  { postcode: '2100', suburb: 'Brookvale', state: 'NSW' },
  { postcode: '2110', suburb: 'Hunters Hill', state: 'NSW' },
  { postcode: '2120', suburb: 'Thornleigh', state: 'NSW' },
  { postcode: '2130', suburb: 'Summer Hill', state: 'NSW' },
  { postcode: '2140', suburb: 'Homebush', state: 'NSW' },
  { postcode: '2150', suburb: 'Parramatta', state: 'NSW' },
];

export function ServiceAreaForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [postcodeInput, setPostcodeInput] = useState('');
  const [postcodeSearch, setPostcodeSearch] = useState('');
  const [suggestions, setSuggestions] = useState<typeof COMMON_POSTCODES>([]);

  const form = useForm<ServiceAreaFormData>({
    resolver: zodResolver(serviceAreaSchema),
    defaultValues: {
      area_type: 'postcodes' as 'postcodes' | 'radius',
      service_postcodes: profile?.service_postcodes || [],
      service_radius_km: profile?.service_radius_km || 25,
      radius_center_address: profile?.address || '',
      emergency_available: profile?.after_hours_enabled || false,
    },
    mode: 'onChange',
  });

  const { watch, setValue, getValues } = form;
  const watchedValues = watch();

  // Set initial area_type based on existing data
  useEffect(() => {
    if (profile) {
      const hasPostcodes = profile.service_postcodes && profile.service_postcodes.length > 0;
      const hasRadius = profile.service_radius_km && profile.service_radius_km > 0;
      
      if (hasPostcodes && !hasRadius) {
        setValue('area_type', 'postcodes');
      } else if (hasRadius && !hasPostcodes) {
        setValue('area_type', 'radius');
      } else if (hasPostcodes) {
        setValue('area_type', 'postcodes'); // Default to postcodes if both exist
      }
    }
  }, [profile, setValue]);

  // Auto-save functionality
  useEffect(() => {
    if (!user || !profile) return;

    const subscription = form.watch(async (value, { name }) => {
      // Only auto-save if the form is valid and a field has actually changed
      if (name && form.formState.isValid) {
        try {
          await handleAutoSave(value as ServiceAreaFormData);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, profile, form]);

  // Filter suggestions based on search
  useEffect(() => {
    if (postcodeSearch.length >= 2) {
      const filtered = COMMON_POSTCODES.filter(
        item =>
          item.postcode.includes(postcodeSearch) ||
          item.suburb.toLowerCase().includes(postcodeSearch.toLowerCase()) ||
          item.state.toLowerCase().includes(postcodeSearch.toLowerCase())
      );
      setSuggestions(filtered.slice(0, 8)); // Limit to 8 suggestions
    } else {
      setSuggestions([]);
    }
  }, [postcodeSearch]);

  const handleAutoSave = async (data: ServiceAreaFormData) => {
    if (!user) return;

    try {
      const updateData = {
        service_postcodes: data.area_type === 'postcodes' ? data.service_postcodes || [] : null,
        service_radius_km: data.area_type === 'radius' ? data.service_radius_km : null,
        address: data.area_type === 'radius' ? data.radius_center_address : profile?.address,
        after_hours_enabled: data.emergency_available,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

    } catch (error) {
      console.error('Error auto-saving service area:', error);
    }
  };

  const handleSubmit = async (data: ServiceAreaFormData) => {
    if (!user) return;

    try {
      setSaving(true);

      const updateData = {
        service_postcodes: data.area_type === 'postcodes' ? data.service_postcodes || [] : null,
        service_radius_km: data.area_type === 'radius' ? data.service_radius_km : null,
        address: data.area_type === 'radius' ? data.radius_center_address : profile?.address,
        after_hours_enabled: data.emergency_available,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Service area settings saved successfully',
      });

    } catch (error) {
      console.error('Error saving service area:', error);
      toast({
        title: 'Error',
        description: 'Failed to save service area settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddPostcode = (postcode: string) => {
    if (postcode && /^\d{4}$/.test(postcode)) {
      const currentPostcodes = getValues('service_postcodes') || [];
      if (!currentPostcodes.includes(postcode)) {
        setValue('service_postcodes', [...currentPostcodes, postcode]);
      }
      setPostcodeInput('');
      setPostcodeSearch('');
      setSuggestions([]);
    }
  };

  const handleRemovePostcode = (postcodeToRemove: string) => {
    const currentPostcodes = getValues('service_postcodes') || [];
    setValue('service_postcodes', currentPostcodes.filter(pc => pc !== postcodeToRemove));
  };

  const handlePostcodeInputChange = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4);
    setPostcodeInput(digits);
    setPostcodeSearch(digits);
  };

  const getSuburbForPostcode = (postcode: string) => {
    const match = COMMON_POSTCODES.find(item => item.postcode === postcode);
    return match ? `${match.suburb}, ${match.state}` : '';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading service area settings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Service Area Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Area Configuration
            </CardTitle>
            <CardDescription>
              Define where you provide your trade services
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="area_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>How do you want to define your service area?</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="postcodes" id="postcodes" />
                        <Label htmlFor="postcodes" className="flex items-center space-x-2 cursor-pointer">
                          <MapPin className="w-4 h-4" />
                          <span>Specific Postcodes</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="radius" id="radius" />
                        <Label htmlFor="radius" className="flex items-center space-x-2 cursor-pointer">
                          <Radius className="w-4 h-4" />
                          <span>Distance Radius</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Postcodes Configuration */}
        {watchedValues.area_type === 'postcodes' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Postcodes</CardTitle>
              <CardDescription>
                Add the postcodes where you provide services
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Selected postcodes */}
              {watchedValues.service_postcodes && watchedValues.service_postcodes.length > 0 && (
                <div className="space-y-2">
                  <Label>Selected Postcodes:</Label>
                  <div className="flex flex-wrap gap-2">
                    {watchedValues.service_postcodes.map((postcode) => (
                      <Badge key={postcode} variant="secondary" className="flex items-center gap-1">
                        <span className="font-mono">{postcode}</span>
                        <span className="text-xs text-gray-500">
                          {getSuburbForPostcode(postcode)}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => handleRemovePostcode(postcode)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add postcode input */}
              <div className="space-y-2">
                <Label>Add Postcode:</Label>
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Input
                      placeholder="Search by postcode or suburb"
                      value={postcodeInput}
                      onChange={(e) => handlePostcodeInputChange(e.target.value)}
                      maxLength={4}
                      className="font-mono"
                    />
                    
                    {/* Suggestions dropdown */}
                    {suggestions.length > 0 && (
                      <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                        {suggestions.map((suggestion) => (
                          <button
                            key={suggestion.postcode}
                            type="button"
                            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex justify-between items-center"
                            onClick={() => handleAddPostcode(suggestion.postcode)}
                          >
                            <span className="font-mono font-medium">{suggestion.postcode}</span>
                            <span className="text-sm text-gray-600">
                              {suggestion.suburb}, {suggestion.state}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleAddPostcode(postcodeInput)}
                    disabled={!postcodeInput || postcodeInput.length !== 4}
                    className="px-4"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <FormField
                control={form.control}
                name="service_postcodes"
                render={() => (
                  <FormItem>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>
        )}

        {/* Radius Configuration */}
        {watchedValues.area_type === 'radius' && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Service Radius</CardTitle>
              <CardDescription>
                Set the distance you're willing to travel from your base location
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="service_radius_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Service Radius (kilometers)</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="number"
                          min="1"
                          max="200"
                          placeholder="25"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600">km</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Choose a radius between 1-200 kilometers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="radius_center_address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base Location Address</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your base location (e.g., 123 Main St, Suburb)"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      This is the central point from which your service radius will be measured
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Visual representation */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Service Area Summary</h4>
                  {watchedValues.radius_center_address && watchedValues.service_radius_km && (
                    <span className="text-sm text-blue-600">
                      {watchedValues.service_radius_km}km radius
                    </span>
                  )}
                </div>
                
                {watchedValues.radius_center_address ? (
                  <div className="text-sm text-gray-600">
                    <p><strong>Base:</strong> {watchedValues.radius_center_address}</p>
                    <p><strong>Coverage:</strong> {watchedValues.service_radius_km || 25}km radius</p>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <mapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Enter your base address to see coverage area</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Emergency Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Emergency Services
            </CardTitle>
            <CardDescription>
              Configure your availability for emergency call-outs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="emergency_available"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Emergency Call-outs</FormLabel>
                    <FormDescription>
                      Make yourself available for urgent after-hours work
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-blue-900 mb-2">Service Area Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                <strong>Postcodes:</strong> Best for urban areas or if you service specific regions
              </li>
              <li>
                <strong>Radius:</strong> Ideal for rural areas or if you travel based on distance
              </li>
              <li>Emergency services can help you secure more urgent, higher-paying jobs</li>
              <li>You can update your service area anytime as your business grows</li>
            </ul>
          </CardContent>
        </Card>

        {/* Auto-save status */}
        <div className="flex justify-between items-center text-sm text-muted-foreground">
          <span>Changes are saved automatically</span>
          <Button type="submit" disabled={saving || !form.formState.isDirty}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}