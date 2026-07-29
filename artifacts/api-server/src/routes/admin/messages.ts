import { Router } from "express";
import { db, contactMessages } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get all contact messages
router.get("/messages", requireAuth, async (req, res) => {
  try {
    const list = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
    res.json(list);
  } catch (error) {
    req.log.error(error, "Get contact messages error");
    res.status(500).json({ error: "Internal server error retrieving contact messages" });
  }
});

// Update read status
router.put("/messages/:id/read", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const { isRead } = req.body;

    if (typeof isRead !== "boolean") {
      res.status(400).json({ error: "isRead must be a boolean" });
      return;
    }

    const [updated] = await db
      .update(contactMessages)
      .set({
        isRead,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(contactMessages.id, Number(id)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    res.json(updated);
  } catch (error) {
    req.log.error(error, "Update message status error");
    res.status(500).json({ error: "Internal server error updating message status" });
  }
});

// Delete message
router.delete("/messages/:id", requireAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const [deleted] = await db
      .delete(contactMessages)
      .where(eq(contactMessages.id, Number(id)))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    res.json({ success: true, message: "Message deleted successfully" });
  } catch (error) {
    req.log.error(error, "Delete message error");
    res.status(500).json({ error: "Internal server error deleting message" });
  }
});

export default router;
