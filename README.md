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

## 🚀 Deploy

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
