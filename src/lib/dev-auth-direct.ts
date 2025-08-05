import { supabase } from '@/integrations/supabase/client';

export async function devLogin(email: string, userType: 'tradie' | 'client' | 'admin', password: string) {
  // Only run in development
  if (!import.meta.env.DEV) {
    return { success: false, error: 'Dev login only available in development mode' };
  }

  try {
    // Check if already signed in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('Already signed in, please sign out first');
      return { 
        success: false, 
        error: 'Already signed in. Please sign out before switching users.' 
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;

    if (data.session) {
      // Determine redirect based on userType
      const redirectTo = userType === 'admin' ? '/admin' :
                        userType === 'tradie' ? '/dashboard' :
                        '/intake';

      // Refresh and redirect
      await supabase.auth.refreshSession();
      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.href = redirectTo;
      return { success: true };
    }

    throw new Error('No session returned');
  } catch (error: any) {
    console.error('Direct login error:', error);
    return { success: false, error: error.message };
  }
}