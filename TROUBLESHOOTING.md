# Troubleshooting Guide

Common issues and their solutions when using PixelGrapher.

## Table of Contents

1. [Setup Issues](#setup-issues)
2. [Authentication Issues](#authentication-issues)
3. [Commit Generation Issues](#commit-generation-issues)
4. [Contribution Graph Issues](#contribution-graph-issues)
5. [Git Issues](#git-issues)
6. [Server Issues](#server-issues)

---

## Setup Issues

### Issue: Cannot find module 'git-operations'

**Error:**
```
Cannot find module './git-operations'
```

**Cause:** TypeScript compilation hasn't run or file is missing

**Solution:**
```bash
# Rebuild the project
npm run build

# Or restart dev server
npm run dev
```

### Issue: Port 5000 already in use

**Error:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Cause:** Another process is using port 5000

**Solution:**
```powershell
# Find process using port 5000
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess

# Kill the process
Stop-Process -Id <PID>

# Or use different port in .env
PORT=5001
```

### Issue: npm install fails

**Error:**
```
npm ERR! code ERESOLVE
```

**Solution:**
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

---

## Authentication Issues

### Issue: "Not authenticated" error

**Symptoms:**
- Can't generate commits
- API returns 401 status

**Solutions:**

1. **Check session:**
   ```typescript
   // Open browser console
   fetch('/api/auth/status', { credentials: 'include' })
     .then(r => r.json())
     .then(console.log)
   ```

2. **Re-authenticate:**
   - Click "Disconnect" in GitHubPanel
   - Click "Login with GitHub" again
   - Authorize the application

3. **Check cookies:**
   - Open DevTools → Application → Cookies
   - Verify `connect.sid` cookie exists
   - If not, check `SESSION_SECRET` in `.env`

### Issue: GitHub OAuth redirect fails

**Error:**
```
Cannot GET /api/auth/github/callback
```

**Solutions:**

1. **Verify callback URL in GitHub OAuth App:**
   - Go to https://github.com/settings/developers
   - Check callback URL matches: `http://localhost:5000/api/auth/github/callback`
   - Update if necessary

2. **Check `.env` configuration:**
   ```bash
   GITHUB_CALLBACK_URL=http://localhost:5000/api/auth/github/callback
   ```

3. **Restart server after changing .env:**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

### Issue: Redirect after auth shows blank page

**Cause:** Frontend not handling redirect parameter

**Solution:**
Check browser URL - if it shows `?github_auth=success`, the authentication worked. Refresh the page.

---

## Commit Generation Issues

### Issue: "Grid is empty" error

**Cause:** No cells have intensity > 0

**Solution:**
1. Draw something on the canvas
2. Or select a template
3. Verify at least one cell is colored

### Issue: "Repository not found" error

**Cause:** Repository doesn't exist or no access

**Solutions:**

1. **Create repository on GitHub:**
   ```bash
   # Via GitHub web interface
   https://github.com/new
   
   # Name it and create
   ```

2. **Check repository name format:**
   - Should be: `username/repo-name`
   - Not: `repo-name` or `https://github.com/...`

3. **Verify access:**
   - Must be repository owner
   - Or have push access as collaborator

### Issue: Generation stops mid-way

**Symptoms:**
- Progress bar stops
- No error message
- Modal still shows processing

**Solutions:**

1. **Check browser console for errors:**
   ```javascript
   // F12 → Console tab
   // Look for red error messages
   ```

2. **Check server logs:**
   ```bash
   # Server terminal shows errors
   # Look for Git or push errors
   ```

3. **Verify network connection:**
   - Check internet connection
   - GitHub might be down: https://githubstatus.com

4. **Try again with smaller pattern:**
   - Reduce baseIntensity
   - Use fewer active cells

### Issue: "Rate limit exceeded" error

**Cause:** Too many GitHub API requests

**Solution:**
```typescript
// Wait 1 hour, or use personal access token
// This is rare with backdated commits
```

---

## Contribution Graph Issues

### Issue: Commits created but not showing on graph

**Most Common Causes:**

#### 1. Email Mismatch ⚠️

**Check your Git email:**
```bash
git config --global user.email
```

**Check your GitHub verified emails:**
1. Go to https://github.com/settings/emails
2. Find your verified emails
3. Ensure Git email matches one of them

**Fix:**
```bash
# Update global Git email
git config --global user.email "your-github-email@example.com"

# Re-run PixelGrapher
```

#### 2. Repository Ownership

**Requirements:**
- You must be the repository owner
- OR be a collaborator with push access
- Commits to forks don't count

**Check ownership:**
```bash
# Repository URL should be:
https://github.com/YOUR_USERNAME/repo-name
# Not:
https://github.com/SOMEONE_ELSE/repo-name
```

#### 3. Timing

**GitHub contribution graph updates are delayed:**
- Wait 5-10 minutes after push
- Hard refresh: Ctrl+F5 or Cmd+Shift+R
- Clear browser cache if needed

#### 4. Private Contributions

**If repository is private:**
1. Go to https://github.com/settings/profile
2. Scroll to "Contribution settings"
3. Check ✅ "Private contributions"

### Issue: Pattern appears in wrong location

**Cause:** Year calculation offset

**Solutions:**

1. **Check year selection:**
   - GitHub shows contributions for past ~1 year
   - Select current or previous year

2. **Verify start date calculation:**
   ```typescript
   // First Sunday of year might differ
   // GitHub calendar starts on Sunday
   ```

3. **Adjust pattern timing:**
   - Try different weeks in the year
   - Account for calendar differences

### Issue: Intensity levels look different than expected

**Cause:** GitHub's contribution algorithm

**Explanation:**
- GitHub calculates intensity relative to your other activity
- If you have many commits elsewhere, pattern may look lighter
- GitHub uses 0, 1-3, 4-9, 10-19, 20+ buckets (approximate)

**Solution:**
- Increase baseIntensity
- Use level 4 for important cells
- Create pattern in low-activity period

---

## Git Issues

### Issue: "Git command failed" error

**Check Git installation:**
```bash
# Should show Git version
git --version

# If not found, install Git:
# Windows: https://git-scm.com/download/win
# Mac: brew install git
# Linux: sudo apt-get install git
```

### Issue: "Permission denied" during push

**Solutions:**

1. **Verify OAuth token scope:**
   - Disconnect and reconnect GitHub
   - Ensure `repo` scope is granted

2. **Check repository exists:**
   ```bash
   # Create via GitHub if needed
   https://github.com/new
   ```

3. **Manual test:**
   ```bash
   # Test push access
   git clone https://github.com/username/repo-name.git
   cd repo-name
   echo "test" > test.txt
   git add test.txt
   git commit -m "test"
   git push
   ```

### Issue: "Repository already exists" in temp directory

**Cause:** Previous run didn't cleanup

**Solution:**
```powershell
# Manual cleanup (Windows)
Remove-Item -Recurse -Force "$env:TEMP\pixelgrapher-repos"

# Or restart system
```

### Issue: Large commit files causing push to fail

**Symptoms:**
- Push hangs
- Network timeout
- Large repository size

**Cause:** Unlikely with PixelGrapher (creates small text files)

**Solution:**
```bash
# Check git config
git config http.postBuffer 524288000
```

---

## Server Issues

### Issue: Server crashes during commit generation

**Check logs:**
```bash
# Server terminal shows error
# Common causes:
# - Out of memory
# - Disk space
# - Git not found
```

**Solutions:**

1. **Increase Node.js memory:**
   ```json
   // package.json
   "scripts": {
     "server": "node --max-old-space-size=4096 server/index.ts"
   }
   ```

2. **Check disk space:**
   ```bash
   # Windows
   Get-PSDrive C | Select-Object Used,Free
   
   # Need at least 500MB free
   ```

3. **Monitor resource usage:**
   - Task Manager → Performance
   - Watch CPU, Memory, Disk during generation

### Issue: TypeScript compilation errors

**Error:**
```
Type error: Cannot find module...
```

**Solutions:**

1. **Clean build:**
   ```bash
   rm -rf dist
   npm run build
   ```

2. **Check tsconfig.json:**
   ```json
   {
     "compilerOptions": {
       "moduleResolution": "node",
       "esModuleInterop": true
     }
   }
   ```

3. **Verify imports:**
   ```typescript
   // Use .js extension in imports for ESM
   import { GitOperations } from './git-operations.js';
   ```

### Issue: Session lost on page refresh

**Cause:** Session not persisting

**Solutions:**

1. **Check SESSION_SECRET:**
   ```bash
   # Must be set in .env
   SESSION_SECRET=your-secret-key
   ```

2. **Enable session persistence:**
   ```typescript
   // Already configured in server/index.ts
   session({
     resave: false,
     saveUninitialized: false,
     cookie: { maxAge: 24 * 60 * 60 * 1000 }
   })
   ```

---

## Debugging Tips

### Enable Verbose Logging

**Client-side:**
```typescript
// In Home.tsx or GitHubPanel.tsx
console.log('Grid:', grid);
console.log('Config:', config);
console.log('Response:', response);
```

**Server-side:**
```typescript
// In routes.ts or git-operations.ts
console.log('Received request:', req.body);
console.log('Creating commit for:', date);
console.log('Git output:', result);
```

### Test Git Operations Manually

```bash
# Create test repo
cd %TEMP%
mkdir test-repo
cd test-repo
git init

# Test backdated commit
$env:GIT_AUTHOR_DATE="2024-01-15T12:00:00"
$env:GIT_COMMITTER_DATE="2024-01-15T12:00:00"

echo "test" > test.txt
git add test.txt
git commit -m "test"

git log --pretty=fuller
# Should show January 15, 2024
```

### Check Network Requests

**Browser DevTools:**
1. F12 → Network tab
2. Filter: XHR or Fetch
3. Watch for:
   - `/api/generate-commits` (POST)
   - `/api/execute-commits` (POST)
4. Check response status and body

### Verify GitHub Configuration

```bash
# Check OAuth app settings
https://github.com/settings/developers

# Check repository settings
https://github.com/username/repo-name/settings

# Check contribution settings
https://github.com/settings/profile
```

---

## Getting Help

### Before asking for help:

1. ✅ Check this troubleshooting guide
2. ✅ Read error messages carefully
3. ✅ Check browser console (F12)
4. ✅ Check server terminal logs
5. ✅ Verify environment variables
6. ✅ Test with minimal pattern

### Include in bug reports:

- Operating system
- Node.js version (`node --version`)
- Git version (`git --version`)
- Error messages (full text)
- Steps to reproduce
- Screenshot if relevant

### Community Resources:

- GitHub Issues: [Report bugs](https://github.com/yourusername/PixelGrapher/issues)
- Discussions: [Ask questions](https://github.com/yourusername/PixelGrapher/discussions)
- Documentation: Check all `.md` files

---

## Quick Checklist

When things go wrong, verify:

- [ ] `.env` file exists and is configured
- [ ] `npm install` completed successfully
- [ ] Git is installed (`git --version`)
- [ ] Server is running (`npm run dev`)
- [ ] GitHub OAuth app is configured correctly
- [ ] Logged in to GitHub in PixelGrapher
- [ ] Repository exists and you own it
- [ ] Git email matches GitHub verified email
- [ ] Grid has at least one colored cell
- [ ] Internet connection is working
- [ ] GitHub is not down (check githubstatus.com)

---

**Still stuck?** Open an issue with the template above! 🆘
