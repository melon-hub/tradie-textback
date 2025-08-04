// =============================================================================
// TWILIO PHONE SELECTOR COMPONENT
// =============================================================================
// Allows users to search, filter, and select available Twilio phone numbers
// Features: area code filtering, capability filtering, pricing display
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Phone, 
  Search, 
  Filter, 
  MessageSquare, 
  Image, 
  Mic, 
  FileText,
  DollarSign,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';

import { searchPhoneNumbers } from '@/services/twilio';
import { SimpleTwilioError } from './TwilioErrorDisplay';
import type {
  TwilioCredentials,
  AvailablePhoneNumber,
  PhoneNumberSearchParams,
  PhoneNumberFilters,
  TwilioError,
  AUSTRALIAN_AREA_CODES
} from '@/types/twilio';

// =============================================================================
// COMPONENT PROPS
// =============================================================================

interface TwilioPhoneSelectorProps {
  credentials: TwilioCredentials;
  onPhoneNumberSelected: (phoneNumber: AvailablePhoneNumber) => Promise<void>;
  onError: (error: TwilioError) => void;
  filters?: Partial<PhoneNumberFilters>;
  autoSearch?: boolean;
  showPricing?: boolean;
  className?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function TwilioPhoneSelector({
  credentials,
  onPhoneNumberSelected,
  onError,
  filters: initialFilters,
  autoSearch = true,
  showPricing = true,
  className = ''
}: TwilioPhoneSelectorProps) {
  // =============================================================================
  // STATE MANAGEMENT
  // =============================================================================

  const [availableNumbers, setAvailableNumbers] = useState<AvailablePhoneNumber[]>([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [selectedNumber, setSelectedNumber] = useState<AvailablePhoneNumber | null>(null);
  const [purchasing, setPurchasing] = useState(false);
  
  const [filters, setFilters] = useState<PhoneNumberFilters>({
    areaCode: '02',
    capabilities: {
      sms: true,
      mms: true,
      voice: true,
      fax: false
    },
    addressRequirement: 'any',
    priceRange: {
      min: 0,
      max: 5
    },
    ...initialFilters
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // =============================================================================
  // SEARCH FUNCTIONALITY
  // =============================================================================

  const searchNumbers = useCallback(async (searchParams?: PhoneNumberSearchParams) => {
    if (!credentials.accountSid || !credentials.authToken) {
      onError({
        code: 20003,
        message: 'Valid Twilio credentials are required',
        status: 400
      });
      return;
    }

    setSearching(true);
    try {
      const params: PhoneNumberSearchParams = {
        areaCode: filters.areaCode || undefined,
        contains: searchQuery || undefined,
        smsEnabled: filters.capabilities.sms,
        mmsEnabled: filters.capabilities.mms,
        voiceEnabled: filters.capabilities.voice,
        faxEnabled: filters.capabilities.fax,
        excludeAllAddressRequired: filters.addressRequirement === 'none',
        limit: 20,
        ...searchParams
      };

      const numbers = await searchPhoneNumbers(credentials, params);
      
      // Filter by price range if specified
      const filteredNumbers = numbers.filter(number => {
        const price = parseFloat(number.monthlyPrice);
        return price >= filters.priceRange.min && price <= filters.priceRange.max;
      });

      setAvailableNumbers(filteredNumbers);
      
      if (filteredNumbers.length === 0) {
        onError({
          code: 20404,
          message: 'No phone numbers found matching your criteria',
          status: 404,
          details: 'Try adjusting your search filters or area code'
        });
      }
    } catch (error: any) {
      console.error('Error searching phone numbers:', error);
      
      // Use enhanced error handling
      const twilioError: TwilioError = {
        code: error.code || 30008,
        message: error.message || 'Failed to search phone numbers',
        status: error.status || 500,
        details: error.details
      };
      
      onError(twilioError);
    } finally {
      setSearching(false);
    }
  }, [credentials, filters, searchQuery, onError]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  useEffect(() => {
    if (autoSearch) {
      searchNumbers();
    }
  }, [autoSearch, searchNumbers]);

  // =============================================================================
  // HANDLERS
  // =============================================================================

  const handleSearch = () => {
    searchNumbers();
  };

  const handleFilterChange = (key: keyof PhoneNumberFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleCapabilityChange = (capability: keyof PhoneNumberFilters['capabilities'], checked: boolean) => {
    setFilters(prev => ({
      ...prev,
      capabilities: {
        ...prev.capabilities,
        [capability]: checked
      }
    }));
  };

  const handleNumberSelect = async (number: AvailablePhoneNumber) => {
    setSelectedNumber(number);
    setPurchasing(true);
    
    try {
      await onPhoneNumberSelected(number);
    } catch (error: any) {
      onError({
        code: error.code || 30008,
        message: error.message || 'Failed to select phone number',
        status: error.status || 500
      });
    } finally {
      setPurchasing(false);
      setSelectedNumber(null);
    }
  };

  // =============================================================================
  // HELPER FUNCTIONS
  // =============================================================================

  const getCapabilityIcons = (capabilities: any) => {
    const icons = [];
    if (capabilities.voice) icons.push(<Mic key="voice" className="h-4 w-4" title="Voice" />);
    if (capabilities.sms) icons.push(<MessageSquare key="sms" className="h-4 w-4" title="SMS" />);
    if (capabilities.mms) icons.push(<Image key="mms" className="h-4 w-4" title="MMS" />);
    if (capabilities.fax) icons.push(<FileText key="fax" className="h-4 w-4" title="Fax" />);
    return icons;
  };

  const formatPrice = (price: string) => {
    return `$${parseFloat(price).toFixed(2)}`;
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Search and Filters Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                Available Phone Numbers
              </CardTitle>
              <CardDescription>
                Choose a phone number for your business communications
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search by number pattern (e.g., 123)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={searching}>
              {searching ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              {/* Area Code Filter */}
              <div className="space-y-2">
                <Label>Area Code</Label>
                <Select
                  value={filters.areaCode}
                  onValueChange={(value) => handleFilterChange('areaCode', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AUSTRALIAN_AREA_CODES.map((area) => (
                      <SelectItem key={area.areaCode} value={area.areaCode}>
                        {area.areaCode} - {area.state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Capabilities Filter */}
              <div className="space-y-2">
                <Label>Required Features</Label>
                <div className="space-y-2">
                  {Object.entries(filters.capabilities).map(([capability, enabled]) => (
                    <div key={capability} className="flex items-center space-x-2">
                      <Checkbox
                        id={capability}
                        checked={enabled}
                        onCheckedChange={(checked) => 
                          handleCapabilityChange(capability as any, checked as boolean)
                        }
                      />
                      <Label htmlFor={capability} className="capitalize text-sm">
                        {capability}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Range Filter */}
              {showPricing && (
                <div className="space-y-2">
                  <Label>Monthly Price Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Min"
                      value={filters.priceRange.min}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...filters.priceRange,
                        min: parseFloat(e.target.value) || 0
                      })}
                      className="w-20"
                    />
                    <Input
                      type="number"
                      placeholder="Max"
                      value={filters.priceRange.max}
                      onChange={(e) => handleFilterChange('priceRange', {
                        ...filters.priceRange,
                        max: parseFloat(e.target.value) || 10
                      })}
                      className="w-20"
                    />
                  </div>
                </div>
              )}

              {/* Address Requirements */}
              <div className="space-y-2">
                <Label>Address Requirements</Label>
                <Select
                  value={filters.addressRequirement}
                  onValueChange={(value) => handleFilterChange('addressRequirement', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any</SelectItem>
                    <SelectItem value="none">None Required</SelectItem>
                    <SelectItem value="local">Local Address</SelectItem>
                    <SelectItem value="foreign">Foreign Address</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Results */}
      <div className="space-y-4">
        {searching && (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-32" />
                      <Skeleton className="h-4 w-48" />
                    </div>
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {!searching && availableNumbers.length === 0 && (
          <Card>
            <CardContent className="p-6 text-center">
              <Phone className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No phone numbers found</p>
              <p className="text-sm text-gray-500 mt-2">
                Try adjusting your search criteria or area code
              </p>
            </CardContent>
          </Card>
        )}

        {!searching && availableNumbers.map((number) => (
          <Card key={number.phoneNumber} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="text-lg font-semibold font-mono">
                      {number.phoneNumber}
                    </h3>
                    <div className="flex gap-1 text-blue-600">
                      {getCapabilityIcons(number.capabilities)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {number.region} - {number.rateCenter}
                    </div>
                    
                    {showPricing && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4" />
                        {formatPrice(number.monthlyPrice)}/month
                      </div>
                    )}
                    
                    {number.beta && (
                      <Badge variant="secondary">Beta</Badge>
                    )}
                  </div>
                  
                  {number.addressRequirements !== 'none' && (
                    <div className="flex items-center gap-1 text-xs text-amber-600">
                      <AlertCircle className="h-3 w-3" />
                      Address verification required
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => handleNumberSelect(number)}
                  disabled={purchasing && selectedNumber?.phoneNumber === number.phoneNumber}
                  className="min-w-[100px]"
                >
                  {purchasing && selectedNumber?.phoneNumber === number.phoneNumber ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Selecting...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Select
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Help Information */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Phone Number Features:</strong>
          <div className="mt-2 space-y-1 text-sm">
            <div className="flex items-center gap-2">
              <Mic className="h-3 w-3" /> Voice: Make and receive calls
            </div>
            <div className="flex items-center gap-2">
              <MessageSquare className="h-3 w-3" /> SMS: Send and receive text messages
            </div>
            <div className="flex items-center gap-2">
              <Image className="h-3 w-3" /> MMS: Send and receive images/media
            </div>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}