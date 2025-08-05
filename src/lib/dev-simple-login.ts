import { supabase } from '@/integrations/supabase/client';

// Simple password-based dev users
const DEV_USERS = {
  admin: {
    email: 'testadmin@dev.local',
    password: 'devadmin123',
    name: 'Test Admin',
    userType: 'tradie',
    isAdmin: true,
    redirectTo: '/admin'
  },
  tradie: {
    email: 'testtradie@dev.local',
    password: 'devtradie123',
    name: 'Test Tradie',
    userType: 'tradie',
    isAdmin: false,
    redirectTo: '/dashboard'
  },
  client: {
    email: 'testclient@dev.local',
    password: 'devclient123',
    name: 'Test Client',
    userType: 'client',
    isAdmin: false,
    redirectTo: '/intake'
  }
};

export async function devSimpleLogin(role: 'admin' | 'tradie' | 'client') {
  const user = DEV_USERS[role];
  
  try {
    // First, sign out any existing session
    await supabase.auth.signOut();
    
    // Try to sign in with password
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (signInError && signInError.message.includes('Invalid login credentials')) {
      // User doesn't exist, create them
      console.log('Creating dev user:', user.email);
      
      // Use the admin API to create user (this requires service role key)
      const { data: createData, error: createError } = await supabase.auth.signUp({
        email: user.email,
        password: user.password,
        options: {
          data: {
            name: user.name,
            user_type: user.userType,
            is_admin: user.isAdmin
          }
        }
      });

      if (createError) {
        throw createError;
      }

      // Update profile after user creation
      if (createData.user) {
        await supabase.from('profiles').upsert({
          user_id: createData.user.id,
          email: user.email,
          name: user.name,
          user_type: user.userType,
          is_admin: user.isAdmin,
          onboarding_completed: user.userType === 'tradie' || user.isAdmin
        });
      }

      // Now sign in
      const { error: retryError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: user.password
      });

      if (retryError) {
        throw retryError;
      }
    } else if (signInError) {
      throw signInError;
    }

    // Success - redirect to appropriate page
    window.location.href = user.redirectTo;
    return { success: true };

  } catch (error: any) {
    console.error('Dev login error:', error);
    
    // If all else fails, try the magic link approach as fallback
    try {
      const { error: magicError } = await supabase.auth.signInWithOtp({
        email: user.email,
        options: {
          shouldCreateUser: true,
          data: {
            name: user.name,
            user_type: user.userType,
            is_admin: user.isAdmin
          }
        }
      });

      if (magicError) {
        throw magicError;
      }

      // For magic link, we just inform the user
      return {
        success: true,
        message: `Magic link sent to ${user.email}. Check the Supabase auth logs.`
      };
    } catch (fallbackError: any) {
      return {
        success: false,
        error: fallbackError.message || error.message || 'Login failed'
      };
    }
  }
}