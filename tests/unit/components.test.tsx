import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Dashboard from '@/pages/Dashboard';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a wrapper for tests
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } }
  });
  
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {children}
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe('Dashboard Component', () => {
  it('should render dashboard when authenticated', () => {
    vi.mock('@/hooks/useAuth', () => ({
      useAuth: () => ({ 
        user: { id: 'test-user' }, 
        profile: { user_type: 'tradie' }, 
        loading: false 
      }),
    }));
    
    const Wrapper = createWrapper();
    render(<Dashboard />, { wrapper: Wrapper });
    
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });

  it('should redirect when not authenticated', () => {
    vi.mock('@/hooks/useAuth', () => ({
      useAuth: () => ({ user: null, profile: null, loading: false }),
    }));
    
    const Wrapper = createWrapper();
    render(<Dashboard />, { wrapper: Wrapper });
    
    // Should redirect to login
    expect(window.location.pathname).toBe('/');
  });
});