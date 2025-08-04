import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useOnboarding } from '../OnboardingContext';
import { BasicInfoData } from '@/types/onboarding';

// Form validation schema
const basicInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').regex(/^[\d\s\-\+\(\)]+$/, 'Invalid phone number format'),
  email: z.string().email('Please enter a valid email address'),
  trade_primary: z.string().min(1, 'Please select your primary trade'),
  trade_secondary: z.array(z.string()).optional(),
  years_experience: z.number().min(0, 'Experience must be 0 or more').max(50, 'Experience cannot exceed 50 years'),
});

type BasicInfoFormData = z.infer<typeof basicInfoSchema>;

// Common trades list - in a real app, this would come from the database
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

export default function BasicInfoStep() {
  const { state, updateStepData, dispatch } = useOnboarding();
  const [secondaryTradeInput, setSecondaryTradeInput] = useState('');

  const form = useForm<BasicInfoFormData>({
    resolver: zodResolver(basicInfoSchema),
    defaultValues: {
      name: state.formData.basicInfo.name || '',
      phone: state.formData.basicInfo.phone || '',
      email: state.formData.basicInfo.email || '',
      trade_primary: state.formData.basicInfo.trade_primary || '',
      trade_secondary: state.formData.basicInfo.trade_secondary || [],
      years_experience: state.formData.basicInfo.years_experience || 0,
    },
    mode: 'onChange',
  });

  const { watch, setValue, getValues } = form;
  const watchedValues = watch();

  // Auto-save form data changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateStepData('basicInfo', value);
      
      // Validate current step
      form.trigger().then((isValid) => {
        dispatch({
          type: 'SET_STEP_VALIDATION',
          payload: {
            stepId: 1,
            isValid,
            errors: isValid ? [] : ['Please complete all required fields'],
          },
        });
      });
    });

    return () => subscription.unsubscribe();
  }, [form, updateStepData, dispatch]);

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

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
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
                      <FormLabel>Phone Number *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="0412 345 678"
                          type="tel"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="john@example.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>

          {/* Trade Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Trade Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="trade_primary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Trade *</FormLabel>
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
                    <FormLabel>Years of Experience *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        placeholder="5"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Secondary Trades */}
            <div className="space-y-3">
              <FormLabel>Secondary Trades (Optional)</FormLabel>
              <p className="text-sm text-gray-600">
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
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Form validation status */}
          <div className="text-sm text-gray-600">
            <p>* Required fields</p>
          </div>
        </form>
      </Form>
    </div>
  );
}