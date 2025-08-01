import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  phone?: string;
  name?: string;
  role: string;
  user_type: string;
  address?: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.error('Error getting session:', error);
      } else {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
      }
      setLoading(false);
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  const isAuthenticated = !!session;
  const isTradie = profile?.role === 'tradie';

  return {
    user,
    session,
    profile,
    loading,
    isAuthenticated,
    isTradie,
    signOut,
    fetchProfile
  };
};

// Utility function to generate secure job links
export const generateJobLink = async (jobId: string, phone?: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.rpc('create_job_link', {
      p_job_id: jobId,
      p_phone: phone,
      p_expires_hours: 720 // 30 days
    });

    if (error) throw error;

    const baseUrl = window.location.origin;
    const linkUrl = `${baseUrl}/secure/${jobId}?token=${data}${phone ? `&phone=${encodeURIComponent(phone)}` : ''}`;
    
    return linkUrl;
  } catch (error) {
    console.error('Error generating job link:', error);
    return null;
  }
};

// Function to validate job link
export const validateJobLink = async (jobId: string, token: string) => {
  try {
    const { data, error } = await supabase
      .from('job_links')
      .select('*, jobs(*)')
      .eq('job_id', jobId)
      .eq('token', token)
      .gte('expires_at', new Date().toISOString())
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error validating job link:', error);
    return null;
  }
};