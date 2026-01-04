import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from "passport";
import { Strategy as GitHubStrategy } from "passport-github2";
import { GitOperations, generateCommitPlan, sleep } from "./git-operations";

// Security / operational limits for long-running SSE jobs
const MAX_COMMITS = Number(process.env.MAX_COMMITS || 2000);
const MAX_CONCURRENT_JOBS_PER_USER = Number(process.env.MAX_CONCURRENT_JOBS_PER_USER || 1);

// Track running jobs per user to prevent concurrent long-running processes
const runningJobs: Map<string, { abort: boolean; startedAt: number } > = new Map();

export async function registerRoutes(app: Express): Promise<Server> {
  // GitHub OAuth Configuration
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID || "",
        clientSecret: process.env.GITHUB_CLIENT_SECRET || "",
        callbackURL: process.env.GITHUB_CALLBACK_URL || "http://localhost:5000/api/auth/github/callback",
      },
      function (accessToken: string, refreshToken: string, profile: any, done: any) {
        // Kullanıcı bilgilerini ve access token'ı session'a kaydet
        return done(null, { 
          profile, 
          accessToken,
          createdAt: profile?._json?.created_at,
          username: profile.username,
          displayName: profile.displayName 
        });
      }
    )
  );

  passport.serializeUser((user: any, done) => {
    done(null, user);
  });

  passport.deserializeUser((user: any, done) => {
    done(null, user);
  });

  app.use(passport.initialize());
  app.use(passport.session());

  // GitHub OAuth Routes
  app.get("/api/auth/github", passport.authenticate("github", { scope: ["user:email", "repo"] }));

  app.get(
    "/api/auth/github/callback",
    passport.authenticate("github", { failureRedirect: "/login" }),
    (req, res) => {
      // Başarılı kimlik doğrulama sonrası frontend'e yönlendir
      res.redirect("/?github_auth=success");
    }
  );

  // Kullanıcının GitHub bağlantı durumunu kontrol et
  app.get("/api/auth/status", (req, res) => {
    if (req.isAuthenticated()) {
      const user = req.user as any;
      res.json({
        authenticated: true,
        username: user.username,
        displayName: user.displayName,
        createdAt: user.createdAt
        // Access token removed for security - kept in session only
      });
    } else {
      res.json({ authenticated: false });
    }
  });

  // Logout endpoint
  app.post("/api/auth/logout", (req, res) => {
    req.logout(() => {
      res.json({ success: true });
    });
  });

  // Get user repositories
  app.get("/api/github/repos", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as any;
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `token ${user.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories from GitHub');
      }

      const reposData = await response.json();
      const repoNames = reposData.map((repo: any) => repo.full_name);
      
      res.json({ repos: repoNames });
    } catch (error: any) {
      console.error('Error fetching repositories:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Validate repository
  app.get("/api/github/repo/:owner/:name", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as any;
      const { owner, name } = req.params;
      const repoFullName = `${owner}/${name}`;

      const response = await fetch(`https://api.github.com/repos/${repoFullName}`, {
        headers: {
          'Authorization': `token ${user.accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        return res.status(404).json({ error: 'Repository not found or access denied' });
      }

      const repoData = await response.json();
      
      res.json({
        name: repoData.name,
        fullName: repoData.full_name,
        private: repoData.private,
        url: repoData.html_url
      });
    } catch (error: any) {
      console.error('Error validating repository:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Generate commits endpoint
  app.post("/api/generate-commits", async (req, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as any;
      const { grid, repository, year, baseIntensity = 1 } = req.body;

      if (!grid || !repository || !year) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Validate grid format (7 rows x 52 columns)
      if (!Array.isArray(grid) || grid.length !== 7) {
        return res.status(400).json({ error: "Invalid grid format. Must be 7 rows." });
      }

      // Grid'i commit planına çevir
      const commitPlan = generateCommitPlan(grid, year, baseIntensity);
      
      res.json({
        success: true,
        message: "Commit plan generated",
        totalCommits: commitPlan.reduce((sum, item) => sum + item.count, 0),
        commitPlan: commitPlan
      });

    } catch (error: any) {
      console.error("Error generating commits:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Execute commits endpoint
  app.post("/api/execute-commits", async (req, res) => {
    let gitOps: GitOperations | null = null;
    let heartbeat: NodeJS.Timeout | null = null;

    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = req.user as any;
      const { repository, commitPlan } = req.body;

      if (!repository || !commitPlan || !Array.isArray(commitPlan)) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // Basic sanitization and validation
      if (typeof repository !== 'string' || repository.trim().length === 0 || !repository.includes('/')) {
        return res.status(400).json({ error: 'Invalid repository format. Use owner/name' });
      }

      // Compute totals and enforce limits before starting heavy work
      const totalCommitsNeeded = commitPlan.reduce((sum: number, item: any) => sum + (Number(item.count) || 0), 0);
      if (totalCommitsNeeded <= 0) {
        return res.status(400).json({ error: 'Commit plan contains no commits' });
      }

      if (totalCommitsNeeded > MAX_COMMITS) {
        return res.status(400).json({ error: `Requested ${totalCommitsNeeded} commits exceeds maximum allowed of ${MAX_COMMITS}` });
      }

      // Prevent concurrent long-running jobs from the same user
      const clientIp = req.ip || (req.headers['x-forwarded-for'] as string) || 'unknown';
      const userKey = (() => {
        try { return (req.user as any)?.username || clientIp; } catch { return clientIp; }
      })();

      const currentJob = runningJobs.get(userKey);
      if (currentJob && (Date.now() - currentJob.startedAt) < 1000 * 60 * 60 * 4) {
        return res.status(429).json({ error: 'A long-running job is already in progress for this user. Please wait until it completes.' });
      }

      // Mark job as running
      runningJobs.set(userKey, { abort: false, startedAt: Date.now() });

      // Setup Server-Sent Events
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      // Disable buffering on some proxies (nginx) to ensure timely events
      res.setHeader('X-Accel-Buffering', 'no');
      res.flushHeaders();

      const sendProgress = (data: any) => {
        try {
          res.write(`data: ${JSON.stringify(data)}\n\n`);
        } catch (e) {
          // write may fail if client disconnected
        }
      };

      // Heartbeat to keep connection alive through proxies (SSE comments)
      heartbeat = setInterval(() => {
        try { res.write(': heartbeat\n\n'); } catch (e) { /* ignore */ }
      }, 20_000);

      sendProgress({ status: 'initializing', message: 'Initializing repository...' });

      // Listen for client disconnects and abort work
      const onClientClose = () => {
        const job = runningJobs.get(userKey);
        if (job) job.abort = true;
        sendProgress({ status: 'aborted', message: 'Client disconnected, aborting job' });
        try {
          if (gitOps) gitOps.cleanup();
        } catch (e) {
          console.error('Cleanup error after client disconnect:', e);
        }
        clearInterval(heartbeat);
        runningJobs.delete(userKey);
      };

      req.on('close', onClientClose);

      // Initialize Git operations
      gitOps = new GitOperations({
        repoName: repository.split('/')[1] || repository,
        username: user.username,
        email: `${user.username}@users.noreply.github.com`,
      });

      await gitOps.initRepo();
      sendProgress({ status: 'initialized', message: 'Repository initialized' });

      // Generate commits
      let totalCommitsCreated = 0;
      const totalCommitsNeeded = commitPlan.reduce((sum: number, item: any) => sum + item.count, 0);

      for (let i = 0; i < commitPlan.length; i++) {
        const { date, count } = commitPlan[i];
        
        sendProgress({
          status: 'processing',
          message: `Creating commits for ${date}`,
          date,
          progress: Math.floor((totalCommitsCreated / totalCommitsNeeded) * 100),
          completed: totalCommitsCreated,
          total: totalCommitsNeeded
        });

        // Create multiple commits for this date
        for (let j = 0; j < count; j++) {
          // Respect abort flag so long-running work can be cancelled
          const job = runningJobs.get(userKey);
          if (job?.abort) throw new Error('Job aborted by client/disconnect');

          await gitOps.createCommit(date, j);
          totalCommitsCreated++;

          // Send progress update every 10 commits or on last commit
          if (j % 10 === 0 || j === count - 1) {
            sendProgress({
              status: 'processing',
              progress: Math.floor((totalCommitsCreated / totalCommitsNeeded) * 100),
              completed: totalCommitsCreated,
              total: totalCommitsNeeded
            });
          }

          // Small delay to prevent overwhelming the system
          if (j < count - 1) {
            await sleep(50);
          }
        }
      }

      sendProgress({ 
        status: 'commits-created', 
        message: 'All commits created locally',
        completed: totalCommitsCreated,
        total: totalCommitsNeeded
      });

      // Add remote and push
      sendProgress({ status: 'pushing', message: 'Adding remote repository...' });

      // Avoid logging tokens. Use token directly for remote url but do not persist in logs.
      const token = String(user.accessToken || '');
      const remoteUrl = `https://${token}@github.com/${repository}.git`;
      try {
        await gitOps.addRemote(remoteUrl);

        sendProgress({ status: 'pushing', message: 'Pushing commits to GitHub...' });
        await gitOps.push('main');
      } finally {
        // Immediately sanitize token from memory/session to reduce exposure risk
        try {
          if ((req as any).session && (req as any).session.passport && (req as any).session.passport.user) {
            delete (req as any).session.passport.user.accessToken;
          }
        } catch (e) {
          // ignore session sanitization errors
        }
      }

      sendProgress({ 
        status: 'complete',
        message: 'Successfully pushed all commits to GitHub!',
        progress: 100,
        completed: totalCommitsCreated,
        total: totalCommitsNeeded,
        repositoryUrl: `https://github.com/${repository}`
      });

      // Clear heartbeat and job record on normal completion
      try { clearInterval(heartbeat); } catch {}
      runningJobs.delete(userKey);

      res.end();

    } catch (error: any) {
      console.error("Error executing commits:", error);
      res.write(`data: ${JSON.stringify({ 
        status: 'error',
        error: error.message || 'Failed to execute commits'
      })}\n\n`);
      res.end();
      
      // Cleanup immediately on error
      try { clearInterval(heartbeat); } catch {}
      if (gitOps) {
        try {
          gitOps.cleanup();
        } catch (cleanupError) {
          console.error('Error during cleanup:', cleanupError);
        }
      }
      runningJobs.delete(userKey);
    } finally {
      // Cleanup temporary repository after successful push
      if (gitOps && !res.writableEnded) {
        setTimeout(() => {
          try {
            gitOps?.cleanup();
          } catch (cleanupError) {
            console.error('Error during delayed cleanup:', cleanupError);
          }
        }, 5000); // Wait 5 seconds before cleanup to ensure push is complete
      }
      // Ensure running job record removed
      runningJobs.delete(userKey);
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
