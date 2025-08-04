import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Clock, Briefcase, Zap, X, Plus } from 'lucide-react';
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

// Validation schema for pricing information
const pricingSchema = z.object({
  hourly_rate_min: z.number().min(0, 'Minimum rate must be 0 or more').max(1000, 'Rate seems too high'),
  hourly_rate_max: z.number().min(0, 'Maximum rate must be 0 or more').max(1000, 'Rate seems too high'),
  preferred_job_types: z.array(z.string()).optional(),
  callout_fee: z.number().min(0, 'Callout fee must be 0 or more').max(500, 'Fee seems too high').optional(),
  emergency_rate_multiplier: z.number().min(1, 'Emergency multiplier must be at least 1x').max(5, 'Multiplier seems too high').optional(),
  pricing_notes: z.string().max(500, 'Notes too long').optional(),
}).refine((data) => {
  return data.hourly_rate_max >= data.hourly_rate_min;
}, {
  message: "Maximum rate must be greater than or equal to minimum rate",
  path: ["hourly_rate_max"],
});

type PricingFormData = z.infer<typeof pricingSchema>;

// Common job types for tradies
const JOB_TYPES = [
  'Installation',
  'Repair',
  'Maintenance',
  'Emergency',
  'Inspection',
  'Consultation',
  'Renovation',
  'New Construction',
  'Troubleshooting',
  'Upgrade',
  'Replacement',
  'Service Call',
  'Preventive Maintenance',
  'Warranty Work',
  'Custom Work',
];

