ALTER TABLE `hero_slides` ADD COLUMN `description` text DEFAULT '' NOT NULL;
--> statement-breakpoint
ALTER TABLE `hero_slides` ADD COLUMN `is_active` integer DEFAULT 1 NOT NULL;
--> statement-breakpoint
ALTER TABLE `page_banners` ADD COLUMN `is_active` integer DEFAULT 1 NOT NULL;
