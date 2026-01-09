# PixelGrapher 🎨

Create pixel art and ASCII patterns on your GitHub contribution graph.

[![GitHub](https://img.shields.io/github/stars/WulfaW/PixelGrapher?style=social)](https://github.com/WulfaW/PixelGrapher)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🏗️ Project Structure

```
PixelGrapher/
├── frontend/          # React/Vite → Deploy to Vercel
├── backend/           # Express.js → Deploy to Railway
└── README.md
```

---

## ✨ Features

- 7×52 grid canvas matching GitHub's contribution calendar
- AI-powered text-to-pattern generator (up to 13 characters)
- 10+ ready-made templates (heart, smile, star, wave, etc.)
- Secure GitHub authentication
- Export and import patterns as JSON
- Keyboard shortcuts with undo/redo support
- Dark and light mode

---

## � Setup Local Development

### Prerequisites
- Node.js 16+ (recommended 18+)
- Git

### 1. Clone & Install
```bash
git clone https://github.com/WulfaW/PixelGrapher.git
cd PixelGrapher

# Frontend
cd frontend && npm install

# Backend
cd ../backend && npm install
```

### 2. GitHub OAuth Setup
1. Go to https://github.com/settings/developers → OAuth Apps → New OAuth App
2. Fill in:
   - **Application name**: PixelGrapher
   - **Homepage URL**: `http://localhost:5174`
   - **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
3. Copy **Client ID** and generate **Client Secret**
4. Create `.env` in `backend/` folder:
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
SESSION_SECRET=your-random-secret-key
```

### 3. Run Development Servers
```bash
# Terminal 1 - Backend (port 3000)
cd backend && npm run dev

# Terminal 2 - Frontend (port 5174)
cd frontend && npm run dev
```

Open http://localhost:5174 in your browser.

---

## �🚀 Deploy

### Frontend → Vercel
1. Root directory: `frontend`
2. Build: `npm run build`
3. Env: `VITE_API_URL=https://your-backend.railway.app`

### Backend → Railway
1. Root directory: `backend`
2. Start: `npm start`
3. Env variables:
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`
   - `GITHUB_CALLBACK_URL` (point to Railway backend)
   - `SESSION_SECRET`

---

## 📖 Local Development

```bash
# Frontend (Terminal 1)
cd frontend
npm install
npm run dev
# http://localhost:5173

# Backend (Terminal 2)
cd backend
npm install
cp .env.example .env  # Configure GitHub OAuth
npm run dev
# http://localhost:3000
```

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui
- **Backend**: Express.js, Node.js, TypeScript
- **Auth**: GitHub OAuth 2.0
- **Deploy**: Vercel (frontend), Railway (backend)

---

## 📄 License

MIT License. Inspired by [GitFiti](https://github.com/gelstudios/gitfiti)

---

⭐ Star this repo if you like it!
