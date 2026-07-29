import { Router } from "express";
import { db, services, events, notices, media, contactMessages } from "@workspace/db";
import { sql, desc, eq } from "drizzle-orm";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

router.get("/dashboard/stats", requireAuth, async (req, res) => {
  try {
    const [servicesCount] = await db.select({ value: sql<number>`count(*)` }).from(services);
    const [eventsCount] = await db.select({ value: sql<number>`count(*)` }).from(events);
    const [noticesCount] = await db.select({ value: sql<number>`count(*)` }).from(notices);
    const [mediaCount] = await db.select({ value: sql<number>`count(*)` }).from(media);
    const [messagesCount] = await db.select({ value: sql<number>`count(*)` }).from(contactMessages);
    
    // Get count of unread messages
    const [unreadMessagesCount] = await db
      .select({ value: sql<number>`count(*)` })
      .from(contactMessages)
      .where(eq(contactMessages.isRead, false));

    // Get 5 most recent messages
    const recentMessages = await db
      .select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt))
      .limit(5);

    res.json({
      stats: {
        services: Number(servicesCount?.value || 0),
        events: Number(eventsCount?.value || 0),
        notices: Number(noticesCount?.value || 0),
        media: Number(mediaCount?.value || 0),
        messages: Number(messagesCount?.value || 0),
        unreadMessages: Number(unreadMessagesCount?.value || 0),
      },
      recentMessages,
    });
  } catch (error) {
    req.log.error(error, "Dashboard stats error");
    res.status(500).json({ error: "Internal server error retrieving dashboard stats" });
  }
});

export default router;
