import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { mockTradeTypes, createMockTradeType } from '../../setup-test';

describe('Trade Types Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetching trade types', () => {
    it('should fetch all trade types successfully', async () => {
      const mockResponse = { data: mockTradeTypes, error: null };
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('trade_types').select('*');

      expect(supabase.from).toHaveBeenCalledWith('trade_types');
      expect(result.data).toEqual(mockTradeTypes);
      expect(result.error).toBeNull();
    });

    it('should filter trade types by category', async () => {
      const constructionTrades = mockTradeTypes.filter(t => t.category === 'construction');
      const mockResponse = { data: constructionTrades, error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('trade_types').select('*').eq('category', 'construction');

      expect(result.data).toEqual(constructionTrades);
      expect(result.data?.length).toBeGreaterThan(0);
      expect(result.data?.every(t => t.category === 'construction')).toBe(true);
    });

    it('should filter trade types by urgency', async () => {
      const highUrgencyTrades = mockTradeTypes.filter(t => t.typical_urgency === 'high');
      const mockResponse = { data: highUrgencyTrades, error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('trade_types').select('*').eq('typical_urgency', 'high');

      expect(result.data).toEqual(highUrgencyTrades);
      expect(result.data?.every(t => t.typical_urgency === 'high')).toBe(true);
    });

    it('should handle errors when fetching trade types', async () => {
      const mockError = { message: 'Database connection failed' };
      const mockResponse = { data: null, error: mockError };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('trade_types').select('*');

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('trade type data validation', () => {
    it('should have required fields for each trade type', () => {
      mockTradeTypes.forEach(tradeType => {
        expect(tradeType.code).toBeDefined();
        expect(tradeType.label).toBeDefined();
        expect(typeof tradeType.code).toBe('string');
        expect(typeof tradeType.label).toBe('string');
      });
    });

    it('should have valid urgency levels', () => {
      const validUrgencyLevels = ['low', 'medium', 'high'];
      mockTradeTypes.forEach(tradeType => {
        if (tradeType.typical_urgency) {
          expect(validUrgencyLevels).toContain(tradeType.typical_urgency);
        }
      });
    });

    it('should have valid categories', () => {
      const validCategories = ['construction', 'maintenance', 'outdoor', 'security', 'finishing'];
      mockTradeTypes.forEach(tradeType => {
        if (tradeType.category) {
          expect(validCategories).toContain(tradeType.category);
        }
      });
    });
  });

  describe('specific trade types', () => {
    it('should include plumber as a high urgency construction trade', () => {
      const plumber = mockTradeTypes.find(t => t.code === 'plumber');
      expect(plumber).toBeDefined();
      expect(plumber?.label).toBe('Plumber');
      expect(plumber?.category).toBe('construction');
      expect(plumber?.typical_urgency).toBe('high');
      expect(plumber?.icon_name).toBe('wrench');
    });

    it('should include electrician as a high urgency construction trade', () => {
      const electrician = mockTradeTypes.find(t => t.code === 'electrician');
      expect(electrician).toBeDefined();
      expect(electrician?.label).toBe('Electrician');
      expect(electrician?.category).toBe('construction');
      expect(electrician?.typical_urgency).toBe('high');
      expect(electrician?.icon_name).toBe('zap');
    });

    it('should include locksmith as a high urgency security trade', () => {
      const locksmith = mockTradeTypes.find(t => t.code === 'locksmith');
      expect(locksmith).toBeDefined();
      expect(locksmith?.label).toBe('Locksmith');
      expect(locksmith?.category).toBe('security');
      expect(locksmith?.typical_urgency).toBe('high');
      expect(locksmith?.icon_name).toBe('lock');
    });
  });

  describe('trade type factory', () => {
    it('should create a valid trade type with default values', () => {
      const tradeType = createMockTradeType();
      
      expect(tradeType.code).toBe('plumber');
      expect(tradeType.label).toBe('Plumber');
      expect(tradeType.category).toBe('construction');
      expect(tradeType.typical_urgency).toBe('high');
      expect(tradeType.icon_name).toBe('wrench');
      expect(tradeType.created_at).toBeDefined();
      expect(tradeType.updated_at).toBeDefined();
    });

    it('should create a trade type with custom values', () => {
      const customTradeType = createMockTradeType({
        code: 'custom_trade',
        label: 'Custom Trade',
        category: 'maintenance',
        typical_urgency: 'medium',
        icon_name: 'custom_icon',
      });
      
      expect(customTradeType.code).toBe('custom_trade');
      expect(customTradeType.label).toBe('Custom Trade');
      expect(customTradeType.category).toBe('maintenance');
      expect(customTradeType.typical_urgency).toBe('medium');
      expect(customTradeType.icon_name).toBe('custom_icon');
    });
  });
});