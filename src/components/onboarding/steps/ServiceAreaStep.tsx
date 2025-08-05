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
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { X, MapPin, Radius, Plus } from 'lucide-react';
import { useOnboarding } from '../OnboardingContext';
import ServiceAreaMap from '@/components/maps/ServiceAreaMap';

// Form validation schema
const serviceAreaSchema = z.object({
  area_type: z.enum(['postcodes', 'radius'], {
    required_error: 'Please select how you want to define your service area',
  }),
  service_postcodes: z.array(z.string().regex(/^\d{4}$/, 'Postcode must be 4 digits')).optional(),
  service_radius_km: z.number().min(1).max(200).optional(),
  radius_center_address: z.string().min(1, 'Please enter your base location').optional(),
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
];

export default function ServiceAreaStep() {
  const { state, updateStepData, dispatch } = useOnboarding();
  const [postcodeInput, setPostcodeInput] = useState('');
  const [postcodeSearch, setPostcodeSearch] = useState('');
  const [suggestions, setSuggestions] = useState<typeof COMMON_POSTCODES>([]);

  const form = useForm<ServiceAreaFormData>({
    resolver: zodResolver(serviceAreaSchema),
    defaultValues: {
      area_type: (state.formData.serviceArea.service_postcodes?.length ? 'postcodes' : 
                  state.formData.serviceArea.service_radius_km ? 'radius' : 
                  'postcodes') as 'postcodes' | 'radius',
      service_postcodes: state.formData.serviceArea.service_postcodes || [],
      service_radius_km: state.formData.serviceArea.service_radius_km || 25,
      radius_center_address: state.formData.serviceArea.radius_center_address || '',
    },
    mode: 'onChange',
  });

  const { watch, setValue, getValues, reset } = form;
  const watchedValues = watch();

  // Update form when context data changes
  useEffect(() => {
    const contextData = state.formData.serviceArea;
    if (contextData && Object.keys(contextData).length > 0) {
      reset({
        area_type: contextData.area_type || 'postcodes',
        service_postcodes: contextData.service_postcodes || [],
        service_radius_km: contextData.service_radius_km || undefined,
        radius_center_address: contextData.radius_center_address || '',
      });
    }
  }, [state.formData.serviceArea, reset]);

  // Auto-save form data changes
  useEffect(() => {
    const subscription = form.watch((value) => {
      updateStepData('serviceArea', value);
      
      // Validate current step
      form.trigger().then((isValid) => {
        dispatch({
          type: 'SET_STEP_VALIDATION',
          payload: {
            stepId: 3,
            isValid,
            errors: isValid ? [] : ['Please define your service area'],
          },
        });
      });
    });

    return () => subscription.unsubscribe();
  }, [form, updateStepData, dispatch]);

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

  return (
    <div className="space-y-4">
      <Form {...form}>
        <form className="space-y-4">
          {/* Service Area Type Selection */}
          <div className="space-y-3">
            <h3 className="text-base font-medium text-gray-900">How do you want to define your service area?</h3>
            
            <FormField
              control={form.control}
              name="area_type"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 gap-3"
                    >
                      {/* Compact card buttons side by side */}
                      <label
                        htmlFor="postcodes"
                        className={`relative flex flex-col items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                          field.value === 'postcodes' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <RadioGroupItem value="postcodes" id="postcodes" className="sr-only" />
                        <div className={`p-2 rounded-lg mb-2 ${
                          field.value === 'postcodes' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <MapPin className={`w-5 h-5 ${
                            field.value === 'postcodes' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="font-medium text-sm">Specific Postcodes</div>
                        <div className="text-xs text-gray-600 mt-1">Add postcodes where you provide services</div>
                        {field.value === 'postcodes' && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </label>
                      
                      <label
                        htmlFor="radius"
                        className={`relative flex flex-col items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                          field.value === 'radius' 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300 bg-white'
                        }`}
                      >
                        <RadioGroupItem value="radius" id="radius" className="sr-only" />
                        <div className={`p-2 rounded-lg mb-2 ${
                          field.value === 'radius' ? 'bg-blue-100' : 'bg-gray-100'
                        }`}>
                          <Radius className={`w-5 h-5 ${
                            field.value === 'radius' ? 'text-blue-600' : 'text-gray-600'
                          }`} />
                        </div>
                        <div className="font-medium text-sm">Distance Radius</div>
                        <div className="text-xs text-gray-600 mt-1">Ideal for rural areas or if you travel based on distance</div>
                        {field.value === 'radius' && (
                          <div className="absolute top-2 right-2 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                          </div>
                        )}
                      </label>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Postcodes Configuration */}
          {watchedValues.area_type === 'postcodes' && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Service Postcodes</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  Add the postcodes where you provide services
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Selected postcodes */}
                {watchedValues.service_postcodes && watchedValues.service_postcodes.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Selected Postcodes:</Label>
                    <div className="flex flex-wrap gap-1">
                      {watchedValues.service_postcodes.map((postcode) => {
                        const suburb = getSuburbForPostcode(postcode);
                        return (
                          <Badge
                            key={postcode}
                            variant="secondary"
                            className="pl-2.5 pr-0.5 py-0.5 sm:py-1 flex items-center gap-1 text-xs sm:text-sm h-7 sm:h-8"
                          >
                            <span className="font-mono font-medium">{postcode}</span>
                            {suburb && (
                              <span className="text-xs text-gray-500 hidden sm:inline">
                                {suburb.split(',')[0]}
                              </span>
                            )}
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 hover:bg-transparent"
                              onClick={() => handleRemovePostcode(postcode)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Add postcode input */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Add Postcode:</Label>
                  <div className="flex gap-2">
                    <div className="flex-1 relative">
                      <Input
                        placeholder="e.g. 2000 or Sydney"
                        value={postcodeInput}
                        onChange={(e) => handlePostcodeInputChange(e.target.value)}
                        maxLength={4}
                        className="font-mono text-base"
                        inputMode="numeric"
                      />
                      
                      {/* Suggestions dropdown */}
                      {suggestions.length > 0 && (
                        <div className="absolute top-full left-0 right-0 z-10 bg-white border border-gray-200 rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                          {suggestions.map((suggestion) => (
                            <button
                              key={suggestion.postcode}
                              type="button"
                              className="w-full px-3 py-3 text-left hover:bg-gray-50 flex items-center justify-between border-b border-gray-100 last:border-0"
                              onClick={() => handleAddPostcode(suggestion.postcode)}
                            >
                              <div className="flex items-center gap-3">
                                <span className="font-mono font-semibold text-base">{suggestion.postcode}</span>
                                <span className="text-sm text-gray-600">
                                  {suggestion.suburb}, {suggestion.state}
                                </span>
                              </div>
                              <Plus className="w-4 h-4 text-gray-400" />
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
                      className="px-3 sm:px-4"
                    >
                      <Plus className="w-4 h-4" />
                      <span className="hidden sm:inline ml-1">Add</span>
                    </Button>
                  </div>
                  <p className="text-xs text-gray-600">Enter a 4-digit postcode</p>
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
                <p className="text-sm text-gray-600">
                  Set the distance you're willing to travel from your base location
                </p>
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

                {/* Address input */}
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

                {/* Map visualization */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-900">Service Area Visualization</h4>
                    {watchedValues.radius_center_address && watchedValues.service_radius_km && (
                      <span className="text-sm text-blue-600">
                        {watchedValues.service_radius_km}km radius
                      </span>
                    )}
                  </div>
                  
                  {watchedValues.radius_center_address ? (
                    <ServiceAreaMap 
                      centerAddress={watchedValues.radius_center_address}
                      radiusKm={watchedValues.service_radius_km || 25}
                      className="w-full h-64"
                    />
                  ) : (
                    <div className="bg-white border-2 border-dashed border-gray-300 rounded-lg p-8 text-center h-64 flex items-center justify-center">
                      <div>
                        <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-600 font-medium">Enter your base address</p>
                        <p className="text-sm text-gray-500">
                          Please enter your base location to visualize your service area
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Help section */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Service Area Tips</h4>
            <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
              <li>
                <strong>Postcodes:</strong> Best for urban areas or if you service specific regions
              </li>
              <li>
                <strong>Radius:</strong> Ideal for rural areas or if you travel based on distance
              </li>
              <li>You can update your service area anytime in your account settings</li>
            </ul>
          </div>

          {/* Form validation status */}
          <div className="text-sm text-gray-600">
            <p>Define at least one service area to continue</p>
          </div>
        </form>
      </Form>
    </div>
  );
}