import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Github, Check, AlertCircle, ChevronsUpDown, Search, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { apiFetch, getApiBaseUrl } from '@/lib/api';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

interface GitHubPanelProps {
  onConnect?: (token: string, repo: string) => void;
  onGenerate?: (config: GenerateConfig) => void;
  onYearChange?: (year: string) => void;
  grid?: number[][];
}

interface GenerateConfig {
  repository: string;
  year: string;
  baseIntensity: number;
}

export default function GitHubPanel({ onConnect, onGenerate, onYearChange, grid }: GitHubPanelProps) {
  const currentYear = new Date().getFullYear();
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [selectedRepo, setSelectedRepo] = useState('');
  const [year, setYear] = useState(currentYear.toString());
  const [username, setUsername] = useState('');
  const [repos, setRepos] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [checkingRepo, setCheckingRepo] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [joinYear, setJoinYear] = useState<number | null>(null);
  const { toast } = useToast();

  const totalCells = grid ? grid.reduce((total, row) =>
    total + row.filter(cell => cell > 0).length, 0
  ) : 0;

  const totalCommits = grid ?
    grid.reduce((total, row) =>
      total + row.reduce((sum, cell) => sum + cell, 0), 0
    ) : 0;

  // Sayfa yüklendiğinde GitHub bağlantı durumunu kontrol et
  useEffect(() => {
    checkAuthStatus();

    // URL'den GitHub auth success parametresini kontrol et
    const params = new URLSearchParams(window.location.search);
    if (params.get('github_auth') === 'success') {
      // URL'i temizle
      window.history.replaceState({}, '', window.location.pathname);
      // Auth durumunu tekrar kontrol et
      setTimeout(checkAuthStatus, 500);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await apiFetch('/auth/status');
      const data = await response.json();

      if (data.authenticated) {
        setStatus('connected');
        setUsername(data.username);
        if (data.createdAt) {
          const created = new Date(data.createdAt);
          setJoinYear(created.getUTCFullYear());
          // Eğer kullanıcı hesabı bu yıldan eskiyse minimum yılı güncelle
          if (parseInt(year, 10) < created.getUTCFullYear()) {
            setYear(currentYear.toString());
            onYearChange?.(currentYear.toString());
          }
        }

        // Kullanıcının repolarını backend üzerinden çek
        fetchUserRepos();

        toast({
          title: "Connected to GitHub!",
          description: `Welcome, ${data.displayName || data.username}`,
        });
      }
    } catch (error) {
      console.error('Auth status check failed:', error);
    }
  };

  const fetchUserRepos = async () => {
    setLoadingRepos(true);
    try {
      const response = await apiFetch('/github/repos');

      if (response.ok) {
        const data = await response.json();
        setRepos(data.repos || []);
      } else {
        throw new Error('Failed to fetch repositories');
      }
    } catch (error) {
      console.error('Failed to fetch repos:', error);
      toast({
        title: "Failed to load repositories",
        description: "Could not fetch your GitHub repositories",
        variant: "destructive"
      });
    } finally {
      setLoadingRepos(false);
    }
  };

  const handleGitHubLogin = () => {
    setStatus('connecting');
    // Backend OAuth endpoint'ine yönlendir
    window.location.href = `${getApiBaseUrl()}/auth/github`;
  };

  const handleGenerate = async () => {
    if (selectedRepo) {
      if (!grid || totalCells === 0) {
        toast({
          title: "Empty Pattern",
          description: "Please draw something on the canvas first",
          variant: "destructive"
        });
        return;
      }

      // Check if repository exists
      setCheckingRepo(true);
      try {
        const [owner, name] = selectedRepo.split('/');
        const response = await apiFetch(`/github/repo/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`);

        if (!response.ok) {
          const data = await response.json();
          toast({
            title: "Repository not found",
            description: data.error || `Repository ${selectedRepo} not found or you don't have access`,
            variant: "destructive"
          });
          setCheckingRepo(false);
          return;
        }

        const repoData = await response.json();

        // Check if repo is private (commits won't show on public profile)
        if (repoData.private) {
          toast({
            title: "Warning: Private Repository",
            description: "Private repository commits won't show on your public GitHub profile",
          });
        }

      } catch (error) {
        toast({
          title: "Repository validation failed",
          description: "Could not validate repository",
          variant: "destructive"
        });
        setCheckingRepo(false);
        return;
      }
      setCheckingRepo(false);

      onGenerate?.({
        repository: selectedRepo,
        year,
        baseIntensity: 1
      });
    }
  };

  const handleDisconnect = async () => {
    try {
      await apiFetch('/auth/logout', {
        method: 'POST'
      });

      setStatus('disconnected');
      setUsername('');
      setSelectedRepo('');
      setRepos([]);

      toast({
        title: "Disconnected",
        description: "Successfully disconnected from GitHub",
      });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <Check className="w-4 h-4 text-primary" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-destructive" />;
      default:
        return <div className={cn('w-2 h-2 rounded-full', {
          'bg-muted-foreground': status === 'disconnected',
          'bg-chart-3 animate-pulse': status === 'connecting',
        })} />;
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Github className={cn("w-6 h-6 transition-colors", {
              "text-green-500": status === 'connected',
              "text-foreground": status !== 'connected'
            })} />
            <div>
              <h3 className="font-semibold text-lg">GitHub Integration</h3>
              <p className="text-sm text-muted-foreground">
                Connect to generate commits
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <span className="text-sm capitalize text-muted-foreground">
              {status}
            </span>
          </div>
        </div>

        <div className="space-y-4">
          {status === 'disconnected' ? (
            <Button
              onClick={handleGitHubLogin}
              className="w-full"
              size="lg"
              data-testid="button-login-github"
            >
              <Github className="w-5 h-5 mr-2" />
              Login with GitHub
            </Button>
          ) : status === 'connecting' ? (
            <Button
              disabled
              className="w-full"
              size="lg"
            >
              <Github className="w-5 h-5 mr-2 animate-spin" />
              Connecting...
            </Button>
          ) : null}

          {status === 'connected' && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-500">
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Github className="w-4 h-4" />
                  <span className="text-sm font-medium">{username}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDisconnect}
                  data-testid="button-disconnect-github"
                >
                  Disconnect
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="repo">Select Repository</Label>
                {loadingRepos ? (
                  <div className="space-y-2">
                    <Skeleton className="h-10 w-full" />
                    <p className="text-xs text-muted-foreground flex items-center gap-2">
                      <Loader2 className="w-3 h-3 animate-spin" />
                      Loading repositories...
                    </p>
                  </div>
                ) : (
                  <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between"
                        data-testid="select-repository"
                      >
                        {selectedRepo || "Choose a repository..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0" align="start">
                      <Command>
                        <CommandInput
                          placeholder="Search repositories..."
                          value={searchQuery}
                          onValueChange={setSearchQuery}
                        />
                        <CommandList>
                          <CommandEmpty>
                            {repos.length === 0 ? "Loading repositories..." : "No repository found."}
                          </CommandEmpty>
                          <CommandGroup>
                            {repos
                              .filter(repo =>
                                repo.toLowerCase().includes(searchQuery.toLowerCase())
                              )
                              .map((repo) => (
                                <CommandItem
                                  key={repo}
                                  value={repo}
                                  onSelect={(currentValue) => {
                                    setSelectedRepo(currentValue === selectedRepo ? "" : currentValue);
                                    setOpen(false);
                                    setSearchQuery('');
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedRepo === repo ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {repo}
                                </CommandItem>
                              ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Select value={year} onValueChange={(v) => { setYear(v); onYearChange?.(v); }}>
                  <SelectTrigger id="year" data-testid="select-year">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(() => {
                      const minYear = joinYear ?? currentYear - 5;
                      const years = [] as JSX.Element[];
                      for (let y = currentYear; y >= minYear; y--) {
                        years.push(<SelectItem key={y} value={y.toString()}>{y}</SelectItem>);
                      }
                      return years;
                    })()}
                  </SelectContent>
                </Select>
              </div>

              {totalCells > 0 && (
                <div className="p-4 bg-muted rounded-lg space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Active cells:</span>
                    <span className="font-medium">{totalCells}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total commits:</span>
                    <span className="font-bold text-primary">{totalCommits}</span>
                  </div>
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleGenerate}
                disabled={!selectedRepo || checkingRepo}
                data-testid="button-generate-commits"
              >
                {checkingRepo ? 'Checking repository...' : 'Generate Commits'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
