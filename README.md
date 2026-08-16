<div align="center">
  <pre>
  &lt;ASCII/&gt;
  </pre>
  <h1>PixelGrapher 🎨</h1>
  <p><strong>Transform your GitHub contribution graph into a canvas for your creativity.</strong></p>

  [![Vercel](https://therealsujitk-vercel-badge.vercel.app/?app=pixel-grapher)](https://pixel-grapher.vercel.app/)
  [![GitHub](https://img.shields.io/github/stars/WulfaW/PixelGrapher?style=social)](https://github.com/WulfaW/PixelGrapher)
  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
</div>

<br />

PixelGrapher is a sleek, single-player SaaS tool that allows you to draw pixel art, write text, or use templates directly on a 52x7 grid matching the GitHub contribution calendar. Once your masterpiece is ready, PixelGrapher safely generates backdated commits and pushes them to a repository of your choice, instantly painting your GitHub profile.

## ✨ Features

- 🎨 **Contribution Canvas:** A responsive 52x7 grid with drawing, erasing, undo/redo, and intensity controls.
- 🤖 **AI Text-to-Pattern:** Type any text (up to 13 characters) and generate a perfect pixel-art pattern automatically.
- 📁 **Save & Restore:** Save your drafts directly to your browser's local storage or export/import them as JSON files.
- 🔐 **Secure OAuth:** Login securely with your GitHub account. We only request the minimum permissions needed to push to your selected repository.
- 🖼️ **Image Export:** Export your pattern as a clean, high-resolution PNG.
- 🌗 **Premium UI/UX:** A stunning, meticulously designed interface with full Dark & Light mode support, built on shadcn/ui.

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, Lucide Icons.
- **Backend:** Node.js, Express.js, `isomorphic-git` (for creating local commits without a Git CLI dependency).
- **Deployment:** Vercel (Frontend), Render (Backend).
- **Automation:** GitHub Actions (Keep-alive cron job for the Render free-tier).

---

## 🚀 How It Works

1. **Design Your Art:** Use the canvas to draw manually, type text to generate a pattern, or pick a quick-start template.
2. **Connect & Select:** Sign in with GitHub. Create a *new, empty repository* on your GitHub account and select it in PixelGrapher.
3. **Generate Commits:** Our backend uses `isomorphic-git` to generate thousands of backdated, dummy commits locally, and pushes them straight to your repository. Your GitHub graph updates instantly.

---

## 💻 Local Development

### 1. Prerequisites
- Node.js 18+
- A GitHub account

### 2. GitHub OAuth Setup
Before running the app locally, you need a GitHub OAuth App.
1. Go to **GitHub Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. **Application name**: `PixelGrapher Local`
3. **Homepage URL**: `http://localhost:5174`
4. **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
5. Click **Register application**.
6. Copy your **Client ID** and generate a **Client Secret**.

### 3. Installation

Clone the repository:
```bash
git clone https://github.com/WulfaW/PixelGrapher.git
cd PixelGrapher
```

#### Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend/` directory:
```env
PORT=3000
FRONTEND_URL=http://localhost:5174
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
SESSION_SECRET=your_super_secret_session_key
```

#### Frontend Setup
```bash
cd ../frontend
npm install
```
Create a `.env` file in the `frontend/` directory:
```env
VITE_API_URL=http://localhost:3000
```

### 4. Run the App

Open two terminals.

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5174` in your browser.

---

## 🏗️ Architecture Notes

### Why a backend?
Generating thousands of commits directly in the browser using `isomorphic-git` is possible but highly memory-intensive and can crash mobile browsers or lower-end devices. Offloading the Git tree generation and push process to an Express backend ensures a smooth, non-blocking user experience on the frontend.

### Dual-Storage Auth
To bypass strict privacy settings in modern browsers (like Zen Browser or Brave) that block 3rd-party cookies/storage during OAuth redirects, PixelGrapher utilizes a dual `localStorage` + `sessionStorage` token mirroring system, ensuring users remain logged in seamlessly.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