export function PricingForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newJobType, setNewJobType] = useState('');

  const form = useForm<PricingFormData>({
    resolver: zodResolver(pricingSchema),
    defaultValues: {
      hourly_rate_min: 0,
      hourly_rate_max: 0,
      preferred_job_types: [],
      callout_fee: 0,
      emergency_rate_multiplier: 1.5,
      pricing_notes: '',
    },
    mode: 'onChange',
  });

  const { watch, setValue, getValues } = form;
  const watchedValues = watch();

  // Load existing pricing data
  useEffect(() => {
    if (profile) {
      // Note: These fields may not exist yet in the database
      // They would need to be added via migration
      const profileData = profile as any; // Temporary until fields are added
      
      form.reset({
        hourly_rate_min: profileData.hourly_rate_min || 0,
        hourly_rate_max: profileData.hourly_rate_max || 0,
        preferred_job_types: profileData.preferred_job_types || [],
        callout_fee: profileData.callout_fee || 0,
        emergency_rate_multiplier: profileData.emergency_rate_multiplier || 1.5,
        pricing_notes: profileData.pricing_notes || '',
      });
    }
  }, [profile, form]);

  // Auto-save functionality
  useEffect(() => {
    if (!user || !profile) return;

    const subscription = form.watch(async (value, { name }) => {
      // Only auto-save if the form is valid and a field has actually changed
      if (name && form.formState.isValid) {
        try {
          await handleAutoSave(value as PricingFormData);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, profile, form]);

  const handleAutoSave = async (data: PricingFormData) => {
    if (!user) return;

    try {
      // Note: These fields would need to be added to the profiles table
      const updateData = {
        hourly_rate_min: data.hourly_rate_min,
        hourly_rate_max: data.hourly_rate_max,
        preferred_job_types: data.preferred_job_types || [],
        callout_fee: data.callout_fee,
        emergency_rate_multiplier: data.emergency_rate_multiplier,
        pricing_notes: data.pricing_notes,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        // If fields don't exist yet, silently fail for now
        console.warn('Pricing fields may not exist in database yet:', error);
        return;
      }

    } catch (error) {
      console.error('Error auto-saving pricing:', error);
    }
  };

  const handleSubmit = async (data: PricingFormData) => {
    if (!user) return;

    try {
      setSaving(true);

      const updateData = {
        hourly_rate_min: data.hourly_rate_min,
        hourly_rate_max: data.hourly_rate_max,
        preferred_job_types: data.preferred_job_types || [],
        callout_fee: data.callout_fee,
        emergency_rate_multiplier: data.emergency_rate_multiplier,
        pricing_notes: data.pricing_notes,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('user_id', user.id);

      if (error) {
        console.error('Pricing update error:', error);
        toast({
          title: 'Notice',
          description: 'Pricing fields are not yet available in the database. Feature coming soon!',
          variant: 'default',
        });
        return;
      }

      toast({
        title: 'Success',
        description: 'Pricing information saved successfully',
      });

    } catch (error) {
      console.error('Error saving pricing:', error);
      toast({
        title: 'Error',
        description: 'Failed to save pricing information',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddJobType = () => {
    if (newJobType.trim()) {
      const currentTypes = getValues('preferred_job_types') || [];
      if (!currentTypes.includes(newJobType.trim())) {
        setValue('preferred_job_types', [...currentTypes, newJobType.trim()]);
      }
      setNewJobType('');
    }
  };

  const handleRemoveJobType = (typeToRemove: string) => {
    const currentTypes = getValues('preferred_job_types') || [];
    setValue('preferred_job_types', currentTypes.filter(type => type !== typeToRemove));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading pricing information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Hourly Rates */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Hourly Rates
            </CardTitle>
            <CardDescription>
              Set your standard hourly rate range for different types of work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hourly_rate_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Hourly Rate</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          max="1000"
                          step="5"
                          placeholder="80"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your minimum rate for standard work
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hourly_rate_max"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Hourly Rate</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          max="1000"
                          step="5"
                          placeholder="150"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your premium rate for complex work
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Rate Preview */}
            {watchedValues.hourly_rate_min > 0 && watchedValues.hourly_rate_max > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-medium text-green-900 mb-2">Rate Range</h4>
                <p className="text-green-800">
                  Your hourly rate range: <strong>{formatCurrency(watchedValues.hourly_rate_min)} - {formatCurrency(watchedValues.hourly_rate_max)}</strong>
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Fees */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Additional Fees
            </CardTitle>
            <CardDescription>
              Configure call-out fees and emergency rates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="callout_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call-out Fee</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          max="500"
                          step="5"
                          placeholder="80"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Fixed fee for traveling to job site
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="emergency_rate_multiplier"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Rate Multiplier</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <X className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="1"
                          max="5"
                          step="0.1"
                          placeholder="1.5"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 1.5)}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Multiplier for after-hours/emergency work
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Fee Preview */}
            {(watchedValues.callout_fee > 0 || watchedValues.emergency_rate_multiplier > 1) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Additional Fees</h4>
                <div className="text-blue-800 space-y-1">
                  {watchedValues.callout_fee > 0 && (
                    <p>Call-out fee: <strong>{formatCurrency(watchedValues.callout_fee)}</strong></p>
                  )}
                  {watchedValues.emergency_rate_multiplier > 1 && (
                    <p>Emergency rate: <strong>{watchedValues.emergency_rate_multiplier}x normal rate</strong></p>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferred Job Types */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Preferred Job Types
            </CardTitle>
            <CardDescription>
              Select the types of work you prefer to take on
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Selected job types */}
            {watchedValues.preferred_job_types && watchedValues.preferred_job_types.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Job Types:</Label>
                <div className="flex flex-wrap gap-2">
                  {watchedValues.preferred_job_types.map((jobType) => (
                    <Badge key={jobType} variant="secondary" className="flex items-center gap-1">
                      {jobType}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveJobType(jobType)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Common job types */}
            <div className="space-y-2">
              <Label>Common Job Types:</Label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {JOB_TYPES
                  .filter(type => !(watchedValues.preferred_job_types || []).includes(type))
                  .map((jobType) => (
                    <Button
                      key={jobType}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const currentTypes = getValues('preferred_job_types') || [];
                        setValue('preferred_job_types', [...currentTypes, jobType]);
                      }}
                      className="text-left justify-start"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      {jobType}
                    </Button>
                  ))}
              </div>
            </div>

            {/* Custom job type input */}
            <div className="space-y-2">
              <Label>Add Custom Job Type:</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter custom job type"
                  value={newJobType}
                  onChange={(e) => setNewJobType(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddJobType();
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddJobType}
                  disabled={!newJobType.trim()}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pricing Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Pricing Notes & Terms</CardTitle>
            <CardDescription>
              Additional information about your pricing and terms
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="pricing_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Pricing Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g., Materials extra, minimum 2-hour charge, payment terms..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    This information will be visible to customers when they inquire about pricing
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Notice about database fields */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <h4 className="font-medium text-amber-900 mb-2">Development Note</h4>
            <p className="text-sm text-amber-800">
              Pricing fields are not yet available in the database schema. 
              This component is ready but requires database migration to add the necessary fields to the profiles table.
            </p>
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