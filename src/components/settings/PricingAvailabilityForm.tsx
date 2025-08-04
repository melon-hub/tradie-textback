import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DollarSign, Clock, Calendar, Zap, Info } from 'lucide-react';
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
import { Alert, AlertDescription } from '@/components/ui/alert';

// Validation schema for pricing and availability
const pricingAvailabilitySchema = z.object({
  hourly_rate_min: z.number().min(0, 'Minimum rate must be 0 or higher').max(1000, 'Rate seems too high'),
  hourly_rate_max: z.number().min(0, 'Maximum rate must be 0 or higher').max(1000, 'Rate seems too high'),
  call_out_fee: z.number().min(0, 'Call out fee must be 0 or higher').optional(),
  emergency_rate_multiplier: z.number().min(1, 'Emergency multiplier must be at least 1x').max(5, 'Emergency multiplier seems too high').default(1.5),
  travel_rate_per_km: z.number().min(0, 'Travel rate must be 0 or higher').optional(),
  minimum_job_value: z.number().min(0, 'Minimum job value must be 0 or higher').optional(),
  payment_terms: z.string().optional(),
  availability_notes: z.string().optional(),
  weekend_available: z.boolean().default(false),
  evening_available: z.boolean().default(false),
  emergency_available: z.boolean().default(false),
  public_holiday_available: z.boolean().default(false),
  advance_booking_days: z.number().min(0).max(365).default(14),
}).refine((data) => data.hourly_rate_max >= data.hourly_rate_min, {
  message: "Maximum rate must be greater than or equal to minimum rate",
  path: ["hourly_rate_max"],
});

type PricingAvailabilityFormData = z.infer<typeof pricingAvailabilitySchema>;

const PAYMENT_TERMS_OPTIONS = [
  { value: 'immediate', label: 'Payment on completion' },
  { value: '7_days', label: '7 days' },
  { value: '14_days', label: '14 days' },
  { value: '30_days', label: '30 days' },
  { value: 'deposit_balance', label: 'Deposit + balance on completion' },
  { value: 'custom', label: 'Custom terms' },
];

