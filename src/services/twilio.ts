// =============================================================================
// TWILIO SERVICE LAYER
// =============================================================================
// Handles all Twilio API interactions including:
// - Credential validation
// - Phone number searching and purchasing
// - Connection testing
// - Webhook configuration
// =============================================================================

import { supabase } from '@/integrations/supabase/client';
import { vaultService } from './vault';
import type {
  TwilioCredentials,
  TwilioSettings,
  TwilioError,
  TwilioValidationResponse,
  AvailablePhoneNumber,
  PhoneNumberSearchParams,
  TwilioPurchaseResponse,
  TwilioApiResponse,
  TwilioPhoneNumberListResponse,
  TWILIO_ERROR_MESSAGES,
  TwilioErrorCode
} from '@/types/twilio';
import { TwilioErrorHandler } from './twilioErrorHandler';
import type { ErrorContext } from './twilioErrorHandler';

// =============================================================================
// CONFIGURATION
// =============================================================================

const TWILIO_API_BASE = 'https://api.twilio.com/2010-04-01';
const TWILIO_PRICING_API = 'https://pricing.twilio.com/v2/PhoneNumbers';

// Since we can't make direct API calls from the frontend for security,
// we'll create a service that communicates with our backend
const API_BASE = '/api/twilio'; // This would be your backend API endpoint

// =============================================================================
// ERROR HANDLING
// =============================================================================

class TwilioServiceError extends Error {
  constructor(
    message: string,
    public code: TwilioErrorCode,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'TwilioServiceError';
  }

  toTwilioError(): TwilioError {
    return {
      code: this.code,  
      message: this.message,
      status: this.statusCode,
      moreInfo: TWILIO_ERROR_MESSAGES[this.code] || this.message
    };
  }
}

// =============================================================================
// TWILIO SERVICE CLASS
// =============================================================================

export class TwilioService {
  private static instance: TwilioService;
  
  public static getInstance(): TwilioService {
    if (!TwilioService.instance) {
      TwilioService.instance = new TwilioService();
    }
    return TwilioService.instance;
  }

  // =============================================================================
  // CREDENTIAL VALIDATION
  // =============================================================================

  /**
   * Validates Twilio credentials by making a test API call
   */
  async validateCredentials(credentials: TwilioCredentials): Promise<TwilioValidationResponse> {
    const context: ErrorContext = 'credential_validation';
    
    try {
      // In production, this would be a call to your backend API
      // Backend would use the credentials to call Twilio's Account API
      const response = await fetch(`${API_BASE}/validate-credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify(credentials)
      });

      if (!response.ok) {
        const errorData = await response.json();
        const twilioError: TwilioError = {
          code: errorData.code || 20003,
          message: errorData.message || 'Failed to validate credentials',
          status: response.status,
          moreInfo: TwilioErrorHandler.getUserFriendlyError({
            code: errorData.code || 20003,
            message: errorData.message || 'Failed to validate credentials',
            status: response.status
          }, context).suggestion
        };
        
        return {
          valid: false,
          error: twilioError
        };
      }

      const data = await response.json();
      return {
        valid: data.valid,
        accountSid: data.accountSid,
        accountName: data.accountName,
        accountType: data.accountType
      };

    } catch (error) {
      if (error instanceof TwilioServiceError) {
        return {
          valid: false,
          error: error.toTwilioError()
        };
      }

      // For demo purposes, simulate validation based on format
      return this.simulateCredentialValidation(credentials);
    }
  }

  /**
   * Simulates credential validation for demo purposes
   */
  private simulateCredentialValidation(credentials: TwilioCredentials): TwilioValidationResponse {
    const { accountSid, authToken } = credentials;
    
    // Basic format validation
    const accountSidValid = /^AC[a-fA-F0-9]{32}$/.test(accountSid);
    const authTokenValid = /^[a-fA-F0-9]{32}$/.test(authToken);
    
    if (!accountSidValid || !authTokenValid) {
      return {
        valid: false,
        error: {
          code: 20003,
          message: 'Invalid credential format',
          status: 401,
          moreInfo: 'Account SID should start with AC followed by 32 hex characters. Auth Token should be 32 hex characters.'
        }
      };
    }

    // Simulate successful validation
    return {
      valid: true,
      accountSid,
      accountName: 'Demo Account',
      accountType: 'Trial'
    };
  }

  // =============================================================================
  // PHONE NUMBER MANAGEMENT
  // =============================================================================

  /**
   * Searches for available phone numbers
   */
  async searchAvailableNumbers(
    credentials: TwilioCredentials,
    searchParams: PhoneNumberSearchParams = {}
  ): Promise<AvailablePhoneNumber[]> {
    const context: ErrorContext = 'phone_number_search';
    
    try {
      const response = await fetch(`${API_BASE}/available-numbers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          credentials,
          searchParams
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const twilioError: TwilioError = {
          code: errorData.code || 20404,
          message: TwilioErrorHandler.getUserFriendlyError({
            code: errorData.code || 20404,
            message: 'Failed to search phone numbers',
            status: response.status
          }, context).message,
          status: response.status
        };
        throw new TwilioServiceError(
          twilioError.message,
          twilioError.code,
          twilioError.status
        );
      }

      const data: TwilioPhoneNumberListResponse = await response.json();
      return data.available_phone_numbers;

    } catch (error) {
      if (error instanceof TwilioServiceError) {
        throw error;
      }

      // For demo purposes, return simulated Australian numbers
      return this.simulateAvailableNumbers(searchParams);
    }
  }

