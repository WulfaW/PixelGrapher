<div align="center">
  <br />
  <br />
  <h1>PixelGrapher</h1>
  <p>A web-based interface for engineering GitHub contribution graphs.</p>

  <br />

  [![License](https://img.shields.io/badge/License-MIT-black.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
  [![React](https://img.shields.io/badge/React-18-black.svg?style=for-the-badge)](https://reactjs.org/)
  [![Vite](https://img.shields.io/badge/Vite-5-black.svg?style=for-the-badge)](https://vitejs.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5-black.svg?style=for-the-badge)](https://www.typescriptlang.org/)
  
  <br />
  <br />

  [Live Demo](https://pixel-grapher.vercel.app/) &nbsp;&middot;&nbsp; [Report Bug](https://github.com/WulfaW/PixelGrapher/issues)
</div>

<br />
<br />

> **Note to Maintainer:** Place a high-resolution screenshot of the PixelGrapher UI in the `docs/` folder named `hero.png`.
> 
> `![PixelGrapher Interface](./docs/hero.png)`

<br />

## Overview

PixelGrapher provides a structured environment to manipulate and customize standard GitHub contribution calendars. It interfaces directly with GitHub repositories via backdated commits to render custom patterns on a user's profile graph.

* **52x7 Contribution Canvas**: An interactive 2D grid mapping precisely to the GitHub contribution calendar layout.
* **Text-to-Pattern Engine**: Algorithmic conversion of string inputs into aligned 52x7 pixel matrices.
* **Component Templates**: Pre-configured structural patterns available for immediate deployment onto the canvas.
* **Stateless Authentication**: OAuth 2.0 integration via GitHub. Access tokens are strictly client-bound and utilize dual `localStorage`/`sessionStorage` fallbacks.
* **Persistent State**: Automated client-side state preservation utilizing standard Web Storage APIs.
* **Data Portability**: Full JSON import and export capabilities for graph states.

<br />

## Workflow

1. **Design**: Construct the target pattern using the 52x7 matrix interface.
2. **Authenticate**: Establish an OAuth session with GitHub and authorize access to a target repository. (A dedicated, empty repository is recommended to isolate commits).
3. **Execute**: The backend engine compiles the matrix data into local, backdated Git commits and synchronizes them with the authorized upstream repository.

<br />

## Architecture

The application operates on a decoupled architecture, isolating the client interface from the Git operations layer.

* **Frontend Environment**: React, TypeScript, Vite, Tailwind CSS, shadcn/ui. (Deployed via Vercel).
* **Backend Environment**: Express.js, Node.js. (Deployed via Render).
* **Git Abstraction**: Uses `isomorphic-git` for native Node.js Git tree manipulation, eliminating host system dependencies on Git binaries.

<br />

## Local Development

### Prerequisites
* Node.js 18.x or higher
* GitHub Account with Developer Settings access

<br />

### 1. GitHub OAuth Configuration
Local authentication requires a registered OAuth application:
1. Navigate to `GitHub Settings > Developer Settings > OAuth Apps > New OAuth App`.
2. **Homepage URL**: `http://localhost:5173`
3. **Authorization callback URL**: `http://localhost:3000/api/auth/github/callback`
4. Generate and secure the `Client ID` and `Client Secret`.

<br />

### 2. Backend Initialization
```bash
git clone https://github.com/WulfaW/PixelGrapher.git
cd PixelGrapher/backend

npm install
```

Configure environment variables in `backend/.env`:
```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/auth/github/callback
FRONTEND_URL=http://localhost:5173
SESSION_SECRET=secure_random_string
```

Execute the development server:
```bash
npm run dev
```

<br />

### 3. Frontend Initialization
Initialize the client application in a parallel terminal:
```bash
cd PixelGrapher/frontend
npm install
npm run dev
```
The interface will be accessible at `http://localhost:5173`.

<br />

## License

Released under the MIT License. Reference the `LICENSE` document for comprehensive terms.

<br />
<br />
<br />

<div align="center">
  Made with 💚 and ASCII by WulfaW
</div>
