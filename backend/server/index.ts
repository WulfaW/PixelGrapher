import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import cors from "cors";
import { registerRoutes } from "./routes.js";
import { log } from "./vite.js";
import crypto from "crypto";

const app = express();
app.set("trust proxy", true); // Trust all proxies for Railway/Vercel chain

// CORS configuration - allow development and production
const allowedOrigins = [
  "https://pixel-grapher.vercel.app",
  "https://pixelgrapher.vercel.app",
  process.env.FRONTEND_URL || "",
  "http://localhost:5174",
  "http://localhost:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5173",
];

app.use(cors({
  origin: (origin, callback) => {
    // Mobile apps or server-to-server requests
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app') || origin.endsWith('.railway.app')) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Generate session secret if not provided
const sessionSecret = process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');
const isProduction = process.env.NODE_ENV === "production" || !!process.env.RAILWAY_ENVIRONMENT;

console.log('Session Config:', {
  isProduction,
  sameSite: isProduction ? 'none' : 'lax',
  secure: isProduction
});

// Session middleware - GitHub OAuth için gerekli
app.use(
  session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    proxy: true, // Important for Railway
    cookie: {
      secure: isProduction, // Must be true for sameSite: 'none'
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: isProduction ? "none" : "lax", // 'none' required for cross-site (Vercel->Railway)
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // Backend API server only - frontend is deployed separately on Vercel
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
