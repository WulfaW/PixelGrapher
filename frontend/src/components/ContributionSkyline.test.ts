import { describe, it, expect } from 'vitest';
import { buildGrid, computeStats, levelOf, dayMs } from './ContributionSkyline';

const end = dayMs('2026-12-26'); // a Saturday

describe('ContributionSkyline pure helpers', () => {
  it('shows exactly `weeks` columns when the end is a week boundary', () => {
    expect(buildGrid([], end, 0, 52).weeks).toBe(52);
    expect(buildGrid([], end, 0, 53).weeks).toBe(53);
  });

  it('uses a given level instead of deriving it from the count', () => {
    const data = [
      { date: '2026-12-20', count: 1, level: 1 },
      { date: '2026-12-21', count: 2, level: 2 },
      { date: '2026-12-22', count: 3, level: 3 },
      { date: '2026-12-23', count: 4, level: 4 },
    ];
    const levels = buildGrid(data, end, 0, 52).cells.filter((c) => c.count > 0).map((c) => c.level);
    expect(levels).toEqual([1, 2, 3, 4]);
  });

  it('derives levels from counts when no level is given', () => {
    expect(levelOf(0, 10)).toBe(0);
    expect(levelOf(1, 10)).toBe(1);
    expect(levelOf(10, 10)).toBe(4);
  });

  it('computes totals and streaks', () => {
    const { cells } = buildGrid(
      [
        { date: '2026-12-19', count: 2 },
        { date: '2026-12-20', count: 3 },
        { date: '2026-12-21', count: 1 },
        { date: '2026-12-26', count: 5 },
      ],
      end, 0, 52,
    );
    const s = computeStats(cells);
    expect(s.total).toBe(11);
    expect(s.busiest.count).toBe(5);
    expect(s.longest.days).toBe(3);
    expect(s.current.days).toBe(1);
  });
});
