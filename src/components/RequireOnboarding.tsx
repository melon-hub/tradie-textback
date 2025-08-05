import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Loader2 } from "lucide-react";

interface RequireOnboardingProps {
  children: React.ReactNode;
}

/**
 * HOC that checks if user needs onboarding and redirects them if needed
 * Use this to wrap any protected routes that require onboarding to be complete
 */
export function RequireOnboarding({ children }: RequireOnboardingProps) {
  const { user, profile, loading, authReady } = useAuth();
  const location = useLocation();

  // Show loading while checking auth status
  if (loading || !authReady) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Redirect to auth if not logged in
  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Check if user needs onboarding (exclude admins)
  const needsOnboarding =
    profile && 
    profile.user_type === "tradie" && 
    !profile.onboarding_completed &&
    !profile.is_admin; // Admins don't need onboarding

  // Redirect to onboarding if needed
  if (needsOnboarding) {
    return <Navigate to="/onboarding" state={{ from: location }} replace />;
  }

  // User is authenticated and has completed onboarding
  return <>{children}</>;
}
