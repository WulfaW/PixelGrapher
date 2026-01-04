import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('merges class names and removes duplicates', () => {
    const merged = cn('px-2', 'py-2', 'px-2').split(' ');
    expect(new Set(merged)).toEqual(new Set(['px-2', 'py-2']));
    expect(merged.length).toBe(2);
  });

  it('handles conditional values and falsy inputs', () => {
    const show = false;
    expect(cn('base', show && 'hidden', undefined, null, false)).toBe('base');
  });
});
