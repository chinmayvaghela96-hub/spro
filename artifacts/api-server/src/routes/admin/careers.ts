import { Router } from "express";
import { asc, eq, inArray, notInArray, sql } from "drizzle-orm";
import { db, jobPositions } from "@workspace/db";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

async function getOrderedPositions() {
  return db
    .select()
    .from(jobPositions)
    .orderBy(asc(jobPositions.order), asc(jobPositions.id));
}

// ==========================================
// CAREERS / JOB POSITIONS
// ==========================================

router.get("/careers", async (req, res) => {
  try {
    const positions = await getOrderedPositions();
    res.json(positions);
  } catch (error) {
    req.log.error(error, "Get careers error");
    res.status(500).json({ error: "Internal server error retrieving job positions" });
  }
});

router.put("/careers/selection", requireAuth, async (req, res) => {
  try {
    const { selectedIds } = req.body;

    if (!Array.isArray(selectedIds) || selectedIds.some((id) => typeof id !== "number")) {
      res.status(400).json({ error: "selectedIds must be an array of numbers" });
      return;
    }

    const now = new Date().toISOString();

    if (selectedIds.length === 0) {
      await db.update(jobPositions).set({ isOpen: false, updatedAt: now });
    } else {
      await db
        .update(jobPositions)
        .set({ isOpen: true, updatedAt: now })
        .where(inArray(jobPositions.id, selectedIds));
      await db
        .update(jobPositions)
        .set({ isOpen: false, updatedAt: now })
        .where(notInArray(jobPositions.id, selectedIds));
    }

    const positions = await getOrderedPositions();
    res.json(positions);
  } catch (error) {
    req.log.error(error, "Update careers selection error");
    res.status(500).json({ error: "Internal server error updating job position selection" });
  }
});

router.post("/careers", requireAuth, async (req, res) => {
  try {
    const { title } = req.body;

    if (typeof title !== "string" || title.trim().length === 0 || title.trim().length > 80) {
      res.status(400).json({ error: "title is required and must be a non-empty string of at most 80 characters" });
      return;
    }

    const trimmedTitle = title.trim();

    const [duplicate] = await db
      .select()
      .from(jobPositions)
      .where(sql`lower(${jobPositions.title}) = lower(${trimmedTitle})`)
      .limit(1);

    if (duplicate) {
      res.status(409).json({ error: "Position already exists" });
      return;
    }

    const [maxRow] = await db
      .select({ maxOrder: sql<number | null>`max(${jobPositions.order})` })
      .from(jobPositions);
    const nextOrder = (maxRow?.maxOrder ?? 0) + 1;

    const [created] = await db
      .insert(jobPositions)
      .values({
        title: trimmedTitle,
        isOpen: false,
        order: nextOrder,
      })
      .returning();

    res.status(201).json(created);
  } catch (error) {
    req.log.error(error, "Create career position error");
    res.status(500).json({ error: "Internal server error creating job position" });
  }
});

router.delete("/careers/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      res.status(404).json({ error: "Position not found" });
      return;
    }

    const [existing] = await db
      .select()
      .from(jobPositions)
      .where(eq(jobPositions.id, id))
      .limit(1);

    if (!existing) {
      res.status(404).json({ error: "Position not found" });
      return;
    }

    await db.delete(jobPositions).where(eq(jobPositions.id, id));
    res.status(204).end();
  } catch (error) {
    req.log.error(error, "Delete career position error");
    res.status(500).json({ error: "Internal server error deleting job position" });
  }
});

export default router;
