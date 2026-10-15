import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Vite is only used by Vitest now; the app itself is built by Next.js.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
      "@shared": resolve(__dirname, "src/shared"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "src/setupTests.ts",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
  },
});
