import express, { type Express } from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import pinoHttp from "pino-http";
import router from "./routes";
import { logger } from "./lib/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

// Standard security headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable in dev to allow loading various resources easily
    crossOriginEmbedderPolicy: false,
  })
);

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded static files
const uploadsPath = path.resolve(process.cwd(), "uploads");
if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath, { recursive: true });
}
app.use("/uploads", express.static(uploadsPath));

// API routes
app.use("/api", router);

// Serve Admin SPA if built
const adminDistPath = path.resolve(__dirname, "..", "..", "admin", "dist");
if (fs.existsSync(adminDistPath)) {
  app.use("/admin", express.static(adminDistPath));
  // Fallback for HTML5 client-side routing in Admin Dashboard.
  // Anchored at the start: an unanchored /\/admin/ also matched paths like
  // /api/admin/whatever, so unknown admin API routes returned this HTML with a 200
  // instead of a JSON 404.
  app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
    res.sendFile(path.resolve(adminDistPath, "index.html"));
  });
} else {
  // Graceful response in development if admin app is not built yet
  app.get(/^\/admin(?:\/.*)?$/, (req, res) => {
    res.send("Admin Dashboard Frontend is not built yet. Run `pnpm --filter @workspace/admin run build` or start its dev server.");
  });
}

// Serve the public website SPA if built.
// Without this, the site is client-side routed only: loading or refreshing a deep
// link such as /contact hits the server directly and 404s, because nothing returns
// index.html for non-API paths. Registered last so /api, /uploads and /admin win.
const publicDistPath = path.resolve(__dirname, "..", "..", "sustainpro", "dist", "public");
if (fs.existsSync(publicDistPath)) {
  app.use(express.static(publicDistPath));
  // HTML5 history fallback for every non-API, non-upload, non-admin GET.
  app.get(/^(?!\/api\/|\/uploads\/|\/admin(?:\/|$)).*/, (req, res, next) => {
    // Let genuinely missing static assets 404 rather than returning HTML for them.
    if (path.extname(req.path)) {
      next();
      return;
    }
    res.sendFile(path.resolve(publicDistPath, "index.html"));
  });
}

export default app;
