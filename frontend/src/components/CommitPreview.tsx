import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { memo, useState } from 'react';

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

  // GitHub Theme Colors
  const THEMES = {
    light: [
      '#ebedf0', // 0
      '#9be9a8', // 1
      '#40c463', // 2
      '#30a14e', // 3
      '#216e39', // 4
    ],
    dark: [
      '#161b22', // 0
      '#0e4429', // 1
      '#006d32', // 2
      '#26a641', // 3
      '#39d353', // 4
    ],
    dimmed: [
      '#22272e', // 0
      '#444c56', // 1
      '#539bf5', // 2
      '#539bf5', // 3 (GitHub usually uses same or very similar)
      '#539bf5', // 4
    ]
  };

  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');

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
    return THEMES[previewTheme][value];
  };

  const totalCommits = rawGrid.reduce<number>(
    (total, row) => total + row.reduce<number>((sum, cell) => sum + cell, 0),
    0
  );

  return (
    <Card className={cn('p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base mb-1">Preview</h3>
            <p className="text-xs text-muted-foreground">
              See how it looks on GitHub
            </p>
          </div>
          <div className="flex bg-muted p-1 rounded-lg">
            <button
              onClick={() => setPreviewTheme('light')}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-all",
                previewTheme === 'light' ? "bg-white shadow-sm text-black" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Light
            </button>
            <button
              onClick={() => setPreviewTheme('dark')}
              className={cn(
                "px-3 py-1 text-xs rounded-md transition-all",
                previewTheme === 'dark' ? "bg-slate-800 shadow-sm text-white" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Dark
            </button>
          </div>
        </div>

        <div
          className={cn(
            "overflow-x-auto flex justify-center p-4 rounded-lg border transition-colors duration-300",
            previewTheme === 'dark' ? "bg-[#0d1117] border-[#30363d]" : "bg-white border-[#d0d7de]"
          )}
        >
          <div>
            {/* Month Labels - align with grid */}
            <div className="flex gap-0 mb-2">
              {/* Spacer for day labels column */}
              <div className="w-8 flex-shrink-0" /> {/* Reduced width to align better */}
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
                        className="w-[10px] h-[10px] rounded-[2px] cursor-default transition-colors duration-200"
                        style={{ backgroundColor: getCellColor(displayGrid[dayIndex][weekIndex]) }}
                        title={`${displayGrid[dayIndex][weekIndex]} commits on ${monthBoundaries.find(b => weekIndex >= b.week && weekIndex < b.endWeek)?.month} (Week ${weekIndex + 1})`}
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
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{ backgroundColor: getCellColor(level as CellIntensity) }}
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
