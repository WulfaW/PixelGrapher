import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Pencil, Eraser, Trash2, Droplet, Undo2, Redo2, Download, Upload, Save, Image, Smartphone, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { usePatternStorage } from '@/hooks/use-pattern-storage';
import { dateForCell, getCalendarRange } from '../shared/calendar';
import GitHubPanel from './GitHubPanel';
import html2canvas from 'html2canvas';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const DAYS_PER_WEEK = 7;

type CellIntensity = 0 | 1 | 2 | 3 | 4;

interface AsciiCanvasProps {
  onGridChange?: (grid: CellIntensity[][]) => void;
  externalGrid?: CellIntensity[][];
  year?: string; // Selected year to align preview with GitHub's calendar weeks
  onGenerate?: (config: { repository: string; year: string; baseIntensity: number }) => void;
  onYearChange?: (year: string) => void;
}

export default function AsciiCanvas({ onGridChange, externalGrid, year, onGenerate, onYearChange }: AsciiCanvasProps) {
  const yearInt = year ? parseInt(year, 10) : undefined;
  const { savePattern } = usePatternStorage();

  const { startSunday, endSaturday, weeksCount } = getCalendarRange(yearInt || new Date().getFullYear());

  // Initialize grid with dynamic week count
  const [grid, setGrid] = useState<CellIntensity[][]>(
    Array(DAYS_PER_WEEK).fill(null).map(() => Array(weeksCount).fill(0))
  );
  const [tool, setTool] = useState<'draw' | 'erase'>('draw');
  const [intensity, setIntensity] = useState<CellIntensity>(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<CellIntensity[][][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Initialize history and notify parent once on mount
  useEffect(() => {
    onGridChange?.(grid);
    setHistory([grid]);
    setHistoryIndex(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizeToWeeks = (incoming: CellIntensity[][]): CellIntensity[][] => {
    const width = weeksCount;
    return Array(DAYS_PER_WEEK)
      .fill(null)
      .map((_, row) => {
        const sourceRow = incoming[row] || [];
        const padded = Array(width).fill(0) as CellIntensity[];
        for (let c = 0; c < width; c++) {
          const val = sourceRow[c] ?? 0;
          padded[c] = (val >= 0 && val <= 4 ? val : 0) as CellIntensity;
        }
        return padded;
      });
  };

  // Update grid when external grid changes
  useEffect(() => {
    if (externalGrid && externalGrid.length === DAYS_PER_WEEK) {
      // Prevent infinite loop by deep checking if the grid actually changed
      if (JSON.stringify(externalGrid) !== JSON.stringify(grid)) {
        const normalized = normalizeToWeeks(externalGrid as CellIntensity[][]);
        setGrid(normalized);
        
        // Only notify parent if our normalization actually changed the grid
        // (usually the parent already normalized it, so this avoids a loop)
        if (JSON.stringify(normalized) !== JSON.stringify(externalGrid)) {
          onGridChange?.(normalized);
        }
        
        // Add to history so user can undo external loads
        setHistory((prev) => {
          const newHistory = prev.slice(0, historyIndex + 1);
          newHistory.push(normalized);
          return newHistory;
        });
        setHistoryIndex((prev) => prev + 1);
      }
    }
  }, [externalGrid, weeksCount]);

  // Recreate grid when year (weeksCount) changes to align with calendar
  useEffect(() => {
    if (grid[0] && grid[0].length !== weeksCount) {
      const normalized = normalizeToWeeks(grid);
      setGrid(normalized);
      onGridChange?.(normalized);
      setHistory([normalized]);
      setHistoryIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weeksCount]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      const key = e.key.toLowerCase();

      if (e.ctrlKey || e.metaKey) {
        if (key === 's') {
          e.preventDefault();
          handleQuickSave();
        } else if (key === 'z' && !e.shiftKey) {
          e.preventDefault();
          handleUndo();
        } else if (key === 'z' && e.shiftKey || key === 'y') {
          e.preventDefault();
          handleRedo();
        }
      } else {
        switch (key) {
          case 'd':
            e.preventDefault();
            setTool('draw');
            toast({
              title: "Draw tool selected",
              description: "Click and drag to draw on the canvas",
            });
            break;
          case 'e':
            e.preventDefault();
            setTool('erase');
            toast({
              title: "Erase tool selected",
              description: "Click and drag to erase from the canvas",
            });
            break;
          case 'r':
            e.preventDefault();
            setTool('erase');
            toast({
              title: "Erase tool selected",
              description: "Click and drag to erase from the canvas",
            });
            break;
          case 'c':
            e.preventDefault();
            handleClear();
            toast({
              title: "Canvas cleared",
              description: "All cells have been reset",
            });
            break;
          case '1':
          case '2':
          case '3':
          case '4':
            e.preventDefault();
            setIntensity(parseInt(key) as CellIntensity);
            toast({
              title: `Intensity set to ${key}`,
              description: `Drawing with intensity level ${key}`,
            });
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [tool, historyIndex, history.length]);

  // Build a validity mask: which cells belong to the selected year
  const isCellValid = (dayIndex: number, weekIndex: number) => {
    if (!yearInt) return true;
    const date = dateForCell(dayIndex, weekIndex, { startSunday, endSaturday, weeksCount });
    return date.getUTCFullYear() === yearInt;
  };

  const getCellColor = (value: CellIntensity) => {
    const colors = [
      'bg-muted',
      'bg-primary/30',
      'bg-primary/50',
      'bg-primary/75',
      'bg-primary',
    ];
    return colors[value];
  };

  const handleCellInteraction = (dayIndex: number, weekIndex: number) => {
    // Prevent painting outside the selected year
    if (!isCellValid(dayIndex, weekIndex)) return;
    const newGrid = grid.map(row => [...row]);
    newGrid[dayIndex][weekIndex] = tool === 'draw' ? intensity : 0;
    setGrid(newGrid);
    onGridChange?.(newGrid);
    addToHistory(newGrid);
  };

  const addToHistory = (newGrid: CellIntensity[][]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newGrid.map(row => [...row]));
    if (newHistory.length > 50) newHistory.shift(); // Keep last 50 states
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      const prevGrid = history[newIndex];
      setGrid(prevGrid);
      onGridChange?.(prevGrid);
    } else {
      toast({
        title: "Nothing to undo",
        description: "No more actions to undo",
      });
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      const nextGrid = history[newIndex];
      setGrid(nextGrid);
      onGridChange?.(nextGrid);
    } else {
      toast({
        title: "Nothing to redo",
        description: "No more actions to redo",
      });
    }
  };

  const handleClear = () => {
    const width = grid[0]?.length || weeksCount;
    const emptyGrid = Array(DAYS_PER_WEEK).fill(null).map(() => Array(width).fill(0 as CellIntensity));
    setGrid(emptyGrid);
    onGridChange?.(emptyGrid);
    addToHistory(emptyGrid);
  };

  const handleQuickSave = () => {
    try {
      const timestamp = new Date().toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      const name = `Pattern ${timestamp}`;
      savePattern(name, grid, yearInt);
      toast({
        title: "Pattern saved",
        description: `Saved as "${name}"`,
      });
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Could not save pattern to storage",
        variant: "destructive",
      });
    }
  };

  const handleExport = () => {
    const data = {
      version: '1.0',
      grid,
      year: yearInt,
      exportDate: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pixelgrapher-pattern-${yearInt || 'custom'}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Pattern Exported",
      description: "Your pattern has been downloaded as JSON",
    });
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          if (!data.grid || !Array.isArray(data.grid)) {
            throw new Error('Invalid grid data');
          }

          // Validate grid structure
          if (data.grid.length !== DAYS_PER_WEEK) {
            throw new Error('Invalid grid dimensions');
          }

          const importedGrid = data.grid as CellIntensity[][];
          setGrid(importedGrid);
          onGridChange?.(importedGrid);
          addToHistory(importedGrid);

          toast({
            title: "Pattern Imported",
            description: "Your pattern has been loaded successfully",
          });
        } catch (error) {
          toast({
            title: "Import Failed",
            description: "Failed to load pattern. Invalid file format.",
            variant: "destructive",
          });
        }
      };

      reader.readAsText(file);
    };

    input.click();
  };

  const handleExportImage = async () => {
    if (!canvasRef.current) {
      toast({
        title: "Export Failed",
        description: "Canvas not found",
        variant: "destructive",
      });
      return;
    }

    try {
      // Find the canvas grid element
      const canvasElement = canvasRef.current;

      // Use html2canvas to capture the canvas
      const canvas = await html2canvas(canvasElement, {
        backgroundColor: '#000000', // Dark background
        scale: 3, // Higher quality
        logging: false,
        useCORS: true,
      });

      // Convert to blob and download
      canvas.toBlob((blob) => {
        if (!blob) {
          throw new Error('Failed to create image');
        }

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pixelgrapher-pattern-${yearInt || 'custom'}-${Date.now()}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        toast({
          title: "Image Exported",
          description: "Your pattern has been downloaded as PNG",
        });
      }, 'image/png');
    } catch (error) {
      console.error('Export image error:', error);
      toast({
        title: "Export Failed",
        description: "Failed to export image. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col gap-8">
        <div className="space-y-6 flex flex-col justify-center w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">Contribution Canvas</h2>
            
            {/* Mobile Warning */}
            <div className="sm:hidden flex items-center gap-2 text-amber-600 bg-amber-50 dark:bg-amber-950/30 dark:text-amber-400 p-2 rounded text-xs">
              <Smartphone className="w-4 h-4 shrink-0" />
              <span>For the best drawing experience, please use a desktop device.</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            {/* Drawing Tools */}
            <div className="flex gap-1.5">
              <Button
                size="sm"
                variant={tool === 'draw' ? 'default' : 'outline'}
                onClick={() => setTool('draw')}
                data-testid="button-draw-tool"
                title="Draw (D)"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Draw
              </Button>
              <Button
                size="sm"
                variant={tool === 'erase' ? 'default' : 'outline'}
                onClick={() => setTool('erase')}
                data-testid="button-erase-tool"
                title="Erase (R)"
              >
                <Eraser className="w-4 h-4 mr-2" />
                Erase
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* History & Clear */}
            <div className="flex gap-1.5">
              <Button
                size="icon"
                className="h-9 w-9"
                variant="outline"
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                title="Undo (Ctrl+Z)"
              >
                <Undo2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                className="h-9 w-9"
                variant="outline"
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                title="Redo (Ctrl+Y)"
              >
                <Redo2 className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                className="h-9 w-9"
                variant="outline"
                onClick={handleClear}
                title="Clear (C)"
                data-testid="button-clear-canvas"
              >
                <Trash2 className="w-4 h-4 text-destructive" />
              </Button>
            </div>

            <div className="w-px h-6 bg-border mx-1" />

            {/* File Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="gap-2">
                  <Save className="w-4 h-4" />
                  File
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuItem onClick={handleQuickSave} className="cursor-pointer">
                  <Save className="w-4 h-4 mr-2" />
                  Save to Browser
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleImport} className="cursor-pointer">
                  <Upload className="w-4 h-4 mr-2" />
                  Import JSON
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExport} className="cursor-pointer">
                  <Download className="w-4 h-4 mr-2" />
                  Export JSON
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleExportImage} className="cursor-pointer">
                  <Image className="w-4 h-4 mr-2" />
                  Export as PNG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-2">
              <Droplet className="w-4 h-4 text-muted-foreground" />
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((level) => (
                  <button
                    key={level}
                    onClick={() => setIntensity(level as CellIntensity)}
                    className={cn(
                      'w-8 h-8 rounded border-2 transition-all flex items-center justify-center text-xs font-semibold group relative',
                      getCellColor(level as CellIntensity),
                      intensity === level ? 'border-primary scale-110 text-primary-foreground' : 'border-transparent text-muted-foreground/50 hover:scale-125 hover:border-primary/50 hover:text-primary'
                    )}
                    data-testid={`button-intensity-${level}`}
                    title={`Intensity ${level} (${level})`}
                  >
                    {level}
                    <span className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-primary text-primary-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                      Press {level}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="w-full">
            <div ref={canvasRef} className="border border-border rounded-md p-3 w-full overflow-hidden">
              <div className="flex justify-between w-full h-full gap-px">
                {Array.from({ length: grid[0]?.length || weeksCount }).map((_, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-px flex-1">
                    {Array.from({ length: DAYS_PER_WEEK }).map((_, dayIndex) => (
                      <div
                        key={`${dayIndex}-${weekIndex}`}
                        className={cn(
                          'w-full aspect-square rounded-[1px] transition-all duration-200',
                          isCellValid(dayIndex, weekIndex)
                            ? cn('cursor-pointer hover:ring-2 hover:ring-primary hover:ring-offset-1 hover:scale-125 hover:z-10', getCellColor(grid[dayIndex][weekIndex]))
                            : 'cursor-not-allowed bg-muted/30'
                        )}
                        onMouseDown={() => {
                          setIsDrawing(true);
                          handleCellInteraction(dayIndex, weekIndex);
                        }}
                        onMouseEnter={() => {
                          if (isDrawing) {
                            handleCellInteraction(dayIndex, weekIndex);
                          }
                        }}
                        onMouseUp={() => setIsDrawing(false)}
                        data-testid={`cell-${dayIndex}-${weekIndex}`}
                        role="button"
                        tabIndex={isCellValid(dayIndex, weekIndex) ? 0 : -1}
                        aria-label={`Cell at day ${dayIndex + 1}, week ${weekIndex + 1}, intensity ${grid[dayIndex][weekIndex]}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleCellInteraction(dayIndex, weekIndex);
                          }
                        }}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* GitHub Panel below */}
        <div className="w-full">
          <GitHubPanel
            onGenerate={onGenerate}
            grid={grid}
            onYearChange={onYearChange}
          />
        </div>
      </div>
    </Card>
  );
}
