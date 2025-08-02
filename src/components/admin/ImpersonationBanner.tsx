import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export function ImpersonationBanner() {
  const [impersonationData, setImpersonationData] = useState<any>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if we're impersonating
    const data = sessionStorage.getItem('impersonating_user');
    if (data) {
      setImpersonationData(JSON.parse(data));
    }
  }, []);

  const handleExitImpersonation = async () => {
    try {
      // Get admin return session
      const adminSession = sessionStorage.getItem('admin_return_session');
      
      // Sign out current impersonated user
      await supabase.auth.signOut();
      
      // Clear all impersonation data
      sessionStorage.removeItem('impersonating_user');
      sessionStorage.removeItem('admin_return_session');
      sessionStorage.clear(); // Clear all cached profiles
      
      if (!adminSession) {
        // If no admin session found, just redirect to login
        toast({
          title: 'Session ended',
          description: 'Please log in again',
        });
        navigate('/login');
        return;
      }

      const adminData = JSON.parse(adminSession);
      
      toast({
        title: 'Exited impersonation',
        description: 'Please log back in as admin',
      });
      
      // Navigate to login with admin hint
      navigate('/login', { 
        state: { 
          returningAdmin: true,
          adminEmail: adminData.adminEmail 
        } 
      });
      
    } catch (error) {
      console.error('Error exiting impersonation:', error);
      
      // Even if there's an error, sign out and redirect
      await supabase.auth.signOut();
      sessionStorage.clear();
      
      toast({
        title: 'Session ended',
        description: 'Please log in again',
      });
      
      navigate('/login');
    }
  };

  if (!impersonationData) return null;

  const duration = Date.now() - impersonationData.startedAt;
  const minutes = Math.floor(duration / 60000);

  return (
    <div className="bg-yellow-500 text-black px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4" />
        <span className="font-medium">
          Impersonating: {impersonationData.userName || 'User'} ({impersonationData.userType})
        </span>
        <span className="text-sm opacity-75">
          • {minutes} minute{minutes !== 1 ? 's' : ''} ago
        </span>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleExitImpersonation}
        className="bg-white hover:bg-gray-100 text-black"
      >
        <LogOut className="h-3 w-3 mr-1" />
        Exit Impersonation
      </Button>
    </div>
  );
}