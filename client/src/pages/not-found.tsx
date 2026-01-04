import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 dark:from-gray-900 dark:via-blue-950 dark:to-purple-950 relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-200/20 dark:bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-200/20 dark:bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
        
        {/* Grid pattern - Main background grid */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>

        {/* GitHub-style pixel grid patterns */}
        <div className="absolute top-10 left-10 opacity-20 dark:opacity-30">
          <div className="grid gap-0.5" style={{ width: '200px', gridTemplateColumns: 'repeat(20, 8px)' }}>
            {Array.from({ length: 140 }).map((_, i) => {
              const intensity = Math.random();
              const bgColor = intensity > 0.7 ? 'bg-green-500' : intensity > 0.4 ? 'bg-green-300' : intensity > 0.2 ? 'bg-green-100' : 'bg-green-50';
              return (
                <div
                  key={i}
                  className={`w-2 h-2 ${bgColor} rounded-sm animate-pixel-fade`}
                  style={{ animationDelay: `${i * 0.01}s` }}
                />
              );
            })}
          </div>
        </div>

        {/* Another pixel grid on the right */}
        <div className="absolute bottom-20 right-10 opacity-20 dark:opacity-30">
          <div className="grid gap-0.5" style={{ width: '160px', gridTemplateColumns: 'repeat(15, 8px)' }}>
            {Array.from({ length: 105 }).map((_, i) => {
              const intensity = Math.random();
              const bgColor = intensity > 0.7 ? 'bg-blue-500' : intensity > 0.4 ? 'bg-blue-300' : intensity > 0.2 ? 'bg-blue-100' : 'bg-blue-50';
              return (
                <div
                  key={i}
                  className={`w-2 h-2 ${bgColor} rounded-sm animate-pixel-fade`}
                  style={{ animationDelay: `${i * 0.015}s` }}
                />
              );
            })}
          </div>
        </div>

        {/* Pixel art "404" pattern - simplified */}
        <div className="absolute top-1/3 left-1/4 opacity-10 dark:opacity-20">
          <div className="flex gap-4 text-6xl font-bold tracking-wider" style={{ 
            fontFamily: 'monospace',
            textShadow: '2px 2px 0px currentColor, 4px 4px 0px currentColor'
          }}>
            404
          </div>
        </div>
        
        {/* Floating squares */}
        <div className="absolute top-20 left-20 w-16 h-16 border-2 border-blue-300/30 dark:border-blue-500/40 rotate-45 animate-float"></div>
        <div className="absolute bottom-32 right-32 w-24 h-24 border-2 border-purple-300/30 dark:border-purple-500/40 rotate-12 animate-float-delayed"></div>
        <div className="absolute top-1/2 right-20 w-12 h-12 border-2 border-pink-300/30 dark:border-pink-500/40 -rotate-45 animate-float-slow"></div>
        
        {/* Dots pattern */}
        <div className="absolute top-40 right-1/4 flex gap-3">
          <div className="w-2 h-2 bg-blue-400/40 dark:bg-blue-500/50 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-purple-400/40 dark:bg-purple-500/50 rounded-full animate-bounce delay-100"></div>
          <div className="w-2 h-2 bg-pink-400/40 dark:bg-pink-500/50 rounded-full animate-bounce delay-200"></div>
        </div>

        {/* Pixel squares scattered */}
        <div className="absolute top-1/4 right-1/3 w-3 h-3 bg-green-400/30 dark:bg-green-500/40 animate-pulse delay-300"></div>
        <div className="absolute bottom-1/3 left-1/3 w-4 h-4 bg-blue-400/30 dark:bg-blue-500/40 rounded-sm animate-pulse delay-500"></div>
        <div className="absolute top-2/3 right-1/4 w-3 h-3 bg-purple-400/30 dark:bg-purple-500/40 animate-pulse delay-400"></div>
        
        {/* More decorative elements */}
        <div className="absolute bottom-40 left-1/4 w-20 h-20 border border-blue-300/20 dark:border-blue-500/30 rounded-lg rotate-6 animate-spin-slow"></div>
        <div className="absolute top-1/3 right-1/3 w-8 h-8 bg-gradient-to-br from-blue-300/20 to-purple-300/20 dark:from-blue-500/20 dark:to-purple-500/20 rounded-full animate-pulse"></div>

        {/* Small pixel grid decorations */}
        <div className="absolute top-1/2 left-10 grid grid-cols-4 gap-1 opacity-20">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-current rounded-sm animate-pixel-blink"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        <div className="absolute bottom-1/4 right-1/3 grid grid-cols-3 gap-1 opacity-20">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-current rounded-sm animate-pixel-blink"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      </div>

      <Card className="w-full max-w-md mx-4 relative z-10 shadow-xl backdrop-blur-sm bg-white/90 dark:bg-gray-900/90">
        <CardContent className="pt-6">
          <div className="flex mb-4 gap-2">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">404 Page Not Found</h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
            Did you forget to add the page to the router?
          </p>
        </CardContent>
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

        @keyframes pixel-fade {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }

        @keyframes pixel-blink {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 0.6; }
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

        .animate-pixel-fade {
          animation: pixel-fade 3s ease-in-out infinite;
        }

        .animate-pixel-blink {
          animation: pixel-blink 2s ease-in-out infinite;
        }
        
        .delay-100 {
          animation-delay: 0.1s;
        }
        
        .delay-200 {
          animation-delay: 0.2s;
        }

        .delay-300 {
          animation-delay: 0.3s;
        }

        .delay-400 {
          animation-delay: 0.4s;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }
        
        .delay-700 {
          animation-delay: 0.7s;
        }
      `}</style>
    </div>
  );
}
