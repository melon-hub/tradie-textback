import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { LogIn } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { ImpersonationDialog } from './ImpersonationDialog';

interface LoginAsButtonProps {
  userId: string;
  userName: string | null;
}

export function LoginAsButton({ userId, userName }: LoginAsButtonProps) {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [targetUserType, setTargetUserType] = useState('');
  const { toast } = useToast();

  const handleLoginAs = async () => {
    try {
      setLoading(true);
      
      // Store current admin session info
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('No current user');
      }
      
      // Get current profile to preserve admin info
      const { data: adminProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', currentUser.id)
        .single();
      
      // Store admin info in sessionStorage for return
      sessionStorage.setItem('admin_return_session', JSON.stringify({
        adminId: currentUser.id,
        adminEmail: currentUser.email,
        adminName: adminProfile?.name || 'Admin',
        timestamp: Date.now()
      }));
      
      // Get the target user's profile
      const { data: targetProfile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
        
      if (profileError) throw profileError;
      
      // Store user type for dialog
      setTargetUserType(targetProfile.user_type);
      
      // Open dialog instead of navigating
      setDialogOpen(true);
      
    } catch (error) {
      console.error('Error logging in as user:', error);
      toast({
        title: 'Error',
        description: 'Failed to switch user',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmImpersonation = async () => {
    try {
      // Get the target user's profile again
      const { data: targetProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (targetProfile) {
        // Store impersonation info
        sessionStorage.setItem('impersonating_user', JSON.stringify({
          userId: targetProfile.user_id,
          userName: targetProfile.name,
          userType: targetProfile.user_type,
          startedAt: Date.now()
        }));

        toast({
          title: 'Impersonation Ready',
          description: `Now use Dev Tools to login as a ${targetProfile.user_type}`,
        });
      }

      setDialogOpen(false);
      
      // Navigate to the dashboard where they can use dev tools
      // This way admins see what the tradie would see
      window.location.href = '/dashboard';
      
    } catch (error) {
      console.error('Error setting up impersonation:', error);
      toast({
        title: 'Error',
        description: 'Failed to set up impersonation',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={handleLoginAs}
        disabled={loading}
        className="ml-2"
      >
        <LogIn className="h-3 w-3 mr-1" />
        Login as
      </Button>
      
      <ImpersonationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userName={userName}
        userType={targetUserType}
        onConfirm={handleConfirmImpersonation}
      />
    </>
  );
}