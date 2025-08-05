import { supabase } from '@/integrations/supabase/client';

// Existing test users in the database
const TEST_USERS = {
  admin: {
    email: 'testadmin@dev.local',
    name: 'Test Admin',
    userType: 'tradie',
    isAdmin: true,
    redirectTo: '/admin'
  },
  tradie: {
    email: 'testtradie@dev.local',
    name: 'Test Tradie',
    userType: 'tradie',
    isAdmin: false,
    redirectTo: '/dashboard'
  },
  client: {
    email: 'testclient@dev.local',
    name: 'Test Client',
    userType: 'client',
    isAdmin: false,
    redirectTo: '/intake'
  }
};

export async function devReliableLogin(role: 'admin' | 'tradie' | 'client') {
  const user = TEST_USERS[role];
  
  try {
    // Sign out first to clean slate
    await supabase.auth.signOut();
    
    // Wait a moment for signout to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Method 1: Try OTP login (more reliable than magic links)
    console.log(`Attempting OTP login for ${user.email}...`);
    
    const { data: otpData, error: otpError } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: false, // Don't create, user already exists
      }
    });

    if (!otpError) {
      // For development, we'll use a known OTP pattern
      // In dev environment, Supabase often uses simple OTPs like '123456'
      const otpCode = '123456'; // Common dev OTP
      
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        email: user.email,
        token: otpCode,
        type: 'email'
      });

      if (!verifyError && verifyData.session) {
        console.log('OTP login successful!');
        window.location.href = user.redirectTo;
        return { success: true };
      }
    }

    // Method 2: Fall back to the edge function with better error handling
    console.log('OTP failed, trying edge function...');
    
    const response = await fetch('https://cjxejmljovszxuleibqn.supabase.co/functions/v1/dev-login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNqeGVqbWxqb3Zzenh1bGVpYnFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4ODcxMzEsImV4cCI6MjA2OTQ2MzEzMX0.SxVn2huG_XM1IOxgMqQbgqe6SFBahcLvY5LOBjjlVMk'
      },
      body: JSON.stringify({
        email: user.email,
        name: user.name,
        userType: user.userType,
        isAdmin: user.isAdmin,
        redirect_to: `${window.location.origin}${user.redirectTo}`
      })
    });

    const result = await response.json();
    
    if (result.success && result.loginUrl) {
      // Extract just the path part to avoid domain issues
      const url = new URL(result.loginUrl);
      const token = url.searchParams.get('token');
      const type = url.searchParams.get('type');
      const redirect = url.searchParams.get('redirect_to') || user.redirectTo;
      
      // Construct a clean URL
      const cleanUrl = `https://cjxejmljovszxuleibqn.supabase.co/auth/v1/verify?token=${token}&type=${type}&redirect_to=${window.location.origin}${user.redirectTo}`;
      
      console.log('Navigating to magic link...');
      window.location.href = cleanUrl;
      return { success: true };
    }

    throw new Error(result.error || 'All login methods failed');

  } catch (error: any) {
    console.error('Dev login error:', error);
    
    // Last resort: Show instructions for manual login
    return {
      success: false,
      error: `Login failed. Try refreshing and clicking again. Error: ${error.message}`
    };
  }
}