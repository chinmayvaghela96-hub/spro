import { Router } from "express";
import { eq } from "drizzle-orm";
import { db, sirProfile } from "@workspace/db";
import { requireAuth } from "../../middlewares/auth";

const router = Router();

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[0-9+\s-]{7,20}$/;

// ==========================================
// SIR PROFILE (singleton)
// ==========================================

router.get("/sir-profile", async (req, res) => {
  try {
    let [profile] = await db.select().from(sirProfile).limit(1);
    if (!profile) {
      profile = {
        id: 1,
        fullName: "Sir",
        designation: "Founder & Director",
        email: "sustain.process@gmail.com",
        phone: "8735045762",
        city: "",
        fullAddress: "",
        photoUrl: null,
        bio: "",
        updatedAt: new Date().toISOString(),
      };
    }
    res.json(profile);
  } catch (error) {
    req.log.error(error, "Get sir-profile error");
    res.status(500).json({ error: "Internal server error retrieving sir profile" });
  }
});

router.put("/sir-profile", requireAuth, async (req, res) => {
  try {
    const { fullName, designation, email, phone, city, fullAddress, photoUrl, bio } = req.body;

    if (typeof fullName !== "string" || fullName.trim().length === 0 || fullName.trim().length > 120) {
      res.status(400).json({ error: "fullName is required and must be a non-empty string of at most 120 characters" });
      return;
    }
    if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
      res.status(400).json({ error: "email must be a valid email address" });
      return;
    }
    if (typeof phone !== "string" || !PHONE_REGEX.test(phone)) {
      res.status(400).json({ error: "phone must be 7-20 characters using digits, +, spaces, or dashes" });
      return;
    }

    const values = {
      fullName: fullName.trim(),
      designation,
      email,
      phone,
      city,
      fullAddress,
      photoUrl,
      bio,
      updatedAt: new Date().toISOString(),
    };

    const [existing] = await db.select().from(sirProfile).limit(1);

    if (existing) {
      const [updated] = await db
        .update(sirProfile)
        .set(values)
        .where(eq(sirProfile.id, existing.id))
        .returning();
      res.json(updated);
    } else {
      const [inserted] = await db
        .insert(sirProfile)
        .values(values)
        .returning();
      res.json(inserted);
    }
  } catch (error) {
    req.log.error(error, "Update sir-profile error");
    res.status(500).json({ error: "Internal server error updating sir profile" });
  }
});

export default router;
