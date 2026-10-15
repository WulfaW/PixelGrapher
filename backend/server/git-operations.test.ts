import { describe, it, expect } from 'vitest';
import { generateCommitPlan } from './git-operations';

const empty = () => Array.from({ length: 7 }, () => Array(53).fill(0));

describe('generateCommitPlan', () => {
  it('turns intensity into commit count on the right date', () => {
    const grid = empty();
    grid[1][1] = 3; // Monday of the second calendar column
    const plan = generateCommitPlan(grid, 2026, 1);
    expect(plan).toEqual([{ date: '2026-01-05', count: 3 }]);
  });

  it('multiplies by baseIntensity', () => {
    const grid = empty();
    grid[1][1] = 2;
    expect(generateCommitPlan(grid, 2026, 4)[0].count).toBe(8);
  });

  it('skips empty cells and days that fall outside the year', () => {
    const grid = empty();
    grid[0][0] = 4; // Sunday 2025-12-28 belongs to the previous year in the 2026 calendar
    expect(generateCommitPlan(grid, 2026, 1)).toEqual([]);
  });
});
