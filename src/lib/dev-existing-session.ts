import { supabase } from '@/integrations/supabase/client';

// Use existing test users that are already set up
const TEST_USERS = {
  admin: {
    email: 'testadmin@dev.local',
    password: 'TestAdmin123!', // Common pattern for dev passwords
    redirectTo: '/admin'
  },
  tradie: {
    email: 'testtradie@dev.local',
    password: 'TestTradie123!',
    redirectTo: '/dashboard'
  },
  client: {
    email: 'testclient@dev.local',
    password: 'TestClient123!',
    redirectTo: '/intake'
  }
};

export async function devExistingSession(role: 'admin' | 'tradie' | 'client') {
  // Only run in development
  if (!import.meta.env.DEV) {
    return { success: false, error: 'Dev login only available in development mode' };
  }

  // Use env vars for passwords to avoid hardcoding
  const passwords = {
    admin: import.meta.env.VITE_DEV_ADMIN_PASS || 'TestAdmin123!',
    tradie: import.meta.env.VITE_DEV_TRADIE_PASS || 'TestTradie123!',
    client: import.meta.env.VITE_DEV_CLIENT_PASS || 'TestClient123!'
  };

  const user = {
    ...TEST_USERS[role],
    password: passwords[role]
  };
  
  try {
    // Always sign out first to ensure clean slate
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('Existing session found, signing out first...');
      await supabase.auth.signOut();
      // Small delay to ensure sign out completes
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    // Try password login first (most reliable)
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (!error && data.session) {
      console.log('Password login successful!');
      
      // Refresh session to ensure it's active
      await supabase.auth.refreshSession();
      
      // Small delay for auth state to propagate (helps with redirects)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      window.location.href = user.redirectTo;
      return { success: true };
    }

    // If password fails, try a single magic link (not multiple)
    console.log('Password failed, trying ONE magic link...');
    
    // Use signInWithOtp which is more reliable
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: false,
        emailRedirectTo: `${window.location.origin}${user.redirectTo}`
      }
    });

    if (!otpError) {
      return {
        success: true,
        message: `Check email for ${user.email}. The magic link will redirect to ${user.redirectTo}`
      };
    }

    throw new Error('Both password and OTP methods failed');

  } catch (error: any) {
    console.error('Login error:', error);
    
    // Provide clear instructions
    return {
      success: false,
      error: `Unable to login automatically. Try these manual steps:
1. Go to Supabase Dashboard > Authentication > Users
2. Find ${user.email}
3. Send a password reset or create a new magic link
4. Or update the password to: ${user.password}`
    };
  }
}