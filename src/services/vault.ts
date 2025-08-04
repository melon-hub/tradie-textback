// =============================================================================
// SUPABASE VAULT SERVICE
// =============================================================================
// Secure credential management using Supabase Vault
// Handles storing and retrieving sensitive Twilio credentials
// =============================================================================

import { supabase } from '@/integrations/supabase/client';
import type { TwilioCredentials, TwilioError } from '@/types/twilio';

// =============================================================================
// TYPES
// =============================================================================

interface VaultSecret {
  name: string;
  value: string;
  description?: string;
}

interface VaultCredentials extends TwilioCredentials {
  userId: string;
  phoneNumber?: string;
  createdAt: string;
}

// =============================================================================
// ERROR HANDLING
// =============================================================================

class VaultError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = 'VaultError';
  }
}

// =============================================================================
// VAULT SERVICE CLASS
// =============================================================================

export class VaultService {
  private static instance: VaultService;
  
  public static getInstance(): VaultService {
    if (!VaultService.instance) {
      VaultService.instance = new VaultService();
    }
    return VaultService.instance;
  }

  // =============================================================================
  // CREDENTIAL STORAGE
  // =============================================================================

  /**
   * Stores Twilio credentials securely in Supabase Vault
   */
  async storeTwilioCredentials(
    userId: string,
    credentials: TwilioCredentials,
    phoneNumber?: string
  ): Promise<string> {
    try {
      const secretName = this.generateSecretName(userId);
      
      const vaultCredentials: VaultCredentials = {
        ...credentials,
        userId,
        phoneNumber,
        createdAt: new Date().toISOString()
      };

      // In a real implementation, you would use Supabase's vault.create_secret
      // For now, we'll simulate this by calling a database function
      const { data, error } = await supabase
        .rpc('store_twilio_credentials', {
          target_user_id: userId,
          account_sid: credentials.accountSid,
          auth_token: credentials.authToken,
          phone_number: phoneNumber || null
        });

      if (error) {
        throw new VaultError(
          `Failed to store credentials: ${error.message}`,
          'VAULT_STORE_ERROR',
          500
        );
      }

      return secretName;
    } catch (error) {
      if (error instanceof VaultError) {
        throw error;
      }
      
      throw new VaultError(
        'Failed to store Twilio credentials',
        'VAULT_STORE_UNKNOWN_ERROR',
        500
      );
    }
  }

