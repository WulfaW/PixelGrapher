import { describe, expect, it } from 'vitest';
import { getCalendarRange, dateForCell } from './calendar';

describe('Calendar Utilities', () => {
  describe('getCalendarRange', () => {
    it('should return calendar range for a given year', () => {
      const range = getCalendarRange(2024);
      expect(range).toHaveProperty('startSunday');
      expect(range).toHaveProperty('endSaturday');
      expect(range).toHaveProperty('weeksCount');
    });

    it('should have startSunday before endSaturday', () => {
      const range = getCalendarRange(2024);
      expect(range.startSunday.getTime()).toBeLessThan(range.endSaturday.getTime());
    });

    it('should start on a Sunday', () => {
      const range = getCalendarRange(2024);
      expect(range.startSunday.getUTCDay()).toBe(0); // 0 = Sunday
    });

    it('should end on a Saturday', () => {
      const range = getCalendarRange(2024);
      expect(range.endSaturday.getUTCDay()).toBe(6); // 6 = Saturday
    });

    it('should have 52 or 53 weeks', () => {
      const range = getCalendarRange(2024);
      expect(range.weeksCount).toBeGreaterThanOrEqual(52);
      expect(range.weeksCount).toBeLessThanOrEqual(53);
    });

    it('should include January 1st of the target year', () => {
      const range = getCalendarRange(2024);
      const jan1 = new Date(Date.UTC(2024, 0, 1));
      expect(range.startSunday.getTime()).toBeLessThanOrEqual(jan1.getTime());
      expect(range.endSaturday.getTime()).toBeGreaterThanOrEqual(jan1.getTime());
    });

    it('should include December 31st of the target year', () => {
      const range = getCalendarRange(2024);
      const dec31 = new Date(Date.UTC(2024, 11, 31));
      expect(range.startSunday.getTime()).toBeLessThanOrEqual(dec31.getTime());
      expect(range.endSaturday.getTime()).toBeGreaterThanOrEqual(dec31.getTime());
    });

    it('should work for different years', () => {
      const range2023 = getCalendarRange(2023);
      const range2024 = getCalendarRange(2024);
      const range2025 = getCalendarRange(2025);

      expect(range2023.startSunday.getUTCFullYear()).toBeLessThanOrEqual(2023);
      expect(range2024.startSunday.getUTCFullYear()).toBeLessThanOrEqual(2024);
      expect(range2025.startSunday.getUTCFullYear()).toBeLessThanOrEqual(2025);
    });
  });

  describe('dateForCell', () => {
    it('should return a date for valid cell coordinates', () => {
      const range = getCalendarRange(2024);
      const date = dateForCell(0, 0, range);
      expect(date instanceof Date).toBe(true);
      expect(date.getTime()).toBeGreaterThan(0);
    });

    it('should return Sunday for day index 0', () => {
      const range = getCalendarRange(2024);
      const date = dateForCell(0, 0, range);
      expect(date.getUTCDay()).toBe(0); // Sunday
    });

    it('should return Monday for day index 1', () => {
      const range = getCalendarRange(2024);
      const date = dateForCell(1, 0, range);
      expect(date.getUTCDay()).toBe(1); // Monday
    });

    it('should return Saturday for day index 6', () => {
      const range = getCalendarRange(2024);
      const date = dateForCell(6, 0, range);
      expect(date.getUTCDay()).toBe(6); // Saturday
    });

    it('should increment date by week for week index', () => {
      const range = getCalendarRange(2024);
      const date0 = dateForCell(0, 0, range);
      const date1 = dateForCell(0, 1, range);
      
      const diffMs = date1.getTime() - date0.getTime();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBe(7);
    });

    it('should return dates within the calendar range', () => {
      const range = getCalendarRange(2024);
      const date = dateForCell(3, 25, range);
      expect(date.getTime()).toBeGreaterThanOrEqual(range.startSunday.getTime());
      expect(date.getTime()).toBeLessThanOrEqual(range.endSaturday.getTime());
    });

    it('should be consistent across multiple calls', () => {
      const range = getCalendarRange(2024);
      const date1 = dateForCell(3, 10, range);
      const date2 = dateForCell(3, 10, range);
      expect(date1.getTime()).toBe(date2.getTime());
    });

    it('should work for all valid day indices (0-6)', () => {
      const range = getCalendarRange(2024);
      for (let day = 0; day < 7; day++) {
        const date = dateForCell(day, 0, range);
        expect(date.getUTCDay()).toBe(day);
      }
    });

    it('should work for all weeks in range', () => {
      const range = getCalendarRange(2024);
      for (let week = 0; week < range.weeksCount; week++) {
        const date = dateForCell(0, week, range);
        expect(date instanceof Date).toBe(true);
        expect(date.getUTCDay()).toBe(0);
      }
    });
  });
});
