import { vi } from 'vitest';

// Mock Supabase client globally
vi.mock('@/integrations/supabase/client', () => {
  const mockSupabase = {
    auth: {
      getSession: vi.fn().mockResolvedValue({ 
        data: { session: null }, 
        error: null 
      }),
      getUser: vi.fn().mockResolvedValue({ 
        data: { user: null }, 
        error: null 
      }),
      signInWithOtp: vi.fn().mockResolvedValue({ 
        data: {}, 
        error: null 
      }),
      signOut: vi.fn().mockResolvedValue({ 
        error: null 
      }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } }
      }),
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({ data: null, error: null }),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
    }),
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    }),
  };

  return { supabase: mockSupabase };
});

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Setup global test data
export const testUser = {
  id: 'test-user-id',
  email: 'test@example.com',
};

export const testTradieProfile = {
  id: 'profile-1',
  user_id: 'test-user-id',
  name: 'Test Tradie',
  phone: '+61412345678',
  user_type: 'tradie' as const,
  is_admin: false,
};

export const testClientProfile = {
  id: 'profile-2',
  user_id: 'client-user-id',
  name: 'Test Client',
  phone: '+61498765432',
  user_type: 'client' as const,
  is_admin: false,
};

export const testJobs = [
  {
    id: 'job-1',
    client_id: 'test-user-id',
    customer_name: 'John Doe',
    phone: '+61412345678',
    job_type: 'Plumbing',
    location: 'Sydney NSW',
    urgency: 'high' as const,
    status: 'new' as const,
    estimated_value: 250,
    description: 'Leaking tap',
    created_at: new Date().toISOString(),
  },
  {
    id: 'job-2',
    client_id: 'test-user-id',
    customer_name: 'Jane Smith',
    phone: '+61498765432',
    job_type: 'Electrical',
    location: 'Melbourne VIC',
    urgency: 'medium' as const,
    status: 'contacted' as const,
    estimated_value: 500,
    description: 'Power outlet not working',
    created_at: new Date().toISOString(),
  },
];