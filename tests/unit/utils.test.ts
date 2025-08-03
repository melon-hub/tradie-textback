import { describe, it, expect } from 'vitest';

// Test utility functions
describe('Utility Functions', () => {
  describe('Phone Number Formatting', () => {
    const formatPhone = (phone: string) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10 && cleaned.startsWith('04')) {
        return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`;
      }
      return phone;
    };

    it('should format valid Australian mobile numbers', () => {
      expect(formatPhone('0412345678')).toBe('0412 345 678');
      expect(formatPhone('0498765432')).toBe('0498 765 432');
    });

    it('should not format invalid numbers', () => {
      expect(formatPhone('1234567890')).toBe('1234567890');
      expect(formatPhone('041234567')).toBe('041234567'); // Too short
    });

    it('should handle numbers with existing formatting', () => {
      expect(formatPhone('0412 345 678')).toBe('0412 345 678');
    });
  });

  describe('Date Formatting', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-01-15T10:30:00Z');
      const formatted = date.toLocaleDateString('en-AU');
      expect(formatted).toMatch(/15\/01\/2024|1\/15\/2024/); // Handle different locales
    });
  });

  describe('Status Helpers', () => {
    const getStatusColor = (status: string) => {
      const colors: Record<string, string> = {
        new: 'blue',
        contacted: 'yellow',
        completed: 'green',
        cancelled: 'red',
      };
      return colors[status] || 'gray';
    };

    it('should return correct colors for job statuses', () => {
      expect(getStatusColor('new')).toBe('blue');
      expect(getStatusColor('completed')).toBe('green');
      expect(getStatusColor('unknown')).toBe('gray');
    });
  });
});