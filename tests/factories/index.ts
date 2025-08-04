/**
 * Test Data Factories
 * 
 * Factory functions for creating consistent test data across all test files.
 * Supports the enhanced schema with onboarding system and new profile fields.
 */

import type { Tables } from '@/types/database.types';

// Type aliases for better readability
type Profile = Tables<'profiles'>;
type TradeType = Tables<'trade_types'>;
type ServiceLocation = Tables<'service_locations'>;
type SmsTemplate = Tables<'tenant_sms_templates'>;
type TwilioSettings = Tables<'twilio_settings'>;

/**
 * Enhanced Profile Factory
 * Creates profile objects with all new onboarding fields
 */
export interface ProfileFactoryOptions {
  id?: string;
  user_id?: string;
  name?: string;
  phone?: string;
  user_type?: string;
  is_admin?: boolean;
  address?: string;
  
  // New onboarding fields
  trade_primary?: string | null;
  trade_secondary?: string[] | null;
  business_name?: string | null;
  abn?: string | null;
  service_postcodes?: string[] | null;
  service_radius_km?: number | null;
  license_number?: string | null;
  license_expiry?: string | null;
  insurance_provider?: string | null;
  insurance_expiry?: string | null;
  years_experience?: number | null;
  specializations?: any;
  languages_spoken?: any;
  onboarding_completed?: boolean | null;
  onboarding_step?: number | null;
  callback_window_minutes?: number | null;
  after_hours_enabled?: boolean | null;
  timezone?: string | null;
}

