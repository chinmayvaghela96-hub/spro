import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const events = sqliteTable("events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  date: text("date").notNull(),
  eventTimestamp: text("event_timestamp"),
  venue: text("venue").notNull().default("Online"),
  bannerUrl: text("banner_url"),
  type: text("type").notNull().default("Technical Training"),
  registrationLink: text("registration_link"),
  galleryUrls: text("gallery_urls", { mode: "json" }).notNull().default([]),
  isArchived: integer("is_archived", { mode: "boolean" }).notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = typeof events.$inferInsert;
