import { vi } from 'vitest';
import { supabaseMock } from './mocks/supabase';

// Mock Supabase client globally with enhanced schema support
vi.mock('@/integrations/supabase/client', () => {
  return { supabase: supabaseMock };
});

// Mock hooks
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

// Re-export test data from mocks for backward compatibility
export { 
  mockUser as testUser,
  mockTradieProfile as testTradieProfile, 
  mockClientProfile as testClientProfile,
  mockAdminProfile as testAdminProfile,
  mockJobs as testJobs,
  mockTradeTypes,
  mockServiceLocations,
  mockSmsTemplates,
  mockTwilioSettings
} from './mocks/supabase';

// Re-export factory functions for creating test data
export {
  createMockProfile,
  createClientProfile,
  createAdminProfile,
  createIncompleteProfile,
  createMockTradeType,
  createMockServiceLocation,
  createMockSmsTemplate,
  createMockTwilioSettings,
  createMockJob,
  getOnboardingState
} from './factories';

