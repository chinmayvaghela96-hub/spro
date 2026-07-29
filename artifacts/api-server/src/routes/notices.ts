import { Router } from "express";
import { db, notices } from "@workspace/db";
import { and, or, isNull, gt, desc } from "drizzle-orm";

const router = Router();

router.get("/notices", async (req, res) => {
  try {
    const now = new Date().toISOString();
    
    // Select notices where expiry is null OR expiry is in the future
    const list = await db
      .select()
      .from(notices)
      .where(
        or(
          isNull(notices.expiryDate),
          gt(notices.expiryDate, now)
        )
      )
      .orderBy(desc(notices.isPinned), desc(notices.createdAt));

    res.json(list);
  } catch (error) {
    req.log.error(error, "Get public notices error");
    res.status(500).json({ error: "Internal server error retrieving notices list" });
  }
});

export default router;
