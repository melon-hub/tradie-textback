import { useState, useEffect, useRef } from 'react';
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
  is_admin?: boolean;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const fetchingRef = useRef<string | null>(null); // Track ongoing fetches

  useEffect(() => {
    let mounted = true;

    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error getting session:', error);
        } else if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          if (session?.user) {
            await fetchProfile(session.user.id);
          }
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;
        
        console.log('Auth event:', event, session?.user?.id);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Only fetch profile if we have a user and don't already have a profile
        // or if the user has changed
        if (session?.user) {
          // Don't fetch if we already have a profile for this user
          if (!profile || profile.user_id !== session.user.id) {
            // Don't set loading to false until profile is fetched
            await fetchProfile(session.user.id);
          }
          if (mounted) {
            setLoading(false);
          }
        } else {
          setProfile(null);
          if (mounted) {
            setLoading(false);
          }
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string) => {
    // Prevent duplicate fetches
    if (fetchingRef.current === userId) {
      console.log('Already fetching profile for user:', userId);
      return;
    }
    
    // Check cache first
    const cacheKey = `profile_${userId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      try {
        const cachedData = JSON.parse(cached);
        console.log('Using cached profile for user:', userId);
        setProfile(cachedData);
        setProfileLoading(false);
        return;
      } catch (e) {
        // Invalid cache, continue with fetch
        sessionStorage.removeItem(cacheKey);
      }
    }
    
    try {
      console.log('Fetching profile for user:', userId);
      fetchingRef.current = userId;
      setProfileLoading(true);
      
      // Create a timeout promise - increased to 20s for slow connections
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile fetch timeout after 20s - this may indicate a database performance issue')), 20000);
      });
      
      // Create the query promise
      const queryPromise = supabase
        .from('profiles')
        .select('id, user_id, phone, name, role, user_type, address, is_admin')
        .eq('user_id', userId)
        .maybeSingle();
      
      console.log('Waiting for profile query...');
      
      // Race between query and timeout
      const { data, error } = await Promise.race([
        queryPromise,
        timeoutPromise.then(() => ({ data: null, error: new Error('Timeout') }))
      ]) as { data: any, error: any };
      
      console.log('Profile query result:', { data, error });

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('No profile found for user');
        } else {
          console.error('Error fetching profile:', error);
        }
        fetchingRef.current = null;
        setProfileLoading(false);
        return;
      }

      console.log('Profile fetched successfully:', data);
      setProfile(data);
      // Cache the profile
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      fetchingRef.current = null;
      setProfileLoading(false);
    } catch (error) {
      console.error('Unexpected error fetching profile:', error);
      fetchingRef.current = null;
      setProfileLoading(false);
      // Set profile to null on error to prevent indefinite loading
      setProfile(null);
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
    // Clear profile cache on signout
    sessionStorage.clear();
  };

  const isAuthenticated = !!session;
  const isTradie = profile?.role === 'tradie';

  return {
    user,
    session,
    profile,
    loading: loading || profileLoading, // Combined loading state
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