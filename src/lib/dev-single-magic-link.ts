import { supabase } from '@/integrations/supabase/client';

// Existing test users
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

// Track last request to prevent multiple simultaneous requests
let lastRequestEmail = '';
let lastRequestTime = 0;

export async function devSingleMagicLink(role: 'admin' | 'tradie' | 'client') {
  // Only run in development
  if (!import.meta.env.DEV) {
    return { success: false, error: 'Dev login only available in development mode' };
  }

  const user = TEST_USERS[role];
  
  // Prevent multiple rapid clicks
  const now = Date.now();
  if (lastRequestEmail === user.email && (now - lastRequestTime) < 5000) {
    return {
      success: false,
      error: 'Please wait 5 seconds between login attempts'
    };
  }
  
  lastRequestEmail = user.email;
  lastRequestTime = now;
  
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
    
    // Call the edge function ONCE
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
    
    if (!result.success || !result.loginUrl) {
      throw new Error(result.error || 'Failed to generate magic link');
    }

    // Navigate to the magic link
    window.location.href = result.loginUrl;
    
    return { success: true };
    
  } catch (error: any) {
    console.error('Dev login error:', error);
    return { 
      success: false, 
      error: error.message || 'Login failed'
    };
  }
}