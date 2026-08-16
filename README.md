<div align="center">
  <img src="https://placehold.co/1200x400/0d1117/4ade80?text=PixelGrapher+Banner" alt="PixelGrapher Banner" />
  
  <br/>
  <h1>🎨 PixelGrapher</h1>
  <p><strong>Transform your GitHub contribution graph into a digital canvas.</strong></p>

  [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat-square&logo=vercel)](https://pixel-grapher.vercel.app/)
  [![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://reactjs.org/)
  [![License](https://img.shields.io/badge/License-MIT-4ade80?style=flat-square)](#license)
  
  <br/>
  <br/>

  [**Start Drawing Now**](https://pixel-grapher.vercel.app/) &nbsp;•&nbsp; [**Report a Bug**](https://github.com/WulfaW/PixelGrapher/issues)
</div>

<br/>

## ✨ Why PixelGrapher?

Why settle for random green squares when you can tell a story? PixelGrapher is a web-based tool that lets you literally "paint" on your GitHub contribution calendar. Design your art, connect your account, and we securely push backdated commits to an empty repository to make your profile stand out.

---

## 🚀 Stunning Features

<table>
  <tr>
    <td width="50%" align="center">
      <img src="https://placehold.co/600x400/161b22/4ade80?text=52x7+Canvas" alt="Canvas Editor" />
    </td>
    <td width="50%">
      <h3>🖌️ 52x7 Interactive Canvas</h3>
      <p>A fully featured drawing board that maps exactly to GitHub's contribution layout. Includes pencil, eraser, undo/redo, and color intensity tools.</p>
    </td>
  </tr>
  <tr>
    <td width="50%">
      <h3>🤖 AI Text-to-Pattern</h3>
      <p>Don't want to draw? Just type! Our built-in AI engine instantly converts any word (up to 13 characters) into perfectly aligned pixel art.</p>
    </td>
    <td width="50%" align="center">
      <img src="https://placehold.co/600x400/161b22/4ade80?text=Text+to+Pattern" alt="AI Generator" />
    </td>
  </tr>
  <tr>
    <td width="50%" align="center">
      <img src="https://placehold.co/600x400/161b22/4ade80?text=One-Click+Templates" alt="Templates" />
    </td>
    <td width="50%">
      <h3>📚 One-Click Templates</h3>
      <p>Jumpstart your creativity with pre-made templates. Space Invaders, Mario Mushrooms, Hearts, and more—ready to deploy with a single click.</p>
    </td>
  </tr>
</table>

---

## 🔒 Privacy & Security

We take your GitHub account seriously. 
* **Zero Database:** We don't have a database. Your GitHub tokens are never stored on our servers.
* **Local Storage:** All authentication happens via dual `localStorage` / `sessionStorage`.
* **Bare-Metal Commits:** We use `isomorphic-git` to generate commits directly in memory without requiring server-side git binaries.

<br/>

## 👨‍💻 For Developers (Run Locally)

<details>
<summary><strong>Click to expand setup instructions</strong></summary>
<br/>

We've made local setup as painless as possible.

### 1. GitHub OAuth Setup
1. Go to `GitHub Settings > Developer Settings > OAuth Apps > New OAuth App`.
2. **Homepage URL**: `http://localhost:5173`
3. **Callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Copy your `Client ID` and generate a `Client Secret`.

### 2. Backend Setup
```bash
git clone https://github.com/WulfaW/PixelGrapher.git
cd PixelGrapher/backend
npm install
```
Create a `.env` file:
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=secure_random_string
```
Start server:
```bash
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.
</details>

<br/>

## 🤝 Contributing & License
We love open source! Feel free to fork this project, submit PRs, or open issues. PixelGrapher is released under the **MIT License**.

<br/>
<div align="center">
  <p>Made with 💚 and ASCII by <b>WulfaW</b></p>
</div>
