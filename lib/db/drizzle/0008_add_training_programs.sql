CREATE TABLE `training_programs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`duration` text DEFAULT '' NOT NULL,
	`eligibility` text DEFAULT '' NOT NULL,
	`mode` text DEFAULT 'Online' NOT NULL,
	`start_date` text DEFAULT '' NOT NULL,
	`registration_url` text DEFAULT '' NOT NULL,
	`cover_image` text DEFAULT '' NOT NULL,
	`order` integer DEFAULT 0 NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`created_at` text DEFAULT (datetime('now')) NOT NULL,
	`updated_at` text DEFAULT (datetime('now')) NOT NULL
);
