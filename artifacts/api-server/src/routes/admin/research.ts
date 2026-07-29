import { Router } from "express";
import { db, researchAreas, publications } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// ==========================================
// RESEARCH AREAS
// ==========================================

// Get all areas
router.get("/research/areas", async (req, res) => {
  try {
    const list = await db.select().from(researchAreas).orderBy(asc(researchAreas.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get research areas error");
    res.status(500).json({ error: "Internal server error retrieving research areas" });
  }
});

// Create area
router.post("/research/areas", requireAuth, async (req, res) => {
  try {
    const { title, description, imageUrl, link, openInNewTab, order } = req.body;

    if (!title) {
      res.status(400).json({ error: "Title is required" });
      return;
    }

    const [inserted] = await db
      .insert(researchAreas)
      .values({
        title,
        description: description || "",
        imageUrl: imageUrl || null,
        link: link || null,
        openInNewTab: openInNewTab ?? false,
        order: order || 0,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create research area error");
    res.status(500).json({ error: "Internal server error creating research area" });
  }
});

// Update area
router.put("/research/areas/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, imageUrl, link, openInNewTab, order } = req.body;

    const [updated] = await db
      .update(researchAreas)
      .set({
        title,
        description,
        imageUrl,
        link,
        openInNewTab,
        order,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(researchAreas.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Research area not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update research area error");
    res.status(500).json({ error: "Internal server error updating research area" });
  }
});

// Delete area
router.delete("/research/areas/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(researchAreas)
      .where(eq(researchAreas.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Research area not found" });
      return;
    }

    res.json({ success: true, message: "Research area deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete research area error");
    res.status(500).json({ error: "Internal server error deleting research area" });
  }
});


// ==========================================
// PUBLICATIONS
// ==========================================

// Get all publications
router.get("/research/publications", async (req, res) => {
  try {
    const list = await db.select().from(publications).orderBy(asc(publications.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get publications error");
    res.status(500).json({ error: "Internal server error retrieving publications" });
  }
});

// Create publication
router.post("/research/publications", requireAuth, async (req, res) => {
  try {
    const { title, authors, journal, year, pdfUrl, link, openInNewTab, order } = req.body;

    if (!title || !authors || !journal || !year) {
      res.status(400).json({ error: "Title, authors, journal, and year are required" });
      return;
    }

    const [inserted] = await db
      .insert(publications)
      .values({
        title,
        authors,
        journal,
        year: Number(year),
        pdfUrl: pdfUrl || null,
        link: link || null,
        openInNewTab: openInNewTab ?? true,
        order: order || 0,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create publication error");
    res.status(500).json({ error: "Internal server error creating publication" });
  }
});

// Update publication
router.put("/research/publications/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, authors, journal, year, pdfUrl, link, openInNewTab, order } = req.body;

    const [updated] = await db
      .update(publications)
      .set({
        title,
        authors,
        journal,
        year: year ? Number(year) : undefined,
        pdfUrl,
        link,
        openInNewTab,
        order,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(publications.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Publication not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update publication error");
    res.status(500).json({ error: "Internal server error updating publication" });
  }
});

// Delete publication
router.delete("/research/publications/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(publications)
      .where(eq(publications.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Publication not found" });
      return;
    }

    res.json({ success: true, message: "Publication deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete publication error");
    res.status(500).json({ error: "Internal server error deleting publication" });
  }
});

export default router;
