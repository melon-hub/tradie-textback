// =============================================================================
// TWILIO ERROR HANDLER
// =============================================================================
// Comprehensive error handling with user-friendly messages
// Provides context-aware error messages and recovery suggestions
// =============================================================================

import type { TwilioError, TwilioErrorCode, TWILIO_ERROR_MESSAGES } from '@/types/twilio';

// =============================================================================
// ERROR CONTEXT TYPES
// =============================================================================

export type ErrorContext = 
  | 'credential_validation'
  | 'phone_number_search'
  | 'phone_number_purchase'
  | 'message_sending'
  | 'webhook_configuration'
  | 'settings_save'
  | 'connection_test';

// =============================================================================
// USER-FRIENDLY ERROR MESSAGES
// =============================================================================

interface UserFriendlyError {
  title: string;
  message: string;
  suggestion: string;
  severity: 'error' | 'warning' | 'info';
  canRetry: boolean;
  helpUrl?: string;
}

const CONTEXT_ERROR_MESSAGES: Record<ErrorContext, Partial<Record<TwilioErrorCode, UserFriendlyError>>> = {
  credential_validation: {
    20003: {
      title: 'Invalid Twilio Credentials',
      message: 'The Account SID or Auth Token you entered is incorrect.',
      suggestion: 'Please check your Twilio Console and make sure you\'ve copied the credentials exactly. Account SID should start with "AC" and be 34 characters long.',
      severity: 'error',
      canRetry: true,
      helpUrl: 'https://console.twilio.com/'
    },
    20404: {
      title: 'Account Not Found',
      message: 'We couldn\'t find a Twilio account with those credentials.',
      suggestion: 'Verify that your Account SID is correct and that your Twilio account is active.',
      severity: 'error',
      canRetry: true,
      helpUrl: 'https://console.twilio.com/'
    }
  },
  
  phone_number_search: {
    21201: {
      title: 'Region Not Authorized',
      message: 'Your Twilio account isn\'t authorized to purchase phone numbers in this region.',
      suggestion: 'Contact Twilio support to enable phone number purchases for Australia, or try a different area code.',
      severity: 'error',
      canRetry: false,
      helpUrl: 'https://support.twilio.com/'
    },
    20404: {
      title: 'No Numbers Available',
      message: 'No phone numbers are available matching your search criteria.',
      suggestion: 'Try searching with different area codes or remove some filters to see more options.',
      severity: 'warning',
      canRetry: true
    }
  },

  phone_number_purchase: {
    21210: {
      title: 'Number Unavailable',
      message: 'This phone number is no longer available for purchase.',
      suggestion: 'Please select a different phone number from the available options.',
      severity: 'warning',
      canRetry: true
    },
    21201: {
      title: 'Purchase Not Authorized',
      message: 'Your account isn\'t authorized to purchase phone numbers.',
      suggestion: 'Verify your account with Twilio or contact their support team to enable phone number purchases.',
      severity: 'error',
      canRetry: false,
      helpUrl: 'https://support.twilio.com/'
    }
  },

  message_sending: {
    21211: {
      title: 'Invalid Phone Number',
      message: 'The recipient phone number format is invalid.',
      suggestion: 'Make sure the phone number includes the country code (e.g., +61412345678 for Australia).',
      severity: 'error',
      canRetry: true
    },
    21601: {
      title: 'SMS Not Supported',
      message: 'This phone number cannot receive SMS messages.',
      suggestion: 'Verify the recipient number is a mobile phone capable of receiving text messages.',
      severity: 'error',
      canRetry: false
    },
    30001: {
      title: 'Message Queue Full',
      message: 'Too many messages are being sent right now.',
      suggestion: 'Please wait a few minutes and try sending the message again.',
      severity: 'warning',
      canRetry: true
    },
    30004: {
      title: 'Message Blocked',
      message: 'The message was blocked by the carrier.',
      suggestion: 'Try rephrasing your message to avoid promotional language, or contact the recipient through another method.',
      severity: 'warning',
      canRetry: true
    }
  },

  webhook_configuration: {
    20404: {
      title: 'Webhook Configuration Error',
      message: 'Unable to configure the webhook URL for your phone number.',
      suggestion: 'You may need to manually configure the webhook URL in your Twilio Console.',
      severity: 'warning',
      canRetry: true,
      helpUrl: 'https://console.twilio.com/us1/develop/phone-numbers/manage/incoming'
    }
  },

  settings_save: {
    30008: {
      title: 'Settings Save Failed',
      message: 'We couldn\'t save your Twilio configuration.',
      suggestion: 'Please check your internet connection and try again. If the problem persists, contact support.',
      severity: 'error',
      canRetry: true
    }
  },

  connection_test: {
    21211: {
      title: 'Test Number Invalid',
      message: 'The test phone number format is invalid.',
      suggestion: 'Enter a valid phone number with country code (e.g., +61412345678).',
      severity: 'error',
      canRetry: true
    },
    30008: {
      title: 'Connection Test Failed',
      message: 'Unable to send the test message.',
      suggestion: 'Check your Twilio configuration and make sure your account has sufficient balance.',
      severity: 'error',
      canRetry: true
    }
  }
};

