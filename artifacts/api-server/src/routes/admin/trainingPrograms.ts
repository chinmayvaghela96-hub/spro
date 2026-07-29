import { Router } from "express";
import { db, trainingPrograms } from "@workspace/db";
import { eq, asc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

const MODES = ["Online", "Offline", "Hybrid"];

function normalizeMode(value: unknown): string {
  if (typeof value !== "string") return "Online";
  const match = MODES.find((m) => m.toLowerCase() === value.trim().toLowerCase());
  return match || "Online";
}

function toBool(value: unknown, fallback = true): boolean {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true" || value === 1 || value === "1";
}

function toOrder(value: unknown): number {
  if (value === undefined || value === null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

// Get all training programs (admin view - includes disabled ones)
router.get("/training-programs", async (req, res) => {
  try {
    const list = await db.select().from(trainingPrograms).orderBy(asc(trainingPrograms.order));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get training programs error");
    res.status(500).json({ error: "Internal server error retrieving training programs" });
  }
});

// Create training program
router.post("/training-programs", requireAuth, async (req, res) => {
  try {
    const { name, description, duration, eligibility, mode, startDate, registrationUrl, coverImage, order, isActive } =
      req.body;

    if (!name) {
      res.status(400).json({ error: "Program name is required" });
      return;
    }

    const [inserted] = await db
      .insert(trainingPrograms)
      .values({
        name,
        description: description || "",
        duration: duration || "",
        eligibility: eligibility || "",
        mode: normalizeMode(mode),
        startDate: startDate || "",
        registrationUrl: registrationUrl || "",
        coverImage: coverImage || "",
        order: toOrder(order),
        isActive: toBool(isActive),
      })
      .returning();

    res.status(201).json(inserted);
  } catch (error) {
    req.log.error(error, "Create training program error");
    res.status(500).json({ error: "Internal server error creating training program" });
  }
});

// Reorder training programs
// NOTE: must be registered before "/training-programs/:id" or Express matches this as id="reorder".
router.put("/training-programs/reorder", requireAuth, async (req, res) => {
  try {
    const { items } = req.body; // Array of { id: number, order: number }

    if (!items || !Array.isArray(items)) {
      res.status(400).json({ error: "Items array is required" });
      return;
    }

    await db.transaction(async (tx) => {
      for (const item of items) {
        await tx
          .update(trainingPrograms)
          .set({ order: toOrder(item.order), updatedAt: new Date().toISOString() })
          .where(eq(trainingPrograms.id, Number(item.id)));
      }
    });

    res.json({ success: true, message: "Training programs reordered successfully" });
  } catch (error) {
    req.log.error(error, "Reorder training programs error");
    res.status(500).json({ error: "Internal server error reordering training programs" });
  }
});

// Update training program
router.put("/training-programs/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, duration, eligibility, mode, startDate, registrationUrl, coverImage, order, isActive } =
      req.body;

    const [updated] = await db
      .update(trainingPrograms)
      .set({
        name,
        description,
        duration,
        eligibility,
        mode: normalizeMode(mode),
        startDate,
        registrationUrl,
        coverImage,
        order: toOrder(order),
        isActive: toBool(isActive),
        updatedAt: new Date().toISOString(),
      })
      .where(eq(trainingPrograms.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Training program not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update training program error");
    res.status(500).json({ error: "Internal server error updating training program" });
  }
});

// Delete training program
router.delete("/training-programs/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(trainingPrograms)
      .where(eq(trainingPrograms.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Training program not found" });
      return;
    }

    res.json({ success: true, message: "Training program deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete training program error");
    res.status(500).json({ error: "Internal server error deleting training program" });
  }
});

export default router;
