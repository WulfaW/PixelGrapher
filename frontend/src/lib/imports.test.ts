import { describe, expect, it } from 'vitest';
import { parseAsciiToGrid, parseJsonToGrid } from './imports';

describe('Grid Import Utilities', () => {
  describe('parseAsciiToGrid', () => {
    it('should parse simple ASCII pattern to grid', () => {
      const ascii = `###
###
###`;
      const grid = parseAsciiToGrid(ascii);
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should map high intensity characters', () => {
      // Test that high intensity chars map to 4
      const ascii = `###`;
      const grid = parseAsciiToGrid(ascii);
      expect(grid.some(row => row.some(cell => cell === 4))).toBe(true);
    });

    it('should map low intensity characters', () => {
      // Test that low intensity chars map to lower values
      const ascii = `---`;
      const grid = parseAsciiToGrid(ascii);
      // After resize, should have some cells with intensity 1
      expect(grid.some(row => row.some(cell => cell > 0))).toBe(true);
    });

    it('should handle empty characters as 0', () => {
      const ascii = `#.#`;
      const grid = parseAsciiToGrid(ascii);
      // Should have mix of 0 and non-0
      expect(grid.some(row => row.some(cell => cell === 0))).toBe(true);
      expect(grid.some(row => row.some(cell => cell > 0))).toBe(true);
    });

    it('should resize to 7x52 grid', () => {
      const ascii = Array(10).fill(Array(30).fill('#')).map(row => row.join('')).join('\n');
      const grid = parseAsciiToGrid(ascii);
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should throw error on empty input', () => {
      expect(() => parseAsciiToGrid('')).toThrow('ASCII metin boş');
      expect(() => parseAsciiToGrid('\n\n')).toThrow('ASCII metin boş');
    });

    it('should support character mapping', () => {
      const ascii = `#@X`;
      const grid = parseAsciiToGrid(ascii);
      // Just verify it doesn't throw and produces valid grid
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
      // Should have some non-zero cells from the # and @
      expect(grid.some(row => row.some(cell => cell > 0))).toBe(true);
    });
  });

  describe('parseJsonToGrid', () => {
    it('should parse valid JSON grid', () => {
      const json = JSON.stringify([
        [0, 1, 2, 3, 4],
        [4, 3, 2, 1, 0],
        [1, 2, 3, 4, 1],
      ]);
      const grid = parseJsonToGrid(json);
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should clamp values to valid range', () => {
      const json = JSON.stringify([
        [0, 4, -1, 5],
      ]);
      const grid = parseJsonToGrid(json);
      // Grid values should be 0-4
      const allValid = grid.every(row => 
        row.every(cell => typeof cell === 'number' && cell >= 0 && cell <= 4)
      );
      expect(allValid).toBe(true);
    });

    it('should throw on invalid JSON', () => {
      expect(() => parseJsonToGrid('not valid json')).toThrow('JSON parse edilemedi');
    });

    it('should throw on non-array input', () => {
      const json = JSON.stringify({ grid: [[1, 2, 3]] });
      expect(() => parseJsonToGrid(json)).toThrow('JSON formatı geçersiz');
    });

    it('should handle non-numeric values', () => {
      const json = JSON.stringify([['a', 'b', 'c']]);
      const grid = parseJsonToGrid(json);
      // Non-numeric values convert to 0 via clamp
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should resize to 7x52 grid', () => {
      const small = Array(3).fill(null).map(() => Array(10).fill(2));
      const json = JSON.stringify(small);
      const grid = parseJsonToGrid(json);
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });
  });
});
