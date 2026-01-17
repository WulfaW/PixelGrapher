import { Button } from '@/components/ui/button';
import { Github, Moon, Sun, Star, LogOut } from 'lucide-react';
import { useState, useEffect } from 'react';
import { apiFetch, getApiBaseUrl } from '@/lib/api';

export default function Header() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage or default to dark
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true;
  });
  const [githubUser, setGithubUser] = useState<string | null>(null);

  useEffect(() => {
    // Apply theme on mount and changes
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  useEffect(() => {
    // Check GitHub auth to show username in header
    const checkStatus = async () => {
      try {
        const res = await apiFetch('/auth/status');
        if (res.status === 401) {
          setGithubUser(null);
          return;
        }
        if (!res.ok) return;
        const data = await res.json();
        if (data.authenticated && data.username) {
          setGithubUser(data.username);
        }
      } catch (err) {
        console.error('Failed to fetch auth status', err);
      }
    };

    // Check for auth success parameter from OAuth redirect
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth_success') === 'true') {
      // Optimistic update: Hemen logged-in state'ine geç
      // Gerçek username gelene kadar geçici bir değer göster
      setGithubUser('Loading...');

      // Ardından backend'den gerçek bilgileri al
      checkStatus();
    } else {
      // Normal sayfa yüklemesinde auth durumunu kontrol et
      checkStatus();
    }

    // Re-check auth status when window regains focus (e.g., after GitHub OAuth redirect)
    const handleFocus = () => {
      checkStatus();
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const handleLogout = async () => {
    try {
      const res = await apiFetch('/auth/logout', { method: 'POST' });
      if (!res.ok && res.status !== 401) {
        throw new Error('Logout failed');
      }
      setGithubUser(null);
    } catch (err) {
      console.error('Logout failed', err);
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (!element) return;

    // Optimized smooth scroll
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

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <pre className="font-mono text-primary font-semibold text-lg">
            {'<ASCII/>'}
          </pre>
          <span className="text-sm text-muted-foreground hidden sm:inline">
            GitHub Graph Generator
          </span>
        </div>

        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection('how-it-works')}
            data-testid="button-how-it-works"
          >
            How it Works
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => scrollToSection('templates')}
            data-testid="button-templates"
          >
            Templates
          </Button>
          <div className="h-6 w-px bg-border mx-2" />
          {githubUser ? (
            <Button
              variant="secondary"
              size="sm"
              className="inline-flex bg-green-500 text-green-950 hover:bg-green-400 focus-visible:ring-green-500/60"
              data-testid="button-github-username"
              onClick={handleLogout}
            >
              <Github className="w-4 h-4 mr-2" />
              {githubUser}
              <LogOut className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              size="sm"
              className="inline-flex bg-muted text-muted-foreground hover:bg-muted/80"
              onClick={() => { window.location.href = `${getApiBaseUrl()}/api/auth/github`; }}
              data-testid="button-login-github-header"
            >
              <Github className="w-4 h-4 mr-2" />
              Login with GitHub
            </Button>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
          <Button
            variant="outline"
            size="sm"
            asChild
            data-testid="button-github-repo"
            className="group relative overflow-hidden transition-all hover:shadow-md hover:scale-105"
          >
            <a href="https://github.com/WulfaW/PixelGrapher" target="_blank" rel="noopener noreferrer" className="flex items-center">
              <Star className="w-4 h-4 mr-2 transition-all group-hover:fill-yellow-400 group-hover:text-yellow-400 group-hover:rotate-12" />
              <span className="hidden sm:inline font-medium">Star on GitHub</span>
              <Github className="w-4 h-4 sm:ml-2 transition-transform group-hover:rotate-12" />
            </a>
          </Button>
        </nav>
      </div>
    </header>
  );
}
