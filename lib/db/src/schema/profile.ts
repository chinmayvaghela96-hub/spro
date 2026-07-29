import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const sirProfile = sqliteTable("sir_profile", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  fullName: text("full_name").notNull().default("Sir"),
  designation: text("designation").notNull().default("Founder & Director"),
  email: text("email").notNull().default("sustain.process@gmail.com"),
  phone: text("phone").notNull().default("8735045762"),
  city: text("city").notNull().default(""),
  fullAddress: text("full_address").notNull().default(""),
  photoUrl: text("photo_url"),
  bio: text("bio").notNull().default(""),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type SirProfile = typeof sirProfile.$inferSelect;
