CREATE TABLE `admins` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`name` text DEFAULT 'Admin' NOT NULL,
	`role` text DEFAULT 'admin' NOT NULL,
	`must_change_password` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admins_email_unique` ON `admins` (`email`);--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`admin_id` integer NOT NULL,
	`token` text NOT NULL,
	`expires_at` text NOT NULL,
	`used` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `password_reset_tokens_token_unique` ON `password_reset_tokens` (`token`);--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`admin_id` integer NOT NULL,
	`refresh_token` text NOT NULL,
	`expires_at` text NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_refresh_token_unique` ON `sessions` (`refresh_token`);--> statement-breakpoint
CREATE TABLE `about_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hero_title` text DEFAULT 'About SustainPro' NOT NULL,
	`hero_subtitle` text DEFAULT 'Engineering a greener tomorrow through innovative process solutions, technical excellence, and sustainable practices.' NOT NULL,
	`hero_bg_image` text DEFAULT '/about-bg.png' NOT NULL,
	`who_we_are_title` text DEFAULT 'Who We Are' NOT NULL,
	`who_we_are_text` text DEFAULT 'SustainPro Process Solutions™ is a premium global engineering consultancy.' NOT NULL,
	`vision_title` text DEFAULT 'Our Vision' NOT NULL,
	`vision_text` text DEFAULT 'To be the global leader in driving the industrial transition towards sustainable and highly optimized processes.' NOT NULL,
	`mission_title` text DEFAULT 'Our Mission' NOT NULL,
	`mission_text` text DEFAULT 'Delivering unparalleled engineering expertise that maximizes operational efficiency while minimizing environmental footprint.' NOT NULL,
	`values_title` text DEFAULT 'Core Values' NOT NULL,
	`values_text` text DEFAULT 'Integrity, innovation, sustainability, and technical excellence form the foundation of every project we undertake.' NOT NULL,
	`leadership_title` text DEFAULT 'Leadership' NOT NULL,
	`leadership_text` text DEFAULT 'Guided by industry veterans with decades of combined experience in high-stakes chemical engineering and R&D.' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `homepage_content` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`hero_badge` text DEFAULT 'Engineering a Greener Tomorrow' NOT NULL,
	`hero_title` text DEFAULT 'Advanced Process Optimization & Sustainable Solutions' NOT NULL,
	`hero_subtitle` text DEFAULT 'Global engineering consultancy specializing in chemical engineering, advanced modeling, and sustainable industrial innovation.' NOT NULL,
	`hero_bg_image` text DEFAULT '/hero-bg.png' NOT NULL,
	`stats` text DEFAULT '[{"value":"50+","label":"Global Projects"},{"value":"30%","label":"Avg Energy Saved"},{"value":"15+","label":"Patents & Pubs"},{"value":"100%","label":"Sustainable Focus"}]' NOT NULL,
	`services_title` text DEFAULT 'Comprehensive Engineering Solutions' NOT NULL,
	`services_subtitle` text DEFAULT 'We deliver end-to-end technical excellence across the entire chemical and process engineering lifecycle.' NOT NULL,
	`sustainability_title` text DEFAULT 'Pioneering the Transition to Green Engineering' NOT NULL,
	`sustainability_text` text DEFAULT 'At SustainPro Process Solutions™, we don''t just optimize for today''s margins; we engineer for tomorrow''s reality.' NOT NULL,
	`sustainability_items` text DEFAULT '["Green Chemistry & Circular Economy","Carbon Capture & Utilization Technology","Deep Eutectic Solvents (DES) Research","Energy-Intensive Process Transformation"]' NOT NULL,
	`cta_title` text DEFAULT 'Ready to Optimize Your Operations?' NOT NULL,
	`cta_subtitle` text DEFAULT 'Partner with our world-class engineering team to drive efficiency, sustainability, and innovation in your facility.' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `industries` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `publications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`authors` text NOT NULL,
	`journal` text NOT NULL,
	`year` integer NOT NULL,
	`pdf_url` text,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `research_areas` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `services` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`details` text DEFAULT '[]' NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `software_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `training_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`icon` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`date` text NOT NULL,
	`event_timestamp` text,
	`venue` text DEFAULT 'Online' NOT NULL,
	`banner_url` text,
	`type` text DEFAULT 'Technical Training' NOT NULL,
	`registration_link` text,
	`gallery_urls` text DEFAULT '[]' NOT NULL,
	`is_archived` integer DEFAULT false NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `notices` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`file_url` text,
	`expiry_date` text,
	`is_pinned` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `albums` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`cover_url` text,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `media` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`file_url` text NOT NULL,
	`file_type` text NOT NULL,
	`file_size` integer NOT NULL,
	`album_id` integer,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL,
	FOREIGN KEY (`album_id`) REFERENCES `albums`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`phone` text,
	`company` text,
	`request_type` text DEFAULT 'general' NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `contact_info` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`address` text DEFAULT '100 Innovation Drive
Industrial Park, Tech City 10001' NOT NULL,
	`phone` text DEFAULT '+91 98765 43210' NOT NULL,
	`email` text DEFAULT 'contact@sustainpro.com' NOT NULL,
	`google_maps_link` text,
	`office_hours` text,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `donations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`bank_name` text,
	`account_holder` text,
	`account_number` text,
	`ifsc_code` text,
	`upi_id` text,
	`qr_code_url` text,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `site_settings` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`site_name` text DEFAULT 'SustainPro' NOT NULL,
	`logo_url` text DEFAULT '/logo.jpeg' NOT NULL,
	`favicon_url` text DEFAULT '/favicon.ico' NOT NULL,
	`seo_title` text DEFAULT 'SustainPro Process Solutions' NOT NULL,
	`seo_description` text DEFAULT 'Engineering a Greener Tomorrow.' NOT NULL,
	`social_links` text DEFAULT '{"linkedin":"https://linkedin.com/company/sustainpro"}' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
