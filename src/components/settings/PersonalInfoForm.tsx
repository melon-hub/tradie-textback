import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { User, Phone, Mail, Briefcase, Clock, X, Plus } from 'lucide-react';
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

// Validation schema matching the onboarding BasicInfoStep
const personalInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
  email: z.string().email('Please enter a valid email address').optional(),
  trade_primary: z.string().min(1, 'Please select your primary trade'),
  trade_secondary: z.array(z.string()).optional(),
  years_experience: z.number().min(0, 'Experience must be 0 or more').max(50, 'Experience cannot exceed 50 years'),
});

type PersonalInfoFormData = z.infer<typeof personalInfoSchema>;

interface PersonalInfoData {
  name: string | null;
  phone: string | null;
  email: string | null;
  trade_primary: string | null;
  trade_secondary: string[] | null;
  years_experience: number | null;
}

// Trade options matching the onboarding system
const TRADE_OPTIONS = [
  { value: 'plumber', label: 'Plumber' },
  { value: 'electrician', label: 'Electrician' },
  { value: 'carpenter', label: 'Carpenter' },
  { value: 'painter', label: 'Painter' },
  { value: 'roofer', label: 'Roofer' },
  { value: 'hvac', label: 'HVAC Technician' },
  { value: 'tiler', label: 'Tiler' },
  { value: 'landscaper', label: 'Landscaper' },
  { value: 'concreter', label: 'Concreter' },
  { value: 'glazier', label: 'Glazier' },
  { value: 'flooring', label: 'Flooring Specialist' },
  { value: 'handyman', label: 'Handyman' },
  { value: 'builder', label: 'Builder' },
  { value: 'demolition', label: 'Demolition' },
  { value: 'other', label: 'Other' },
];

export function PersonalInfoForm() {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [secondaryTradeInput, setSecondaryTradeInput] = useState('');

  const form = useForm<PersonalInfoFormData>({
    resolver: zodResolver(personalInfoSchema),
    defaultValues: {
      name: profile?.name || '',
      phone: profile?.phone || '',
      email: profile?.email || '',
      trade_primary: profile?.trade_primary || '',
      trade_secondary: profile?.trade_secondary || [],
      years_experience: profile?.years_experience || 0,
    },
    mode: 'onChange',
  });

  const { watch, setValue, getValues } = form;
  const watchedValues = watch();

  // Auto-save functionality
  useEffect(() => {
    if (!user || !profile) return;

    const subscription = form.watch(async (value, { name }) => {
      // Only auto-save if the form is valid and a field has actually changed
      if (name && form.formState.isValid) {
        try {
          await handleAutoSave(value as PersonalInfoFormData);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [user, profile, form]);

  const handleAutoSave = async (data: PersonalInfoFormData) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone,
          email: data.email,
          trade_primary: data.trade_primary,
          trade_secondary: data.trade_secondary || [],
          years_experience: data.years_experience,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

    } catch (error) {
      console.error('Error auto-saving personal info:', error);
    }
  };

  const handleSubmit = async (data: PersonalInfoFormData) => {
    if (!user) return;

    try {
      setSaving(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          phone: data.phone,
          email: data.email,
          trade_primary: data.trade_primary,
          trade_secondary: data.trade_secondary || [],
          years_experience: data.years_experience,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Personal information saved successfully',
      });

    } catch (error) {
      console.error('Error saving personal info:', error);
      toast({
        title: 'Error',
        description: 'Failed to save personal information',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddSecondaryTrade = () => {
    if (secondaryTradeInput && secondaryTradeInput !== watchedValues.trade_primary) {
      const currentSecondary = getValues('trade_secondary') || [];
      if (!currentSecondary.includes(secondaryTradeInput)) {
        setValue('trade_secondary', [...currentSecondary, secondaryTradeInput]);
      }
      setSecondaryTradeInput('');
    }
  };

  const handleRemoveSecondaryTrade = (tradeToRemove: string) => {
    const currentSecondary = getValues('trade_secondary') || [];
    setValue('trade_secondary', currentSecondary.filter(trade => trade !== tradeToRemove));
  };

  const getTradeLabel = (value: string) => {
    const trade = TRADE_OPTIONS.find(t => t.value === value);
    return trade ? trade.label : value;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading personal information...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Your basic contact information and details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="0412 345 678"
                          type="tel"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Primary contact number for customers
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="john@example.com"
                          type="email"
                          {...field}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Email for business communications (optional)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Trade Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              Trade & Experience
            </CardTitle>
            <CardDescription>
              Your professional trade skills and experience level
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trade_primary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Trade</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your primary trade" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TRADE_OPTIONS.map((trade) => (
                          <SelectItem key={trade.value} value={trade.value}>
                            {trade.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="years_experience"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Years of Experience</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          max="50"
                          placeholder="5"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                          className="pl-10"
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Total years of professional experience in your trade
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Secondary Trades */}
            <div className="space-y-3">
              <Label>Secondary Trades (Optional)</Label>
              <p className="text-sm text-muted-foreground">
                Add any additional trades or specializations you offer.
              </p>
              
              {/* Selected secondary trades */}
              {watchedValues.trade_secondary && watchedValues.trade_secondary.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {watchedValues.trade_secondary.map((trade) => (
                    <Badge key={trade} variant="secondary" className="flex items-center gap-1">
                      {getTradeLabel(trade)}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveSecondaryTrade(trade)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Add secondary trade */}
              <div className="flex gap-2">
                <Select
                  value={secondaryTradeInput}
                  onValueChange={setSecondaryTradeInput}
                >
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Select additional trade" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRADE_OPTIONS
                      .filter(trade => 
                        trade.value !== watchedValues.trade_primary &&
                        !(watchedValues.trade_secondary || []).includes(trade.value)
                      )
                      .map((trade) => (
                        <SelectItem key={trade.value} value={trade.value}>
                          {trade.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddSecondaryTrade}
                  disabled={!secondaryTradeInput}
                  className="px-4"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>
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