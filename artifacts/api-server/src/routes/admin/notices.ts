import { Router } from "express";
import { db, notices } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all notices
router.get("/notices", async (req, res) => {
  try {
    const list = await db.select().from(notices).orderBy(desc(notices.isPinned), desc(notices.createdAt));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get notices error");
    res.status(500).json({ error: "Internal server error retrieving notices" });
  }
});

// Create notice
router.post("/notices", requireAuth, async (req, res) => {
  try {
    const { title, description, fileUrl, expiryDate, isPinned } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const [inserted] = await db
      .insert(notices)
      .values({
        title,
        description: description || "",
        fileUrl: fileUrl || null,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        isPinned: isPinned === true || isPinned === "true",
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create notice error");
    res.status(500).json({ error: "Internal server error creating notice" });
  }
});

// Update notice
router.put("/notices/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, fileUrl, expiryDate, isPinned } = req.body;

    const [updated] = await db
      .update(notices)
      .set({
        title,
        description,
        fileUrl,
        expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        isPinned: isPinned === true || isPinned === "true",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(notices.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Notice not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update notice error");
    res.status(500).json({ error: "Internal server error updating notice" });
  }
});

// Delete notice
router.delete("/notices/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(notices)
      .where(eq(notices.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Notice not found" });
      return;
    }

    res.json({ success: true, message: "Notice deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete notice error");
    res.status(500).json({ error: "Internal server error deleting notice" });
  }
});

export default router;
