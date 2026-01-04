import { useState, useEffect } from 'react';

type CellIntensity = 0 | 1 | 2 | 3 | 4;

export interface SavedPattern {
  id: string;
  name: string;
  grid: CellIntensity[][];
  year?: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = 'pixelgrapher_patterns';
const MAX_PATTERNS = 10;

export function usePatternStorage() {
  const [patterns, setPatterns] = useState<SavedPattern[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load patterns from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedPattern[];
        setPatterns(parsed);
      }
    } catch (error) {
      console.error('Failed to load patterns:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save patterns to localStorage
  const persistPatterns = (newPatterns: SavedPattern[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPatterns));
      setPatterns(newPatterns);
    } catch (error) {
      console.error('Failed to save patterns:', error);
      throw error;
    }
  };

  const savePattern = (name: string, grid: CellIntensity[][], year?: number): SavedPattern => {
    const pattern: SavedPattern = {
      id: Date.now().toString(),
      name,
      grid: grid.map(row => [...row]),
      year,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const newPatterns = [pattern, ...patterns];
    
    // Keep only the most recent MAX_PATTERNS
    if (newPatterns.length > MAX_PATTERNS) {
      newPatterns.splice(MAX_PATTERNS);
    }

    persistPatterns(newPatterns);
    return pattern;
  };

  const updatePattern = (id: string, updates: Partial<Omit<SavedPattern, 'id' | 'createdAt'>>): boolean => {
    const index = patterns.findIndex(p => p.id === id);
    if (index === -1) return false;

    const updated = {
      ...patterns[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const newPatterns = [...patterns];
    newPatterns[index] = updated;
    persistPatterns(newPatterns);
    return true;
  };

  const deletePattern = (id: string): boolean => {
    const newPatterns = patterns.filter(p => p.id !== id);
    if (newPatterns.length === patterns.length) return false;
    
    persistPatterns(newPatterns);
    return true;
  };

  const getPattern = (id: string): SavedPattern | undefined => {
    return patterns.find(p => p.id === id);
  };

  const clearAll = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setPatterns([]);
    } catch (error) {
      console.error('Failed to clear patterns:', error);
      throw error;
    }
  };

  return {
    patterns,
    isLoading,
    savePattern,
    updatePattern,
    deletePattern,
    getPattern,
    clearAll,
  };
}
