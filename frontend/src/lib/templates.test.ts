import { describe, expect, it } from 'vitest';
import { getAllTemplates, getTemplate } from './templates';

describe('Templates', () => {
  describe('getTemplate', () => {
    it('should return HELLO template', () => {
      const grid = getTemplate('hello');
      expect(grid).toBeDefined();
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
      expect(grid.some(row => row.some(cell => cell > 0))).toBe(true);
    });

    it('should return Heart template', () => {
      const grid = getTemplate('heart');
      expect(grid).toBeDefined();
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should return Cat template', () => {
      const grid = getTemplate('cat');
      expect(grid).toBeDefined();
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should return Mountains template', () => {
      const grid = getTemplate('mountains');
      expect(grid).toBeDefined();
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should return Wave template', () => {
      const grid = getTemplate('wave');
      expect(grid).toBeDefined();
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should return Gradient template', () => {
      const grid = getTemplate('gradient');
      expect(grid).toBeDefined();
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should return Pixel template', () => {
      const grid = getTemplate('pixel');
      expect(grid).toBeDefined();
      expect(grid).toHaveLength(7);
      expect(grid[0]).toHaveLength(52);
    });

    it('should return null for non-existent template', () => {
      const grid = getTemplate('non-existent');
      expect(grid).toBeNull();
    });

    it('all templates should contain pixels', () => {
      const templates = ['hello', 'heart', 'cat', 'mountains', 'wave', 'gradient', 'pixel'];
      templates.forEach(id => {
        const grid = getTemplate(id);
        const hasPixels = grid!.some(row => row.some(cell => cell > 0));
        expect(hasPixels).toBe(true);
      });
    });

    it('all templates should have intensity values 0-4', () => {
      const templates = ['hello', 'heart', 'cat', 'mountains', 'wave', 'gradient', 'pixel'];
      templates.forEach(id => {
        const grid = getTemplate(id);
        const allValid = grid!.every(row =>
          row.every(cell => typeof cell === 'number' && cell >= 0 && cell <= 4)
        );
        expect(allValid).toBe(true);
      });
    });
  });

  describe('getAllTemplates', () => {
    it('should return array of all templates', () => {
      const templates = getAllTemplates();
      expect(Array.isArray(templates)).toBe(true);
      expect(templates.length).toBeGreaterThan(0);
    });

    it('should return templates with id, name, description, grid', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template).toHaveProperty('id');
        expect(template).toHaveProperty('name');
        expect(template).toHaveProperty('description');
        expect(template).toHaveProperty('grid');
        expect(typeof template.id).toBe('string');
        expect(typeof template.name).toBe('string');
        expect(typeof template.description).toBe('string');
        expect(Array.isArray(template.grid)).toBe(true);
      });
    });

    it('should have meaningful descriptions', () => {
      const templates = getAllTemplates();
      templates.forEach(template => {
        expect(template.description.length).toBeGreaterThan(0);
      });
    });

    it('should have at least 7 templates', () => {
      const templates = getAllTemplates();
      expect(templates.length).toBeGreaterThanOrEqual(7);
    });
  });
});