// =============================================================================
// GENERIC ERROR MESSAGES
// =============================================================================

const GENERIC_ERROR_MESSAGES: Record<TwilioErrorCode, UserFriendlyError> = {
  20003: {
    title: 'Authentication Failed',
    message: 'Your Twilio credentials are invalid or have expired.',
    suggestion: 'Please check your Account SID and Auth Token in the Twilio Console.',
    severity: 'error',
    canRetry: true,
    helpUrl: 'https://console.twilio.com/'
  },
  20404: {
    title: 'Resource Not Found',
    message: 'The requested resource could not be found.',
    suggestion: 'Please verify your configuration and try again.',
    severity: 'error',
    canRetry: true
  },
  21201: {
    title: 'Not Authorized',
    message: 'Your account is not authorized for this operation.',
    suggestion: 'Contact Twilio support to enable this feature for your account.',
    severity: 'error',
    canRetry: false,
    helpUrl: 'https://support.twilio.com/'
  },
  21210: {
    title: 'Forbidden Resource',
    message: 'Access to this resource is forbidden.',
    suggestion: 'Check your account permissions or contact Twilio support.',
    severity: 'error',
    canRetry: false
  },
  21211: {
    title: 'Invalid Phone Number',
    message: 'The phone number format is invalid.',
    suggestion: 'Use international format with country code (e.g., +61412345678).',
    severity: 'error',
    canRetry: true
  },
  21212: {
    title: 'Invalid Sender Number',
    message: 'The sender phone number is invalid.',
    suggestion: 'Make sure you\'re using a valid Twilio phone number.',
    severity: 'error',
    canRetry: true
  },
  21213: {
    title: 'Invalid Message',
    message: 'The message content is invalid.',
    suggestion: 'Check that your message isn\'t empty and doesn\'t exceed the character limit.',
    severity: 'error',
    canRetry: true
  },
  21214: {
    title: 'Unreachable Number',
    message: 'The recipient phone number cannot be reached.',
    suggestion: 'Verify the phone number is correct and active.',
    severity: 'warning',
    canRetry: true
  },
  21215: {
    title: 'Call Not Authorized',
    message: 'Your account is not authorized to call this number.',
    suggestion: 'Check your account permissions for international calling.',
    severity: 'error',
    canRetry: false
  },
  21216: {
    title: 'SMS Not Authorized',
    message: 'Your account is not authorized to send SMS to this number.',
    suggestion: 'Verify your account permissions for SMS messaging.',
    severity: 'error',
    canRetry: false
  },
  21601: {
    title: 'SMS Not Capable',
    message: 'This phone number cannot send or receive SMS.',
    suggestion: 'Use a different phone number that supports SMS.',
    severity: 'error',
    canRetry: false
  },
  21602: {
    title: 'Message Required',
    message: 'Message body or media is required.',
    suggestion: 'Include message text or media in your SMS.',
    severity: 'error',
    canRetry: true
  },
  21610: {
    title: 'Unsubscribed Recipient',
    message: 'The recipient has unsubscribed from messages.',
    suggestion: 'Respect the recipient\'s choice and use alternative communication methods.',
    severity: 'warning',
    canRetry: false
  },
  21611: {
    title: 'Regional Restriction',
    message: 'Your phone number is not enabled for this region.',
    suggestion: 'Contact Twilio support to enable regional messaging.',
    severity: 'error',
    canRetry: false,
    helpUrl: 'https://support.twilio.com/'
  },
  30001: {
    title: 'Queue Overflow',
    message: 'Too many messages in queue.',
    suggestion: 'Wait a few minutes before sending more messages.',
    severity: 'warning',
    canRetry: true
  },
  30002: {
    title: 'Account Suspended',
    message: 'Your Twilio account has been suspended.',
    suggestion: 'Contact Twilio support to resolve account issues.',
    severity: 'error',
    canRetry: false,
    helpUrl: 'https://support.twilio.com/'
  },
  30003: {
    title: 'Unreachable Handset',
    message: 'The recipient\'s phone cannot be reached.',
    suggestion: 'The phone may be off or out of coverage. Try again later.',
    severity: 'warning',
    canRetry: true
  },
  30004: {
    title: 'Message Blocked',
    message: 'The message was blocked by carrier filters.',
    suggestion: 'Avoid promotional language and try rephrasing your message.',
    severity: 'warning',
    canRetry: true
  },
  30005: {
    title: 'Unknown Handset',
    message: 'The recipient phone number is unknown.',
    suggestion: 'Verify the phone number is correct and active.',
    severity: 'warning',
    canRetry: true
  },
  30006: {
    title: 'Landline Not Supported',
    message: 'Cannot send SMS to landline numbers.',
    suggestion: 'Use a mobile phone number for SMS messaging.',
    severity: 'error',
    canRetry: false
  },
  30007: {
    title: 'Carrier Violation',
    message: 'Message violated carrier policies.',
    suggestion: 'Review your message content and ensure it complies with carrier guidelines.',
    severity: 'warning',
    canRetry: true
  },
  30008: {
    title: 'Unknown Error',
    message: 'An unexpected error occurred.',
    suggestion: 'Please try again. If the problem persists, contact support.',
    severity: 'error',
    canRetry: true
  }
};

