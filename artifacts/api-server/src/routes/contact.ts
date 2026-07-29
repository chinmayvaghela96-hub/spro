import { Router } from "express";
import { SubmitContactBody } from "@workspace/api-zod";
import { db, contactMessages } from "@workspace/db";

const router = Router();

router.post("/contact", async (req, res) => {
  const parsed = SubmitContactBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input" });
    return;
  }

  const { name, email, phone, company, subject, message, requestType } = parsed.data;

  try {
    // Insert into contactMessages database table
    await db.insert(contactMessages).values({
      name,
      email,
      phone: phone || null,
      company: company || null,
      subject: subject || null,
      message,
      requestType: requestType || "general",
    });

    req.log.info(
      { name, email, company, subject, requestType },
      "Contact form submission saved to database"
    );

    res.json({
      success: true,
      message: `Thank you, ${name}! We've received your message and will get back to you at ${email} within 1-2 business days.`,
    });
  } catch (error) {
    req.log.error(error, "Failed to save contact message");
    res.status(500).json({ error: "Internal server error saving message" });
  }
});

export default router;
