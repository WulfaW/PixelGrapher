import { useState, useRef } from 'react';
import Header from '@/components/Header';
import SEOHead from '@/components/SEOHead';
import AnimatedHero from '@/components/AnimatedHero';
import HowItWorks from '@/components/HowItWorks';
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
    const targetPosition = element.getBoundingClientRect().top + window.pageYOffset - 80;
    const startPosition = window.pageYOffset;
    const distance = targetPosition - startPosition;
    const duration = 600;
    let start: number | null = null;
    const animation = (currentTime: number) => {
      if (start === null) start = currentTime;
      const timeElapsed = currentTime - start;
      const progress = Math.min(timeElapsed / duration, 1);
      const easeInOutCubic = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
      window.scrollTo(0, startPosition + distance * easeInOutCubic);
      if (timeElapsed < duration) requestAnimationFrame(animation);
    };
    requestAnimationFrame(animation);
  };

  const handleGetStarted = () => smoothScrollTo(canvasRef.current);
  const handleTemplateScroll = () => smoothScrollTo(document.getElementById('templates'));

  const handleTemplateSelect = (templateId: string) => {
    const templateGrid = getTemplate(templateId);
    if (templateGrid) {
      setGrid(normalizeGridToWeeks(templateGrid));
      smoothScrollTo(canvasRef.current);
      toast({ title: "Template Loaded", description: `${templateId.toUpperCase()} template loaded.` });
    }
  };

  const handleCustomUpload = () => setShowUpload(true);

  const handleGenerate = async (config: { repository: string; year: string; baseIntensity: number }) => {
    if (!grid.some(row => row.some(cell => cell > 0))) {
      toast({ title: "Empty Pattern", description: "Please draw a pattern before generating commits.", variant: "destructive" });
      return;
    }
    if (!config.repository?.trim()) {
      toast({ title: "Invalid Repository", description: "Please enter a repository name.", variant: "destructive" });
      return;
    }

    setShowProgress(true);
    setProgress(0);
    setCurrentCommit(0);
    setIsGenerating(true);
    setStatusMessage('Preparing...');
    setRepositoryUrl('');

    try {
      setStatusMessage('Generating commit plan...');
      const planResponse = await apiFetch('/generate-commits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ grid: normalizeGridToWeeks(grid), repository: config.repository, year: parseInt(config.year), baseIntensity: 1 })
      });

      if (!planResponse.ok) {
        const errorData = await planResponse.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to generate commit plan (${planResponse.status})`);
      }

      const planData = await planResponse.json();
      setTotalCommits(planData.totalCommits);

      setStatusMessage('Starting commit generation...');
      const executeResponse = await apiFetch('/execute-commits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ repository: config.repository, commitPlan: planData.commitPlan })
      });

      const reader = executeResponse.body?.getReader();
      const decoder = new TextDecoder();
      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const line of decoder.decode(value).split('\n')) {
            if (!line.startsWith('data: ')) continue;
            const data = JSON.parse(line.slice(6));
            if (data.message) setStatusMessage(data.message);
            if (data.progress !== undefined) setProgress(data.progress);
            if (data.completed !== undefined) setCurrentCommit(data.completed);
            if (data.repositoryUrl) setRepositoryUrl(data.repositoryUrl);
            if (data.status === 'complete') setProgress(100);
            if (data.error) throw new Error(data.error);
          }
        }
      }
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error.message || "Failed to generate commits.", variant: "destructive" });
      setShowProgress(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const calculatedTotalCommits = grid.reduce<number>((t, row) => t + row.reduce<number>((s, c) => s + c, 0), 0);

  return (
    <div className="min-h-screen bg-background bg-dot-grid">
      <SEOHead />
      <Header />
      <main>
        <AnimatedHero onGetStarted={handleGetStarted} onTemplateScroll={handleTemplateScroll} />
        <HowItWorks />
        <div className="container mx-auto px-4 py-8 space-y-16">
          <section id="templates">
            <TemplateGallery onTemplateSelect={handleTemplateSelect} onCustomUpload={handleCustomUpload} />
          </section>
          <section ref={canvasRef} id="canvas-section" className="space-y-6">
            <div className="text-center max-w-3xl mx-auto mb-8">
              <h2 className="text-4xl font-bold mb-4">Create Your Art</h2>
              <p className="text-lg text-muted-foreground">Draw your own pattern, use AI to generate text, or start with a template.</p>
            </div>
            <TextToPattern
              onPatternGenerated={(pattern) => { setGrid(normalizeGridToWeeks(pattern)); smoothScrollTo(canvasRef.current); }}
              gridWidth={weeksCount}
            />
            <AsciiCanvas onGridChange={setGrid} externalGrid={grid} year={selectedYear} onGenerate={handleGenerate} onYearChange={setSelectedYear} />
            <CommitPreview grid={grid} />
          </section>
          <section className="space-y-6">
            <SavedPatterns
              onLoadPattern={(loadedGrid, year) => {
                setGrid(normalizeGridToWeeks(loadedGrid));
                if (year) setSelectedYear(year.toString());
                smoothScrollTo(canvasRef.current);
              }}
            />
          </section>
        </div>
        <Footer />
      </main>
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
      <UploadCustomDialog
        open={showUpload}
        onOpenChange={setShowUpload}
        onApply={(g) => { setGrid(g); toast({ title: 'Custom pattern loaded', description: 'Ready to edit on canvas.' }); smoothScrollTo(canvasRef.current); }}
      />
    </div>
  );
}
