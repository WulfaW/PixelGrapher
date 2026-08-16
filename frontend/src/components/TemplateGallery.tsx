import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { getAllTemplates } from '@/lib/templates';
import { useState, useEffect, memo } from 'react';

const TEMPLATES = getAllTemplates();

interface TemplateGalleryProps {
  onTemplateSelect?: (templateId: string) => void;
  onCustomUpload?: () => void;
}

// Helper to render mini grid preview
const MiniGridPreview = memo(function MiniGridPreview({ grid }: { grid: number[][] }) {
  const totalCommits = grid.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0);
  
  return (
    <div className="space-y-1">
      <div className="grid gap-[1px] bg-muted/20 p-1 rounded">
        {grid.map((row, i) => (
          <div key={i} className="flex gap-[1px]">
            {row.map((cell, j) => (
              <div
                key={j}
                className={cn(
                  "w-1.5 h-1.5 rounded-[1px]",
                  cell === 0 && "bg-muted/20",
                  cell === 1 && "bg-green-900/40",
                  cell === 2 && "bg-green-700/60",
                  cell === 3 && "bg-green-500/80",
                  cell === 4 && "bg-green-400"
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <Badge variant="secondary" className="text-[10px] w-full justify-center">
        ~{totalCommits} commits
      </Badge>
    </div>
  );
});

export default function TemplateGallery({ onTemplateSelect, onCustomUpload }: TemplateGalleryProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for better UX
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <Skeleton className="h-9 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Card key={i} className="p-4">
              <Skeleton className="h-32 w-full mb-3" />
              <Skeleton className="h-4 w-3/4 mx-auto mb-2" />
              <Skeleton className="h-3 w-full" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-semibold mb-2">Quick Start Templates</h2>
        <p className="text-muted-foreground">
          Click any template to load it into the canvas and start customizing
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {TEMPLATES.map((template) => (
          <Card
            key={template.id}
            className="p-4 cursor-pointer group relative overflow-hidden border border-border transition-colors duration-200 hover:border-primary/50 focus-within:ring-2 focus-within:ring-primary"
            onClick={() => {
              onTemplateSelect?.(template.id);
            }}
            data-testid={`card-template-${template.id}`}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onTemplateSelect?.(template.id);
              }
            }}
          >
            <div className="space-y-3">
              {/* Preview */}
              <div className="flex items-center justify-center p-2 bg-muted/30 rounded-lg">
                <MiniGridPreview grid={template.grid as number[][]} />
              </div>
              
              {/* Info */}
              <div className="space-y-1">
                <h3 className="font-semibold text-center text-sm">{template.name}</h3>
                <p className="text-xs text-muted-foreground text-center line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <Button size="sm" variant="secondary" data-testid={`button-use-${template.id}`}>
                Use Template
              </Button>
            </div>
          </Card>
        ))}

        <Card
          className="p-4 border-dashed border-2 hover-elevate active-elevate-2 cursor-pointer flex flex-col items-center justify-center min-h-[200px] transition-all"
          onClick={() => onCustomUpload?.()}
          data-testid="card-upload-custom"
        >
          <div className="text-4xl mb-3 text-muted-foreground">+</div>
          <h3 className="font-medium">Upload Custom</h3>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Add your own design
          </p>
        </Card>
      </div>
    </div>
  );
}
