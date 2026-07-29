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
  // Fallback for HTML5 client-side routing in Admin Dashboard
  app.get(/\/admin(?:\/.*)?$/, (req, res) => {
    res.sendFile(path.resolve(adminDistPath, "index.html"));
  });
} else {
  // Graceful response in development if admin app is not built yet
  app.get(/\/admin(?:\/.*)?$/, (req, res) => {
    res.send("Admin Dashboard Frontend is not built yet. Run `pnpm --filter @workspace/admin run build` or start its dev server.");
  });
}

export default app;
