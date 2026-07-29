import { Router } from "express";
import { db, services } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all services
router.get("/services", async (req, res) => {
  try {
    const list = await db.select().from(services).orderBy(asc(services.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get services error");
    res.status(500).json({ error: "Internal server error retrieving services" });
  }
});

// Create service
router.post("/services", requireAuth, async (req, res) => {
  try {
    const { title, description, icon, details, link, order } = req.body;

    if (!title || !description || !icon) {
      res.status(400).json({ error: "Title, description, and icon are required" });
      return;
    }

    const [inserted] = await db
      .insert(services)
      .values({
        title,
        description,
        icon,
        details: details || [],
        link,
        order: order ? Number(order) : 0,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create service error");
    res.status(500).json({ error: "Internal server error creating service" });
  }
});

// Update service
router.put("/services/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, icon, details, link, order } = req.body;

    const [updated] = await db
      .update(services)
      .set({
        title,
        description,
        icon,
        details,
        link,
        order: order ? Number(order) : 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(services.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update service error");
    res.status(500).json({ error: "Internal server error updating service" });
  }
});

// Reorder services
router.put("/services/reorder", requireAuth, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id: number, order: number }

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: "Items array is required" });
      return;
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(services)
          .set({ order: item.order, updatedAt: new Date().toISOString() })
          .where(eq(services.id, item.id));
      }
    });

    res.json({ success: true, message: "Services reordered successfully" });
  } catch (error) {
    req.log.error(error, "Reorder services error");
    res.status(500).json({ error: "Internal server error reordering services" });
  }
});

// Delete service
router.delete("/services/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(services)
      .where(eq(services.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Service not found" });
      return;
    }

    res.json({ success: true, message: "Service deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete service error");
    res.status(500).json({ error: "Internal server error deleting service" });
  }
});

export default router;
