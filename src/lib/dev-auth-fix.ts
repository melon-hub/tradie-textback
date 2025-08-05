// Enhanced dev authentication system that bypasses magic link issues
import { supabase } from "@/integrations/supabase/client";

export interface DevUser {
  email: string;
  name: string;
  userType: 'admin' | 'tradie' | 'client';
  isAdmin: boolean;
  redirectTo: string;
}

export const DEV_USERS: Record<string, DevUser> = {
  admin: {
    email: 'admin@dev.local',
    name: 'Dev Admin',
    userType: 'admin',
    isAdmin: true,
    redirectTo: '/admin'
  },
  tradie: {
    email: 'tradie@dev.local', 
    name: 'Dev Tradie',
    userType: 'tradie',
    isAdmin: false,
    redirectTo: '/dashboard'
  },
  client: {
    email: 'client@dev.local',
    name: 'Dev Client', 
    userType: 'client',
    isAdmin: false,
    redirectTo: '/intake'
  }
};

export class DevAuthFix {
  private static instance: DevAuthFix;
  
  static getInstance(): DevAuthFix {
    if (!DevAuthFix.instance) {
      DevAuthFix.instance = new DevAuthFix();
    }
    return DevAuthFix.instance;
  }

  /**
   * Attempt multiple authentication methods in order of reliability
   */
  async authenticateAs(userKey: string): Promise<{
    success: boolean;
    method?: string;
    error?: string;
    redirectTo?: string;
  }> {
    const user = DEV_USERS[userKey];
    if (!user) {
      return { success: false, error: 'Invalid user type' };
    }

    console.log(`🔐 Attempting authentication as ${user.name}...`);

    // Method 1: Try password authentication (most reliable)
    try {
      const passwordResult = await this.tryPasswordAuth(user);
      if (passwordResult.success) {
        return { ...passwordResult, redirectTo: user.redirectTo };
      }
    } catch (error) {
      console.log('Password auth not available:', error);
    }

    // Method 2: Try magic link (fallback)
    try {
      const magicResult = await this.tryMagicLinkAuth(user);
      if (magicResult.success) {
        return { ...magicResult, redirectTo: user.redirectTo };
      }
    } catch (error) {
      console.log('Magic link auth failed:', error);
    }

    // Method 3: Try dev session injection (last resort)
    try {
      const sessionResult = await this.tryDevSessionAuth(user);
      if (sessionResult.success) {
        return { ...sessionResult, redirectTo: user.redirectTo };
      }
    } catch (error) {
      console.log('Dev session auth failed:', error);
    }

    return { 
      success: false, 
      error: 'All authentication methods failed. Please check Supabase configuration.' 
    };
  }

  private async tryPasswordAuth(user: DevUser) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: 'devpass123' // Standard dev password
    });

    if (error) throw error;
    
    return { 
      success: true, 
      method: 'password',
      user: data.user 
    };
  }

  private async tryMagicLinkAuth(user: DevUser) {
    // Generate a single magic link and handle it properly
    const { data, error } = await supabase.auth.signInWithOtp({
      email: user.email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name: user.name,
          email: user.email,
          user_type: user.userType,
          is_admin: user.isAdmin
        }
      }
    });

    if (error) throw error;

    return { 
      success: true, 
      method: 'magic_link',
      message: `Magic link sent to ${user.email}. Check your email.` 
    };
  }

  private async tryDevSessionAuth(user: DevUser) {
    // This would require a custom edge function to create sessions directly
    // For now, just return failure
    throw new Error('Dev session auth not implemented');
  }

  /**
   * Quick login for development - tries the most reliable method first
   */
  async quickLogin(userKey: string): Promise<void> {
    const result = await this.authenticateAs(userKey);
    
    if (result.success && result.method === 'password' && result.redirectTo) {
      // Direct redirect for password auth
      setTimeout(() => {
        window.location.href = result.redirectTo!;
      }, 1000);
    } else if (result.success && result.method === 'magic_link') {
      // Show message for magic link
      alert(`Magic link sent! Check your email for ${DEV_USERS[userKey].email}`);
    } else {
      throw new Error(result.error || 'Authentication failed');
    }
  }

  /**
   * Check if we're in development mode
   */
  isDevelopment(): boolean {
    return !import.meta.env.PROD;
  }

  /**
   * Setup dev users in Supabase (call this once)
   */
  async setupDevUsers(): Promise<{ success: boolean; message: string }> {
    if (!this.isDevelopment()) {
      return { success: false, message: 'Only available in development' };
    }

    try {
      // This would need to call an edge function to create users
      // For now, return instructions
      return {
        success: true,
        message: 'To setup dev users, run the SQL script in Supabase SQL Editor: scripts/setup-dev-users.sql'
      };
    } catch (error) {
      return {
        success: false,
        message: `Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
}

// Global instance
export const devAuth = DevAuthFix.getInstance();

// Utility functions for easy use
export const loginAsAdmin = () => devAuth.quickLogin('admin');
export const loginAsTradie = () => devAuth.quickLogin('tradie'); 
export const loginAsClient = () => devAuth.quickLogin('client');

// Make available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).devAuth = {
    loginAsAdmin,
    loginAsTradie,
    loginAsClient,
    authenticate: (userKey: string) => devAuth.authenticateAs(userKey)
  };
}