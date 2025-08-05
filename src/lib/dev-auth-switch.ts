import { supabase } from "@/integrations/supabase/client";
import { QueryClient } from "@tanstack/react-query";

export type DevRole = "admin" | "tradie" | "client";

interface DevUser {
  email: string;
  password: string;
  name: string;
  role: DevRole;
}

interface SwitchOptions {
  navigateTo?: string;
  clearAll?: boolean;
}

// Dev users configuration (only available in development)
const DEV_USERS: Record<DevRole, DevUser> = {
  admin: {
    email: "admin@dev.local",
    password: "devpass123",
    name: "Dev Admin",
    role: "admin",
  },
  tradie: {
    email: "tradie@dev.local",
    password: "devpass123",
    name: "Dev Tradie",
    role: "tradie",
  },
  client: {
    email: "client@dev.local",
    password: "devpass123",
    name: "Dev Client",
    role: "client",
  },
};

export class DevAuthSwitch {
  private queryClient: QueryClient;

  constructor(queryClient: QueryClient) {
    this.queryClient = queryClient;
  }

  /**
   * Switch to a different dev user role
   * This signs out the current user and signs in as the specified role
   */
  async switchToRole(
    role: DevRole,
    options: SwitchOptions = {},
  ): Promise<{ success: boolean; error?: string; navigateTo?: string }> {
    // Only allow in development
    if (import.meta.env.PROD) {
      return {
        success: false,
        error: "Dev auth switch is only available in development",
      };
    }

    try {
      // Mark auth handover in progress to prevent guards from redirecting
      sessionStorage.setItem("devAuthInProgress", "1");

      // Sign out current user
      await supabase.auth.signOut();

      // Clear all caches
      this.queryClient.clear();

      // Clear any stored dev state and session storage
      if (options.clearAll) {
        localStorage.clear();
        sessionStorage.clear();
      } else {
        localStorage.removeItem("devRole");
        localStorage.removeItem("devTenantId");
        sessionStorage.removeItem("authToken");
        sessionStorage.removeItem("userSession");
      }

      // Get dev user credentials
      const devUser = DEV_USERS[role];
      if (!devUser) {
        return { success: false, error: `Unknown role: ${role}` };
      }

      // Sign in as the dev user
      const { data, error } = await supabase.auth.signInWithPassword({
        email: devUser.email,
        password: devUser.password,
      });

      if (error) {
        console.error("Auth error details:", error);

        // Check for specific error types
        if (error.message.includes("Invalid login credentials")) {
          return {
            success: false,
            error:
              "Dev users not found. Please run the setup script in Supabase SQL Editor: scripts/setup-dev-users-simple.sql",
          };
        }

        if (error.message.includes("Email logins are disabled")) {
          return {
            success: false,
            error:
              "Password authentication is disabled. Enable it in Supabase Dashboard > Authentication > Providers > Email",
          };
        }

        return {
          success: false,
          error: `Authentication failed: ${error.message}`,
        };
      }

      // Store the current dev role
      localStorage.setItem("devRole", role);

      // Keep the in-progress flag until useAuth sees the new session and clears it.
      // This prevents guards from redirecting during the brief handover window.

      // Invalidate all queries to force refetch with new auth
      await this.queryClient.invalidateQueries();

      // Small delay to ensure auth state propagates
      await new Promise((resolve) => setTimeout(resolve, 150));

      return {
        success: true,
        navigateTo: options.navigateTo,
      };
    } catch (error) {
      console.error("Dev auth switch error:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Get current dev role from localStorage
   */
  getCurrentRole(): DevRole | null {
    if (import.meta.env.PROD) return null;
    return localStorage.getItem("devRole") as DevRole | null;
  }

  /**
   * Get all available dev users
   */
  getDevUsers() {
    if (import.meta.env.PROD) return {};
    return DEV_USERS;
  }

  /**
   * Quick switch with page reload (simpler but more disruptive)
   */
  async switchAndReload(role: DevRole) {
    const result = await this.switchToRole(role);
    if (result.success) {
      window.location.reload();
    }
    return result;
  }
}
