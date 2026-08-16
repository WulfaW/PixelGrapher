import { useEffect, useMemo, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { parseAsciiToGrid, parseJsonToGrid } from '@/lib/imports';

type CellIntensity = 0 | 1 | 2 | 3 | 4;

interface UploadCustomDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (grid: CellIntensity[][]) => void;
}

function MiniGrid({ grid }: { grid: number[][] }) {
  const total = useMemo(() => grid.reduce((s, r) => s + r.reduce((a, b) => a + b, 0), 0), [grid]);
  return (
    <div className="space-y-2">
      <div className="grid gap-[1px] bg-muted/20 p-1 rounded max-w-full overflow-auto">
        {grid.map((row, i) => (
          <div key={i} className="flex gap-[1px]">
            {row.map((cell, j) => (
              <div
                key={j}
                className={cn(
                  'w-2 h-2 rounded-[1px]',
                  cell === 0 && 'bg-muted/20',
                  cell === 1 && 'bg-primary/30',
                  cell === 2 && 'bg-primary/50',
                  cell === 3 && 'bg-primary/75',
                  cell === 4 && 'bg-primary'
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <Badge variant="secondary" className="text-[10px]">~{total} commits</Badge>
    </div>
  );
}

export default function UploadCustomDialog({ open, onOpenChange, onApply }: UploadCustomDialogProps) {
  const [mode, setMode] = useState<'ascii' | 'json' | 'file'>('ascii');
  const [ascii, setAscii] = useState('');
  const [jsonText, setJsonText] = useState('');
  const [grid, setGrid] = useState<CellIntensity[][]>(Array.from({ length: 7 }, () => Array(52).fill(0)));
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setError('');
    try {
      if (mode === 'ascii' && ascii.trim().length) {
        setGrid(parseAsciiToGrid(ascii));
      } else if (mode === 'json' && jsonText.trim().length) {
        setGrid(parseJsonToGrid(jsonText));
      }
    } catch (e: any) {
      setError(e?.message || 'Invalid input');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ascii, jsonText, mode]);

  const handleFileChange = async (file?: File) => {
    if (!file) return;
    const text = await file.text();
    // Heuristic: try JSON first, otherwise parse as ASCII
    try {
      setGrid(parseJsonToGrid(text));
      setMode('json');
      setJsonText(text);
      setError('');
    } catch {
      try {
        setGrid(parseAsciiToGrid(text));
        setMode('ascii');
        setAscii(text);
        setError('');
      } catch (e: any) {
        setError('Unrecognized file content. Must be JSON or ASCII.');
      }
    }
  };

  const canApply = useMemo(() => grid.some(r => r.some(c => c > 0)) && !error, [grid, error]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Upload Custom Pattern</DialogTitle>
          <DialogDescription>Upload an ASCII or JSON grid. Automatically fits into a 7x52 canvas.</DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)}>
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="ascii">ASCII</TabsTrigger>
                <TabsTrigger value="json">JSON</TabsTrigger>
                <TabsTrigger value="file">File</TabsTrigger>
              </TabsList>

              <TabsContent value="ascii" className="space-y-2">
                <Textarea
                  placeholder={"ASCII örnek:\n\n..####..\n.######.\n########"}
                  value={ascii}
                  onChange={(e) => setAscii(e.target.value)}
                  rows={10}
                />
                <div className="text-xs text-muted-foreground">
                  Character mapping: . empty • #:4 • +:3 • *:2 • -:1
                </div>
              </TabsContent>

              <TabsContent value="json" className="space-y-2">
                <Textarea
                  placeholder={"JSON örnek:\n\n[[0,0,4,...],[...], ...]"}
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  rows={10}
                />
                <div className="text-xs text-muted-foreground">Accepts values from 0 to 4.</div>
              </TabsContent>

              <TabsContent value="file" className="space-y-2">
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.json"
                  onChange={(e) => handleFileChange(e.target.files?.[0] || undefined)}
                />
                <div className="text-xs text-muted-foreground">Upload a .txt (ASCII) or .json (grid) file</div>
              </TabsContent>
            </Tabs>

            {error && <div className="text-sm text-destructive">{error}</div>}
          </div>

          <div className="space-y-3">
            <div className="text-sm font-medium">Preview</div>
            <MiniGrid grid={grid} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button disabled={!canApply} onClick={() => { onApply(grid); onOpenChange(false); }}>Load to Canvas</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
