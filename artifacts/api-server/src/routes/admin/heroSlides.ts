import { Router } from "express";
import { db, heroSlides } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all hero slides
router.get("/hero-slides", async (req, res) => {
  try {
    const list = await db.select().from(heroSlides).orderBy(asc(heroSlides.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get hero slides error");
    res.status(500).json({ error: "Internal server error retrieving hero slides" });
  }
});

// Create hero slide
router.post("/hero-slides", requireAuth, async (req, res) => {
  try {
    const { imageUrl, title, subtitle, description, buttonText, buttonLink, openInNewTab, isActive, order } = req.body;

    if (!imageUrl) {
      res.status(400).json({ error: "Image URL is required" });
      return;
    }

    const [inserted] = await db
      .insert(heroSlides)
      .values({
        imageUrl,
        title: title || "",
        subtitle: subtitle || "",
        description: description || "",
        buttonText: buttonText || "",
        buttonLink: buttonLink || "",
        openInNewTab: openInNewTab === true || openInNewTab === "true",
        isActive: isActive === undefined ? true : (isActive === true || isActive === "true"),
        order: order ? Number(order) : 0,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create hero slide error");
    res.status(500).json({ error: "Internal server error creating hero slide" });
  }
});

// Update hero slide
router.put("/hero-slides/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, title, subtitle, description, buttonText, buttonLink, openInNewTab, isActive, order } = req.body;

    const [updated] = await db
      .update(heroSlides)
      .set({
        imageUrl,
        title: title || "",
        subtitle: subtitle || "",
        description: description || "",
        buttonText: buttonText || "",
        buttonLink: buttonLink || "",
        openInNewTab: openInNewTab === true || openInNewTab === "true",
        isActive: isActive === true || isActive === "true",
        order: order ? Number(order) : 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(heroSlides.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Hero slide not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update hero slide error");
    res.status(500).json({ error: "Internal server error updating hero slide" });
  }
});

// Reorder hero slides
router.put("/hero-slides-reorder", requireAuth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: "Items array is required" });
      return;
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(heroSlides)
          .set({ order: item.order, updatedAt: new Date().toISOString() })
          .where(eq(heroSlides.id, item.id));
      }
    });

    res.json({ success: true, message: "Hero slides reordered successfully" });
  } catch (error) {
    req.log.error(error, "Reorder hero slides error");
    res.status(500).json({ error: "Internal server error reordering hero slides" });
  }
});

// Delete hero slide
router.delete("/hero-slides/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(heroSlides)
      .where(eq(heroSlides.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Hero slide not found" });
      return;
    }

    res.json({ success: true, message: "Hero slide deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete hero slide error");
    res.status(500).json({ error: "Internal server error deleting hero slide" });
  }
});

export default router;
