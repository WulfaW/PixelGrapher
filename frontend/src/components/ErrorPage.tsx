import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertTriangle, RotateCcw, Github, ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface ErrorPageProps {
  error?: Error;
  info?: string;
  onRetry?: () => void;
}

// Subtle ASCII watermark patterns (kept tiny & low contrast)
const WATERMARKS = [
  `  (╯°□°)╯︵ ┻━┻`,
  `  /\\_/\\  \n ( •.• )`,
  `  <ASCII/>`,
  `  ▓▓▓▓▓▓\n  ▓▓▓▓▓▓`,
  `  {***}`,
];

export default function ErrorPage({ error, info, onRetry }: ErrorPageProps) {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-red-50 to-orange-50 dark:from-gray-900 dark:via-red-950 dark:to-orange-950 p-4 overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-red-200/20 dark:bg-red-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-200/20 dark:bg-orange-800/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>
        
        {/* Floating squares */}
        <div className="absolute top-20 left-20 w-16 h-16 border-2 border-red-300/30 dark:border-red-700/30 rotate-45 animate-float"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-orange-300/30 dark:border-orange-700/30 rotate-12 animate-float-delayed"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 border-2 border-yellow-300/30 dark:border-yellow-700/30 -rotate-45 animate-float-slow"></div>
        
        {/* Dots pattern */}
        <div className="absolute top-40 right-1/4 flex gap-3">
          <div className="w-2 h-2 bg-red-400/40 dark:bg-red-600/40 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-orange-400/40 dark:bg-orange-600/40 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-yellow-400/40 dark:bg-yellow-600/40 rounded-full animate-bounce delay-200"></div>
        </div>
        
        {/* More decorative elements */}
        <div className="absolute bottom-40 left-1/4 w-20 h-20 border border-red-300/20 dark:border-red-700/20 rounded-lg rotate-6 animate-spin-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-gradient-to-br from-red-300/20 to-orange-300/20 dark:from-red-700/20 dark:to-orange-700/20 rounded-full animate-pulse"></div>
      </div>

      {/* Decorative ASCII watermarks */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.035] select-none">
        <div className="w-full h-full grid grid-cols-3 md:grid-cols-4 gap-8 p-8">
          {WATERMARKS.map((art, i) => (
            <pre
              key={i}
              className="font-mono text-[10px] whitespace-pre text-muted-foreground/70 animate-pulse [animation-duration:6s] [animation-iteration-count:infinite]"
              style={{ animationDelay: `${i * 600}ms` }}
            >
              {art}
            </pre>
          ))}
        </div>
      </div>

      <Card className="relative max-w-xl w-full p-8 space-y-6 text-center shadow-xl backdrop-blur-sm bg-background/90 z-10">
        <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold">Something went wrong</h1>
        <p className="text-muted-foreground text-sm">
          The application encountered an unexpected error. You can try reloading the page or report the issue on GitHub.
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          <Button size="sm" onClick={onRetry} data-testid="button-error-retry">
            <RotateCcw className="w-4 h-4 mr-2" /> Reload
          </Button>
          <Button size="sm" variant="outline" asChild data-testid="button-error-report">
            <a href="https://github.com/WulfaW/PixelGrapher/issues/new" target="_blank" rel="noopener noreferrer">
              <Github className="w-4 h-4 mr-2" /> Report Issue
            </a>
          </Button>
          {error && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowDetails(v => !v)}
              data-testid="button-error-details"
            >
              <ChevronDown className={`w-4 h-4 mr-1 transition-transform ${showDetails ? 'rotate-180' : ''}`} />
              Details
            </Button>
          )}
        </div>
        {showDetails && (
          <div className="mt-4 text-left space-y-2">
            {error && (
              <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48" data-testid="error-stack">
                {error.name}: {error.message}\n{error.stack}
              </pre>
            )}
            {info && (
              <pre className="text-[10px] bg-muted p-2 rounded overflow-auto max-h-32" data-testid="error-info">
                {info}
              </pre>
            )}
            <Button
              size="xs"
              variant="secondary"
              onClick={() => {
                const text = `${error?.name}: ${error?.message}\n${error?.stack}\n${info || ''}`;
                navigator.clipboard.writeText(text);
              }}
              data-testid="button-error-copy"
            >
              Copy
            </Button>
          </div>
        )}
        <p className="text-[11px] text-muted-foreground">If the issue persists, check the browser console for additional errors.</p>
      </Card>
      
      <style>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(45deg); }
              50% { transform: translateY(-20px) rotate(45deg); }
            }
        
            @keyframes float-delayed {
              0%, 100% { transform: translateY(0px) rotate(12deg); }
              50% { transform: translateY(-30px) rotate(12deg); }
            }
        
            @keyframes float-slow {
              0%, 100% { transform: translateY(0px) rotate(-45deg); }
              50% { transform: translateY(-15px) rotate(-45deg); }
            }
        
            @keyframes spin-slow {
              from { transform: rotate(6deg); }
              to { transform: rotate(366deg); }
            }
        
            .animate-float {
              animation: float 4s ease-in-out infinite;
            }
        
            .animate-float-delayed {
              animation: float-delayed 5s ease-in-out infinite;
            }
        
            .animate-float-slow {
              animation: float-slow 6s ease-in-out infinite;
            }
        
            .animate-spin-slow {
              animation: spin-slow 20s linear infinite;
            }
        
            .delay-100 {
              animation-delay: 0.1s;
            }
        
            .delay-200 {
              animation-delay: 0.2s;
            }
        
            .delay-700 {
              animation-delay: 0.7s;
            }
          `}</style>
    </div>
  );
}