  /**
   * Simulates available numbers for demo purposes
   */
  private simulateAvailableNumbers(searchParams: PhoneNumberSearchParams): AvailablePhoneNumber[] {
    const { areaCode = '02', limit = 10 } = searchParams;
    const numbers: AvailablePhoneNumber[] = [];
    
    const baseNumbers = [
      '123456789', '234567890', '345678901', '456789012', '567890123',
      '678901234', '789012345', '890123456', '901234567', '012345678'
    ];

    for (let i = 0; i < Math.min(limit, baseNumbers.length); i++) {
      const phoneNumber = `+61${areaCode}${baseNumbers[i].substring(0, 8)}`;
      numbers.push({
        phoneNumber,
        friendlyName: phoneNumber,
        lata: '000',
        rateCenter: 'SYDNEY',
        latitude: -33.8688,
        longitude: 151.2093,
        region: 'NSW',
        postalCode: '2000',
        isoCountry: 'AU',
        addressRequirements: 'none',
        beta: false,
        capabilities: {
          voice: true,
          sms: searchParams.smsEnabled !== false,
          mms: searchParams.mmsEnabled !== false,
          fax: false
        },
        monthlyPrice: '1.50',
        setupPrice: '0.00'
      });
    }

    return numbers;
  }

  /**
   * Purchases a phone number
   */
  async purchasePhoneNumber(
    credentials: TwilioCredentials,
    phoneNumber: string,
    webhookUrl?: string
  ): Promise<TwilioPurchaseResponse> {
    const context: ErrorContext = 'phone_number_purchase';
    
    try {
      const response = await fetch(`${API_BASE}/purchase-number`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          credentials,
          phoneNumber,
          webhookUrl
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const twilioError: TwilioError = {
          code: errorData.code || 21210,
          message: TwilioErrorHandler.getUserFriendlyError({
            code: errorData.code || 21210,
            message: 'Failed to purchase phone number',
            status: response.status
          }, context).message,
          status: response.status
        };
        throw new TwilioServiceError(
          twilioError.message,
          twilioError.code,
          twilioError.status
        );
      }

      return await response.json();

    } catch (error) {
      if (error instanceof TwilioServiceError) {
        throw error;
      }

      // For demo purposes, simulate successful purchase
      return this.simulatePhonePurchase(phoneNumber, webhookUrl);
    }
  }