  /**
   * Retrieves Twilio credentials from Supabase Vault
   */
  async getTwilioCredentials(userId: string): Promise<TwilioCredentials | null> {
    try {
      const secretName = this.generateSecretName(userId);
      
      // In a real implementation, you would use vault.get_secret
      // For now, we'll simulate this by checking if credentials exist
      // This is a placeholder - actual implementation would require backend support
      
      // Check if user has Twilio settings (which indicates stored credentials)
      const { data: settings, error } = await supabase
        .from('twilio_settings')
        .select('vault_secret_name, status')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw new VaultError(
          `Failed to check credential status: ${error.message}`,
          'VAULT_CHECK_ERROR',
          500
        );
      }

      if (!settings?.vault_secret_name) {
        return null;
      }

      // In production, this would retrieve from Supabase Vault
      // For now, we'll return a placeholder that indicates credentials exist
      // The actual retrieval would happen on the backend for security
      throw new VaultError(
        'Credential retrieval must be done server-side for security',
        'VAULT_CLIENT_RETRIEVAL_ERROR',
        403
      );

    } catch (error) {
      if (error instanceof VaultError) {
        throw error;
      }
      
      throw new VaultError(
        'Failed to retrieve Twilio credentials',
        'VAULT_RETRIEVE_UNKNOWN_ERROR',
        500
      );
    }
  }

  /**
   * Checks if credentials exist for a user
   */
  async hasCredentials(userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('twilio_settings')
        .select('id, vault_secret_name')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw new VaultError(
          `Failed to check credentials: ${error.message}`,
          'VAULT_CHECK_ERROR',
          500
        );
      }

      return !!data?.vault_secret_name;
    } catch (error) {
      if (error instanceof VaultError) {
        throw error;
      }
      
      console.error('Error checking credentials:', error);
      return false;
    }
  }

  /**
   * Updates stored credentials
   */
  async updateTwilioCredentials(
    userId: string,
    credentials: TwilioCredentials,
    phoneNumber?: string
  ): Promise<void> {
    try {
      // First, delete existing credentials
      await this.deleteCredentials(userId);
      
      // Then store new ones
      await this.storeTwilioCredentials(userId, credentials, phoneNumber);
    } catch (error) {
      if (error instanceof VaultError) {
        throw error;
      }
      
      throw new VaultError(
        'Failed to update Twilio credentials',
        'VAULT_UPDATE_ERROR',
        500
      );
    }
  }

  /**
   * Deletes stored credentials
   */
  async deleteCredentials(userId: string): Promise<void> {
    try {
      // Delete from twilio_settings table
      const { error } = await supabase
        .from('twilio_settings')
        .delete()
        .eq('user_id', userId);

      if (error) {
        throw new VaultError(
          `Failed to delete settings: ${error.message}`,
          'VAULT_DELETE_ERROR',
          500
        );
      }

      // In production, would also delete from Supabase Vault
      // vault.delete_secret(secretName);
    } catch (error) {
      if (error instanceof VaultError) {
        throw error;
      }
      
      throw new VaultError(
        'Failed to delete credentials',
        'VAULT_DELETE_UNKNOWN_ERROR',
        500
      );
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Generates a consistent secret name for a user
   */
  private generateSecretName(userId: string): string {
    return `twilio_credentials_${userId.replace(/-/g, '_')}`;
  }

  /**
   * Validates secret name format
   */
  private isValidSecretName(name: string): boolean {
    // Supabase Vault secret names must be valid identifiers
    const pattern = /^[a-zA-Z_][a-zA-Z0-9_]*$/;
    return pattern.test(name) && name.length <= 64;
  }

  /**
   * Converts VaultError to TwilioError format
   */
  private toTwilioError(error: VaultError): TwilioError {
    return {
      code: this.getErrorCode(error.code),
      message: error.message,
      status: error.statusCode,
      details: error.code
    };
  }

  /**
   * Maps vault error codes to Twilio-style error codes
   */
  private getErrorCode(vaultErrorCode: string): number {
    switch (vaultErrorCode) {
      case 'VAULT_STORE_ERROR':
        return 50001;
      case 'VAULT_RETRIEVE_ERROR':
        return 50002;
      case 'VAULT_DELETE_ERROR':
        return 50003;
      case 'VAULT_CHECK_ERROR':
        return 50004;
      case 'VAULT_CLIENT_RETRIEVAL_ERROR':
        return 50005;
      default:
        return 50000;
    }
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Get singleton instance of VaultService
 */
export const vaultService = VaultService.getInstance();

/**
 * Store Twilio credentials for a user
 */
export async function storeTwilioCredentials(
  userId: string,
  credentials: TwilioCredentials,
  phoneNumber?: string
): Promise<string> {
  return vaultService.storeTwilioCredentials(userId, credentials, phoneNumber);
}

/**
 * Check if user has stored Twilio credentials
 */
export async function hasStoredCredentials(userId: string): Promise<boolean> {
  return vaultService.hasCredentials(userId);
}

/**
 * Update stored Twilio credentials
 */
export async function updateTwilioCredentials(
  userId: string,
  credentials: TwilioCredentials,
  phoneNumber?: string
): Promise<void> {
  return vaultService.updateTwilioCredentials(userId, credentials, phoneNumber);
}

/**
 * Delete stored Twilio credentials
 */
export async function deleteStoredCredentials(userId: string): Promise<void> {
  return vaultService.deleteCredentials(userId);
}

// =============================================================================
// ERROR EXPORT
// =============================================================================

export { VaultError };