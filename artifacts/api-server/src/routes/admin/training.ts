import { Router } from "express";
import { db, trainingTypes } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all training types
router.get("/training", async (req, res) => {
  try {
    const list = await db.select().from(trainingTypes).orderBy(asc(trainingTypes.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get training types error");
    res.status(500).json({ error: "Internal server error retrieving training types" });
  }
});

// Create training type
router.post("/training", requireAuth, async (req, res) => {
  try {
    const { title, description, icon, link, order } = req.body;

    if (!title || !description || !icon) {
      res.status(400).json({ error: "Title, description, and icon are required" });
      return;
    }

    const [inserted] = await db
      .insert(trainingTypes)
      .values({
        title,
        description,
        icon,
        link,
        order: order ? Number(order) : 0,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create training type error");
    res.status(500).json({ error: "Internal server error creating training type" });
  }
});

// Update training type
router.put("/training/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, link, order } = req.body;

    const [updated] = await db
      .update(trainingTypes)
      .set({
        title,
        description,
        icon,
        link,
        order: order ? Number(order) : 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(trainingTypes.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Training type not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update training type error");
    res.status(500).json({ error: "Internal server error updating training type" });
  }
});

// Delete training type
router.delete("/training/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(trainingTypes)
      .where(eq(trainingTypes.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Training type not found" });
      return;
    }

    res.json({ success: true, message: "Training type deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete training type error");
    res.status(500).json({ error: "Internal server error deleting training type" });
  }
});

export default router;
