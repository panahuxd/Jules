import { describe, it, expect } from 'vitest';
import {
  getCurrentJalaliMonth,
  getPreviousJalaliMonth,
  getNextJalaliMonth,
  getJalaliMonthBoundaries,
  formatJalaliDate,
  formatJalaliTime
} from './dates';

describe('date utilities', () => {
  it('returns current date', () => {
    const d = getCurrentJalaliMonth();
    expect(d).toBeInstanceOf(Date);
  });

  it('calculates previous month correctly', () => {
    // Note: JS Date month is 0-indexed, so 5 is June
    const date = new Date(2023, 5, 15);
    const prev = getPreviousJalaliMonth(date);
    expect(prev.getMonth()).toBe(4); // May
  });

  it('calculates next month correctly', () => {
    const date = new Date(2023, 5, 15);
    const next = getNextJalaliMonth(date);
    expect(next.getMonth()).toBe(6); // July
  });

  it('gets valid month boundaries', () => {
    const date = new Date(2023, 5, 15);
    const bounds = getJalaliMonthBoundaries(date);
    expect(bounds.start).toBeInstanceOf(Date);
    expect(bounds.end).toBeInstanceOf(Date);
    expect(bounds.end.getTime()).toBeGreaterThan(bounds.start.getTime());
  });

  it('formats dates', () => {
    // date-fns-jalali converts Gregorian Date to Jalali string
    // e.g. 2023-06-15 is around 1402/03/25 depending on exact time
    const date = new Date(2023, 5, 15);
    const formatted = formatJalaliDate(date);
    expect(formatted).toMatch(/^\d{4}\/\d{2}\/\d{2}$/);
  });

  it('formats time', () => {
    const date = new Date(2023, 5, 15, 14, 30);
    const timeStr = formatJalaliTime(date);
    expect(timeStr).toBe('14:30');
  });

  it('returns empty string for null dates', () => {
    expect(formatJalaliDate(null)).toBe('');
    expect(formatJalaliTime(null)).toBe('');
  });
});
