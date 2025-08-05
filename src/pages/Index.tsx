import { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { user, profile, loading, isAuthenticated } = useAuth();

  // Show loading while checking auth status
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // If not authenticated, redirect to landing page
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If authenticated, check onboarding status
  if (user && profile) {
    // Admins always go to admin panel
    if (profile.is_admin) {
      return <Navigate to="/admin" replace />;
    }
    
    // Check if user needs onboarding (non-admin tradies only)
    const needsOnboarding = profile.user_type === 'tradie' && !profile.onboarding_completed;
    
    if (needsOnboarding) {
      // Redirect to onboarding completion
      return <Navigate to="/onboarding/complete" replace />;
    } else {
      // Onboarding completed, redirect to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  // If we have a user but no profile yet, wait for profile to load
  if (user && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Default fallback to landing page
  return <Navigate to="/" replace />;
};

export default Index;
