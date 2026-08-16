import { Github, Heart, Code2, Linkedin } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const smoothScrollTo = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;
    
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 500;
    let start: number | null = null;
    
    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      
      window.scrollTo(0, startPosition + distance * easeInOutCubic);
      
      if (timeElapsed < duration) {
        requestAnimationFrame(animation);
      }
    };
    
    requestAnimationFrame(animation);
  };

  const scrollToTop = () => {
    smoothScrollTo('root');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 100);
  };

  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <pre className="font-mono text-primary font-bold text-xl">
                {'<ASCII/>'}
              </pre>
            </div>
            <p className="text-sm text-muted-foreground">
              Transform your creative ASCII art into stunning GitHub contribution patterns.
            </p>
            <div className="flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" asChild>
                <a href="https://github.com/WulfaW/PixelGrapher" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                  <Github className="h-4 w-4" />
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" asChild>
                <a href="https://x.com/WulfaW" target="_blank" rel="noopener noreferrer" aria-label="X (Twitter)">
                  <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </a>
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors" asChild>
                <a href="https://www.linkedin.com/in/haluk-emre-g-353844382/" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                  <Linkedin className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => smoothScrollTo('how-it-works')}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1 group"
                >
                  <Code2 className="h-3 w-3 group-hover:rotate-12 transition-transform" />
                  How it Works
                </button>
              </li>
              <li>
                <button onClick={() => smoothScrollTo('templates')} className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1.5">
                  Templates
                </button>
              </li>
              <li>
                <a
                  href="https://github.com/WulfaW/PixelGrapher#readme"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors inline-flex items-center gap-1"
                >
                  Documentation
                </a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div className="space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/WulfaW/PixelGrapher/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Report Issues
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/WulfaW/PixelGrapher/blob/main/CONTRIBUTING.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Contributing
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/yourusername/PixelGrapher/blob/main/LICENSE"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  License
                </a>
              </li>
            </ul>
          </div>


          {/* ASCII Art Decoration */}
          <div className="space-y-4 hidden md:block">
            <pre className="font-mono text-[0.5rem] text-muted-foreground leading-tight transition-colors duration-300 hover:text-green-500 cursor-pointer">
{`⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣾⣷⣶⣀
⠀⡀⠀⠀⠀⣠⣶⣿⣶⣶⣿⣿⣿⣿⣿⣿⣷⣶⣤⡀
⢰⣷⣤⣴⣾⣿⠟⡻⢿⣿⡿⠛⢉⠙⢿⣿⣿⣿⣿⣿⡄
⠘⢿⣿⡿⠛⣡⣾⣿⣶⣦⣶⣾⣿⣷⣤⡙⠛⠛⠛⢿⣷⡀
⢰⠆⢠⣔⣭⣽⣿⣿⣿⣿⣿⢿⣿⣿⣿⣿⣿⣿⣷⠀⣿⣷
⠈⢀⣿⡟⠙⣿⣿⡟⣻⣿⣿⣶⣦⣝⣿⣿⣿⣉⠡⣴⣿⣿
⠀⣼⣿⣧⣼⣿⠟⣰⣿⣿⣉⣉⡉⣿⣿⣯⡏⣉⠳⡌⢻⠏
⠀⣿⣿⣿⣿⠟⢠⣿⣿⣿⣿⣿⣷⣿⣿⣿⠁⠙⢤⢳⡌
⢸⣿⣿⡿⣿⣦⣈⣻⣿⣿⣿⣿⣿⣿⣿⣯⣀⣴⣾⣦⣀
⠀⣿⡏⢁⣛⠻⠿⠿⠿⠿⠟⠙⠻⣿⣿⣿⣿⣿⣿⣿⣿
⠀⠹⣿⣤⣝⠻⢿⣿⠿⠟⢋⣡⢀⣿⣿⣿⣿⣿⠿⠟⠋
⠀⠀⠙⢿⣿⣿⡒⠲⣶⣾⣿⣿⣿⣿⣿⣿⡿⠁
⠀⠀⠀⠀⠙⠻⣿⣿⣿⣿⣿⣿⣿⡿⠟⠉
⠀⠀⠀⠀⠀⠀⠀⠨⢭⣽⣿⠿⠿`}
            </pre>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Made with <Heart className="h-3.5 w-3.5 text-primary fill-primary" /> and ASCII
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-sm text-muted-foreground">
              <span>© {currentYear} PixelGrapher</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs">GitHub contributions are permanent - use responsibly</span>
              <button
                onClick={scrollToTop}
                className="text-primary hover:underline text-xs font-medium transition-all hover:scale-105"
              >
                Back to Top ↑
              </button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
