// =============================================================================
// TWILIO INTEGRATION TYPES
// =============================================================================
// Comprehensive type definitions for Twilio API integration
// Including phone numbers, credentials, capabilities, and error handling
// =============================================================================

// =============================================================================
// CORE TWILIO TYPES
// =============================================================================

export interface TwilioCredentials {
  accountSid: string;
  authToken: string;
}

export interface TwilioSettings {
  id: string;
  userId: string;
  phoneNumber: string;
  webhookUrl?: string;
  capabilities: TwilioPhoneCapabilities;
  status: TwilioStatus;
  verifiedAt?: string;
  createdAt: string;
  updatedAt: string;
  vaultSecretName?: string;
}

export type TwilioStatus = 'pending' | 'active' | 'failed' | 'provisioning';

// =============================================================================
// PHONE NUMBER TYPES
// =============================================================================

export interface TwilioPhoneNumber {
  phoneNumber: string;
  friendlyName: string;
  lata: string;
  rateCenter: string;
  latitude: number;
  longitude: number;
  region: string;
  postalCode: string;
  isoCountry: string;
  addressRequirements: AddressRequirement;
  beta: boolean;
  capabilities: TwilioPhoneCapabilities;
}

export interface TwilioPhoneCapabilities {
  voice: boolean;
  sms: boolean;
  mms: boolean;
  fax: boolean;
}

export type AddressRequirement = 'none' | 'any' | 'local' | 'foreign';

export interface AvailablePhoneNumber extends TwilioPhoneNumber {
  monthlyPrice: string;
  setupPrice?: string;
}

// =============================================================================
// SEARCH AND FILTER TYPES
// =============================================================================

export interface PhoneNumberSearchParams {
  areaCode?: string;
  contains?: string;
  smsEnabled?: boolean;
  mmsEnabled?: boolean;
  voiceEnabled?: boolean;
  excludeAllAddressRequired?: boolean;
  excludeLocalAddressRequired?: boolean;
  excludeForeignAddressRequired?: boolean;
  beta?: boolean;
  nearNumber?: string;
  nearLatLong?: string;
  distance?: number;
  inPostalCode?: string;
  inRegion?: string;
  inRateCenter?: string;
  inLata?: string;
  inLocality?: string;
  faxEnabled?: boolean;
  limit?: number;
}

export interface PhoneNumberFilters {
  areaCode: string;
  capabilities: {
    sms: boolean;
    mms: boolean;
    voice: boolean;
    fax: boolean;
  };
  addressRequirement: AddressRequirement | 'any';
  priceRange: {
    min: number;
    max: number;
  };
}

// =============================================================================
// API RESPONSE TYPES
// =============================================================================

export interface TwilioApiResponse<T> {
  success: boolean;
  data?: T;
  error?: TwilioError;
}

export interface TwilioPhoneNumberListResponse {
  available_phone_numbers: AvailablePhoneNumber[];
  uri: string;
}

export interface TwilioPurchaseResponse {
  accountSid: string;
  sid: string;
  friendlyName: string;
  phoneNumber: string;
  voiceUrl: string;
  voiceMethod: string;
  voiceFallbackUrl: string;
  voiceFallbackMethod: string;
  statusCallback: string;
  statusCallbackMethod: string;
  voiceCallerIdLookup: boolean;
  dateCreated: string;
  dateUpdated: string;
  smsUrl: string;
  smsMethod: string;
  smsFallbackUrl: string;
  smsFallbackMethod: string;
  addressSid: string;
  beta: boolean;
  capabilities: TwilioPhoneCapabilities;
  status: string;
  apiVersion: string;
  voiceReceiveMode: string;
  bundleSid: string;
  uri: string;
  subresourceUris: {
    messages: string;
  };
}

export interface TwilioValidationResponse {
  valid: boolean;
  accountSid?: string;
  accountName?: string;
  accountType?: string;
  error?: TwilioError;
}

