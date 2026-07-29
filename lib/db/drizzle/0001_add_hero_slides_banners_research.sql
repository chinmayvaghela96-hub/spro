-- Hero Slides table for homepage carousel
CREATE TABLE IF NOT EXISTS `hero_slides` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `image_url` text NOT NULL,
  `title` text DEFAULT '' NOT NULL,
  `subtitle` text DEFAULT '' NOT NULL,
  `button_text` text DEFAULT '' NOT NULL,
  `button_link` text DEFAULT '' NOT NULL,
  `open_in_new_tab` integer DEFAULT false NOT NULL,
  `order` integer DEFAULT 0 NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint

-- Page Banners table for per-page static banners
CREATE TABLE IF NOT EXISTS `page_banners` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `page_slug` text NOT NULL,
  `title` text DEFAULT '' NOT NULL,
  `subtitle` text DEFAULT '' NOT NULL,
  `image_url` text,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint

CREATE UNIQUE INDEX IF NOT EXISTS `page_banners_page_slug_unique` ON `page_banners` (`page_slug`);
--> statement-breakpoint

-- Enhance research_areas with description, image, link
ALTER TABLE `research_areas` ADD COLUMN `description` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `research_areas` ADD COLUMN `image_url` text;
--> statement-breakpoint
ALTER TABLE `research_areas` ADD COLUMN `link` text;
--> statement-breakpoint
ALTER TABLE `research_areas` ADD COLUMN `open_in_new_tab` integer DEFAULT false NOT NULL;
--> statement-breakpoint

-- Enhance publications with link
ALTER TABLE `publications` ADD COLUMN `link` text;
--> statement-breakpoint
ALTER TABLE `publications` ADD COLUMN `open_in_new_tab` integer DEFAULT true NOT NULL;
--> statement-breakpoint

-- CMS-editable Navigation items table
CREATE TABLE IF NOT EXISTS `nav_items` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `label` text NOT NULL,
  `href` text NOT NULL,
  `order` integer DEFAULT 0 NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);

