import { supabase } from '@/integrations/supabase/client';

// Development users with passwords for quick login
const DEV_USERS = {
  admin: {
    email: 'admin@tradie.dev',
    password: 'admin123456',
    name: 'Dev Admin',
    userType: 'tradie',
    isAdmin: true,
    redirectTo: '/admin'
  },
  tradie: {
    email: 'tradie@tradie.dev', 
    password: 'tradie123456',
    name: 'Dev Tradie',
    userType: 'tradie',
    isAdmin: false,
    redirectTo: '/dashboard'
  },
  client: {
    email: 'client@tradie.dev',
    password: 'client123456',
    name: 'Dev Client',
    userType: 'client',
    isAdmin: false,
    redirectTo: '/intake'
  }
};

export async function devPasswordLogin(role: 'admin' | 'tradie' | 'client') {
  const user = DEV_USERS[role];
  if (!user) {
    return { success: false, error: 'Invalid role' };
  }

  try {
    // First try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: user.password
    });

    if (signInError) {
      // If sign in fails, try to create the user
      if (signInError.message.includes('Invalid login credentials')) {
        console.log('User does not exist, creating...');
        
        // Sign up the user
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
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

        if (signUpError) {
          throw signUpError;
        }

        // Wait a moment for the user to be created
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Update the profile
        if (signUpData.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              user_id: signUpData.user.id,
              email: user.email,
              name: user.name,
              user_type: user.userType,
              is_admin: user.isAdmin,
              onboarding_completed: user.userType === 'tradie' || user.isAdmin
            });

          if (profileError) {
            console.error('Profile update error:', profileError);
          }
        }

        // Now sign in with the newly created user
        const { error: secondSignInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password: user.password
        });

        if (secondSignInError) {
          throw secondSignInError;
        }
      } else {
        throw signInError;
      }
    }

    // Navigate to the appropriate page
    window.location.href = user.redirectTo;
    
    return { success: true };
  } catch (error: any) {
    console.error('Dev password login error:', error);
    return { 
      success: false, 
      error: error.message || 'Login failed'
    };
  }
}