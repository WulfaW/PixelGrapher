import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, ExternalLink } from 'lucide-react';

interface ProgressModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  progress: number;
  currentCommit: number;
  totalCommits: number;
  isComplete?: boolean;
  statusMessage?: string;
  repositoryUrl?: string;
}

export default function ProgressModal({
  open,
  onOpenChange,
  progress,
  currentCommit,
  totalCommits,
  isComplete = false,
  statusMessage,
  repositoryUrl,
}: ProgressModalProps) {
  const handleViewOnGitHub = () => {
    if (repositoryUrl) {
      window.open(repositoryUrl, '_blank');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="modal-progress">
        <DialogHeader>
          <DialogTitle>
            {isComplete ? 'Generation Complete!' : 'Generating Commits'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {!isComplete ? (
            <>
              <div className="flex items-center justify-center">
                <div className="relative w-20 h-20">
                  <div className="absolute inset-0 rounded-full border-4 border-primary/30 border-t-transparent animate-spin" aria-hidden />
                  <div className="absolute inset-2 rounded-full bg-primary/10" aria-hidden />
                  <Loader2 className="absolute inset-0 m-auto w-8 h-8 text-primary animate-spin" aria-hidden />
                  <span className="sr-only">Generating commits…</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className="font-medium">
                    {currentCommit} / {totalCommits} commits
                  </span>
                </div>
                <Progress value={progress} className="h-2" data-testid="progress-bar" />
                <p className="text-xs text-muted-foreground text-center">
                  {progress.toFixed(1)}% complete • {statusMessage || 'Processing...'}
                </p>
              </div>

              <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                  <p className="text-muted-foreground font-mono text-xs">
                    {statusMessage || 'Creating commits with backdated timestamps...'}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground/70">
                  ⏱️ Estimated time: {Math.ceil((totalCommits - currentCommit) * 0.1)}s remaining
                </div>
              </div>

              <Button
                variant="outline"
                className="w-full"
                onClick={() => onOpenChange(false)}
                data-testid="button-cancel-generation"
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <div className="flex items-center justify-center">
                <CheckCircle2 className="w-24 h-24 text-primary animate-in zoom-in duration-500" />
              </div>

              <div className="text-center space-y-2">
                <p className="text-lg font-medium">
                  Successfully created {totalCommits} commits!
                </p>
                <p className="text-sm text-muted-foreground">
                  Your GitHub contribution graph has been updated
                </p>
              </div>

              <Button
                className="w-full"
                onClick={handleViewOnGitHub}
                data-testid="button-close-modal"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View on GitHub
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
