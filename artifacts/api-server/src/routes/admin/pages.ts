import { Router } from "express";
import { db, pages } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all custom pages
router.get("/pages", async (req, res) => {
  try {
    const list = await db.select().from(pages).orderBy(asc(pages.order), asc(pages.id));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get custom pages error");
    res.status(500).json({ error: "Internal server error retrieving pages" });
  }
});

// Get a single custom page detail
router.get("/pages/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const [pageItem] = await db
      .select()
      .from(pages)
      .where(eq(pages.id, Number(id)))
      .limit(1);

    if (!pageItem) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    res.json(pageItem);
  } catch (error) {
    req.log.error(error, "Get custom page detail error");
    res.status(500).json({ error: "Internal server error retrieving page details" });
  }
});

// Create new page
router.post("/pages", requireAuth, async (req, res) => {
  try {
    const { title, slug, subtitle, description, heroImage, isActive, showInMenu, order, seoTitle, seoDescription, seoKeywords } = req.body;

    if (!title || !slug) {
      res.status(400).json({ error: "Page Title and URL slug are required" });
      return;
    }

    // Sanitize slug
    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-");

    // Check slug duplicate
    const [existing] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, cleanSlug))
      .limit(1);

    if (existing) {
      res.status(400).json({ error: `A page with URL slug "${cleanSlug}" already exists.` });
      return;
    }

    const [inserted] = await db
      .insert(pages)
      .values({
        title,
        slug: cleanSlug,
        subtitle: subtitle || "",
        description: description || "",
        heroImage: heroImage || null,
        isActive: isActive === undefined ? true : (isActive === true || isActive === "true"),
        showInMenu: showInMenu === undefined ? true : (showInMenu === true || showInMenu === "true"),
        order: order ? Number(order) : 0,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || description || "",
        seoKeywords: seoKeywords || "",
        sections: [],
        gallery: [],
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create custom page error");
    res.status(500).json({ error: "Internal server error creating page" });
  }
});

// Update page
router.put("/pages/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      slug,
      subtitle,
      description,
      heroImage,
      isActive,
      showInMenu,
      order,
      seoTitle,
      seoDescription,
      seoKeywords,
      sections,
      gallery,
    } = req.body;

    if (!title || !slug) {
      res.status(400).json({ error: "Page Title and URL slug are required" });
      return;
    }

    const cleanSlug = slug.toLowerCase().replace(/[^a-z0-9-_]/g, "-").replace(/-+/g, "-");

    // Check slug duplicate (excluding current page ID)
    const [existing] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, cleanSlug))
      .limit(1);

    if (existing && existing.id !== Number(id)) {
      res.status(400).json({ error: `A page with URL slug "${cleanSlug}" already exists.` });
      return;
    }

    const [updated] = await db
      .update(pages)
      .set({
        title,
        slug: cleanSlug,
        subtitle: subtitle || "",
        description: description || "",
        heroImage: heroImage || null,
        isActive: isActive === true || isActive === "true",
        showInMenu: showInMenu === true || showInMenu === "true",
        order: order !== undefined ? Number(order) : undefined,
        seoTitle: seoTitle || "",
        seoDescription: seoDescription || "",
        seoKeywords: seoKeywords || "",
        sections: sections ? (typeof sections === "string" ? JSON.parse(sections) : sections) : undefined,
        gallery: gallery ? (typeof gallery === "string" ? JSON.parse(gallery) : gallery) : undefined,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(pages.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update custom page error");
    res.status(500).json({ error: "Internal server error updating page" });
  }
});

// Reorder pages
router.put("/pages-reorder", requireAuth, async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: "Items array is required" });
      return;
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(pages)
          .set({ order: item.order, updatedAt: new Date().toISOString() })
          .where(eq(pages.id, item.id));
      }
    });

    res.json({ success: true, message: "Pages reordered successfully" });
  } catch (error) {
    req.log.error(error, "Reorder pages error");
    res.status(500).json({ error: "Internal server error reordering pages" });
  }
});

// Delete page
router.delete("/pages/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(pages)
      .where(eq(pages.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Page not found" });
      return;
    }

    res.json({ success: true, message: "Page deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete page error");
    res.status(500).json({ error: "Internal server error deleting page" });
  }
});

export default router;
