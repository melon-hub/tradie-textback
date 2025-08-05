import { supabase } from '@/integrations/supabase/client';

// Test users that already exist in the database
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

export async function devMagicLogin(role: 'admin' | 'tradie' | 'client') {
  const user = TEST_USERS[role];
  if (!user) {
    return { success: false, error: 'Invalid role' };
  }

  try {
    // Call the dev-login edge function to generate magic link
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
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to generate magic link');
    }

    // Navigate directly to the magic link
    window.location.href = result.loginUrl;
    
    return { success: true };
  } catch (error: any) {
    console.error('Dev magic login error:', error);
    return { 
      success: false, 
      error: error.message || 'Magic link generation failed'
    };
  }
}