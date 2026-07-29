import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const pages = sqliteTable("pages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  subtitle: text("subtitle").notNull().default(""),
  description: text("description").notNull().default(""),
  heroImage: text("hero_image"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  showInMenu: integer("show_in_menu", { mode: "boolean" }).notNull().default(true),
  order: integer("order").notNull().default(0),
  
  // SEO Meta
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  seoKeywords: text("seo_keywords").notNull().default(""),
  
  // Page Sections (JSON Array of section blocks)
  sections: text("sections", { mode: "json" }).notNull().default([]),
  
  // Page Gallery (JSON Array of image/video assets with description)
  gallery: text("gallery", { mode: "json" }).notNull().default([]),
  
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type Page = typeof pages.$inferSelect;
export type InsertPage = typeof pages.$inferInsert;
export type PageSection = {
  id: string;
  type: "rich-text" | "features-grid" | "cta-banner" | "accordion-faq";
  title?: string;
  subtitle?: string;
  content?: string;
  buttonText?: string;
  buttonLink?: string;
  openInNewTab?: boolean;
  items?: any[]; // for grids or accordions
  order: number;
};
export type GalleryItem = {
  id: string;
  url: string;
  type: "image" | "video";
  title?: string;
  description?: string;
  order: number;
};