export function createMockProfile(options: ProfileFactoryOptions = {}): Profile {
  const defaults: Profile = {
    id: options.id || 'profile-1',
    user_id: options.user_id || 'test-user-id',
    name: options.name || 'Test Tradie',
    phone: options.phone || '+61412345678',
    user_type: options.user_type || 'tradie',
    is_admin: options.is_admin || false,
    address: options.address || '123 Test Street, Sydney NSW 2000',
    role: null,
    
    // Enhanced onboarding fields
    trade_primary: options.trade_primary || 'plumber',
    trade_secondary: options.trade_secondary || ['electrician'],
    business_name: options.business_name || 'Test Plumbing Services',
    abn: options.abn || '12345678901',
    service_postcodes: options.service_postcodes || ['2000', '2001', '2002'],
    service_radius_km: options.service_radius_km || 25,
    license_number: options.license_number || 'PL12345',
    license_expiry: options.license_expiry || '2025-12-31',
    insurance_provider: options.insurance_provider || 'Test Insurance Co',
    insurance_expiry: options.insurance_expiry || '2025-12-31',
    years_experience: options.years_experience || 10,
    specializations: options.specializations || ['emergency', 'commercial'],
    languages_spoken: options.languages_spoken || ['English', 'Spanish'],
    onboarding_completed: options.onboarding_completed !== undefined ? options.onboarding_completed : true,
    onboarding_step: options.onboarding_step || 6,
    callback_window_minutes: options.callback_window_minutes || 30,
    after_hours_enabled: options.after_hours_enabled || false,
    timezone: options.timezone || 'Australia/Sydney',
    
    // Timestamps
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return { ...defaults, ...options };
}

/**
 * Profile variants for different test scenarios
 */
export function createIncompleteProfile(overrides: ProfileFactoryOptions = {}): Profile {
  return createMockProfile({
    onboarding_completed: false,
    onboarding_step: 3,
    trade_primary: null,
    business_name: null,
    service_postcodes: null,
    ...overrides,
  });
}

export function createClientProfile(overrides: ProfileFactoryOptions = {}): Profile {
  return createMockProfile({
    user_type: 'client',
    trade_primary: null,
    trade_secondary: null,
    business_name: null,
    abn: null,
    license_number: null,
    insurance_provider: null,
    specializations: null,
    onboarding_completed: true,
    onboarding_step: 2,
    ...overrides,
  });
}

export function createAdminProfile(overrides: ProfileFactoryOptions = {}): Profile {
  return createMockProfile({
    is_admin: true,
    user_type: 'admin',
    ...overrides,
  });
}

/**
 * Trade Types Factory
 */
export interface TradeTypeFactoryOptions {
  code?: string;
  label?: string;
  category?: string | null;
  typical_urgency?: string | null;
  icon_name?: string | null;
}

export function createMockTradeType(options: TradeTypeFactoryOptions = {}): TradeType {
  return {
    code: options.code || 'plumber',
    label: options.label || 'Plumber',
    category: options.category || 'construction',
    typical_urgency: options.typical_urgency || 'high',
    icon_name: options.icon_name || 'wrench',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export const mockTradeTypes: TradeType[] = [
  createMockTradeType({ code: 'plumber', label: 'Plumber', category: 'construction', typical_urgency: 'high', icon_name: 'wrench' }),
  createMockTradeType({ code: 'electrician', label: 'Electrician', category: 'construction', typical_urgency: 'high', icon_name: 'zap' }),
  createMockTradeType({ code: 'carpenter', label: 'Carpenter', category: 'construction', typical_urgency: 'medium', icon_name: 'hammer' }),
  createMockTradeType({ code: 'hvac', label: 'HVAC Technician', category: 'maintenance', typical_urgency: 'medium', icon_name: 'thermometer' }),
  createMockTradeType({ code: 'handyman', label: 'Handyman', category: 'maintenance', typical_urgency: 'low', icon_name: 'tool' }),
  createMockTradeType({ code: 'landscaper', label: 'Landscaper', category: 'outdoor', typical_urgency: 'low', icon_name: 'tree' }),
  createMockTradeType({ code: 'locksmith', label: 'Locksmith', category: 'security', typical_urgency: 'high', icon_name: 'lock' }),
  createMockTradeType({ code: 'painter', label: 'Painter', category: 'finishing', typical_urgency: 'low', icon_name: 'brush' }),
  createMockTradeType({ code: 'tiler', label: 'Tiler', category: 'finishing', typical_urgency: 'medium', icon_name: 'square' }),
  createMockTradeType({ code: 'roofer', label: 'Roofer', category: 'construction', typical_urgency: 'medium', icon_name: 'home' }),
];

/**
 * Service Locations Factory
 */
export interface ServiceLocationFactoryOptions {
  id?: string;
  user_id?: string | null;
  postcode?: string;
  suburb?: string | null;
  state?: string | null;
  travel_time?: number | null;
  surcharge?: number | null;
  is_active?: boolean | null;
}

export function createMockServiceLocation(options: ServiceLocationFactoryOptions = {}): ServiceLocation {
  return {
    id: options.id || crypto.randomUUID(),
    user_id: options.user_id || 'test-user-id',
    postcode: options.postcode || '2000',
    suburb: options.suburb || 'Sydney',
    state: options.state || 'NSW',
    travel_time: options.travel_time || 15,
    surcharge: options.surcharge || 0,
    is_active: options.is_active !== undefined ? options.is_active : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export const mockServiceLocations: ServiceLocation[] = [
  createMockServiceLocation({ postcode: '2000', suburb: 'Sydney', state: 'NSW', travel_time: 15, surcharge: 0 }),
  createMockServiceLocation({ postcode: '2001', suburb: 'Sydney', state: 'NSW', travel_time: 20, surcharge: 10 }),
  createMockServiceLocation({ postcode: '2002', suburb: 'Sydney', state: 'NSW', travel_time: 25, surcharge: 15 }),
  createMockServiceLocation({ postcode: '2010', suburb: 'Surry Hills', state: 'NSW', travel_time: 18, surcharge: 5 }),
  createMockServiceLocation({ postcode: '2016', suburb: 'Redfern', state: 'NSW', travel_time: 22, surcharge: 0 }),
];

/**
 * SMS Templates Factory
 */
export interface SmsTemplateFactoryOptions {
  id?: string;
  user_id?: string | null;
  template_type?: string;
  content?: string;
  variables?: string[] | null;
  is_active?: boolean | null;
}

export function createMockSmsTemplate(options: SmsTemplateFactoryOptions = {}): SmsTemplate {
  return {
    id: options.id || crypto.randomUUID(),
    user_id: options.user_id || 'test-user-id',
    template_type: options.template_type || 'missed_call',
    content: options.content || 'Hi {customer_name}, thanks for calling {business_name}! We missed your call but will get back to you within {callback_window} minutes.',
    variables: options.variables || ['customer_name', 'business_name', 'callback_window'],
    is_active: options.is_active !== undefined ? options.is_active : true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export const mockSmsTemplates: SmsTemplate[] = [
  createMockSmsTemplate({
    template_type: 'missed_call',
    content: 'Hi {customer_name}, thanks for calling {business_name}! We missed your call but will get back to you within {callback_window} minutes. For urgent matters, please call again.',
    variables: ['customer_name', 'business_name', 'callback_window']
  }),
  createMockSmsTemplate({
    template_type: 'after_hours',
    content: 'Thanks for contacting {business_name}! We\'re currently closed but will respond first thing in the morning. For emergencies, please call {emergency_number}.',
    variables: ['business_name', 'emergency_number']
  }),
  createMockSmsTemplate({
    template_type: 'job_confirmation',
    content: 'Hi {customer_name}, we\'ve received your request for {job_type} at {location}. We\'ll be in touch shortly to discuss details and scheduling.',
    variables: ['customer_name', 'job_type', 'location']
  }),
  createMockSmsTemplate({
    template_type: 'appointment_reminder',
    content: 'Reminder: {business_name} will be arriving at {location} on {appointment_date} at {appointment_time} for your {job_type} job.',
    variables: ['business_name', 'location', 'appointment_date', 'appointment_time', 'job_type']
  }),
  createMockSmsTemplate({
    template_type: 'follow_up',
    content: 'Hi {customer_name}, thanks for choosing {business_name}! How did we do? We\'d love your feedback and would appreciate a review if you were happy with our service.',
    variables: ['customer_name', 'business_name']
  }),
  createMockSmsTemplate({
    template_type: 'quote_ready',
    content: 'Hi {customer_name}, your quote for {job_type} is ready! Total: ${quote_amount}. Valid for 30 days. Reply YES to accept or call us to discuss.',
    variables: ['customer_name', 'job_type', 'quote_amount']
  }),
  createMockSmsTemplate({
    template_type: 'invoice_sent',
    content: 'Hi {customer_name}, your invoice for ${invoice_amount} has been sent. Payment due in {payment_terms} days. Thank you for choosing {business_name}!',
    variables: ['customer_name', 'invoice_amount', 'payment_terms', 'business_name']
  }),
];

/**
 * Twilio Settings Factory (Note: No actual credentials since not set up yet)
 */
export interface TwilioSettingsFactoryOptions {
  id?: string;
  user_id?: string | null;
  phone_number?: string;
  webhook_url?: string | null;
  capabilities?: any;
  status?: string | null;
  verified_at?: string | null;
  vault_secret_name?: string | null;
}

export function createMockTwilioSettings(options: TwilioSettingsFactoryOptions = {}): TwilioSettings {
  return {
    id: options.id || crypto.randomUUID(),
    user_id: options.user_id || 'test-user-id',
    phone_number: options.phone_number || '+61412345678',
    webhook_url: options.webhook_url || 'https://test.example.com/webhook',
    capabilities: options.capabilities || { sms: true, voice: true },
    status: options.status || 'pending',
    verified_at: options.verified_at || null,
    vault_secret_name: options.vault_secret_name || 'twilio_credentials_test_user_id',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

/**
 * Onboarding State Helpers
 */
export interface OnboardingState {
  step: number;
  completed: boolean;
  profileData: Partial<Profile>;
}

export function getOnboardingState(step: number): OnboardingState {
  const states: Record<number, OnboardingState> = {
    0: {
      step: 0,
      completed: false,
      profileData: {
        name: null,
        phone: null,
        trade_primary: null,
        business_name: null,
        service_postcodes: null,
        onboarding_step: 0,
        onboarding_completed: false,
      },
    },
    1: {
      step: 1,
      completed: false,
      profileData: {
        name: 'Test Tradie',
        phone: '+61412345678',
        onboarding_step: 1,
        onboarding_completed: false,
      },
    },
    2: {
      step: 2,
      completed: false,
      profileData: {
        name: 'Test Tradie',
        phone: '+61412345678',
        trade_primary: 'plumber',
        onboarding_step: 2,
        onboarding_completed: false,
      },
    },
    3: {
      step: 3,
      completed: false,
      profileData: {
        name: 'Test Tradie',
        phone: '+61412345678',
        trade_primary: 'plumber',
        business_name: 'Test Plumbing Services',
        abn: '12345678901',
        onboarding_step: 3,
        onboarding_completed: false,
      },
    },
    4: {
      step: 4,
      completed: false,
      profileData: {
        name: 'Test Tradie',
        phone: '+61412345678',
        trade_primary: 'plumber',
        business_name: 'Test Plumbing Services',
        abn: '12345678901',
        service_postcodes: ['2000', '2001'],
        service_radius_km: 25,
        onboarding_step: 4,
        onboarding_completed: false,
      },
    },
    5: {
      step: 5,
      completed: false,
      profileData: {
        name: 'Test Tradie',
        phone: '+61412345678',
        trade_primary: 'plumber',
        business_name: 'Test Plumbing Services',
        abn: '12345678901',
        service_postcodes: ['2000', '2001'],
        service_radius_km: 25,
        license_number: 'PL12345',
        insurance_provider: 'Test Insurance Co',
        onboarding_step: 5,
        onboarding_completed: false,
      },
    },
    6: {
      step: 6,
      completed: true,
      profileData: {
        name: 'Test Tradie',
        phone: '+61412345678',
        trade_primary: 'plumber',
        business_name: 'Test Plumbing Services',
        abn: '12345678901',
        service_postcodes: ['2000', '2001'],
        service_radius_km: 25,
        license_number: 'PL12345',
        insurance_provider: 'Test Insurance Co',
        years_experience: 10,
        specializations: ['emergency', 'commercial'],
        callback_window_minutes: 30,
        after_hours_enabled: false,
        timezone: 'Australia/Sydney',
        onboarding_step: 6,
        onboarding_completed: true,
      },
    },
  };

  return states[step] || states[6]; // Default to completed state
}

/**
 * Job Factory (existing, but ensuring compatibility)
 */
export interface JobFactoryOptions {
  id?: string;
  client_id?: string | null;
  customer_name?: string;
  phone?: string;
  job_type?: string;
  location?: string;
  urgency?: string;
  status?: string;
  estimated_value?: number | null;
  description?: string | null;
  preferred_time?: string | null;
  last_contact?: string | null;
  sms_blocked?: boolean | null;
}

export function createMockJob(options: JobFactoryOptions = {}) {
  return {
    id: options.id || 'job-1',
    client_id: options.client_id || 'test-user-id',
    customer_name: options.customer_name || 'John Doe',
    phone: options.phone || '+61412345678',
    job_type: options.job_type || 'Plumbing',
    location: options.location || 'Sydney NSW',
    urgency: options.urgency || 'high',
    status: options.status || 'new',
    estimated_value: options.estimated_value || 250,
    description: options.description || 'Leaking tap repair',
    preferred_time: options.preferred_time || 'Morning',
    last_contact: options.last_contact || new Date().toISOString(),
    sms_blocked: options.sms_blocked || false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}