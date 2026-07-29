import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  base: "/admin/",
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist"),
    emptyOutDir: true,
  },
  server: {
    port: Number(process.env.PORT || process.env.ADMIN_PORT || "5174"),
    strictPort: false,
    host: "0.0.0.0",
    proxy: {
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
});
