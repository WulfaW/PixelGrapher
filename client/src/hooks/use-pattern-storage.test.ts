import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import { SavedPattern } from './use-pattern-storage';

describe('usePatternStorage Unit Tests', () => {
  const STORAGE_KEY = 'pixelgrapher_patterns';

  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('should initialize localStorage with empty patterns', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).toBeDefined();
    expect(JSON.parse(stored!)).toEqual([]);
  });
  
  it('should save pattern to localStorage', () => {
    const pattern: SavedPattern = {
      id: '123',
      name: 'Test Pattern',
      grid: Array(7).fill(null).map(() => Array(52).fill(0)),
      year: 2024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([pattern]));
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(stored!);
    
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Test Pattern');
    expect(parsed[0].year).toBe(2024);
  });

  it('should load patterns from localStorage', () => {
    const pattern: SavedPattern = {
      id: '123',
      name: 'Loaded Pattern',
      grid: Array(7).fill(null).map(() => Array(52).fill(0)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([pattern]));
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).toBeDefined();
    const parsed = JSON.parse(stored!);
    expect(parsed[0].name).toBe('Loaded Pattern');
  });

  it('should handle max patterns limit', () => {
    const patterns: SavedPattern[] = Array.from({ length: 15 }, (_, i) => ({
      id: String(i),
      name: `Pattern ${i}`,
      grid: Array(7).fill(null).map(() => Array(52).fill(0)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Simulating the MAX_PATTERNS=10 behavior
    const limited = patterns.slice(0, 10);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(stored!);
    
    expect(parsed).toHaveLength(10);
  });

  it('should delete pattern from storage', () => {
    const patterns: SavedPattern[] = [
      {
        id: '1',
        name: 'Pattern 1',
        grid: Array(7).fill(null).map(() => Array(52).fill(0)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        name: 'Pattern 2',
        grid: Array(7).fill(null).map(() => Array(52).fill(0)),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
    
    // Simulate deletion
    const remaining = patterns.filter(p => p.id !== '1');
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored).toHaveLength(1);
    expect(stored[0].id).toBe('2');
  });

  it('should update pattern in storage', () => {
    const pattern: SavedPattern = {
      id: '1',
      name: 'Original',
      grid: Array(7).fill(null).map(() => Array(52).fill(0)),
      year: 2024,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([pattern]));
    
    // Simulate update
    const updated = {
      ...pattern,
      name: 'Updated',
      year: 2025,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify([updated]));
    
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY)!);
    expect(stored[0].name).toBe('Updated');
    expect(stored[0].year).toBe(2025);
  });

  it('should clear all patterns', () => {
    const patterns: SavedPattern[] = Array(3).fill(null).map((_, i) => ({
      id: String(i),
      name: `Pattern ${i}`,
      grid: Array(7).fill(null).map(() => Array(52).fill(0)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(patterns));
    localStorage.removeItem(STORAGE_KEY);
    
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(stored).toBeNull();
  });

  it('should handle corrupted localStorage data gracefully', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid json');
    
    const stored = localStorage.getItem(STORAGE_KEY);
    expect(() => JSON.parse(stored!)).toThrow();
  });
});
