import { type Request, type Response, type NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "@workspace/db";
import { admins } from "@workspace/db";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "sustainpro-jwt-secret-key-change-in-prod";

export interface AuthenticatedRequest extends Request {
  admin?: typeof admins.$inferSelect;
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Access token required" });
      return;
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      res.status(401).json({ error: "Invalid token format" });
      return;
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err: any) {
      if (err.name === "TokenExpiredError") {
        res.status(401).json({ error: "Token expired", code: "TOKEN_EXPIRED" });
        return;
      }
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    if (!decoded.id) {
      res.status(401).json({ error: "Invalid token payload" });
      return;
    }

    const [adminUser] = await db
      .select()
      .from(admins)
      .where(eq(admins.id, decoded.id))
      .limit(1);

    if (!adminUser) {
      res.status(401).json({ error: "Admin user not found" });
      return;
    }

    req.admin = adminUser;
    next();
  } catch (error) {
    req.log.error(error, "Auth middleware error");
    res.status(500).json({ error: "Internal server error during authentication" });
  }
}
