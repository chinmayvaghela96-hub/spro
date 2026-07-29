import { Router } from "express";
import { asc, eq } from "drizzle-orm";
import { db, jobPositions, contactMessages } from "@workspace/db";
import { upload } from "../middlewares/upload";

const router = Router();

router.get("/careers", async (req, res) => {
  try {
    const positions = await db
      .select()
      .from(jobPositions)
      .where(eq(jobPositions.isOpen, true))
      .orderBy(asc(jobPositions.order), asc(jobPositions.id));

    res.json(positions);
  } catch (error) {
    req.log.error(error, "Get public careers error");
    res.status(500).json({ error: "Internal server error retrieving open positions" });
  }
});

router.post("/careers/apply", (req, res, next) => {
  upload.single("cv")(req, res, (err) => {
    if (err) {
      req.log.warn({ err }, "Multer upload error during career application");
      res.status(400).json({ error: err.message });
      return;
    }
    next();
  });
}, async (req, res) => {
  try {
    const { name, email, phone, city, address, jobTitle, message } = req.body;

    if (!name || !email || !jobTitle) {
      res.status(400).json({ error: "Name, email, and job title are required" });
      return;
    }

    const cvUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const formattedMessage = `
Position Applied: ${jobTitle}
City: ${city || "Not provided"}
Address: ${address || "Not provided"}
CV Attachment: ${cvUrl ? `${cvUrl}` : "No CV uploaded"}

Cover Letter/Introduction:
${message || "No cover letter provided"}
    `.trim();

    await db.insert(contactMessages).values({
      name,
      email,
      phone: phone || null,
      company: null,
      requestType: "general",
      subject: `Job Application: ${jobTitle}`,
      message: formattedMessage,
    });

    res.json({
      success: true,
      message: "Application submitted successfully!",
    });
  } catch (error) {
    req.log.error(error, "Submit career application error");
    res.status(500).json({ error: "Internal server error submitting application" });
  }
});

export default router;
