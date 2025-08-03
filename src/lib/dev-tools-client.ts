import { createClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Use the existing supabase client instance
export const devToolsClient = supabase;

interface CreateTestClientResponse {
  userId: string;
  phone: string;
  error?: string;
}

interface CreateTestJobResponse {
  jobId: string;
  error?: string;
}

interface ResetTestDataResponse {
  success: boolean;
  error?: string;
}

interface CreateTestTradieResponse {
  success: boolean;
  message?: string;
  instructions?: string[];
  testPhone?: string;
  testName?: string;
  testAddress?: string;
  userType?: string;
  error?: string;
}

interface DevLoginResponse {
  success: boolean;
  userId?: string;
  email?: string;
  name?: string;
  userType?: string;
  loginUrl?: string;
  message?: string;
  instructions?: string[];
  error?: string;
}

// API functions for the developer tools panel
export const createTestClient = async (): Promise<CreateTestClientResponse> => {
  try {
    // Generate a unique phone number for testing
    const timestamp = Date.now();
    const lastDigits = timestamp.toString().slice(-7);
    const testPhone = `+614${lastDigits}`;
    
    // Call the edge function to create a test client
    const { data, error } = await devToolsClient.functions.invoke('create-test-client', {
      body: {
        phone: testPhone,
        name: `Test Client ${timestamp}`,
        address: '123 Test Street, Sydney, NSW 2000'
      }
    });

    if (error) {
      throw error;
    }

    return {
      userId: data.userId,
      phone: data.phone,
      error: undefined
    };
  } catch (error: any) {
    console.error('Error creating test client:', error);
    return {
      userId: '',
      phone: '',
      error: error.message || 'Unknown error'
    };
  }
};

export const createTestJob = async (clientId: string): Promise<CreateTestJobResponse> => {
  try {
    // Call the edge function to create a test job
    const { data, error } = await devToolsClient.functions.invoke('create-test-job', {
      body: { clientId }
    });

    if (error) {
      throw error;
    }

    return {
      jobId: data.jobId,
      error: undefined
    };
  } catch (error: any) {
    console.error('Error creating test job:', error);
    return {
      jobId: '',
      error: error.message || 'Unknown error'
    };
  }
};

export const resetTestData = async (): Promise<ResetTestDataResponse> => {
  try {
    // Call the edge function to reset test data
    const { data, error } = await devToolsClient.functions.invoke('reset-test-data', {
      body: {}
    });

    if (error) {
      throw error;
    }

    return {
      success: data.success,
      error: undefined
    };
  } catch (error: any) {
    console.error('Error resetting test data:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
};

// API function to get test tradie instructions
export const createTestTradie = async (): Promise<CreateTestTradieResponse> => {
  try {
    // Call the edge function to get test tradie instructions
    const { data, error } = await devToolsClient.functions.invoke('create-test-tradie', {
      body: {}
    });

    if (error) {
      throw error;
    }

    return {
      success: data.success,
      message: data.message,
      instructions: data.instructions,
      testPhone: data.testPhone,
      testName: data.testName,
      testAddress: data.testAddress,
      userType: data.userType,
      error: undefined
    };
  } catch (error: any) {
    console.error('Error getting test tradie info:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
};

// API function for development login (bypasses email/SMS)
export const devLoginTradie = async (): Promise<DevLoginResponse> => {
  try {
    // Call the edge function to create a test tradie and get login URL
    const { data, error } = await devToolsClient.functions.invoke('dev-login', {
      body: {
        email: 'testtradie@dev.local',
        name: 'Test Tradie',
        userType: 'tradie',
        address: '456 Tradie Street, Melbourne, VIC 3000'
      }
    });

    if (error) {
      throw error;
    }

    return {
      success: data.success,
      userId: data.userId,
      email: data.email,
      name: data.name,
      userType: data.userType,
      loginUrl: data.loginUrl,
      message: data.message,
      instructions: data.instructions,
      error: undefined
    };
  } catch (error: any) {
    console.error('Error with dev login:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
};

// API function for development login (bypasses email/SMS)
export const devLoginClient = async (): Promise<DevLoginResponse> => {
  try {
    // Call the edge function to create a test client and get login URL
    const { data, error } = await devToolsClient.functions.invoke('dev-login', {
      body: {
        email: 'testclient@dev.local',
        name: 'Test Client',
        userType: 'client',
        address: '123 Client Street, Sydney, NSW 2000'
      }
    });

    if (error) {
      throw error;
    }

    return {
      success: data.success,
      userId: data.userId,
      email: data.email,
      name: data.name,
      userType: data.userType,
      loginUrl: data.loginUrl,
      message: data.message,
      instructions: data.instructions,
      error: undefined
    };
  } catch (error: any) {
    console.error('Error with dev login:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
};

// API function for admin development login (bypasses email/SMS)
export const devLoginAdmin = async (): Promise<DevLoginResponse> => {
  try {
    // Call the edge function to create a test admin and get login URL
    const { data, error } = await devToolsClient.functions.invoke('dev-login', {
      body: {
        email: 'testadmin@dev.local',
        name: 'Test Admin',
        userType: 'tradie', // Admin is a tradie with is_admin flag
        address: '789 Admin HQ, Brisbane, QLD 4000',
        isAdmin: true // This will set the is_admin flag
      }
    });

    if (error) {
      throw error;
    }

    return {
      success: data.success,
      userId: data.userId,
      email: data.email,
      name: data.name,
      userType: data.userType,
      loginUrl: data.loginUrl,
      message: data.message,
      instructions: data.instructions,
      error: undefined
    };
  } catch (error: any) {
    console.error('Error with dev admin login:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
};
