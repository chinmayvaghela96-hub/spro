CREATE TABLE `hero_slides` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`image_url` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`subtitle` text DEFAULT '' NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`button_text` text DEFAULT '' NOT NULL,
	`button_link` text DEFAULT '' NOT NULL,
	`open_in_new_tab` integer DEFAULT false NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `nav_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`label` text NOT NULL,
	`href` text NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `page_banners` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`page_slug` text NOT NULL,
	`title` text DEFAULT '' NOT NULL,
	`subtitle` text DEFAULT '' NOT NULL,
	`image_url` text,
	`is_active` integer DEFAULT true NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `page_banners_page_slug_unique` ON `page_banners` (`page_slug`);--> statement-breakpoint
CREATE TABLE `pages` (
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
CREATE UNIQUE INDEX `pages_slug_unique` ON `pages` (`slug`);--> statement-breakpoint
ALTER TABLE `publications` ADD `link` text;--> statement-breakpoint
ALTER TABLE `publications` ADD `open_in_new_tab` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `research_areas` ADD `description` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `research_areas` ADD `image_url` text;--> statement-breakpoint
ALTER TABLE `research_areas` ADD `link` text;--> statement-breakpoint
ALTER TABLE `research_areas` ADD `open_in_new_tab` integer DEFAULT false NOT NULL;