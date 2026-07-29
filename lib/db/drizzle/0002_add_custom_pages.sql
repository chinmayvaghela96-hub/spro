CREATE TABLE IF NOT EXISTS `pages` (
  `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
  `slug` text NOT NULL,
  `title` text NOT NULL,
  `subtitle` text DEFAULT '' NOT NULL,
  `description` text DEFAULT '' NOT NULL,
  `hero_image` text,
  `is_active` integer DEFAULT true NOT NULL,
  `show_in_menu` integer DEFAULT true NOT NULL,
  `order` integer DEFAULT 0 NOT NULL,
  `seo_title` text DEFAULT '' NOT NULL,
  `seo_description` text DEFAULT '' NOT NULL,
  `seo_keywords` text DEFAULT '' NOT NULL,
  `sections` text DEFAULT '[]' NOT NULL,
  `gallery` text DEFAULT '[]' NOT NULL,
  `created_at` text DEFAULT (datetime('now')) NOT NULL,
  `updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `pages_slug_unique` ON `pages` (`slug`);
