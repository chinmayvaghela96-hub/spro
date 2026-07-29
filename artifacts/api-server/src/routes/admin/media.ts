import { Router } from "express";
import fs from "fs";
import path from "path";
import { db, media, albums } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";
import { upload } from "../../middlewares/upload";

const router = Router();

// ==========================================
// MEDIA LIBRARY
// ==========================================

// Get all media files
router.get("/media", async (req, res) => {
  try {
    const list = await db.select().from(media).orderBy(desc(media.createdAt));
    const mapped = list.map(item => ({
      id: item.id,
      filename: path.basename(item.fileUrl),
      originalName: item.name,
      mimeType: item.fileType,
      size: item.fileSize,
      url: item.fileUrl,
      createdAt: item.createdAt,
    }));
    res.json(mapped);
  } catch (error) {
    req.log.error(error, "Get media files error");
    res.status(500).json({ error: "Internal server error retrieving media files" });
  }
});

// Upload media file
router.post("/media", requireAuth, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      res.status(400).json({ error: "No file uploaded" });
      return;
    }

    const { name, albumId } = req.body;
    const fileUrl = `/uploads/${req.file.filename}`;

    const [inserted] = await db
      .insert(media)
      .values({
        name: name || req.file.originalname,
        fileUrl,
        fileType: req.file.mimetype,
        fileSize: req.file.size,
        albumId: albumId ? Number(albumId) : null,
      })
      .returning();

    const mapped = {
      id: inserted.id,
      filename: req.file.filename,
      originalName: inserted.name,
      mimeType: inserted.fileType,
      size: inserted.fileSize,
      url: inserted.fileUrl,
      createdAt: inserted.createdAt,
    };

    res.status(201).json(mapped);
  } catch (error) {
    req.log.error(error, "Upload media error");
    res.status(500).json({ error: "Internal server error uploading file" });
  }
});

// Delete media file
router.delete("/media/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [mediaItem] = await db
      .select()
      .from(media)
      .where(eq(media.id, Number(id)))
      .limit(1);

    if (!mediaItem) {
      res.status(404).json({ error: "Media item not found" });
      return;
    }

    // Delete record from DB
    await db.delete(media).where(eq(media.id, Number(id)));

    // Try deleting physical file from disk
    try {
      const fileName = path.basename(mediaItem.fileUrl);
      const filePath = path.resolve(process.cwd(), "uploads", fileName);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (fsErr) {
      req.log.error(fsErr, "Failed to delete file from disk");
      // Continue even if disk deletion fails, to keep DB in sync
    }

    res.json({ success: true, message: "Media item deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete media error");
    res.status(500).json({ error: "Internal server error deleting media item" });
  }
});


// ==========================================
// PHOTO ALBUMS
// ==========================================

// Get all albums
router.get("/albums", async (req, res) => {
  try {
    const list = await db.select().from(albums).orderBy(desc(albums.createdAt));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get albums error");
    res.status(500).json({ error: "Internal server error retrieving albums" });
  }
});

// Create album
router.post("/albums", requireAuth, async (req, res) => {
  try {
    const { name, description, coverUrl } = req.body;

    if (!name) {
      res.status(400).json({ error: "Album name is required" });
      return;
    }

    const [inserted] = await db
      .insert(albums)
      .values({
        name,
        description: description || "",
        coverUrl: coverUrl || null,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create album error");
    res.status(500).json({ error: "Internal server error creating album" });
  }
});

// Update album
router.put("/albums/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, coverUrl } = req.body;

    const [updated] = await db
      .update(albums)
      .set({
        name,
        description,
        coverUrl,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(albums.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Album not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update album error");
    res.status(500).json({ error: "Internal server error updating album" });
  }
});

// Delete album
router.delete("/albums/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(albums)
      .where(eq(albums.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Album not found" });
      return;
    }

    res.json({ success: true, message: "Album deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete album error");
    res.status(500).json({ error: "Internal server error deleting album" });
  }
});

export default router;
