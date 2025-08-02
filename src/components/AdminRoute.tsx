import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { ReactNode } from 'react';

interface AdminRouteProps {
  children: ReactNode;
}

export function AdminRoute({ children }: AdminRouteProps) {
  const { profile, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading auth...</div>
      </div>
    );
  }

  // If we have a user but no profile yet, keep loading
  if (user && !profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading profile...</div>
      </div>
    );
  }

  // Check if user is authenticated and is an admin
  // TEMPORARY: Also check user_type === 'tradie' as fallback
  const isAdmin = profile?.is_admin || profile?.user_type === 'tradie';
  
  if (!profile || !isAdmin) {
    // Redirect non-admin users to dashboard
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}