// =============================================================================
// ERROR HANDLING TYPES
// =============================================================================

export interface TwilioError {
  code: number;
  message: string;
  moreInfo?: string;
  status: number;
  details?: string;
}

export type TwilioErrorCode = 
  | 20003  // Authentication Error
  | 20404  // The requested resource was not found
  | 21201  // No international authorization
  | 21210  // Forbidden number
  | 21211  // Invalid 'To' Phone Number
  | 21212  // Invalid 'From' Phone Number
  | 21213  // Invalid Body
  | 21214  // 'To' phone number cannot be reached
  | 21215  // Account not authorized to call this number
  | 21216  // Account not authorized to send to this number
  | 21601  // Phone number is not a valid SMS-capable inbound phone number
  | 21602  // Message body or media url required
  | 21610  // Attempt to send to unsubscribed recipient
  | 21611  // This message was sent from a phone number that is not enabled for your region
  | 30001  // Queue overflow
  | 30002  // Account suspended
  | 30003  // Unreachable destination handset
  | 30004  // Message blocked
  | 30005  // Unknown destination handset
  | 30006  // Landline or unreachable carrier
  | 30007  // Carrier violation
  | 30008  // Unknown error;

export const TWILIO_ERROR_MESSAGES: Record<TwilioErrorCode, string> = {
  20003: 'Invalid Twilio credentials. Please check your Account SID and Auth Token.',
  20404: 'The requested resource was not found. Please verify your account settings.',
  21201: 'Your account is not authorized for international calls.',
  21210: 'This phone number is forbidden.',
  21211: 'Invalid recipient phone number format.',
  21212: 'Invalid sender phone number format.',
  21213: 'Message content is invalid.',
  21214: 'Recipient phone number cannot be reached.',
  21215: 'Your account is not authorized to call this number.',
  21216: 'Your account is not authorized to send messages to this number.',
  21601: 'This phone number is not SMS-capable.',
  21602: 'Message body or media is required.',
  21610: 'Cannot send to unsubscribed recipient.',
  21611: 'This phone number is not enabled for your region.',
  30001: 'Message queue is full. Please try again later.',
  30002: 'Your Twilio account has been suspended.',
  30003: 'Recipient phone cannot be reached.',
  30004: 'Message was blocked by carrier.',
  30005: 'Unknown recipient phone number.',
  30006: 'Cannot send to landline or unreachable carrier.',
  30007: 'Message violated carrier policies.',
  30008: 'An unknown error occurred. Please try again.'
};

// =============================================================================
// WEBHOOK TYPES
// =============================================================================

export interface TwilioWebhookConfig {
  webhookUrl: string;
  webhookMethod: 'GET' | 'POST';
  statusCallback?: string;
  statusCallbackMethod?: 'GET' | 'POST';
}

export interface TwilioInboundMessage {
  MessageSid: string;
  AccountSid: string;
  MessagingServiceSid?: string;
  From: string;
  To: string;
  Body: string;
  NumMedia: string;
  MediaUrl0?: string;
  MediaContentType0?: string;
  SmsStatus: string;
  SmsMessageSid: string;
  NumSegments: string;
  ReferralNumMedia?: string;
  FromCity?: string;
  FromState?: string;
  FromZip?: string;
  FromCountry?: string;
  ToCity?: string;
  ToState?: string;
  ToZip?: string;
  ToCountry?: string;
}

// =============================================================================
// COMPONENT PROPS TYPES
// =============================================================================

export interface TwilioSetupProps {
  onCredentialsSubmit?: (credentials: TwilioCredentials) => Promise<void>;
  onPhoneNumberSelected?: (phoneNumber: AvailablePhoneNumber) => Promise<void>;
  onSetupComplete?: (settings: TwilioSettings) => void;
  onError?: (error: TwilioError) => void;
  allowSkip?: boolean;
  initialCredentials?: Partial<TwilioCredentials>;
}

