import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

// GitHub contribution graph mini-preview — cycles through pixel patterns
const PIXEL_PATTERNS = [
  // heart
  [
    [0,1,1,0,1,1,0],
    [1,1,1,1,1,1,1],
    [1,1,1,1,1,1,1],
    [0,1,1,1,1,1,0],
    [0,0,1,1,1,0,0],
    [0,0,0,1,0,0,0],
  ],
  // smile
  [
    [0,1,1,0,1,1,0],
    [0,1,1,0,1,1,0],
    [0,0,0,0,0,0,0],
    [1,0,0,0,0,0,1],
    [0,1,0,0,0,1,0],
    [0,0,1,1,1,0,0],
  ],
  // star
  [
    [0,0,0,1,0,0,0],
    [0,1,0,1,0,1,0],
    [0,0,1,1,1,0,0],
    [1,1,1,1,1,1,1],
    [0,0,1,1,1,0,0],
    [0,1,0,0,0,1,0],
  ],
];

// Tailwind intensity classes for perfect theme matching (Light/Dark mode)
const INTENSITY_CLASSES = ['bg-muted', 'bg-primary/30', 'bg-primary/50', 'bg-primary/75', 'bg-primary'];

export default function AnimatedHero({ onGetStarted, onTemplateScroll }: { onGetStarted?: () => void; onTemplateScroll?: () => void }) {
  const [currentPattern, setCurrentPattern] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      setCurrentPattern(prev => (prev + 1) % PIXEL_PATTERNS.length);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const pattern = PIXEL_PATTERNS[currentPattern];

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      {/* Static hero glow — radial green, 5% opacity, no animation */}
      <div
        className="absolute inset-x-0 top-0 h-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 0%, hsl(var(--primary) / 0.08), transparent 70%)' }}
      />
      <div
        className={`relative z-10 max-w-5xl mx-auto px-4 text-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        {/* Pixel art mini-preview */}
        <div className="flex justify-center mb-10">
          <div
            className="grid gap-[3px] p-3 rounded-xl border bg-card shadow-sm"
            style={{ gridTemplateColumns: `repeat(${pattern[0].length}, 1fr)` }}
          >
            {pattern.map((row, r) =>
              row.map((cell, c) => (
                <div
                  key={`${currentPattern}-${r}-${c}`}
                  className={`w-4 h-4 rounded-sm transition-colors duration-500 ${INTENSITY_CLASSES[cell ? 4 : 0]}`}
                />
              ))
            )}
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
          Paint your{' '}
          <span className="text-primary">GitHub Graph</span>
        </h1>

        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
          Draw pixel art or type text — we turn it into real GitHub contribution commits on your profile.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button
            size="lg"
            className="text-base px-8 h-12"
            onClick={onGetStarted}
            data-testid="button-get-started"
          >
            Start Creating
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="text-base px-8 h-12"
            onClick={onTemplateScroll}
            data-testid="button-view-templates"
          >
            View Templates
          </Button>
        </div>
      </div>
    </div>
  );
}
