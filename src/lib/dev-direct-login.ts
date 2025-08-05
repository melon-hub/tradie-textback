import { supabase } from '@/integrations/supabase/client';

interface DevDirectLoginOptions {
  email: string;
  name: string;
  userType: 'tradie' | 'client';
  isAdmin?: boolean;
  redirectTo?: string;
}

export async function devDirectLogin(options: DevDirectLoginOptions) {
  try {
    // Mark that dev auth is in progress
    sessionStorage.setItem('devAuthInProgress', '1');
    
    // Call the direct login edge function
    const { data, error } = await supabase.functions.invoke('dev-login-direct', {
      body: {
        email: options.email,
        name: options.name,
        userType: options.userType,
        address: options.userType === 'tradie' ? '456 Tradie Street, Melbourne, VIC 3000' : '123 Client Street, Sydney, NSW 2000',
        isAdmin: options.isAdmin || false
      }
    });

    if (error) {
      throw error;
    }

    if (!data.success || !data.session) {
      throw new Error(data.error || 'Failed to create session');
    }

    // Set the session directly
    const { error: sessionError } = await supabase.auth.setSession({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token
    });

    if (sessionError) {
      throw sessionError;
    }

    // Clear the in-progress flag
    sessionStorage.removeItem('devAuthInProgress');

    // Navigate to the target page
    const targetPath = options.redirectTo || 
      (options.isAdmin ? '/admin' : 
       options.userType === 'client' ? '/intake' : 
       '/dashboard');
    
    window.location.href = targetPath;

    return {
      success: true,
      userId: data.userId,
      message: 'Logged in successfully'
    };
  } catch (error: any) {
    sessionStorage.removeItem('devAuthInProgress');
    console.error('Dev direct login error:', error);
    return {
      success: false,
      error: error.message || 'Unknown error'
    };
  }
}