// =============================================================================
// ERROR HANDLER CLASS
// =============================================================================

export class TwilioErrorHandler {
  /**
   * Converts a Twilio error to a user-friendly format
   */
  static getUserFriendlyError(
    error: TwilioError, 
    context: ErrorContext
  ): UserFriendlyError {
    // Try context-specific error first
    const contextError = CONTEXT_ERROR_MESSAGES[context]?.[error.code];
    if (contextError) {
      return contextError;
    }

    // Fall back to generic error
    const genericError = GENERIC_ERROR_MESSAGES[error.code];
    if (genericError) {
      return genericError;
    }

    // Ultimate fallback
    return {
      title: 'Unexpected Error',
      message: error.message || 'An unexpected error occurred while communicating with Twilio.',
      suggestion: 'Please try again. If the problem persists, contact support with error code: ' + error.code,
      severity: 'error',
      canRetry: true
    };
  }

  /**
   * Creates a formatted error message for display
   */
  static formatErrorMessage(error: TwilioError, context: ErrorContext): string {
    const friendlyError = this.getUserFriendlyError(error, context);
    return `${friendlyError.title}: ${friendlyError.message} ${friendlyError.suggestion}`;
  }

  /**
   * Determines if an error is recoverable by user action
   */
  static isRecoverableError(error: TwilioError, context: ErrorContext): boolean {
    const friendlyError = this.getUserFriendlyError(error, context);
    return friendlyError.canRetry;
  }

  /**
   * Gets suggested recovery actions for an error
   */
  static getRecoveryActions(error: TwilioError, context: ErrorContext): string[] {
    const friendlyError = this.getUserFriendlyError(error, context);
    const actions: string[] = [friendlyError.suggestion];

    // Add context-specific recovery actions
    switch (context) {
      case 'credential_validation':
        if (error.code === 20003) {
          actions.push('Double-check that you copied the credentials exactly from your Twilio Console');
          actions.push('Make sure there are no extra spaces or characters');
        }
        break;
        
      case 'phone_number_search':
        actions.push('Try searching with a different area code');
        actions.push('Remove some search filters to see more options');
        break;
        
      case 'message_sending':
        if (error.code === 21211) {
          actions.push('Include the country code (+61 for Australia)');
          actions.push('Remove any spaces, dashes, or brackets from the number');
        }
        break;
        
      case 'connection_test':
        actions.push('Check your Twilio account balance');
        actions.push('Verify your phone number is SMS-capable');
        break;
    }

    return actions.filter((action, index, arr) => arr.indexOf(action) === index); // Remove duplicates
  }

  /**
   * Creates a detailed error report for debugging
   */
  static createErrorReport(error: TwilioError, context: ErrorContext): {
    friendlyError: UserFriendlyError;
    originalError: TwilioError;
    context: ErrorContext;
    timestamp: string;
    recoveryActions: string[];
  } {
    return {
      friendlyError: this.getUserFriendlyError(error, context),
      originalError: error,
      context,
      timestamp: new Date().toISOString(),
      recoveryActions: this.getRecoveryActions(error, context)
    };
  }

  /**
   * Determines if an error should trigger a toast notification
   */
  static shouldShowToast(error: TwilioError, context: ErrorContext): boolean {
    const friendlyError = this.getUserFriendlyError(error, context);
    return friendlyError.severity === 'error' || friendlyError.severity === 'warning';
  }

  /**
   * Gets the appropriate toast variant for an error
   */
  static getToastVariant(error: TwilioError, context: ErrorContext): 'default' | 'destructive' {
    const friendlyError = this.getUserFriendlyError(error, context);
    return friendlyError.severity === 'error' ? 'destructive' : 'default';
  }
}

// =============================================================================
// CONVENIENCE FUNCTIONS
// =============================================================================

/**
 * Quick function to get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: TwilioError, context: ErrorContext): string {
  return TwilioErrorHandler.formatErrorMessage(error, context);
}

/**
 * Quick function to check if error is recoverable
 */
export function isRecoverableError(error: TwilioError, context: ErrorContext): boolean {
  return TwilioErrorHandler.isRecoverableError(error, context);
}

/**
 * Quick function to get recovery suggestions
 */
export function getErrorRecoveryActions(error: TwilioError, context: ErrorContext): string[] {
  return TwilioErrorHandler.getRecoveryActions(error, context);
}

// =============================================================================
// EXPORT
// =============================================================================

export { TwilioErrorHandler as default };