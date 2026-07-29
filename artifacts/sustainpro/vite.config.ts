import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

const rawPort = process.env.PORT || "5000";
const port = Number(rawPort);
const basePath = process.env.BASE_PATH || "/";

// The admin dev server runs with base "/admin/", and Vite answers a bare "/admin"
// with a "did you mean /admin/?" hint page instead of redirecting. In production
// Express 301s "/admin" -> "/admin/", so redirect here too and keep the two matched.
function adminTrailingSlashRedirect() {
  return {
    name: "admin-trailing-slash-redirect",
    configureServer(server: { middlewares: { use: (fn: (req: any, res: any, next: () => void) => void) => void } }) {
      server.middlewares.use((req, res, next) => {
        const url: string = req.url || "";
        if (url === "/admin" || url.startsWith("/admin?")) {
          res.statusCode = 301;
          res.setHeader("Location", url.replace(/^\/admin/, "/admin/"));
          res.end();
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    adminTrailingSlashRedirect(),
    react(),
    tailwindcss(),
    runtimeErrorOverlay(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: false,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    proxy: {
      // Proxy admin dashboard to its own dev server
      "/admin": {
        target: `http://localhost:${process.env.ADMIN_PORT || "5174"}`,
        changeOrigin: true,
        ws: true,
      },
      "/api": {
        target: `http://localhost:${process.env.API_PORT || "3001"}`,
        changeOrigin: true,
      },
      "/uploads": {
        target: `http://localhost:${process.env.API_PORT || "3001"}`,
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
