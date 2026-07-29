import { Router } from "express";
import { db, navItems } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all nav items
router.get("/nav-items", async (req, res) => {
  try {
    const list = await db.select().from(navItems).orderBy(asc(navItems.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get nav items error");
    res.status(500).json({ error: "Internal server error retrieving nav items" });
  }
});

// Create nav item
router.post("/nav-items", requireAuth, async (req, res) => {
  try {
    const { label, href, order } = req.body;

    if (!label || !href) {
      res.status(400).json({ error: "Label and href are required" });
      return;
    }

    const [inserted] = await db
      .insert(navItems)
      .values({
        label,
        href,
        order: order || 0,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create nav item error");
    res.status(500).json({ error: "Internal server error creating nav item" });
  }
});

// Update nav item by ID
router.put("/nav-items/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { label, href, order } = req.body;

    const [updated] = await db
      .update(navItems)
      .set({
        label,
        href,
        order,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(navItems.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Nav item not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update nav item error");
    res.status(500).json({ error: "Internal server error updating nav item" });
  }
});

// Delete nav item by ID
router.delete("/nav-items/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(navItems)
      .where(eq(navItems.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Nav item not found" });
      return;
    }

    res.json({ success: true, message: "Nav item deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete nav item error");
    res.status(500).json({ error: "Internal server error deleting nav item" });
  }
});

export default router;
