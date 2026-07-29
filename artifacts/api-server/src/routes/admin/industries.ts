import { Router } from "express";
import { db, industries } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all industries
router.get("/industries", async (req, res) => {
  try {
    const list = await db.select().from(industries).orderBy(asc(industries.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get industries error");
    res.status(500).json({ error: "Internal server error retrieving industries" });
  }
});

// Create industry
router.post("/industries", requireAuth, async (req, res) => {
  try {
    const { name, description, icon, link, order } = req.body;

    if (!name || !description || !icon) {
      res.status(400).json({ error: "Name, description, and icon are required" });
      return;
    }

    const [inserted] = await db
      .insert(industries)
      .values({
        name,
        description,
        icon,
        link,
        order: order ? Number(order) : 0,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create industry error");
    res.status(500).json({ error: "Internal server error creating industry" });
  }
});

// Reorder industries
// NOTE: must be registered before "/industries/:id" or Express matches this as id="reorder".
router.put("/industries/reorder", requireAuth, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id: number, order: number }

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: "Items array is required" });
      return;
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(industries)
          .set({ order: Number(item.order), updatedAt: new Date().toISOString() })
          .where(eq(industries.id, Number(item.id)));
      }
    });

    res.json({ success: true, message: "Industries reordered successfully" });
  } catch (error) {
    req.log.error(error, "Reorder industries error");
    res.status(500).json({ error: "Internal server error reordering industries" });
  }
});

// Update industry
router.put("/industries/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, link, order } = req.body;

    const [updated] = await db
      .update(industries)
      .set({
        name,
        description,
        icon,
        link,
        order: order === undefined || order === null || order === "" ? 0 : Number(order),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(industries.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Industry not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update industry error");
    res.status(500).json({ error: "Internal server error updating industry" });
  }
});

// Delete industry
router.delete("/industries/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(industries)
      .where(eq(industries.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Industry not found" });
      return;
    }

    res.json({ success: true, message: "Industry deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete industry error");
    res.status(500).json({ error: "Internal server error deleting industry" });
  }
});

export default router;
