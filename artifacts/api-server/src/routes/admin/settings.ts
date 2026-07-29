import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, siteSettings, contactInfo, donations } from "@workspace/db";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

// ==========================================
// SITE SETTINGS
// ==========================================

router.get("/settings", async (req, res) => {
  try {
    let [settings] = await db.select().from(siteSettings).limit(1);
    if (!settings) {
      settings = {
        id: 1,
        siteName: "SustainPro",
        logoUrl: "/logo.jpeg",
        faviconUrl: "/favicon.ico",
        seoTitle: "SustainPro Process Solutions",
        seoDescription: "Engineering a Greener Tomorrow. Global engineering consultancy specializing in chemical engineering, process optimization, and sustainable industrial innovation.",
        socialLinks: {
          "linkedin": "https://linkedin.com/company/sustainpro"
        },
        updatedAt: new Date().toISOString(),
      };
    }
    res.json(settings);
  } catch (error) {
    req.log.error(error, "Get settings error");
    res.status(500).json({ error: "Internal server error retrieving settings" });
  }
});

router.put("/settings", requireAuth, async (req, res) => {
  try {
    const { siteName, logoUrl, faviconUrl, seoTitle, seoDescription, socialLinks } = req.body;

    const [existing] = await db.select().from(siteSettings).limit(1);

    if (existing) {
      const [updated] = await db
        .update(siteSettings)
        .set({
          siteName,
          logoUrl,
          faviconUrl,
          seoTitle,
          seoDescription,
          socialLinks,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(siteSettings.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [inserted] = await db
        .insert(siteSettings)
        .values({
          siteName,
          logoUrl,
          faviconUrl,
          seoTitle,
          seoDescription,
          socialLinks,
        })
        .returning();
      res.json(inserted);
    }
  } catch (error) {
    req.log.error(error, "Update settings error");
    res.status(500).json({ error: "Internal server error updating settings" });
  }
});


// ==========================================
// CONTACT INFO
// ==========================================

router.get("/contact-info", async (req, res) => {
  try {
    let [info] = await db.select().from(contactInfo).limit(1);
    if (!info) {
      info = {
        id: 1,
        address: "100 Innovation Drive\nIndustrial Park, Tech City 10001",
        phone: "8735045762",
        email: "sustain.process@gmail.com",
        googleMapsLink: null,
        officeHours: null,
        updatedAt: new Date().toISOString(),
      };
    }
    res.json(info);
  } catch (error) {
    req.log.error(error, "Get contact-info error");
    res.status(500).json({ error: "Internal server error retrieving contact info" });
  }
});

router.put("/contact-info", requireAuth, async (req, res) => {
  try {
    const { address, phone, email, googleMapsLink, officeHours } = req.body;

    const [existing] = await db.select().from(contactInfo).limit(1);

    if (existing) {
      const [updated] = await db
        .update(contactInfo)
        .set({
          address,
          phone,
          email,
          googleMapsLink,
          officeHours,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(contactInfo.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [inserted] = await db
        .insert(contactInfo)
        .values({
          address,
          phone,
          email,
          googleMapsLink,
          officeHours,
        })
        .returning();
      res.json(inserted);
    }
  } catch (error) {
    req.log.error(error, "Update contact-info error");
    res.status(500).json({ error: "Internal server error updating contact info" });
  }
});


// ==========================================
// DONATIONS
// ==========================================

router.get("/donations", async (req, res) => {
  try {
    let [donation] = await db.select().from(donations).limit(1);
    if (!donation) {
      donation = {
        id: 1,
        bankName: "",
        accountHolder: "",
        accountNumber: "",
        ifscCode: "",
        upiId: "",
        qrCodeUrl: "",
        updatedAt: new Date().toISOString(),
      };
    }
    res.json(donation);
  } catch (error) {
    req.log.error(error, "Get donations error");
    res.status(500).json({ error: "Internal server error retrieving donation details" });
  }
});

router.put("/donations", requireAuth, async (req, res) => {
  try {
    const { bankName, accountHolder, accountNumber, ifscCode, upiId, qrCodeUrl } = req.body;

    const [existing] = await db.select().from(donations).limit(1);

    if (existing) {
      const [updated] = await db
        .update(donations)
        .set({
          bankName,
          accountHolder,
          accountNumber,
          ifscCode,
          upiId,
          qrCodeUrl,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(donations.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [inserted] = await db
        .insert(donations)
        .values({
          bankName,
          accountHolder,
          accountNumber,
          ifscCode,
          upiId,
          qrCodeUrl,
        })
        .returning();
      res.json(inserted);
    }
  } catch (error) {
    req.log.error(error, "Update donations error");
    res.status(500).json({ error: "Internal server error updating donation details" });
  }
});

export default router;