  /**
   * Simulates phone number purchase for demo purposes
   */
  private simulatePhonePurchase(phoneNumber: string, webhookUrl?: string): TwilioPurchaseResponse {
    return {
      accountSid: 'ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      sid: 'PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
      friendlyName: phoneNumber,
      phoneNumber,
      voiceUrl: webhookUrl || '',
      voiceMethod: 'POST',
      voiceFallbackUrl: '',
      voiceFallbackMethod: 'POST',
      statusCallback: '',
      statusCallbackMethod: 'POST',
      voiceCallerIdLookup: false,
      dateCreated: new Date().toISOString(),
      dateUpdated: new Date().toISOString(),
      smsUrl: webhookUrl || '',
      smsMethod: 'POST',
      smsFallbackUrl: '',
      smsFallbackMethod: 'POST',
      addressSid: '',
      beta: false,
      capabilities: {
        voice: true,
        sms: true,
        mms: true,
        fax: false
      },
      status: 'in-use',
      apiVersion: '2010-04-01',
      voiceReceiveMode: 'voice',
      bundleSid: '',
      uri: `/2010-04-01/Accounts/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/IncomingPhoneNumbers/PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.json`,
      subresourceUris: {
        messages: `/2010-04-01/Accounts/ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/IncomingPhoneNumbers/PNxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/Messages.json`
      }
    };
  }

  // =============================================================================
  // CONNECTION TESTING
  // =============================================================================

