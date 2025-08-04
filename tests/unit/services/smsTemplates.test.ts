import { describe, it, expect, vi, beforeEach } from 'vitest';
import { supabase } from '@/integrations/supabase/client';
import { mockSmsTemplates, createMockSmsTemplate, testUser } from '../../setup-test';

describe('SMS Templates Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('fetching SMS templates', () => {
    it('should fetch user SMS templates successfully', async () => {
      const userTemplates = mockSmsTemplates.filter(template => template.user_id === testUser.id);
      const mockResponse = { data: userTemplates, error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('tenant_sms_templates').select('*').eq('user_id', testUser.id);

      expect(supabase.from).toHaveBeenCalledWith('tenant_sms_templates');
      expect(result.data).toEqual(userTemplates);
      expect(result.error).toBeNull();
    });

    it('should fetch only active SMS templates', async () => {
      const activeTemplates = mockSmsTemplates.filter(template => template.is_active === true);
      const mockResponse = { data: activeTemplates, error: null };
      
      const mockEq = vi.fn().mockImplementation(() => ({
        eq: vi.fn().mockResolvedValue(mockResponse),
      }));
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: mockEq,
      } as any);

      const result = await supabase.from('tenant_sms_templates')
        .select('*')
        .eq('user_id', testUser.id)
        .eq('is_active', true);

      expect(result.data).toEqual(activeTemplates);
      expect(result.data?.every(template => template.is_active === true)).toBe(true);
    });

    it('should filter SMS templates by type', async () => {
      const missedCallTemplates = mockSmsTemplates.filter(template => template.template_type === 'missed_call');
      const mockResponse = { data: missedCallTemplates, error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('tenant_sms_templates').select('*').eq('template_type', 'missed_call');

      expect(result.data).toEqual(missedCallTemplates);
      expect(result.data?.every(template => template.template_type === 'missed_call')).toBe(true);
    });

    it('should handle errors when fetching SMS templates', async () => {
      const mockError = { message: 'Database connection failed' };
      const mockResponse = { data: null, error: mockError };
      
      vi.mocked(supabase.from).mockReturnValue({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('tenant_sms_templates').select('*').eq('user_id', testUser.id);

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('creating SMS templates', () => {
    it('should create a new SMS template successfully', async () => {
      const newTemplate = createMockSmsTemplate({
        template_type: 'custom',
        content: 'Custom message for {customer_name}',
        variables: ['customer_name'],
      });

      const mockResponse = { data: [newTemplate], error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('tenant_sms_templates').insert(newTemplate).select();

      expect(result.data).toEqual([newTemplate]);
      expect(result.error).toBeNull();
    });

    it('should handle validation errors when creating SMS templates', async () => {
      const invalidTemplate = {
        template_type: '', // Invalid empty type
        content: 'x'.repeat(1700), // Content too long (over 1600 chars)
      };

      const mockError = { message: 'Validation failed', details: 'Template type required and content too long' };
      const mockResponse = { data: null, error: mockError };
      
      vi.mocked(supabase.from).mockReturnValue({
        insert: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('tenant_sms_templates').insert(invalidTemplate).select();

      expect(result.data).toBeNull();
      expect(result.error).toEqual(mockError);
    });
  });

  describe('updating SMS templates', () => {
    it('should update SMS template successfully', async () => {
      const templateId = mockSmsTemplates[0].id;
      const updates = { 
        content: 'Updated message for {customer_name}',
        variables: ['customer_name', 'business_name']
      };
      const updatedTemplate = { ...mockSmsTemplates[0], ...updates };

      const mockResponse = { data: [updatedTemplate], error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('tenant_sms_templates')
        .update(updates)
        .eq('id', templateId)
        .select();

      expect(result.data).toEqual([updatedTemplate]);
      expect(result.error).toBeNull();
    });

    it('should deactivate SMS template', async () => {
      const templateId = mockSmsTemplates[0].id;
      const deactivatedTemplate = { ...mockSmsTemplates[0], is_active: false };

      const mockResponse = { data: [deactivatedTemplate], error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        update: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        select: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('tenant_sms_templates')
        .update({ is_active: false })
        .eq('id', templateId)
        .select();

      expect(result.data?.[0].is_active).toBe(false);
      expect(result.error).toBeNull();
    });
  });

  describe('deleting SMS templates', () => {
    it('should delete SMS template successfully', async () => {
      const templateId = mockSmsTemplates[0].id;
      const mockResponse = { data: null, error: null };
      
      vi.mocked(supabase.from).mockReturnValue({
        delete: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue(mockResponse),
      } as any);

      const result = await supabase.from('tenant_sms_templates').delete().eq('id', templateId);

      expect(result.error).toBeNull();
    });
  });

  describe('SMS template data validation', () => {
    it('should have required fields for each SMS template', () => {
      mockSmsTemplates.forEach(template => {
        expect(template.id).toBeDefined();
        expect(template.template_type).toBeDefined();
        expect(template.content).toBeDefined();
        expect(typeof template.template_type).toBe('string');
        expect(typeof template.content).toBe('string');
        expect(template.content.length).toBeGreaterThan(0);
      });
    });

    it('should have valid template types', () => {
      const validTypes = [
        'missed_call', 
        'after_hours', 
        'job_confirmation', 
        'appointment_reminder', 
        'follow_up', 
        'quote_ready', 
        'invoice_sent'
      ];
      
      mockSmsTemplates.forEach(template => {
        expect(validTypes).toContain(template.template_type);
      });
    });

    it('should have content within SMS length limits', () => {
      mockSmsTemplates.forEach(template => {
        expect(template.content.length).toBeLessThanOrEqual(1600);
      });
    });

    it('should have variables array when variables are defined', () => {
      mockSmsTemplates.forEach(template => {
        if (template.variables) {
          expect(Array.isArray(template.variables)).toBe(true);
        }
      });
    });
  });

  describe('template variable parsing', () => {
    it('should contain valid variable placeholders in content', () => {
      mockSmsTemplates.forEach(template => {
        if (template.variables && template.variables.length > 0) {
          template.variables.forEach(variable => {
            const placeholder = `{${variable}}`;
            expect(template.content).toContain(placeholder);
          });
        }
      });
    });

    it('should have common variables like customer_name and business_name', () => {
      const allVariables = mockSmsTemplates
        .flatMap(template => template.variables || [])
        .filter((v, i, arr) => arr.indexOf(v) === i); // unique values

      expect(allVariables).toContain('customer_name');
      expect(allVariables).toContain('business_name');
    });
  });

  describe('specific template types', () => {
    it('should have missed_call template with appropriate content', () => {
      const missedCallTemplate = mockSmsTemplates.find(t => t.template_type === 'missed_call');
      expect(missedCallTemplate).toBeDefined();
      expect(missedCallTemplate?.content).toContain('missed your call');
      expect(missedCallTemplate?.variables).toContain('customer_name');
      expect(missedCallTemplate?.variables).toContain('business_name');
      expect(missedCallTemplate?.variables).toContain('callback_window');
    });

    it('should have after_hours template with appropriate content', () => {
      const afterHoursTemplate = mockSmsTemplates.find(t => t.template_type === 'after_hours');
      expect(afterHoursTemplate).toBeDefined();
      expect(afterHoursTemplate?.content).toContain('closed');
      expect(afterHoursTemplate?.variables).toContain('business_name');
    });

    it('should have job_confirmation template with appropriate content', () => {
      const jobConfirmationTemplate = mockSmsTemplates.find(t => t.template_type === 'job_confirmation');
      expect(jobConfirmationTemplate).toBeDefined();
      expect(jobConfirmationTemplate?.content).toContain('received your request');
      expect(jobConfirmationTemplate?.variables).toContain('customer_name');
      expect(jobConfirmationTemplate?.variables).toContain('job_type');
      expect(jobConfirmationTemplate?.variables).toContain('location');
    });

    it('should have quote_ready template with appropriate content', () => {
      const quoteTemplate = mockSmsTemplates.find(t => t.template_type === 'quote_ready');
      expect(quoteTemplate).toBeDefined();
      expect(quoteTemplate?.content).toContain('quote');
      expect(quoteTemplate?.variables).toContain('customer_name');
      expect(quoteTemplate?.variables).toContain('quote_amount');
    });
  });

  describe('SMS template factory', () => {
    it('should create a valid SMS template with default values', () => {
      const template = createMockSmsTemplate();
      
      expect(template.template_type).toBe('missed_call');
      expect(template.content).toContain('{customer_name}');
      expect(template.content).toContain('{business_name}');
      expect(template.variables).toEqual(['customer_name', 'business_name', 'callback_window']);
      expect(template.is_active).toBe(true);
      expect(template.created_at).toBeDefined();
      expect(template.updated_at).toBeDefined();
    });

    it('should create an SMS template with custom values', () => {
      const customTemplate = createMockSmsTemplate({
        template_type: 'custom',
        content: 'Hello {customer_name}, this is {business_name}',
        variables: ['customer_name', 'business_name'],
        is_active: false,
      });
      
      expect(customTemplate.template_type).toBe('custom');
      expect(customTemplate.content).toBe('Hello {customer_name}, this is {business_name}');
      expect(customTemplate.variables).toEqual(['customer_name', 'business_name']);
      expect(customTemplate.is_active).toBe(false);
    });
  });

  describe('creating default templates', () => {
    it('should mock default template creation function', async () => {
      const mockResponse = { data: null, error: null };
      
      vi.mocked(supabase.rpc).mockResolvedValue(mockResponse);

      const result = await supabase.rpc('create_default_sms_templates', { target_user_id: testUser.id });

      expect(supabase.rpc).toHaveBeenCalledWith('create_default_sms_templates', { target_user_id: testUser.id });
      expect(result.error).toBeNull();
    });
  });
});