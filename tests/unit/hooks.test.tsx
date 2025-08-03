import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { supabase } from '@/integrations/supabase/client';
import { testUser, testTradieProfile, testJobs } from '../setup-test';

describe('useAuth Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
  });

  it('should handle no session', async () => {
    const { result } = renderHook(() => useAuth());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    expect(result.current.user).toBeNull();
    expect(result.current.profile).toBeNull();
  });

  it('should load user and profile', async () => {
    // Setup mock to return user
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: { user: testUser } as any },
      error: null,
    });
    
    vi.mocked(supabase.from).mockReturnValueOnce({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValueOnce({
        data: testTradieProfile,
        error: null,
      }),
    } as any);

    const { result } = renderHook(() => useAuth());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(testUser);
    expect(result.current.profile).toEqual(testTradieProfile);
  });
});

describe('useAnalytics Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return null when no user', () => {
    vi.mock('@/hooks/useAuth', () => ({
      useAuth: () => ({ user: null, profile: null, loading: false }),
    }));
    
    const { result } = renderHook(() => useAnalytics());
    
    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
  });
});