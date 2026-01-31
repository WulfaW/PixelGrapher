import { useState, useRef } from 'react';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import AnimatedHero from '@/components/AnimatedHero';
import AsciiCanvas from '@/components/AsciiCanvas';
import TemplateGallery from '@/components/TemplateGallery';
import UploadCustomDialog from '@/components/UploadCustomDialog';
import CommitPreview from '@/components/CommitPreview';
import ProgressModal from '@/components/ProgressModal';
import TextToPattern from '@/components/TextToPattern';
import SavedPatterns from '@/components/SavedPatterns';
import Footer from '@/components/Footer';
import { getTemplate } from '@/lib/templates';
import { useToast } from '@/hooks/use-toast';
import { apiFetch } from '@/lib/api';
import { getCalendarRange } from '@shared/calendar';

type CellIntensity = 0 | 1 | 2 | 3 | 4;

export default function Home() {
  const [grid, setGrid] = useState<CellIntensity[][]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [showProgress, setShowProgress] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentCommit, setCurrentCommit] = useState(0);
  const [totalCommits, setTotalCommits] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const canvasRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const calendarRange = getCalendarRange(parseInt(selectedYear, 10));
  const weeksCount = calendarRange.weeksCount;

  const normalizeGridToWeeks = (incoming: CellIntensity[][]): CellIntensity[][] => {
    return Array(7)
      .fill(null)
      .map((_, row) => {
        const source = incoming[row] || [];
        const rowArr: CellIntensity[] = Array(weeksCount).fill(0 as CellIntensity);
        for (let c = 0; c < weeksCount; c++) {
          const val = source[c] ?? 0;
          rowArr[c] = (val >= 0 && val <= 4 ? val : 0) as CellIntensity;
        }
        return rowArr;
      });
  };

  const smoothScrollTo = (element: HTMLElement | null) => {
    if (!element) return;

    // Use native smooth scroll with requestAnimationFrame for better performance
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 600; // ms
    let start: number | null = null;

    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);

      // Easing function for smooth animation
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

  const handleGetStarted = () => {
    smoothScrollTo(canvasRef.current);
  };

  const handleTemplateScroll = () => {
    smoothScrollTo(document.getElementById('templates'));
  };

  const handleTemplateSelect = (templateId: string) => {
    const templateGrid = getTemplate(templateId);
    if (templateGrid) {
      const normalized = normalizeGridToWeeks(templateGrid);
      setGrid(normalized);
      smoothScrollTo(canvasRef.current);
      toast({
        title: "Template Loaded",
        description: `${templateId.toUpperCase()} template loaded. Customize it in the canvas below!`,
      });
    }
  };

  const handleCustomUpload = () => {
    setShowUpload(true);
  };

  const handleGenerate = async (config: { repository: string; year: string; baseIntensity: number }) => {
    // Validation: Check if grid is empty
    const hasAnyCommits = grid.some(row => row.some(cell => cell > 0));
    if (!hasAnyCommits) {
      toast({
        title: "Empty Pattern",
        description: "Please draw a pattern or use AI/templates before generating commits.",
        variant: "destructive",
      });
      return;
    }

    // Validation: Check repository name
    if (!config.repository || config.repository.trim().length === 0) {
      toast({
        title: "Invalid Repository",
        description: "Please enter a repository name.",
        variant: "destructive",
      });
      return;
    }

    setShowProgress(true);
    setProgress(0);
    setCurrentCommit(0);
    setIsGenerating(true);
    setStatusMessage('Preparing...');
    setRepositoryUrl('');

    try {
      // Step 1: Generate commit plan
      setStatusMessage('Generating commit plan...');
      const planResponse = await apiFetch('/generate-commits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          grid: normalizeGridToWeeks(grid),
          repository: config.repository,
          year: parseInt(config.year),
          baseIntensity: 1
        })
      });

      if (!planResponse.ok) {
        const errorData = await planResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate commit plan (${planResponse.status})`);
      }

      const planData = await planResponse.json();
      setTotalCommits(planData.totalCommits);

      // Step 2: Execute commits with progress tracking
      setStatusMessage('Starting commit generation...');
      const executeResponse = await apiFetch('/execute-commits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          repository: config.repository,
          commitPlan: planData.commitPlan
        })
      });

      // Stream progress updates
      const reader = executeResponse.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const text = decoder.decode(value);
          const lines = text.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = JSON.parse(line.slice(6));

              if (data.message) {
                setStatusMessage(data.message);
              }

              if (data.progress !== undefined) {
                setProgress(data.progress);
              }

              if (data.completed !== undefined) {
                setCurrentCommit(data.completed);
              }

              if (data.repositoryUrl) {
                setRepositoryUrl(data.repositoryUrl);
              }

              if (data.status === 'complete') {
                setProgress(100);
              }

              if (data.error) {
                throw new Error(data.error);
              }
            }
          }
        }
      }

    } catch (error: any) {
      console.error('Error generating commits:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate commits. Please try again.",
        variant: "destructive",
      });
      setShowProgress(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculatedTotalCommits = grid.length > 0
    ? grid.reduce<number>(
      (total, row) => total + row.reduce<number>((sum, cell) => sum + cell, 0),
      0
    )
    : 0;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating circles */}
        <div className="absolute top-12 left-[12%] w-96 h-96 bg-primary/5 rounded-full blur-3xl ambient-motion ambient-pulse-slow"></div>
        <div className="absolute top-1/2 right-[12%] w-[520px] h-[520px] bg-blue-500/5 rounded-full blur-3xl ambient-motion ambient-pulse-slower" />

        {/* Grid pattern - Main background grid */}
        <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}></div>

        {/* Floating squares */}
        <div className="absolute top-24 right-[40%] w-16 h-16 border-2 border-primary/20 rotate-45 ambient-motion ambient-float"></div>
        <div className="absolute top-[58%] left-[18%] w-24 h-24 border-2 border-blue-500/20 rotate-12 ambient-motion ambient-float-alt"></div>
        <div className="absolute top-[68%] right-[18%] w-12 h-12 border-2 border-purple-500/20 -rotate-45 ambient-motion ambient-drift"></div>

        {/* Dots pattern */}
        <div className="absolute top-[42%] left-1/3 flex gap-3">
          <div className="w-2 h-2 bg-primary/30 rounded-full ambient-motion ambient-bob"></div>
          <div className="w-2 h-2 bg-blue-500/30 rounded-full ambient-motion ambient-bob" style={{ animationDelay: '0.3s' }}></div>
          <div className="w-2 h-2 bg-purple-500/30 rounded-full ambient-motion ambient-bob" style={{ animationDelay: '0.6s' }}></div>
        </div>

        {/* Pixel squares scattered */}
        <div className="absolute top-[46%] right-[36%] w-3 h-3 bg-primary/20 ambient-motion ambient-pulse-soft" style={{ animationDelay: '0.2s' }}></div>
        <div className="absolute top-[62%] left-[42%] w-4 h-4 bg-blue-500/20 rounded-sm ambient-motion ambient-pulse-soft" style={{ animationDelay: '0.4s' }}></div>
        <div className="absolute top-[78%] right-[28%] w-3 h-3 bg-purple-500/20 ambient-motion ambient-pulse-soft" style={{ animationDelay: '0.6s' }}></div>

        {/* More decorative elements */}
        <div className="absolute top-[70%] left-[30%] w-20 h-20 border border-primary/15 rounded-lg rotate-6 ambient-motion ambient-spin"></div>
        <div className="absolute top-[34%] right-[32%] w-8 h-8 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-full ambient-motion ambient-pulse-soft"></div>
      </div>

      <SEOHead />
      <Header />

      <main>
        <AnimatedHero onGetStarted={handleGetStarted} onTemplateScroll={handleTemplateScroll} />

        <div className="container mx-auto px-4 py-16 space-y-16">
          {/* Templates moved to top for better discoverability */}
          <section id="templates">
            <TemplateGallery
              onTemplateSelect={handleTemplateSelect}
              onCustomUpload={handleCustomUpload}
            />
          </section>

          <section ref={canvasRef} id="how-it-works" className="space-y-6">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <h2 className="text-4xl font-bold mb-4">Create Your Art</h2>
              <p className="text-lg text-muted-foreground">
                Draw your own ASCII art, use AI to generate text patterns, or start with a template.
              </p>
            </div>

            {/* AI Text-to-Pattern Generator */}
            <TextToPattern
              onPatternGenerated={(pattern) => {
                const normalized = normalizeGridToWeeks(pattern);
                setGrid(normalized);
                smoothScrollTo(canvasRef.current);
              }}
              gridWidth={weeksCount}
            />

            {/* Canvas + GitHub Panel Side by Side */}
            <AsciiCanvas
              onGridChange={setGrid}
              externalGrid={grid}
              year={selectedYear}
              onGenerate={handleGenerate}
              onYearChange={setSelectedYear}
            />

            {/* Commit Preview Below */}
            <CommitPreview grid={grid} />
          </section>

          {/* Saved Patterns Section */}
          <section className="space-y-6">
            <SavedPatterns
              onLoadPattern={(loadedGrid, year) => {
                const normalized = normalizeGridToWeeks(loadedGrid);
                setGrid(normalized);
                if (year) setSelectedYear(year.toString());
                smoothScrollTo(canvasRef.current);
              }}
            />
          </section>

        </div>

        <Footer />
      </main>

      <style>{`
        .ambient-motion { will-change: transform, opacity; }
        .ambient-pulse-slow { animation: pulse-soft 9s ease-in-out infinite; }
        .ambient-pulse-slower { animation: pulse-soft 12s ease-in-out infinite; }
        .ambient-pulse-soft { animation: pulse-soft 7s ease-in-out infinite; }
        .ambient-float { animation: float 11s ease-in-out infinite; }
        .ambient-float-alt { animation: float-alt 12s ease-in-out infinite; }
        .ambient-drift { animation: drift 14s ease-in-out infinite; }
        .ambient-spin { animation: spin-slow 26s linear infinite; }
        .ambient-bob { animation: bob 6s ease-in-out infinite; }

        @keyframes pulse-soft {
          0%, 100% { opacity: 0.85; transform: scale(0.98); }
          50% { opacity: 1; transform: scale(1.04); }
        }

        @keyframes float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(45deg); }
          50% { transform: translate3d(0, -16px, 0) rotate(45deg); }
        }

        @keyframes float-alt {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(12deg); }
          50% { transform: translate3d(6px, -22px, 0) rotate(12deg); }
        }

        @keyframes drift {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(-45deg); }
          50% { transform: translate3d(-6px, -14px, 0) rotate(-45deg); }
        }

        @keyframes spin-slow {
          from { transform: rotate(6deg); }
          to { transform: rotate(366deg); }
        }

        @keyframes bob {
          0%, 100% { transform: translate3d(0, 0, 0); }
          50% { transform: translate3d(0, -8px, 0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .ambient-motion { animation: none !important; transition: none !important; }
        }
      `}</style>

      <ProgressModal
        open={showProgress}
        onOpenChange={setShowProgress}
        progress={progress}
        currentCommit={currentCommit}
        totalCommits={totalCommits || calculatedTotalCommits}
        isComplete={progress === 100}
        statusMessage={statusMessage}
        repositoryUrl={repositoryUrl}
      />

      {/* Upload Custom Dialog */}
      <UploadCustomDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        onApply={(g) => {
          setGrid(g);
          toast({ title: 'Custom pattern loaded', description: 'Ready to edit on canvas.' });
          smoothScrollTo(canvasRef.current);
        }}
      />
    </div>
  );
}