export function PricingAvailabilityForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const form = useForm<PricingAvailabilityFormData>({
    resolver: zodResolver(pricingAvailabilitySchema),
    defaultValues: {
      hourly_rate_min: profile?.hourly_rate_min || 0,
      hourly_rate_max: profile?.hourly_rate_max || 0,
      call_out_fee: profile?.call_out_fee || 0,
      emergency_rate_multiplier: profile?.emergency_rate_multiplier || 1.5,
      travel_rate_per_km: profile?.travel_rate_per_km || 0,
      minimum_job_value: profile?.minimum_job_value || 0,
      payment_terms: profile?.payment_terms || 'immediate',
      availability_notes: profile?.availability_notes || '',
      weekend_available: profile?.weekend_available || false,
      evening_available: profile?.evening_available || false,
      emergency_available: profile?.emergency_available || false,
      public_holiday_available: profile?.public_holiday_available || false,
      advance_booking_days: profile?.advance_booking_days || 14,
    },
    mode: 'onChange',
  });

  const { watch } = form;
  const watchedValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (!user || !profile) return;

    const subscription = form.watch(async (value, { name }) => {
      // Only auto-save if the form is valid and a field has actually changed
      if (name && form.formState.isValid) {
        try {
          await handleAutoSave(value as PricingAvailabilityFormData);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, profile, form]);

  const handleAutoSave = async (data: PricingAvailabilityFormData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          hourly_rate_min: data.hourly_rate_min,
          hourly_rate_max: data.hourly_rate_max,
          call_out_fee: data.call_out_fee,
          emergency_rate_multiplier: data.emergency_rate_multiplier,
          travel_rate_per_km: data.travel_rate_per_km,
          minimum_job_value: data.minimum_job_value,
          payment_terms: data.payment_terms,
          availability_notes: data.availability_notes,
          weekend_available: data.weekend_available,
          evening_available: data.evening_available,
          emergency_available: data.emergency_available,
          public_holiday_available: data.public_holiday_available,
          advance_booking_days: data.advance_booking_days,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

    } catch (error) {
      console.error('Error auto-saving pricing:', error);
    }
  };

  const handleSubmit = async (data: PricingAvailabilityFormData) => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          hourly_rate_min: data.hourly_rate_min,
          hourly_rate_max: data.hourly_rate_max,
          call_out_fee: data.call_out_fee,
          emergency_rate_multiplier: data.emergency_rate_multiplier,
          travel_rate_per_km: data.travel_rate_per_km,
          minimum_job_value: data.minimum_job_value,
          payment_terms: data.payment_terms,
          availability_notes: data.availability_notes,
          weekend_available: data.weekend_available,
          evening_available: data.evening_available,
          emergency_available: data.emergency_available,
          public_holiday_available: data.public_holiday_available,
          advance_booking_days: data.advance_booking_days,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Pricing and availability settings saved successfully',
      });

    } catch (error) {
      console.error('Error saving pricing:', error);
      toast({
        title: 'Error',
        description: 'Failed to save pricing and availability settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const calculateEmergencyRate = (baseRate: number) => {
    return Math.round(baseRate * watchedValues.emergency_rate_multiplier);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading pricing and availability settings...</div>
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
              Set your standard hourly rates. You can provide a range to account for job complexity.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="hourly_rate_min"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="80"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your standard minimum rate for simpler jobs
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
                    <FormLabel>Maximum Hourly Rate ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="120"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Your rate for complex or specialized work
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Rate Range Display */}
            {watchedValues.hourly_rate_min > 0 && watchedValues.hourly_rate_max > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Your Rate Range</h4>
                <p className="text-blue-800">
                  ${watchedValues.hourly_rate_min}/hr - ${watchedValues.hourly_rate_max}/hr
                  {watchedValues.hourly_rate_min === watchedValues.hourly_rate_max 
                    ? ' (Fixed rate)' 
                    : ` (${Math.round(((watchedValues.hourly_rate_max - watchedValues.hourly_rate_min) / watchedValues.hourly_rate_min) * 100)}% range)`
                  }
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Additional Charges */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Charges</CardTitle>
            <CardDescription>
              Optional fees and charges for specific circumstances
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="call_out_fee"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Call Out Fee ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Fixed fee for coming to the job site (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="travel_rate_per_km"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel Rate ($/km)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="0.1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Rate per kilometer for travel charges (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="minimum_job_value"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum Job Value ($)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          step="1"
                          placeholder="0"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Minimum charge for any job (optional)
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
                      <Select 
                        onValueChange={(value) => field.onChange(parseFloat(value))} 
                        value={field.value?.toString()}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select multiplier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1x (Standard rate)</SelectItem>
                          <SelectItem value="1.25">1.25x (+25%)</SelectItem>
                          <SelectItem value="1.5">1.5x (+50%)</SelectItem>
                          <SelectItem value="1.75">1.75x (+75%)</SelectItem>
                          <SelectItem value="2">2x (Double rate)</SelectItem>
                          <SelectItem value="2.5">2.5x (+150%)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Rate multiplier for emergency call-outs
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Emergency Rate Display */}
            {watchedValues.emergency_rate_multiplier > 1 && watchedValues.hourly_rate_min > 0 && (
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  <strong>Emergency Rates:</strong> ${calculateEmergencyRate(watchedValues.hourly_rate_min)}/hr - ${calculateEmergencyRate(watchedValues.hourly_rate_max)}/hr
                  {watchedValues.call_out_fee > 0 && ` (plus $${watchedValues.call_out_fee} call out fee)`}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Payment Terms */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Terms</CardTitle>
            <CardDescription>
              Define your payment expectations and terms
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="payment_terms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Standard Payment Terms</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment terms" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {PAYMENT_TERMS_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Availability */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Availability Settings
            </CardTitle>
            <CardDescription>
              Configure when you're available for different types of work
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Extended Hours Availability */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Extended Hours</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="weekend_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Weekend Work</FormLabel>
                        <FormDescription>
                          Available for jobs on weekends
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

                <FormField
                  control={form.control}
                  name="evening_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Evening Work</FormLabel>
                        <FormDescription>
                          Available for jobs in the evening
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

                <FormField
                  control={form.control}
                  name="public_holiday_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Public Holidays</FormLabel>
                        <FormDescription>
                          Available for work on public holidays
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

                <FormField
                  control={form.control}
                  name="emergency_available"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Emergency Call-outs</FormLabel>
                        <FormDescription>
                          Available for urgent after-hours work
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
              </div>
            </div>

            {/* Booking Settings */}
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Booking Settings</h4>
              <FormField
                control={form.control}
                name="advance_booking_days"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Advance Booking Period</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-3">
                        <Input
                          type="number"
                          min="0"
                          max="365"
                          placeholder="14"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                        <span className="text-sm text-gray-600">days</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      How many days in advance customers can book appointments
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Availability Notes */}
            <FormField
              control={form.control}
              name="availability_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Availability Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional information about your availability, special conditions, or preferences..."
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional notes about your availability that customers should know
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Pricing Summary */}
        {(watchedValues.hourly_rate_min > 0 || watchedValues.hourly_rate_max > 0) && (
          <Card className="bg-green-50 border-green-200">
            <CardHeader>
              <CardTitle className="text-green-900">Pricing Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-green-800">
                <p><strong>Standard Rate:</strong> ${watchedValues.hourly_rate_min}/hr - ${watchedValues.hourly_rate_max}/hr</p>
                {watchedValues.emergency_rate_multiplier > 1 && (
                  <p><strong>Emergency Rate:</strong> ${calculateEmergencyRate(watchedValues.hourly_rate_min)}/hr - ${calculateEmergencyRate(watchedValues.hourly_rate_max)}/hr</p>
                )}
                {watchedValues.call_out_fee > 0 && (
                  <p><strong>Call Out Fee:</strong> ${watchedValues.call_out_fee}</p>
                )}
                {watchedValues.minimum_job_value > 0 && (
                  <p><strong>Minimum Job Value:</strong> ${watchedValues.minimum_job_value}</p>
                )}
                {watchedValues.travel_rate_per_km > 0 && (
                  <p><strong>Travel Rate:</strong> ${watchedValues.travel_rate_per_km}/km</p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Pricing Tips:</strong> Research local market rates for your trade. Consider offering package deals for multiple jobs. 
            Emergency rates help compensate for inconvenient timing and urgent response requirements.
          </AlertDescription>
        </Alert>

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