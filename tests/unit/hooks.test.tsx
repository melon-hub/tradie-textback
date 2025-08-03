import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { testUser, testTradieProfile } from '../setup-test';

// Remove the global mock for now
// vi.mock('@/hooks/useAuth');

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    
    // Reset auth subscription mock
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { 
        subscription: { 
          unsubscribe: vi.fn() 
        } 
      },
      error: null
    } as any);
  });

  it('should handle no session', async () => {
    // Mock getSession to return null
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);

    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it('should load user and profile', async () => {
    // Setup mock to return user
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: { user: testUser } as any },
      error: null,
    } as any);
    
    // Mock the profiles query using maybeSingle
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({
        data: testTradieProfile,
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current).toBeDefined();
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(testUser);
    expect(result.current.profile).toEqual(testTradieProfile);
  });
});

describe('useAnalytics Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset channel mock
    vi.mocked(supabase.channel).mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({
        unsubscribe: vi.fn(),
      }),
    } as any);
  });

  it('should return null when no user', async () => {
    // Mock supabase for the nested useAuth call
    vi.mocked(supabase.auth.getSession).mockResolvedValue({
      data: { session: null },
      error: null,
    } as any);
    
    vi.mocked(supabase.auth.onAuthStateChange).mockReturnValue({
      data: { 
        subscription: { 
          unsubscribe: vi.fn() 
        } 
      },
      error: null
    } as any);
    
    const { result } = renderHook(() => useAnalytics());
    
    // Wait a bit for the initial loading state to settle
    await waitFor(() => {
      expect(result.current).toBeDefined();
    });
    
    // The useAnalytics hook starts with loading=true and should eventually be false
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    }, { timeout: 2000 });
    
    expect(result.current.analytics).toBeNull();
    expect(result.current.error).toBeNull();
  });
});