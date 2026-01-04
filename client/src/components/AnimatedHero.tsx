import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';

const ASCII_PATTERNS = [
  `   ∧＿∧
  ( ･ω･)
  ⊃⊃ `,
  `  /\\_/\\
 ( o.o )
  > ^ <`,
  `  █▀▀▄
  █▄▄▀
  ▀  ▀`,
];

export default function AnimatedHero({ onGetStarted, onTemplateScroll }: { onGetStarted?: () => void; onTemplateScroll?: () => void }) {
  const [currentPattern, setCurrentPattern] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const interval = setInterval(() => {
      setCurrentPattern((prev) => (prev + 1) % ASCII_PATTERNS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
      
      <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
        <pre className="font-mono text-primary text-4xl md:text-6xl whitespace-pre transition-opacity duration-1000">
          {ASCII_PATTERNS[currentPattern]}
        </pre>
      </div>

      <div 
        className={`relative z-10 max-w-5xl mx-auto px-4 text-center transition-all duration-700 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <h1 className="text-5xl md:text-7xl font-bold mb-6">
          ASCII Art to{' '}
          <span className="bg-gradient-to-r from-primary via-chart-2 to-primary bg-clip-text text-transparent">
            GitHub Graph
          </span>
        </h1>
        
        <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto">
          Transform your creative ASCII art into stunning GitHub contribution patterns. 
          Draw, customize, and generate commits to paint your profile.
        </p>

        <div className="flex flex-wrap gap-4 justify-center">
          <Button 
            size="lg" 
            className="text-lg px-8"
            onClick={onGetStarted}
            data-testid="button-get-started"
          >
            Start Creating
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            className="text-lg px-8 backdrop-blur-sm"
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
