import { Router } from "express";
import { db, galleryPhotos } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all gallery photos
router.get("/gallery", async (req, res) => {
  try {
    const list = await db.select().from(galleryPhotos).orderBy(asc(galleryPhotos.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get gallery photos error");
    res.status(500).json({ error: "Internal server error retrieving gallery photos" });
  }
});

// Create gallery photo
router.post("/gallery", requireAuth, async (req, res) => {
  try {
    const { imageUrl, title, description, category, isActive, order } = req.body;

    if (!imageUrl) {
      res.status(400).json({ error: "Image URL is required" });
      return;
    }

    const [inserted] = await db
      .insert(galleryPhotos)
      .values({
        imageUrl,
        title: title || "",
        description: description || "",
        category: (category || "").trim(),
        isActive: isActive === undefined ? true : (isActive === true || isActive === "true"),
        order: order ? Number(order) : 0,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create gallery photo error");
    res.status(500).json({ error: "Internal server error creating gallery photo" });
  }
});

// Create multiple gallery photos (bulk)
router.post("/gallery/bulk", requireAuth, async (req, res) => {
  try {
    const { images } = req.body;

    if (!images || !Array.isArray(images)) {
      res.status(400).json({ error: "Images array is required" });
      return;
    }

    const insertedItems = [];
    const currentList = await db.select().from(galleryPhotos);
    let nextOrder = currentList.reduce((max, item) => Math.max(max, item.order), -1) + 1;

    for (const img of images) {
      const url = typeof img === "string" ? img : img.imageUrl;
      const title = typeof img === "object" ? img.title : "";
      const description = typeof img === "object" ? img.description : "";
      // A bulk upload is usually one event's photos, so allow a shared category
      // either per-image or once for the whole batch.
      const category = (typeof img === "object" ? img.category : "") || req.body.category || "";

      if (!url) continue;

      const [inserted] = await db
        .insert(galleryPhotos)
        .values({
          imageUrl: url,
          title: title || "",
          description: description || "",
          category: String(category).trim(),
          order: nextOrder++,
          isActive: true,
        })
        .returning();
      insertedItems.push(inserted);
    }

    res.status(201).json(insertedItems);
  } catch (error) {
    req.log.error(error, "Bulk create gallery photos error");
    res.status(500).json({ error: "Internal server error bulk creating gallery photos" });
  }
});


// Update gallery photo
router.put("/gallery/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, title, description, category, isActive, order } = req.body;

    const [updated] = await db
      .update(galleryPhotos)
      .set({
        imageUrl,
        title,
        description,
        category: typeof category === "string" ? category.trim() : category,
        isActive: isActive === true || isActive === "true",
        order: order === undefined || order === null || order === "" ? 0 : Number(order),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(galleryPhotos.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Gallery photo not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update gallery photo error");
    res.status(500).json({ error: "Internal server error updating gallery photo" });
  }
});

// Reorder gallery photos
router.put("/gallery-reorder", requireAuth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: "Items array is required" });
      return;
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(galleryPhotos)
          .set({ order: item.order, updatedAt: new Date().toISOString() })
          .where(eq(galleryPhotos.id, item.id));
      }
    });

    res.json({ success: true, message: "Gallery photos reordered successfully" });
  } catch (error) {
    req.log.error(error, "Reorder gallery photos error");
    res.status(500).json({ error: "Internal server error reordering gallery photos" });
  }
});

// Delete gallery photo
router.delete("/gallery/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(galleryPhotos)
      .where(eq(galleryPhotos.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Gallery photo not found" });
      return;
    }

    res.json({ success: true, message: "Gallery photo deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete gallery photo error");
    res.status(500).json({ error: "Internal server error deleting gallery photo" });
  }
});

export default router;
