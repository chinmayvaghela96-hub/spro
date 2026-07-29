import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const siteSettings = sqliteTable("site_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  siteName: text("site_name").notNull().default("SustainPro"),
  logoUrl: text("logo_url").notNull().default("/logo.jpeg"),
  faviconUrl: text("favicon_url").notNull().default("/favicon.ico"),
  seoTitle: text("seo_title").notNull().default("SustainPro Process Solutions"),
  seoDescription: text("seo_description").notNull().default("Engineering a Greener Tomorrow."),
  socialLinks: text("social_links", { mode: "json" }).notNull().default({ "linkedin": "https://linkedin.com/company/sustainpro" }),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const contactInfo = sqliteTable("contact_info", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  address: text("address").notNull().default("100 Innovation Drive\nIndustrial Park, Tech City 10001"),
  phone: text("phone").notNull().default("8735045762"),
  email: text("email").notNull().default("sustain.process@gmail.com"),
  googleMapsLink: text("google_maps_link"),
  officeHours: text("office_hours"),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const donations = sqliteTable("donations", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  bankName: text("bank_name"),
  accountHolder: text("account_holder"),
  accountNumber: text("account_number"),
  ifscCode: text("ifsc_code"),
  upiId: text("upi_id"),
  qrCodeUrl: text("qr_code_url"),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export type SiteSettings = typeof siteSettings.$inferSelect;
export type ContactInfo = typeof contactInfo.$inferSelect;
export type Donation = typeof donations.$inferSelect;
