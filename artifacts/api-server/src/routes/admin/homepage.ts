import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, homepageContent } from "@workspace/db";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// Get homepage content
router.get("/homepage", async (req, res) => {
  try {
    let [content] = await db.select().from(homepageContent).limit(1);
    if (!content) {
      // Return defaults if not seeded
      content = {
        id: 1,
        heroBadge: "Engineering a Greener Tomorrow",
        heroTitle: "Advanced Process Optimization & Sustainable Solutions",
        heroSubtitle: "Global engineering consultancy specializing in chemical engineering, advanced modeling, and sustainable industrial innovation.",
        heroBgImage: "/hero-bg.png",
        stats: [
          { "value": "10+", "label": "Global Projects" },
          { "value": "50%", "label": "Efficiency" },
          { "value": "100%", "label": "Sustainable Focus" }
        ],
        servicesTitle: "Comprehensive Engineering Solutions",
        servicesSubtitle: "We deliver end-to-end technical excellence across the entire chemical and process engineering lifecycle.",
        sustainabilityTitle: "Pioneering the Transition to Efficient and Sustainable Solutions",
        sustainabilityText: "At SustainPro Process Solutions LLP, we partner with chemical, petrochemical, pharmaceutical, and biochemical industries to design smarter, optimize existing processes, and implement sustainable engineering solutions. Our expertise combines process engineering, simulation, and data-driven optimization to improve productivity, reduce resource and energy consumption, and enhance environmental performance. We are committed to helping organizations achieve operational excellence while building a more sustainable future.",
        sustainabilityItems: [
          "Engineering Solutions",
          "Process Excellence",
          "Sustainability",
          "Training and Consulting"
        ],
        ctaTitle: "Ready to Optimize Your Operations?",
        ctaSubtitle: "Partner with our world-class engineering team to drive efficiency, sustainability, and innovation in your facility.",
        updatedAt: new Date().toISOString(),
      };
    }
    res.json(content);
  } catch (error) {
    req.log.error(error, "Get homepage content error");
    res.status(500).json({ error: "Internal server error retrieving homepage content" });
  }
});

// Update homepage content
router.put("/homepage", requireAuth, async (req, res) => {
  try {
    const {
      heroBadge,
      heroTitle,
      heroSubtitle,
      heroBgImage,
      stats,
      servicesTitle,
      servicesSubtitle,
      sustainabilityTitle,
      sustainabilityText,
      sustainabilityItems,
      ctaTitle,
      ctaSubtitle,
    } = req.body;

    const [existing] = await db.select().from(homepageContent).limit(1);

    if (existing) {
      const [updated] = await db
        .update(homepageContent)
        .set({
          heroBadge,
          heroTitle,
          heroSubtitle,
          heroBgImage,
          stats,
          servicesTitle,
          servicesSubtitle,
          sustainabilityTitle,
          sustainabilityText,
          sustainabilityItems,
          ctaTitle,
          ctaSubtitle,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(homepageContent.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [inserted] = await db
        .insert(homepageContent)
        .values({
          heroBadge,
          heroTitle,
          heroSubtitle,
          heroBgImage,
          stats,
          servicesTitle,
          servicesSubtitle,
          sustainabilityTitle,
          sustainabilityText,
          sustainabilityItems,
          ctaTitle,
          ctaSubtitle,
        })
        .returning();
      res.json(inserted);
    }
  } catch (error) {
    req.log.error(error, "Update homepage content error");
    res.status(500).json({ error: "Internal server error updating homepage content" });
  }
});

export default router;
