import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { memo } from 'react';

type CellIntensity = 0 | 1 | 2 | 3 | 4;

interface CommitPreviewProps {
  grid?: CellIntensity[][];
  className?: string;
}

const CommitPreview = memo(function CommitPreview({ grid, className }: CommitPreviewProps) {
  const WEEKS = 52;
  const DAYS_PER_WEEK = 7;
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const rawGrid = grid && grid.length > 0 
    ? grid 
    : Array(DAYS_PER_WEEK).fill(null).map(() => Array(WEEKS).fill(0 as CellIntensity));

  const displayGrid = rawGrid;

  // Determine which month each week belongs to
  const getMonthForWeek = (weekIndex: number): string => {
    const monthIndex = Math.min(Math.floor(weekIndex / 4.33), 11);
    return MONTHS[monthIndex];
  };

  // Get month boundaries
  const getMonthBoundaries = () => {
    const boundaries: { week: number; month: string; endWeek: number }[] = [];
    for (let i = 0; i < 12; i++) {
      const startWeek = Math.floor(i * WEEKS / 12);
      let endWeek = Math.floor((i + 1) * WEEKS / 12);
      // Ensure last month gets all remaining weeks
      if (i === 11) {
        endWeek = WEEKS;
      }
      boundaries.push({
        week: startWeek,
        month: MONTHS[i],
        endWeek: endWeek,
      });
    }
    return boundaries;
  };

  const monthBoundaries = getMonthBoundaries();

  // GitHub-style colors: light gray -> green gradient
  const getCellColor = (value: CellIntensity) => {
    const colors = [
      'bg-slate-200 dark:bg-slate-700', // No commits
      'bg-green-200 dark:bg-green-900', // 1 commit
      'bg-green-400 dark:bg-green-800', // 2 commits
      'bg-green-500 dark:bg-green-700', // 3 commits
      'bg-green-600 dark:bg-green-600', // 4+ commits
    ];
    return colors[value];
  };

  const totalCommits = rawGrid.reduce<number>(
    (total, row) => total + row.reduce<number>((sum, cell) => sum + cell, 0),
    0
  );

  return (
    <Card className={cn('p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800', className)}>
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold text-base mb-1">2025 Contribution Graph</h3>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            This is how your graph will look!
          </p>
        </div>

        <div className="overflow-x-auto flex justify-center">
          <div>
            {/* Month Labels - align with grid */}
            <div className="flex gap-0 mb-2">
              {/* Spacer for day labels column */}
              <div className="w-12 flex-shrink-0" />
              {/* Month labels - no wrapper, render directly */}
              <div className="flex gap-1">
                {/* Initial spacing to align Jan */}
                {Array.from({ length: 2 }).map((_, idx) => (
                  <div key={`spacer-${idx}`} className="w-5" />
                ))}
                {monthBoundaries.map((boundary, idx) => {
                  const monthWeeks = boundary.endWeek - boundary.week;
                  return Array.from({ length: monthWeeks }).map((_, weekIdx) => (
                    <div
                      key={`month-${idx}-week-${weekIdx}`}
                      className="w-5 text-xs font-medium text-slate-600 dark:text-slate-400 text-center flex items-start"
                    >
                      {weekIdx === 0 ? boundary.month : ''}
                    </div>
                  ));
                })}
              </div>
            </div>

            {/* Day Labels + Grid */}
            <div className="flex gap-1">
              {/* Day labels on left */}
              <div className="flex flex-col gap-1 flex-shrink-0 w-12">
                {DAYS.map((day, idx) => (
                  <div
                    key={`day-${idx}`}
                    className="text-xs font-medium text-slate-600 dark:text-slate-400 h-5 flex items-center justify-end pr-2"
                  >
                    {idx % 2 === 0 ? day.slice(0, 1) : ''}
                  </div>
                ))}
              </div>

              {/* Heatmap Grid */}
              <div className="flex gap-1">
                {Array.from({ length: WEEKS }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {Array.from({ length: DAYS_PER_WEEK }).map((_, dayIndex) => (
                      <div
                        key={`${dayIndex}-${weekIndex}`}
                        className={cn(
                          'w-5 h-5 rounded transition-all duration-200 hover:ring-1 ring-slate-400 dark:ring-slate-500 cursor-default',
                          getCellColor(displayGrid[dayIndex][weekIndex])
                        )}
                        title={`${displayGrid[dayIndex][weekIndex]} commits`}
                        data-testid={`preview-cell-${dayIndex}-${weekIndex}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-slate-400">Less</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3, 4].map((level) => (
                <div
                  key={level}
                  className={cn('w-3 h-3 rounded-sm', getCellColor(level as CellIntensity))}
                  title={`${level} commits`}
                />
              ))}
            </div>
            <span className="text-xs text-slate-600 dark:text-slate-400">More</span>
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-slate-100">{totalCommits}</span> contributions
          </div>
        </div>
        
        <div className="text-xs text-slate-500 dark:text-slate-500 text-center border-t border-slate-200 dark:border-slate-700 pt-2">
          Preview is for visual reference only. Actual commit dates may differ.
        </div>
      </div>
    </Card>
  );
});

export default CommitPreview;