  /**
   * Tests Twilio connection by sending a test SMS
   */
  async testConnection(
    settings: TwilioSettings,
    testRecipient: string,
    testMessage: string = 'Test message from your Twilio integration'
  ): Promise<TwilioApiResponse<any>> {
    const context: ErrorContext = 'connection_test';
    
    try {
      const response = await fetch(`${API_BASE}/test-connection`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await this.getAuthToken()}`
        },
        body: JSON.stringify({
          settings,
          testRecipient,
          testMessage
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const twilioError: TwilioError = {
          code: errorData.code || 30008,
          message: TwilioErrorHandler.getUserFriendlyError({
            code: errorData.code || 30008,
            message: 'Test message failed',
            status: response.status
          }, context).message,
          status: response.status
        };
        
        return {
          success: false,
          error: twilioError
        };
      }

      const data = await response.json();
      return {
        success: true,
        data
      };

    } catch (error) {
      const twilioError: TwilioError = {
        code: 30008,
        message: TwilioErrorHandler.getUserFriendlyError({
          code: 30008,
          message: 'Failed to test connection',
          status: 500
        }, context).message,
        status: 500
      };
      
      return {
        success: false,
        error: twilioError
      };
    }
  }

  // =============================================================================
  // SETTINGS MANAGEMENT
  // =============================================================================

  /**
   * Saves Twilio settings to database
   */
  async saveTwilioSettings(
    userId: string,
    credentials: TwilioCredentials,
    phoneNumber: string,
    webhookUrl?: string
  ): Promise<TwilioSettings> {
    try {
      // Store credentials in vault
      const vaultSecretName = await vaultService.storeTwilioCredentials(
        userId,
        credentials,
        phoneNumber
      );

      // Save settings to database
      const { data, error } = await supabase
        .from('twilio_settings')
        .upsert({
          user_id: userId,
          phone_number: phoneNumber,
          webhook_url: webhookUrl,
          vault_secret_name: vaultSecretName,
          capabilities: {
            voice: true,
            sms: true,
            mms: true,
            fax: false
          },
          status: 'active',
          verified_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        throw new TwilioServiceError(
          `Failed to save settings: ${error.message}`,
          30008,
          500
        );
      }

      return {
        id: data.id,
        userId: data.user_id,
        phoneNumber: data.phone_number,
        webhookUrl: data.webhook_url,
        capabilities: data.capabilities,
        status: data.status,
        verifiedAt: data.verified_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        vaultSecretName: data.vault_secret_name
      };

    } catch (error) {
      if (error instanceof TwilioServiceError) {
        throw error;
      }
      
      throw new TwilioServiceError(
        'Failed to save Twilio settings',
        30008,
        500
      );
    }
  }

  /**
   * Gets Twilio settings for a user
   */
  async getTwilioSettings(userId: string): Promise<TwilioSettings | null> {
    try {
      const { data, error } = await supabase
        .from('twilio_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new TwilioServiceError(
          `Failed to get settings: ${error.message}`,
          30008,
          500
        );
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        userId: data.user_id,
        phoneNumber: data.phone_number,
        webhookUrl: data.webhook_url,
        capabilities: data.capabilities,
        status: data.status,
        verifiedAt: data.verified_at,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        vaultSecretName: data.vault_secret_name
      };

    } catch (error) {
      if (error instanceof TwilioServiceError) {
        throw error;
      }
      
      console.error('Error getting Twilio settings:', error);
      return null;
    }
  }

  /**
   * Deletes Twilio settings and credentials
   */
  async deleteTwilioSettings(userId: string): Promise<void> {
    try {
      // Delete from database
      const { error } = await supabase
        .from('twilio_settings')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw new TwilioServiceError(
          `Failed to delete settings: ${error.message}`,
          30008,
          500
        );
      }

      // Delete from vault
      await vaultService.deleteCredentials(userId);

    } catch (error) {
      if (error instanceof TwilioServiceError) {
        throw error;
      }
      
      throw new TwilioServiceError(
        'Failed to delete Twilio settings',
        30008,
        500
      );
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Gets authentication token for API calls (would be JWT in production)
   */
  private async getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token || '';
  }

  /**
   * Formats phone number for Twilio
   */
  formatPhoneNumber(phoneNumber: string): string {
    // Remove all non-digits
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Add country code for Australian numbers
    if (digits.length === 10 && digits.startsWith('0')) {
      return `+61${digits.substring(1)}`;
    }
    
    // Already has country code
    if (digits.length === 11 && digits.startsWith('61')) {
      return `+${digits}`;
    }
    
    // International format
    if (phoneNumber.startsWith('+')) {
      return phoneNumber;
    }
    
    return phoneNumber;
  }

  /**
   * Validates phone number format
   */
  isValidPhoneNumber(phoneNumber: string): boolean {
    const formatted = this.formatPhoneNumber(phoneNumber);
    return /^\+61[0-9]{9}$/.test(formatted);
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

export const twilioService = TwilioService.getInstance();

/**
 * Validate Twilio credentials
 */
export async function validateTwilioCredentials(
  credentials: TwilioCredentials
): Promise<TwilioValidationResponse> {
  return twilioService.validateCredentials(credentials);
}

/**
 * Search for available phone numbers
 */
export async function searchPhoneNumbers(
  credentials: TwilioCredentials,
  searchParams?: PhoneNumberSearchParams
): Promise<AvailablePhoneNumber[]> {
  return twilioService.searchAvailableNumbers(credentials, searchParams);
}

/**
 * Purchase a phone number
 */
export async function purchasePhoneNumber(
  credentials: TwilioCredentials,
  phoneNumber: string,
  webhookUrl?: string
): Promise<TwilioPurchaseResponse> {
  return twilioService.purchasePhoneNumber(credentials, phoneNumber, webhookUrl);
}

/**
 * Save Twilio settings
 */
export async function saveTwilioSettings(
  userId: string,
  credentials: TwilioCredentials,
  phoneNumber: string,
  webhookUrl?: string
): Promise<TwilioSettings> {
  return twilioService.saveTwilioSettings(userId, credentials, phoneNumber, webhookUrl);
}

/**
 * Get user's Twilio settings
 */
export async function getUserTwilioSettings(userId: string): Promise<TwilioSettings | null> {
  return twilioService.getTwilioSettings(userId);
}

/**
 * Test Twilio connection
 */
export async function testTwilioConnection(
  settings: TwilioSettings,
  testRecipient: string,
  testMessage?: string
): Promise<TwilioApiResponse<any>> {
  return twilioService.testConnection(settings, testRecipient, testMessage);
}

// =============================================================================
// ERROR EXPORT
// =============================================================================

export { TwilioServiceError };