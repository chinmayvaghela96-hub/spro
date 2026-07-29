import { Router } from "express";
import { db, softwareItems } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all software items
router.get("/software", async (req, res) => {
  try {
    const list = await db.select().from(softwareItems).orderBy(asc(softwareItems.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get software items error");
    res.status(500).json({ error: "Internal server error retrieving software items" });
  }
});

// Create software item
router.post("/software", requireAuth, async (req, res) => {
  try {
    const { title, description, icon, link, order } = req.body;

    if (!title || !description || !icon) {
      res.status(400).json({ error: "Title, description, and icon are required" });
      return;
    }

    const [inserted] = await db
      .insert(softwareItems)
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
    req.log.error(error, "Create software item error");
    res.status(500).json({ error: "Internal server error creating software item" });
  }
});

// Update software item
router.put("/software/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, link, order } = req.body;

    const [updated] = await db
      .update(softwareItems)
      .set({
        title,
        description,
        icon,
        link,
        order: order ? Number(order) : 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(softwareItems.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Software item not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update software item error");
    res.status(500).json({ error: "Internal server error updating software item" });
  }
});

// Delete software item
router.delete("/software/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(softwareItems)
      .where(eq(softwareItems.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Software item not found" });
      return;
    }

    res.json({ success: true, message: "Software item deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete software item error");
    res.status(500).json({ error: "Internal server error deleting software item" });
  }
});

export default router;
