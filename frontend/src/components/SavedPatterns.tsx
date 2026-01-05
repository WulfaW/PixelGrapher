import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { usePatternStorage, SavedPattern } from '@/hooks/use-pattern-storage';
import { Trash2, Clock, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';

type CellIntensity = 0 | 1 | 2 | 3 | 4;

interface SavedPatternsProps {
  onLoadPattern?: (grid: CellIntensity[][], year?: number) => void;
}

export default function SavedPatterns({ onLoadPattern }: SavedPatternsProps) {
  const { patterns, isLoading, deletePattern } = usePatternStorage();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleLoad = (pattern: SavedPattern) => {
    onLoadPattern?.(pattern.grid, pattern.year);
    toast({
      title: "Pattern loaded",
      description: `"${pattern.name}" has been loaded`,
    });
  };

  const handleDelete = (id: string, name: string) => {
    if (deletePattern(id)) {
      toast({
        title: "Pattern deleted",
        description: `"${name}" has been removed`,
      });
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Saved Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Loading patterns...</p>
        </CardContent>
      </Card>
    );
  }

  if (patterns.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Saved Patterns
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No saved patterns yet. Use Ctrl+S or the Save button to save your current pattern.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Saved Patterns
          <span className="text-sm font-normal text-muted-foreground ml-auto">
            {patterns.length}/10
          </span>
        </CardTitle>
        <div className="mt-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search patterns..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {patterns
              .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
              .map((pattern) => (
              <div
                key={pattern.id}
                className="border rounded-lg p-3 hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  {/* Mini preview */}
                  <div className="flex-shrink-0 bg-muted rounded p-1">
                    <div className="flex gap-[1px]">
                      {Array.from({ length: 13 }).map((_, weekIndex) => (
                        <div key={weekIndex} className="flex flex-col gap-[1px]">
                          {Array.from({ length: 7 }).map((_, dayIndex) => {
                            const weekIdx = Math.floor((weekIndex / 13) * pattern.grid[0].length);
                            const value = pattern.grid[dayIndex]?.[weekIdx] || 0;
                            return (
                              <div
                                key={`${dayIndex}-${weekIndex}`}
                                className={`w-1 h-1 rounded-[1px] ${getCellColor(value as CellIntensity)}`}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm truncate">{pattern.name}</h4>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(pattern.updatedAt)}
                      {pattern.year && ` • Year ${pattern.year}`}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleLoad(pattern)}
                      className="h-8"
                    >
                      Load
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(pattern.id, pattern.name)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
