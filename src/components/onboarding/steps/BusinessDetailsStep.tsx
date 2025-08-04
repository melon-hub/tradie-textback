import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useOnboarding } from '../OnboardingContext';

// Form validation schema
const businessDetailsSchema = z.object({
  business_name: z.string().min(2, 'Business name must be at least 2 characters').max(100, 'Business name is too long'),
  abn: z.string().regex(/^\d{11}$/, 'ABN must be exactly 11 digits'),
  license_number: z.string().optional(),
  license_expiry: z.date().optional(),
  insurance_provider: z.string().optional(),
  insurance_expiry: z.date().optional(),
}).refine((data) => {
  // If license number is provided, expiry should be provided
  if (data.license_number && data.license_number.trim() !== '') {
    return data.license_expiry !== undefined;
  }
  return true;
}, {
  message: "License expiry date is required when license number is provided",
  path: ["license_expiry"],
}).refine((data) => {
  // If insurance provider is provided, expiry should be provided
  if (data.insurance_provider && data.insurance_provider.trim() !== '') {
    return data.insurance_expiry !== undefined;
  }
  return true;
}, {
  message: "Insurance expiry date is required when insurance provider is provided",
  path: ["insurance_expiry"],
}).refine((data) => {
  // License expiry should be in the future if provided
  if (data.license_expiry) {
    return data.license_expiry > new Date();
  }
  return true;
}, {
  message: "License expiry date must be in the future",
  path: ["license_expiry"],
}).refine((data) => {
  // Insurance expiry should be in the future if provided
  if (data.insurance_expiry) {
    return data.insurance_expiry > new Date();
  }
  return true;
}, {
  message: "Insurance expiry date must be in the future",
  path: ["insurance_expiry"],
});

type BusinessDetailsFormData = z.infer<typeof businessDetailsSchema>;

export default function BusinessDetailsStep() {
  const { state, updateStepData, dispatch } = useOnboarding();
  
  const form = useForm<BusinessDetailsFormData>({
    resolver: zodResolver(businessDetailsSchema),
    defaultValues: {
      business_name: state.formData.businessDetails.business_name || '',
      abn: state.formData.businessDetails.abn || '',
      license_number: state.formData.businessDetails.license_number || '',
      license_expiry: state.formData.businessDetails.license_expiry 
        ? new Date(state.formData.businessDetails.license_expiry) 
        : undefined,
      insurance_provider: state.formData.businessDetails.insurance_provider || '',
      insurance_expiry: state.formData.businessDetails.insurance_expiry 
        ? new Date(state.formData.businessDetails.insurance_expiry) 
        : undefined,
    },
    mode: 'onChange',
  });

  const { watch, reset } = form;
  const watchedValues = watch();

  // Update form when context data changes
  useEffect(() => {
    const contextData = state.formData.businessDetails;
    if (contextData && Object.keys(contextData).length > 0) {
      reset({
        business_name: contextData.business_name || '',
        abn: contextData.abn || '',
        license_number: contextData.license_number || '',
        license_expiry: contextData.license_expiry 
          ? new Date(contextData.license_expiry) 
          : undefined,
        insurance_provider: contextData.insurance_provider || '',
        insurance_expiry: contextData.insurance_expiry 
          ? new Date(contextData.insurance_expiry) 
          : undefined,
      });
    }
  }, [state.formData.businessDetails, reset]);

  // Auto-save form data changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      // Convert dates to ISO strings for storage
      const dataToSave = {
        ...value,
        license_expiry: value.license_expiry ? value.license_expiry.toISOString() : undefined,
        insurance_expiry: value.insurance_expiry ? value.insurance_expiry.toISOString() : undefined,
      };
      
      updateStepData('businessDetails', dataToSave);
      
      // Validate current step
      form.trigger().then((isValid) => {
        dispatch({
          type: 'SET_STEP_VALIDATION',
          payload: {
            stepId: 2,
            isValid,
            errors: isValid ? [] : ['Please complete all required fields correctly'],
          },
        });
      });
    });

    return () => subscription.unsubscribe();
  }, [form, updateStepData, dispatch]);

  // ABN formatting helper
  const formatABN = (value: string) => {
    // Remove all non-digit characters
    const digits = value.replace(/\D/g, '');
    
    // Limit to 11 digits
    return digits.slice(0, 11);
  };

  const handleABNChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatABN(e.target.value);
    form.setValue('abn', formatted, { shouldValidate: true });
  };

  return (
    <div className="space-y-6 pt-2">
      <Form {...form}>
        <form className="space-y-6">
          {/* Business Information */}
          <div className="space-y-4">
            
            <FormField
              control={form.control}
              name="business_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your business name"
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    This is the name that will appear on your communications
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="abn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Australian Business Number (ABN) *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="12345678901"
                      {...field}
                      onChange={handleABNChange}
                      maxLength={11}
                      className="w-full font-mono"
                    />
                  </FormControl>
                  <FormDescription>
                    Enter your 11-digit ABN (digits only)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Licensing Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Licensing (Optional)</h3>
            <p className="text-sm text-gray-600">
              Add your trade license information if applicable
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., PL12345"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>License Expiry Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Insurance Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">Insurance (Optional)</h3>
            <p className="text-sm text-gray-600">
              Add your public liability insurance information
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="insurance_provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Provider</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., AAMI, Allianz"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="insurance_expiry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Insurance Expiry Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Form validation status */}
          <div className="text-sm text-gray-600 space-y-1">
            <p>* Required fields</p>
            <p className="text-xs">
              License and insurance information is optional but recommended for professional credibility
            </p>
          </div>

          {/* Help section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Need help finding your ABN?</h4>
            <p className="text-sm text-blue-800">
              You can look up your ABN on the{' '}
              <a 
                href="https://abr.business.gov.au/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Australian Business Register
              </a>{' '}
              website.
            </p>
          </div>
        </form>
      </Form>
    </div>
  );
}