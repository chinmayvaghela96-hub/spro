import { Router } from "express";
import path from "path";
import fs from "fs";
// archiver v8 is ESM with named exports only - there is no callable default.
import { ZipArchive } from "archiver";
import { persist } from "@workspace/db";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

const dbPath = path.resolve(process.cwd(), "sustainpro.db");
const uploadsPath = path.resolve(process.cwd(), "uploads");

function countUploads(): { files: number; bytes: number } {
  if (!fs.existsSync(uploadsPath)) return { files: 0, bytes: 0 };
  let files = 0;
  let bytes = 0;
  for (const entry of fs.readdirSync(uploadsPath, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    files += 1;
    bytes += fs.statSync(path.resolve(uploadsPath, entry.name)).size;
  }
  return { files, bytes };
}

// Summary shown on the Backup page before downloading.
router.get("/backup/status", requireAuth, (req, res) => {
  try {
    // Flush the in-memory database so the reported size matches what a download
    // would contain. Without this the file on disk can be up to 10s behind.
    persist();

    const uploads = countUploads();
    const dbBytes = fs.existsSync(dbPath) ? fs.statSync(dbPath).size : 0;

    res.json({
      databaseBytes: dbBytes,
      uploadFiles: uploads.files,
      uploadBytes: uploads.bytes,
      totalBytes: dbBytes + uploads.bytes,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    req.log.error(error, "Backup status error");
    res.status(500).json({ error: "Internal server error reading backup status" });
  }
});

// Streams a zip containing the SQLite database and every uploaded file.
router.get("/backup/export", requireAuth, (req, res) => {
  try {
    // The database lives in memory via sql.js and is only written to disk every 10
    // seconds, so flush first or the export can silently miss recent admin edits.
    persist();

    if (!fs.existsSync(dbPath)) {
      res.status(404).json({ error: "Database file not found" });
      return;
    }

    const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
    const filename = `sustainpro-backup-${stamp}.zip`;

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    const archive = new ZipArchive({ zlib: { level: 9 } });

    archive.on("warning", (err: Error) => {
      req.log.warn({ err }, "Backup archive warning");
    });

    archive.on("error", (err: Error) => {
      req.log.error({ err }, "Backup archive error");
      // Headers are already sent once streaming starts, so the only honest signal
      // left is to break the connection rather than deliver a truncated zip that
      // looks like a valid backup.
      res.destroy(err);
    });

    archive.pipe(res);

    archive.file(dbPath, { name: "sustainpro.db" });

    if (fs.existsSync(uploadsPath)) {
      archive.directory(uploadsPath, "uploads");
    }

    const uploads = countUploads();
    archive.append(
      JSON.stringify(
        {
          createdAt: new Date().toISOString(),
          databaseFile: "sustainpro.db",
          uploadFiles: uploads.files,
          restore:
            "Stop the API server, copy sustainpro.db to the project root and the uploads folder alongside it, then start the server again.",
        },
        null,
        2,
      ),
      { name: "backup-info.json" },
    );

    void archive.finalize();
  } catch (error) {
    req.log.error(error, "Backup export error");
    if (!res.headersSent) {
      res.status(500).json({ error: "Internal server error creating backup" });
    }
  }
});

export default router;
