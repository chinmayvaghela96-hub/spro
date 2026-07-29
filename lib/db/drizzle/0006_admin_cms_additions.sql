CREATE TABLE `sir_profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`full_name` text DEFAULT 'Sir' NOT NULL,
	`designation` text DEFAULT 'Founder & Director' NOT NULL,
	`email` text DEFAULT 'sustain.process@gmail.com' NOT NULL,
	`phone` text DEFAULT '8735045762' NOT NULL,
	`city` text DEFAULT '' NOT NULL,
	`full_address` text DEFAULT '' NOT NULL,
	`photo_url` text,
	`bio` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `job_positions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`is_open` integer DEFAULT false NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `job_positions_title_unique` ON `job_positions` (`title`);
