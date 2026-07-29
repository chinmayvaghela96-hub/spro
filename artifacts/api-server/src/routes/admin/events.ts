import { Router } from "express";
import { db, events } from "@workspace/db";
import { eq, asc, desc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all events
router.get("/events", async (req, res) => {
  try {
    const list = await db.select().from(events).orderBy(desc(events.createdAt));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get events error");
    res.status(500).json({ error: "Internal server error retrieving events" });
  }
});

// Create event
router.post("/events", requireAuth, async (req, res) => {
  try {
    const { title, description, date, eventTimestamp, venue, bannerUrl, type, registrationLink, galleryUrls, isArchived, order } = req.body;

    if (!title || !date || !type) {
      res.status(400).json({ error: "Title, date, and type are required" });
      return;
    }

    const [inserted] = await db
      .insert(events)
      .values({
        title,
        description: description || "",
        date,
        eventTimestamp: eventTimestamp ? new Date(eventTimestamp).toISOString() : null,
        venue: venue || "Online",
        bannerUrl: bannerUrl || null,
        type,
        registrationLink: registrationLink || null,
        galleryUrls: galleryUrls || [],
        isArchived: isArchived === true || isArchived === "true",
        order: order ? Number(order) : 0,
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create event error");
    res.status(500).json({ error: "Internal server error creating event" });
  }
});

// Update event
router.put("/events/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, date, eventTimestamp, venue, bannerUrl, type, registrationLink, galleryUrls, isArchived, order } = req.body;

    const [updated] = await db
      .update(events)
      .set({
        title,
        description,
        date,
        eventTimestamp: eventTimestamp ? new Date(eventTimestamp).toISOString() : undefined,
        venue,
        bannerUrl,
        type,
        registrationLink,
        galleryUrls,
        isArchived: isArchived === true || isArchived === "true",
        order: order ? Number(order) : 0,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(events.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update event error");
    res.status(500).json({ error: "Internal server error updating event" });
  }
});

// Delete event
router.delete("/events/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(events)
      .where(eq(events.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Event not found" });
      return;
    }

    res.json({ success: true, message: "Event deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete event error");
    res.status(500).json({ error: "Internal server error deleting event" });
  }
});

export default router;
