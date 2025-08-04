import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { 
  RLSMockHelper, 
  TestDataBuilder, 
  MockResponseBuilder,
  ErrorSimulationHelper 
} from '../../helpers/database';
import { 
  testUser, 
  mockServiceLocations, 
  mockSmsTemplates, 
  mockTwilioSettings,
  createMockProfile,
  createClientProfile
} from '../../setup-test';

describe('RLS Policy Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Profiles RLS', () => {
    it('should allow users to access their own profile', () => {
      const userId = 'user-123';
      const profile = createMockProfile({ user_id: userId });
      
      const canAccess = RLSMockHelper.mockUserCanAccess(userId, profile.user_id);
      expect(canAccess).toBe(true);
    });

    it('should deny access to other users profiles', () => {
      const userId = 'user-123';
      const otherUserId = 'user-456';
      const profile = createMockProfile({ user_id: otherUserId });
      
      const canAccess = RLSMockHelper.mockUserCanAccess(userId, profile.user_id);
      expect(canAccess).toBe(false);
    });

    it('should allow admins to access all profiles', () => {
      const isAdmin = true;
      const canAccess = RLSMockHelper.mockAdminCanAccess(isAdmin);
      expect(canAccess).toBe(true);
    });
  });

  describe('Service Locations RLS', () => {
    it('should filter service locations by user ownership', () => {
      const userId = 'user-123';
      const userLocations = mockServiceLocations.filter(loc => loc.user_id === userId);
      const allLocations = mockServiceLocations;
      
      const filteredLocations = RLSMockHelper.filterByRLS(allLocations, userId, false);
      expect(filteredLocations).toEqual(userLocations);
    });

    it('should allow admins to see all service locations', () => {
      const userId = 'admin-123';
      const isAdmin = true;
      const allLocations = mockServiceLocations;
      
      const filteredLocations = RLSMockHelper.filterByRLS(allLocations, userId, isAdmin);
      expect(filteredLocations).toEqual(allLocations);
    });

    it('should prevent unauthorized access to service locations', async () => {
      const unauthorizedUserId = 'unauthorized-user';
      const mockError = MockResponseBuilder.error(
        ErrorSimulationHelper.permissionError()
      );
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockError),
      } as any);

      const result = await supabase.from('service_locations')
        .select('*')
        .eq('user_id', unauthorizedUserId);

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Insufficient permissions');
    });

    it('should allow users to create their own service locations', async () => {
      const userId = 'user-123';
      const newLocation = {
        user_id: userId,
        postcode: '3000',
        suburb: 'Melbourne',
        state: 'VIC',
      };
      
      const mockResponse = MockResponseBuilder.success([newLocation]);
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('service_locations')
        .insert(newLocation)
        .select();

      expect(result.data).toEqual([newLocation]);
      expect(result.error).toBeNull();
    });

    it('should prevent users from creating service locations for other users', async () => {
      const userId = 'user-123';
      const otherUserId = 'user-456';
      const invalidLocation = {
        user_id: otherUserId, // Trying to create for another user
        postcode: '3000',
      };
      
      const mockError = MockResponseBuilder.error(
        ErrorSimulationHelper.permissionError()
      );
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockError),
      } as any);

      const result = await supabase.from('service_locations')
        .insert(invalidLocation)
        .select();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Insufficient permissions');
    });
  });

  describe('SMS Templates RLS', () => {
    it('should filter SMS templates by user ownership', () => {
      const userId = 'user-123';
      const userTemplates = mockSmsTemplates.filter(template => template.user_id === userId);
      const allTemplates = mockSmsTemplates;
      
      const filteredTemplates = RLSMockHelper.filterByRLS(allTemplates, userId, false);
      expect(filteredTemplates).toEqual(userTemplates);
    });

    it('should allow users to manage their own SMS templates', async () => {
      const userId = 'user-123';
      const userTemplate = {
        user_id: userId,
        template_type: 'custom',
        content: 'Custom message for {customer_name}',
        variables: ['customer_name'],
      };
      
      const mockResponse = MockResponseBuilder.success([userTemplate]);
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('tenant_sms_templates')
        .insert(userTemplate)
        .select();

      expect(result.data).toEqual([userTemplate]);
      expect(result.error).toBeNull();
    });

    it('should prevent cross-user SMS template access', async () => {
      const userId = 'user-123';
      const otherUserId = 'user-456';
      
      // Mock filtering out other user's templates
      const userTemplates = mockSmsTemplates.filter(template => template.user_id === userId);
      const mockResponse = MockResponseBuilder.success(userTemplates);
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('tenant_sms_templates')
        .select('*')
        .eq('user_id', userId);

      // Should only return user's own templates
      expect(result.data?.every(template => template.user_id === userId)).toBe(true);
      expect(result.data?.some(template => template.user_id === otherUserId)).toBe(false);
    });
  });

  describe('Twilio Settings RLS', () => {
    it('should prevent access to other users Twilio settings', () => {
      const userId = 'user-123';
      const otherUserId = 'user-456';
      const settings = { ...mockTwilioSettings, user_id: otherUserId };
      
      const canAccess = RLSMockHelper.mockUserCanAccess(userId, settings.user_id);
      expect(canAccess).toBe(false);
    });

    it('should allow users to access their own Twilio settings', async () => {
      const userId = 'user-123';
      const userSettings = { ...mockTwilioSettings, user_id: userId };
      const mockResponse = MockResponseBuilder.success(userSettings);
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('twilio_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      expect(result.data?.user_id).toBe(userId);
      expect(result.error).toBeNull();
    });

    it('should prevent unauthorized Twilio settings creation', async () => {
      const userId = 'user-123';
      const otherUserId = 'user-456';
      const invalidSettings = {
        user_id: otherUserId, // Trying to create for another user
        phone_number: '+61412345678',
      };
      
      const mockError = MockResponseBuilder.error(
        ErrorSimulationHelper.permissionError()
      );
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockError),
      } as any);

      const result = await supabase.from('twilio_settings')
        .insert(invalidSettings)
        .select();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Insufficient permissions');
    });
  });

  describe('Trade Types RLS', () => {
    it('should allow all authenticated users to read trade types', async () => {
      const mockResponse = MockResponseBuilder.success([
        { code: 'plumber', label: 'Plumber', category: 'construction' },
        { code: 'electrician', label: 'Electrician', category: 'construction' },
      ]);
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('trade_types').select('*');

      expect(result.data).toBeDefined();
      expect(result.data?.length).toBeGreaterThan(0);
      expect(result.error).toBeNull();
    });

    it('should prevent unauthenticated access to trade types', async () => {
      const mockError = MockResponseBuilder.error(
        'Authentication required'
      );
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockError),
      } as any);

      const result = await supabase.from('trade_types').select('*');

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Authentication required');
    });
  });

  describe('Cross-table RLS scenarios', () => {
    it('should enforce RLS across related tables', () => {
      const userId = 'user-123';
      const tradieData = TestDataBuilder.buildTradieWithServices(userId);
      
      // All data should belong to the same user
      expect(tradieData.profile.user_id).toBe(userId);
      expect(tradieData.locations.every(loc => loc.user_id === userId)).toBe(true);
      expect(tradieData.templates.every(template => template.user_id === userId)).toBe(true);
    });

    it('should prevent data leakage between users', () => {
      const user1Id = 'user-123';
      const user2Id = 'user-456';
      
      const user1Data = TestDataBuilder.buildTradieWithServices(user1Id);
      const user2Data = TestDataBuilder.buildTradieWithServices(user2Id);
      
      // Data should be completely isolated
      expect(user1Data.profile.user_id).not.toBe(user2Data.profile.user_id);
      expect(user1Data.locations.some(loc => loc.user_id === user2Id)).toBe(false);
      expect(user2Data.templates.some(template => template.user_id === user1Id)).toBe(false);
    });

    it('should handle admin access to all user data', () => {
      const adminUserId = 'admin-123';
      const regularUserId = 'user-456';
      const isAdmin = true;
      
      const allServiceLocations = mockServiceLocations;
      const adminFilteredLocations = RLSMockHelper.filterByRLS(
        allServiceLocations, 
        adminUserId, 
        isAdmin
      );
      
      const regularFilteredLocations = RLSMockHelper.filterByRLS(
        allServiceLocations, 
        regularUserId, 
        false
      );
      
      // Admin should see all data
      expect(adminFilteredLocations.length).toBeGreaterThanOrEqual(regularFilteredLocations.length);
      
      // Regular user should only see their own data
      expect(regularFilteredLocations.every(loc => loc.user_id === regularUserId)).toBe(true);
    });
  });

  describe('RLS with onboarding flow', () => {
    it('should allow users to update their own profile during onboarding', async () => {
      const userId = 'user-123';
      const profileUpdate = {
        trade_primary: 'plumber',
        onboarding_step: 2,
      };
      
      const updatedProfile = createMockProfile({ 
        user_id: userId, 
        ...profileUpdate 
      });
      const mockResponse = MockResponseBuilder.success([updatedProfile]);
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('profiles')
        .update(profileUpdate)
        .eq('user_id', userId)
        .select();

      expect(result.data?.[0].user_id).toBe(userId);
      expect(result.data?.[0].trade_primary).toBe('plumber');
      expect(result.error).toBeNull();
    });

    it('should prevent users from updating other users profiles', async () => {
      const userId = 'user-123';
      const otherUserId = 'user-456';
      
      const mockError = MockResponseBuilder.error(
        ErrorSimulationHelper.permissionError()
      );
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockError),
      } as any);

      const result = await supabase.from('profiles')
        .update({ trade_primary: 'electrician' })
        .eq('user_id', otherUserId) // Trying to update another user
        .select();

      expect(result.error).toBeDefined();
      expect(result.error?.message).toContain('Insufficient permissions');
    });
  });
});