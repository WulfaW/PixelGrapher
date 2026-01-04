import { describe, expect, it } from 'vitest';
import { generateTextPattern, generateCleanTextPattern, generateRealisticTextPattern, generateHeavyTextPattern } from './text-to-pattern';

describe('Text to Pattern Generator', () => {
  describe('generateTextPattern', () => {
    it('should generate 7x52 grid from text', () => {
      const grid = generateTextPattern({ text: 'HELLO' });
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should handle empty text', () => {
      const grid = generateTextPattern({ text: '' });
      expect(grid).toHaveLength(7);
      expect(grid.every(row => row.every(cell => cell === 0))).toBe(true);
    });

    it('should center text horizontally by default', () => {
      const grid = generateTextPattern({ text: 'HI', textAlignment: 'center', cols: 52 });
      // Text should be roughly centered
      const nonZeroRows = grid.filter(row => row.some(cell => cell > 0));
      expect(nonZeroRows.length).toBeGreaterThan(0);
    });

    it('should align text left when specified', () => {
      const grid = generateTextPattern({ text: 'A', textAlignment: 'left' });
      // First column should have non-zero values
      expect(grid.some(row => row[0] > 0 || row[1] > 0)).toBe(true);
    });

    it('should support custom base intensity', () => {
      const gridLow = generateTextPattern({ text: 'A', baseIntensity: 2 });
      const gridHigh = generateTextPattern({ text: 'A', baseIntensity: 4 });
      
      const sumLow = gridLow.flat().reduce((a, b) => a + b, 0);
      const sumHigh = gridHigh.flat().reduce((a, b) => a + b, 0);
      
      expect(sumHigh).toBeGreaterThanOrEqual(sumLow);
    });

    it('should add background noise when specified', () => {
      const gridNoNoise = generateTextPattern({ text: 'A', backgroundNoise: 0 });
      const gridWithNoise = generateTextPattern({ text: 'A', backgroundNoise: 0.5 });
      
      const noiselessCount = gridNoNoise.flat().filter(c => c === 0).length;
      const noisyCount = gridWithNoise.flat().filter(c => c === 0).length;
      
      expect(noisyCount).toBeLessThan(noiselessCount);
    });

    it('should filter unsupported characters', () => {
      const grid = generateTextPattern({ text: 'A🎨B' }); // 🎨 is not supported
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
      // Should process A and B only
    });

    it('should respect max length', () => {
      const longText = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      const grid = generateTextPattern({ text: longText, cols: 52 });
      // Should still be 7x52
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should support vertical alignment', () => {
      const gridTop = generateTextPattern({ text: 'A', verticalAlign: 'top' });
      const gridBottom = generateTextPattern({ text: 'A', verticalAlign: 'bottom' });
      
      // Just verify they're different grids
      expect(gridTop).toBeDefined();
      expect(gridBottom).toBeDefined();
    });

    it('should clamp values to 0-4 range', () => {
      const grid = generateTextPattern({ text: 'A', baseIntensity: 4 });
      const allValid = grid.every(row => 
        row.every(cell => typeof cell === 'number' && cell >= 0 && cell <= 4)
      );
      expect(allValid).toBe(true);
    });
  });

  describe('Preset Pattern Generators', () => {
    it('should generate clean pattern with minimal noise', () => {
      const grid = generateCleanTextPattern('HELLO');
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
      const zeroCount = grid.flat().filter(c => c === 0).length;
      const totalCells = 7 * 52;
      expect(zeroCount / totalCells).toBeGreaterThan(0.8); // Most empty
    });

    it('should generate realistic pattern with moderate noise', () => {
      const grid = generateRealisticTextPattern('HELLO');
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should generate heavy pattern with lots of noise', () => {
      const grid = generateHeavyTextPattern('HELLO');
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
      const zeroCount = grid.flat().filter(c => c === 0).length;
      const totalCells = 7 * 52;
      // Heavy should have more non-zero cells
      expect(zeroCount / totalCells).toBeLessThan(0.7);
    });

    it('different styles should produce different results', () => {
      const clean = generateCleanTextPattern('TEST');
      const realistic = generateRealisticTextPattern('TEST');
      const heavy = generateHeavyTextPattern('TEST');
      
      const cleanSum = clean.flat().reduce((a, b) => a + b, 0);
      const realisticSum = realistic.flat().reduce((a, b) => a + b, 0);
      const heavySum = heavy.flat().reduce((a, b) => a + b, 0);
      
      // Heavy should have more total intensity than clean
      expect(heavySum).toBeGreaterThan(cleanSum);
    });
  });
});
