import { describe, it, expect } from 'vitest';
import { normalizeDigits, parseAmount, formatToman } from './numbers';

describe('number utilities', () => {
  describe('normalizeDigits', () => {
    it('converts Persian digits to Latin', () => {
      expect(normalizeDigits('۱۲۳۴۵۶۷۸۹۰')).toBe('1234567890');
    });

    it('converts Arabic digits to Latin', () => {
      expect(normalizeDigits('١٢٣٤٥٦٧٨٩٠')).toBe('1234567890');
    });

    it('leaves Latin digits alone', () => {
      expect(normalizeDigits('1234567890')).toBe('1234567890');
    });

    it('handles mixed strings', () => {
      expect(normalizeDigits('۱۲3٤5۶7٨9۰')).toBe('1234567890');
      expect(normalizeDigits('تومان ۱۲۳')).toBe('تومان 123');
    });
  });

  describe('parseAmount', () => {
    it('parses formatted string with commas to number', () => {
      expect(parseAmount('123,456')).toBe(123456);
    });

    it('parses Persian string with commas to number', () => {
      expect(parseAmount('۱۲۳,۴۵۶')).toBe(123456);
    });

    it('returns 0 for invalid string', () => {
      expect(parseAmount('invalid')).toBe(0);
      expect(parseAmount('')).toBe(0);
    });
  });

  describe('formatToman', () => {
    it('formats number correctly with Persian locales and adds تومان', () => {
      // Depending on Node version and ICU data, exact string might differ slightly in whitespace,
      // but should contain the localized numbers and comma equivalent.
      const formatted = formatToman(123456);
      expect(formatted).toContain('تومان');
      expect(formatted.replace(/\s+/g, '')).toMatch(/(۱۲۳٬۴۵۶|123,456)تومان/);
    });

    it('handles string numbers', () => {
      const formatted = formatToman('123456');
      expect(formatted.replace(/\s+/g, '')).toMatch(/(۱۲۳٬۴۵۶|123,456)تومان/);
    });

    it('handles Persian string numbers', () => {
      const formatted = formatToman('۱۲۳۴۵۶');
      expect(formatted.replace(/\s+/g, '')).toMatch(/(۱۲۳٬۴۵۶|123,456)تومان/);
    });

    it('returns empty string for null/undefined', () => {
      expect(formatToman(null)).toBe('');
      expect(formatToman(undefined)).toBe('');
    });
  });
});
