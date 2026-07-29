import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { db, admins, sessions, passwordResetTokens } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { requireAuth, type AuthenticatedRequest } from "../../middlewares/auth";

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || "sustainpro-jwt-secret-key-change-in-prod";
const ACCESS_TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY_DAYS = 7;

// Helpers to generate tokens
function generateAccessToken(payload: { id: number; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

// Route: Login
router.post("/auth/login", async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: "Email and password are required" });
      return;
    }

    const [adminUser] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    if (!adminUser) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    const isMatch = await bcrypt.compare(password, adminUser.passwordHash);
    if (!isMatch) {
      res.status(401).json({ error: "Invalid email or password" });
      return;
    }

    // Create session & tokens
    const accessToken = generateAccessToken({ id: adminUser.id, email: adminUser.email });
    const refreshToken = crypto.randomBytes(40).toString("hex");
    
    const expiryDays = rememberMe ? REFRESH_TOKEN_EXPIRY_DAYS : 1;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    await db.insert(sessions).values({
      adminId: adminUser.id,
      refreshToken,
      expiresAt: expiresAt.toISOString(),
    });

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      expires: expiresAt,
      path: "/", // accessible on all routes
    });

    res.json({
      success: true,
      accessToken,
      admin: {
        id: adminUser.id,
        email: adminUser.email,
        name: adminUser.name,
        role: adminUser.role,
        mustChangePassword: adminUser.mustChangePassword,
      },
    });
  } catch (error) {
    req.log.error(error, "Login error");
    res.status(500).json({ error: "Internal server error during login" });
  }
});

// Route: Refresh Token
router.post("/auth/refresh-token", async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (!token) {
      res.status(400).json({ error: "Refresh token is required" });
      return;
    }

    const [session] = await db
      .select()
      .from(sessions)
      .where(eq(sessions.refreshToken, token))
      .limit(1);

    if (!session || new Date(session.expiresAt) < new Date()) {
      // Cleanup expired session if found
      if (session) {
        await db.delete(sessions).where(eq(sessions.id, session.id));
      }
      res.status(401).json({ error: "Session expired or invalid" });
      return;
    }

    const [adminUser] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, session.adminId))
      .limit(1);

    if (!adminUser) {
      res.status(401).json({ error: "User associated with session not found" });
      return;
    }

    const accessToken = generateAccessToken({ id: adminUser.id, email: adminUser.email });
    res.json({
      success: true,
      accessToken,
    });
  } catch (error) {
    req.log.error(error, "Refresh token error");
    res.status(500).json({ error: "Internal server error during token refresh" });
  }
});

// Route: Logout
router.post("/auth/logout", async (req, res) => {
  try {
    const token = req.cookies.refreshToken || req.body.refreshToken;

    if (token) {
      await db.delete(sessions).where(eq(sessions.refreshToken, token));
    }

    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    res.json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    req.log.error(error, "Logout error");
    res.status(500).json({ error: "Internal server error during logout" });
  }
});

// Route: Get current user
router.get("/auth/me", requireAuth, (req: AuthenticatedRequest, res) => {
  if (!req.admin) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  res.json({
    admin: {
      id: req.admin.id,
      email: req.admin.email,
      name: req.admin.name,
      role: req.admin.role,
      mustChangePassword: req.admin.mustChangePassword,
    },
  });
});

// Route: Change Password
router.post("/auth/change-password", requireAuth, async (req: AuthenticatedRequest, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const adminId = req.admin?.id;

    if (!adminId || !oldPassword || !newPassword) {
      res.status(400).json({ error: "Old and new passwords are required" });
      return;
    }

    const [adminUser] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, adminId))
      .limit(1);

    const isMatch = await bcrypt.compare(oldPassword, adminUser.passwordHash);
    if (!isMatch) {
      res.status(400).json({ error: "Incorrect current password" });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await db
      .update(admins)
      .set({
        passwordHash,
        mustChangePassword: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(admins.id, adminId));

    // Clear other sessions for this user on password change
    await db.delete(sessions).where(eq(sessions.adminId, adminId));

    res.json({ success: true, message: "Password updated successfully. Please log in again." });
  } catch (error) {
    req.log.error(error, "Change password error");
    res.status(500).json({ error: "Internal server error during password update" });
  }
});

// Route: Forgot Password
router.post("/auth/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ error: "Email is required" });
      return;
    }

    const [adminUser] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    if (!adminUser) {
      // Respond with success to prevent timing attacks / user enumeration
      res.json({ success: true, message: "If the email is registered, a password reset link has been logged/sent." });
      return;
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour expiration

    // Deactivate previous reset tokens
    await db.update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.adminId, adminUser.id));

    await db.insert(passwordResetTokens).values({
      adminId: adminUser.id,
      token,
      expiresAt: expiresAt.toISOString(),
    });

    // Console logging the reset URL as per the plan.
    // The origin must not be hardcoded to localhost or the link is useless in
    // production; fall back to the requesting host so it works on any domain.
    const resetOrigin =
      process.env["PUBLIC_SITE_URL"]?.replace(/\/+$/, "") ||
      `${req.protocol}://${req.get("host")}`;
    req.log.warn(
      `[PASSWORD RESET LINK]: ${resetOrigin}/admin/reset-password?token=${token}`
    );

    res.json({
      success: true,
      message: "If the email is registered, a password reset link has been logged/sent.",
      // For developer testing ease in development environment
      token: process.env.NODE_ENV !== "production" ? token : undefined,
    });
  } catch (error) {
    req.log.error(error, "Forgot password error");
    res.status(500).json({ error: "Internal server error during forgot password" });
  }
});

// Route: Reset Password
router.post("/auth/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      res.status(400).json({ error: "Token and new password are required" });
      return;
    }

    const now = new Date().toISOString();
    const [resetToken] = await db
      .select()
      .from(passwordResetTokens)
      .where(
        and(
          eq(passwordResetTokens.token, token),
          eq(passwordResetTokens.used, false),
          gt(passwordResetTokens.expiresAt, now)
        )
      )
      .limit(1);

    if (!resetToken) {
      res.status(400).json({ error: "Reset token is invalid or has expired" });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    // Update password
    await db
      .update(admins)
      .set({
        passwordHash,
        mustChangePassword: false,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(admins.id, resetToken.adminId));

    // Mark token as used
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, resetToken.id));

    // Remove active sessions
    await db.delete(sessions).where(eq(sessions.adminId, resetToken.adminId));

    res.json({ success: true, message: "Password has been successfully reset. You can now log in." });
  } catch (error) {
    req.log.error(error, "Reset password error");
    res.status(500).json({ error: "Internal server error during password reset" });
  }
});

export default router;
