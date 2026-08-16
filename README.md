<div align="center">
  <h1>PixelGrapher</h1>
  <p><em>Paint your GitHub contribution graph like a digital canvas.</em></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5-purple.svg)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
  
  [**Live Demo**](https://pixel-grapher.vercel.app/) • [**Report Bug**](https://github.com/WulfaW/PixelGrapher/issues)
</div>

<br />

> **Note to Maintainer:** Place a high-quality screenshot of the PixelGrapher UI in the `docs/` folder named `hero.png` to make this README pop!
> 
> `![PixelGrapher Hero UI](./docs/hero.png)`

## ✨ Features

PixelGrapher is a premium SaaS-like tool that allows you to transform your standard GitHub contribution calendar into personalized art.

* **🎨 52x7 Contribution Canvas**: A fully interactive drawing board matching GitHub's exact contribution graph dimensions.
* **🤖 Text-to-Pattern Engine**: Simply type a word and our engine instantly converts it into perfectly aligned pixel art.
* **📚 Quick Templates**: Jumpstart your creativity with pre-made templates like Space Invader, Heart, Checkmark, and more.
* **🔒 Privacy-First Auth**: Secure GitHub OAuth integration. Tokens are stored locally in your browser and never persisted in our database.
* **💾 Local Auto-Save**: Your work is automatically saved to your browser so you never lose your progress.
* **📦 Export & Import**: Save your masterpieces as `.json` files for backup or share them as `.png` images.
* **🌓 Beautiful UI**: A highly polished, responsive interface with deep Dark Mode and premium Light Mode support.

## 🚀 How It Works

1. **Design**: Use our canvas tools (Pencil, Eraser, Undo/Redo) to draw your art.
2. **Connect**: Sign in via GitHub OAuth and select a repository. *(We highly recommend using a fresh, empty repository specifically for this purpose).*
3. **Generate**: PixelGrapher creates local, backdated commits corresponding to your drawing and securely pushes them to your selected repository. Your GitHub profile updates instantly!

## 🏗️ Architecture & Tech Stack

PixelGrapher uses a decoupled frontend-backend architecture:

* **Frontend (Vercel)**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui.
* **Backend (Render)**: Express.js, Node.js, `isomorphic-git` (for creating bare-metal commits without git binary dependencies).
* **Auth**: GitHub OAuth 2.0 (Dual `localStorage`/`sessionStorage` fallback for enhanced privacy browser compatibility).

## 💻 Local Setup

### Prerequisites
* Node.js 18+
* A GitHub account

### 1. GitHub OAuth App Setup
To run PixelGrapher locally, you need a GitHub OAuth App:
1. Go to `GitHub Settings > Developer Settings > OAuth Apps > New OAuth App`.
2. **Homepage URL**: `http://localhost:5173` (or your frontend port)
3. **Callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Copy your `Client ID` and generate a `Client Secret`.

### 2. Backend Setup
```bash
git clone https://github.com/WulfaW/PixelGrapher.git
cd PixelGrapher/backend

npm install
```
Create a `.env` file in the `backend/` directory:
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=generate_a_random_string
```
Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup
Open a new terminal:
```bash
cd PixelGrapher/frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

## 🤝 Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---
<div align="center">
  Made with 💚 and ASCII by WulfaW
</div>
