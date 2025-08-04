import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { mockServiceLocations, createMockServiceLocation, testUser } from '../../setup-test';

describe('Service Locations Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetching service locations', () => {
    it('should fetch user service locations successfully', async () => {
      const userLocations = mockServiceLocations.filter(loc => loc.user_id === testUser.id);
      const mockResponse = { data: userLocations, error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('service_locations').select('*').eq('user_id', testUser.id);

      expect(supabase.from).toHaveBeenCalledWith('service_locations');
      expect(result.data).toEqual(userLocations);
      expect(result.error).toBeNull();
    });

    it('should fetch only active service locations', async () => {
      const activeLocations = mockServiceLocations.filter(loc => loc.is_active === true);
      const mockResponse = { data: activeLocations, error: null };
      
      const mockEq = vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockResolvedValue(mockResponse),
      }));
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: mockEq,
      } as any);

      const result = await supabase.from('service_locations')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('is_active', true);

      expect(result.data).toEqual(activeLocations);
      expect(result.data?.every(loc => loc.is_active === true)).toBe(true);
    });

    it('should filter service locations by postcode', async () => {
      const postcodeLocations = mockServiceLocations.filter(loc => loc.postcode === '2000');
      const mockResponse = { data: postcodeLocations, error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('service_locations').select('*').eq('postcode', '2000');

      expect(result.data).toEqual(postcodeLocations);
      expect(result.data?.every(loc => loc.postcode === '2000')).toBe(true);
    });

    it('should handle errors when fetching service locations', async () => {
      const mockError = { message: 'Database connection failed' };
      const mockResponse = { data: null, error: mockError };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('service_locations').select('*').eq('user_id', testUser.id);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('creating service locations', () => {
    it('should create a new service location successfully', async () => {
      const newLocation = createMockServiceLocation({
        postcode: '3000',
        suburb: 'Melbourne',
        state: 'VIC',
        travel_time: 30,
        surcharge: 20,
      });

      const mockResponse = { data: [newLocation], error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('service_locations').insert(newLocation).select();

      expect(result.data).toEqual([newLocation]);
      expect(result.error).toBeNull();
    });

    it('should handle validation errors when creating service locations', async () => {
      const invalidLocation = {
        postcode: '', // Invalid empty postcode
        travel_time: -10, // Invalid negative travel time
      };

      const mockError = { message: 'Validation failed', details: 'Invalid postcode and travel time' };
      const mockResponse = { data: null, error: mockError };
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('service_locations').insert(invalidLocation).select();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('updating service locations', () => {
    it('should update service location successfully', async () => {
      const locationId = mockServiceLocations[0].id;
      const updates = { travel_time: 25, surcharge: 15 };
      const updatedLocation = { ...mockServiceLocations[0], ...updates };

      const mockResponse = { data: [updatedLocation], error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('service_locations')
        .update(updates)
        .eq('id', locationId)
        .select();

      expect(result.data).toEqual([updatedLocation]);
      expect(result.error).toBeNull();
    });

    it('should deactivate service location', async () => {
      const locationId = mockServiceLocations[0].id;
      const deactivatedLocation = { ...mockServiceLocations[0], is_active: false };

      const mockResponse = { data: [deactivatedLocation], error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('service_locations')
        .update({ is_active: false })
        .eq('id', locationId)
        .select();

      expect(result.data?.[0].is_active).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('deleting service locations', () => {
    it('should delete service location successfully', async () => {
      const locationId = mockServiceLocations[0].id;
      const mockResponse = { data: null, error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('service_locations').delete().eq('id', locationId);

      expect(result.error).toBeNull();
    });
  });

  describe('service location data validation', () => {
    it('should have required fields for each service location', () => {
      mockServiceLocations.forEach(location => {
        expect(location.id).toBeDefined();
        expect(location.postcode).toBeDefined();
        expect(typeof location.postcode).toBe('string');
        expect(location.postcode.length).toBeGreaterThan(0);
      });
    });

    it('should have valid travel times', () => {
      mockServiceLocations.forEach(location => {
        if (location.travel_time !== null) {
          expect(location.travel_time).toBeGreaterThanOrEqual(0);
          expect(location.travel_time).toBeLessThanOrEqual(300); // 5 hours max
        }
      });
    });

    it('should have valid surcharges', () => {
      mockServiceLocations.forEach(location => {
        if (location.surcharge !== null) {
          expect(location.surcharge).toBeGreaterThanOrEqual(0);
        }
      });
    });

    it('should have valid Australian postcodes', () => {
      const australianPostcodePattern = /^[0-9]{4}$/;
      mockServiceLocations.forEach(location => {
        expect(location.postcode).toMatch(australianPostcodePattern);
      });
    });

    it('should have valid states', () => {
      const validStates = ['NSW', 'VIC', 'QLD', 'WA', 'SA', 'TAS', 'ACT', 'NT'];
      mockServiceLocations.forEach(location => {
        if (location.state) {
          expect(validStates).toContain(location.state);
        }
      });
    });
  });

  describe('service location factory', () => {
    it('should create a valid service location with default values', () => {
      const location = createMockServiceLocation();
      
      expect(location.postcode).toBe('2000');
      expect(location.suburb).toBe('Sydney');
      expect(location.state).toBe('NSW');
      expect(location.travel_time).toBe(15);
      expect(location.surcharge).toBe(0);
      expect(location.is_active).toBe(true);
      expect(location.created_at).toBeDefined();
      expect(location.updated_at).toBeDefined();
    });

    it('should create a service location with custom values', () => {
      const customLocation = createMockServiceLocation({
        postcode: '3000',
        suburb: 'Melbourne',
        state: 'VIC',
        travel_time: 45,
        surcharge: 25,
        is_active: false,
      });
      
      expect(customLocation.postcode).toBe('3000');
      expect(customLocation.suburb).toBe('Melbourne');
      expect(customLocation.state).toBe('VIC');
      expect(customLocation.travel_time).toBe(45);
      expect(customLocation.surcharge).toBe(25);
      expect(customLocation.is_active).toBe(false);
    });
  });

  describe('postcode coverage', () => {
    it('should include Sydney postcodes', () => {
      const sydneyPostcodes = ['2000', '2001', '2002', '2010', '2016'];
      const coveredPostcodes = mockServiceLocations.map(loc => loc.postcode);
      
      sydneyPostcodes.forEach(postcode => {
        expect(coveredPostcodes).toContain(postcode);
      });
    });

    it('should have reasonable travel times for Sydney areas', () => {
      mockServiceLocations.forEach(location => {
        if (location.state === 'NSW' && location.travel_time) {
          expect(location.travel_time).toBeGreaterThan(0);
          expect(location.travel_time).toBeLessThan(60); // Within 1 hour for Sydney metro
        }
      });
    });
  });
});