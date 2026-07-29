import { Router } from "express";
import { db, events } from "@workspace/db";
import { eq, and, asc } from "drizzle-orm";

const router = Router();

router.get("/events", async (req, res) => {
  try {
    const list = await db
      .select()
      .from(events)
      .where(eq(events.isArchived, false))
      .orderBy(asc(events.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get public events error");
    res.status(500).json({ error: "Internal server error retrieving events list" });
  }
});

export default router;
