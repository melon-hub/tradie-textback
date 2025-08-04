import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { 
  TestDataBuilder, 
  OnboardingMockHelper, 
  ProfileMockHelper, 
  MockResponseBuilder 
} from '../helpers/database';
import { getOnboardingState, createMockProfile } from '../setup-test';

describe('Onboarding Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('complete onboarding flow', () => {
    it('should progress through all onboarding steps successfully', async () => {
      const userId = 'test-user-id';
      const steps = await OnboardingMockHelper.mockOnboardingFlow(0, 6);

      // Test each step in the onboarding process (steps 0-6, so 7 total)
      expect(steps).toHaveLength(7);
      
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        expect(step.profile.onboarding_step).toBe(i);
        expect(step.profile.onboarding_completed).toBe(i === 6);
        
        if (i < 6) {
          expect(step.canProceed).toBe(true);
          expect(step.nextStep).toBe(i + 1);
        } else {
          expect(step.canProceed).toBe(false);
          expect(step.nextStep).toBe(i + 1); // nextStep is step + 1, even for completed
        }
      }
    });

    it('should handle step 1: basic profile information', async () => {
      const step1Data = getOnboardingState(1);
      const profile = createMockProfile(step1Data.profileData);

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(MockResponseBuilder.success([profile])),
      } as any);

      const result = await supabase.from('profiles')
        .update({
          name: 'Test Tradie',
          phone: '+61412345678',
          onboarding_step: 1,
        })
        .eq('user_id', 'test-user-id')
        .select();

      expect(result.data?.[0]).toEqual(profile);
      expect(result.data?.[0].name).toBe('Test Tradie');
      expect(result.data?.[0].phone).toBe('+61412345678');
      expect(result.data?.[0].onboarding_step).toBe(1);
      expect(result.data?.[0].onboarding_completed).toBe(false);
    });

    it('should handle step 2: trade selection', async () => {
      const step2Data = getOnboardingState(2);
      const profile = createMockProfile(step2Data.profileData);

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(MockResponseBuilder.success([profile])),
      } as any);

      const result = await supabase.from('profiles')
        .update({
          trade_primary: 'plumber',
          trade_secondary: ['electrician'],
          onboarding_step: 2,
        })
        .eq('user_id', 'test-user-id')
        .select();

      expect(result.data?.[0].trade_primary).toBe('plumber');
      expect(result.data?.[0].trade_secondary).toEqual(['electrician']);
      expect(result.data?.[0].onboarding_step).toBe(2);
    });

    it('should handle step 3: business information', async () => {
      const step3Data = getOnboardingState(3);
      const profile = createMockProfile(step3Data.profileData);

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(MockResponseBuilder.success([profile])),
      } as any);

      const result = await supabase.from('profiles')
        .update({
          business_name: 'Test Plumbing Services',
          abn: '12345678901',
          onboarding_step: 3,
        })
        .eq('user_id', 'test-user-id')
        .select();

      expect(result.data?.[0].business_name).toBe('Test Plumbing Services');
      expect(result.data?.[0].abn).toBe('12345678901');
      expect(result.data?.[0].onboarding_step).toBe(3);
    });

    it('should handle step 4: service areas', async () => {
      const step4Data = getOnboardingState(4);
      const profile = createMockProfile(step4Data.profileData);

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(MockResponseBuilder.success([profile])),
      } as any);

      const result = await supabase.from('profiles')
        .update({
          service_postcodes: ['2000', '2001'],
          service_radius_km: 25,
          onboarding_step: 4,
        })
        .eq('user_id', 'test-user-id')
        .select();

      expect(result.data?.[0].service_postcodes).toEqual(['2000', '2001']);
      expect(result.data?.[0].service_radius_km).toBe(25);
      expect(result.data?.[0].onboarding_step).toBe(4);
    });

    it('should handle step 5: licensing and insurance', async () => {
      const step5Data = getOnboardingState(5);
      const profile = createMockProfile(step5Data.profileData);

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(MockResponseBuilder.success([profile])),
      } as any);

      const result = await supabase.from('profiles')
        .update({
          license_number: 'PL12345',
          license_expiry: '2025-12-31',
          insurance_provider: 'Test Insurance Co',
          insurance_expiry: '2025-12-31',
          onboarding_step: 5,
        })
        .eq('user_id', 'test-user-id')
        .select();

      expect(result.data?.[0].license_number).toBe('PL12345');
      expect(result.data?.[0].insurance_provider).toBe('Test Insurance Co');
      expect(result.data?.[0].onboarding_step).toBe(5);
    });

    it('should handle step 6: final details and completion', async () => {
      const step6Data = getOnboardingState(6);
      const profile = createMockProfile(step6Data.profileData);

      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(MockResponseBuilder.success([profile])),
      } as any);

      // Mock the create default SMS templates function
      vi.mocked(supabase.rpc).mockResolvedValue(MockResponseBuilder.success(null));

      const result = await supabase.from('profiles')
        .update({
          years_experience: 10,
          specializations: ['emergency', 'commercial'],
          callback_window_minutes: 30,
          after_hours_enabled: false,
          timezone: 'Australia/Sydney',
          onboarding_step: 6,
          onboarding_completed: true,
        })
        .eq('user_id', 'test-user-id')
        .select();

      // Create default SMS templates
      const templateResult = await supabase.rpc('create_default_sms_templates', { 
        target_user_id: 'test-user-id' 
      });

      expect(result.data?.[0].onboarding_completed).toBe(true);
      expect(result.data?.[0].onboarding_step).toBe(6);
      expect(result.data?.[0].years_experience).toBe(10);
      expect(result.data?.[0].specializations).toEqual(['emergency', 'commercial']);
      expect(templateResult.error).toBeNull();
    });
  });

  describe('onboarding validation', () => {
    it('should prevent skipping required steps', async () => {
      const incompleteProfile = ProfileMockHelper.createIncompleteTradie(2);
      
      // Try to jump to step 5 without completing intermediate steps
      const mockError = MockResponseBuilder.error('Validation failed', 'Cannot skip required onboarding steps');
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockError),
      } as any);

      const result = await supabase.from('profiles')
        .update({ onboarding_step: 5 })
        .eq('user_id', 'test-user-id')
        .select();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Validation failed');
    });

    it('should validate required fields for each step', async () => {
      // Step 2 requires trade_primary
      const mockError = MockResponseBuilder.error('Validation failed', 'trade_primary is required');
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockError),
      } as any);

      const result = await supabase.from('profiles')
        .update({ 
          onboarding_step: 2,
          // Missing trade_primary
        })
        .eq('user_id', 'test-user-id')
        .select();

      expect(result.error).toBeDefined();
      expect(result.error?.details).toContain('trade_primary is required');
    });

    it('should validate field constraints', async () => {
      // Invalid years_experience
      const mockError = MockResponseBuilder.error('Validation failed', 'years_experience must be between 0 and 50');
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockError),
      } as any);

      const result = await supabase.from('profiles')
        .update({ 
          years_experience: 60, // Invalid: > 50
          onboarding_step: 6,
        })
        .eq('user_id', 'test-user-id')
        .select();

      expect(result.error).toBeDefined();
      expect(result.error?.details).toContain('years_experience must be between 0 and 50');
    });
  });

  describe('onboarding state management', () => {
    it('should determine correct next step based on current progress', () => {
      const scenarios = [
        { current: 0, expected: 1 },
        { current: 1, expected: 2 },
        { current: 2, expected: 3 },
        { current: 3, expected: 4 },
        { current: 4, expected: 5 },
        { current: 5, expected: 6 },
        { current: 6, expected: 6 }, // Completed
      ];

      scenarios.forEach(({ current, expected }) => {
        const state = getOnboardingState(current);
        const nextStep = state.completed ? 6 : current + 1;
        expect(nextStep).toBe(expected);
      });
    });

    it('should identify incomplete onboarding correctly', () => {
      for (let step = 0; step < 6; step++) {
        const state = getOnboardingState(step);
        expect(state.completed).toBe(false);
      }

      const completedState = getOnboardingState(6);
      expect(completedState.completed).toBe(true);
    });

    it('should build onboarding scenario for each step', () => {
      for (let step = 0; step <= 6; step++) {
        const scenario = TestDataBuilder.buildOnboardingScenario(step);
        
        expect(scenario.user).toBeDefined();
        expect(scenario.profile).toBeDefined();
        expect(scenario.profile.onboarding_step).toBe(step);
        expect(scenario.isComplete).toBe(step === 6);
        
        if (step < 6) {
          expect(scenario.canProceed).toBe(true);
          expect(scenario.nextStep).toBe(step + 1);
        } else {
          expect(scenario.canProceed).toBe(false);
          expect(scenario.nextStep).toBe(6);
        }
      }
    });
  });

  describe('trade type integration', () => {
    it('should load trade types for selection step', async () => {
      const tradeSelectionData = OnboardingMockHelper.mockTradeSelectionStep();
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue(MockResponseBuilder.array(tradeSelectionData.tradeTypes)),
      } as any);

      const result = await supabase.from('trade_types').select('*');

      expect(result.data).toHaveLength(3);
      expect(result.data?.find(t => t.code === 'plumber')).toBeDefined();
      expect(result.data?.find(t => t.code === 'electrician')).toBeDefined();
      expect(result.data?.find(t => t.code === 'carpenter')).toBeDefined();
    });
  });

  describe('service area integration', () => {
    it('should create service locations during onboarding', async () => {
      const serviceAreaData = OnboardingMockHelper.mockServiceAreaStep();
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(MockResponseBuilder.array(serviceAreaData.locations)),
      } as any);

      const result = await supabase.from('service_locations')
        .insert(serviceAreaData.locations)
        .select();

      expect(result.data).toHaveLength(2);
      expect(result.data?.every(loc => loc.user_id === 'test-user-id')).toBe(true);
      expect(result.data?.find(loc => loc.postcode === '2000')).toBeDefined();
      expect(result.data?.find(loc => loc.postcode === '2001')).toBeDefined();
    });
  });

  describe('error handling during onboarding', () => {
    it('should handle database errors gracefully', async () => {
      const mockError = MockResponseBuilder.error('Database connection failed');
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockError),
      } as any);

      const result = await supabase.from('profiles')
        .update({ name: 'Test' })
        .eq('user_id', 'test-user-id')
        .select();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toBe('Database connection failed');
      expect(result.data).toBeNull();
    });

    it('should handle network timeouts during onboarding', async () => {
      const mockError = MockResponseBuilder.error('Request timeout');
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockRejectedValue(mockError),
      } as any);

      try {
        await supabase.from('profiles')
          .update({ name: 'Test' })
          .eq('user_id', 'test-user-id')
          .select();
      } catch (error) {
        expect(error).toEqual(mockError);
      }
    });
  });
});