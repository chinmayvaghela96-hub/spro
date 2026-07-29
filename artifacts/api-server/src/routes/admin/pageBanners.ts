import { Router } from "express";
import { db, pageBanners } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all page banners
router.get("/page-banners", async (req, res) => {
  try {
    const list = await db.select().from(pageBanners);
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get page banners error");
    res.status(500).json({ error: "Internal server error retrieving page banners" });
  }
});

// Get banner for a specific page by slug
router.get("/page-banners/:slug", async (req, res) => {
  try {
    const { slug } = req.params;
    const [banner] = await db
      .select()
      .from(pageBanners)
      .where(eq(pageBanners.pageSlug, slug))
      .limit(1);
    res.json(banner || null);
  } catch (error) {
    req.log.error(error, "Get page banner error");
    res.status(500).json({ error: "Internal server error retrieving page banner" });
  }
});

// Create page banner slug
router.post("/page-banners", requireAuth, async (req, res) => {
  try {
    const { pageSlug, title, subtitle, imageUrl, isActive } = req.body;

    if (!pageSlug) {
      res.status(400).json({ error: "Page slug is required" });
      return;
    }

    const [inserted] = await db
      .insert(pageBanners)
      .values({
        pageSlug,
        title: title || "",
        subtitle: subtitle || "",
        imageUrl: imageUrl || null,
        isActive: isActive === undefined ? true : (isActive === true || isActive === "true"),
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create page banner error");
    res.status(500).json({ error: "Internal server error creating page banner" });
  }
});

// Update page banner by ID
router.put("/page-banners/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { pageSlug, title, subtitle, imageUrl, isActive } = req.body;

    const [updated] = await db
      .update(pageBanners)
      .set({
        pageSlug,
        title,
        subtitle,
        imageUrl,
        isActive: isActive === true || isActive === "true",
        updatedAt: new Date().toISOString(),
      })
      .where(eq(pageBanners.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Page banner not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update page banner error");
    res.status(500).json({ error: "Internal server error updating page banner" });
  }
});

// Delete page banner by ID
router.delete("/page-banners/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(pageBanners)
      .where(eq(pageBanners.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Page banner not found" });
      return;
    }

    res.json({ success: true, message: "Page banner deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete page banner error");
    res.status(500).json({ error: "Internal server error deleting page banner" });
  }
});

export default router;