export interface TwilioPhoneSelectorProps {
  credentials: TwilioCredentials;
  onPhoneNumberSelected: (phoneNumber: AvailablePhoneNumber) => Promise<void>;
  onError: (error: TwilioError) => void;
  filters?: Partial<PhoneNumberFilters>;
  autoSearch?: boolean;
  showPricing?: boolean;
}

export interface TwilioConnectionTestProps {
  settings: TwilioSettings;
  onTestComplete: (success: boolean, error?: TwilioError) => void;
  testMessage?: string;
  testRecipient?: string;
}

// =============================================================================
// STATE MANAGEMENT TYPES
// =============================================================================

export interface TwilioSetupState {
  step: TwilioSetupStep;
  credentials?: TwilioCredentials;
  validationResult?: TwilioValidationResponse;
  availableNumbers: AvailablePhoneNumber[];
  selectedNumber?: AvailablePhoneNumber;
  settings?: TwilioSettings;
  error?: TwilioError;
  loading: boolean;
  filters: PhoneNumberFilters;
}

export type TwilioSetupStep = 
  | 'credentials'
  | 'validation'
  | 'phone-selection'
  | 'configuration'
  | 'testing'
  | 'complete';

export type TwilioSetupAction =
  | { type: 'SET_STEP'; payload: TwilioSetupStep }
  | { type: 'SET_CREDENTIALS'; payload: TwilioCredentials }
  | { type: 'SET_VALIDATION_RESULT'; payload: TwilioValidationResponse }
  | { type: 'SET_AVAILABLE_NUMBERS'; payload: AvailablePhoneNumber[] }
  | { type: 'SET_SELECTED_NUMBER'; payload: AvailablePhoneNumber }
  | { type: 'SET_SETTINGS'; payload: TwilioSettings }
  | { type: 'SET_ERROR'; payload: TwilioError | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'UPDATE_FILTERS'; payload: Partial<PhoneNumberFilters> }
  | { type: 'RESET' };

// =============================================================================
// UTILITY TYPES
// =============================================================================

export interface CountryCode {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
}

export interface AreaCodeInfo {
  areaCode: string;
  state: string;
  cities: string[];
  timezone: string;
}

// Australian area codes for phone number selection
export const AUSTRALIAN_AREA_CODES: AreaCodeInfo[] = [
  { areaCode: '02', state: 'NSW/ACT', cities: ['Sydney', 'Newcastle', 'Canberra'], timezone: 'Australia/Sydney' },
  { areaCode: '03', state: 'VIC/TAS', cities: ['Melbourne', 'Geelong', 'Hobart'], timezone: 'Australia/Melbourne' },
  { areaCode: '07', state: 'QLD', cities: ['Brisbane', 'Gold Coast', 'Cairns'], timezone: 'Australia/Brisbane' },
  { areaCode: '08', state: 'SA/WA/NT', cities: ['Adelaide', 'Perth', 'Darwin'], timezone: 'Australia/Adelaide' },
  { areaCode: '04', state: 'Mobile', cities: ['National Mobile'], timezone: 'Australia/Sydney' }
];

// =============================================================================
// VALIDATION SCHEMAS
// =============================================================================

export interface TwilioCredentialValidation {
  accountSid: {
    isValid: boolean;
    error?: string;
  };
  authToken: {
    isValid: boolean;
    error?: string;
  };
}

export interface PhoneNumberValidation {
  isValid: boolean;
  formattedNumber?: string;
  country?: string;
  lineType?: 'mobile' | 'landline' | 'toll-free' | 'premium';
  carrier?: string;
  error?: string;
}

// =============================================================================
// EXPORT TYPES FOR EASY IMPORTING
// =============================================================================

export type {
  TwilioCredentials,
  TwilioSettings,
  TwilioPhoneNumber,
  AvailablePhoneNumber,
  TwilioError,
  TwilioSetupState,
  TwilioSetupAction,
  PhoneNumberSearchParams,
  PhoneNumberFilters
};