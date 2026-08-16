import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from '@/components/ui/dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle, Wand2 } from 'lucide-react';
import { generateTextPattern } from '@/lib/text-to-pattern';

type CellIntensity = 0 | 1 | 2 | 3 | 4;

interface TextToPatternProps {
  onPatternGenerated?: (pattern: CellIntensity[][]) => void;
  gridWidth?: number;
}

export default function TextToPattern({
  onPatternGenerated,
  gridWidth = 52
}: TextToPatternProps) {
  const [text, setText] = useState('');
  const [style, setStyle] = useState<'pristine' | 'clean' | 'realistic' | 'heavy'>('pristine');
  const [isGenerating, setIsGenerating] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [imgError, setImgError] = useState(false);

  const handleGenerate = () => {
    if (!text.trim()) return;

    setIsGenerating(true);

    // Simulate a brief delay for "AI processing" feel
    setTimeout(() => {
      const pattern = generateTextPattern({
        text: text.trim(),
        cols: gridWidth,
        rows: 7,
        baseIntensity: 4,
        backgroundNoise: style === 'pristine' ? 0 : style === 'clean' ? 0.05 : style === 'realistic' ? 0.2 : 0.35,
        noiseIntensity: style === 'heavy' ? 2 : 1,
        textAlignment: 'center',
        verticalAlign: 'middle',
        degradeText: style !== 'pristine',
      });

      onPatternGenerated?.(pattern);
      setIsGenerating(false);
    }, 300);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerate();
    }
  };

  return (
    <Card className="p-6">
      {/* Header with help button */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-muted">
            <Wand2 className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">AI Commit Artist</h3>
            <p className="text-sm text-muted-foreground">Turn text into natural-looking GitHub patterns</p>
          </div>
        </div>

        <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="How it works" className="shrink-0">
                    <HelpCircle className="w-5 h-5" />
                  </Button>
                </DialogTrigger>
              </TooltipTrigger>
              <TooltipContent>How does it work?</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DialogContent className="sm:max-w-[720px]">
            <DialogHeader>
              <DialogTitle>How does AI Commit Artist work?</DialogTitle>
              <DialogDescription>
                Places your text on a 7×52 grid using a compact 3×5 pixel font, then adds background noise for a natural look.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {!imgError ? (
                <img
                  src="/ai-commit-artist-demo.png"
                  alt="AI Commit Artist demo"
                  className="w-full rounded border"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="p-4 rounded border bg-muted/40">
                  <ol className="list-decimal list-inside text-sm space-y-1">
                    <li>Enter text (A-Z, 0-9, some symbols)</li>
                    <li>Choose style: Clean / Realistic / Heavy</li>
                    <li>Click Generate — grid fills automatically</li>
                    <li>Touch up manually if needed</li>
                  </ol>
                  <p className="text-xs text-muted-foreground mt-2">GIF not found — documentation: AI_COMMIT_ARTIST.md</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4 mt-4">
        <div className="grid gap-4 md:grid-cols-[1fr,auto,auto] items-start">
          <div className="space-y-2">
            <Label htmlFor="text-input">Your Text</Label>
            <Input
              id="text-input"
              type="text"
              placeholder="Type text (max 13 chars)"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              maxLength={13}
              className="font-mono"
              data-testid="input-ai-text"
            />
            <p className="text-xs text-muted-foreground">
              {text.length}/13 chars • A-Z, 0-9, space, !, ?, ., -, +, =
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="style-select">Style</Label>
            <Select value={style} onValueChange={(v: any) => setStyle(v)}>
              <SelectTrigger id="style-select" className="w-[140px]" data-testid="select-ai-style">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pristine">Pristine</SelectItem>
                <SelectItem value="clean">Clean</SelectItem>
                <SelectItem value="realistic">Realistic</SelectItem>
                <SelectItem value="heavy">Heavy</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {style === 'pristine' && 'Solid text, no noise'}
              {style === 'clean' && 'Minimal noise'}
              {style === 'realistic' && 'Natural look'}
              {style === 'heavy' && 'Lots of commits'}
            </p>
          </div>

          <div className="space-y-2">
            <Label className="opacity-0">Action</Label>
            <Button
              onClick={handleGenerate}
              disabled={!text.trim() || isGenerating}
              size="default"
              className="w-full md:w-auto h-10"
              data-testid="button-generate-ai-pattern"
            >
              {isGenerating ? (
                <>
                  <Wand2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Generate
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="pt-2 border-t">
          <div className="text-xs text-muted-foreground space-y-1">
            <p>Compact 3×5 font — fits ~13 characters across 52 weeks.</p>
            <p>Examples: "HELLO WORLD", "CODE 2025", "PIXEL"</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
