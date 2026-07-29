import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  details: text("details", { mode: "json" }).notNull().default([]),
  link: text("link"),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const industries = sqliteTable("industries", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  link: text("link"),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const researchAreas = sqliteTable("research_areas", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull().default(""),
  imageUrl: text("image_url"),
  link: text("link"),
  openInNewTab: integer("open_in_new_tab", { mode: "boolean" }).notNull().default(false),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const publications = sqliteTable("publications", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  authors: text("authors").notNull(),
  journal: text("journal").notNull(),
  year: integer("year").notNull(),
  pdfUrl: text("pdf_url"),
  link: text("link"),
  openInNewTab: integer("open_in_new_tab", { mode: "boolean" }).notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const softwareItems = sqliteTable("software_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  link: text("link"),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const trainingTypes = sqliteTable("training_types", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  link: text("link"),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const homepageContent = sqliteTable("homepage_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  heroBadge: text("hero_badge").notNull().default("Engineering a Greener Tomorrow"),
  heroTitle: text("hero_title").notNull().default("Advanced Process Optimization & Sustainable Solutions"),
  heroSubtitle: text("hero_subtitle").notNull().default("Global engineering consultancy specializing in chemical engineering, advanced modeling, and sustainable industrial innovation."),
  heroBgImage: text("hero_bg_image").notNull().default("/hero-bg.png"),
  stats: text("stats", { mode: "json" }).notNull().default([
    { "value": "10+", "label": "Global Projects" },
    { "value": "50%", "label": "Efficiency" },
    { "value": "100%", "label": "Sustainable Focus" }
  ]),
  servicesTitle: text("services_title").notNull().default("Comprehensive Engineering Solutions"),
  servicesSubtitle: text("services_subtitle").notNull().default("We deliver end-to-end technical excellence across the entire chemical and process engineering lifecycle."),
  sustainabilityTitle: text("sustainability_title").notNull().default("Pioneering the Transition to Efficient and Sustainable Solutions"),
  sustainabilityText: text("sustainability_text").notNull().default("At SustainPro Process Solutions LLP, we partner with chemical, petrochemical, pharmaceutical, and biochemical industries to design smarter, optimize existing processes, and implement sustainable engineering solutions. Our expertise combines process engineering, simulation, and data-driven optimization to improve productivity, reduce resource and energy consumption, and enhance environmental performance. We are committed to helping organizations achieve operational excellence while building a more sustainable future."),
  sustainabilityItems: text("sustainability_items", { mode: "json" }).notNull().default([
    "Engineering Solutions",
    "Process Excellence",
    "Sustainability",
    "Training and Consulting"
  ]),
  ctaTitle: text("cta_title").notNull().default("Ready to Optimize Your Operations?"),
  ctaSubtitle: text("cta_subtitle").notNull().default("Partner with our world-class engineering team to drive efficiency, sustainability, and innovation in your facility."),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

export const aboutContent = sqliteTable("about_content", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  heroTitle: text("hero_title").notNull().default("About SustainPro"),
  heroSubtitle: text("hero_subtitle").notNull().default("Engineering a greener tomorrow through innovative process solutions, technical excellence, and sustainable practices."),
  heroBgImage: text("hero_bg_image").notNull().default("/about-bg.png"),
  whoWeAreTitle: text("who_we_are_title").notNull().default("Who We Are"),
  whoWeAreText: text("who_we_are_text").notNull().default("SustainPro Process Solutions™ is a premium global engineering consultancy."),
  visionTitle: text("vision_title").notNull().default("Our Vision"),
  visionText: text("vision_text").notNull().default("To be the global leader in driving the industrial transition towards sustainable and highly optimized processes."),
  missionTitle: text("mission_title").notNull().default("Our Mission"),
  missionText: text("mission_text").notNull().default("Delivering unparalleled engineering expertise that maximizes operational efficiency while minimizing environmental footprint."),
  valuesTitle: text("values_title").notNull().default("Core Values"),
  valuesText: text("values_text").notNull().default("Integrity, innovation, sustainability, and technical excellence form the foundation of every project we undertake."),
  leadershipTitle: text("leadership_title").notNull().default("Leadership"),
  leadershipText: text("leadership_text").notNull().default("Guided by industry veterans with decades of combined experience in high-stakes chemical engineering and R&D."),
  advisors: text("advisors", { mode: "json" }).notNull().default([]),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ==========================================
// NEW: Hero Slides for homepage carousel
// ==========================================
export const heroSlides = sqliteTable("hero_slides", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageUrl: text("image_url").notNull(),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  description: text("description").notNull().default(""),
  buttonText: text("button_text").notNull().default(""),
  buttonLink: text("button_link").notNull().default(""),
  openInNewTab: integer("open_in_new_tab", { mode: "boolean" }).notNull().default(false),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  order: integer("order").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ==========================================
// NEW: Per-page static banners
// ==========================================
export const pageBanners = sqliteTable("page_banners", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  pageSlug: text("page_slug").notNull().unique(),
  title: text("title").notNull().default(""),
  subtitle: text("subtitle").notNull().default(""),
  imageUrl: text("image_url"),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ==========================================
// NEW: CMS-editable Navigation Items
// ==========================================
export const navItems = sqliteTable("nav_items", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  label: text("label").notNull(),
  href: text("href").notNull(),
  order: integer("order").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ==========================================
// NEW: Standalone Photo Gallery
// ==========================================
export const galleryPhotos = sqliteTable("gallery_photos", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  imageUrl: text("image_url").notNull(),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  // Free-text grouping, e.g. "Training - March 2026" or "Past Events". Photos left
  // blank fall into a single ungrouped set, which is how every existing photo behaves.
  category: text("category").notNull().default(""),
  order: integer("order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// ==========================================
// Training Programs (full program listings)
// ==========================================
// `trainingTypes` above stays as the short category cards. This table holds the
// individual, registerable programs shown on the /training page.
export const trainingPrograms = sqliteTable("training_programs", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  description: text("description").notNull().default(""),
  duration: text("duration").notNull().default(""),
  eligibility: text("eligibility").notNull().default(""),
  mode: text("mode").notNull().default("Online"), // Online | Offline | Hybrid
  startDate: text("start_date").notNull().default(""),
  registrationUrl: text("registration_url").notNull().default(""),
  coverImage: text("cover_image").notNull().default(""),
  order: integer("order").notNull().default(0),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`(datetime('now'))`),
  updatedAt: text("updated_at").notNull().default(sql`(datetime('now'))`),
});

// Type exports
export type Service = typeof services.$inferSelect;
export type InsertService = typeof services.$inferInsert;
export type Industry = typeof industries.$inferSelect;
export type InsertIndustry = typeof industries.$inferInsert;
export type ResearchArea = typeof researchAreas.$inferSelect;
export type InsertResearchArea = typeof researchAreas.$inferInsert;
export type Publication = typeof publications.$inferSelect;
export type InsertPublication = typeof publications.$inferInsert;
export type SoftwareItem = typeof softwareItems.$inferSelect;
export type InsertSoftwareItem = typeof softwareItems.$inferInsert;
export type TrainingType = typeof trainingTypes.$inferSelect;
export type InsertTrainingType = typeof trainingTypes.$inferInsert;
export type HomepageContent = typeof homepageContent.$inferSelect;
export type AboutContent = typeof aboutContent.$inferSelect;
export type HeroSlide = typeof heroSlides.$inferSelect;
export type InsertHeroSlide = typeof heroSlides.$inferInsert;
export type PageBanner = typeof pageBanners.$inferSelect;
export type InsertPageBanner = typeof pageBanners.$inferInsert;
export type NavItem = typeof navItems.$inferSelect;
export type InsertNavItem = typeof navItems.$inferInsert;
export type GalleryPhoto = typeof galleryPhotos.$inferSelect;
export type InsertGalleryPhoto = typeof galleryPhotos.$inferInsert;
export type TrainingProgram = typeof trainingPrograms.$inferSelect;
export type InsertTrainingProgram = typeof trainingPrograms.$inferInsert;


